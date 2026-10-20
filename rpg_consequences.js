'use strict';
// Persistent narrative consequences of *verified* RPG duels. Purely social: no TCG
// turns, card awards, score modifiers or relationship grinding take place here.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgConsequences=api;
})(typeof window!=='undefined'?window:null,function(){
 const valid=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const OUTCOMES=new Set(['Victory','Defeat','Draw']);
 const PATHS=Object.freeze({
  study:{label:'Study the match',opening:'You revisit the key turns and write down what you could change.',
   followup:'I heard you went back over our game. I have been thinking about those turns too.',
   reply:'That gives us something specific to work on, instead of blaming one unlucky draw.',
   ending:'You met your setbacks with curiosity, returning to the difficult decisions until you understood them.'},
  challenge:{label:'Choose the next challenge',opening:'You put the result behind you and decide to face the next challenge.',
   followup:'You did not let our result end the conversation. I respect that.',
   reply:'A rematch is not a promise of victory. It is a promise to show up again.',
   ending:'You kept seeking another match, even when the previous result had not gone your way.'},
  perspective:{label:'Look beyond the scoreboard',opening:'You spend a moment remembering why the matches mattered beyond winning.',
   followup:'I heard you took some time to put the result in perspective.',
   reply:'One match cannot decide who belongs at the table. I am glad you came back.',
   ending:'You learned that the people across the card table mattered as much as any result.'}
 });
 const MAX_RECORDS=110;
 function hydrate(state){
  if(!valid(state.consequences))state.consequences={};
  const c=state.consequences;
  if(!valid(c.processed))c.processed={};
  if(!Array.isArray(c.events))c.events=[];
  if(!valid(c.choices))c.choices={};
  return c;
 }
 function previous(s,npc,exclude){
  const entries=(Array.isArray(s.results)?s.results:[]).filter(r=>valid(r)&&r.id!==exclude&&
   r.npc===npc&&(typeof r.won==='boolean'||r.draw===true)&&Number.isInteger(r.day)&&r.day>=1&&r.day<=s.day);
  return entries.at(-1)||null;
 }
 function trend(s,npc){
  const matches=(Array.isArray(s?.results)?s.results:[]).filter(r=>valid(r)&&r.npc===npc&&typeof r.won==='boolean'&&Number.isInteger(r.day)&&r.day<=s.day);
  const wins=matches.filter(r=>r.won===true).length,draws=matches.filter(r=>r.draw===true).length;
  const losses=matches.length-wins-draws,latest=matches.at(-1);
  let streak=0;
  if(latest&&!latest.draw){
   for(let i=matches.length-1;i>=0;i--){
    if(matches[i].draw||matches[i].won!==latest.won)break;
    streak++;
   }
  }
  return {played:matches.length,wins,losses,draws,streak,latest:latest?latest.won?'Victory':latest.draw?'Draw':'Defeat':null};
 }
 function record(s,duel,receipt){
  if(!valid(s)||!valid(duel)||!valid(receipt)||!OUTCOMES.has(receipt.outcome)||
   !receipt.duelId||receipt.duelId!==duel.id||receipt.npc!==duel.npc||
   !Number.isInteger(s.day)||s.day<1||s.day>91)return null;
  const result=(Array.isArray(s.results)?s.results:[]).find(r=>r?.id===receipt.duelId&&r?.npc===receipt.npc);
  if(!result|| (result.draw?'Draw':result.won?'Victory':'Defeat')!==receipt.outcome)return null;
  const c=hydrate(s);
  if(c.processed[receipt.duelId])return null;
  const prior=previous(s,duel.npc,receipt.duelId);
  const comeback=receipt.outcome==='Victory'&&prior?.won===false&&!prior?.draw;
  const reversed=receipt.outcome==='Defeat'&&prior?.won===true&&!prior?.draw;
  const doubleLoss=receipt.outcome==='Defeat'&&prior?.won===false&&!prior?.draw;
  const cup=typeof duel.tournamentId==='string'&&['neighborhood','regional','championship'].includes(duel.tournamentId)?duel.tournamentId:null;
  const local=duel.competitiveKind==='local';
  const status=receipt.outcome==='Victory'?'won':receipt.outcome==='Draw'?'drew':'lost';
  const kind=cup&&receipt.outcome==='Defeat'?'cup_setback':
   comeback?'comeback':doubleLoss?'losing_streak':reversed?'reversal':
   local&&receipt.outcome==='Defeat'?'local_setback':receipt.outcome==='Defeat'?'setback':
   local&&receipt.outcome==='Victory'?'local_win':'standard';
  const event={id:'turn:'+receipt.duelId,duelId:receipt.duelId,npc:duel.npc,day:duel.day,
   outcome:receipt.outcome,kind,cup,local,status,prior:prior?(prior.draw?'Draw':prior.won?'Victory':'Defeat'):null};
  c.processed[receipt.duelId]=true;
  c.events.push(event);
  if(c.events.length>MAX_RECORDS)c.events.splice(0,c.events.length-MAX_RECORDS);
  return {...event,highlight:['cup_setback','comeback','losing_streak','reversal','local_setback'].includes(kind)};
 }
 const eligible=e=>e&&['cup_setback','comeback','losing_streak','reversal','local_setback','setback'].includes(e.kind);
 function opportunities(s){
  if(!s||!Number.isInteger(s.day)||s.day>90||s.day<1)return [];
  const c=hydrate(s);
  return c.events.filter(e=>eligible(e)&&e.day<=s.day&&s.day-e.day<=7&&!c.choices[e.id])
   .sort((a,b)=>b.day-a.day||b.duelId.localeCompare(a.duelId)).slice(0,3);
 }
 function prompt(e,name){
  const detail=e.kind==='cup_setback'?'An official bracket closed before you expected.':
   e.kind==='comeback'?'You finally reversed the result against a familiar rival.':
   e.kind==='losing_streak'?'A second loss against the same trainer is still on your mind.':
   e.kind==='reversal'?'An opponent you once beat found a way past your plan.':
   'That duel did not end the way you wanted.';
  return {speaker:'Narrator',line:detail+' You can reflect on the match against '+name+' at the Community Center.',
   choices:Object.entries(PATHS).map(([key,item])=>[item.label,'consequenceChoice:'+key])
    .concat([['Leave it for now','close']])};
 }
 function resolve(s,id,path){
  const c=hydrate(s),event=opportunities(s).find(e=>e.id===id);
  if(s.location!=='center'||!event||!Object.hasOwn(PATHS,path)||c.choices[event.id])return null;
  const response={eventId:event.id,npc:event.npc,kind:event.kind,day:s.day,
   path,outcome:event.outcome};
  c.choices[event.id]=response;
  return {response,lines:[{speaker:'Narrator',text:PATHS[path].opening},
   {speaker:'Protagonist',text:path==='study'?'I want to understand that last turn.':
      path==='challenge'?'The next match will be different.':'That result is not the whole season.'},
   {speaker:'Narrator',text:path==='study'?'Your notes will be here when you need them.':
      path==='challenge'?'The next duel is still yours to choose.':
      'There are still people worth meeting and games worth playing.'}]};
 }
 function reaction(s,npc){
  const c=s?.consequences;
  if(!valid(c?.choices)||!Array.isArray(c.events)||!Number.isInteger(s.day)||s.day>90)return null;
  const chosen=c.events.slice().reverse().find(e=>e.npc===npc&&
   valid(c.choices[e.id])&&s.day-c.choices[e.id].day<=7&&
   s.day>=c.choices[e.id].day&&PATHS[c.choices[e.id].path]);
  if(!chosen)return null;
  const choice=c.choices[chosen.id],path=PATHS[choice.path];
  return {id:'react:choice:'+npc+':'+chosen.duelId,kind:'consequence',day:choice.day,
   lines:[{speaker:npc,text:path.followup},
    {speaker:'Protagonist',text:'That match stayed with me.'},
    {speaker:npc,text:path.reply}]};
 }
 function preDuel(s,npc){
  const c=s?.consequences;
  if(!valid(c?.choices)||!Array.isArray(c.events))return null;
  const chosen=c.events.slice().reverse().find(e=>e.npc===npc&&valid(c.choices[e.id])&&
   s.day-c.choices[e.id].day<=14&&s.day>=c.choices[e.id].day);
  const path=chosen&&PATHS[c.choices[chosen.id].path];
  return path?path.followup:null;
 }
 function ending(s){
  const c=s?.consequences;
  if(!valid(c?.choices)||!Array.isArray(c.events))return {comebacks:0,reflections:0,choices:[],lines:[]};
  const entries=c.events.filter(e=>valid(e)&&typeof e.id==='string');
  const decisions=entries.map(e=>c.choices[e.id]).filter(x=>x&&PATHS[x.path]);
  const paths=Object.keys(PATHS).map(id=>({id,count:decisions.filter(d=>d.path===id).length}));
  const dominant=paths.sort((a,b)=>b.count-a.count)[0];
  const comebacks=entries.filter(e=>e.kind==='comeback').length;
  const reversals=entries.filter(e=>e.kind==='reversal').length;
  const lines=[];
  if(dominant?.count>0)lines.push(PATHS[dominant.id].ending);
  if(comebacks>0)lines.push('You turned '+comebacks+' earlier defeat'+(comebacks===1?'':'s')+
   ' into a later victory against the same opponent.');
  else if(reversals>0)lines.push('Rivals adapted to your game, and you had to rethink what you knew.');
  const cupSetback=entries.some(e=>e.kind==='cup_setback');
  if(cupSetback&&decisions.some(d=>d.kind==='cup_setback'))
   lines.push('Even an official cup elimination became a moment of reflection instead of the end of your season.');
  return {comebacks,reversals,reflections:decisions.length,
   choices:paths.filter(x=>x.count>0),lines:lines.slice(0,3)};
 }
 return Object.freeze({PATHS,hydrate,previous,trend,record,opportunities,prompt,resolve,reaction,preDuel,ending});
});
