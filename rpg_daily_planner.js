'use strict';
/* Read-only, spoiler-conscious daily guidance for Neo Harbor.
   No authored dialogue, card-rule mutations or time advancement belongs here. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgDailyPlanner=api;
})(typeof window!=='undefined'?window:null,function(){
 const periodNames=['morning','afternoon','evening'];
 const locked=s=>!!(s.pendingDuel||s.activeStory||s.activeSideQuest||s.activeEncounter||s.activeArc||s.activeSituation);
 const stamp=(day,slot)=>(day-1)*3+slot;
 const safeName=(cast,id)=>cast[id]?.name||id.replace(/[_-]/g,' ').replace(/\b\w/g,x=>x.toUpperCase());
 const placeName=(places,id)=>places[id]?.[0]||id;
 function recommend(state,api={},options={}){
  if(!state||!Number.isInteger(state.day)||state.day<1||state.day>90||!Number.isInteger(state.slot)||state.slot<0||state.slot>2)return [];
  if(locked(state))return [];
  const {schedules,appointments,story,side,world,tournaments,intentions,arc,social,situations,cast={},places={},eventCards=[]}=api;
  if(!schedules||!appointments||!story||!side||!world||!tournaments||!intentions)throw Error('Missing RPG planner dependencies');
  // Modules normalize/hydrate their inputs. Only pass a clone: rendering the planner
  // must never change live campaign state, save data, or the authored story schedule.
  const s=JSON.parse(JSON.stringify(state));
  const validPlaces=[...schedules.publicPlaces].filter(p=>places[p]);
  const now=stamp(s.day,s.slot);
  const due=intentions.status(s);
  const focus=due.chosen&&!due.completed?due.selected.id:null;
  const max=Math.max(1,Math.min(3,Number.isInteger(options.limit)?options.limit:3));
  const candidates=[],seen=new Set();
  function add({kind,key,priority,place=null,day=s.day,slot=s.slot,title,detail,timeCost=1,timing='now',focusId=null}){
   if(place&&!places[place])return;
   if(!Number.isFinite(priority)||!title||!detail)return;
   const id=kind+':'+key+':'+day+':'+slot;
   if(seen.has(id))return;seen.add(id);
   candidates.push({id,kind,priority,place,day,slot,title,detail,timeCost,timing,
    focusId:focusId||null,action:timing==='now'?(place===s.location?'view':'travel'):'none'});
  }
  function snapshot(place,slot=s.slot,day=s.day){
   const draft=JSON.parse(JSON.stringify(s));
   draft.location=place;draft.slot=slot;draft.day=day;
   // Booked plans and qualifying authored stories can relocate NPCs.
   // Match the exact override logic in publicAppointments/currentPeople.
   const overrides=[...appointments.overrides(draft,day,slot),...story.available(draft,place),...side.appointments(draft)];
   const present=schedules.peopleAt(day,slot,place,overrides);
   for(const e of story.available(draft,place))if(!present.includes(e.npc))present.push(e.npc);
   return {draft,present};
  }
  const plans=appointments.active(s);
  for(const plan of plans){
   const when=stamp(plan.day,plan.slot),diff=when-now;
   if(diff<0||diff>3||!places[plan.place])continue;
   const future=diff!==0;
   const activity=plan.activityId&&social?.activities?.find(x=>x.id===plan.activityId);
   const label=plan.socialTone==='romantic'?'Date':plan.socialTone==='rivalry'?'Friendly challenge':activity?'Planned outing':'Meet-up';
   const details=activity?' · '+activity.title+' ('+activity.focus+' focus'+(activity.credits?', '+activity.credits+' credits':'')+' at meeting)':'';
   add({kind:'appointment',key:String(plan.id),priority:future?diff===1?97:diff===2?70:52:160,
    place:plan.place,day:plan.day,slot:plan.slot,timing:future?'upcoming':'now',
    title:label+(future?' coming up':' happening now'),
    detail:(future?'Day '+plan.day+' · '+periodNames[plan.slot]+'. ':'')+
     (safeName(cast,plan.npc))+' at '+placeName(places,plan.place)+details+(future?' — a time action may bring this closer.':' · one period to attend.'),
    focusId:'appointments'});
  }
  // Current-place and free-travel choices are evaluated for the very same
  // period. A late/expired opportunity is never advertised as actionable.
  for(const place of validPlaces){
   const {draft,present}=snapshot(place);
   if(situations)for(const e of situations.available(draft,present)){
    add({kind:'situation',key:e.id,place,priority:86+(focus==='social'?13:0),
     title:'Unexpected moment with '+safeName(cast,e.npc),
     detail:'A playful, one-time encounter is happening '+(place===s.location?'here':'at '+placeName(places,place))+'. Costs '+e.focusCost+' focus and one period.',
     focusId:'situationEvents'});
   }
   for(const e of story.available(draft,place)){
    add({kind:'story',key:e.id,place,priority:82+(e.end===s.day?18:0)+(focus==='social'?13:0),
     title:'Personal story with '+safeName(cast,e.npc),
     detail:'A conversation is available '+(place===s.location?'here':'at '+placeName(places,place))+'. '+(e.end===s.day?'Last eligible day. ':'')+'Uses one period.',
     focusId:'storyEvents'});
   }
   for(const q of side.available(draft,present)){
    add({kind:'sidequest',key:q.quest.id,place,priority:78+(q.stage.end===s.day?17:0)+(focus==='social'?9:0),
     title:'Side quest with '+safeName(cast,q.stage.npc),
     detail:'An optional chapter can continue '+(place===s.location?'here':'at '+placeName(places,place))+'. '+(q.stage.end===s.day?'Final day for this chapter. ':'')+'Uses one period.',
     focusId:'sideQuestEvents'});
   }
   if(arc)for(const a of arc.available(draft,present)){
    add({kind:'arc',key:a.id,place,priority:76+(a.end===s.day?18:0)+(focus==='social'?10:0),
     title:'Rivalry conversation',
     detail:'A personal rivalry opportunity is available '+(place===s.location?'here':'at '+placeName(places,place))+'. One period.',
     focusId:'storyEvents'});
   }
   for(const e of world.availableEncounters(draft,present)){
    add({kind:'encounter',key:e.id,place,priority:57+(e.end===s.day?24:0)+(focus==='town'?20:0),
     title:'Local encounter'+(e.npc?' with '+safeName(cast,e.npc):''),
     detail:'A nearby moment is available '+(place===s.location?'here':'at '+placeName(places,place))+'. '+(e.end===s.day?'Final day. ':'')+'One period.',
     focusId:'townEncounters'});
   }
   for(const cup of tournaments.available(draft)){
    const step=tournaments.status(draft,cup.id);
    add({kind:'tournament',key:cup.id,place,priority:88+(s.day===cup.end?24:0)+(focus==='duel'?16:0),
     title:cup.title+' · Round '+(step.round+1),
     detail:'An official TCG match is open '+(place===s.location?'here':'at '+placeName(places,place))+'. '+(s.day===cup.end?'Registration ends today. ':'')+'One period.',
     focusId:'activities'});
   }
   const exhibition=eventCards.find(e=>e.day===s.day&&e.slot===s.slot&&e.place===place&&!s.eventsDone?.[e.day+':'+e.title]);
   if(exhibition&&!tournaments.cups.some(c=>c.day===exhibition.day)){
    add({kind:'event',key:exhibition.title,place,priority:96+(focus==='duel'?10:0),
     title:'Today: '+exhibition.title,
     detail:'A scheduled TCG exhibition is taking place '+(place===s.location?'here':'at '+placeName(places,place))+'. One period.',
     focusId:'activities'});
   }
   for(const e of world.activitiesAt(draft).filter(a=>!a.disabledReason)){
    add({kind:'activity',key:e.id,place,priority:31+(focus==='town'?22:0)+(focus==='duel'&&e.change.preparation?17:0)+(e.npc&&present.includes(e.npc)?5:0),
     title:e.title,
     detail:'Available '+(place===s.location?'here':'at '+placeName(places,place))+'. '+(e.focus?'Costs '+e.focus+' focus. ':'')+'One period.',
     focusId:'townActivities'});
   }
   const npc=present.find(id=>cast[id]&&!s.hungOut?.[s.day+':'+id]);
   if(npc){
    add({kind:'social',key:npc,place,priority:37+(focus==='social'?26:0)+(!s.talked?.[s.day+':'+s.slot+':'+npc]?4:0),
     title:'Spend time with '+safeName(cast,npc),
     detail:'They are '+(place===s.location?'here':'at '+placeName(places,place))+' this period. Talking is free; spending time together uses one period.',
     focusId:'people'});
   }
  }
  // Later-today narrative windows are only surfaced when all prerequisites
  // and NPC availability will truly be satisfied. Mask chapter titles until
  // the player reaches them; never offer an early execution shortcut.
  for(let slot=s.slot+1;slot<=2;slot++)for(const place of validPlaces){
   const {draft,present}=snapshot(place,slot);
   for(const e of story.available(draft,place)){
    if(e.end!==s.day)continue;
    add({kind:'story_soon',key:e.id,place,slot,timing:'upcoming',priority:75,
     title:'Personal opportunity later today',
     detail:safeName(cast,e.npc)+' has a time-sensitive conversation in the '+periodNames[slot]+' at '+placeName(places,place)+'. Do not skip that period.',
     focusId:'storyEvents'});
   }
   for(const q of side.available(draft,present)){
    if(q.stage.end!==s.day)continue;
    add({kind:'sidequest_soon',key:q.quest.id,place,slot,timing:'upcoming',priority:73,
     title:'Side quest opportunity later today',
     detail:'A chapter with '+safeName(cast,q.stage.npc)+' will be available in the '+periodNames[slot]+' at '+placeName(places,place)+'. It closes today.',
     focusId:'sideQuestEvents'});
   }
   if(arc)for(const e of arc.available(draft,present)){
    if(e.end!==s.day)continue;
    add({kind:'arc_soon',key:e.id,place,slot,timing:'upcoming',priority:72,
     title:'Rivalry moment later today',
     detail:'A personal conversation can happen in the '+periodNames[slot]+' at '+placeName(places,place)+'. It closes today.',
     focusId:'storyEvents'});
   }
  }
  // A future appointment gets a warning; a not-yet-started cup can appear as a
  // date-only heads-up, but never a misleading "Play now" button.
  for(const cup of tournaments.cups){
   const d=cup.day-s.day;
   if(d<1||d>2||tournaments.status(s,cup.id).state!=='open')continue;
   add({kind:'tournament_soon',key:cup.id,priority:41+(d===1?8:0),
    place:cup.place,day:cup.day,slot:0,timing:'upcoming',timeCost:0,
    title:cup.title+' starts soon',detail:'Day '+cup.day+' at '+placeName(places,cup.place)+'. Plan your deck and keep some time free.'});
  }
  // Stable selection with category diversity where options have comparable
  // urgency. Never suppress a time-critical appointment or deadline.
  candidates.sort((a,b)=>b.priority-a.priority||a.day-b.day||a.slot-b.slot||a.id.localeCompare(b.id));
  const selected=[],families=new Set();
  const family=c=>c.kind==='story'||c.kind==='story_soon'||c.kind==='sidequest'||c.kind==='sidequest_soon'||c.kind==='arc'||c.kind==='arc_soon'||c.kind==='social'||c.kind==='situation'?'social':c.kind==='tournament'||c.kind==='event'||c.kind==='tournament_soon'?'duel':c.kind;
  for(const c of candidates){
   const fam=family(c);
   if(families.has(fam)&&c.priority<100)continue;
   selected.push(c);families.add(fam);
   if(selected.length===max)break;
  }
  if(selected.length<max)for(const c of candidates){
   if(selected.some(x=>x.id===c.id))continue;
   selected.push(c);if(selected.length===max)break;
  }
  return selected;
 }
 return Object.freeze({recommend,stamp,locked});
});
