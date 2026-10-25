'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const SLICE=require('../rpg_slice_of_life'),CG=require('../rpg_cg_gallery'),Schedules=require('../rpg_schedules');
const characters=['hana','reina','shiori','yuna','akari','camila','marina','kaede',
 'elena','jinx','laca','luna','rina','sierra','sol','alma','iris'];
const dayAt=moment=>{
 for(let day=moment.start;day<=moment.end;day++)
  if(Schedules.locationFor(moment.npc,day,moment.slot)===moment.place)return day;
 return null;
};
const save=(moment,day=dayAt(moment))=>({
 day,slot:moment.slot,location:moment.place,focus:75,relationships:{[moment.npc]:{affection:8,trust:5}},
 bonds:{[moment.npc]:{affection:8,trust:5}},sliceOfLifeDone:{},sliceOfLifeLastDay:0,activeSliceOfLife:null,
 ['met_'+moment.npc]:true
});
test('original pairs and eleven optional Barb encounters have no duplicate IDs',()=>{
 assert.deepEqual(SLICE.validate(),[]);
 assert.equal(SLICE.scenes.length,45);
 for(const npc of characters)assert.equal(SLICE.scenes.filter(e=>e.npc===npc).length,2,npc);
 assert.equal(new Set(SLICE.scenes.map(e=>e.id)).size,45);
 assert.deepEqual(CG.validate(),[]);
 for(const e of SLICE.scenes){
  const cg=CG.byId(e.id);assert.ok(cg,'missing CG brief '+e.id);
  assert.equal(cg.trigger,'slice');assert.equal(cg.sliceId,e.id);
  assert.equal(cg.category,'social');
 }
});
test('every moment has a real authorized character-pack or base schedule opportunity',()=>{
 for(const e of SLICE.scenes){
  assert.ok(dayAt(e)!==null,e.id+' is impossible to encounter');
  const s=save(e);
  assert.ok(SLICE.available(s,[e.npc],e.trigger,e.npc).some(x=>x.id===e.id),e.id);
  assert.deepEqual(SLICE.available(s,[],e.trigger,e.npc),[]);
  assert.deepEqual(SLICE.available({...s,slot:(e.slot+1)%3},[e.npc],e.trigger,e.npc),[]);
  assert.deepEqual(SLICE.available({...s,['met_'+e.npc]:false},[e.npc],e.trigger,e.npc),[]);
 }
});
test('a location or conversation scene triggers once, without consuming time or focus',()=>{
 for(const e of SLICE.scenes.filter(e=>!e.choices)){
  const s=save(e),before={day:s.day,slot:s.slot,focus:s.focus};
  const started=SLICE.start(s,[e.npc],e.trigger,e.npc);
  assert.equal(started?.id,e.id);
  assert.deepEqual({day:s.day,slot:s.slot,focus:s.focus},before);
  assert.equal(s.sliceOfLifeDone[e.id].day,s.day);
  const memories=CG.record(s,'slice',e.npc,{eventId:e.id});
  assert.deepEqual(memories.map(x=>x.id),[e.id]);
  assert.deepEqual(CG.record(s,'slice',e.npc,{eventId:e.id}),[]);
  assert.equal(SLICE.next(s).step,1);
  const restored=JSON.parse(JSON.stringify(s));SLICE.hydrate(restored);
  assert.equal(restored.activeSliceOfLife.step,1);
  assert.equal(SLICE.next(restored).step,2);
  assert.equal(SLICE.next(restored).done,true);
  assert.equal(restored.activeSliceOfLife,null);
  assert.equal(SLICE.start(restored,[e.npc],e.trigger,e.npc),null);
 }
});
test('active RPG content, unintroduced NPCs, and same-day repeats block surprises',()=>{
 const e=SLICE.scenes[0],s=save(e);
 assert.equal(SLICE.available({...s,activeStory:{id:'story'}},[e.npc],e.trigger,e.npc).length,0);
 assert.equal(SLICE.available({...s,pendingDuel:{id:'duel'}},[e.npc],e.trigger,e.npc).length,0);
 assert.equal(SLICE.available({...s,mandatoryEventState:{active:{id:'scene'}}},[e.npc],e.trigger,e.npc).length,0);
 assert.equal(SLICE.available({...s,sliceOfLifeLastDay:s.day},[e.npc],e.trigger,e.npc).length,0);
 assert.equal(CG.record(s,'slice',e.npc,{eventId:e.id}).length,0,'no CG before a scene begins');
});
