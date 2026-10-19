'use strict';
/* Optional, real scheduled outings. Uses appointment reservations and the
 * G2 activity engine; no duplicate relationship rewards or TCG shortcuts. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgPlannedDates=api;
})(typeof window!=='undefined'?window:null,function(){
 const TONES=Object.freeze([
  Object.freeze({id:'friendship',label:'Spend time as friends',detail:'Build trust without expecting romance.'}),
  Object.freeze({id:'rivalry',label:'Friendly challenge',detail:'Share a competitive experience and build respect.'}),
  Object.freeze({id:'romantic',label:'Ask for a date',detail:'A mutual, optional romantic outing; never automatically commits a route.'})
 ]);
 const byTone=new Map(TONES.map(t=>[t.id,t]));
 const rivalryTags=new Set(['strategy','competitive','playful']);
 const romanticTags=new Set(['quiet','creative','collection','adventure','playful']);
 const clamp=(v,n)=>Math.max(0,Math.min(n,Number.isFinite(v)?v:0));
 function allowedTone(s,npc,tone,activity,cast={}){
  if(!cast[npc]||!byTone.has(tone)||!activity)return 'Unrecognized social plan';
  if(tone==='rivalry'&&!rivalryTags.has(activity.tag))return 'Choose a competitive or playful outing for a rivalry';
  if(tone==='romantic'){
   if(!romanticTags.has(activity.tag))return 'Choose a relaxed, creative or playful activity for a date';
   if(s.partner&&s.partner!==npc)return 'You are already committed to someone else';
   const relationship=s.relationships?.[npc]||s.bonds?.[npc]||{};
   if((relationship.affection||0)<4||(relationship.trust||0)<2)return 'Build affection (4) and trust (2) before suggesting a date';
  }
  return null;
 }
 function choices(s,npc,place,activityId,social,cast={}){
  const activity=social.activities.find(x=>x.id===activityId&&x.place===place);
  if(!activity)return [];
  return TONES.map(t=>({...t,disabledReason:allowedTone(s,npc,t.id,activity,cast)}));
 }
 function options(s,npc,place,social,cast={}){
  if(!cast[npc])return [];
  return social.activities.filter(a=>a.place===place).map(a=>({
   ...a,affinity:social.affinity(npc,a.tag,cast)
  }));
 }
 function hydrate(s,appointments,social){
  appointments.hydrate(s);
  for(const e of s.appointments){
   if(!('activityId' in e)&&!('socialTone' in e))continue;
   const a=social.activities.find(x=>x.id===e.activityId&&x.place===e.place);
   if(!a||!byTone.has(e.socialTone)||e.socialTone==='rivalry'&&!rivalryTags.has(a.tag)
    ||e.socialTone==='romantic'&&!romanticTags.has(a.tag)){
    // Old/corrupt plans remain valid meet-ups instead of trapping the player.
    delete e.activityId;delete e.socialTone;
   }
  }
  return s;
 }
 function book(s,request,{appointments,schedules,social,cast}){
  hydrate(s,appointments,social);
  const {npc,day,slot,place,activityId,tone}=request||{};
  if(!cast[npc])throw Error('Unknown trainer');
  const activity=social.activities.find(a=>a.id===activityId&&a.place===place);
  if(!activity)throw Error('Selected activity is not available at that venue');
  const why=allowedTone(s,npc,tone,activity,cast);
  if(why)throw Error(why);
  // The appointment provider performs final availability checks. No costs are
  // taken until attendance and the eventual chosen activity is mandatory.
  const booked=appointments.book(s,npc,day,slot,place,schedules);
  booked.activityId=activity.id;booked.socialTone=tone;
  return booked;
 }
 function canAttend(s,entry,people,{appointments,social,cast}){
  if(!entry||entry.status!=='booked'||s.day!==entry.day||s.slot!==entry.slot
     ||s.location!==entry.place||!people.includes(entry.npc))return 'Your guest is not here for this plan';
  if(s.pendingDuel||s.activeStory||s.activeSideQuest||s.activeArc||s.activeEncounter)return 'Finish the current scene first';
  if(s.hungOut?.[s.day+':'+entry.npc])return 'Already spent time together today';
  if(!entry.activityId)return null; // older save, plain scheduled conversation
  const act=social.options(s,entry.npc,people,cast).find(a=>a.id===entry.activityId);
  if(!act)return 'The selected activity is not available at this venue';
  if(act.disabledReason)return act.disabledReason;
  return allowedTone(s,entry.npc,entry.socialTone,act,cast);
 }
 function attend(s,id,people,{appointments,social,cast}){
  hydrate(s,appointments,social);
  const e=appointments.active(s).find(x=>x.id===id);
  const blocked=canAttend(s,e,people,{appointments,social,cast});
  if(blocked)throw Error(blocked);
  if(!e.activityId){
   const normal=appointments.attend(s,id,people);
   return {entry:normal.entry,legacy:true,tone:'friendship',title:'A good conversation',
    line:'I am glad we made time for this. It is good to talk away from the tournament noise.',
    affection:normal.affection,trust:normal.trust,respect:0,attraction:0};
  }
  // Both APIs are sync. All failure conditions above are checked before the
  // first write, and social.complete uses this same once-per-day guard.
  const outcome=social.complete(s,e.npc,e.activityId,people,cast);
  appointments.attend(s,id,people,{grantRewards:false});
  const rel=s.relationships[e.npc],bond=s.bonds[e.npc];
  let trust=0,respect=0,attraction=0;
  if(e.socialTone==='friendship'&&outcome.affinity!=='unfamiliar'){
   rel.trust=clamp((rel.trust||0)+1,999);bond.trust=clamp((bond.trust||0)+1,999);trust=1;
  }
  if(e.socialTone==='rivalry'){
   rel.respect=clamp((rel.respect||0)+1,999);respect=1;
  }
  if(e.socialTone==='romantic'){
   rel.attraction=clamp((rel.attraction||0)+1,999);attraction=1;
  }
  const prefix=e.socialTone==='romantic'?
   'You both agreed this would be a date. It feels different from an ordinary hangout. ':
   e.socialTone==='rivalry'?'There is a friendly competitive spark between you. ':
   'You made time for each other as friends. ';
  return {entry:e,legacy:false,title:outcome.title,tone:e.socialTone,
   line:prefix+outcome.line,affection:outcome.affection,trust:outcome.trust+trust,
   respect:outcome.respect+respect,attraction,focusCost:outcome.focusCost,creditCost:outcome.creditCost};
 }
 return Object.freeze({tones:TONES,options,choices,allowedTone,book,attend,canAttend,hydrate});
});
