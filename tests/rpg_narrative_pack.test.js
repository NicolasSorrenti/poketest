'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const PACK=require('../rpg_narrative_pack');
const STORY=require('../rpg_story');
const SCHEDULES=require('../rpg_schedules');
const {DECKS,deckOptions}=require('../classic_local_service');

const oldCast=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const guests=['jun','teo','iris'];
const sample=(e)=>STORY.normalize({
 day:e.start,slot:e.slot,location:e.place,storyDone:{},storyMissed:{},
 storyFlags:{},relationships:{},partner:null
});

test('the expansion preserves eight heroine routes and adds three adult non-romance recurring trainers',()=>{
 assert.deepEqual(PACK.validate(),[]);
 assert.deepEqual(STORY.validate(),[]);
 assert.ok(STORY.events.length>=56,'additional adult pack stories expand the campaign');
 assert.ok(PACK.events.length>=24,'baseline authored events remain while character packs expand');
 assert.equal(STORY.events.filter(e=>e.id.includes('_cross_')).length,10);
 for(const id of oldCast)assert.equal(STORY.events.filter(e=>e.id.startsWith(id+'_route_')).length,4);
 for(const id of guests){
  assert.ok(PACK.cast[id].age>=18);
  assert.equal(STORY.events.filter(e=>e.id.startsWith(id+'_guest_')).length,3);
  assert.ok(PACK.looks[id].hair&&PACK.looks[id].silhouette&&PACK.looks[id].expressions);
 }
 for(const id of [...oldCast,...guests])assert.ok(PACK.looks[id]?.palette,id+' has no palette');
});

test('every guest uses a real, selectable opponent deck from the existing duel service',()=>{
 const ids=new Set(deckOptions().map(x=>x.id));
 for(const id of guests){
  assert.ok(DECKS[PACK.cast[id].deck],id+' deck missing from local engine');
  assert.ok(ids.has(PACK.cast[id].deck),id+' deck not selectable');
 }
});

test('new characters arrive at the specified time and have deterministic public schedules',()=>{
 assert.deepEqual(SCHEDULES.validate(),[]);
 for(const id of guests){
  const d=PACK.arrivals[id];
  assert.equal(SCHEDULES.locationFor(id,d-1,1),null);
  assert.ok(SCHEDULES.itinerary(id,d).some(x=>x!=='home'));
  assert.deepEqual(SCHEDULES.itinerary(id,d),SCHEDULES.itinerary(id,d));
 }
});

test('every new scene has a legal window, reachable start and a stored consequence',()=>{
 for(const e of PACK.events){
  const state=sample(e);
  state.relationships[e.npc].affection=20;
  state.relationships[e.npc].trust=10;
  if(e.prerequisite){
   const previous=STORY.byId(e.prerequisite);
   assert.ok(previous,e.id+' has missing prerequisite');
   assert.ok(previous.end<e.end,e.id+' impossible dependency');
   state.storyDone[e.prerequisite]={day:previous.start,choice:0};
  }
  assert.ok(STORY.available(state).some(x=>x.id===e.id),e.id+' not eligible');
  assert.equal(SCHEDULES.locationFor(e.npc,e.start,e.slot,[e]),e.place);
  for(const person of e.participants||[])assert.equal(SCHEDULES.locationFor(person,e.start,e.slot,[e]),e.place,'guest missing from crossroads');
  const answer=STORY.resolve(state,e.id,0);
  assert.equal(answer.choice.flag,e.choices[0].flag);
  if(e.choices[0].kind==='commit')assert.equal(state.partner,e.npc,'explicit romance commit should be allowed');
  else {assert.equal(state.storyFlags[e.id],e.choices[0].flag);assert.equal(state.partner,null,'guest/crossover scenes cannot force romance');}
  assert.ok(!STORY.available(state).some(x=>x.id===e.id),'completed scene can replay');
  assert.throws(()=>STORY.resolve(state,e.id,0));
  const loaded=STORY.normalize(JSON.parse(JSON.stringify(state)));
  if(e.choices[0].kind==='commit')assert.equal(loaded.partner,e.npc,'romance lost on load');
  else assert.equal(loaded.storyFlags[e.id],e.choices[0].flag,'decision lost on load');
 }
});

test('later guest chapters acknowledge specific earlier decisions',()=>{
 for(const id of ['jun','teo','iris']){
  const previous=STORY.byId(id+'_guest_1');
  const next=STORY.byId(id+'_guest_2');
  for(let i=0;i<2;i++){
   const state=sample(next);state.relationships[id].affection=12;
   state.storyFlags[previous.id]=previous.choices[i].flag;
   state.storyDone[previous.id]={day:previous.start,choice:i};
   assert.notEqual(STORY.linesFor(state,next.id)[0].text,next.lines[0].text);
  }
  const first=sample(next),second=sample(next);
  first.storyFlags[previous.id]=previous.choices[0].flag;
  second.storyFlags[previous.id]=previous.choices[1].flag;
  assert.notEqual(STORY.linesFor(first,next.id)[0].text,STORY.linesFor(second,next.id)[0].text);
 }
});

test('choice variations remain meaningful and missed opportunities stay missed',()=>{
 for(const e of PACK.events){
  assert.notEqual(e.choices[0].reply,e.choices[1].reply);
  assert.notEqual(e.choices[0].flag,e.choices[1].flag);
  assert.ok(e.lines.length>=6,e.id+' too short');
  assert.ok(e.lines.some(line=>line.speaker==='Protagonist'));
  const missed=sample(e);missed.day=e.end+1;
  STORY.recordExpiry(missed);
  assert.equal(missed.storyMissed[e.id],true);
 }
});

test('browser asset and multiple speaker wiring are explicit',()=>{
 const html=fs.readFileSync('rpg.html','utf8');
 const server=fs.readFileSync('server.js','utf8');
 const app=fs.readFileSync('rpg.js','utf8');
 assert.ok(html.indexOf('/rpg_narrative_pack.js')<html.indexOf('/rpg_story.js'));
 assert.match(server,/pathname==='\/rpg_narrative_pack\.js'/);
 assert.match(app,/Object\.assign\(cast,PACK\.cast,SIDE\.cast\)/);
 assert.match(app,/cast\[line\.speaker\]\?\.name/);
});
