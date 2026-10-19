'use strict';
// Character deck collaboration. Never changes Classic rules or the player's own deck.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgPartnerDecks=api;})(typeof window!=='undefined'?window:null,function(){
 const count=ids=>{const counts={};for(const id of ids||[])counts[id]=(counts[id]||0)+1;return counts;};
 function unlocked(state,id){
  if(typeof id!=='string'||!/^[a-z][a-z0-9_]*$/.test(id))return false;
  const completed=state?.storyDone||{};
  // The four milestones use these stable IDs for both hand-authored and JSON-pack cast.
  return ['route','guest','bond'].some(kind=>!!completed[id+'_'+kind+'_1']&&!!completed[id+'_'+kind+'_2']);
 }
 function pool(original,owned,catalog){
  const initial=count(original),limits={};
  const index=catalog instanceof Map?catalog:new Map((catalog||[]).map(c=>[c.id,c]));
  for(const id of new Set([...Object.keys(initial),...Object.keys(owned||{})])){
   if(!index.has(id))continue;
   const card=index.get(id),amount=(initial[id]||0)+Math.max(0,Number(owned?.[id])||0);
   const basicEnergy=card.supertype==='Energy'&&/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Double Colorless) Energy$/i.test(card.name||'')&&!/Double Colorless/i.test(card.name);
   limits[id]=Math.min(basicEnergy?60:4,amount);
  }
  return limits;
 }
 function protectedCard(original,catalog,preferred){
  const tally=count(original),index=catalog instanceof Map?catalog:new Map((catalog||[]).map(c=>[c.id,c]));
  if(tally[preferred]>0&&index.get(preferred)?.supertype==='Pokémon')return preferred;
  const pokemon=Object.keys(tally).filter(id=>index.get(id)?.supertype==='Pokémon');
  pokemon.sort((a,b)=>{
   const score=id=>{const c=index.get(id),stage=(c.subtypes||[]).some(s=>s==='Stage 2')?2:(c.subtypes||[]).some(s=>s==='Stage 1')?1:0;
    return stage*1000+(Number(c.hp)||0)*2+((c.rarity||'').toLowerCase().includes('rare')?100:0)+tally[id];};
   return score(b)-score(a)||a.localeCompare(b);
  });
  return pokemon[0]||null;
 }
 function check(deck,{original,owned={},catalog,signature}){
  const errors=[];
  if(!Array.isArray(deck)||deck.length!==60)errors.push('Your partner must have exactly 60 cards.');
  if(!Array.isArray(original)||original.length!==60)errors.push('Could not verify the original partner deck.');
  const index=catalog instanceof Map?catalog:new Map((catalog||[]).map(c=>[c.id,c])),limits=pool(original,owned,index);
  const base=count(original),qty=count(Array.isArray(deck)?deck:[]);
  const nameCount={};let basics=0;
  for(const [id,n] of Object.entries(qty)){
   const c=index.get(id);
   if(!c){errors.push('Unknown partner card '+id);continue;}
   if(n>(limits[id]||0))errors.push('Not enough copies of '+c.name+' available to your partner.');
   if(c.supertype==='Pokémon'&&(c.subtypes||[]).some(s=>s==='Basic'||s==='Baby'))basics+=n;
   const basicEnergy=c.supertype==='Energy'&&/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/i.test(c.name||'');
   if(!basicEnergy)nameCount[c.name]=(nameCount[c.name]||0)+n;
  }
  for(const [name,n] of Object.entries(nameCount))if(n>4)errors.push('Four-copy rule exceeded for '+name+'.');
  if(!basics)errors.push('Keep at least one Basic Pokémon.');
  const originalKept=Object.entries(qty).reduce((n,[id,amount])=>n+Math.min(amount,base[id]||0),0);
  if(originalKept<30)errors.push('Keep at least 30 cards from your partner’s original deck.');
  if(!signature||!base[signature]||!qty[signature])errors.push('Keep your partner’s protected signature Pokémon.');
  return {valid:errors.length===0,errors,originalKept,limits,signature,basics};
 }
 function get(state,npc,original,owned,catalog,preferred){
  const signature=protectedCard(original,catalog,preferred),saved=state?.partnerDecks?.[npc];
  const validSaved=saved&&saved.source===state?.partnerDeckSources?.[npc]&&Array.isArray(saved.cards)&&
   check(saved.cards,{original,owned,catalog,signature}).valid;
  return {cards:validSaved?[...saved.cards]:[...original],signature,validSaved:!!validSaved};
 }
 function save(state,npc,source,cards,{original,owned,catalog,signature}){
  if(!unlocked(state,npc))throw Error('Complete two relationship chapters before editing this character’s deck.');
  if(typeof source!=='string'||!source)throw Error('Missing character theme deck.');
  const status=check(cards,{original,owned,catalog,signature});
  if(!status.valid)throw Error(status.errors[0]);
  if(!state.partnerDecks||typeof state.partnerDecks!=='object'||Array.isArray(state.partnerDecks))state.partnerDecks={};
  if(!state.partnerDeckSources||typeof state.partnerDeckSources!=='object'||Array.isArray(state.partnerDeckSources))state.partnerDeckSources={};
  state.partnerDecks[npc]={source,cards:[...cards]};
  state.partnerDeckSources[npc]=source;
  return [...cards];
 }
 function snapshot(state,npc,source){
  if(!unlocked(state,npc))return null;
  const saved=state?.partnerDecks?.[npc];
  if(!saved||saved.source!==source||state.partnerDeckSources?.[npc]!==source||!Array.isArray(saved.cards)||saved.cards.length!==60||
   saved.cards.some(id=>typeof id!=='string'||!/^([a-z0-9]+)-\d+$/.test(id)))return null;
  return [...saved.cards];
 }
 return Object.freeze({unlocked,pool,protectedCard,check,get,save,snapshot,count});
});
