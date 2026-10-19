'use strict';
/* Local RPG cinematic staging only. Classic TCG session cannot be created
   until the player explicitly confirms or skips this preview. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgPreDuel=api;
})(typeof window!=='undefined'?window:null,function(){
 const lines=Object.freeze({
  hana:'All right! I checked my deck twice. This should be fun!',
  reina:'No excuses. Show me how you handle a difficult opening.',
  shiori:'Take your time. Every card tells part of a story.',
  yuna:'My opening hand is going to be legendary. Probably!',
  akari:'I have a few theories about your deck. Time to test them.',
  camila:'Every great match comes down to the choices we make.',
  marina:'The river can wait. Let us see where the cards take us.',
  kaede:'Do not hold back just because I am smiling.'
 });
 const isReady=d=>!!d&&d.preview?.phase==='ready';
 const isLaunched=d=>!!d&&(!d.preview||d.preview.phase==='launched');
 function hydrate(d){
  if(!d||typeof d!=='object')return null;
  if(!d.preview||!['ready','launched'].includes(d.preview.phase))
   d.preview={phase:'launched',index:1}; // Preserve legacy running duels.
  if(!Number.isInteger(d.preview.index)||d.preview.index<0||d.preview.index>1)d.preview.index=0;
  if(d.preview.phase==='launched')d.preview.index=1;
  return d;
 }
 function stage(d){
  if(!d||typeof d.id!=='string'||!d.id||!d.npc)throw Error('Missing duel identity');
  if(d.preview)throw Error('Duel already staged');
  d.preview={phase:'ready',index:0};
  return d;
 }
 function advance(d){
  hydrate(d);
  if(!isReady(d))return false;
  if(d.preview.index>=1)return false;
  d.preview.index=1;return true;
 }
 function launch(d){
  hydrate(d);
  if(!isReady(d))return false;
  d.preview.phase='launched';d.preview.index=1;return true;
 }
 function compatibleCG(s,d,cg){
  if(!cg?.catalog)return null;
  const affection=s.relationships?.[d.npc]?.affection??s.bonds?.[d.npc]?.affection??0;
  return cg.catalog.find(e=>e.category==='pre_duel'&&e.trigger==='before_duel'&&e.character===d.npc
   &&(!e.place||e.place===s.location)&&(e.slot===null||e.slot===s.slot)
   &&s.day>=e.startDay&&affection>=e.minAffection)||null;
 }
 function describe(s,d,{cast={},places={},cg,tournaments}={}){
  if(!d||!cast[d.npc])return null;
  const character=cast[d.npc],place=places[s.location]?.[0]||'Neo Harbor';
  const cup=tournaments?.cups?.find(c=>c.id===d.tournamentId);
  const stake=d.eventTitle?'Special event · '+d.eventTitle:
   cup?'Official tournament · '+cup.title+' · Round '+(d.tournamentRound+1):
   d.sideQuestId?'Side quest · a meaningful challenge':
   d.arcEpisode?'Personal rivalry · a decisive match':
   'Friendly challenge · an authentic Pokémon TCG duel';
  const artwork=compatibleCG(s,d,cg);
  const intro=d.eventTitle?'The crowd is gathering for '+d.eventTitle+'.':
   cup?'A tournament round awaits you. The bracket is on the line.':
   d.sideQuestId?'An unfinished promise has brought you to this duel.':
   d.arcEpisode?'This match means more than another point in the standings.':
   'You both settle in for a match at '+place+'.';
  const response=Array.isArray(character.preDuelLines)&&typeof character.preDuelLines[0]==='string'
   ?character.preDuelLines[0]:lines[d.npc]||'Ready when you are. Let us play a good match.';
  return {id:d.id,npc:d.npc,name:character.name,place,stake,artwork,
   lines:[{speaker:'Narrator',text:intro},{speaker:character.name,text:response}],
   deckLabel:character.style||'A personal deck',day:d.day,slot:d.slot};
 }
 return Object.freeze({isReady,isLaunched,hydrate,stage,advance,launch,describe,compatibleCG});
});
