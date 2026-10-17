'use strict';
const assert=require('node:assert/strict');
const {server,online}=require('./server');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon}=require('./core_rules');
const apiBase=async(base,path,{method='GET',token,body,origin}={})=>{
 const res=await fetch(base+'/api/online/'+path,{method,headers:{...(token?{'X-Duel-Token':token}:{}),...(body?{'Content-Type':'application/json'}:{}),...(origin?{'Origin':origin}:{})},...(body?{body:JSON.stringify(body)}:{})});
 return {status:res.status,data:await res.json()};
};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const request=(route,opts)=>apiBase(base,route,opts);
 try{
  for(const url of ['/online.html','/online.js','/classic_live.css']){
   const r=await fetch(base+url);assert.equal(r.status,200,`Missing ${url}`);assert.ok((await r.text()).length>1000);
  }
  for(const url of ['/server.js','/classic_online_service.js','/headless_duel.js','/README.md','/package.json','/cards/../server.js']){
   const r=await fetch(base+url);assert.notEqual(r.status,200,`Private server file is public: ${url}`);
  }
  let r=await request('decks');assert.equal(r.status,200);assert.ok(r.data.decks.length>=31);
  const a=await request('create',{method:'POST',body:{deck:'blackout',name:'Alice'}});
  assert.equal(a.status,200,JSON.stringify(a.data));
  const {code}=a.data,hostToken=a.data.token;
  assert.equal(a.data.you,0);assert.match(code,/^[A-HJ-NP-Z2-9]{6}$/);
  r=await request('state?code='+code);assert.equal(r.status,401);
  r=await request('state?code='+code,{token:'fake'});assert.equal(r.status,401);
  r=await request('create',{method:'POST',origin:'https://evil.example',body:{}});assert.equal(r.status,403);
  const wallopId=(await request('decks')).data.decks.find(x=>/Wallop/.test(x.name))?.id;
  assert.ok(wallopId,'Wallop deck missing');
  r=await request('join',{method:'POST',body:{code,deck:wallopId,name:'Bob'}});
  assert.equal(r.status,200,JSON.stringify(r.data));const guestToken=r.data.token;
  assert.equal(r.data.you,1);assert.notEqual(hostToken,guestToken);
  r=await request('join',{method:'POST',body:{code,deck:'brushfire'}});assert.equal(r.status,400);
  r=await request('ready',{method:'POST',token:guestToken,body:{code,ready:true,revision:1}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  let denied=await request('start',{method:'POST',token:guestToken,body:{code,revision:2}});
  assert.equal(denied.status,400,'Only host can start');
  denied=await request('start',{method:'POST',token:hostToken,body:{code,revision:2}});
  assert.equal(denied.status,400,'Host cannot start before ready');
  r=await request('ready',{method:'POST',token:hostToken,body:{code,ready:true,revision:2}});
  assert.equal(r.status,200);
  r=await request('start',{method:'POST',token:hostToken,body:{code,revision:3}});
  assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.started,true);
  assert.equal(r.data.view.players[1].hand,undefined,'Host cannot see the guest hand');
  const peek=await request('state?code='+code,{token:guestToken});
  assert.equal(peek.status,200);assert.equal(peek.data.view.players[0].hand,undefined,'Guest cannot see host hand');
  assert.deepEqual(r.data.counts,[60,60]);
  assert.equal(peek.data.view.players[1].hand.length,7);
  let revision=r.data.revision;
  denied=await request('action',{method:'POST',token:guestToken,body:{code,revision,command:{type:'setup_select',payload:{handIndex:999}}}});
  assert.equal(denied.status,400,'Invalid setup selection must not commit');
  for(const [side,token] of [[0,hostToken],[1,guestToken]]){
   const view=(await request('state?code='+code,{token})).data;
   const basic=view.view.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   assert.ok(basic>=0);
   const play=await request('action',{method:'POST',token,body:{code,revision:view.revision,command:{type:'setup_select',payload:{handIndex:basic}}}});
   assert.equal(play.status,200,JSON.stringify(play.data));
   const confirm=await request('action',{method:'POST',token,body:{code,revision:play.data.revision,command:{type:'setup_confirm'}}});
   assert.equal(confirm.status,200,JSON.stringify(confirm.data));
  }
  let host=(await request('state?code='+code,{token:hostToken})).data;
  let guest=(await request('state?code='+code,{token:guestToken})).data;
  assert.equal(host.view.phase,'game');assert.equal(guest.view.phase,'game');
  assert.ok(host.view.players[1].active&&guest.view.players[0].active,'Both opening Pokémon are visible after setup');
  assert.equal(guest.view.players[0].hand,undefined);
  denied=await request('action',{method:'POST',token:guestToken,body:{code,revision:guest.revision,command:{type:'end_turn'}}});
  assert.equal(denied.status,400,'Non-active player cannot act');
  r=await request('action',{method:'POST',token:hostToken,body:{code,revision:host.revision,command:{type:'end_turn'}}});
  assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.view.turn,1,'No CPU turn taken on behalf of the guest');
  denied=await request('action',{method:'POST',token:hostToken,body:{code,revision:host.revision,command:{type:'end_turn'}}});
  assert.equal(denied.status,409,'Stale revision prevented');
  guest=(await request('state?code='+code,{token:guestToken})).data;
  assert.equal(guest.view.turn,1,'Guest observes host turn change via independent HTTP request');
  assert.deepEqual(guest.counts,[60,60]);
  r=await request('action',{method:'POST',token:guestToken,body:{code,revision:guest.revision,command:{type:'end_turn'}}});
  assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.view.turn,0);
  assert.deepEqual(r.data.counts,[60,60]);
  assert.equal((await request('state?code='+code,{token:hostToken})).data.view.players[1].hand,undefined);
  console.log('PASS Online: hosted pages, invite code, room security, two-human setup, hidden hands, ready/start, stale actions, no CPU, 60-card conservation');
 }finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
