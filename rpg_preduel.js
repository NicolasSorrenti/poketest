'use strict';
/* Local RPG cinematic staging only. Classic TCG session cannot be created
   until the player explicitly confirms or skips this preview. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgPreDuel=api;
})(typeof window!=='undefined'?window:null,function(){
 const lines=Object.freeze({
  "hana": "Hey, could you cut my deck? I lost count shuffling again.",
  "reina": "Don't show me the same opening as last time. I already have an answer.",
  "shiori": "I brought the list you asked about. Shall we?",
  "yuna": "Good news: I fixed the combo. Bad news: you'll have to see how.",
  "akari": "I changed three cards. I'd rather you found out which ones.",
  "camila": "One match, no favors. We can discuss the damage afterward.",
  "marina": "I checked the sleeves twice. Ready when you are.",
  "kaede": "You get first cut. I don't want to hear excuses later.",
  "jun": "I've finished checking the rules. Ready when you are.",
  "teo": "I have a dramatic opening prepared. It's just a normal shuffle.",
  "iris": "I've got one hour before the next delivery. Better make it count.",
  "elio": "I fixed the Energy count. At least, I think I did. Want to see?",
  "alma": "The café's covered. Now I can actually play a game.",
  "nereo": "Ferry's on time for once. Let's see if my deck is.",
  "jinx": "Careful with that first turn. I'm not going easy on you.",
  "luna": "My deck's sleeved properly this time. I even counted everything.",
  "sol": "I promise: no surprise house rules. Just a surprise deck.",
  "rina": "Got two hours until rehearsal. Come on, cut the deck.",
  "elena": "I've cleared the afternoon. Shall we begin?",
  "sierra": "The shoot ended early. I brought a deck, not a camera."
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
 function describe(s,d,{cast={},places={},cg,tournaments,reactivity}={}){
  if(!d||!cast[d.npc])return null;
  const character=cast[d.npc],place=places[s.location]?.[0]||'Neo Harbor';
  const cup=tournaments?.cups?.find(c=>c.id===d.tournamentId);
  const stake=d.competitiveTitle?'Local circuit · '+d.competitiveTitle:
   d.eventTitle?'Special event · '+d.eventTitle:
   cup?'Official tournament · '+cup.title+' · Round '+(d.tournamentRound+1):
   d.sideQuestId?'Side quest · a meaningful challenge':
   d.arcEpisode?'Personal rivalry · a decisive match':
   'Friendly challenge · an authentic Pokémon TCG duel';
  const artwork=compatibleCG(s,d,cg);
  // Two short, context-sensitive visual beats, never a summary of what the player feels.
  const intro=d.competitiveKind==='daily'?'A daily challenge has brought you to the table. Your opponent is already shuffling.':
   d.competitiveKind==='local'?'The local tables are filling up. A judge calls the next pairing.':
   d.eventTitle?'The sign for '+d.eventTitle+' is up. Your opponent lays out their deck.':
   cup?'Your pairing is posted under '+cup.title+'. Someone pulls out the chair opposite you.':
   d.sideQuestId?'The promised match is here. A fresh playmat waits between the two decks.':
   d.arcEpisode?'The table is ready. Neither of you reaches for a card just yet.':
   'You settle in for a match at '+place+'. Your opponent offers their deck for a cut.';
  const response=reactivity?.preDuelLine?.(s,d)||(Array.isArray(character.preDuelLines)&&typeof character.preDuelLines[0]==='string'
   ?character.preDuelLines[0]:lines[d.npc]||'Ready when you are.');
  return {id:d.id,npc:d.npc,name:character.name,place,stake,artwork,
   lines:[{speaker:'Narrator',text:intro},{speaker:character.name,text:response}],
   deckLabel:character.style||'A personal deck',day:d.day,slot:d.slot};
 }
 return Object.freeze({isReady,isLaunched,hydrate,stage,advance,launch,describe,compatibleCG});
});
