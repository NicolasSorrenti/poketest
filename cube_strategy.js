'use strict';
// Limited-format AI: prefers low-color-cost attackers, coherent evolution chains,
// consistent Energy and useful Trainers over raw Pokémon rarity/HP.
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,isBasicEnergy,canEvolve}=require('./core_rules');
const {validateBuild}=require('./cube_draft');
const TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting']);
const BASIC_ENERGY=Object.freeze(Object.fromEntries(TYPES.map(type=>{
 const card=[...CATALOG.values()].find(c=>c.name===type+' Energy'&&isBasicEnergy(c));
 if(!card)throw Error('Missing Basic Energy: '+type);
 return [type,card.id];
})));
const card=id=>CATALOG.get(id);
const pokemon=id=>card(id)?.supertype==='Pokémon';
const costs=c=>(c?.attacks||[]).map(a=>(a.cost||[]).filter(t=>t!=='Colorless'));
function usableAttacks(c,colors){
 return (c?.attacks||[]).filter(a=>(a.cost||[]).every(t=>t==='Colorless'||colors.includes(t)));
}
function requiredTypes(c){
 const valid=costs(c).filter(row=>row.every(t=>TYPES.includes(t)));
 valid.sort((a,b)=>a.length-b.length);
 return valid[0]||[];
}
function coverageScore(c,colors){
 const viable=usableAttacks(c,colors);
 return viable.length?6+Math.max(0,4-Math.min(...viable.map(a=>(a.cost||[]).length))):c?.abilities?.length?1:-7;
}
function colorPlan(picks){
 const basics=picks.filter(id=>pokemon(id)&&isBasicPokemon(card(id)));
 if(!basics.length)return ['Fighting'];
 const plans=TYPES.flatMap((a,i)=>[ [a],...TYPES.slice(i+1).map(b=>[a,b]) ]);
 const ranked=plans.map(colors=>{
  let score=0;
  for(const id of basics){
   const c=card(id),req=requiredTypes(c),fits=req.every(t=>colors.includes(t));
   score+=fits?1+coverageScore(c,colors)*0.65:-2;
  }
  for(const id of picks.filter(x=>pokemon(x)&&!isBasicPokemon(card(x)))){
   const c=card(id);
   if(basics.some(x=>canEvolve(c,card(x)))&&requiredTypes(c).every(t=>colors.includes(t)))score+=2;
  }
  // Avoid splashing into a second color unless it unlocks several useful cards.
  if(colors.length===2)score-=5;
  return {colors,score};
 }).sort((a,b)=>b.score-a.score||a.colors.join().localeCompare(b.colors.join()));
 return ranked[0].colors;
}
function score(id,picks){
 const c=card(id);
 if(!c)return -Infinity;
 const name=c.name||'',seen=picks.map(card),basics=seen.filter(isBasicPokemon);
 if(c.supertype==='Trainer'){
  const trainers=seen.filter(x=>x.supertype==='Trainer').length;
  return 7+(trainers<12?2:0)+(/Bill|Oak|Elm|Search|Gust|Switch|Potion|Energy Retrieval|Computer/i.test(name)?4:0);
 }
 const colors=colorPlan(picks),family=seen.some(x=>canEvolve(c,x));
 const related=seen.filter(x=>x.types?.some(t=>c.types?.includes(t))).length;
 let result=isBasicPokemon(c)?11:family?12:2;
 if(basics.length<8&&isBasicPokemon(c))result+=7;
 if(!isBasicPokemon(c)&&!family)result-=8;
 result+=coverageScore(c,colors);
 result+=Math.min(5,related)*0.7;
 if(seen.some(x=>canEvolve(x,c)))result+=6;
 if(seen.filter(x=>x.name===name).length>=4)result-=9;
 return result;
}
function cpuPick(ids,picks){
 if(!Array.isArray(ids)||!ids.length)throw Error('CPU pack is empty');
 return [...ids].sort((a,b)=>score(b,picks)-score(a,picks)||a.localeCompare(b))[0];
}
function buildCpuDeck(picks){
 if(!Array.isArray(picks)||!picks.length)throw Error('CPU has no drafted cards');
 const basics=picks.filter(id=>pokemon(id)&&isBasicPokemon(card(id)));
 if(!basics.length)throw Error('CPU drafted no Basic Pokémon');
 const colors=colorPlan(picks),selected=[],used=new Map(),names=new Map();
 const owned=new Map();
 for(const id of picks)owned.set(id,(owned.get(id)||0)+1);
 function add(id){
  if(selected.length>=25||!owned.has(id)||(used.get(id)||0)>=owned.get(id))return false;
  const c=card(id),name=c.name;
  if((names.get(name)||0)>=4)return false;
  selected.push(id);used.set(id,(used.get(id)||0)+1);
  names.set(name,(names.get(name)||0)+1);return true;
 }
 const hasViable=id=>usableAttacks(card(id),colors).length>0||!!card(id).abilities?.length;
 const affinity=id=>{
  const c=card(id),req=requiredTypes(c);
  return coverageScore(c,colors)+(req.every(x=>colors.includes(x))?5:-8)
   +Math.min(140,Number(c.hp)||0)/80;
 };
 const sortedBasics=[...basics].sort((a,b)=>affinity(b)-affinity(a)||a.localeCompare(b));
 for(const id of sortedBasics.filter(hasViable)){
  if(selected.filter(x=>isBasicPokemon(card(x))).length>=11)break;
  add(id);
 }
 if(selected.filter(x=>isBasicPokemon(card(x))).length<8){
  for(const id of sortedBasics)if(selected.filter(x=>isBasicPokemon(card(x))).length<8)add(id);
 }
 const evolutions=picks.filter(id=>pokemon(id)&&!isBasicPokemon(card(id)));
 let evolved=true;
 while(evolved){
  evolved=false;
  const sorted=[...evolutions].sort((a,b)=>affinity(b)-affinity(a)||a.localeCompare(b));
  for(const id of sorted){
   if(selected.filter(x=>!isBasicPokemon(card(x))).length>=6)break;
   if(hasViable(id)&&selected.some(x=>canEvolve(card(id),card(x)))&&add(id))evolved=true;
  }
 }
 const trainers=picks.filter(id=>card(id)?.supertype==='Trainer')
  .sort((a,b)=>score(b,selected)-score(a,selected)||a.localeCompare(b));
 for(const id of trainers){
  if(selected.filter(x=>card(x).supertype==='Trainer').length>=11||selected.length>=24)break;
  add(id);
 }
 for(const id of sortedBasics)if(selected.length<23)add(id);
 for(const id of trainers)if(selected.length<24)add(id);
 const energyCount=40-selected.length;
 const demand=Object.fromEntries(colors.map(type=>[type,1]));
 for(const id of selected.filter(pokemon)){
  const c=card(id),attack=usableAttacks(c,colors).sort((a,b)=>(a.cost||[]).length-(b.cost||[]).length)[0];
  if(!attack)continue;
  for(const t of attack.cost||[])if(demand[t]!==undefined)demand[t]+=1;
 }
 // Weighted deterministic distribution. Keep each chosen type supplied.
 const energy=[];
 for(let i=0;i<energyCount;i++){
  const best=colors.slice().sort((a,b)=>(energy.filter(x=>x===BASIC_ENERGY[a]).length/demand[a])-
    (energy.filter(x=>x===BASIC_ENERGY[b]).length/demand[b])||a.localeCompare(b))[0];
  energy.push(BASIC_ENERGY[best]);
 }
 const deck=[...selected,...energy];
 const v=validateBuild(picks,deck);
 if(!v.valid)throw Error('Cannot build CPU deck: '+v.reason);
 return deck;
}
module.exports={score,cpuPick,buildCpuDeck,colorPlan,requiredTypes,usableAttacks,ENERGY_IDS:BASIC_ENERGY,TYPES};
