'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const STORY=require('../rpg_story');
const heroes=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const sample=()=>STORY.normalize({day:1,slot:0,location:'home',storyDone:{},storyMissed:{},relationships:{},partner:null});
test('authored event graph is valid and every adult route has four scenes',()=>{
 assert.deepEqual(STORY.validate(),[]);
 assert.equal(STORY.events.length,49);
 for(const id of heroes)assert.equal(STORY.events.filter(e=>e.id.startsWith(id+'_route_')).length,4);
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
test('romance commitments exclude alternative commitments without blocking friendship',()=>{
 const st=sample(),finals=STORY.events.filter(e=>e.id.endsWith('_route_4'));
 for(const e of finals){st.storyDone[e.prerequisite]={choice:0,day:e.start-1};st.relationships[e.npc].affection=12;st.relationships[e.npc].trust=8;}
 const one=finals[0];st.day=one.start;st.slot=one.slot;st.location=one.place;
 assert.equal(STORY.resolve(st,one.id,0).partner,one.npc);
 const two=finals[1];st.day=two.start;st.slot=two.slot;st.location=two.place;
 assert.throws(()=>STORY.resolve(st,two.id,0),/committed/);
 assert.equal(STORY.resolve(st,two.id,1).choice.kind,'friend');
 assert.equal(st.partner,one.npc);
});
