'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const TIME=require('../rpg_time_coordinator');
const booked=(id,day,slot)=>({id,npc:'hana',day,slot,place:'shop',status:'booked'});
test('RPG time coordinator detects the current appointment without mutating saved state',()=>{
 const s={day:5,slot:1,appointments:[booked(1,5,1),booked(2,5,2),booked(3,6,0)]};
 const before=JSON.stringify(s);
 assert.deepEqual(TIME.conflicts(s,1).map(x=>x.id),[1]);
 assert.deepEqual(TIME.conflicts(s,2).map(x=>x.id),[1,2]);
 assert.deepEqual(TIME.conflicts(s,3).map(x=>x.id),[1,2,3]);
 assert.deepEqual(TIME.dueNow(s).map(x=>x.id),[1]);
 assert.equal(JSON.stringify(s),before);
});
test('cancelled and attended plans never block an action',()=>{
 const s={day:2,slot:0,appointments:[{...booked(1,2,0),status:'attended'},{...booked(2,2,1),status:'cancelled'},booked(3,2,2)]};
 assert.deepEqual(TIME.conflicts(s,2),[]);
 assert.deepEqual(TIME.conflicts(s,3).map(x=>x.id),[3]);
});
test('three-period sleep and final day use exact calendar boundaries',()=>{
 const s={day:89,slot:2};const a=TIME.advanceClock(s);
 assert.deepEqual(a,{from:{day:89,slot:2},to:{day:90,slot:0},days:1});
 TIME.advanceClock(s,2);assert.deepEqual({day:s.day,slot:s.slot}, {day:90,slot:2});
 TIME.advanceClock(s,1);assert.deepEqual({day:s.day,slot:s.slot,ended:s.ended},{day:91,slot:0,ended:true});
 assert.throws(()=>TIME.advanceClock(s,1),/Invalid/);
});
test('coordinator rejects invalid clocks before writing',()=>{
 const s={day:4,slot:0},before=JSON.stringify(s);
 for(const amount of [0,-1,1.5,271])assert.throws(()=>TIME.advanceClock(s,amount),/Invalid/);
 assert.equal(JSON.stringify(s),before);
});

test('meeting conflict order follows slot chronology rather than booking ID',()=>{
 const state={day:5,slot:0,appointments:[
  booked(1,5,2),booked(9,5,0),booked(4,5,1),booked(3,6,0)
 ]};
 assert.deepEqual(TIME.conflicts(state,3).map(x=>x.id),[9,4,1]);
 assert.deepEqual(TIME.conflicts(state,4).map(x=>x.id),[9,4,1,3]);
});
