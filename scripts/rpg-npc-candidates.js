'use strict';
// Experiment-only substitutions layered on the authored RPG recipes.
// Production always uses the deterministic recipe in rpg_npc_deck_progression.
const NPC=require('../rpg_npc_deck_progression');
const VARIANTS=Object.freeze({
 reina:['baseline','soft-ace','soft-disruption','measured-hybrid','gentle-denial','fair-rival','no-lock'],
 yuna:['baseline','electabuzz-pair','electabuzz-trio','psychic-lightning'],
 camila:['baseline','muk-tempo','weezing-tempo','rocket-hybrid']
});
function candidate({npc,tier,original,catalog,variant='baseline'}){
 if(!VARIANTS[npc]?.includes(variant))throw Error('Unknown candidate '+npc+'/'+variant);
 const cards=[...NPC.recipeFor({npc,tier,original,catalog})];
 if(tier===1||variant==='baseline')return cards;
 function swap(from,to,n=1){
  if(!catalog.has(from)||!catalog.has(to))throw Error('Unknown printed card '+from+' / '+to);
  for(let i=0;i<n;i++){
   const index=cards.indexOf(from);if(index<0)throw Error('Candidate '+npc+'/'+variant+' lacks '+from);
   const next=catalog.get(to),name=next.name;
   if(next.supertype!=='Energy'&&cards.filter(id=>catalog.get(id)?.name===name).length>=4)throw Error('Candidate exceeds four '+name);
   cards[index]=to;
  }
 }
 if(npc==='reina'){
  if(['soft-ace','measured-hybrid'].includes(variant))swap('base1-7','base3-7');
  if(['soft-disruption','measured-hybrid','gentle-denial','fair-rival','no-lock'].includes(variant))swap('base1-92','base1-95');
  if(variant==='soft-disruption')swap('base1-79','base1-94');
  if(variant==='measured-hybrid')swap('base1-84','base1-82');
  if(variant==='gentle-denial')swap('base1-84','base1-82');
  if(variant==='fair-rival')swap('base1-79','base1-89');
  if(variant==='no-lock')swap('base1-79','base1-95');
 }else if(npc==='yuna'){
  if(variant==='electabuzz-pair'||variant==='electabuzz-trio')swap('neo1-12','base1-20',2);
  if(variant==='psychic-lightning')swap('neo1-12','base1-31',2);
 }else if(npc==='camila'){
  if(variant==='muk-tempo')swap('base5-73','base1-79');
  if(variant==='weezing-tempo')swap('base1-84','base5-78');
  if(variant==='rocket-hybrid'){swap('base1-84','base5-16');swap('base1-84','base1-79');}
 }
 return cards;
}
module.exports={VARIANTS,candidate};
