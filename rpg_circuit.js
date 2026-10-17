'use strict';
/* Tournament state and match scheduling. All Pokémon card outcomes remain the Classic duel engine's job. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoHarborCircuit=api;
})(typeof window!=='undefined'?window:null,function(){
 const EVENTS=[
  {id:'neighborhood',name:'Neighborhood Cup',day:30,threshold:0,prize:60,points:15,rounds:[
   {day:30,slot:1,npc:'hana'},{day:30,slot:2,npc:'reina'}]},
  {id:'regional',name:'Regional Qualifier',day:60,threshold:12,prize:110,points:22,rounds:[
   {day:60,slot:1,npc:'akari'},{day:60,slot:2,npc:'shiori'}]},
  {id:'championship',name:'Neo Harbor Championship',day:88,threshold:35,prize:250,points:40,rounds:[
   {day:88,slot:1,npc:'camila'},{day:89,slot:1,npc:'reina'},{day:90,slot:1,npc:'kaede'}]}
 ];
 const BY_ID=new Map(EVENTS.map(e=>[e.id,e]));
 function normalize(state){
  if(!state.tournament||typeof state.tournament!=='object')state.tournament={};
  if(!state.tournament.completed)state.tournament.completed={};
  if(!('active' in state.tournament))state.tournament.active=null;
  if(!state.tournament.matchIds)state.tournament.matchIds={};
  return state.tournament;
 }
 function current(state){
  const tournament=normalize(state);
  const active=tournament.active;if(!active)return null;
  const event=BY_ID.get(active.id);if(!event)return null;
  return {event,active,round:event.rounds[active.round]||null};
 }
 function registration(state){
  normalize(state);
  if(state.location!=='center'||state.day>90)return null;
  return EVENTS.find(e=>e.day===state.day&&state.slot===0&&!state.tournament.completed[e.id]&&(!state.tournament.active||state.tournament.active.id===e.id))||null;
 }
 function canEnter(state,id){
  const event=BY_ID.get(id),t=normalize(state);
  if(!event)return {ok:false,reason:'Unknown tournament'};
  if(t.completed[id])return {ok:false,reason:'Already completed'};
  if(t.active)return {ok:false,reason:'Another event is in progress'};
  if(state.day!==event.day||state.slot>1||state.location!=='center')return {ok:false,reason:'Registration is only available at the Community Center before the event starts'};
  if((state.points||0)<event.threshold)return {ok:false,reason:'Requires '+event.threshold+' circuit points'};
  return {ok:true,event};
 }
 function register(state,id){
  const possible=canEnter(state,id);if(!possible.ok)throw Error(possible.reason);
  state.tournament.active={id,round:0,wins:0,startedDay:state.day,startedSlot:state.slot,status:'registered'};
  return state.tournament.active;
 }
 function dueMatch(state){
  const entry=current(state);
  if(!entry||!entry.round||state.location!=='center')return null;
  const {round,active}=entry;
  if(state.day!==round.day||state.slot!==round.slot)return null;
  return {...entry,npc:round.npc,number:active.round+1,total:entry.event.rounds.length};
 }
 function recordMatch(state,matchId,won){
  const tournament=normalize(state);
  if(tournament.matchIds[matchId])return {duplicate:true};
  const entry=dueMatch(state);
  if(!entry)throw Error('No scheduled tournament match at this time');
  if(typeof matchId!=='string'||!matchId)throw Error('Missing duel id');
  tournament.matchIds[matchId]=true;
  const {event,active}=entry;active.status='playing';
  if(!won){
   tournament.completed[event.id]={won:false,wins:active.wins,day:state.day,reason:'eliminated'};
   tournament.active=null;
   return {ended:true,won:false,round:entry.number,name:event.name,points:0,credits:0};
  }
  active.wins++;
  active.round++;
  if(active.round>=event.rounds.length){
   tournament.completed[event.id]={won:true,wins:active.wins,day:state.day,reason:'champion'};
   tournament.active=null;
   state.points=(state.points||0)+event.points;
   state.credits=(state.credits||0)+event.prize;
   return {ended:true,won:true,round:entry.number,name:event.name,points:event.points,credits:event.prize};
  }
  active.status='between-rounds';
  return {ended:false,won:true,round:entry.number,next:event.rounds[active.round],name:event.name};
 }
 function expire(state){
  const entry=current(state);if(!entry)return null;
  const r=entry.round;if(!r)return null;
  if(state.day>r.day||(state.day===r.day&&state.slot>r.slot)){
   state.tournament.completed[entry.event.id]={won:false,wins:entry.active.wins,day:state.day,reason:'missed'};
   state.tournament.active=null;
   return {name:entry.event.name,reason:'missed'};
  }
  return null;
 }
 function standing(state){
  const t=normalize(state);
  return EVENTS.map(e=>({id:e.id,name:e.name,threshold:e.threshold,day:e.day,
    completed:t.completed[e.id]||null,active:t.active?.id===e.id,qualified:(state.points||0)>=e.threshold}));
 }
 function validate(){
  const errors=[];
  for(const event of EVENTS){
   if(event.rounds.length<2)errors.push('Tournament too short: '+event.id);
   if(event.day!==event.rounds[0].day)errors.push('Start mismatch '+event.id);
   let last=-1;
   for(const round of event.rounds){
    const idx=round.day*3+round.slot;
    if(idx<=last||round.slot<0||round.slot>2||round.day>90)errors.push('Bad round sequence '+event.id);
    last=idx;
   }
  }return errors;
 }
 return Object.freeze({EVENTS,normalize,registration,canEnter,register,current,dueMatch,recordMatch,expire,standing,validate});
});
