'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const STORY=require('../rpg_story');
const CHARPACKS=require('../rpg_character_packs.generated');
const heroes=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const sample=()=>STORY.normalize({day:1,slot:0,location:'home',storyDone:{},storyMissed:{},relationships:{},partner:null});
test('authored event graph is valid and every adult route has five scenes',()=>{
 assert.deepEqual(STORY.validate(),[]);
 assert.ok(STORY.events.length>=56,'guest packs may extend the original 56 campaign events');
 for(const id of heroes)assert.equal(STORY.events.filter(e=>e.id.startsWith(id+'_route_')).length,5);
});
test('first encounters can begin and choices award relationships exactly once',()=>{
 const st=sample(),first=STORY.events.find(e=>e.npc==='reina');
 st.day=first.start;st.slot=first.slot;st.location=first.place;
 assert.ok(STORY.available(st).some(e=>e.id===first.id));
 const a=STORY.resolve(st,first.id,0);
 assert.equal(a.choice.kind,'support');
 assert.equal(st.relationships.reina.affection,2);
 assert.equal(st.relationships.reina.trust,2);
 assert.throws(()=>STORY.resolve(st,first.id,0));
});
test('later scenes require completed previous chapters and sufficient bond',()=>{
 const st=sample(),route=STORY.events.filter(e=>e.npc==='hana'),second=route[1];
 st.day=second.start;st.slot=second.slot;st.location=second.place;
 st.relationships.hana.affection=9;
 assert.ok(!STORY.available(st).some(e=>e.id===second.id));
 st.storyDone[route[0].id]={choice:0,day:route[0].start};
 assert.ok(STORY.available(st).some(e=>e.id===second.id));
});
test('missed windows expire even if the player never visits the location',()=>{
 const st=sample(),e=STORY.events[0];
 st.day=e.end+1;const missed=STORY.recordExpiry(st);
 assert.ok(st.storyMissed[e.id]);
 assert.ok(missed.some(x=>x.id===e.id));
 st.day=e.start;st.slot=e.slot;st.location=e.place;
 assert.ok(!STORY.available(st).some(x=>x.id===e.id));
});
test('romance commitments can coexist while friendship remains available',()=>{
 const st=sample(),finals=STORY.events.filter(e=>e.id.endsWith('_route_4'));
 for(const e of finals){st.storyDone[e.prerequisite]={choice:0,day:e.start-1};st.relationships[e.npc].affection=12;st.relationships[e.npc].trust=8;}
 const one=finals[0];st.day=one.start;st.slot=one.slot;st.location=one.place;
 assert.equal(STORY.resolve(st,one.id,0).partner,one.npc);
 const two=finals[1];st.day=two.start;st.slot=two.slot;st.location=two.place;
 assert.equal(STORY.resolve(st,two.id,0).partner,one.npc);
 assert.deepEqual(st.partners.slice(0,2),[one.npc,two.npc]);
});

const newerHeroines=['jinx','luna','rina','elena','sierra'];
test('guest romantic finale choices record a committed partner',()=>{
 for(const npc of newerHeroines){
  const e=STORY.byId(npc+'_route_5');
  assert.ok(e,npc+' missing finale');
  assert.deepEqual(e.choices.map(c=>c.kind),['friend','commit','honest']);
  const st=sample();st.day=e.start;st.slot=e.slot;st.location=e.place;
  st.storyDone[e.prerequisite]={choice:0,day:e.start-1};
  st.relationships[npc]={affection:12,trust:8,respect:4,attraction:4};
  STORY.resolve(st,e.id,1);
  assert.equal(st.partner,npc);
  assert.equal(st.routeOutcomes[npc],'romance');
  assert.equal(st.storyDone[e.id].choice,1);
 }
});
test('guest friendship and undecided endings remain non-exclusive',()=>{
 for(const npc of newerHeroines)for(const idx of [0,2]){
  const e=STORY.byId(npc+'_route_5'),st=sample();
  st.day=e.start;st.slot=e.slot;st.location=e.place;
  st.storyDone[e.prerequisite]={choice:0,day:e.start-1};
  st.relationships[npc].affection=9;st.relationships[npc].trust=4;
  STORY.resolve(st,e.id,idx);
  assert.equal(st.partner,null,'unexpected partner for '+npc);
  if(idx===0)assert.equal(st.routeOutcomes[npc],'friendship');
 }
});
test('legacy romantic saves recover only an unambiguous partner',()=>{
 for(const npc of newerHeroines){
  const st=sample();st.storyDone[npc+'_route_5']={day:84,choice:1};
  st.relationships[npc].affection=8;st.relationships[npc].trust=3;
  STORY.normalize(st);
  assert.equal(st.partner,npc);
  assert.equal(st.routeOutcomes[npc],'romance');
 }
 const multiple=sample();
 for(const npc of newerHeroines.slice(0,2)){
  multiple.storyDone[npc+'_route_5']={day:84,choice:1};
  multiple.relationships[npc]={affection:9,trust:4};
 }
 STORY.normalize(multiple);
 assert.equal(multiple.partner,null,'ambiguity must not silently pick a partner');
 const friendship=sample();friendship.storyDone.jinx_route_5={day:83,choice:1};friendship.routeOutcomes={jinx:'friendship'};
 friendship.relationships.jinx={affection:9,trust:4};
 STORY.normalize(friendship);assert.equal(friendship.partner,null);
 const existing=sample();existing.partner='hana';existing.storyDone.jinx_route_5={day:83,choice:1};existing.relationships.jinx={affection:9,trust:4};
 STORY.normalize(existing);assert.equal(existing.partner,'hana');
});
test('a second guest commitment joins the romance list',()=>{
 const first=STORY.byId('jinx_route_5'),second=STORY.byId('rina_route_5'),st=sample();
 for(const e of [first,second]){
  st.storyDone[e.prerequisite]={day:e.start-1,choice:0};
  st.relationships[e.npc].affection=10;st.relationships[e.npc].trust=5;
 }
 st.day=first.start;st.slot=first.slot;st.location=first.place;STORY.resolve(st,first.id,1);
 st.day=second.start;st.slot=second.slot;st.location=second.place;
 STORY.resolve(st,second.id,1);
 assert.deepEqual(st.partners,[first.npc,second.npc]);
 assert.equal(st.partner,first.npc);
 assert.equal(st.routeOutcomes[first.npc],'romance');
 assert.equal(st.routeOutcomes[second.npc],'romance');
});

test('generated guest routes register once; ambient slice encounters are not calendar events',()=>{
 const ids=STORY.events.map(e=>e.id);
 const counts=new Map();
 for(const id of ids)counts.set(id,(counts.get(id)||0)+1);
 assert.equal(counts.size,ids.length,'every authored story event ID must be unique');
 for(const event of CHARPACKS.events){
  const count=counts.get(event.id)||0;
  if(event.encounterType==='slice')assert.equal(count,0,'ambient encounter leaked into calendar: '+event.id);
  else assert.equal(count,1,'generated route or crossover duplicated/missing: '+event.id);
 }
});
