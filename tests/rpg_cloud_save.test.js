'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'..','rpg_cloud_save.js'),'utf8');
const clone=x=>JSON.parse(JSON.stringify(x));
const save=day=>({day,results:[],deckJourney:{starter:'water'},bonds:{},credits:42,pendingDuel:null});

function setup({localSave=save(1),cloudRow=null,hadLocal=true,enabled=true,connected=true,authFragment='',existingSession=true,ownerId=null,ownCache=null}={}){
 let current=clone(localSave),remote=cloudRow?clone(cloudRow):null,network=connected;
 const uploads=[],restores=[],sessions=[],timers=new Map(),cache=new Map(),historyReplacements=[];
 let resets=0;
 if(ownerId)cache.set('neoRpgLocalOwnerV1',ownerId);
 if(ownCache)cache.set('neoRpgAccountCacheV1:player-one',JSON.stringify(ownCache));
 let timerId=0;
 if(existingSession)cache.set('neoRpgCloudSessionV1',JSON.stringify({
  user:{id:'player-one',email:'one@example.com'},
  access_token:'jwt-test',refresh_token:'test-refresh',expires_at:Date.now()+3600*1000
 }));
 const storage={
  getItem:key=>cache.get(key)??null,
  setItem:(key,val)=>cache.set(key,String(val)),
  removeItem:key=>cache.delete(key)
 };
 async function fetch(url,options={}){
  if(!network)throw Error('Network offline');
  let data,status=200;
  if(url==='/api/rpg-cloud/config'){
   data={enabled,url:'https://test.supabase.co',key:'sb_publishable_test'};
  }else if(url.includes('/auth/v1/user')){
   assert.equal(options.headers.Authorization,'Bearer confirmation-access-token');
   data={id:'player-one',email:'one@example.com'};
  }else if(url.includes('/rest/v1/rpg_saves?')){
   data=remote?[clone(remote)]:[];
  }else if(url.includes('/rest/v1/rpc/rpg_save_cas')){
   const body=JSON.parse(options.body);
   uploads.push(body);
   if((remote===null&&body.expected_revision===0)||remote?.revision===body.expected_revision){
    remote={save_data:clone(body.new_save),revision:(remote?.revision||0)+1};
    data=[{new_revision:remote.revision}];
   }else{
    data={code:'40001',message:'CLOUD_SAVE_CONFLICT'};status=409;
   }
  }else throw Error('Unexpected API request: '+url);
  return {ok:status===200,status,json:async()=>data};
 }
 const window={addEventListener:(name,fn)=>sessions.push({name,fn}),
  location:{origin:'https://poketest-4y5u.onrender.com',pathname:'/rpg.html',search:'',hash:authFragment},
  history:{state:null,replaceState:(state,title,url)=>{historyReplacements.push(url);window.location.hash='';}}
 };
 const document={addEventListener:(name,fn)=>sessions.push({name,fn}),hidden:false};
 vm.runInNewContext(script,{
  window,document,fetch,localStorage:storage,structuredClone:clone,URLSearchParams,
  setTimeout:(callback)=>{const id=++timerId;timers.set(id,callback);return id;},
  clearTimeout:id=>timers.delete(id),console
 },{filename:'rpg_cloud_save.js'});
 const adapter={
  getSave:()=>current,
  restoreSave:download=>{restores.push(clone(download));current=clone(download);},
  resetSave:()=>{resets++;current=save(1);},
  canSwitch:()=>!current.pendingDuel,
  hadLocalSave:hadLocal,
  showButton:false
 };
 return {
  client:window.NeoRpgCloudSave,adapter,uploads,restores,cache,historyReplacements,location:window.location,
  getResets:()=>resets,
  getLocal:()=>clone(current),getCloud:()=>clone(remote),
  setLocal:val=>{current=clone(val)},setCloud:val=>{remote=clone(val)},
  setConnected:value=>{network=value},
  online:async()=>{const handler=sessions.find(x=>x.name==='online');assert.ok(handler);await handler.fn();}
 };
}

test('uploads the existing browser save to a new account using revision zero',async()=>{
 const app=setup({localSave:save(12)});
 await app.client.mount(app.adapter);
 assert.equal(app.uploads.length,1);
 assert.equal(app.uploads[0].expected_revision,0);
 assert.equal(app.getCloud().revision,1);
 assert.equal(app.getCloud().save_data.day,12);
 assert.equal(app.getLocal().day,12);
});

test('subsequent saves increment the revision without losing local progress',async()=>{
 const app=setup({localSave:save(7)});
 await app.client.mount(app.adapter);
 app.setLocal(save(8));
 const synced=await app.client.syncNow();
 assert.equal(synced,true);
 assert.deepEqual(app.uploads.map(x=>x.expected_revision),[0,1]);
 assert.equal(app.getCloud().revision,2);
 assert.equal(app.getCloud().save_data.day,8);
});

test('first use on a new device imports the cloud state and does not upload defaults',async()=>{
 const app=setup({localSave:save(1),cloudRow:{revision:6,save_data:save(19)},hadLocal:false});
 await app.client.mount(app.adapter);
 assert.equal(app.restores.length,1);
 assert.equal(app.getLocal().day,19);
 assert.equal(app.uploads.length,0);
});

test('a first login automatically loads existing cloud progress',async()=>{
 const app=setup({localSave:save(9),cloudRow:{revision:2,save_data:save(14)}});
 await app.client.mount(app.adapter);
 assert.equal(app.getLocal().day,14);
 assert.equal(app.getCloud().save_data.day,14);
 assert.equal(app.restores.length,1);
 assert.equal(app.uploads.length,0);
});

test('an unchanged device automatically loads the newer cloud save on startup',async()=>{
 const app=setup({localSave:save(4),cloudRow:{revision:3,save_data:save(14)}});
 app.cache.set('neoRpgCloudSyncedV1:player-one',JSON.stringify({
  revision:2,hash:app.client.hash(save(4))
 }));
 await app.client.mount(app.adapter);
 assert.equal(app.restores.length,1);
 assert.equal(app.getLocal().day,14);
 assert.equal(app.uploads.length,0);
});

test('cloud wins automatically when another device advanced the revision',async()=>{
 const app=setup({localSave:save(4)});
 await app.client.mount(app.adapter);
 app.setCloud({revision:2,save_data:save(17)});
 app.setLocal(save(5));
 const synced=await app.client.syncNow();
 assert.equal(synced,false);
 assert.equal(app.getCloud().save_data.day,17);
 assert.equal(app.getLocal().day,17);
 assert.equal(app.restores.length,1);
 assert.equal(app.uploads.at(-1).expected_revision,1);
});

test('autosaves campaign state even while a duel is pending',async()=>{
 const active=save(10);active.pendingDuel={id:'npc-test-10'};
 const app=setup({localSave:active});
 await app.client.mount(app.adapter);
 assert.equal(app.uploads.length,1);
 assert.equal(app.getCloud().save_data.pendingDuel.id,'npc-test-10');
 app.setLocal({...active,credits:59});
 await app.client.syncNow();
 assert.equal(app.uploads.length,2);
 assert.equal(app.getCloud().save_data.credits,59);
 assert.equal(app.getCloud().save_data.pendingDuel.id,'npc-test-10');
});

test('another device can import an in-progress duel without losing pending state',async()=>{
 const game=save(15);game.pendingDuel={id:'npc-rena-15-1-0',deckCards:['base1-1']};
 const app=setup({localSave:save(1),cloudRow:{revision:4,save_data:game},hadLocal:false});
 await app.client.mount(app.adapter);
 assert.equal(app.restores.length,1);
 assert.equal(app.getLocal().pendingDuel.id,game.pendingDuel.id);
 assert.equal(app.getLocal().pendingDuel.deckCards[0],'base1-1');
});

test('offline or failed cloud requests never delete the browser save',async()=>{
 const app=setup({localSave:save(20),connected:false});
 await app.client.mount(app.adapter);
 assert.equal(app.getLocal().day,20);
 assert.equal(app.uploads.length,0);
 app.setConnected(true);
 await app.online();
 assert.equal(app.getCloud().save_data.day,20);
});

test('rejects invalid cloud saves and retains the local campaign',async()=>{
 const app=setup({localSave:save(11),cloudRow:{revision:1,save_data:{day:999,results:[]}}});
 await app.client.mount(app.adapter);
 assert.equal(app.restores.length,0);
 assert.equal(app.getLocal().day,11);
});

test('signup points confirmation emails to the actual game, not localhost',()=>{
 const app=setup();
 assert.equal(app.client.signupEndpoint(),
  '/auth/v1/signup?redirect_to='+encodeURIComponent('https://poketest-4y5u.onrender.com/rpg.html'));
});

test('email confirmation consumes the URL fragment, validates the user and signs in',async()=>{
 const fragment='#access_token=confirmation-access-token&refresh_token=confirmation-refresh-token&expires_in=3600&token_type=bearer&type=signup';
 const app=setup({localSave:save(13),existingSession:false,authFragment:fragment});
 await app.client.mount(app.adapter);
 assert.equal(app.location.hash,'');
 assert.deepEqual(app.historyReplacements,['/rpg.html']);
 const session=JSON.parse(app.cache.get('neoRpgCloudSessionV1'));
 assert.equal(session.user.id,'player-one');
 assert.equal(app.getCloud().save_data.day,13);
});

test('an auth error redirect is stripped from the URL without saving credentials',async()=>{
 const app=setup({existingSession:false,authFragment:'#error=access_denied&error_description=Expired'});
 await app.client.mount(app.adapter);
 assert.equal(app.location.hash,'');
 assert.deepEqual(app.historyReplacements,['/rpg.html']);
 assert.equal(app.cache.has('neoRpgCloudSessionV1'),false);
});

test('unsynced local actions upload when cloud revision is unchanged',async()=>{
 const app=setup({localSave:save(3),cloudRow:{revision:4,save_data:save(3)}});
 app.cache.set('neoRpgCloudSyncedV1:player-one',JSON.stringify({revision:4,hash:app.client.hash(save(3))}));
 app.setLocal(save(5));
 await app.client.mount(app.adapter);
 assert.equal(app.getCloud().save_data.day,5);
 assert.equal(app.restores.length,0);
 assert.equal(app.uploads[0].expected_revision,4);
});

test('cloud progress replaces an in-progress local duel',async()=>{
 const local=save(8);local.pendingDuel={id:'local-battle'};
 const cloud=save(12);cloud.pendingDuel={id:'cloud-battle'};
 const app=setup({localSave:local,cloudRow:{revision:3,save_data:cloud}});
 await app.client.mount(app.adapter);
 assert.equal(app.getLocal().pendingDuel.id,'cloud-battle');
 assert.equal(app.uploads.length,0);
});


test('switching to a different cloud account never uploads the previous account campaign',async()=>{
 const app=setup({localSave:save(25),ownerId:'previous-account'});
 await app.client.mount(app.adapter);
 assert.equal(app.uploads.length,0,'do not leak previous-account progress to a new cloud account');
 assert.equal(app.getResets(),1,'new account gets an independent fresh campaign');
 assert.equal(app.getLocal().day,1);
 assert.equal(app.cache.get('neoRpgLocalOwnerV1'),'player-one');
 assert.equal(JSON.parse(app.cache.get('neoRpgAccountCacheV1:previous-account')).day,25);
});

test('switching back restores only the account-owned local cache',async()=>{
 const app=setup({localSave:save(30),ownerId:'other-account',ownCache:save(8)});
 await app.client.mount(app.adapter);
 assert.equal(app.getResets(),0);
 assert.equal(app.restores.length,1);
 assert.equal(app.getLocal().day,8);
 assert.equal(app.uploads.length,0,'reconciliation continues after reload, not with a foreign campaign');
 assert.equal(app.cache.get('neoRpgLocalOwnerV1'),'player-one');
 assert.equal(JSON.parse(app.cache.get('neoRpgAccountCacheV1:other-account')).day,30);
});
