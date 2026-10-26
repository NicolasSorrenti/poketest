'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const SLICE=require('../rpg_slice_of_life'),CG=require('../rpg_cg_gallery'),STORY=require('../rpg_story'),SCHEDULES=require('../rpg_schedules'),TOOLS=require('../scripts/rpg-character-packs');
const REGISTRY=require('../rpg_character_packs.generated'),pack=REGISTRY.byId('barb');
const allBarbSlices=SLICE.scenes.filter(e=>e.npc==='barb'&&e.id.startsWith('barb_'));
const hashes={
 barb_random_cg_01:'1483038f7f086ef0d2f21433e4a2bf43ba5a33fd9033de194013ffd569877332',
 barb_random_cg_02:'17dc78efc71bfeffde7e8849b540dc49288724b4a064f11cbc604d50854aa3e4',
 barb_random_cg_03:'b99d1f4b3640dd256df6629f279b8caa95aeedec96f9e5704e1725253f3ff2bf',
 barb_random_cg_04:'327a3487ed5bbff6a6a76b54997f59a3ec36bd5bb142037439ac75144178dd10',
 barb_random_cg_05:'d0f94b8c4b6060b1036f8706eef63382deb3604db5320b7a83fc8716a5350cd3',
 barb_random_cg_06:'a7b4f33b41284c3470a79e4f1f5985e6979889725c1c88c4c6941b78aed38aed',
 barb_bonus_closeup:'eb2e0b7ce90cc4b3d1f7330d8422e6e2ece4cf2dc80cd620d68d7cb6f0d25257',
 barb_bonus_strawberry:'eeb9f88ba7845d57719f51650d05054cd63b03077a634e6858b13cf9032bb7c8',
 barb_bonus_bedroom:'7c1c3e81bcf6a3e4acb8c93db22c547ed7b606185a1ac32cef56da9f8faec965',
 barb_bonus_guitar:'31c601d26021e31f10d669f5a384de52063be18dcf8f2f01b8df289bd0ca7d41',
 barb_bonus_sketch:'0c98d8ff58b0382171812fe20dc072c311506e2adc94b8eb5a35858fd3619803'
};
// Keep the original approved-CG regression scoped to its eleven frozen assets.
// New Barb events have their own coverage rather than invalidating old hashes.
const scenes=allBarbSlices.filter(e=>Object.hasOwn(hashes,e.id));
const fresh=(e,extra={})=>({day:28,slot:e.slot,location:e.place,focus:75,credits:80,met_barb:true,
 relationships:{barb:{affection:5,trust:5,respect:2,attraction:2,duels:0}},bonds:{barb:{affection:5,trust:5,duels:0}},...extra});
function finish(s,e,choice=0){
 while(s.activeSliceOfLife.step<e.lines.length-1)SLICE.next(s);
 assert.equal(SLICE.next(s),null,'must not bypass the choice');
 assert.equal(SLICE.choose(s,choice),true);assert.equal(SLICE.choose(s,choice),false);
 const restored=JSON.parse(JSON.stringify(s));SLICE.hydrate(restored);
 assert.equal(restored.activeSliceOfLife.choice,choice);
 assert.equal(SLICE.next(restored).done,true);return restored;
}
test('all eleven optional pack scenes retain distinct approved assets and stay outside the main story',()=>{
 assert.equal(scenes.length,11);assert.deepEqual(scenes.map(e=>e.id).sort(),Object.keys(hashes).sort());
 assert.equal(pack.events.length,18);assert.equal(STORY.events.filter(e=>e.npc==='barb').length,5);
 assert.equal(TOOLS.check().length,REGISTRY.packs.length);
 for(const e of scenes){
  assert.equal(e.encounterType,'slice');assert.equal(e.prerequisite,null);assert.equal(e.lines.length,9);assert.equal(e.choices.length,3);
  assert.equal(STORY.byId(e.id),undefined);
  const art=pack.art.eventImages.find(x=>x.sceneId===e.id),cg=CG.byId(e.id);
  assert.equal(cg.trigger,'slice');assert.equal(cg.sliceId,e.id);assert.equal(cg.path,art.path);assert.equal(cg.thumb,art.path);
  const expectedPath=e.id==='barb_random_cg_04'?'/rpg-assets/characters/barb/events/barb_random_cg_04_accidental_model_v2.webp':'/rpg-assets/characters/barb/events/'+e.id+'.webp';
  assert.equal(art.path,expectedPath);
  const bytes=fs.readFileSync(path.join(__dirname,'..',art.path));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hashes[e.id]);
  assert.equal(CG.artCandidates(cg)[0].path,art.path);
 }
 assert.deepEqual(CG.validate(),[]);assert.deepEqual(SLICE.validate(),[]);
});
test('new Barb room and pool events coexist with the eleven original approved CGs',()=>{
 const additional=allBarbSlices.filter(e=>!Object.hasOwn(hashes,e.id));
 assert.deepEqual(additional.map(e=>e.id).sort(),['barb_pool_day_off','barb_room_after_hours']);
 assert.equal(pack.events.length,STORY.events.filter(e=>e.npc==='barb').length+allBarbSlices.length);
 for(const e of additional){
  assert.equal(e.encounterType,'slice');
  const art=pack.art.eventImages.find(x=>x.sceneId===e.id),cg=CG.byId(e.id);
  assert.ok(art,e.id+' artwork registration');
  assert.ok(cg,e.id+' CG registration');
  assert.equal(cg.path,art.path);
  assert.equal(cg.sliceId,e.id);
  assert.ok(fs.existsSync(path.join(__dirname,'..',art.path)),e.id+' CG file');
 }
 assert.equal(additional.find(e=>e.id==='barb_pool_day_off').prerequisite,'barb_room_after_hours');
});
test('all eleven can occur in one 90-day campaign on real protected routine stops',()=>{
 let s=fresh(scenes[0],{day:6,relationships:{barb:{affection:0}},bonds:{barb:{affection:0}}});
 const opportunities=Object.fromEntries(scenes.map(e=>[e.id,0]));
 for(let day=6;day<=90;day++)for(let slot=0;slot<3;slot++){
  s.day=day;s.slot=slot;
  const protection=SLICE.scheduleOverrides(s);
  for(const pin of protection)assert.equal(pin.place,pack.schedule[(day-1)%7][slot]);
  for(const place of ['shop','park','center','cafe','arcade']){
   s.location=place;
   const route=STORY.available(STORY.normalize(s),place);
   const people=SCHEDULES.peopleAt(day,slot,place,[...route,...protection]);
   const possible=SLICE.available(s,people,'talk','barb');
   for(const e of possible)opportunities[e.id]++;
   const e=SLICE.start(s,people,'talk','barb');if(!e)continue;
   s=finish(s,e);CG.record(s,'slice','barb',{eventId:e.id});
  }
 }
 for(const e of scenes){assert.ok(opportunities[e.id]>0,e.id);assert.ok(s.sliceOfLifeDone[e.id],e.id);assert.ok(CG.unlocked(s,e.id));}
});
test('routine protection respects account roster, meetings, daily caps and completed moments',()=>{
 const s=fresh(scenes[1],{day:28,slot:1,location:'park'}); // Sunday afternoon is Barb's park routine.
 const pin=SLICE.scheduleOverrides(s).find(x=>x.npc==='barb');assert.equal(pin?.place,'park');
 assert.equal(SCHEDULES.locationFor('barb',28,1,[{npc:'barb',place:'center',slot:1,start:28,end:28},pin]),'center');
 for(const extra of [{met_barb:false},{sliceOfLifeLastDay:28},{day:91},{pendingDuel:{id:'duel'}}])assert.deepEqual(SLICE.scheduleOverrides({...s,...extra}),[]);
 const done=Object.fromEntries(scenes.map(e=>[e.id,{day:6,slot:e.slot,choice:0}]));
 assert.deepEqual(SLICE.scheduleOverrides({...s,sliceOfLifeDone:done}),[]);
 // The same browser modules with the server-filtered roster cannot register Barb or her gallery entries.
 const context={window:{NeoRpgCharacterPacks:{packs:[]},NeoRpgEncounterDirector:require('../rpg_encounter_director'),NeoRpgRelationships:require('../rpg_relationships')}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../rpg_slice_of_life.js'),'utf8'),context);
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../rpg_cg_gallery.js'),'utf8'),context);
 assert.equal(context.window.NeoRpgSliceOfLife.scenes.some(e=>e.npc==='barb'),false);
 assert.equal(context.window.NeoRpgCGGallery.catalog.some(e=>e.character==='barb'),false);
});
for(const e of scenes)test(e.id+' preserves choices, interruption, exact deltas and gallery unlocks',()=>{
 for(let choice=0;choice<3;choice++){
  const s=fresh(e),before=structuredClone(s),cg=CG.byId(e.id);
  assert.ok(SLICE.available(s,['barb'],'entry').includes(e));
  for(const extra of [{met_barb:false},{day:5},{day:91},{slot:(e.slot+1)%3},{location:'home'},
   {activeStory:{id:'route'}},{activeEncounter:{id:'other'}},{mandatoryEventState:{active:{id:'mandatory'}}},{sliceOfLifeLastDay:s.day}]){
   assert.equal(SLICE.available({...s,...extra},['barb'],'entry').some(x=>x.id===e.id),false);
  }
  assert.deepEqual(SLICE.available(s,[],'entry'),[]);
  // Isolate this candidate so fairness among the eleven scenes doesn't dictate which we test.
  s.sliceOfLifeDone=Object.fromEntries(scenes.filter(x=>x.id!==e.id).map(x=>[x.id,{day:6,slot:x.slot,choice:0}]));
  assert.equal(SLICE.start(s,['barb'],'entry')?.id,e.id);
  assert.equal(CG.gallery(s).find(x=>x.id===e.id).path,null);
  assert.deepEqual(CG.record(s,'slice','barb',{eventId:e.id}),[]);
  SLICE.next(s);const interrupted=JSON.parse(JSON.stringify(s));SLICE.hydrate(interrupted);
  assert.equal(interrupted.activeSliceOfLife.step,1);assert.equal(SLICE.choose(interrupted,choice),false);
  const done=finish(interrupted,e,choice),delta=e.choices[choice].delta;
  for(const metric of ['affection','trust','respect','attraction','duels'])assert.equal(done.relationships.barb[metric],before.relationships.barb[metric]+(delta[metric]||0));
  for(const metric of ['affection','trust','duels'])assert.equal(done.bonds.barb[metric],done.relationships.barb[metric]);
  assert.deepEqual([done.day,done.slot,done.focus,done.credits],[before.day,before.slot,before.focus,before.credits]);
  assert.deepEqual(CG.record(done,'slice','barb',{eventId:'unrelated'}),[]);
  assert.deepEqual(CG.record(done,'slice','barb',{eventId:e.id}),[cg]);
  const loaded=JSON.parse(JSON.stringify(done));SLICE.hydrate(loaded);CG.hydrate(loaded);
  assert.equal(CG.gallery(loaded).find(x=>x.id===e.id).path,cg.path);
  assert.equal(CG.markViewed(loaded,e.id),true);assert.equal(SLICE.next(loaded),null);
  assert.deepEqual(CG.record(loaded,'slice','barb',{eventId:e.id}),[]);
  assert.equal(SLICE.start(loaded,['barb'],'entry'),null);
 }
});
test('callbacks require their completed source choice; out-of-order encounters retain all base dialogue',()=>{
 for(const e of scenes)for(const [flag,text] of Object.entries(e.openingByFlag||{})){
  const source=pack.events.find(x=>x.choices.some(c=>c.flag===flag));assert.ok(source,flag);
  const choice=source.choices.findIndex(c=>c.flag===flag),s=fresh(e);
  assert.deepEqual(SLICE.linesFor(s,e.id),e.lines);
  s.storyFlags={[source.id]:flag};assert.deepEqual(SLICE.linesFor(s,e.id),e.lines,'flag alone is not proof of dialogue');
  if(source.encounterType==='slice')s.sliceOfLifeDone={[source.id]:{day:8,slot:source.slot,choice}};
  else s.storyDone={[source.id]:{day:8,choice}};
  const lines=SLICE.linesFor(s,e.id);assert.ok(lines[0].text.startsWith(text));assert.ok(lines[0].text.endsWith(e.lines[0].text));
  assert.deepEqual(lines.slice(1),e.lines.slice(1));
  const done=source.encounterType==='slice'?s.sliceOfLifeDone:s.storyDone;done[source.id].choice=(choice+1)%3;
  assert.deepEqual(SLICE.linesFor(s,e.id),e.lines,'another answer must not invent the callback');
 }
});
test('pack validation rejects accidental chapter prerequisites and unknown optional triggers',()=>{
 const p=TOOLS.discover().find(p=>p.def.id==='barb');
 const malformed=structuredClone(p),e=malformed.stories.events.find(e=>e.encounterType==='slice');
 e.prerequisite='barb_route_1';assert.throws(()=>TOOLS.validate(malformed),/optional encounters/);
 e.prerequisite=null;e.trigger='mandatory';assert.throws(()=>TOOLS.validate(malformed),/optional encounter type/);
});
