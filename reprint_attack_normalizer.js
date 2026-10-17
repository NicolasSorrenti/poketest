'use strict';
// Base Set 2 physically reprints Base/Jungle/Fossil cards. TCGdex sometimes
// loses damage suffixes (10x / 20+) or records the wrong numeral. Restore the
// exact printed damage expression using the source print's attack semantics.
const base=['base1','base2','base3'].flatMap(s=>require('./cards/'+s+'.json'));
const k=v=>JSON.stringify(v);
function normalizeBase2Reprints(cards){
 let corrected=0;
 const output=cards.map(c=>{
  if(c.supertype!=='Pokémon'||!c.attacks?.length)return c;
  let changed=false;
  const attacks=c.attacks.map(a=>{
   const original=base.flatMap(other=>other.name===c.name?(other.attacks||[]).filter(o=>o.name===a.name&&k(o.cost)===k(a.cost)&&o.text===a.text).map(o=>o):[])[0];
   // Poliwrath Water Gun has an identical effect with a small printed-wording
   // variant ("Extra Energy" vs "Extra Water Energy").
   const waterGun=c.name==='Poliwrath'&&a.name==='Water Gun'?base.find(other=>other.name==='Poliwrath')?.attacks.find(o=>o.name==='Water Gun'&&k(o.cost)===k(a.cost)):null;
   const source=original||waterGun;
   if(!source||a.damage===source.damage)return a;
   corrected++;changed=true;return {...a,damage:source.damage};
  });
  return changed?{...c,attacks}:c;
 });
 return {cards:output,corrected};
}
module.exports={normalizeBase2Reprints};
