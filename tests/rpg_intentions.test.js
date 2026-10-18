'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Intentions=require('../rpg_intentions');
const fresh=(overrides={})=>({day:4,slot:0,focus:70,credits:80,insight:2,reputation:0,preparation:0,...overrides});

test('three clear alternative goals never require a scripted character or duel result',()=>{
 assert.deepEqual(Intentions.goals.map(x=>x.id),['social','duel','town']);
 const s=fresh();
 assert.equal(Intentions.status(s).chosen,false);
 const g=Intentions.choose(s,'social');
 assert.match(g.detail,/meet-up/);
 assert.equal(s.dailyIntention.day,4);
 assert.throws(()=>Intentions.choose(s,'duel'),/already chosen/);
});
test('social activities reward once, with no reward for unrelated actions',()=>{
 const s=fresh();
 Intentions.choose(s,'social');
 assert.equal(Intentions.record(s,'duel'),null);
 assert.equal(Intentions.record(s,'activity'),null);
 assert.equal(s.focus,70);
 assert.equal(Intentions.record(s,'story').id,'social');
 assert.equal(s.focus,75);assert.equal(s.insight,3);assert.equal(s.intentionsCompleted,1);
 assert.equal(Intentions.record(s,'hangout'),null);
 assert.equal(s.intentionsCompleted,1);
});
test('all completed matches count, while duplicate notifications cannot stack rewards',()=>{
 const s=fresh({credits:99,preparation:2});
 Intentions.choose(s,'duel');
 assert.equal(Intentions.record(s,'duel').id,'duel');
 assert.equal(s.credits,109);assert.equal(s.preparation,3);
 assert.equal(Intentions.record(s,'duel'),null);
 assert.equal(s.credits,109);
});
test('town activity or encounter contributes to same goal, and caps hold',()=>{
 const s=fresh({credits:999997,reputation:99});
 Intentions.choose(s,'town');
 Intentions.record(s,'encounter');
 assert.equal(s.credits,999999);assert.equal(s.reputation,100);
 assert.equal(Intentions.record(s,'activity'),null);
});
test('expired priorities reset at midnight without penalizing a missed day',()=>{
 const s=fresh();Intentions.choose(s,'duel');s.day++;
 assert.equal(Intentions.status(s).chosen,false);
 assert.equal(s.intentionsCompleted,0);
 Intentions.choose(s,'social');
 assert.equal(Intentions.record(s,'appointment').id,'social');
 assert.equal(s.intentionsCompleted,1);
 s.day++;
 assert.equal(Intentions.status(s).chosen,false);
});
test('JSON save roundtrip retains a finished priority and season counter',()=>{
 const s=fresh({slot:2});Intentions.choose(s,'social');Intentions.record(s,'sideQuest');
 const restored=JSON.parse(JSON.stringify(s));
 assert.equal(Intentions.status(restored).completed,true);
 assert.equal(Intentions.record(restored,'story'),null);
 assert.equal(restored.intentionsCompleted,1);
});
test('corrupt legacy save fields are repaired, without losing credits or bonds',()=>{
 const s=fresh({dailyIntention:{day:4,id:'hacked',completed:true},intentionsCompleted:-4,bonds:{reina:{trust:5}}});
 Intentions.hydrate(s);
 assert.equal(s.dailyIntention,null);assert.equal(s.intentionsCompleted,0);
 assert.equal(s.credits,80);assert.equal(s.bonds.reina.trust,5);
});
test('daily intentions are optional and unavailable after final day',()=>{
 const s=fresh({day:91});
 assert.throws(()=>Intentions.choose(s,'town'),/season is over/);
 assert.equal(Intentions.record(s,'duel'),null);
 assert.equal(Intentions.status(s).chosen,false);
});
