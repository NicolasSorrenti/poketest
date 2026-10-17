'use strict';
/*
 * Neo Harbor simulation kernel: deterministic schedules, town notices and NPC league results.
 * No browser state or card rules; shared by tests and RPG controller.
 */
(function(root,factory){
 const value=factory();
 if(typeof module==='object'&&module.exports)module.exports=value;
 if(root)root.NeoHarborWorld=value;
})(typeof window!=='undefined'?window:null,function(){
 const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
 const PERIODS=['Morning','Afternoon','Evening'];
 const CIRCUIT_DAYS=[7,14,21,30,42,60,75,88,89,90];
 const PAIRS=[
 ['hana','yuna'],['reina','akari'],['marina','shiori'],['camila','reina'],
 ['yuna','akari'],['hana','marina'],['shiori','camila'],['kaede','reina']
 ];
 const POWER={reina:9,shiori:8,akari:8,camila:7,marina:7,yuna:6,hana:6,kaede:9};
 function normalize(state){
  if(!state.world||typeof state.world!=='object')state.world={};
  const w=state.world;
  if(!w.npcStandings||typeof w.npcStandings!=='object')w.npcStandings={};
  if(!w.weeklyResults||typeof w.weeklyResults!=='object')w.weeklyResults={};
  if(!Array.isArray(w.notices))w.notices=[];
  if(!w.lastProcessedDay)w.lastProcessedDay=Math.max(1,state.day||1);
  return w;
 }
 const weekday=day=>(Math.max(day,1)-1)%7;
 function locationFor(id,character,state,slot=state.slot){
  if(state.day<(character.start||1)||state.day>90)return null;
  const weekDay=weekday(state.day);
  // The posted tournament calendar takes precedence over ordinary rest days.
  if(CIRCUIT_DAYS.includes(state.day)&&slot===1&&(id!=='kaede'||state.day>=40))return 'center';
  if([88,89,90].includes(state.day)&&slot===2&&(id!=='kaede'||state.day>=40))return 'center';
  if(!character.days.includes(weekDay))return null;
  if(!character.slots.includes(slot))return null;
  // NPCs do not teleport between every possible location. One stop per period.
  // The locations rotate over the week in a consistent and learnable pattern.
  const choice=(weekDay+slot+Object.keys(POWER).indexOf(id)+7)%character.locs.length;
  let place=character.locs[choice];
  const relationships=state.relationships||{};
  // Friendships change real behavior, not just a heart value.
  if(id==='reina'&&slot===2&&(relationships.reina?.trust||0)>=5&&weekDay===3)place='park';
  if(id==='hana'&&slot===0&&(relationships.hana?.affection||0)>=5&&weekDay===5)place='shop';
  if(id==='marina'&&slot===2&&(relationships.marina?.trust||0)>=4&&weekDay===2)place='park';
  if(id==='shiori'&&slot===2&&state.storyDone?.shiori_route_3&&weekDay===5)place='center';
  if(id==='kaede'&&slot===2&&state.storyDone?.kaede_route_3&&weekDay===4)place='park';
  return place;
 }
 function peopleAt(state,cast,place,stories=[]){
  if(state.day>90)return [];
  const ids=Object.entries(cast).filter(([id,c])=>locationFor(id,c,state)===place).map(([id])=>id);
  // A scheduled personal encounter is always present where it takes place.
  for(const story of stories)if(story.place===place&&cast[story.npc]&&!ids.includes(story.npc))ids.push(story.npc);
  return ids;
 }
 function nextSighting(state,cast,id,withinDays=7){
  const c=cast[id];if(!c)return null;
  for(let day=state.day;day<=Math.min(state.day+withinDays,90);day++){
   for(let slot=day===state.day?state.slot:0;slot<3;slot++){
    const where=locationFor(id,c,{...state,day,slot});
    if(where)return {day,slot,place:where};
   }
  }
  return null;
 }
 function npcStrength(state,id){
  const bond=state.relationships?.[id]||{};
  return (POWER[id]||5)+Math.floor(Math.min(bond.duels||0,9)/3);
 }
 function simulateWeek(state,week){
  const world=normalize(state);
  if(world.weeklyResults[week])return null;
  const available=PAIRS.filter(([a,b])=>!(a==='kaede'||b==='kaede')||week>=6);
  const [a,b]=available[(week-1)%available.length];
  // Deterministic, grounded to character strength + rotating advantage.
  const scoreA=npcStrength(state,a)+((week*3+1)%4);
  const scoreB=npcStrength(state,b)+((week*5+2)%4);
  const winner=scoreA>=scoreB?a:b,loser=winner===a?b:a;
  world.npcStandings[winner]=world.npcStandings[winner]||{wins:0,losses:0};
  world.npcStandings[loser]=world.npcStandings[loser]||{wins:0,losses:0};
  world.npcStandings[winner].wins++;
  world.npcStandings[loser].losses++;
  const result={week,winner,loser};
  world.weeklyResults[week]=result;
  world.notices.unshift({day:week*7,kind:'league',text:'Local circuit: '+winner+' defeated '+loser+' in a scheduled match.'});
  world.notices=world.notices.slice(0,24);
  return result;
 }
 function afterAdvance(state,previousDay){
  const w=normalize(state),changes=[];
  for(let day=Math.max(w.lastProcessedDay+1,previousDay+1);day<=Math.min(state.day,91);day++){
   if(day>1&&(day-1)%7===0){
    const week=Math.floor((day-1)/7);
    if(week>=1){const result=simulateWeek(state,week);if(result)changes.push(result);}
   }
   if(day===40){w.notices.unshift({day,kind:'arrival',text:'A new challenger has been spotted around town.'});}
   if([30,60,88].includes(day)){
    w.notices.unshift({day,kind:'event',text:'An important circuit event is taking place at the Community Center.'});
   }
  }
  w.lastProcessedDay=Math.max(w.lastProcessedDay,Math.min(state.day,91));
  w.notices=w.notices.slice(0,24);
  return changes;
 }
 function todaySummary(state,cast){
  const available=[];
  for(const [id,c] of Object.entries(cast)){
   const where=locationFor(id,c,state);
   if(where)available.push({id,place:where});
  }
  return {day:state.day,weekday:DAYS[weekday(state.day)],period:PERIODS[state.slot],available,upcoming:CIRCUIT_DAYS.filter(d=>d>=state.day).slice(0,3)};
 }
 function validate(cast){
  const errors=[];
  for(const [id,c] of Object.entries(cast)){
   if(!POWER[id])errors.push('Missing strength '+id);
   for(const d of c.days)if(!Number.isInteger(d)||d<0||d>6)errors.push('Bad weekday '+id);
   for(const slot of c.slots)if(!Number.isInteger(slot)||slot<0||slot>2)errors.push('Bad period '+id);
   if(!c.locs.length)errors.push('No routine locations for '+id);
  }
  return errors;
 }
 return Object.freeze({PERIODS,DAYS,CIRCUIT_DAYS,normalize,weekday,locationFor,peopleAt,nextSighting,afterAdvance,simulateWeek,todaySummary,validate});
});
