'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgTournaments=api;})(typeof window!=='undefined'?window:null,function(){
 const cups=[
  {id:'neighborhood',title:'Neighborhood Cup',day:30,end:35,place:'center',rounds:['hana','yuna','reina'],points:[4,8,15],credits:[8,15,30]},
  {id:'regional',title:'Regional Qualifier',day:60,end:67,place:'center',rounds:['marina','akari','camila'],points:[7,12,22],credits:[12,22,45]},
  {id:'championship',title:'Championship Bracket',day:88,end:90,place:'center',rounds:['kaede','shiori','reina'],points:[10,20,35],credits:[20,40,75]}
 ];
 const lookup=new Map(cups.map(x=>[x.id,x]));
 function hydrate(s){if(!s.tournaments||typeof s.tournaments!=='object'||Array.isArray(s.tournaments))s.tournaments={};return s;}
 function status(s,id){hydrate(s);const cup=lookup.get(id);if(!cup)return null;const p=s.tournaments[id]||{round:0,results:[],state:'open'};return {cup,round:p.round,results:p.results,state:p.state,opponent:cup.rounds[p.round]||null};}
 function available(s){hydrate(s);return cups.filter(c=>s.day>=c.day&&s.day<=c.end&&s.location===c.place&&status(s,c.id).state==='open');}
 function begin(s,id){const x=status(s,id);if(!x||!available(s).some(c=>c.id===id)||s.pendingDuel)throw Error('Tournament not available');
  const p=s.tournaments[id]||(s.tournaments[id]={round:0,results:[],state:'open'});
  if(p.round>=x.cup.rounds.length)throw Error('Tournament completed');
  return {tournamentId:id,tournamentRound:p.round,npc:x.cup.rounds[p.round],title:x.cup.title+' · Round '+(p.round+1)};
 }
 function settle(s,duel,receipt){
  if(!duel.tournamentId)return null;
  const x=status(s,duel.tournamentId);if(!x||x.state!=='open'||x.round!==duel.tournamentRound||x.opponent!==duel.npc)return null;
  if(!receipt||!['Victory','Defeat','Draw'].includes(receipt.outcome))throw Error('Invalid match result');
  const p=s.tournaments[duel.tournamentId],won=receipt.outcome==='Victory';
  p.results.push({round:p.round,npc:duel.npc,outcome:receipt.outcome,day:s.day});
  let points=0,credits=0;
  if(won){points=x.cup.points[p.round];credits=x.cup.credits[p.round];s.points=(s.points||0)+points;s.credits=(s.credits||0)+credits;p.round++;if(p.round===x.cup.rounds.length)p.state='champion';}
  else if(receipt.outcome==='Defeat')p.state='eliminated';
  // A draw records the result but keeps the same round available for a rematch.
  return {state:p.state,round:p.round,points,credits,won,draw:receipt.outcome==='Draw',title:x.cup.title};
 }
 function expire(s){hydrate(s);const missed=[];for(const c of cups){if(s.day>c.end){const p=s.tournaments[c.id];if(!p){s.tournaments[c.id]={round:0,results:[],state:'missed'};missed.push(c.id);}else if(p.state==='open'){p.state='expired';missed.push(c.id);}}}return missed;}
 function validate(){const errors=[];for(const c of cups){if(c.rounds.length!==3||c.points.length!==3||c.credits.length!==3||c.day>c.end)errors.push(c.id);}return errors;}
 return Object.freeze({cups,status,available,begin,settle,expire,hydrate,validate});
});