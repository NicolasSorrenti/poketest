'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let token=null;
 async function api(path,method='GET',payload,headerToken=token,prefix='cube'){
  const res=await fetch(base+'/api/'+prefix+'/'+path,{method,headers:{
   'Content-Type':'application/json',...(headerToken?{[prefix==='cube'?'X-Cube-Token':'X-Duel-Token']:headerToken}:{})
  },...(payload===undefined?{}:{body:JSON.stringify(payload)})});
  return {status:res.status,body:await res.json()};
 }
 try{
  let res=await fetch(base+'/cube.html');
  assert.equal(res.status,200);
  const cubeHtml=await res.text();
  for(const id of ['deckStatus','tournament','roundList','standings','nextMatch','resumeMatch'])
   assert(cubeHtml.includes('id="'+id+'"'),'Cube bracket markup missing '+id);
  res=await fetch(base+'/cube_client.js');
  assert.equal(res.status,200);
  assert((await res.text()).includes('/classic_live.html'),'Cube client duel navigation missing');
  for(const asset of ['/cube_builder_ui.js','/cube_builder.css']){
   const resource=await fetch(base+asset);
   assert.equal(resource.status,200,'Visual builder asset missing: '+asset);
  }
  for(const id of ['soloDeckBuilder','soloBuilderAction'])assert(cubeHtml.includes('id="'+id+'"'));
  const formats=await api('presets');
  assert.equal(formats.status,200);
  assert.deepEqual(formats.body.presets.map(p=>p.id),['balanced','foundations','elemental','neo','rocket','mayhem']);
  assert.equal((await api('state')).status,401);
  const created=await api('create','POST',{seed:475});
  assert.equal(created.status,200);
  token=created.body.token;
  assert.equal(created.body.pack.length,15);
  let state=created.body;
  for(let i=0;i<60;i++){
   const pick=await api('pick','POST',{id:state.pack[0].id,revision:state.revision});
   assert.equal(pick.status,200,'Cube failed pick '+i+': '+pick.body.error);
   state=pick.body;
  }
  assert.equal(state.done,true);
  assert.equal(state.suggestedDeck.length,40);
  assert.equal((await api('start','POST',{revision:state.revision,deck:['bad']})).status,400);
  const started=await api('start','POST',{revision:state.revision,deck:state.suggestedDeck});
  assert.equal(started.status,200,'Could not launch Cube: '+started.body.error);
  const duel=await api('state','GET',undefined,started.body.duelToken,'classic');
  assert.equal(duel.status,200);
  assert.deepEqual(duel.body.counts,[40,40]);
  assert.equal((await api('start','POST',{revision:state.revision,deck:state.suggestedDeck})).status,409);
  // Exercise the real HTTP bracket with a deterministic CPU fixture stub.
  // The actual CPU-vs-CPU engine is covered by test_cube_simulation.js.
  const {classic,cube}=require('./server');
  cube.simulateCpu=()=>({winner:1,method:'played',actions:10});
  let progress=await api('state');
  assert.equal(progress.body.tournament.bracket.length,4);
  assert.equal((await api('next','POST',{revision:progress.body.revision})).status,400);
  let active=started.body.duelToken;
  const semi=classic.session(active).game;
  semi.over=true;semi.winner=0;
  progress=await api('state');
  assert.equal(progress.body.tournament.bracket[0].status,'complete');
  assert.equal(progress.body.tournament.bracket[1].status,'complete');
  assert.equal(progress.body.tournament.activeMatchId,'final');
  assert.equal((await api('state')).body.revision,progress.body.revision);
  assert.equal((await api('next','POST',{revision:progress.body.revision-1})).status,409);
  const next=await api('next','POST',{revision:progress.body.revision});
  assert.equal(next.status,200,'Next match should start: '+next.body.error);
  assert.notEqual(next.body.duelToken,active);
  active=next.body.duelToken;
  const final=classic.session(active).game;
  final.over=true;final.winner=0;
  progress=await api('state');
  assert.equal(progress.body.tournament.finished,true);
  assert.equal(progress.body.tournament.standings.length,4);
  assert.equal(progress.body.tournament.standings[0].name,'You');
  assert.equal(progress.body.tournament.bracket.every(m=>m.status==='complete'),true);
  assert.equal((await api('next','POST',{revision:progress.body.revision})).status,400);
  assert.equal((await fetch(base+'/cube_draft.js')).status,404,'Private cube rules exposed as static JS');
  console.log('PASS Cube HTTP: authenticated 4-player bracket, final standings and protected match transitions');
 }finally{
  await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
