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
function score(id,picks,{preset='balanced'}={}){
 const evolutionFocus=!!require('./cube_presets').getPreset(preset).evolutionFocus;
 const c=card(id);
 if(!c)return -Infinity;
 const name=c.name||'',seen=picks.map(card),basics=seen.filter(isBasicPokemon);
 const copies=seen.filter(x=>x.name===name).length;
 // More than four copies of a name cannot be played in a 40-card deck.
 if(copies>=4)return -100;
 if(c.supertype==='Trainer'){
  const trainers=seen.filter(x=>x.supertype==='Trainer').length;
  const utility=/Bill|Oak|Elm|Search|Gust|Switch|Potion|Energy Retrieval|Computer/i.test(name)?6:0;
  return 7+(trainers<12?3:trainers>=20?-5:0)+utility-
   (picks.length<15&&basics.length<5?4:0)-Math.max(0,copies-1)*2;
 }
 const basic=isBasicPokemon(c),family=seen.some(x=>canEvolve(c,x));
 // Before selecting a Basic, don't force every possible pick to Fighting.
 const colors=basics.length?colorPlan(picks):
  [...new Set(requiredTypes(c))].filter(t=>TYPES.includes(t));
 const related=seen.filter(x=>x.types?.some(t=>c.types?.includes(t))).length;
 const progress=picks.length;
 let result=basic?11:family?12:2;
 if(basic&&basics.length<8)result+=progress<25?10:16;
 if(basic&&basics.length>=14)result-=6;
 if(!basic&&!family)result-=progress<20?12:8;
 result+=coverageScore(c,colors);
 result+=Math.min(5,related)*0.7;
 // Complete evolution chains; don't spend picks on unsupported evolutions.
 if(seen.some(x=>canEvolve(x,c)))result+=8;
 if(family)result+=Math.min(6,seen.filter(x=>canEvolve(c,x)).length*2);
 if(copies>=2)result-=copies*3;
 if(progress>=42&&!basic&&!family)result-=8;
 if(evolutionFocus){
  // A Basic with no family is less attractive than a complete evolution line.
  if(basic)result+=seen.some(x=>canEvolve(x,c))?5:-5;
  else result+=family?13:-5;
  // The first copy of an evolution is more valuable than a third copy.
  if(!basic&&family&&copies===0)result+=4;
 }
 return result;
}
function cpuPick(ids,picks,{preset='balanced'}={}){
 if(!Array.isArray(ids)||!ids.length)throw Error('CPU pack is empty');
 // Cache each pack's scores: a room refresh must not re-run strategic planning
 // for the same card dozens of times inside Array.sort's comparator.
 const ranked=new Map();
 for(const id of ids)if(!ranked.has(id))ranked.set(id,score(id,picks,{preset}));
 return [...ids].sort((a,b)=>ranked.get(b)-ranked.get(a)||a.localeCompare(b))[0];
}
function buildCpuDeck(picks,{preset='balanced'}={}){
 const mayhem=preset==='mayhem';
 const evolutionFocus=!!require('./cube_presets').getPreset(preset).evolutionFocus;
 const basicTarget=mayhem?8:evolutionFocus?8:11,minimumBasics=mayhem?7:evolutionFocus?7:8;
 const evolutionTarget=mayhem?3:evolutionFocus?9:6,trainerTarget=mayhem?16:evolutionFocus?10:11;
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
  if(selected.filter(x=>isBasicPokemon(card(x))).length>=basicTarget)break;
  add(id);
 }
 if(selected.filter(x=>isBasicPokemon(card(x))).length<minimumBasics){
  for(const id of sortedBasics)if(selected.filter(x=>isBasicPokemon(card(x))).length<minimumBasics)add(id);
 }
 const evolutions=picks.filter(id=>pokemon(id)&&!isBasicPokemon(card(id)));
 let evolved=true;
 while(evolved){
  evolved=false;
  const sorted=[...evolutions].sort((a,b)=>affinity(b)-affinity(a)||a.localeCompare(b));
  for(const id of sorted){
   if(selected.filter(x=>!isBasicPokemon(card(x))).length>=evolutionTarget)break;
   if(hasViable(id)&&selected.some(x=>canEvolve(card(id),card(x)))&&add(id))evolved=true;
  }
 }
 const trainers=picks.filter(id=>card(id)?.supertype==='Trainer')
  .sort((a,b)=>score(b,selected,{preset})-score(a,selected,{preset})||a.localeCompare(b));
 for(const id of trainers){
  if(selected.filter(x=>card(x).supertype==='Trainer').length>=trainerTarget||selected.length>=24)break;
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
