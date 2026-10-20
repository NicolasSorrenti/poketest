'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const STORY=require('../rpg_story');
const characters=['jinx','luna','rina','elena','sierra'];
function fresh(id){
 const event=STORY.byId(id+'_route_5');
 const state={day:event.start,slot:event.slot,location:event.place,storyDone:{[event.prerequisite]:{choice:0,day:event.start-1}},storyMissed:{},storyFlags:{},relationships:{},partner:null};
 STORY.normalize(state);
 state.relationships[id]={affection:12,trust:8,respect:8,attraction:6,duels:2};
 return {event,state};
}
test('five guest finales have honest friendship, commitment and undecided options',()=>{
 for(const id of characters){
  const event=STORY.byId(id+'_route_5');
  assert.ok(event,id);
  assert.deepEqual(event.choices.map(c=>c.kind),['friend','commit','honest'],id);
  assert.equal(event.choices.length,3);
  assert.match(event.choices[0].label,/friend/i,id);
  assert.match(event.choices[1].label,/date|together|partner/i,id);
  assert.ok(event.choices.every(c=>c.flag&&c.reply&&c.delta),id);
 }
});
test('explicit guest romance commits the correct partner and preserves historic choice flags',()=>{
 const originalFlags={jinx:'jinx_kiss',luna:'luna_like',rina:'rina_kiss',elena:'elena_kiss',sierra:'sierra_kiss'};
 for(const id of characters){
  const {event,state}=fresh(id);
  const result=STORY.resolve(state,event.id,1);
  assert.equal(result.partner,id,id);
  assert.equal(state.routeOutcomes[id],'romance',id);
  assert.equal(state.storyDone[event.id].choice,1,id);
  assert.equal(state.storyFlags[event.id],originalFlags[id],id+' keeps its historic scene flag');
  assert.throws(()=>STORY.resolve(state,event.id,1),/Already completed/);
 }
});
test('friendship and open-ended guest finales do not secretly commit a partner',()=>{
 for(const id of characters){
  let {event,state}=fresh(id);
  STORY.resolve(state,event.id,0);
  assert.equal(state.partner,null,id);
  assert.equal(state.routeOutcomes[id],'friendship',id);
  ({event,state}=fresh(id));
  STORY.resolve(state,event.id,2);
  assert.equal(state.partner,null,id);
  assert.ok(!state.routeOutcomes?.[id],id+' should remain uncommitted');
 }
});
test('committing to another character is blocked without blocking friendship',()=>{
 const a=fresh('jinx'),b=fresh('luna');
 const state=a.state;
 state.storyDone[b.event.prerequisite]={choice:0,day:b.event.start-1};
 state.relationships.luna={affection:12,trust:8,respect:4,attraction:3,duels:1};
 STORY.resolve(state,a.event.id,1);
 state.day=b.event.start;state.slot=b.event.slot;state.location=b.event.place;
 assert.throws(()=>STORY.resolve(state,b.event.id,1),/committed/);
 STORY.resolve(state,b.event.id,0);
 assert.equal(state.partner,'jinx');
 assert.equal(state.routeOutcomes.luna,'friendship');
});
test('legacy saves with exactly one romantic guest finale recover partnership once',()=>{
 for(const id of characters){
  const {event,state}=fresh(id);
  state.storyDone[event.id]={choice:1,day:event.start};
  state.partner=null;
  STORY.normalize(state);
  assert.equal(state.partner,id,id+' restores its earlier romantic decision');
  assert.equal(state.routeOutcomes[id],'romance');
  const reloaded=JSON.parse(JSON.stringify(state));
  STORY.normalize(reloaded);
  assert.equal(reloaded.partner,id);
 }
});
test('legacy migration never guesses between multiple romances or replaces an existing partner',()=>{
 const a=fresh('jinx'),b=fresh('luna');
 const state=a.state;
 state.storyDone[a.event.id]={choice:1,day:a.event.start};
 state.storyDone[b.event.id]={choice:1,day:b.event.start};
 state.relationships.luna={affection:10,trust:6};
 STORY.normalize(state);
 assert.equal(state.partner,null,'ambiguous historical choices must not force a relationship');
 state.partner='sol';STORY.normalize(state);
 assert.equal(state.partner,'sol');
 const other=fresh('rina');
 other.state.storyDone[other.event.id]={choice:0,day:other.event.start};
 STORY.normalize(other.state);
 assert.equal(other.state.partner,null,'a former supportive finale is not retroactive commitment');
 const friend=fresh('sierra');
 friend.state.storyDone[friend.event.id]={choice:1,day:friend.event.start};
 friend.state.routeOutcomes={sierra:'friendship'};
 STORY.normalize(friend.state);
 assert.equal(friend.state.partner,null,'recorded friendship outranks guessed intent');
});
