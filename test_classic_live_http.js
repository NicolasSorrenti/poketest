'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const req=async(path,{method='GET',token,body,origin}={})=>{
  const r=await fetch(base+path,{method,headers:{...(token?{'X-Duel-Token':token}:{}),...(body?{'Content-Type':'application/json'}:{}),...(origin?{'Origin':origin}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,body:r.headers.get('content-type')?.includes('application/json')?await r.json():await r.text()};
 };
 try{
  for(const path of ['/','/classic_live.html','/classic_live.js','/classic_live.css']){
   const r=await req(path);assert.equal(r.status,200,path);assert.ok(r.body.length>300,path);
  }
  let r=await req('/api/classic/decks');assert.equal(r.status,200);assert.equal(r.body.decks.length,require('./classic_local_service').deckOptions().length);
  r=await req('/api/classic/create',{method:'POST',body:{deck:'blackout',opponent:'brushfire',seed:1}});
  assert.equal(r.status,200,JSON.stringify(r.body));const token=r.body.token;
  assert.equal(r.body.view.players[1].hand,undefined);
  assert.equal(r.body.view.players[1].prizes,undefined);
  const basic=r.body.view.players[0].hand.findIndex(id=>require('./core_rules').isBasicPokemon(require('./headless_duel').CATALOG.get(id)));
  assert.ok(basic>=0);
  let denial=await req('/api/classic/state');assert.equal(denial.status,401);
  denial=await req('/api/classic/state',{token:'bad-token'});assert.equal(denial.status,401);
  denial=await req('/api/classic/create',{method:'POST',origin:'https://other.example',body:{}});assert.equal(denial.status,403);
  denial=await req('/api/classic/action',{method:'POST',token,body:{revision:0,command:{type:'setup_select',payload:{handIndex:9999}}}});
  assert.equal(denial.status,400);
  r=await req('/api/classic/action',{method:'POST',token,body:{revision:0,command:{type:'setup_select',payload:{handIndex:basic}}}});
  assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.revision,1);
  denial=await req('/api/classic/action',{method:'POST',token,body:{revision:0,command:{type:'setup_confirm'}}});assert.equal(denial.status,409);
  r=await req('/api/classic/action',{method:'POST',token,body:{revision:1,command:{type:'setup_confirm'}}});
  assert.equal(r.status,200,JSON.stringify(r.body));
  if(r.body.view.mulliganBonus){
   assert.equal(r.body.view.mulliganBonus.side,0);
   r=await req('/api/classic/action',{method:'POST',token,body:{revision:r.body.revision,command:{type:'setup_bonus_draw',payload:{count:0}}}});
   assert.equal(r.status,200,JSON.stringify(r.body));
  }
  assert.equal(r.body.view.phase,'game');
  r=await req('/api/classic/state',{token});assert.equal(r.status,200);assert.equal(r.body.view.players[1].hand,undefined);
  let before=r.body.revision;
  r=await req('/api/classic/action',{method:'POST',token,body:{revision:before,command:{type:'end_turn'}}});
  assert.equal(r.status,200,JSON.stringify(r.body));assert.ok(r.body.revision>before);assert.equal(r.body.view.turn,0,'CPU turn resolved automatically');
  assert.deepEqual(r.body.counts,[60,60]);
  console.log(`PASS HTTP authoritative Classic: real page, ${require('./classic_local_service').deckOptions().length} deck presets, secret token, setup, CPU turn, stale and invalid command rejection, origin protection, card conservation`);
 }finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
