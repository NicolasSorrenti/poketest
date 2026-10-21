'use strict';
// EXPERIMENT ONLY. No production NPC recipe is changed by this module.
// Candidate substitutions preserve 60-card size and all printed card behavior.
const NPC=require('../rpg_npc_deck_progression');
const VARIANTS=Object.freeze({
 reina:['baseline','soft-ace','soft-disruption','measured-hybrid','gentle-denial','fair-rival','no-lock'],
 yuna:['baseline','electabuzz-pair','electabuzz-trio','psychic-lightning'],
 camila:['baseline','muk-tempo','weezing-tempo','rocket-hybrid']
});
function candidate({npc,tier,original,catalog,variant='baseline'}){
 if(!VARIANTS[npc]?.includes(variant))throw Error('Unknown candidate '+npc+'/'+variant);
 const base=NPC.baselineUpgrade({npc,tier,original,catalog}),cards=[...base];
 if(tier===1||variant==='baseline')return cards;
 function swap(from,to,n=1){
  if(!catalog.has(from)||!catalog.has(to))throw Error('Unknown printed Pokémon card '+from+' / '+to);
  for(let i=0;i<n;i++){
   const index=cards.indexOf(from);
   if(index<0)throw Error('Candidate '+npc+'/'+variant+' lacks '+from);
   const name=catalog.get(to).name;
   if(catalog.get(to).supertype!=='Energy'&&cards.filter(id=>catalog.get(id)?.name===name).length>=4)throw Error('Candidate exceeds four '+name);
   cards[index]=to;
  }
 }
 if(npc==='reina'){
  if(variant==='soft-ace'||variant==='measured-hybrid')swap('base1-7','base1-56'); // Hitmonchan -> Onix
  if(variant==='soft-disruption'){
   swap('base1-92','base1-95'); // Energy Removal -> Switch
   swap('base1-79','base1-94'); // Super Energy Removal -> Potion
  }
  if(variant==='measured-hybrid')swap('base1-92','base1-95');
  if(['gentle-denial','fair-rival','no-lock'].includes(variant)){
   if(variant!=='no-lock')swap('base1-7','base1-56'); // Retain at least one Hitmonchan.
   swap('base1-92','base1-95'); // Replace one denial card with retreat counterplay.
   swap('base1-92','base1-94'); // Replace another with healing.
   if(variant==='fair-rival'||variant==='no-lock')
    swap('base1-79','base1-80'); // Super Removal -> Defender, not more raw damage.
  }
 }else if(npc==='yuna'){
  if(variant==='electabuzz-pair'||variant==='electabuzz-trio'||variant==='psychic-lightning')
   swap('base1-58','base1-20',2); // Pikachu -> Electabuzz, Lightning cost remains payable
  if(variant==='electabuzz-trio')swap('base1-53','base1-20'); // Magnemite -> third Electabuzz
  if(variant==='psychic-lightning')swap('base1-53','base1-31'); // Magnemite -> third Jynx
 }else if(npc==='camila'){
  if(variant==='muk-tempo'||variant==='rocket-hybrid')swap('base5-25','base5-41'); // Gyarados -> Muk
  if(variant==='weezing-tempo')swap('base5-25','base5-31',2); // Gyarados -> Weezing
  if(variant==='rocket-hybrid')swap('base5-25','base5-31'); // one of each
  swap('base1-102','base1-99',2); // Water -> Grass: 7+ basic Energy remain
 }
 return cards;
}
module.exports={VARIANTS,candidate};
