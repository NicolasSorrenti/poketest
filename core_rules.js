'use strict';
// Pure rules shared by browser, Node tests and future authoritative server.
// No DOM, randomness, player numbering or global mutable match state.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoCoreRules=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const BASIC_ENERGY=new Set(['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy']);
 const owners=["Blaine's ","Erika's ","Misty's ","Brock's ","Lt. Surge's ","Sabrina's ","Koga's ","Giovanni's ","Rocket's "];
 function isBasicEnergy(c){return Boolean(c&&BASIC_ENERGY.has(c.name)&&!c.hp&&!(c.attacks||[]).length&&!(c.abilities||[]).length);}
 function normalize(c){return isBasicEnergy(c)?{...c,supertype:'Energy',subtypes:(c.subtypes||[]).filter(x=>x!=='Basic')}:c;}
 function isEnergy(c){return Boolean(c&&(c.supertype==='Energy'||isBasicEnergy(c)));}
 function isBasicPokemon(c){return Boolean(c&&!isBasicEnergy(c)&&c.supertype==='Pokémon'&&((c.subtypes||[]).includes('Basic')||c.name==='Mysterious Fossil')&&!(c.subtypes||[]).includes('Baby'));}
 // Gender symbols and Gym printings differ in whitespace (Nidoran♂ vs Nidoran ♂).
 function speciesName(name){return String(name||'').normalize('NFKC').replace(/\s*([♂♀])\s*/g,'$1').replace(/\s+/g,' ').trim().toLocaleLowerCase('en');}
 function canEvolve(next,previous){
  if(!next||!previous)return false;
  if(previous.name==='Mysterious Fossil'&&['Kabuto','Omanyte','Aerodactyl'].includes(next.name)&&(next.subtypes||[]).includes('Stage 1'))return true;
  if(!next.evolvesFrom||!previous.name)return false;
  const owner=owners.find(prefix=>next.name?.startsWith(prefix));
  if(owner){const wanted=next.evolvesFrom.startsWith(owner)?next.evolvesFrom:owner+next.evolvesFrom;return speciesName(previous.name)===speciesName(wanted);}
  return speciesName(next.evolvesFrom)===speciesName(previous.name)||speciesName(next.evolvesFrom.replace(/^(Dark |Light )/,''))===speciesName(previous.name);
 }
 // Cost matching is a multiset operation: colored symbols must be satisfied
 // before colorless symbols, which can use ANY remaining provided energy.
 function canPayEnergy(cost,pool){
  if(!Array.isArray(cost)||!Array.isArray(pool))return false;
  let remain=[...pool];
  for(const symbol of cost){if(symbol==='Colorless')continue;let i=remain.indexOf(symbol);if(i<0)i=remain.indexOf('Any');if(i<0)return false;remain.splice(i,1);}
  return remain.length>=cost.filter(symbol=>symbol==='Colorless').length;
 }
 function legalAttachment({card,unit,energyUsed=false,round=0,pureBody=false,cardName=''}){
  if(!unit||!isEnergy(card)||energyUsed)return false;
  if(unit.energyAttachBlockUntil>=round&&unit.energyAttachBlockUntil>0)return false;
  if(pureBody&&card.name==='Water Energy'&&!(unit.energies||[]).length)return false;
  if(card.name==='Miracle Energy'&&!/^(Shining|Light) /i.test(cardName))return false;
  return true;
 }
 function setupCandidates(hand,lookup){return hand.map((id,index)=>({id,index})).filter(({id})=>isBasicPokemon(lookup.get(id)));}
 function validateDeck(deck,lookup,{size=60,maxCopies=4}={}){
  const errors=[];
  if(!Array.isArray(deck))return {valid:false,errors:['Deck must be an array']};
  if(deck.length!==size)errors.push(`Deck must contain ${size} cards (has ${deck.length})`);
  const counts=new Map();let basics=0;
  for(const id of deck){const card=lookup.get(id);if(!card){errors.push(`Unknown card: ${id}`);continue;}
   if(isBasicPokemon(card))basics++;
   if(isBasicEnergy(card))continue;
   const key=card.name;counts.set(key,(counts.get(key)||0)+1);
  }
  for(const [name,n] of counts)if(n>(name==='Miracle Energy'?1:maxCopies))errors.push(`Too many copies of ${name}: ${n}`);
  if(!basics)errors.push('Deck needs at least one Basic Pokémon');
  return {valid:!errors.length,errors,basicCount:basics};
 }
 function countCards(player){
  const units=[player.active,...(player.bench||[])].filter(Boolean);
  return (player.deck||[]).length+(player.hand||[]).length+(player.prizes||[]).length+(player.discard||[]).length+(player.stadium?1:0)+units.reduce((n,u)=>n+1+(u.under||[]).length+(u.energies||[]).length+(u.attachedTrainers||[]).length,0);
 }
 return Object.freeze({isBasicEnergy,normalize,isEnergy,isBasicPokemon,canEvolve,speciesName,canPayEnergy,legalAttachment,setupCandidates,validateDeck,countCards});
});
