'use strict';
// Deterministic, headless RPG campaign exploration. This is NOT a Classic battle
// engine: duel receipts here are explicitly synthetic and never touch live saves.
const TIME=require('./rpg_time_coordinator');
const APPOINTMENTS=require('./rpg_appointments');
const STORY=require('./rpg_story');
const WORLD=require('./rpg_world');
const SCHEDULES=require('./rpg_schedules');
const TOURNAMENTS=require('./rpg_tournaments');
const COMPETE=require('./rpg_competitive_loop');
const MANDATORY=require('./rpg_mandatory_events');
const SEASON=require('./rpg_season_events');
const PACKS=require('./rpg_character_packs.generated');
const PACK=require('./rpg_narrative_pack');
const SIDE=require('./rpg_side_quests');
const SOCIAL=require('./rpg_social_activities');
const COMMUNITY=require('./rpg_community');
const EPILOGUE=require('./rpg_epilogue');

const MODES=Object.freeze(['idle','casual','social','competitive','balanced']);
const EVENTS=[...SEASON.events,...(PACKS.mandatoryEvents||[])];
const CAST=Object.assign(Object.fromEntries(
 ['hana','reina','shiori','yuna','akari','camila','marina','kaede'].map(id=>[id,{name:id}])
),PACK.cast,SIDE.cast,PACKS.cast||{});
const LOCATIONS=SCHEDULES.publicPlaces;
function fresh(){
 const s={day:1,slot:0,location:'home',ended:false,credits:80,points:0,
  focus:75,preparation:0,insight:0,reputation:0,
  results:[],storyDone:{},storyMissed:{},storyFlags:{},flags:{},
  routeOutcomes:{},partner:null,relationships:{},bonds:{},
  activityDone:{},encountersDone:{},hungOut:{},sideQuests:{},
  appointments:[],appointmentSeq:0,tournaments:{},mandatoryEventState:null,
  competitive:null,community:null,deckJourney:null};
 STORY.normalize(s);WORLD.hydrate(s);SIDE.hydrate(s);APPOINTMENTS.hydrate(s);
 TOURNAMENTS.hydrate(s);COMPETE.hydrate(s);COMMUNITY.hydrate(s);
 MANDATORY.hydrate(s,EVENTS);
 return s;
}
function people(s,place=s.location){
 const draft={...s,location:place};
 const overrides=[...APPOINTMENTS.overrides(s),...STORY.available(draft,place),...SIDE.appointments(s)];
 return SCHEDULES.peopleAt(s.day,s.slot,place,overrides);
}
function deliverDue(s){
 if(TIME.dueNow(s).length)return 0; // appointments have priority
 MANDATORY.queue(s,EVENTS);
 const started=MANDATORY.takeNext(s,EVENTS);
 if(!started)return 0;
 let remaining=200;
 while(started.phase==='lines'&&remaining-- >0)MANDATORY.advanceDialogue(s,EVENTS);
 if(remaining<=0||!MANDATORY.choose(s,EVENTS,0))throw Error('Cannot complete mandatory event '+started.id);
 if(!MANDATORY.finish(s,EVENTS))throw Error('Mandatory event failed to settle '+started.id);
 return 1;
}
function tryAppointment(s){
 const due=TIME.dueNow(s)[0];
 if(!due)return false;
 s.location=due.place;
 if(!people(s).includes(due.npc))throw Error('Booked guest absent: '+due.npc+' on day '+s.day);
 APPOINTMENTS.attend(s,due.id,people(s));
 return true;
}
function maybeBook(s){
 if(![1,15,45,75].includes(s.day)||s.slot!==0)return;
 const npc=['hana','yuna','reina','shiori'][[1,15,45,75].indexOf(s.day)];
 const dates=APPOINTMENTS.proposed(s,npc,SCHEDULES);
 if(dates.length)APPOINTMENTS.book(s,npc,dates[0].day,dates[0].slot,dates[0].place,SCHEDULES);
}
function tryStory(s){
 for(const e of STORY.events){
  if(s.day<e.start||s.day>e.end||s.slot!==e.slot)continue;
  s.location=e.place;
  if(!STORY.available(s).some(x=>x.id===e.id))continue;
  if(!people(s).includes(e.npc))continue;
  const choice=e.choices.findIndex(c=>c.kind!=='commit');
  if(choice<0)continue;
  STORY.resolve(s,e.id,choice);
  // Mirror the browser's legacy bond synchronization, but no card rewards.
  const b=s.bonds[e.npc]||(s.bonds[e.npc]={affection:0,trust:0,duels:0});
  for(const metric of ['affection','trust','duels'])
   b[metric]=Math.max(b[metric]||0,s.relationships[e.npc]?.[metric]||0);
  return true;
 }
 return false;
}
function trySocial(s){
 for(const place of LOCATIONS){
  s.location=place;
  const present=people(s).filter(id=>CAST[id]&&!s.hungOut?.[s.day+':'+id]);
  present.sort((a,b)=>(s.relationships[a]?.affection||0)-(s.relationships[b]?.affection||0)||a.localeCompare(b));
  for(const id of present){
   const choices=SOCIAL.options(s,id,present,CAST).filter(a=>!a.disabledReason);
   if(!choices.length)continue;
   SOCIAL.complete(s,id,choices[0].id,present,CAST);
   return true;
  }
 }
 return false;
}
function tryActivity(s){
 for(const place of ['home',...LOCATIONS]){
  s.location=place;
  const options=WORLD.activitiesAt(s).filter(a=>!a.disabledReason);
  if(!options.length)continue;
  WORLD.doActivity(s,options[0].id,people(s));
  return true;
 }
 return false;
}
function syntheticDuel(s,npc,details={},outcome='Victory'){
 const id='simulation-'+s.day+'-'+s.slot+'-'+s.results.length;
 const duel={id,npc,day:s.day,slot:s.slot,...details};
 const receipt={duelId:id,npc,outcome,points:0,credits:0};
 s.results.push({id,npc,day:s.day,won:outcome==='Victory',draw:outcome==='Draw'});
 WORLD.afterDuel(s,receipt);
 if(duel.tournamentId)TOURNAMENTS.settle(s,duel,receipt);
 if(duel.competitiveKind)COMPETE.settle(s,duel,receipt);
 return true;
}
function tryCompetition(s,mode){
 s.location='center';
 const available=TOURNAMENTS.available(s);
 if(available.length){
  const entry=TOURNAMENTS.begin(s,available[0].id);
  // Deliberately exercise both champions and early elimination.
  return syntheticDuel(s,entry.npc,entry,mode==='balanced'&&s.day===60?'Defeat':'Victory');
 }
 if(s.day%3===0){
  const candidate=COMPETE.available(s).find(x=>x.kind==='daily');
  if(candidate){
   const entry=COMPETE.begin(s,candidate.id);
   return syntheticDuel(s,entry.npc,{competitiveKind:entry.kind,competitiveId:entry.id,
    competitiveWeek:entry.week,competitiveRound:entry.round},'Victory');
  }
 }
 s.location='shop';
 const local=COMPETE.available(s).find(x=>x.kind==='local');
 if(local){
  const entry=COMPETE.begin(s,local.id);
  return syntheticDuel(s,entry.npc,{competitiveKind:entry.kind,competitiveId:entry.id,
   competitiveWeek:entry.week,competitiveRound:entry.round},'Victory');
 }
 return false;
}
function assertInvariants(s,seen,issues){
 if(s.credits<0||s.focus<0||s.preparation<0)issues.push('Negative resource on day '+s.day);
 const m=s.mandatoryEventState;
 for(const id of Object.keys(m.seen))if(!seen.has(id))seen.add(id);
 if(new Set(m.pending.map(e=>e.id)).size!==m.pending.length)issues.push('Duplicate mandatory queue on day '+s.day);
 if(s.day>91||s.slot<0||s.slot>2)issues.push('Invalid day/slot');
 if(s.results.some((r,i)=>s.results.findIndex(x=>x.id===r.id)!==i))issues.push('Duplicate synthetic receipt');
}
function simulate(mode='balanced'){
 if(!MODES.includes(mode))throw Error('Unknown campaign strategy '+mode);
 const s=fresh(),seen=new Set(),issues=[],history=[],counts={rest:0,story:0,social:0,activity:0,appointment:0,syntheticDuel:0,mandatory:0,blockedTime:0};
 const competitive=mode==='competitive',social=mode==='social',balanced=mode==='balanced';
 for(let tick=0;tick<270;tick++){
  const before=TIME.stamp(s.day,s.slot);
  if(s.day>90)throw Error('Campaign ended before 270 periods');
  if(social||balanced)maybeBook(s);
  counts.mandatory+=deliverDue(s);
  let action='rest';
  if(tryAppointment(s))action='appointment';
  else if((social||balanced)&&tryStory(s))action='story';
  else if((competitive||balanced)&&tryCompetition(s,mode))action='syntheticDuel';
  else if((social||balanced)&&trySocial(s))action='social';
  else if(mode!=='idle'&&tryActivity(s))action='activity';
  if(TIME.conflicts(s,1).length)counts.blockedTime++;
  counts[action]++;
  const earlierDay=s.day;
  TIME.advanceClock(s);
  if(s.day!==earlierDay){
   WORLD.newDay(s,s.day-earlierDay);
   COMMUNITY.sync(s,Math.min(90,s.day-1),{schedules:SCHEDULES,cast:CAST});
  }
  TOURNAMENTS.expire(s);STORY.recordExpiry(s);SIDE.expire(s);APPOINTMENTS.expire(s);
  MANDATORY.queue(s,EVENTS);
  assertInvariants(s,seen,issues);
  if(TIME.stamp(s.day,s.slot)!==before+1 && !(s.day===91&&tick===269))
   issues.push('Clock did not advance exactly one period at '+tick);
  if((tick+1)%30===0)history.push({day:s.day,slot:s.slot,stories:Object.keys(s.storyDone).length,credits:s.credits,points:s.points});
 }
 // Closure on day 91 is required even after the ordinary playable periods end.
 for(let i=0;i<EVENTS.length+1;i++){
  if(!MANDATORY.queue(s,EVENTS).length)break;
  if(!deliverDue(s))break;
  counts.mandatory++;
 }
 const unplayedSeason=EVENTS.filter(e=>e.kind==='season'&&!s.mandatoryEventState.seen[e.id]).map(e=>e.id);
 if(unplayedSeason.length)issues.push('Missing season milestones: '+unplayedSeason.join(', '));
 if(s.mandatoryEventState.active)issues.push('Mandatory scene still active at closure');
 const report=EPILOGUE.report(s);
 return {mode,day:s.day,slot:s.slot,periods:270,counts,issues,history,
  completedStories:Object.keys(s.storyDone).length,missedStories:Object.keys(s.storyMissed).length,
  appointmentsAttended:s.appointments.filter(a=>a.status==='attended').length,
  appointmentsMissed:s.appointments.filter(a=>a.status==='missed').length,
  seasonMilestones:EVENTS.filter(e=>e.kind==='season'&&s.mandatoryEventState.seen[e.id]).length,
  requiredSeasonMilestones:EVENTS.filter(e=>e.kind==='season').length,
  pendingMandatory:s.mandatoryEventState.pending.map(x=>x.id),
  clubs:s.community.events.length,points:s.points,credits:s.credits,
  championships:report.champions,
  reportTitle:report.title,
  syntheticDuels:true};
}
if(require.main===module){
 const mode=process.argv[2]||'all';
 const modes=mode==='all'?MODES:[mode];
 const output=modes.map(simulate);
 process.stdout.write(JSON.stringify(output,null,2)+'\n');
 if(output.some(x=>x.issues.length))process.exitCode=1;
}
module.exports={MODES,simulate,fresh};
