'use strict';
/* Optional rival storyline layered over the existing authored heroine routes.
   No cards, CPU turns or Classic TCG battle results are calculated here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgRivalArc=api;})(typeof window!=='undefined'?window:null,function(){
 const entries=[
  {id:'reina_rival_1',start:12,end:30,place:'center',slot:2,minDuels:1,previous:null,title:'After the Last Practice',
   lines:[
    ['Reina','The practice tables are empty. I expected you to be gone with everyone else.'],
    ['You','I thought you might want one more look at that match.'],
    ['Reina','I do not mind losing an evening. I mind wasting one. So tell me what you noticed.']
   ],
   choices:[
    {label:'Admit where your plan broke down',reply:'That is a better answer than blaming the cards. Maybe you are worth practicing with.',bond:{trust:2,respect:1}},
    {label:'Point out what she did especially well',reply:'Flattery? No. You actually understand the decision. Interesting.',bond:{affection:1,respect:2}},
    {label:'Ask for more time together',reply:'If you keep showing up, I might stop acting surprised.',bond:{affection:2,trust:1}}
   ]},
  {id:'reina_rival_2',start:31,end:51,place:'shop',slot:1,minDuels:1,previous:'reina_rival_1',title:'A Difficult Audience',
   lines:[
    ['Reina','Everybody has an opinion about my last match. Everybody except the person who actually watched it carefully.'],
    ['You','That sounded almost like an invitation.'],
    ['Reina','Maybe it is. I want an answer from you, not from the crowd.']
   ],
   choices:[
    {label:'Talk openly about the mistakes on both sides',reply:'Good. I needed that more than another compliment.',bond:{trust:2,respect:1},reputation:1},
    {label:'Remind her that one match proves very little',reply:'You are getting annoyingly good at knowing when I need to hear that.',bond:{affection:2,trust:1}},
    {label:'Challenge her to keep improving alongside you',reply:'There it is. That is the fire I was looking for.',bond:{respect:2,affection:1},preparation:1}
   ]},
  {id:'reina_rival_trial',start:52,end:76,place:'center',slot:2,previous:'reina_rival_2',minDuels:2,duel:true,title:'The Private Challenge',
   lines:[
    ['Reina','I reserved the last table. No spectators, no announcements, no excuses.'],
    ['You','This sounds different from our other matches.'],
    ['Reina','Because it is. I want to know what we have actually learned about each other. One real match.']
   ],
   choices:[
    {label:'Accept the challenge · ⏳ 1 period',duel:true},
    {label:'Ask to reschedule · free',decline:true}
   ]},
  {id:'reina_rival_final',start:77,end:90,place:'park',slot:2,previous:'reina_rival_trial',title:'Beyond the Rivalry',
   lines:[
    ['Reina','It is strange to hear the river instead of a tournament crowd.'],
    ['You','We have spent most of this season trying to outplay each other.'],
    ['Reina','Maybe. But the part I will remember is what happened between the matches.']
   ],
   choices:[
    {label:'Promise to keep challenging each other',reply:'Then do not fall behind. I intend to keep my favorite rival close.',bond:{respect:2,trust:1},reputation:3,ending:'rivalry'},
    {label:'Ask her to spend time together beyond the card tables',reply:'That sounds like a challenge I would actually like to lose sometimes.',bond:{affection:2,trust:2},ending:'companionship'},
    {label:'Tell her you respect the person, not just the player',reply:'You have no idea how much that means. Or maybe you do.',bond:{trust:2,affection:1},insight:2,ending:'respect'}
   ]}
 ];
 const byId=new Map(entries.map(x=>[x.id,x]));
 function hydrate(state){
  if(!state.arcFlags||typeof state.arcFlags!=='object'||Array.isArray(state.arcFlags))state.arcFlags={};
  if(!state.arcOutcomes||typeof state.arcOutcomes!=='object'||Array.isArray(state.arcOutcomes))state.arcOutcomes={};
  const a=state.activeArc,episode=a&&byId.get(a.id);
  if(!episode||!['lines','choice','response'].includes(a.phase)
    ||(a.phase==='lines'&&(!Number.isInteger(a.index)||a.index<0||a.index>=linesFor(state,a.id).length))
    ||(a.phase==='response'&&(!Number.isInteger(a.choice)||!episode.choices[a.choice]||episode.duel)))
    state.activeArc=null;
  if(!Array.isArray(state.results))state.results=[];
  if(!state.relationships||typeof state.relationships!=='object')state.relationships={};
  if(!state.relationships.reina)state.relationships.reina={affection:0,trust:0,respect:0,attraction:0,duels:0};
  if(!state.bonds||typeof state.bonds!=='object')state.bonds={};
  if(!state.bonds.reina)state.bonds.reina={affection:state.relationships.reina.affection||0,trust:state.relationships.reina.trust||0,duels:state.relationships.reina.duels||0};
  return state;
 }
 function wonAgainst(state,npc){return state.results.filter(x=>x.npc===npc&&x.won&&!x.draw).length;}
 function playedAgainst(state,npc){return state.results.filter(x=>x.npc===npc).length;}
 function eligibility(state,e,people=[]){
  hydrate(state);
  if(state.day<e.start||state.day>e.end||state.slot!==e.slot||state.location!==e.place)return false;
  if(!people.includes('reina')||state.arcFlags[e.id])return false;
  if(e.previous&&!state.arcFlags[e.previous])return false;
  if(playedAgainst(state,'reina')<(e.minDuels||0))return false;
  if(e.id==='reina_rival_2'&&!((state.relationships?.reina?.affection||0)>=3||(state.reputation||0)>=4))return false;
  if(e.duel&&!((wonAgainst(state,'reina')>=1)||(state.insight||0)>=3||(state.reputation||0)>=6))return false;
  return true;
 }
 function available(state,people=[]){return entries.filter(e=>eligibility(state,e,people));}
 function linesFor(state,id){
  const e=byId.get(id);if(!e)return [];
  if(id==='reina_rival_final'){
   const trial=state.arcFlags.reina_rival_trial;
   const result=trial?.outcome==='Victory'?'The last match went your way. The quiet feels almost like a reward.':trial?.outcome==='Defeat'?'Your last match was a loss, but the conversation did not end there.':'Neither of you got the decisive answer you expected from that match.';
   return [...e.lines.slice(0,1),['Narrator',result],...e.lines.slice(1)];
  }
  return e.lines;
 }
 function improve(state,delta){
  if(!delta)return;
  if(!state.relationships?.reina)throw Error('Missing existing Reina relationship');
  if(!state.bonds?.reina)throw Error('Missing existing Reina bond');
  for(const [key,num] of Object.entries(delta)){
   state.relationships.reina[key]=(state.relationships.reina[key]||0)+num;
   if(key==='affection'||key==='trust')state.bonds.reina[key]=state.relationships.reina[key];
  }
 }
 function finish(state,id,index,people=[]){
  const e=byId.get(id);if(!e||e.duel||!eligibility(state,e,people))throw Error('Personal event is no longer available');
  if(state.activeArc?.id!==id||state.activeArc.phase!=='response')throw Error('Personal dialogue is incomplete');
  const choice=e.choices[index];if(!choice||choice.duel||choice.decline)throw Error('Invalid decision');
  improve(state,choice.bond);
  if(choice.reputation)state.reputation=Math.min(100,(state.reputation||0)+choice.reputation);
  if(choice.preparation)state.preparation=Math.min(3,(state.preparation||0)+choice.preparation);
  if(choice.insight)state.insight=Math.min(99,(state.insight||0)+choice.insight);
  state.arcFlags[id]={day:state.day,choice:index};
  if(e.id==='reina_rival_final'){
   const partner=state.partner==='reina';
   state.arcOutcomes.reina={tone:choice.ending,relationship:partner?'romance':'friendship',duelOutcome:state.arcFlags.reina_rival_trial?.outcome||'Unknown',day:state.day};
  }
  return {text:choice.reply,ending:state.arcOutcomes.reina||null};
 }
 function settleDuel(state,id,receipt){
  hydrate(state);const e=byId.get(id);
  if(!e?.duel||!receipt||state.arcFlags[id]||receipt.npc!=='reina'||!['Victory','Defeat','Draw'].includes(receipt.outcome))return null;
  const bond=receipt.outcome==='Victory'?{respect:3,trust:1}:receipt.outcome==='Draw'?{respect:2,trust:1}:{trust:2,respect:1};
  improve(state,bond);
  state.arcFlags[id]={day:state.day,duelId:receipt.duelId,outcome:receipt.outcome};
  const notes={
   Victory:'Reina looks at the table for a moment, then smiles. The respect in her voice is unmistakable.',
   Defeat:'Reina wins, but stays to discuss the match with you. She seems more interested in your growth than the result.',
   Draw:'Neither player found the decisive advantage. Reina agrees that this is a match worth remembering.'
  };
  return notes[receipt.outcome];
 }
 function validate(){
  const issues=[],ids=new Set();
  for(const e of entries){
   if(ids.has(e.id))issues.push('Duplicate '+e.id);ids.add(e.id);
   if(e.start>e.end||e.start<1||e.end>90||e.slot<0||e.slot>2||!e.lines?.length||e.choices.length<2)issues.push('Malformed '+e.id);
   if(e.previous){const earlier=byId.get(e.previous);if(!earlier||earlier.start>=e.start||earlier.end>=e.end)issues.push('Broken prerequisite '+e.id);}
  }
  return issues;
 }
 return Object.freeze({entries,byId:id=>byId.get(id),hydrate,available,linesFor,finish,settleDuel,wonAgainst,playedAgainst,validate});
});
