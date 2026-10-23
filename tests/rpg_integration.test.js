'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const bridge=require('../rpg_duel_bridge');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
function game(){return {pendingDuel:{id:'npc-reina-7-1-0',npc:'reina',day:7,slot:1,eventKey:'7:Cup',eventReward:7,eventTitle:'Cup'},results:[],points:0,credits:80,eventsDone:{},bonds:{reina:{trust:0,duels:0}},relationships:{reina:{trust:0,duels:0,respect:0}},reinaDuels:0,reinaTrust:0};}
test('isolated game identities reject stale, foreign or invalid iframe results',()=>{
 assert.notEqual(bridge.sessionKey('first'),bridge.sessionKey('second'));
 assert.throws(()=>bridge.sessionKey(''));
 const frame={},pending=game().pendingDuel;
 const event={origin:'http://localhost:8000',source:frame,data:bridge.message(pending.id,0)};
 assert.ok(bridge.accepts(event,'http://localhost:8000',frame,pending));
 for(const invalid of [{...event,origin:'http://evil'},{...event,source:{}},{...event,data:{...event.data,duelId:'previous'}},{...event,data:{...event.data,winner:999}}]){
  assert.equal(bridge.accepts(invalid,'http://localhost:8000',frame,pending),false);
 }
 assert.equal(bridge.accepts(event,'http://localhost:8000',frame,null),false);
 assert.equal(bridge.message(pending.id,null).winner,null);
 assert.throws(()=>bridge.message(pending.id,-1));
});
test('exhibition results award correct points, credits and bonds exactly once',()=>{
 for(const winner of [0,1,null]){
  const state=game(),duel=state.pendingDuel;
  assert.equal(bridge.settle(state,{...duel,id:'old'},0,'Reina'),null);
  const receipt=bridge.settle(state,duel,winner,'Reina');
  assert.equal(receipt.outcome,winner===0?'Victory':winner===1?'Defeat':'Draw');
  assert.equal(state.points,winner===0?10:1);
  assert.equal(state.credits,winner===0?95:85);
  assert.equal(state.bonds.reina.duels,1);
  assert.equal(state.bonds.reina.trust,winner===0?2:1);
  assert.equal(state.relationships.reina.duels,1);
  assert.equal(state.reinaDuels,1);
  assert.equal(state.eventsDone['7:Cup'].won,winner===0);
  assert.equal(bridge.settle(state,duel,winner,'Reina'),null);
  assert.equal(state.results.length,1);
 }
});
test('RPG and Classic clients use the adapter and parse without syntax errors',()=>{
 for(const file of ['rpg.js','classic_live.js','rpg_duel_bridge.js'])new vm.Script(read(file),{filename:file});
 assert.match(read('rpg.html'),/src="\/rpg_character_bootstrap\.js"/);
 assert.match(read('rpg_character_bootstrap.js'),/\/rpg_duel_bridge\.js/);
 assert.match(read('classic_live.html'),/src="rpg_duel_bridge\.js"/);
 assert.match(read('rpg.js'),/BRIDGE\.accepts/);
 assert.match(read('rpg.js'),/duelId='\+encodeURIComponent\(duel\.id\)/);
 assert.match(read('classic_live.js'),/sessionStorage\.getItem\(rpgKey\)/);
 assert.match(read('classic_live.js'),/sessionStorage\.removeItem\(rpgKey\)/);
 assert.match(read('classic_live.js'),/notifyRpg\(\)/);
});

// Load the actual HTTP host: a script may exist on disk yet be denied by the public allowlist.
test('host serves RPG and Classic integration assets with correct media types', async()=>{
 const {server}=require('../server');
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',error=>error?reject(error):resolve()));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  for(const [url,type] of [
   ['/rpg.html','text/html'],['/rpg.js','text/javascript'],['/rpg_story.js','text/javascript'],
   ['/rpg_appointments.js','text/javascript'],['/rpg_intentions.js','text/javascript'],['/rpg_cg_gallery.js','text/javascript'],['/rpg_daily_planner.js','text/javascript'],['/rpg_social_activities.js','text/javascript'],['/rpg_planned_dates.js','text/javascript'],['/rpg_preduel.js','text/javascript'],['/rpg_situations.js','text/javascript'],['/rpg_season_journey.js','text/javascript'],['/rpg_collection.js','text/javascript'],
   ['/rpg_duel_bridge.js','text/javascript'],['/classic_live.html','text/html'],
   ['/classic_live.js','text/javascript'],['/rpg.css','text/css'],['/rpg_duel.css','text/css']]){
    const response=await fetch(base+url);
    assert.equal(response.status,200,'Hosted game must serve '+url);
    assert.match(response.headers.get('content-type')||'',new RegExp(type));
    const body=await response.text();assert.ok(body.length>30,'Empty hosted asset '+url);
   }
  for(const asset of ['hana.png','reina.png','shiori.png','yuna.png','akari.png','camila.png','marina.png','kaede.png',
   'home.jpg','arcade.jpg','park.jpg','cafe.jpg','center.jpg','library.jpg','card-shop-day.png','card-shop-evening.png']){
   const response=await fetch(base+'/rpg-assets/'+asset);
   assert.equal(response.status,200,'Missing campaign portrait or background: '+asset);
   assert.match(response.headers.get('content-type')||'',/^image\//);
  }
  // Exercise the actual API, not a fabricated duel callback: create, finish, and settle.
  const createdResponse=await fetch(base+'/api/classic/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deck:'blackout',opponent:'zap',seed:7})});
  assert.equal(createdResponse.status,200);
  const created=await createdResponse.json();
  assert.equal(created.view.phase,'setup');
  const concededResponse=await fetch(base+'/api/classic/action',{method:'POST',headers:{'Content-Type':'application/json','X-Duel-Token':created.token},body:JSON.stringify({revision:created.revision,command:{type:'concede',payload:{}}})});
  assert.equal(concededResponse.status,200,'Conceding a playable CPU match must use the actual rules service');
  const finished=await concededResponse.json();
  assert.equal(finished.view.over,true);
  assert.equal(finished.winner,1);
  const campaign=game();
  const settle=bridge.settle(campaign,campaign.pendingDuel,finished.winner,'Reina');
  assert.equal(settle.outcome,'Defeat');
  assert.equal(campaign.results.length,1);
  assert.equal(campaign.credits,85);
  const forbidden=await fetch(base+'/headless_duel.js');
  assert.equal(forbidden.status,404,'Server-owned game engine is not publicly exposed');
 }finally{
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
 }
});
