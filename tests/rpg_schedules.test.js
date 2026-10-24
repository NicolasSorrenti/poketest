'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../rpg_schedules'),STORY=require('../rpg_story');
test('all schedules cover seven days and three time slots',()=>{assert.deepEqual(S.validate(),[]);for(const id of Object.keys(S.start))for(let day=S.start[id];day<=90;day++)for(let slot=0;slot<3;slot++)assert.ok(S.locationFor(id,day,slot));});
test('each NPC has public routines and remains consistent across repeated queries',()=>{for(const id of Object.keys(S.start)){const d=S.start[id];assert.deepEqual(S.itinerary(id,d),S.itinerary(id,d));assert.ok(S.itinerary(id,d).some(x=>x!=='home'));}});
test('Kaede does not appear before her arrival',()=>{assert.equal(S.locationFor('kaede',40,2),null);assert.ok(S.locationFor('kaede',41,2));});
test('a scheduled story scene overrides normal daily routine',()=>{for(const e of STORY.events){const where=S.locationFor(e.npc,e.start,e.slot,[e]);assert.equal(where,e.place,e.id);assert.ok(S.peopleAt(e.start,e.slot,e.place,[e]).includes(e.npc));}});
test('home is not a public meeting location',()=>{assert.deepEqual(S.peopleAt(10,0,'home'),[]);});
test('next public visit is future-facing and limited to campaign',()=>{const visit=S.nextVisit('reina',5,1);assert.ok(visit);assert.ok((visit.day-1)*3+visit.slot>(5-1)*3+1);assert.equal(S.nextVisit('kaede',90,2),null);});

test('normal-day public locations are capped and all attendees agree with their location',()=>{
 assert.equal(S.NORMAL_PLACE_LIMIT,4);
 for(let day=1;day<=90;day++)for(let slot=0;slot<3;slot++){
  const seen=new Set();
  for(const place of S.publicPlaces){
   const people=S.peopleAt(day,slot,place);
   assert.ok(people.length<=S.NORMAL_PLACE_LIMIT,'crowded '+place+' on '+day+':'+slot);
   for(const id of people){
    assert.equal(S.locationFor(id,day,slot),place);
    assert.equal(seen.has(id),false,'duplicate NPC '+id);
    seen.add(id);
   }
  }
  for(const id of Object.keys(S.start)){
   const location=S.locationFor(id,day,slot);
   if(location&&location!=='home')assert.ok(seen.has(id),'missing public NPC '+id);
  }
 }
});
test('event attendance is an exception to normal crowd limits and does not move story participants',()=>{
 const day=50,slot=1,ids=Object.keys(S.start).filter(id=>S.start[id]<=day).slice(0,6);
 assert.equal(ids.length,6);
 const events=ids.map(id=>({npc:id,place:'shop',start:day,end:day,slot}));
 const shop=S.peopleAt(day,slot,'shop',events);
 for(const id of ids){
  assert.equal(S.locationFor(id,day,slot,events),'shop',id);
  assert.ok(shop.includes(id),id+' missing from event');
 }
 assert.ok(shop.length>4,'a legitimate event must allow more than four NPCs');
 for(const place of S.publicPlaces.filter(p=>p!=='shop'))
  assert.ok(S.peopleAt(day,slot,place,events).length<=4,place+' overcrowded despite movable NPCs');
});
test('balanced schedules are deterministic, respect arrivals, and retain public visits',()=>{
 for(const id of Object.keys(S.start)){
  const first=S.start[id];
  if(first>1)assert.equal(S.locationFor(id,first-1,0),null);
  assert.deepEqual(S.itinerary(id,first),S.itinerary(id,first));
  assert.ok(S.nextVisit(id,first,0)||first===90,id+' has no future visit');
 }
});
