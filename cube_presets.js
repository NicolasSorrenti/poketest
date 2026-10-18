'use strict';
// Curated drafting environments assembled exclusively from the supported
// historical theme-deck pool. No unverified imported cards are introduced.
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,canEvolve}=require('./core_rules');
const {eligibleIds}=require('./cube_draft');

const TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting']);
const PRESETS=Object.freeze([
 {id:'balanced',name:'Classic Balanced',description:'The original all-era Cube: flexible decks, six Energy types and approachable evolution lines.',archetypes:['Mixed types','Evolutions','All-round Trainers'],pokemon:156,trainers:84},
 {id:'elemental',name:'Elemental Rivals',description:'Six color lanes fight for control: Grass status, Fire aggression, Water control, Lightning tempo, Psychic tricks and Fighting pressure.',archetypes:['Grass · status','Fire · offense','Water · control','Lightning · speed','Psychic · disruption','Fighting · brawlers'],pokemon:180,trainers:60},
 {id:'neo',name:'Neo Evolution Lab',description:'Evolution-chain drafting with extra Stage 1/2 targets and a bias toward the Neo-era card printings.',archetypes:['Evolution chains','Neo-era Pokémon','Setup Trainers'],pokemon:176,trainers:64},
 {id:'rocket',name:"Rocket's Schemes",description:'A mischievous Cube favoring Rocket, Dark and Gym personalities, tricky attacks and disruptive Trainers.',archetypes:['Dark evolutions','Gym personalities','Disruption'],pokemon:160,trainers:80},
 {id:'mayhem',name:'Trainer Mayhem',description:'Plenty of draw, switching and disruptive Trainers. Basic-heavy Pokémon decks keep the action fast.',archetypes:['Trainer combos','Basic attackers','Control'],pokemon:128,trainers:112}
].map(p=>Object.freeze({...p,archetypes:Object.freeze(p.archetypes)})));
const BY_ID=Object.freeze(Object.fromEntries(PRESETS.map(p=>[p.id,p])));
function getPreset(id='balanced'){
 if(typeof id!=='string'||!Object.hasOwn(BY_ID,id))throw Error('Unknown Cube preset');
 return BY_ID[id];
}
const card=id=>CATALOG.get(id);
const typeOf=id=>{
 const c=card(id);
 const typed=(c?.types||[]).find(t=>TYPES.includes(t));
 if(typed)return typed;
 for(const a of c?.attacks||[]){
  const cost=(a.cost||[]).find(t=>TYPES.includes(t));
  if(cost)return cost;
 }
 return 'Colorless';
};
function era(id){return /^(neo[1-4])-/.test(id);}
function rocket(c,id){
 return /^(Dark |Rocket's |Giovanni's |Brock's |Misty's |Erika's |Sabrina's |Blaine's |Koga's |Lt\. Surge's )/i.test(c?.name||'')||
 /^(base5|gym1|gym2)-/.test(id);
}
function trainerSynergy(c,preset){
 const n=c?.name||'';
 if(preset==='mayhem')return /Bill|Oak|Elm|Gust|Switch|Removal|Search|Recycle|Energy Retrieval|Computer|Potion|Scoop|Item Finder|Challenge|Lass|Nightly/i.test(n)?5:2;
 if(preset==='rocket')return /Rocket|Imposter|Sneak|Chaos|Challenge|Removal|Gust|Sabrina|Giovanni|Koga|Erika|Brock|Misty/i.test(n)?6:1;
 if(preset==='neo')return /Breeder|Elm|Search|Computer|Bill|Potion|Super|Trade|Energy|Recycle/i.test(n)?5:1;
 return 1;
}
function elementalSynergy(id){
 const c=card(id),type=typeOf(id);
 const effects=(c?.attacks||[]).map(a=>(a.name||'')+' '+(a.text||'')+' '+(a.damage||'')).join(' ').toLowerCase();
 const cost=(c?.attacks||[]).map(a=>(a.cost||[]).length);
 const fastest=cost.length?Math.min(...cost):5;
 const damage=(c?.attacks||[]).reduce((m,a)=>Math.max(m,parseInt(a.damage,10)||0),0);
 if(type==='Grass')return /poison|asleep|paraly|heal|leech/.test(effects)?3:1;
 if(type==='Fire')return damage>=40?3:fastest<=2?2:1;
 if(type==='Water')return /switch|retreat|heal|bench|prevent|remove/.test(effects)?3:1;
 if(type==='Lightning')return fastest<=1?4:fastest===2?2:1;
 if(type==='Psychic')return /confus|damage counter|asleep|psychic|mind/.test(effects)?3:1;
 if(type==='Fighting')return /bench|kick|punch|smash|jab/.test(effects)||damage>=30?3:1;
 return 1;
}
function pokemonWeight(id,preset){
 const c=card(id);
 if(preset==='elemental')return elementalSynergy(id);
 if(preset==='neo')return era(id)?6:1;
 if(preset==='rocket')return rocket(c,id)?6:1;
 if(preset==='mayhem'){
  const viable=(c.attacks||[]).filter(a=>(a.cost||[]).length<=2);
  return isBasicPokemon(c)?2+Math.min(3,viable.length*2):1;
 }
 return 1;
}
function rng(seed){
 let x=seed>>>0;
 return ()=>{x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
function shuffle(values,random){
 const a=[...values];
 for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
function weightedPick(items,weight,random){
 let total=0;
 const weights=items.map(item=>Math.max(0.01,weight(item)));
 for(const w of weights)total+=w;
 let n=random()*total;
 for(let i=0;i<items.length;i++){n-=weights[i];if(n<0)return items[i];}
 return items[items.length-1];
}
function makePresetPool({preset='balanced',size=240,seed=1}={}){
 const config=getPreset(preset);
 if(config.id==='balanced')return require('./cube_draft').makePool({size,seed});
 if(!Number.isInteger(size)||size!==240)throw Error('Themed Cube presets require 240 cards');
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid Cube seed');
 const random=rng(seed);
 const all=eligibleIds();
 const pokemon=all.filter(id=>card(id).supertype==='Pokémon');
 const trainers=all.filter(id=>card(id).supertype==='Trainer');
 const basics=pokemon.filter(id=>isBasicPokemon(card(id)));
 const evolved=pokemon.filter(id=>!isBasicPokemon(card(id)));
 if(!basics.length||!trainers.length)throw Error('Not enough supported Cube cards');
 const copies=new Map(),selected=[];
 const count=id=>copies.get(id)||0;
 function add(id){
  selected.push(id);copies.set(id,count(id)+1);
 }
 function choose(items,weight,cap,allowFallback=true){
  const available=items.filter(id=>count(id)<cap);
  const source=available.length?available:allowFallback?items:[];
  if(!source.length)throw Error('Cube archetype has no supported cards');
  const picked=weightedPick(source,id=>weight(id)/(1+count(id)*1.8),random);
  add(picked);return picked;
 }
 const basicCount= preset==='neo'?102:preset==='elemental'?114:preset==='rocket'?112:103;
 if(preset==='elemental'){
  for(let i=0;i<basicCount;i++){
   const type=TYPES[i%TYPES.length];
   const choices=basics.filter(id=>typeOf(id)===type);
   if(!choices.length)throw Error('No supported Basic Pokémon for '+type);
   choose(choices,id=>pokemonWeight(id,preset),4);
  }
 }else{
  // Seed every element with at least one viable opening Pokémon, even in
  // themed cubes where Rocket/Neo might otherwise crowd out certain types.
  for(const type of TYPES){
   const candidates=basics.filter(id=>typeOf(id)===type);
   if(candidates.length)choose(candidates,id=>pokemonWeight(id,preset),4);
  }
  while(selected.length<basicCount){
   choose(basics,id=>{
    const color=typeOf(id),colorCopies=selected.filter(x=>typeOf(x)===color).length;
    return pokemonWeight(id,preset)/(1+colorCopies/24);
   },4);
  }
 }
 // Evolutions can only enter a pool if a compatible, already selected
 // predecessor is present. This also builds complete Stage 2 chains.
 const evolvedCount=config.pokemon-basicCount;
 for(let i=0;i<evolvedCount;i++){
  const possible=evolved.filter(id=>count(id)<3&&selected.some(parent=>canEvolve(card(id),card(parent))));
  const targetType=preset==='elemental'?TYPES[i%TYPES.length]:null;
  const lane=targetType?possible.filter(id=>typeOf(id)===targetType):[];
  const candidates=lane.length?lane:possible;
  if(!candidates.length){
   choose(basics,id=>pokemonWeight(id,preset),4);
   continue;
  }
  choose(candidates,id=>{
   const parentCount=selected.filter(x=>canEvolve(card(id),card(x))).length;
   const childCount=selected.filter(x=>card(x)?.name===card(id)?.name).length;
   const colorCopies=selected.filter(x=>typeOf(x)===typeOf(id)).length;
   return pokemonWeight(id,preset)*(1+Math.min(3,parentCount))/
    (1+childCount*1.5)/(preset==='elemental'?1+colorCopies/90:1);
  },3,false);
 }
 while(selected.length<config.pokemon){
  choose(basics,id=>pokemonWeight(id,preset),4);
 }
 for(let i=0;i<config.trainers;i++){
  choose(trainers,id=>trainerSynergy(card(id),preset),6);
 }
 if(selected.length!==size)throw Error('Cube pool size mismatch');
 return shuffle(selected,random);
}
module.exports={PRESETS,getPreset,makePresetPool,typeOf,TYPES};
