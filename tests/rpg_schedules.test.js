'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../rpg_schedules'),STORY=require('../rpg_story');
test('all schedules cover seven days and three time slots',()=>{assert.deepEqual(S.validate(),[]);for(const id of Object.keys(S.start))for(let day=S.start[id];day<=90;day++)for(let slot=0;slot<3;slot++)assert.ok(S.locationFor(id,day,slot));});
test('each NPC has public routines and remains consistent across repeated queries',()=>{for(const id of Object.keys(S.start)){const d=S.start[id];assert.deepEqual(S.itinerary(id,d),S.itinerary(id,d));assert.ok(S.itinerary(id,d).some(x=>x!=='home'));}});
test('Kaede does not appear before her arrival',()=>{assert.equal(S.locationFor('kaede',40,2),null);assert.ok(S.locationFor('kaede',41,2));});
test('a scheduled story scene overrides normal daily routine',()=>{for(const e of STORY.events){const where=S.locationFor(e.npc,e.start,e.slot,[e]);assert.equal(where,e.place,e.id);assert.ok(S.peopleAt(e.start,e.slot,e.place,[e]).includes(e.npc));}});
test('home is not a public meeting location',()=>{assert.deepEqual(S.peopleAt(10,0,'home'),[]);});
test('next public visit is future-facing and limited to campaign',()=>{const visit=S.nextVisit('reina',5,1);assert.ok(visit);assert.ok((visit.day-1)*3+visit.slot>(5-1)*3+1);assert.equal(S.nextVisit('kaede',90,2),null);});
