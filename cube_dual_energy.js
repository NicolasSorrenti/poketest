'use strict';
// Classic-era Dual Energy draft. No external expansion is admitted until its
// attacks/Powers have been explicitly ported and registered by the duel engine.
// Every physical copy uses the same printing; non-dual Basics are permitted
// only as evolution support and consistency pieces.
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,canEvolve}=require('./core_rules');
const {eligibleIds,supported}=require('./cube_draft');
const {CHRONOLOGY}=require('./cube_printings');
const {TYPES}=require('./cube_strategy');

const COLORS=new Set(TYPES);
const ERA=new Map(CHRONOLOGY.map((name,i)=>[name,i]));
const SIZE=240, POKEMON=156, BASIC_SLOTS=103, TRAINER_SLOTS=SIZE-POKEMON;
const isPayable=a=>(a.cost||[]).every(type=>type==='Colorless'||COLORS.has(type));
function attackColors(c){
 return [...new Set((c.attacks||[]).filter(isPayable)
  .flatMap(a=>(a.cost||[]).filter(t=>COLORS.has(t))))];
}
function isDualAttacker(c){return attackColors(c).length===2;}
function isEnergySynergy(c){
 // Neo Genesis Lanturn's Water bonus comes from its Power; its printed
 // attack only requires Lightning. Do not infer other Powers from keywords.
 return c.id==='neo1-38'&&
  (c.abilities||[]).some(a=>a.name==='Hydroelectric Power');
}
const isFocus=c=>isDualAttacker(c)||isEnergySynergy(c);
const nameKey=c=>c.supertype+'\0'+String(c.name).trim().toLowerCase();
function choosePrinting(all,known){
 const byName=new Map();
 for(const id of all){
  const c=CATALOG.get(id),key=nameKey(c),old=byName.get(key);
  const grade=x=>{
   const card=CATALOG.get(x);
   return (card.supertype==='Pokémon'&&isFocus(card)?100:0)+
    (known.has(x)?10:0);
  };
  const chronology=id=>ERA.get(id.split('-')[0])??999;
  if(!old||grade(id)>grade(old)||
     (grade(id)===grade(old)&&(chronology(id)<chronology(old)||
      (chronology(id)===chronology(old)&&id.localeCompare(old)<0))))
   byName.set(key,id);
 }
 return [...byName.values()].sort();
}
function sourcePool(){
 const known=new Set(eligibleIds());
 // Compiler + Power-registry checks gate all new choices. Only cards in
 // historically supported Base–Neo sets are candidates at this stage.
 const all=[...CATALOG.keys()].filter(id=>ERA.has(id.split('-')[0])&&
  supported(id)&&CATALOG.get(id).supertype!=='Energy'&&
  (CATALOG.get(id).supertype!=='Pokémon'||
   (CATALOG.get(id).attacks||[]).some(isPayable)));
 const chosen=choosePrinting(all,known);
 const pokemon=chosen.filter(id=>CATALOG.get(id).supertype==='Pokémon');
 // Trainers remain restricted to the theme-tested pool, even when the attack
 // compiler exposes additional Pokémon.
 const trainers=choosePrinting([...known].filter(id=>CATALOG.get(id)?.supertype==='Trainer'),known);
 return {pokemon,trainers};
}
let cachedDualPool=null;
function makeDualEnergyPool(){
 if(cachedDualPool)return [...cachedDualPool];
 const {pokemon,trainers}=sourcePool();
 const basics=pokemon.filter(id=>isBasicPokemon(CATALOG.get(id)));
 const evolutions=pokemon.filter(id=>!isBasicPokemon(CATALOG.get(id)));
 const focused=pokemon.filter(id=>isFocus(CATALOG.get(id)));
 const root=id=>evolutions.some(e=>isFocus(CATALOG.get(e))&&
  canEvolve(CATALOG.get(e),CATALOG.get(id)));
 if(focused.length<4||basics.length<26||trainers.length<15)
  throw Error('Insufficient engine-supported cards for Dual Energy Cube');
 const selected=[],copies=new Map(),cap=4;
 const count=id=>copies.get(id)||0;
 function add(id){
  if(count(id)>=cap)return false;
  selected.push(id);copies.set(id,count(id)+1);return true;
 }
 const kindCount=(fn)=>selected.filter(fn).length;
 const basicTotal=()=>kindCount(id=>CATALOG.get(id).supertype==='Pokémon'&&isBasicPokemon(CATALOG.get(id)));
 const evoTotal=()=>kindCount(id=>CATALOG.get(id).supertype==='Pokémon'&&!isBasicPokemon(CATALOG.get(id)));
 const strength=id=>Number(CATALOG.get(id).hp)||0;
 const typeOf=id=>attackColors(CATALOG.get(id))[0]||
  (CATALOG.get(id).types||[]).find(t=>COLORS.has(t))||'Colorless';
 const basicColorCount=color=>selected.filter(id=>isBasicPokemon(CATALOG.get(id))&&typeOf(id)===color).length;
 function pick(items,weight){
  const choices=items.filter(id=>count(id)<cap);
  if(!choices.length)return null;
  choices.sort((a,b)=>{
   const diff=weight(b)-weight(a);
   return diff||a.localeCompare(b);
  });
  add(choices[0]);return choices[0];
 }
 // Guarantee each of the six primary colors has a playable starting Basic.
 for(const color of TYPES){
  const lane=basics.filter(id=>typeOf(id)===color);
  if(lane.length)pick(lane,id=>isFocus(CATALOG.get(id))?10:1);
 }
 // Seed supporting Basics before adding evolved payoffs. All evolution cards
 // must have a legal parent somewhere in the final cube pool.
 for(const id of basics.filter(id=>isFocus(CATALOG.get(id))||root(id))){
  if(basicTotal()<BASIC_SLOTS)add(id);
 }
 while(basicTotal()<BASIC_SLOTS){
  const next=pick(basics,id=>{
   const c=CATALOG.get(id);
   const focusedBonus=isFocus(c)?32:root(id)?22:3;
   const cheap=(c.attacks||[]).some(a=>isPayable(a)&&(a.cost||[]).length<=2)?4:0;
   const colorPenalty=basicColorCount(typeOf(id))*0.65;
   return focusedBonus+cheap+Math.min(3,strength(id)/50)-count(id)*6-colorPenalty;
  });
  if(!next)throw Error('Insufficient distinct playable Basics for Dual Energy Cube');
 }
 // Seed all reachable dual-type evolutions, then give their families multiple
 // physical copies; backfill with legitimate sibling evolutions as required.
 for(const id of evolutions.filter(id=>isFocus(CATALOG.get(id)))){
  if(evoTotal()>=POKEMON-BASIC_SLOTS)break;
  if(selected.some(p=>canEvolve(CATALOG.get(id),CATALOG.get(p))))add(id);
 }
 while(evoTotal()<POKEMON-BASIC_SLOTS){
  const possible=evolutions.filter(id=>selected.some(parent=>
   canEvolve(CATALOG.get(id),CATALOG.get(parent))));
  const next=pick(possible,id=>{
   const c=CATALOG.get(id);
   const parentCopies=selected.filter(p=>canEvolve(c,CATALOG.get(p))).length;
   return (isFocus(c)?55:8)+Math.min(4,parentCopies)*2-
    count(id)*9-Math.max(0,strength(id)-100)/5;
  });
  if(!next)throw Error('Insufficient playable evolution chains for Dual Energy Cube');
 }
 if(selected.length!==POKEMON)throw Error('Dual Energy Pokémon quota mismatch');
 for(let i=0;i<TRAINER_SLOTS;i++){
  const next=pick(trainers,id=>{
   const name=CATALOG.get(id).name;
   const utility=/Bill|Oak|Elm|Search|Gust|Switch|Computer|Energy Retrieval|Trader|Breeder|Potion|Maintenance/i.test(name)?15:6;
   return utility-count(id)*3;
  });
  if(!next)throw Error('Insufficient supported Trainers for Dual Energy Cube');
 }
 if(selected.length!==SIZE)throw Error('Dual Energy cube size mismatch');
 // Fixed order; the normal draft shuffler randomizes packs from this set.
 cachedDualPool=Object.freeze([...selected]);
 return [...cachedDualPool];
}
module.exports={makeDualEnergyPool,isDualAttacker,isEnergySynergy,isFocus,attackColors,sourcePool};
