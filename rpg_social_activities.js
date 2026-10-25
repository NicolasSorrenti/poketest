'use strict';
/* Neo Harbor shared activities. A lightweight, extensible, romance-optional
   social layer; it never replaces authored quests or touches card rules. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSocialActivities=api;
})(typeof window!=='undefined'?window:null,function(){
 const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):window.NeoRpgRelationships;
 const activities=Object.freeze([
  {id:'shop_deck_lab',place:'shop',title:'Build a deck together',tag:'strategy',tone:'rivalry',focus:12,credits:0,detail:'Compare opening hands and make each other rethink a risky play.'},
  {id:'shop_welcome',place:'shop',title:'Welcome a new player',tag:'community',tone:'friendship',focus:8,credits:0,detail:'Show a newcomer how to play without making them feel judged.'},
  {id:'shop_custom',place:'shop',title:'Customize deck sleeves',tag:'creative',tone:'friendship',focus:6,credits:5,detail:'Make a personalized deck case and trade design ideas.'},
  {id:'arcade_highscore',place:'arcade',title:'Challenge the high score',tag:'competitive',tone:'rivalry',focus:12,credits:6,detail:'Try to beat each other at a rhythm and reflex challenge.'},
  {id:'arcade_coop',place:'arcade',title:'Play a chaotic co-op game',tag:'playful',tone:'friendship',focus:10,credits:6,detail:'Team up, improvise, and laugh at the resulting disaster.'},
  {id:'arcade_music',place:'arcade',title:'Make a music playlist',tag:'creative',tone:'friendship',focus:6,credits:0,detail:'Trade favorite tracks and create a soundtrack for the club.'},
  {id:'park_riverside',place:'park',title:'Take a riverside walk',tag:'quiet',tone:'friendship',focus:5,credits:0,detail:'Unwind by the waterfront and talk about things beyond the circuit.'},
  {id:'park_explore',place:'park',title:'Explore the waterfront',tag:'adventure',tone:'friendship',focus:10,credits:0,detail:'Visit unfamiliar corners of Neo Harbor and find a new viewpoint.'},
  {id:'park_sketch',place:'park',title:'Sketch the riverside',tag:'creative',tone:'friendship',focus:7,credits:0,detail:'Make postcard-sized drawings of the view and exchange them.'},
  {id:'cafe_trade',place:'cafe',title:'Share a favorite card story',tag:'collection',tone:'friendship',focus:5,credits:5,detail:'Tell each other which card matters most and why.'},
  {id:'cafe_break',place:'cafe',title:'Take an unhurried break',tag:'quiet',tone:'friendship',focus:5,credits:7,detail:'Share a snack and leave the tournament pressure outside.'},
  {id:'cafe_games',place:'cafe',title:'Make up a silly challenge',tag:'playful',tone:'friendship',focus:8,credits:5,detail:'Invent a harmless wager and see who cracks up first.'},
  {id:'center_scrimmage',place:'center',title:'Practice tricky openings',tag:'strategy',tone:'rivalry',focus:15,credits:0,detail:'Analyze sample hands together without starting a real duel.'},
  {id:'center_coach',place:'center',title:'Coach a beginner',tag:'community',tone:'friendship',focus:10,credits:0,detail:'Help a newer player find their own way to win.'},
  {id:'center_tactics',place:'center',title:'Study tournament tactics',tag:'competitive',tone:'rivalry',focus:12,credits:0,detail:'Debate difficult tournament decisions after the crowd leaves.'},
  {id:'library_research',place:'library',title:'Research unusual combos',tag:'strategy',tone:'rivalry',focus:10,credits:0,detail:'Compare archived deck lists and test a surprising idea on paper.'},
  {id:'library_story',place:'library',title:'Swap favorite book passages',tag:'quiet',tone:'friendship',focus:5,credits:0,detail:'Find a story worth sharing beyond the game.'},
  {id:'library_archive',place:'library',title:'Explore the old card archives',tag:'collection',tone:'friendship',focus:8,credits:0,detail:'Look through old match records and discover a forgotten card.'}
 ]);
 const ids=new Map(activities.map(x=>[x.id,Object.freeze(x)]));
 // Private preference categories are discovered through actual time spent together,
 // never advertised as success chances on the choice buttons.
 const observedLikes=Object.freeze({
  strategy:'Trying out deck ideas',community:'Helping other players',
  creative:'Making things together',competitive:'A good challenge',
  playful:'Being silly together',quiet:'Quiet time together',
  adventure:'Exploring new places',collection:'Talking about cards'
 });
 // A short scene beat grounds the spoken reaction in what the player actually did.
 const moments=Object.freeze({
  shop_deck_lab:'A few shuffled hands later, an impossible opening finally clicks.',
  shop_welcome:'The new player leaves smiling, already asking when the next match is.',
  shop_custom:'You turn the finished sleeves in the light, comparing your handiwork.',
  arcade_highscore:'The machine flashes a new score as the final notes fade.',
  arcade_coop:'The co-op run falls apart spectacularly, and neither of you can stop laughing.',
  arcade_music:'The playlist keeps growing as you take turns picking tracks.',
  park_riverside:'The river passes quietly beside you as the conversation wanders.',
  park_explore:'You find a tucked-away spot neither of you had noticed before.',
  park_sketch:'Your sketches look nothing alike, but somehow they belong together.',
  cafe_trade:'One treasured card leads to another story, and then another.',
  cafe_break:'The cups grow cold while you lose track of the time.',
  cafe_games:'Your invented rules become sillier with every round.',
  center_scrimmage:'One more practice hand turns into an argument about the best play.',
  center_coach:'The beginner pulls off a clever turn without either of you helping.',
  center_tactics:'The match notes fill with arrows, corrections, and little discoveries.',
  library_research:'A strange combo in an old deck list suddenly makes perfect sense.',
  library_story:'You pass the book back and forth, stopping at favorite passages.',
  library_archive:'A forgotten card in the archive sparks a surprisingly long conversation.'
 });
 const defaults=Object.freeze({
  hana:{favorites:['community','creative'],neutral:['quiet','collection'],voice:['Hana beams. "This is the part of the club I love most."','Hana listens closely and shares a funny story.','Hana gives it a genuine try, even if it is not her usual thing.']},
  reina:{favorites:['strategy','competitive'],neutral:['quiet','adventure'],voice:['Reina grins. "Good. Make me work for it."','Reina relaxes enough to speak without challenging you.','Reina raises an eyebrow, then decides to stay anyway.']},
  shiori:{favorites:['quiet','collection'],neutral:['strategy','creative'],voice:['Shiori smiles. "I had forgotten how much I like this."','Shiori offers a thoughtful observation you had not expected.','Shiori seems out of her element, but appreciates the invitation.']},
  yuna:{favorites:['playful','creative'],neutral:['competitive','adventure'],voice:['Yuna laughs. "That was a spectacular idea. Again!"','Yuna manages to turn the quiet moment into a joke.','Yuna tries her best and pretends the awkwardness was planned.']},
  akari:{favorites:['strategy','collection'],neutral:['competitive','quiet'],voice:['Akari adjusts her glasses. "I actually learned something."','Akari listens carefully before offering a precise answer.','Akari hesitates, then admits the change of pace was useful.']},
  camila:{favorites:['collection','creative'],neutral:['quiet','community'],voice:['Camila smiles knowingly. "Now this is a fine investment of time."','Camila trades an unexpectedly sincere observation.','Camila finds a way to make the unfamiliar activity entertaining.']},
  marina:{favorites:['quiet','adventure'],neutral:['community','creative'],voice:['Marina looks toward the river. "I am glad you asked me."','Marina smiles at the chance to share a calmer moment.','Marina gathers her courage and tries something different.']},
  kaede:{favorites:['competitive','adventure'],neutral:['playful','strategy'],voice:['Kaede smirks. "Finally, something interesting."','Kaede lets herself enjoy it without putting on a show.','Kaede laughs at herself. "Do not tell anybody about this."']}
 });
 const tags=new Set(activities.map(x=>x.tag));
 const places=new Set(activities.map(x=>x.place));
 const clamp=(v,max)=>Math.max(0,Math.min(max,Number.isFinite(v)?v:0));
 function profile(id,cast={}){
  const x=cast?.[id]?.socialProfile||defaults[id]||null;
  if(!x)return {favorites:[],neutral:[],voice:['That was a good way to spend time together.','You share a comfortable conversation.','You both find something to laugh about.']};
  const distinct=a=>Array.isArray(a)?[...new Set(a.filter(t=>tags.has(t)))].slice(0,4):[];
  return {favorites:distinct(x.favorites),neutral:distinct(x.neutral),
   voice:Array.isArray(x.voice)&&x.voice.length===3&&x.voice.every(t=>typeof t==='string'&&t.length>0)?x.voice:
    ['That was a good way to spend time together.','You share a comfortable conversation.','You both find something to laugh about.']};
 }
 function hydrate(s){
  if(!s||typeof s!=='object')throw Error('Invalid campaign state');
  if(!s.socialHistory||typeof s.socialHistory!=='object'||Array.isArray(s.socialHistory))s.socialHistory={};
  for(const [npc,h] of Object.entries(s.socialHistory)){
   if(!h||typeof h!=='object'||Array.isArray(h)||!Number.isInteger(h.lastDay)||h.lastDay<1||h.lastDay>90
     ||!tags.has(h.lastTag)||!Number.isInteger(h.count)||h.count<1){
    delete s.socialHistory[npc];continue;
   }
   h.count=Math.min(270,h.count);
   if(h.likedTags!==undefined)
    h.likedTags=Array.isArray(h.likedTags)?[...new Set(h.likedTags.filter(t=>tags.has(t)))].slice(0,8):[];
  }
  return s;
 }
 function affinity(npc,tag,cast={}){
  const p=profile(npc,cast);
  return p.favorites.includes(tag)?'favorite':p.neutral.includes(tag)?'neutral':'unfamiliar';
 }
 // Pure projection: can show hints from past saves without changing any saved data.
 function learnedLikes(s,npc,cast={}){
  const h=s?.socialHistory?.[npc];
  if(!h||!Number.isInteger(h.count)||h.count<1)return [];
  const p=profile(npc,cast),seen=new Set(Array.isArray(h.likedTags)?h.likedTags:[]);
  // Older saves remember only the last outing. Recognize that one, but don't
  // invent any other knowledge about the character's preferences.
  if(p.favorites.includes(h.lastTag))seen.add(h.lastTag);
  return p.favorites.filter(t=>seen.has(t)).map(tag=>({tag,label:observedLikes[tag]}));
 }
 function options(s,npc,present=[],cast={}){
  if(!s||!Number.isInteger(s.day)||s.day<1||s.day>90||!Number.isInteger(s.slot)||s.slot<0||s.slot>2
     ||!places.has(s.location)||!cast[npc]||!present.includes(npc))return [];
  const spent=!!s.hungOut?.[s.day+':'+npc];
  const reserved=!!(s.pendingDuel||s.activeStory||s.activeSideQuest||s.activeEncounter||s.activeArc);
  return activities.filter(x=>x.place===s.location).map(a=>{
   const disabledReason=reserved?'Finish your current scene first':spent?'Already spent time together today':
    (s.focus||0)<a.focus?'Not enough focus':(s.credits||0)<a.credits?'Not enough credits':null;
   return {...a,affinity:affinity(npc,a.tag,cast),disabledReason};
  });
 }
 function complete(s,npc,activityId,present=[],cast={}){
  const a=ids.get(activityId);
  if(!a||!cast[npc])throw Error('Unknown shared activity or character');
  const available=options(s,npc,present,cast).find(x=>x.id===activityId);
  if(!available)throw Error('This activity is not available here and now');
  if(available.disabledReason)throw Error(available.disabledReason);
  hydrate(s);
  const rel=s.relationships||(s.relationships={});
  const bonds=s.bonds||(s.bonds={});
  const r=rel[npc]||(rel[npc]={affection:0,trust:0,respect:0,attraction:0,duels:0});
  const b=bonds[npc]||(bonds[npc]={affection:0,trust:0,duels:0});
  const rating=available.affinity,previous=s.socialHistory[npc];
  const repeated=!!previous&&previous.lastTag===a.tag&&previous.lastDay>=s.day-3;
  // The player can always choose a favorite outing, but alternating activities
  // helps prevent one repetitive route from outperforming all others.
  const affinityBoost=rating==='favorite'&&!repeated;
  const affection=rating==='favorite'?(repeated?1:2):1;
  const trust=rating==='unfamiliar'||repeated?0:1;
  const respect=a.tone==='rivalry'?(affinityBoost?2:1):0;
  const insight=affinityBoost&&!repeated&&a.tone==='rivalry'?1:0;
  s.focus=clamp((s.focus||0)-a.focus,100);
  s.credits=clamp((s.credits||0)-a.credits,999999);
  s.insight=clamp((s.insight||0)+insight,99);
  REL.apply(s,npc,{affection,trust,respect});
  s.hungOut=s.hungOut||{};
  s.hungOut[s.day+':'+npc]=true;
  const likedTags=Array.isArray(previous?.likedTags)?previous.likedTags.filter(t=>tags.has(t)):[];
  if(rating==='favorite'&&!likedTags.includes(a.tag))likedTags.push(a.tag);
  s.socialHistory[npc]={lastDay:s.day,lastTag:a.tag,lastActivity:a.id,count:(previous?.count||0)+1,likedTags};
  return {npc,activityId:a.id,title:a.title,affinity:rating,repeated,tag:a.tag,tone:a.tone,
   affection,trust,respect,insight,focusCost:a.focus,creditCost:a.credits,
   line:(moments[a.id]||'You share a moment away from the tournament rush.')+' '+profile(npc,cast).voice[rating==='favorite'&&!repeated?0:rating==='unfamiliar'?2:1]};
 }
 function validate(){
  const errors=[],seen=new Set();
  for(const a of activities){
   if(seen.has(a.id))errors.push('Duplicate '+a.id);seen.add(a.id);
   if(!moments[a.id]||moments[a.id].length<35)errors.push('Missing activity moment '+a.id);
   if(!places.has(a.place)||!tags.has(a.tag)||!['friendship','rivalry'].includes(a.tone)
    ||!Number.isInteger(a.focus)||a.focus<0||!Number.isInteger(a.credits)||a.credits<0||!a.detail)errors.push('Invalid '+a.id);
  }
  for(const [id,p] of Object.entries(defaults)){
   if(p.favorites.length<2||!p.favorites.every(x=>tags.has(x))||!p.neutral.every(x=>tags.has(x))
     ||p.favorites.some(x=>p.neutral.includes(x))||p.voice.length!==3)errors.push('Invalid profile '+id);
  }
  return errors;
 }
 return Object.freeze({activities,defaults,profile,options,complete,hydrate,affinity,learnedLikes,validate});
});
