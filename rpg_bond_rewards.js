'use strict';
// Bond milestones are an additive reward/progress layer over the authored Story graph.
// Keep story IDs stable and never reveal titles of future chapters in the UI.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgBondRewards=api;})(typeof window!=='undefined'?window:null,function(){
 const SIGNATURES=Object.freeze({
  hana:'base2-16',reina:'base3-7',shiori:'neo2-1',yuna:'base2-1',
  akari:'neo1-14',camila:'base5-13',marina:'base1-2',kaede:'base5-5',
  jun:'base3-1',teo:'base2-44',iris:'neo1-2',jinx:'base1-14',
  luna:'base3-10',sol:'base1-36',elena:'base2-16',rina:'base1-15',sierra:'base5-13',elio:'base3-9',alma:'base2-11',nereo:'base3-42'
 });
 const TRIALS=Object.freeze({
  hana:'Teamwork Exhibition',reina:'No-Excuses Rematch',shiori:'Endgame Study',
  yuna:'Chaos Showcase',akari:'Pattern Test',camila:'Collector’s Wager',
  marina:'Patience Trial',kaede:'Disruption Trial',jun:'Fair-Play Clinic',
  teo:'Live Broadcast Duel',iris:'Courier Challenge',jinx:'Lightning Sprint',
  luna:'Tidal Balance',sol:'Hot-and-Cold Match',elena:'Calculated Reserve',rina:'Overgrowth Challenge',sierra:'The Disruption Test',elio:'The Brave First Game',
  alma:'Quiet-Table Duel',nereo:'Against the Current'
 });
 const KEY=/_(?:route|guest|bond)_\d+$/;
 function build(events,cast){
  const byNpc={},byEvent={};
  for(const e of events){
   if(!KEY.test(e.id)||!cast[e.npc])continue;
   (byNpc[e.npc]||=[]).push(e);
  }
  for(const [npc,chapters] of Object.entries(byNpc)){
   chapters.sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
   byNpc[npc]=chapters.slice(0,4).map(x=>x.id);
   byNpc[npc].forEach((id,i)=>{byEvent[id]={npc,chapter:i+1};});
  }
  return {byNpc,byEvent};
 }
 function validate(events,cast){
  const plan=build(events,cast),errors=[];
  for(const [npc,c] of Object.entries(cast)){
   const chapters=plan.byNpc[npc]||[];
   if(!c.name||chapters.length!==4)errors.push(npc+': expected four authored character milestones');
   if(!SIGNATURES[npc])errors.push(npc+': missing signature card');
   if(!TRIALS[npc])errors.push(npc+': missing personal duel challenge');
  }
  return errors;
 }
 function progress(state,npc,plan){
  const chapters=plan.byNpc[npc]||[];
  const done=chapters.filter(id=>!!state?.storyDone?.[id]).length;
  return {completed:done,total:chapters.length,next:chapters[done]||null};
 }
 function reward(state,event,plan,collection){
  const chapter=plan.byEvent[event.id];
  if(!chapter||!state?.storyDone?.[event.id])return null;
  if(!state.milestoneRewards||typeof state.milestoneRewards!=='object'||Array.isArray(state.milestoneRewards))state.milestoneRewards={};
  if(state.milestoneRewards[event.id])return null;
  const {npc}=chapter,number=chapter.chapter,credits=[0,10,15,18,25][number],out=[];
  const signature=number===3?SIGNATURES[npc]:null;
  const set=number===2||number===4?collection.setForCharacter(npc):null;
  if(signature&&state.deckJourney?.starter&&!collection.canOwn(signature))throw Error('Unknown chapter signature card');
  state.credits=(state.credits||0)+credits;out.push('+'+credits+' credits');
  if(set&&state.deckJourney?.starter){
   collection.awardVoucher(state,set);
   out.push('one '+collection.SETS[set].name+' booster voucher');
  }
  if(signature&&state.deckJourney?.starter){
   collection.awardSignature(state,signature);
   out.push('a signature card');
  }
  state.milestoneRewards[event.id]={npc,chapter:number,day:state.day};
  return {npc,chapter:number,label:out.join(' · '),credits,set,signature};
 }
 function canChallenge(state,npc,plan){
  const p=progress(state,npc,plan);
  return p.total===4&&p.completed>=2&&!state?.bondTrials?.[npc];
 }
 function settleChallenge(state,npc,won,plan,collection){
  if(!won||!canChallenge(state,npc,plan))return null;
  if(!state.bondTrials||typeof state.bondTrials!=='object'||Array.isArray(state.bondTrials))state.bondTrials={};
  if(state.bondTrials[npc])return null;
  const credits=12,set=collection.setForCharacter(npc);
  state.credits=(state.credits||0)+credits;
  if(state.deckJourney?.starter)collection.awardVoucher(state,set);
  state.bondTrials[npc]={day:state.day,credits,set};
  return {title:TRIALS[npc],credits,set,label:'+'+credits+' credits'+(state.deckJourney?.starter?' · one '+collection.SETS[set].name+' booster voucher':'')};
 }
 return Object.freeze({SIGNATURES,TRIALS,build,validate,progress,reward,canChallenge,settleChallenge});
});
