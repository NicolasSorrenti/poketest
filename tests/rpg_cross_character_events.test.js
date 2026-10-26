'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const CROSS=require('../rpg_cross_character_events');
const SLICE=require('../rpg_slice_of_life');
const SCHEDULES=require('../rpg_schedules');
const CG=require('../rpg_cg_gallery');
const ids=new Set(CROSS.events.map(e=>e.id));
const naturalDay=e=>{
 for(let day=e.start;day<=e.end;day++)
  if(e.participants.every(id=>SCHEDULES.naturalLocationFor(id,day,e.slot)===e.place||
   (e.plannedMeetup&&id!=='barb'&&SCHEDULES.naturalLocationFor('barb',day,e.slot)===e.place)))return day;
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
 assert.equal(CROSS.events.length,63);
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

test('server-filtered guest roster cannot leak exclusive character crossover dialogue or gallery art',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const allowed=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
 const context=vm.createContext({window:{
  NeoRpgSchedules:{start:Object.fromEntries(allowed.map(id=>[id,1]))},
  NeoRpgCrossCharacterEvents:CROSS,
  NeoRpgCharacterPacks:{packs:[]},
  NeoRpgEncounterDirector:require('../rpg_encounter_director'),
  NeoRpgRelationships:require('../rpg_relationships'),
  NeoRpgAkariBarbFitting:require('../rpg_akari_barb_event')
 }});
 for(const name of ['rpg_slice_of_life.js','rpg_cg_gallery.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),context,{filename:name});
 const scenes=Array.from(context.window.NeoRpgSliceOfLife.scenes).filter(e=>e.id.startsWith('crossover_'));
 assert.ok(scenes.length>0,'public pair scenes should remain available');
 assert.ok(scenes.every(e=>Array.from(e.participants).every(id=>allowed.includes(id))));
 const cgs=Array.from(context.window.NeoRpgCGGallery.catalog).filter(e=>e.id.startsWith('crossover_'));
 assert.equal(cgs.length,scenes.length);
 assert.ok(cgs.every(e=>allowed.includes(e.character)));
 assert.ok(!cgs.some(e=>e.id.includes('barb')||e.id.includes('laca')||e.id.includes('jinx')));
});

test('Barb designs one individualized bikini-related beachwear concept with each other authorized character',()=>{
 const PACK=require('../rpg_character_packs.generated'),NARRATIVE=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests');
 const cast=new Set(Object.keys(SCHEDULES.start));cast.delete('barb');
 const plans=CROSS.events.filter(e=>e.beachwear?.stage==='concept');
 assert.equal(plans.length,cast.size);
 assert.equal(new Set(plans.map(e=>e.participants[1])).size,cast.size);
 for(const e of plans){
  assert.ok(cast.has(e.participants[1]),'unknown visitor '+e.id);
  assert.equal(e.participants[0],'barb');
  assert.ok(e.beachwear.cut.length>30,'missing custom silhouette '+e.id);
  assert.match(e.beachwear.palette,/and/i);
  assert.ok(e.art.scene.includes('Barb and '+e.participants[1]));
  assert.match(e.art.scene,/sketch/i);
  assert.equal(e.artPending,true);
  assert.ok(naturalDay(e)!==null,'meeting impossible '+e.id);
 }
 assert.ok(plans.find(e=>e.participants[1]==='elena')?.plannedMeetup);
 const identityIds=[...Object.keys(NARRATIVE.schedules),...Object.keys(SIDE.schedules),...PACK.packs.map(p=>p.id)];
 assert.ok(identityIds.every(id=>id==='barb'||plans.some(e=>e.participants[1]===id)));
});
