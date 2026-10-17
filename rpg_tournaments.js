'use strict';
/* Player-side 8-entrant single-elimination circuits. Human matches use the
   authoritative Classic TCG bridge; other matches are deterministic simulated
   outcomes saved when a bracket opens. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgTournaments=api;})(typeof window!=='undefined'?window:null,function(){
 const cups=[
  {id:'neighborhood',day:30,slot:1,place:'center',title:'Neighborhood Cup',prize:15,
   entrants:['player','hana','yuna','camila','reina','marina','shiori','akari']},
  {id:'regional',day:60,slot:1,place:'center',title:'Regional Qualifier',prize:22,
   entrants:['player','camila','akari','reina','kaede','hana','shiori','marina']},
  {id:'championship',day:90,slot:1,place:'center',title:'Championship Finale',prize:30,
   entrants:['player','kaede','reina','yuna','shiori','camila','akari','marina']}
 ];
 const ratings={hana:67,reina:92,shiori:86,yuna:63,akari:83,camila:79,marina:75,kaede:88};
 const byId=new Map(cups.map(e=>[e.id,e]));
 function hash(text){let n=2166136261;for(let i=0;i<text.length;i++){n^=text.charCodeAt(i);n=Math.imul(n,16777619);}return n>>>0;}
 function winner(a,b,day,round){
  const roll=((hash(day+':'+round+':'+a+':'+b)%29)-14);
  return (ratings[a]||50)+roll>=(ratings[b]||50)?a:b;
 }
 function generate(cup){
  const p=cup.entrants,fixtures=[];
  const q1=winner(p[2],p[3],cup.day,0),q2=winner(p[4],p[5],cup.day,0),q3=winner(p[6],p[7],cup.day,0);
  fixtures.push({round:0,players:[p[2],p[3]],winner:q1},{round:0,players:[p[4],p[5]],winner:q2},{round:0,players:[p[6],p[7]],winner:q3});
  const otherFinalist=winner(q2,q3,cup.day,1);
  fixtures.push({round:1,players:[q2,q3],winner:otherFinalist});
  return {opponents:[p[1],q1,otherFinalist],fixtures};
 }
 function hydrate(state){
  if(!state.tournamentSessions||typeof state.tournamentSessions!=='object'||Array.isArray(state.tournamentSessions))state.tournamentSessions={};
  if(typeof state.activeTournament!=='string'||!byId.has(state.activeTournament))state.activeTournament=null;
  if(state.activeTournament&&(!state.tournamentSessions[state.activeTournament]||state.tournamentSessions[state.activeTournament].finished))state.activeTournament=null;
  if(!state.eventsDone||typeof state.eventsDone!=='object')state.eventsDone={};
  return state;
 }
 function cupForDay(day){return cups.find(c=>c.day===day)||null;}
 function entry(state,id){
  hydrate(state);const cup=byId.get(id);
  if(!cup)return {possible:false,reason:'Unknown cup',cost:0};
  if(state.day!==cup.day||state.slot!==cup.slot||state.location!==cup.place)return {possible:false,reason:'Not at this event',cost:0};
  if(state.activeTournament)return {possible:false,reason:'Another bracket is in progress',cost:0};
  if(state.tournamentSessions[id]||state.eventsDone[cup.day+':'+cup.title])return {possible:false,reason:'Already entered',cost:0};
  const qualified=id==='neighborhood'||id==='regional'&&((state.points||0)>=6||(state.reputation||0)>=8||state.tournamentSessions.neighborhood?.outcome==='champion')
    ||id==='championship'&&((state.points||0)>=20||(state.reputation||0)>=18||state.tournamentSessions.regional?.outcome==='champion');
  const cost=qualified?0:id==='regional'?12:25;
  if((state.credits||0)<cost)return {possible:false,reason:'Need '+cost+' credits for the wildcard entry',cost};
  return {possible:true,reason:cost?'Wildcard entry costs '+cost+' credits':'Qualified entry',cost};
 }
 function begin(state,id){
  const check=entry(state,id);if(!check.possible)throw Error(check.reason);
  const cup=byId.get(id),bracket=generate(cup);
  state.credits-=check.cost;
  const session={id,day:state.day,slot:state.slot,entryCost:check.cost,
   round:0,opponents:bracket.opponents,fixtures:bracket.fixtures,
   matches:[],finished:false,outcome:null,bonusPoints:0,bonusCredits:0,started:true};
  state.tournamentSessions[id]=session;state.activeTournament=id;
  return session;
 }
 function active(state){
  hydrate(state);return state.activeTournament?state.tournamentSessions[state.activeTournament]:null;
 }
 function nextMatch(state){
  const session=active(state);if(!session||session.finished)return null;
  return {tournamentId:session.id,round:session.round,opponent:session.opponents[session.round]};
 }
 function settle(state,receipt,duel){
  hydrate(state);const session=active(state),cup=session&&byId.get(session.id);
  if(!session||!cup||!receipt||!duel||duel.tournamentId!==session.id||duel.tournamentRound!==session.round
   ||receipt.duelId!==duel.id||receipt.npc!==session.opponents[session.round]
   ||session.matches.some(x=>x.duelId===receipt.duelId))return null;
  if(!['Victory','Defeat','Draw'].includes(receipt.outcome))return null;
  session.matches.push({duelId:receipt.duelId,round:session.round,opponent:receipt.npc,outcome:receipt.outcome});
  if(receipt.outcome==='Draw'){
   return {status:'draw',message:'The match ended level. The bracket requires a winner: replay this round without advancing the town clock.',next:nextMatch(state)};
  }
  if(receipt.outcome==='Victory'){
   session.round++;
   if(session.round<3)return {status:'next',message:'Round won! Your next opponent is ready. Continue the bracket when you are ready.',next:nextMatch(state)};
   session.finished=true;session.outcome='champion';session.champion='player';session.bonusPoints=cup.prize;session.bonusCredits=cup.prize*2;
   state.points=(state.points||0)+session.bonusPoints;state.credits=(state.credits||0)+session.bonusCredits;
   state.reputation=Math.min(100,(state.reputation||0)+6);
  }else{
   session.finished=true;session.outcome='eliminated';
   const wonRounds=session.matches.filter(x=>x.outcome==='Victory').length;
   session.bonusPoints=wonRounds?Math.floor(cup.prize*wonRounds/4):0;
   session.bonusCredits=wonRounds*6;
   state.points=(state.points||0)+session.bonusPoints;
   state.credits=(state.credits||0)+session.bonusCredits;
   session.champion=winner(receipt.npc,session.opponents[2],cup.day,2);
  }
  state.eventsDone[cup.day+':'+cup.title]={won:session.outcome==='champion',day:cup.day,roundsWon:session.matches.filter(x=>x.outcome==='Victory').length};
  state.activeTournament=null;
  const champion=session.outcome==='champion';
  return {status:champion?'champion':'eliminated',bonusPoints:session.bonusPoints,bonusCredits:session.bonusCredits,
   message:champion?'You won the '+cup.title+'! The entire bracket is complete.':
     'Your tournament run has ended. The remaining bracket will carry on without you.',next:null};
 }
 function validate(){
  const issues=[],seen=new Set();
  for(const c of cups){
   if(seen.has(c.id))issues.push('Duplicate '+c.id);seen.add(c.id);
   if(c.entrants.length!==8||c.entrants[0]!=='player'||new Set(c.entrants).size!==8||c.day>90||c.day<1)issues.push('Invalid entrants '+c.id);
   for(const n of c.entrants.slice(1))if(!ratings[n])issues.push('Unknown NPC '+n);
   if(generate(c).opponents.length!==3)issues.push('No bracket '+c.id);
  }
  return issues;
 }
 return Object.freeze({cups,cupForDay,entry,begin,active,nextMatch,settle,generate,validate,hydrate});
});
