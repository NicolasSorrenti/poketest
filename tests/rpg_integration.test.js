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
 assert.match(read('rpg.html'),/src="\/rpg_duel_bridge\.js"/);
 assert.match(read('classic_live.html'),/src="rpg_duel_bridge\.js"/);
 assert.match(read('rpg.js'),/BRIDGE\.accepts/);
 assert.match(read('rpg.js'),/duelId='\+encodeURIComponent\(duel\.id\)/);
 assert.match(read('classic_live.js'),/sessionStorage\.getItem\(rpgKey\)/);
 assert.match(read('classic_live.js'),/sessionStorage\.removeItem\(rpgKey\)/);
 assert.match(read('classic_live.js'),/notifyRpg\(\)/);
});
