'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const CROSS=require('../rpg_cross_character_events');
const SLICE=require('../rpg_slice_of_life');
const SCHEDULES=require('../rpg_schedules');
const CG=require('../rpg_cg_gallery');
const ids=new Set(CROSS.events.map(e=>e.id));
const naturalDay=e=>{
 for(let day=e.start;day<=e.end;day++)
  if(e.participants.every(id=>SCHEDULES.naturalLocationFor(id,day,e.slot)===e.place))return day;
 return null;
};
const stateFor=e=>{
 const done=Object.fromEntries(SLICE.scenes.filter(x=>x.id!==e.id).map(x=>[x.id,{day:1,slot:0,choice:0}]));
 return {
  day:naturalDay(e),slot:e.slot,location:e.place,focus:75,
  sliceOfLifeLastDay:0,sliceOfLifeDone:done,activeSliceOfLife:null,
  relationships:Object.fromEntries(e.participants.map(id=>[id,{affection:4,trust:4,respect:0}])),
  bonds:Object.fromEntries(e.participants.map(id=>[id,{affection:4,trust:4}])),
  ...Object.fromEntries(e.participants.map(id=>['met_'+id,true]))
 };
};
test('cross-character catalog has original two-person scenes, meaningful choices, and a planned CG path for each',()=>{
 assert.equal(CROSS.events.length,42);
 assert.deepEqual(CROSS.validate(),[]);
 assert.deepEqual(SLICE.validate(),[]);
 assert.deepEqual(CG.validate(),[]);
 assert.equal(CROSS.pendingArt.length,CROSS.events.length);
 assert.equal(new Set(CROSS.pendingArt.map(cg=>cg.path)).size,CROSS.events.length);
 for(const e of CROSS.events){
  assert.equal(e.participants.length,2,e.id);
  assert.equal(e.npc,e.participants[0],e.id);
  assert.ok(e.lines.length>=6,e.id);
  assert.ok(e.lines.some(line=>line.speaker===e.participants[1]),e.id+' needs guest lines');
  assert.ok(e.lines.some(line=>line.speaker==='Protagonist'),e.id+' needs player speech');
  assert.equal(e.choices.length,2,e.id);
  assert.equal(e.artPending,true,e.id);
  assert.equal(SLICE.byId(e.id),e,e.id);
  const cg=CG.byId(e.id);
  assert.ok(cg&&cg.artPending&&cg.sliceId===e.id,e.id);
  assert.equal(cg.path,'/rpg-assets/events/cg/season01/'+e.id+'.webp');
  const candidates=CG.artCandidates(cg,false).filter(c=>c.kind==='event').map(c=>c.path);
  assert.deepEqual(candidates.slice(0,2),[cg.path,'/rpg-assets/events/cg/crossover_pending.svg']);
  if(e.prerequisite)assert.ok(ids.has(e.prerequisite),e.id+' has an invalid callback');
 }
});
test('every new crossover has a plausible meeting during its day window without teleporting characters',()=>{
 for(const e of CROSS.events)assert.ok(naturalDay(e)!==null,e.id+' has no natural meeting');
});
test('crossovers require both introduced participants and a completed prior scene if linked',()=>{
 for(const e of CROSS.events){
  const s=stateFor(e);
  assert.ok(SLICE.available(s,e.participants,e.trigger,e.npc).some(x=>x.id===e.id),e.id);
  assert.ok(!SLICE.available(s,[e.npc],e.trigger,e.npc).some(x=>x.id===e.id),e.id+' ignored absent guest');
  const guest=e.participants[1];
  s['met_'+guest]=false;
  assert.ok(!SLICE.available(s,e.participants,e.trigger,e.npc).some(x=>x.id===e.id),e.id+' ignored first meeting');
  s['met_'+guest]=true;
  if(e.prerequisite){
   delete s.sliceOfLifeDone[e.prerequisite];
   assert.ok(!SLICE.available(s,e.participants,e.trigger,e.npc).some(x=>x.id===e.id),e.id+' ignored prerequisite');
  }
 }
});
test('weekly schedule preserves one naturally co-present crossover without overriding their home routine',()=>{
 for(const e of CROSS.events){
  const s=stateFor(e);
  const selected=SLICE.scheduleOverrides(s);
  for(const id of e.participants){
   assert.ok(selected.some(o=>(o.npc===id||o.participants?.includes(id))&&o.place===e.place),
    e.id+' did not preserve the '+id+' meeting');
  }
 }
});
test('choices resolve once, create saves, and unlock the intended CG memory without advancing time',()=>{
 for(const e of CROSS.events){
  const s=stateFor(e),before={day:s.day,slot:s.slot,focus:s.focus};
  const started=SLICE.start(s,e.participants,e.trigger,e.npc);
  assert.equal(started?.id,e.id,e.id);
  for(let i=0;i<e.lines.length-1;i++)assert.equal(SLICE.next(s)?.done,false,e.id+' dialogue '+i);
  assert.equal(SLICE.next(s),null,'last line waits for a choice');
  assert.equal(SLICE.choose(s,0),true,e.id);
  const restored=JSON.parse(JSON.stringify(s));SLICE.hydrate(restored);
  const finished=SLICE.next(restored);
  assert.equal(finished?.done,true,e.id);
  assert.equal(restored.activeSliceOfLife,null);
  assert.deepEqual({day:restored.day,slot:restored.slot,focus:restored.focus},before);
  assert.equal(restored.sliceOfLifeDone[e.id]?.choice,0,e.id);
  assert.deepEqual(CG.record(restored,'slice',e.npc,{eventId:e.id}).map(cg=>cg.id),[e.id],e.id);
  assert.deepEqual(CG.record(restored,'slice',e.npc,{eventId:e.id}),[]);
  assert.ok(!SLICE.available(restored,e.participants,e.trigger,e.npc).some(x=>x.id===e.id),e.id);
 }
});
