'use strict';
// Choose optional moments fairly without random rerolls or displacing authored
// invitations, mandatory scenes, or an already active dialogue.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgEncounterDirector=api;
})(typeof window!=='undefined'?window:null,function(){
 const HISTORY_LIMIT=24;
 const hash=s=>{let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n>>>0;};
 function history(state){
  const raw=state?.sliceOfLifeHistory;
  if(!Array.isArray(raw))return [];
  return raw.filter(x=>x&&typeof x.id==='string'&&typeof x.npc==='string'&&
   Number.isInteger(x.day)&&x.day>=1&&x.day<=90).slice(-HISTORY_LIMIT);
 }
 function priority(state,event,prev){
  const day=state.day;
  const recency=prev.filter(x=>x.npc===event.npc&&day>=x.day).map(x=>day-x.day);
  const last=recency.length?Math.min(...recency):Infinity;
  const count=prev.filter(x=>x.npc===event.npc).length;
  // Protect imminent limited-time moments before favoring unseen characters.
  const remaining=Number.isInteger(event.end)?event.end-day:999;
  const expiring=remaining<=1?30:remaining<=3?16:remaining<=7?8:0;
  const fresh=count===0?14:0;
  const rotation=last<=1?-22:last<=3?-12:last<=7?-5:5;
  const ties=hash(event.id+':'+day+':'+state.slot)%7;
  return expiring+fresh+rotation-Math.min(18,count*4)+ties;
 }
 function select(state,candidates){
  if(!state||!Array.isArray(candidates)||!candidates.length)return null;
  const prev=history(state);
  return candidates.slice().sort((a,b)=>priority(state,b,prev)-priority(state,a,prev)||
   String(a.id).localeCompare(String(b.id)))[0];
 }
 function remember(state,scene){
  if(!state||!scene?.id||!scene?.npc)throw Error('Invalid encounter selection');
  const prev=history(state);
  state.sliceOfLifeHistory=[...prev,{id:scene.id,npc:scene.npc,day:state.day,slot:state.slot}].slice(-HISTORY_LIMIT);
 }
 return Object.freeze({select,remember,history,priority,HISTORY_LIMIT});
});
