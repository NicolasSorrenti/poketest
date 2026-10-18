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
  assert((await res.text()).includes('deckStatus'),'Cube builder markup unavailable');
  res=await fetch(base+'/cube_client.js');
  assert.equal(res.status,200);
  assert((await res.text()).includes('/classic_live.html'),'Cube client duel navigation missing');
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
  assert.equal((await fetch(base+'/cube_draft.js')).status,404,'Private cube rules exposed as static JS');
  console.log('PASS Cube HTTP: page, client, draft, 40-card match, tokens and private scripts');
 }finally{
  await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
