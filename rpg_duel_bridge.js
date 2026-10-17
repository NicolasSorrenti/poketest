'use strict';
// UI integration only. The authoritative Classic engine owns every card rule.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgDuelBridge=api;})(typeof window==='undefined'?null:window,function(){
 function sessionKey(id){if(typeof id!=='string'||!id.trim())throw Error('Missing duel ID');return 'neoRpgDuelToken:'+encodeURIComponent(id);}
 function message(id,winner){sessionKey(id);if(winner!==null&&winner!==0&&winner!==1)throw Error('Invalid winner');return {type:'neo-rpg-duel-finished',duelId:id,winner};}
 function accepts(ev,origin,frame,pending){const x=ev?.data;return !!pending&&!pending.resolved&&!!frame&&ev.origin===origin&&ev.source===frame&&x?.type==='neo-rpg-duel-finished'&&x.duelId===pending.id&&(x.winner===null||x.winner===0||x.winner===1);}
 function settle(s,d,winner,name){
  if(!d||s.pendingDuel?.id!==d.id||s.results.some(x=>x.id===d.id)||(winner!==null&&winner!==0&&winner!==1))return null;
  const b=s.bonds[d.npc],r=s.relationships[d.npc];if(!b||!r)return null;
  const won=winner===0,draw=winner===null,trust=won?2:1,credits=won?15:5,points=won?3:1;
  s.results.push({id:d.id,npc:d.npc,won,draw,day:d.day,winner});
  b.duels++;b.trust+=trust;r.duels++;r.trust+=trust;r.respect+=trust;s.points+=points;s.credits+=credits;
  let bonus=0;const notes=[];
  if(d.eventKey&&!s.eventsDone[d.eventKey]){s.eventsDone[d.eventKey]={won,draw,day:d.day};if(won){bonus=d.eventReward||0;s.points+=bonus;}notes.push('Played '+d.eventTitle+' — '+(won?'victory':draw?'draw':'defeat')+'.');}
  if(d.npc==='reina'){s.reinaDuels=b.duels;s.reinaTrust=b.trust;}
  const outcome=won?'Victory':draw?'Draw':'Defeat';
  notes.push('Day '+d.day+': '+outcome+' against '+name+'.');
  return {duelId:d.id,npc:d.npc,name,outcome,points:points+bonus,credits,trust,bonus,notes};
 }
 return {sessionKey,message,accepts,settle};
});
