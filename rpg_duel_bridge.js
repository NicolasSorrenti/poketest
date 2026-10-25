'use strict';
// UI integration only. The authoritative Classic engine owns every card rule.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgDuelBridge=api;})(typeof window==='undefined'?null:window,function(){
 const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):window.NeoRpgRelationships;
 function sessionKey(id){if(typeof id!=='string'||!id.trim())throw Error('Missing duel ID');return 'neoRpgDuelToken:'+encodeURIComponent(id);}
 function message(id,winner){sessionKey(id);if(winner!==null&&winner!==0&&winner!==1)throw Error('Invalid winner');return {type:'neo-rpg-duel-finished',duelId:id,winner};}
 function accepts(ev,origin,frame,pending){const x=ev?.data;return !!pending&&!pending.resolved&&!!frame&&ev.origin===origin&&ev.source===frame&&x?.type==='neo-rpg-duel-finished'&&x.duelId===pending.id&&(x.winner===null||x.winner===0||x.winner===1);}
 function acceptsPlaymat(ev,origin,frame,pending){const x=ev?.data;return !!pending&&!pending.resolved&&!!frame&&ev.origin===origin&&ev.source===frame&&x?.type==='neo-rpg-playmat-selected'&&x.duelId===pending.id&&typeof x.playmat==='string';}
 function settle(s,d,winner,name){
  if(!d||s.pendingDuel?.id!==d.id||s.results.some(x=>x.id===d.id)||(winner!==null&&winner!==0&&winner!==1))return null;
  const b=s.bonds[d.npc],r=s.relationships[d.npc];if(!b||!r)return null;
  const won=winner===0,draw=winner===null,trust=won?2:1,points=won?3:1;
  const day=Number.isInteger(d.day)?d.day:s.day;
  // Two full-credit ordinary wins per seven-day week across all opponents.
  // Story, relationship, exhibition, tournament and competitive duels are exempt.
  const special=!!(d.eventKey||d.arcEpisode||d.sideQuestId||d.bondChallenge||d.tournamentId||d.competitiveKind);
  const ordinaryWin=won&&!special;
  const earlier=s.results.filter(x=>x.ordinaryCreditWin===true&&Math.ceil(x.day/7)===Math.ceil(day/7)).length;
  const credits=won?(ordinaryWin&&earlier>=2?8:15):5;
  // Persist weekly history on accepted receipts; old saves remain valid as-is.
  s.results.push({id:d.id,npc:d.npc,won,draw,day,winner,...(ordinaryWin?{ordinaryCreditWin:true}:{})});
  REL.apply(s,d.npc,{duels:1,trust,respect:trust});s.points+=points;s.credits+=credits;
  let bonus=0;const notes=[];
  if(d.eventKey&&!s.eventsDone[d.eventKey]){s.eventsDone[d.eventKey]={won,draw,day:d.day};if(won){bonus=d.eventReward||0;s.points+=bonus;}notes.push('Played '+d.eventTitle+' — '+(won?'victory':draw?'draw':'defeat')+'.');}
  if(d.npc==='reina'){s.reinaDuels=b.duels;s.reinaTrust=b.trust;}
  const outcome=won?'Victory':draw?'Draw':'Defeat';
  notes.push('Day '+day+': '+outcome+' against '+name+'.');
  if(ordinaryWin&&credits===8)notes.push('Routine win reward: 8 credits (two full-credit ordinary wins already earned this week).');
  return {duelId:d.id,npc:d.npc,name,outcome,points:points+bonus,credits,trust,bonus,notes};
 }
 return {sessionKey,message,accepts,acceptsPlaymat,settle};
});
