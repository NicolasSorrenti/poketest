'use strict';
/*
 * Neo Harbor social appointments. Pure RPG state logic, no authored character
 * dialogue and no Pokémon combat rules. The same API supports new NPCs added
 * by the narrative team through NeoRpgSchedules.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgAppointments=api;
})(typeof window!=='undefined'?window:null,function(){
 const MAX_PENDING=3,MAX_HISTORY=45,MAX_AHEAD_DAYS=6;
 const validStates=new Set(['booked','attended','missed','cancelled']);
 const stamp=(day,slot)=>(day-1)*3+slot;
 function hydrate(state){
  if(!state||typeof state!=='object')throw Error('Invalid RPG save');
  if(!Array.isArray(state.appointments))state.appointments=[];
  // Defend against corrupt saves without changing otherwise-valid appointments.
  state.appointments=state.appointments.filter(e=>
   e&&Number.isInteger(e.id)&&e.id>0&&typeof e.npc==='string'&&
   Number.isInteger(e.day)&&e.day>=1&&e.day<=90&&
   Number.isInteger(e.slot)&&e.slot>=0&&e.slot<=2&&
   typeof e.place==='string'&&validStates.has(e.status)
  ).slice(-MAX_HISTORY);
  const latest=state.appointments.reduce((n,e)=>Math.max(n,e.id),0);
  if(!Number.isInteger(state.appointmentSeq)||state.appointmentSeq<latest)state.appointmentSeq=latest;
  if(!state.relationships||typeof state.relationships!=='object')state.relationships={};
  if(!state.bonds||typeof state.bonds!=='object')state.bonds={};
  return state;
 }
 function active(state){hydrate(state);return state.appointments.filter(e=>e.status==='booked').sort((a,b)=>stamp(a.day,a.slot)-stamp(b.day,b.slot));}
 function all(state){hydrate(state);return [...state.appointments];}
 function proposed(state,npc,schedules){
  hydrate(state);
  if(typeof npc!=='string'||!schedules||!schedules.start||!Object.prototype.hasOwnProperty.call(schedules.start,npc))return [];
  if(!Number.isInteger(state.day)||state.day<1||state.day>=90)return [];
  if(active(state).length>=MAX_PENDING||active(state).some(e=>e.npc===npc))return [];
  const previous=state.appointments.filter(e=>e.npc===npc&&e.status==='attended').at(-1);
  // Enough space between repeat visits for time to feel valuable.
  if(previous&&stamp(state.day,state.slot)-stamp(previous.day,previous.slot)<9)return [];
  const used=new Set(active(state).map(e=>stamp(e.day,e.slot)));
  const picks=[];const until=Math.min(90,state.day+MAX_AHEAD_DAYS);
  for(let day=state.day+1;day<=until;day++){
   for(let slot=0;slot<3;slot++){
    const place=schedules.locationFor(npc,day,slot,[]);
    if(!place||place==='home'||!schedules.publicPlaces.includes(place)||used.has(stamp(day,slot)))continue;
    // Avoid committing the player to three times on the same day.
    if(picks.some(e=>e.day===day))continue;
    picks.push({npc,day,slot,place});
    if(picks.length===3)return picks;
   }
  }
  return picks;
 }
 function book(state,npc,day,slot,place,schedules){
  hydrate(state);
  if(!Number.isInteger(day)||!Number.isInteger(slot)||typeof place!=='string')throw Error('Invalid appointment request');
  const suggestion=proposed(state,npc,schedules).find(e=>e.day===day&&e.slot===slot&&e.place===place);
  if(!suggestion)throw Error('Meeting time is no longer available');
  const entry={id:++state.appointmentSeq,npc,day,slot,place,status:'booked',bookedDay:state.day};
  state.appointments.push(entry);
  return entry;
 }
 function statusAt(state,day=state.day,slot=state.slot,place=state.location){
  return active(state).filter(e=>e.day===day&&e.slot===slot&&e.place===place);
 }
 function overrides(state,day=state.day,slot=state.slot){
  return active(state).filter(e=>e.day===day&&e.slot===slot)
   .map(e=>({npc:e.npc,place:e.place,start:day,end:day,slot}));
 }
 function attend(state,id,availablePeople=[]){
  hydrate(state);
  const e=state.appointments.find(x=>x.id===id&&x.status==='booked');
  if(!e||e.day!==state.day||e.slot!==state.slot||e.place!==state.location)throw Error('Meet-up is not available here and now');
  if(!availablePeople.includes(e.npc))throw Error('Your guest is not here');
  const rel=state.relationships[e.npc]||(state.relationships[e.npc]={affection:0,trust:0,respect:0,attraction:0,duels:0});
  const bond=state.bonds[e.npc]||(state.bonds[e.npc]={affection:0,trust:0,duels:0});
  rel.affection=Math.max(0,(rel.affection||0)+2);rel.trust=Math.max(0,(rel.trust||0)+1);
  bond.affection=Math.max(0,(bond.affection||0)+2);bond.trust=Math.max(0,(bond.trust||0)+1);
  e.status='attended';e.completedDay=state.day;
  return {entry:e,affection:2,trust:1};
 }
 function cancel(state,id){
  hydrate(state);
  const e=state.appointments.find(x=>x.id===id&&x.status==='booked');
  if(!e)throw Error('Cannot cancel a finished plan');
  // Cancelling before the agreed time is polite. At the appointed period the
  // player must either attend or miss it when time advances.
  if(stamp(state.day,state.slot)>=stamp(e.day,e.slot))throw Error('This plan has already started');
  e.status='cancelled';e.completedDay=state.day;return e;
 }
 function expire(state){
  hydrate(state);const missed=[];
  for(const e of state.appointments){
   if(e.status!=='booked'||stamp(e.day,e.slot)>=stamp(state.day,state.slot))continue;
   e.status='missed';e.completedDay=state.day;
   const rel=state.relationships[e.npc],bond=state.bonds[e.npc];
   if(rel)rel.trust=Math.max(0,(rel.trust||0)-1);
   if(bond)bond.trust=Math.max(0,(bond.trust||0)-1);
   missed.push(e);
  }
  return missed;
 }
 return Object.freeze({hydrate,all,active,proposed,book,statusAt,overrides,attend,cancel,expire,stamp});
});
