'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const AP=require('../rpg_appointments'),S=require('../rpg_schedules');
const blank=(extra={})=>AP.hydrate({day:2,slot:0,location:'shop',relationships:{hana:{affection:0,trust:1,duels:0}},
 bonds:{hana:{affection:0,trust:1,duels:0}},...extra});
test('proposals use real character itineraries, never private home locations',()=>{
 const s=blank(),slots=AP.proposed(s,'hana',S);
 assert.ok(slots.length>0);assert.ok(slots.length<=3);
 for(const p of slots){assert.equal(p.place,S.locationFor('hana',p.day,p.slot));assert.notEqual(p.place,'home');assert.ok(p.day>s.day)}
 assert.deepEqual(AP.proposed(s,'nonexistent-character',S),[]);
});
test('new characters supplied by the schedule module can be invited without hardcoded cast IDs',()=>{
 const id=Object.keys(S.start).find(k=>!['hana','reina','shiori','yuna','akari','camila','marina','kaede'].includes(k));
 assert.ok(id,'Expected narrative agent guest schedule');
 const day=Math.max(2,S.start[id]);
 assert.ok(AP.proposed(blank({day,slot:0}),id,S).length>0);
});
test('booking reserves a unique free future period and survives JSON saving',()=>{
 const s=blank(),slot=AP.proposed(s,'hana',S)[0],e=AP.book(s,'hana',slot.day,slot.slot,slot.place,S);
 assert.equal(AP.active(s).length,1);assert.equal(e.id,1);
 assert.equal(AP.overrides(s,e.day,e.slot)[0].npc,'hana');
 assert.equal(AP.proposed(s,'hana',S).length,0);
 const restored=AP.hydrate(JSON.parse(JSON.stringify(s)));
 assert.equal(AP.active(restored)[0].id,e.id);
 assert.throws(()=>AP.book(restored,'hana',slot.day,slot.slot,slot.place,S),/no longer available/);
});
test('attending requires the right NPC, location, period and only pays once',()=>{
 const s=blank(),slot=AP.proposed(s,'hana',S)[0],e=AP.book(s,'hana',slot.day,slot.slot,slot.place,S);
 assert.throws(()=>AP.attend(s,e.id,['hana']),/not available/);
 s.day=e.day;s.slot=e.slot;s.location=e.place;
 assert.throws(()=>AP.attend(s,e.id,[]),/not here/);
 assert.equal(AP.attend(s,e.id,['hana']).affection,2);
 assert.equal(s.relationships.hana.affection,2);assert.equal(s.relationships.hana.trust,2);
 assert.equal(s.bonds.hana.affection,2);assert.equal(e.status,'attended');
 assert.throws(()=>AP.attend(s,e.id,['hana']),/not available/);
});
test('missing an appointment penalizes trust once but never below zero',()=>{
 const s=blank(),slot=AP.proposed(s,'hana',S)[0],e=AP.book(s,'hana',slot.day,slot.slot,slot.place,S);
 s.day=e.day;s.slot=e.slot;s.location=e.place;assert.deepEqual(AP.expire(s),[]);
 s.slot=slot.slot+1;if(s.slot>2){s.slot=0;s.day++;}
 assert.equal(AP.expire(s).length,1);
 assert.equal(e.status,'missed');assert.equal(s.relationships.hana.trust,0);
 assert.equal(s.bonds.hana.trust,0);assert.deepEqual(AP.expire(s),[]);
});
test('cancelled plans do not grant rewards or cost trust and release reservations',()=>{
 const s=blank(),slot=AP.proposed(s,'hana',S)[0],e=AP.book(s,'hana',slot.day,slot.slot,slot.place,S);
 AP.cancel(s,e.id);assert.equal(e.status,'cancelled');
 assert.equal(s.relationships.hana.trust,1);assert.equal(AP.active(s).length,0);
 assert.ok(AP.proposed(s,'hana',S).length);
 assert.throws(()=>AP.cancel(s,e.id),/Cannot cancel/);
});
test('no overbooking and no bookings in the past, at home or after season end',()=>{
 const s=blank();
 for(const id of ['hana','reina','shiori']){const [slot]=AP.proposed(s,id,S);assert.ok(slot);AP.book(s,id,slot.day,slot.slot,slot.place,S)}
 assert.equal(AP.active(s).length,3);assert.deepEqual(AP.proposed(s,'marina',S),[]);
 assert.throws(()=>AP.book(s,'marina',0,0,'home',S));
 assert.deepEqual(AP.proposed(blank({day:90,slot:1}),'hana',S),[]);
});
test('corrupt old save fields are repaired without discarding unrelated progress',()=>{
 const s={day:20,slot:1,credits:123,appointments:{bad:true},appointmentSeq:-10};
 AP.hydrate(s);
 assert.deepEqual(s.appointments,[]);assert.equal(s.appointmentSeq,0);assert.equal(s.credits,123);
});
test('accepted plans are grounded in public locations even when there is an authored event on that day',()=>{
 const s=blank(),slot=AP.proposed(s,'hana',S)[0],e=AP.book(s,'hana',slot.day,slot.slot,slot.place,S);
 assert.equal(S.peopleAt(e.day,e.slot,e.place,AP.overrides(s,e.day,e.slot)).includes('hana'),true);
});
