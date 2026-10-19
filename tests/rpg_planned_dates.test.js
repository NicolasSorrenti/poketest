'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../rpg_planned_dates');
const A=require('../rpg_appointments'),S=require('../rpg_social_activities'),Schedules=require('../rpg_schedules');
const cast={hana:{name:'Hana'},reina:{name:'Reina'},yuna:{name:'Yuna'},shiori:{name:'Shiori'}};
const deps={appointments:A,schedules:Schedules,social:S,cast};
const state=(additional={})=>({day:1,slot:0,location:'shop',credits:100,focus:90,insight:0,
 appointments:[],appointmentSeq:0,relationships:{hana:{affection:6,trust:3},reina:{affection:6,trust:3}},
 bonds:{hana:{affection:6,trust:3},reina:{affection:6,trust:3}},hungOut:{},...additional});
const book=(s,npc='hana',tone='friendship',activityId=null)=>{
 const time=A.proposed(s,npc,Schedules)[0];assert.ok(time);
 const activity=activityId||S.activities.find(a=>a.place===time.place&&
  (tone==='rivalry'?['strategy','competitive','playful'].includes(a.tag):
    tone==='romantic'?['quiet','creative','collection','adventure','playful'].includes(a.tag):true))?.id;
 assert.ok(activity,'selected activity exists at venue '+time.place);
 return D.book(s,{npc,...time,activityId:activity,tone},deps);
};
const arrive=(s,plan)=>{s.day=plan.day;s.slot=plan.slot;s.location=plan.place;return s;};

test('all three approaches have a clear name and distinct eligibility behavior',()=>{
 assert.deepEqual(D.tones.map(x=>x.id),['friendship','rivalry','romantic']);
 assert.ok(D.tones.every(t=>t.label&&t.detail));
});
test('future venues only offer the three genuine activity options at that venue',()=>{
 const s=state();
 const list=D.options(s,'hana','shop',S,cast);
 assert.equal(list.length,3);assert.ok(list.every(a=>a.place==='shop'));
 assert.equal(list.find(x=>x.id==='shop_welcome').affinity,'favorite');
 assert.deepEqual(D.options(s,'ghost','shop',S,cast),[]);
});
test('booking an outing reserves the exact calendar slot and charges no resources',()=>{
 const s=state(),before={focus:s.focus,credits:s.credits,affection:s.relationships.hana.affection};
 const e=book(s,'hana','friendship');
 assert.equal(e.status,'booked');assert.equal(e.socialTone,'friendship');
 assert.ok(e.activityId);assert.equal(s.appointments.length,1);
 assert.equal(s.focus,before.focus);assert.equal(s.credits,before.credits);
 assert.equal(s.relationships.hana.affection,before.affection);
 assert.equal(s.day,1);assert.equal(s.slot,0);
});
test('attended friendship outing charges actual resources and uses exactly one social reward',()=>{
 const s=state(),e=book(s);arrive(s,e);
 const cost=S.activities.find(a=>a.id===e.activityId);
 const original=s.relationships.hana.affection;
 const result=D.attend(s,e.id,['hana'],deps);
 assert.equal(result.legacy,false);assert.equal(e.status,'attended');
 assert.equal(s.focus,90-cost.focus);assert.equal(s.credits,100-cost.credits);
 assert.equal(s.relationships.hana.affection-original,result.affection);
 assert.equal(s.bonds.hana.affection-original,result.affection);
 assert.equal(s.hungOut[s.day+':hana'],true);
 assert.throws(()=>D.attend(s,e.id,['hana'],deps));
});
test('a date requires meaningful prior affection/trust and an explicit accepted invitation',()=>{
 const s=state({relationships:{hana:{affection:3,trust:3}},bonds:{hana:{affection:3,trust:3}}});
 const time=A.proposed(s,'hana',Schedules)[0];
 const act=S.activities.find(x=>x.place===time.place&&['quiet','creative','collection','adventure','playful'].includes(x.tag));
 assert.ok(act);
 assert.match(D.choices(s,'hana',time.place,act.id,S,cast).find(x=>x.id==='romantic').disabledReason,/Build affection/);
 assert.throws(()=>D.book(s,{npc:'hana',...time,activityId:act.id,tone:'romantic'},deps),/Build affection/);
 assert.equal(s.appointments.length,0);
});
test('romantic bookings never override a committed relationship with another character',()=>{
 const s=state({partner:'reina'});
 const time=A.proposed(s,'hana',Schedules)[0];
 const act=S.activities.find(x=>x.place===time.place&&['quiet','creative','collection','adventure','playful'].includes(x.tag));
 assert.throws(()=>D.book(s,{npc:'hana',...time,activityId:act.id,tone:'romantic'},deps),/already committed/);
 assert.equal(s.appointments.length,0);
});
test('a mutual planned date grants modest attraction, without setting partner or route flags',()=>{
 const s=state(),e=book(s,'hana','romantic');arrive(s,e);
 const result=D.attend(s,e.id,['hana'],deps);
 assert.equal(result.tone,'romantic');assert.equal(result.attraction,1);
 assert.equal(s.relationships.hana.attraction,1);
 assert.equal(s.partner,undefined);assert.equal(s.routeOutcomes,undefined);
 assert.match(result.line,/agreed this would be a date/);
});
test('rivalry tone requires playful/tactical venue activity and rewards respect',()=>{
 const s=state();
 const time=A.proposed(s,'reina',Schedules)[0],activities=D.options(s,'reina',time.place,S,cast);
 const competitive=activities.find(x=>['strategy','competitive','playful'].includes(x.tag));
 assert.ok(competitive);
 const other=activities.find(x=>!['strategy','competitive','playful'].includes(x.tag));
 if(other)assert.match(D.choices(s,'reina',time.place,other.id,S,cast).find(x=>x.id==='rivalry').disabledReason,/competitive/);
 const e=D.book(s,{npc:'reina',...time,activityId:competitive.id,tone:'rivalry'},deps);
 arrive(s,e);const r=D.attend(s,e.id,['reina'],deps);
 assert.equal(r.tone,'rivalry');assert.ok(r.respect>=1);
 assert.equal(s.results,undefined);assert.equal(s.pendingDuel,undefined);
});
test('unscheduled or incorrect venue/date cannot be redeemed for an attendance reward',()=>{
 const s=state(),e=book(s);
 const before=JSON.stringify(s);
 assert.throws(()=>D.attend(s,e.id,['hana'],deps),/guest is not here/);
 assert.equal(JSON.stringify(s),before);
 arrive(s,e);s.location='home';
 assert.throws(()=>D.attend(s,e.id,['hana'],deps),/guest is not here/);
 s.location=e.place;
 assert.throws(()=>D.attend(s,e.id,[],deps),/guest is not here/);
 assert.equal(e.status,'booked');
});
test('unaffordable date cannot spend focus, add bonds or mark the booking attended',()=>{
 const s=state(),e=book(s);arrive(s,e);
 s.focus=0;s.credits=0;
 const before=JSON.stringify(s);
 assert.ok(D.canAttend(s,e,['hana'],deps));
 assert.throws(()=>D.attend(s,e.id,['hana'],deps),/Not enough/);
 assert.equal(JSON.stringify(s),before);
});
test('shared-activity and booked-date actions share once-per-NPC daily limit',()=>{
 const s=state(),e=book(s);arrive(s,e);
 const paid=S.activities.find(a=>a.id===e.activityId);
 const starter=S.options(s,'hana',['hana'],cast).find(a=>!a.disabledReason&&a.id!==paid.id);
 assert.ok(starter);
 S.complete(s,'hana',starter.id,['hana'],cast);
 const before=JSON.stringify(s);
 assert.throws(()=>D.attend(s,e.id,['hana'],deps),/Already spent/);
 assert.equal(JSON.stringify(s),before);
});
test('old appointments without a specified activity still work and grant original bonds',()=>{
 const s=state(),time=A.proposed(s,'hana',Schedules)[0],e=A.book(s,'hana',time.day,time.slot,time.place,Schedules);
 arrive(s,e);
 const rel=s.relationships.hana.affection;
 const result=D.attend(s,e.id,['hana'],deps);
 assert.equal(result.legacy,true);
 assert.equal(s.relationships.hana.affection,rel+2);
 assert.equal(s.relationships.hana.trust,4);
 assert.equal(s.focus,90);
 assert.equal(e.status,'attended');
});
test('repeat attendance is idempotent across save/reload',()=>{
 const s=state(),e=book(s);
 arrive(s,e);
 D.attend(s,e.id,['hana'],deps);
 const saved=JSON.parse(JSON.stringify(s)),before=JSON.stringify(saved);
 assert.throws(()=>D.attend(saved,e.id,['hana'],deps));
 assert.equal(JSON.stringify(saved),before);
});
test('expired booking carries the existing missed-plan consequence exactly once',()=>{
 const s=state(),e=book(s);s.day=e.day+1;s.slot=0;
 const lost=A.expire(s);
 assert.equal(lost.length,1);assert.equal(e.status,'missed');
 assert.equal(s.relationships.hana.trust,2);
 assert.deepEqual(A.expire(s),[]);
 assert.equal(s.relationships.hana.trust,2);
});
test('saved planned experience survives reload; malformed metadata falls back to legacy meet-up',()=>{
 const s=state(),e=book(s);const clone=JSON.parse(JSON.stringify(s));
 D.hydrate(clone,A,S);
 assert.equal(clone.appointments[0].activityId,e.activityId);
 clone.appointments[0].socialTone='unsafe';
 D.hydrate(clone,A,S);
 assert.equal(clone.appointments[0].socialTone,undefined);
 assert.equal(clone.appointments[0].activityId,undefined);
 assert.equal(clone.appointments[0].status,'booked');
});
test('calendar remains capped at 3 booked appointments and never allows duplicate NPC booking',()=>{
 const s=state(),e=book(s);
 assert.equal(A.proposed(s,'hana',Schedules).length,0,'same character already has a booking');
 assert.equal(s.appointments.filter(x=>x.status==='booked').length,1);
});
test('all 90 days maintain real recurring candidate appointments and no impossible map venues',()=>{
 const known=new Set(Schedules.publicPlaces);
 for(let day=1;day<90;day+=7){
  const s=state({day,slot:0});
  for(const candidate of A.proposed(s,'hana',Schedules)){
   assert.ok(known.has(candidate.place));assert.ok(candidate.day>day&&candidate.day<=90);
   assert.equal(D.options(s,'hana',candidate.place,S,cast).length,3);
  }
 }
});
