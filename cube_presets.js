'use strict';
// Curated drafting environments assembled exclusively from the supported
// historical theme-deck pool. No unverified imported cards are introduced.
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,canEvolve}=require('./core_rules');
const {eligibleIds}=require('./cube_draft');
const {preferredPrintings}=require('./cube_printings');

const TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting']);
const PRESETS=Object.freeze([
 {id:'balanced',name:'Classic Balanced',description:'The original all-era Cube: flexible decks, six Energy types and approachable evolution lines.',archetypes:['Mixed types','Evolutions','All-round Trainers'],pokemon:156,trainers:84},
 {id:'foundations',name:'Kanto Origins · Base / Jungle / Fossil',description:'The first three Pokémon TCG expansions only: classic Kanto evolutions, early Trainer tactics and Fossil surprises.',archetypes:['Kanto starters','Jungle evolution families','Fossil attackers','Classic Trainers'],pokemon:160,trainers:80},
 {id:'elemental',name:'Elemental Rivals',description:'Six color lanes fight for control: Grass status, Fire aggression, Water control, Lightning tempo, Psychic tricks and Fighting pressure.',archetypes:['Grass · status','Fire · offense','Water · control','Lightning · speed','Psychic · disruption','Fighting · brawlers'],pokemon:180,trainers:60},
 {id:'neo',name:'Neo Evolution Lab',description:'Evolution-chain drafting with extra Stage 1/2 targets and a bias toward the Neo-era card printings.',archetypes:['Evolution chains','Neo-era Pokémon','Setup Trainers'],pokemon:176,trainers:64},
 {id:'rocket',name:"Rocket's Schemes",description:'A mischievous Cube favoring Rocket, Dark and Gym personalities, tricky attacks and disruptive Trainers.',archetypes:['Dark evolutions','Gym personalities','Disruption'],pokemon:160,trainers:80},
 {id:'mayhem',name:'Trainer Mayhem',description:'Plenty of draw, switching and disruptive Trainers. Basic-heavy Pokémon decks keep the action fast.',archetypes:['Trainer combos','Basic attackers','Control'],pokemon:128,trainers:112},
 // Evolution-friendly variants deliberately support complete families and limit
 // early Haymaker pressure. They retain original rules, card text and attacks.
 {id:'kanto-growth',name:'Kanto Evolution League · Base / Jungle / Fossil',description:'The original three sets rebuilt as a slower, evolution-friendly draft. Full families and fewer early disruption staples.',archetypes:['Kanto Stage 1 decks','Starter Stage 2 lines','Jungle evolution families'],pokemon:176,trainers:64,basicCount:92,sets:['base1','base2','base3'],evolutionFocus:true,stage2Target:12},
 {id:'jungle-growth',name:'Jungle Growth · Base / Jungle',description:'Base and Jungle families, with enough pre-evolutions to build around Wigglytuff and the classic Stage 2 starters.',archetypes:['Stage 1 swarms','Grass evolutions','Kanto starters'],pokemon:176,trainers:64,basicCount:94,sets:['base1','base2'],evolutionFocus:true,stage2Target:10},
 {id:'fossil-discovery',name:'Fossil Discoveries · Base / Jungle / Fossil',description:'An evolutionary Kanto draft with Fossil-era Pokémon and a deliberately slower Trainer package.',archetypes:['Fossil Pokémon','Water evolutions','Psychic families'],pokemon:174,trainers:66,basicCount:94,sets:['base1','base2','base3'],evolutionFocus:true,stage2Target:12,focusSets:['base3']},
 {id:'rocket-uprising',name:'Rocket Uprising · Base through Rocket',description:'Dark evolution families and traditional evolutions compete without unlimited early disruption.',archetypes:['Dark evolution lines','Poison and control','Classic counters'],pokemon:176,trainers:64,basicCount:94,sets:['base1','base2','base3','base4','base5'],evolutionFocus:true,stage2Target:12,focusSets:['base5']},
 {id:'gym-academy',name:'Gym Academy · Kanto & Gym',description:'Gym Leader Pokémon and classic Kanto lines, with an emphasis on building functional evolution chains.',archetypes:['Gym families','Stage 1 partners','Kanto counters'],pokemon:176,trainers:64,basicCount:94,sets:['base1','base2','base3','base4','base5','gym1','gym2'],evolutionFocus:true,stage2Target:12,focusSets:['gym1','gym2']},
 {id:'neo-generations',name:'Neo Generations · Neo 1–4',description:'Neo-only evolution families, with stronger late-game decks rewarded by deliberate drafting.',archetypes:['Johto families','Neo Stage 2 Pokémon','Baby Pokémon'],pokemon:180,trainers:60,basicCount:94,sets:['neo1','neo2','neo3','neo4'],evolutionFocus:true,stage2Target:14},
 {id:'stage-one',name:'Stage One Showdown · All Eras',description:'Focus on Basic-to-Stage 1 pairs: less setup than Stage 2, more synergy than a pile of standalone Basics.',archetypes:['Stage 1 attackers','Tempo evolution','Type partnerships'],pokemon:176,trainers:64,basicCount:94,evolutionFocus:true,stage2Target:0},
 {id:'slow-burn',name:'Slow Burn · All Eras',description:'A longer setup window and a deep evolution pool, with the strongest Haymaker staples tightly limited.',archetypes:['Stage 2 payoffs','Defensive setup','Evolution engines'],pokemon:180,trainers:60,basicCount:90,evolutionFocus:true,stage2Target:18}
].map(p=>Object.freeze({...p,archetypes:Object.freeze(p.archetypes),sets:p.sets?Object.freeze(p.sets):undefined,focusSets:p.focusSets?Object.freeze(p.focusSets):undefined})));
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
 if(getPreset(preset).evolutionFocus)return /Breeder|Elm|Search|Potion|Energy Retrieval|Recycle|Switch|Pokémon Center|Trader/i.test(n)?6:1;
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
 if(preset==='foundations')return /^(base2|base3)-/.test(id)?2.2:1;
 if(preset==='elemental')return elementalSynergy(id);
 if(preset==='neo')return era(id)?6:1;
 if(preset==='rocket')return rocket(c,id)?6:1;
 if(getPreset(preset).evolutionFocus){
  // Give Pokémon with usable descendants priority over isolated attackers.
  const c=card(id);
  if(isBasicPokemon(c))return 1; // Evolution-line potential is added below.
  return getPreset(preset).focusSets?.some(set=>id.startsWith(set+'-'))?3:2;
 }
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
 const all=preferredPrintings(eligibleIds().filter(id=>{
  if(config.sets)return config.sets.includes(id.split('-')[0]);
  return preset!=='foundations'||/^base[123]-/.test(id);
 }),{preset});
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
  const available=items.filter(id=>count(id)<cardCap(id,cap));
  // A full family slot must never create a stranded Evolution. In themed
  // formats, relax generic duplicate caps only if the eligible pool runs out.
  const source=available.length?available:allowFallback?items:[];
  if(!source.length)throw Error('Cube archetype has no supported cards');
  const picked=weightedPick(source,id=>weight(id)/(1+count(id)*1.8),random);
  add(picked);return picked;
 }
 const basicCount=config.basicCount??(preset==='neo'?102:preset==='elemental'?114:preset==='rocket'?112:preset==='foundations'?110:103);
 const firstStages=evolved.filter(id=>(card(id).subtypes||[]).includes('Stage 1'));
 const secondStages=evolved.filter(id=>(card(id).subtypes||[]).includes('Stage 2'));
 const hasDescendant=new Set(basics.filter(id=>firstStages.some(next=>canEvolve(card(next),card(id)))));
 const evolutionWeight=id=>config.evolutionFocus?(hasDescendant.has(id)?5:0.25):1;
 // Limit exceptionally efficient standalone attackers and fast disruptive
 // Trainers only in the evolution-focused formats, not the classic cubes.
 const pressureBasics=/^(Hitmonchan|Electabuzz|Scyther|Magmar|Mewtwo|Lickitung|Chansey|Kangaskhan)$/i;
 const pressureTrainers=/^(Professor Oak|Bill|Gust of Wind|PlusPower|Energy Removal|Super Energy Removal|Computer Search|Item Finder|Lass|Scoop Up)$/i;
 function cardCap(id,defaultCap){
  if(!config.evolutionFocus)return defaultCap;
  const c=card(id);
  if(c.supertype==='Pokémon'&&isBasicPokemon(c)&&pressureBasics.test(c.name))return 1;
  if(c.supertype==='Trainer'&&pressureTrainers.test(c.name))return 2;
  return defaultCap;
 }
 if(preset==='elemental'){
  for(let i=0;i<basicCount;i++){
   const type=TYPES[i%TYPES.length];
   const choices=basics.filter(id=>typeOf(id)===type);
   if(!choices.length)throw Error('No supported Basic Pokémon for '+type);
   choose(choices,id=>pokemonWeight(id,preset)*evolutionWeight(id),4);
  }
 }else{
  // Seed every element with at least one viable opening Pokémon, even in
  // themed cubes where Rocket/Neo might otherwise crowd out certain types.
  for(const type of TYPES){
   const candidates=basics.filter(id=>typeOf(id)===type);
   if(candidates.length)choose(candidates,id=>pokemonWeight(id,preset)*evolutionWeight(id),4);
  }
  while(selected.length<basicCount){
   choose(basics,id=>{
    const color=typeOf(id),colorCopies=selected.filter(x=>typeOf(x)===color).length;
    return pokemonWeight(id,preset)*evolutionWeight(id)/(1+colorCopies/24);
   },4);
  }
 }
 // Reserve meaningful complete Stage 2 lines while there is room for both
 // the Stage 1 and Stage 2 cards. This is absent in the old random sampler.
 const evolutionCap=config.evolutionFocus?5:3;
 const stage2Target=Math.min(config.stage2Target||0,Math.floor((config.pokemon-basicCount)/2));
 let pairedStage2=0;
 while(pairedStage2<stage2Target){
  const chains=[];
  for(const stage2 of secondStages.filter(id=>count(id)<cardCap(id,evolutionCap))){
   for(const stage1 of firstStages.filter(id=>canEvolve(card(stage2),card(id))&&
    count(id)<cardCap(id,evolutionCap)&&selected.some(root=>canEvolve(card(id),card(root))))){
    chains.push({stage1,stage2});
   }
  }
  if(!chains.length)break;
  const pair=weightedPick(chains,item=>{
   const unrepresented=count(item.stage2)===0?5:1;
   const focus=config.focusSets?.some(set=>item.stage2.startsWith(set+'-'))?3:1;
   return unrepresented*focus/(1+count(item.stage1)+count(item.stage2)*3);
  },random);
  add(pair.stage1);add(pair.stage2);pairedStage2++;
 }
 const reservedEvolved=pairedStage2*2;
 // Evolutions can only enter a pool if a compatible, already selected
 // predecessor is present. This also builds complete Stage 2 chains.
 const evolvedCount=config.pokemon-basicCount;
 for(let i=reservedEvolved;i<evolvedCount;i++){
  const possible=evolved.filter(id=>count(id)<cardCap(id,evolutionCap)&&
   (config.stage2Target!==0||!(card(id).subtypes||[]).includes('Stage 2'))&&
   selected.some(parent=>canEvolve(card(id),card(parent))));
  const targetType=preset==='elemental'?TYPES[i%TYPES.length]:null;
  const lane=targetType?possible.filter(id=>typeOf(id)===targetType):[];
  const candidates=lane.length?lane:possible;
  if(!candidates.length){
   if(config.evolutionFocus)throw Error('Not enough compatible Evolutions for '+preset);
   choose(basics,id=>pokemonWeight(id,preset)*evolutionWeight(id),4);
   continue;
  }
  choose(candidates,id=>{
   const parentCount=selected.filter(x=>canEvolve(card(id),card(x))).length;
   const childCount=selected.filter(x=>card(x)?.name===card(id)?.name).length;
   const colorCopies=selected.filter(x=>typeOf(x)===typeOf(id)).length;
   return pokemonWeight(id,preset)*(1+Math.min(3,parentCount))*
    (config.evolutionFocus&&childCount===0?3:1)*
    (config.focusSets?.some(set=>id.startsWith(set+'-'))?2:1)/
    (1+childCount*1.5)/(preset==='elemental'?1+colorCopies/90:1);
  },evolutionCap,false);
 }
 while(selected.length<config.pokemon){
  choose(basics,id=>pokemonWeight(id,preset)*evolutionWeight(id),4);
 }
 for(let i=0;i<config.trainers;i++){
  choose(trainers,id=>trainerSynergy(card(id),preset),6);
 }
 if(selected.length!==size)throw Error('Cube pool size mismatch');
 return shuffle(selected,random);
}
module.exports={PRESETS,getPreset,makePresetPool,typeOf,TYPES};
