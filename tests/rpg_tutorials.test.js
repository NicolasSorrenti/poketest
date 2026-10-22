'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const T=require('../rpg_tutorials');
const fresh=()=>({day:1,ngPlus:0});
test('all supported gameplay systems have exactly two meaningful and non-spoiler lessons',()=>{
 for(const [topic,tips] of Object.entries(T.lessons)){
  assert.equal(tips.length,2,topic);
  for(const lesson of tips){assert.ok(lesson.title&&lesson.text.length>65);assert.doesNotMatch(lesson.text,/specific NPC likes|affection \(\d+\)/i);}
 }
});
test('the first two interactions with each system teach a different lesson and stop',()=>{
 const s=fresh(),first=T.record(s,'social'),second=T.record(s,'social');
 assert.equal(first.number,1);assert.equal(second.number,2);
 assert.notEqual(first.text,second.text);
 assert.equal(T.record(s,'social'),null);
 assert.equal(T.record(s,'social'),null);
 assert.equal(T.record(s,'duels').number,1);
 assert.deepEqual(s.gameplayTutorials.seen,{social:2,duels:1});
});
test('the opt-out is run scoped, reversible and retained across save reloads',()=>{
 const s=fresh();
 T.record(s,'travel');T.setDisabled(s,true);
 assert.equal(T.record(s,'travel'),null);
 assert.equal(T.record(s,'appointments'),null);
 const saved=JSON.parse(JSON.stringify(s));
 assert.equal(T.status(saved).disabled,true);
 assert.equal(T.status(saved).seen.travel,1);
 T.setDisabled(saved,false);
 assert.equal(T.record(saved,'travel').number,2);
 assert.equal(T.record(saved,'travel'),null);
 const next={day:1,ngPlus:1};
 assert.equal(T.status(next).disabled,false);
 assert.equal(T.record(next,'travel').number,1);
});
test('hydrate repairs corrupt tutorial metadata and never invents progress',()=>{
 const s={gameplayTutorials:{disabled:'yes',seen:{travel:99,duels:-4,unknown:8,boosters:'broken'}}};
 T.hydrate(s);
 assert.deepEqual(T.status(s),{disabled:false,seen:{travel:2,duels:0,boosters:0}});
 assert.equal(T.record(s,'travel'),null);
 assert.equal(T.record(s,'boosters').number,1);
 assert.equal(T.record(s,'nonexistent'),null);
});
