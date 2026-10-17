'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const W=require('../rpg_world');
const S=require('../rpg_schedules');
const STORY=require('../rpg_story');

function sample(overrides={}){
 const s={day:1,slot:0,location:'home',credits:80,focus:75,preparation:0,insight:0,reputation:0,
  activityDone:{},encountersDone:{},relationships:{},bonds:{},...overrides};
 STORY.normalize(s);W.hydrate(s);return s;
}
function peopleFor(s){return S.peopleAt(s.day,s.slot,s.location,STORY.events);}
test('14 distinct location activities and 16 validated encounters',()=>{
 assert.deepEqual(W.validate(),[]);
 assert.equal(W.activities.length,14);
 assert.equal(W.encounters.length,16);
 assert.equal(new Set(W.activities.map(a=>a.id)).size,14);
 assert.equal(new Set(W.encounters.map(e=>e.id)).size,16);
 assert.deepEqual(new Set(W.activities.map(a=>a.place)),new Set(['home','shop','arcade','park','cafe','center','library']));
});
test('every authored encounter is reachable during its time window with the correct character present',()=>{
 for(const e of W.encounters){
  let found=false;
  for(let day=e.start;day<=e.end;day++)for(const slot of e.slots){
   const s=sample({day,slot,location:e.place});
   if(e.npc)s.relationships[e.npc].affection=99;
   if(W.availableEncounters(s,peopleFor(s)).some(x=>x.id===e.id))found=true;
  }
  assert.ok(found,e.id+' is impossible to reach');
 }
});
test('activity consumes a period-worth reward once per day, and never twice',()=>{
 const s=sample({location:'shop',day:2,slot:0}),start=s.credits;
 const result=W.doActivity(s,'shop_shift',peopleFor(s));
 assert.equal(result.spent,1);
 assert.equal(s.credits,start+18);
 assert.equal(s.focus,63);
 assert.equal(s.reputation,1);
 assert.ok(s.activityDone['2:shop_shift']);
 assert.throws(()=>W.doActivity(s,'shop_shift',peopleFor(s)),/Already completed/);
 s.day=3;W.newDay(s);
 assert.equal(s.focus,85);
 assert.ok(!W.activitiesAt(s).find(x=>x.id==='shop_shift').disabledReason);
});
test('focus and credits block expensive actions without mutating resources or flags',()=>{
 const s=sample({location:'arcade',slot:2,credits:2,focus:30});
 assert.throws(()=>W.doActivity(s,'arcade_combo'),/credits/);
 assert.equal(Object.keys(s.activityDone).length,0);
 assert.equal(s.credits,2);
 s.credits=50;s.focus=1;
 assert.throws(()=>W.doActivity(s,'arcade_combo'),/focus/);
 assert.equal(Object.keys(s.activityDone).length,0);
});
test('activity bond rewards depend on the character actually being present',()=>{
 const alone=sample({location:'shop',day:1,slot:0});
 W.doActivity(alone,'shop_shift',[]);
 assert.equal(alone.relationships.hana.trust,0);
 const social=sample({location:'shop',day:1,slot:0});
 W.doActivity(social,'shop_shift',['hana']);
 assert.equal(social.relationships.hana.trust,1);
 assert.equal(social.bonds.hana.trust,1);
});
test('missable encounter choices modify persistent relationships and cannot replay',()=>{
 const e=W.encounters.find(x=>x.id==='shop_opening');
 const s=sample({day:e.start,slot:0,location:'shop'}),presence=['hana'];
 assert.ok(W.availableEncounters(s,presence).includes(e));
 const outcome=W.completeEncounter(s,e.id,0,presence);
 assert.equal(outcome.person,'hana');
 assert.equal(s.relationships.hana.trust,2);
 assert.equal(s.bonds.hana.affection,1);
 assert.equal(s.reputation,1);
 assert.ok(s.encountersDone[e.id]);
 assert.throws(()=>W.completeEncounter(s,e.id,0,presence),/no longer available/);
});
test('a previously encountered scene stays complete after a JSON save roundtrip',()=>{
 const s=sample({day:20,slot:0,location:'park'});
 const e=W.encounters.find(x=>x.id==='park_communal');
 W.completeEncounter(s,e.id,0,[]);
 const loaded=W.hydrate(JSON.parse(JSON.stringify(s)));
 assert.equal(loaded.encountersDone[e.id].choice,0);
 assert.ok(!W.availableEncounters(loaded,[]).some(x=>x.id===e.id));
});
test('unaffordable encounter choice does not spend money or finish the scene',()=>{
 const s=sample({day:22,slot:1,location:'shop',credits:0});
 s.relationships.camila.affection=5;
 assert.ok(W.availableEncounters(s,['camila']).some(x=>x.id==='shop_trade_night'));
 assert.throws(()=>W.completeEncounter(s,'shop_trade_night',0,['camila']),/Not enough credits/);
 assert.equal(s.credits,0);assert.ok(!s.encountersDone.shop_trade_night);
 const response=W.completeEncounter(s,'shop_trade_night',1,['camila']);
 assert.ok(response.summary);
});
test('missed encounters do not appear after their windows or before arrival',()=>{
 const s=sample({day:1,slot:2,location:'arcade'});
 assert.ok(!W.availableEncounters(s,['kaede']).some(x=>x.id==='arcade_challenge'));
 s.day=70;
 assert.ok(!W.availableEncounters(s,['kaede']).some(x=>x.id==='arcade_challenge'));
});
test('daily recovery is capped, and duel prep is spent only once for a small non-combat bonus',()=>{
 const s=sample({focus:96,preparation:2,credits:80,reputation:99});
 W.newDay(s);assert.equal(s.focus,100);
 const victory={outcome:'Victory',credits:15};
 const note=W.afterDuel(s,victory);
 assert.ok(note);assert.equal(victory.trainingBonus,5);
 assert.equal(victory.credits,20);assert.equal(s.credits,85);
 assert.equal(s.preparation,1);assert.equal(s.reputation,100);
 assert.equal(s.focus,90);
 const loss={outcome:'Defeat',credits:5};
 W.afterDuel(s,loss);assert.equal(s.preparation,0);assert.equal(s.credits,85);
 const draw={outcome:'Draw',credits:5};
 W.afterDuel(s,draw);assert.equal(s.preparation,0);assert.equal(draw.trainingBonus,0);
});
test('hydration repairs old saves and respects stat bounds',()=>{
 const s=W.hydrate({credits:80,focus:999,insight:-5,preparation:20,reputation:0});
 assert.equal(s.focus,100);assert.equal(s.insight,0);assert.equal(s.preparation,3);
 assert.deepEqual(s.activityDone,{});assert.deepEqual(s.encountersDone,{});
 assert.equal(s.activeEncounter,null);
});
