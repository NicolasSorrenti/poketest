'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const PACK=require('../rpg_character_packs.generated');
const STORY=require('../rpg_story'),SCHEDULES=require('../rpg_schedules');
const SITUATIONS=require('../rpg_situations'),CG=require('../rpg_cg_gallery');
const OUTFITS=require('../rpg_outfits');
const BONDC=require('../rpg_bond_rewards');
const {deckOptions}=require('../classic_local_service');
const laca=PACK.byId('laca');
const routes=()=>STORY.events.filter(e=>e.npc==='laca'&&/^laca_route_\d$/.test(e.id));
const moments=()=>SITUATIONS.events.filter(e=>e.npc==='laca');
function stateFor(day,slot,location){
 return STORY.normalize({
  day,slot,location,focus:70,hungOut:{},situationDone:{},activeSituation:null,
  storyDone:{},storyMissed:{},storyFlags:{},relationships:{},
  bonds:{laca:{affection:2,trust:5,duels:0}},partner:null,routeOutcomes:{}
 });
}
test('Laca is an adult childhood friend and a valid playable Classic opponent',()=>{
 assert.ok(laca);
 assert.equal(laca.cast.age,20);
 assert.equal(laca.arrivalDay,5);
 assert.equal(laca.cast.deck,'water_blast');
 assert.ok(deckOptions().some(x=>x.id===laca.cast.deck));
 assert.match(laca.cast.intro,/back|rematch|kids/i);
 assert.equal(routes().length,5);
 assert.equal(STORY.events.filter(e=>e.npc==='laca'&&e.id.includes('_cross_')).length,2);
 assert.equal(STORY.validate().length,0);
 assert.equal(SCHEDULES.validate().length,0);
});
test('Laca changes work and off-duty outfits without a character-specific renderer case',()=>{
 const outfits=laca.art.outfits;
 assert.equal(OUTFITS.select(outfits,{location:'park',slot:0,day:8}).key,'lifeguard');
 assert.equal(OUTFITS.select(outfits,{location:'park',slot:1,day:8}).key,'lifeguard');
 assert.equal(OUTFITS.select(outfits,{location:'park',slot:2,day:8}).key,'casual');
 assert.equal(OUTFITS.select(outfits,{location:'shop',slot:0,day:8}).key,'casual');
 assert.equal(OUTFITS.select(outfits,{location:'park',slot:2,day:18,sceneId:'laca_route_1'}).key,'lifeguard');
 assert.ok(OUTFITS.sources(laca.art,{location:'park',slot:0,day:8},'happy').some(x=>x.includes('/lifeguard/')));
 assert.ok(OUTFITS.sources(laca.art,{location:'shop',slot:1,day:8},'happy').some(x=>x.includes('/casual/')));
});
test('all five friendship-to-romance chapters are reachable in Laca actual schedule',()=>{
 const chapters=routes();
 for(let i=0;i<chapters.length;i++){
  const e=chapters[i],d=Array.from({length:e.end-e.start+1},(_,j)=>e.start+j)
    .find(day=>SCHEDULES.locationFor('laca',day,e.slot)===e.place);
  assert.ok(d,e.id+' has no reachable visit in its window');
  const s=stateFor(d,e.slot,e.place);
  s.relationships.laca.affection=10;s.relationships.laca.trust=5;
  if(e.prerequisite)s.storyDone[e.prerequisite]={day:e.start-1,choice:0};
  assert.equal(STORY.qualifies(e,s),true,e.id);
 }
 assert.equal(chapters[4].choices.filter(x=>x.kind==='commit').length,1);
 assert.equal(chapters[4].choices.filter(x=>x.kind==='friend').length,1);
});
test('chapter callbacks recognize old decisions without changing the relationship outcome',()=>{
 const chapter=STORY.byId('laca_route_2');
 const s=stateFor(25,chapter.slot,chapter.place);
 s.storyFlags.laca_route_1='laca_reunion_rival';
 s.storyDone.laca_route_1={day:9,choice:1};
 assert.notEqual(STORY.linesFor(s,chapter.id)[0].text,chapter.lines[0].text);
 assert.equal(s.partner,null);
});
test('only finishing the correct story can unlock its own planned CG',()=>{
 const s=stateFor(6,0,'park');const entry=CG.byId('laca_route_1');
 assert.ok(entry);
 assert.deepEqual(CG.record(s,'story_milestone','laca',{eventId:'laca_route_1'}),[]);
 s.storyDone.laca_route_1={day:6,choice:0};
 assert.deepEqual(CG.record(s,'story_milestone','laca',{eventId:'different'}),[]);
 assert.deepEqual(CG.record(s,'story_milestone','laca',{eventId:'laca_route_1'}).map(x=>x.id),['laca_route_1']);
 assert.deepEqual(CG.record(s,'story_milestone','laca',{eventId:'laca_route_1'}),[]);
});
test('eight optional friendship situations have reachable schedule slots and one-time gallery unlocks',()=>{
 assert.equal(moments().length,8);
 assert.equal(CG.catalog.filter(x=>x.character==='laca').length,13);
 for(const e of moments()){
  const d=Array.from({length:e.end-e.start+1},(_,j)=>e.start+j)
    .find(day=>SCHEDULES.locationFor('laca',day,e.slot)===e.place&&SITUATIONS.chance(e,day,e.slot));
  assert.ok(d,e.id+' never appears during a real schedule');
  const s=stateFor(d,e.slot,e.place);
  s.relationships.laca.affection=10;
  s.relationships.laca.trust=5;
  s.bonds.laca.affection=10;
  assert.ok(SITUATIONS.available(s,['laca']).some(x=>x.id===e.id),e.id+' unavailable');
  SITUATIONS.start(s,e.id,['laca']);
  SITUATIONS.choose(s,0);
  SITUATIONS.finish(s,['laca']);
  assert.equal(s.situationDone[e.id].day,d);
  assert.deepEqual(CG.record(s,'situation','laca',{eventId:e.id}).map(x=>x.id),[e.id]);
  assert.deepEqual(CG.record(s,'situation','laca',{eventId:e.id}),[]);
 }
 assert.deepEqual(SITUATIONS.validate(),[]);
 assert.deepEqual(CG.validate(),[]);
});
test('Laca has authored voice and approved visual placeholders; no new mandatory artwork',()=>{
 const bible=fs.readFileSync(path.join(__dirname,'..','characters','laca','bible.md'),'utf8');
 const controller=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8');
 assert.match(bible,/childhood friend/i);
 assert.match(bible,/guardavidas/i);
 assert.match(controller,/lacaChildhoodFriendInitialized/);
 assert.ok(laca.cast.talk.length>=8);
 assert.ok(laca.art.eventImages.length>=5);
 assert.ok(laca.art.outfits.variants.casual.portrait);
 assert.ok(laca.art.outfits.variants.lifeguard.portrait);
 assert.equal(BONDC.SIGNATURES.laca,'base1-2');
 assert.ok(BONDC.TRIALS.laca);
});
