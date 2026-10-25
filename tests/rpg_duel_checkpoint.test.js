'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {server,classic,rpgDuels}=require('../server');
const {isBasicPokemon}=require('../core_rules');
const {CATALOG}=require('../headless_duel');

const player='10000000-0000-4000-8000-000000000001';
const other='20000000-0000-4000-8000-000000000002';
const base=()=> 'http://127.0.0.1:'+server.address().port;
const deep=x=>JSON.parse(JSON.stringify(x));

function fakeSupabase(){
 const rows=new Map();
 const owner=token=>token==='test-owner-access'?player:token==='test-other-access'?other:null;
 const fake=async (url,init={})=>{
  const auth=String(init.headers?.Authorization||'').replace(/^Bearer /,'');
  const user=owner(auth);if(!user)return {ok:false,status:401,json:async()=>({message:'Unauthenticated'})};
  const route=url.slice(url.indexOf('.supabase.co')+12);
  let status=200,data;
  if(route==='/auth/v1/user')data={id:user,email:'test@local.invalid'};
  else if(route.startsWith('/rest/v1/rpg_duel_checkpoints?')){
   const duelId=decodeURIComponent(route.split('duel_id=eq.')[1]?.split('&')[0]||'');
   const row=rows.get(user+':'+duelId);
   data=row?[{duel_id:duelId,revision:row.revision,snapshot:deep(row.snapshot)}]:[];
  }else if(route==='/rest/v1/rpc/rpg_duel_checkpoint_cas'){
   const body=JSON.parse(init.body),key=user+':'+body.p_duel_id,old=rows.get(key);
   if((!old&&body.p_expected_revision===-1)||old?.revision===body.p_expected_revision){
    rows.set(key,{revision:body.p_revision,snapshot:deep(body.p_snapshot)});
    data=[{saved_revision:body.p_revision}];
   }else{status=409;data={code:'40001',message:'RPG_DUEL_CHECKPOINT_CONFLICT'};}
  }else throw Error('Unexpected fake Supabase path '+route);
  return {ok:status===200,status,json:async()=>data};
 };
 return {fake,rows};
}
async function api(path,{auth='test-owner-access',duelToken,body,method='POST'}={}){
 const response=await fetch(base()+'/api/classic/'+path,{
  method,
  headers:{...(auth?{Authorization:'Bearer '+auth}:{}),
   ...(duelToken?{'X-Duel-Token':duelToken}:{}),
   ...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 return {status:response.status,body:await response.json()};
}
test('RPG checkpoint stores every accepted move, restores after server restart and isolates accounts',async()=>{
 const fake=fakeSupabase(),priorFetch=rpgDuels.fetch,priorSettings=rpgDuels.settings;
 rpgDuels.fetch=fake.fake;
 rpgDuels.settings=()=>({SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'});
 const id='npc-rina-1-0-0-testing',prefix=player+':'+id;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const created=await api('create',{body:{rpgDuelId:id,deck:'blackout',opponent:'brushfire'}});
  assert.equal(created.status,200,JSON.stringify(created.body).slice(0,400));
  assert.equal(created.body.cloudSaved,true);
  const token=created.body.token;
  assert.equal(fake.rows.get(prefix).revision,0,'first checkpoint before the player can act');
  const state=classic.session(token);
  const basicIndex=state.game.players[0].hand.findIndex(cardId=>isBasicPokemon(CATALOG.get(cardId)));
  assert.ok(basicIndex>=0,'starting hand has Basic Pokémon');
  const move=await api('action',{duelToken:token,body:{
   revision:0,command:{type:'setup_select',payload:{handIndex:basicIndex}}
  }});
  assert.equal(move.status,200,JSON.stringify(move.body).slice(0,400));
  assert.equal(move.body.revision,1);
  assert.equal(move.body.cloudSaved,false,'moves return immediately; cloud checkpoint is asynchronous');
  // A later acknowledgement guarantees that the newest revision is actually
  // durable before we simulate a server restart.
  for(let i=0;i<100&&fake.rows.get(prefix)?.revision!==1;i++)
   await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal(fake.rows.get(prefix).revision,1);
  assert.ok(fake.rows.get(prefix).snapshot.game.players[0].active);
  // Simulate a Render restart: RAM is gone, database still has the whole match.
  classic.sessions.clear();
  const restored=await api('rpg/resume',{body:{duelId:id}});
  assert.equal(restored.status,200,JSON.stringify(restored.body).slice(0,400));
  assert.equal(restored.body.resumed,true);
  assert.equal(restored.body.token,token);
  assert.equal(restored.body.revision,1);
  assert.equal(classic.session(token).game.players[0].active.id,state.game.players[0].active.id);
  // A different account cannot retrieve or overwrite another player's match.
  classic.sessions.clear();
  const stranger=await api('rpg/resume',{auth:'test-other-access',body:{duelId:id}});
  assert.equal(stranger.status,404);
  assert.equal(fake.rows.get(prefix).revision,1);
  // Stale/unrecognized duel tokens must not bypass the account check.
  const forged=await api('action',{auth:'test-other-access',duelToken:token,body:{
   revision:1,command:{type:'concede',payload:{}}
  }});
  assert.notEqual(forged.status,200);
 }finally{
  classic.sessions.clear();
  await new Promise(resolve=>server.close(resolve));
  rpgDuels.fetch=priorFetch;rpgDuels.settings=priorSettings;
 }
});
