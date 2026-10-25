'use strict';
// Curated, archetype-focused benchmark decks, NOT certified historical tournament
// lists. Existing Haymaker presets are reused unmodified from the game.
// Every card is sourced from the official Base through Neo Destiny catalog.
const {CATALOG}=require('./headless_duel');
const {validateDeck,isBasicPokemon}=require('./core_rules');
const HAYMAKER=require('./haymaker_decks');
const expand=rows=>rows.flatMap(([n,id])=>Array(n).fill(id));
const staple=[
 [4,'base1-88'], // Professor Oak
 [4,'base1-91'], // Bill
 [3,'base1-71'], // Computer Search
 [3,'base1-76'], // Pokémon Breeder
 [2,'base1-77'], // Pokémon Trader
 [2,'base1-74'], // Item Finder
 [2,'base1-93'], // Gust of Wind
 [2,'base1-95'], // Switch
 [2,'neo1-86'] // Focus Band
]; // 24 trainers
const archetypes=Object.freeze({
 haymaker:{label:'Haymaker aggression',family:'basic-aggression',era:'Base–Fossil',
  list:()=>HAYMAKER.list('haymaker_classic')},
 rain_dance:{label:'Blastoise Rain Dance',family:'energy-acceleration',era:'Base–Neo',
  rows:[
   [4,'base1-63'],[3,'base1-42'],[3,'base1-2'],
   [3,'base3-25'],[2,'base3-17'],[2,'neo1-20'],
   [4,'base1-88'],[4,'base1-91'],[3,'base1-71'],[3,'base1-76'],
   [2,'base1-77'],[2,'base1-74'],[2,'base1-93'],[2,'base1-81'],[2,'base1-95'],
   [19,'base1-102']
  ]},
 meganium:{label:'Meganium evolution and Wild Growth',family:'evolution-power',era:'Neo Genesis',
  rows:[
   [4,'neo1-53'],[3,'neo1-28'],[3,'neo1-11'],
   [3,'neo1-20'],[2,'base2-26'],[2,'base2-38'],
   ...staple,[19,'base1-99']
  ]},
 typhlosion:{label:'Typhlosion Fire Recharge',family:'energy-recursion',era:'Neo Genesis',
  rows:[
   [4,'neo1-56'],[3,'neo1-46'],[3,'neo1-17'],
   [3,'base3-39'],[2,'neo1-20'],[2,'base2-26'],
   ...staple,[19,'base1-98']
  ]},
 feraligatr:{label:'Feraligatr Downpour/Riptide',family:'discard-recursion',era:'Neo Genesis',
  rows:[
   [4,'neo1-80'],[3,'neo1-31'],[3,'neo1-5'],
   [3,'base3-25'],[2,'neo1-20'],[2,'base3-17'],
   ...staple,[19,'base1-102']
  ]},
 energy_denial:{label:'Energy Removal attrition',family:'energy-control',era:'Base–Fossil',
  rows:[
   [4,'base1-7'],[4,'base1-20'],[3,'base2-26'],
   [3,'base2-38'],[2,'base1-3'],
   [4,'base1-88'],[4,'base1-91'],[3,'base1-71'],
   [4,'base1-92'],[4,'base1-79'],[3,'base1-93'],
   [2,'base1-78'],[2,'base1-74'],[2,'base1-95'],
   [8,'base1-97'],[4,'base1-100'],[4,'base1-96']
  ]},
 stall:{label:'Chansey/Snorlax stall and deck pressure',family:'stall',era:'Base–Neo',
  rows:[
   [4,'base1-3'],[4,'base2-38'],[3,'base2-27'],
   [2,'base2-5'],[2,'neo1-20'],
   [4,'base1-88'],[4,'base1-91'],[4,'base1-78'],[4,'base1-85'],
   [4,'base1-92'],[3,'base1-79'],[3,'base1-74'],
   [3,'base1-95'],[2,'base1-93'],
   [10,'base1-101'],[4,'base1-96']
  ]},
 neo_dark:{label:'Neo Darkness/Rainbow beatdown',family:'special-energy',era:'Neo Destiny',
  list:()=>HAYMAKER.list('haymaker_neo_dark')}
});
function list(id){
 const def=archetypes[id];
 if(!def)throw Error('Unknown competitive archetype '+id);
 return def.list?[...def.list()]:expand(def.rows);
}
function inspect(id){
 const cards=list(id),result=validateDeck(cards,CATALOG),counts={Pokemon:0,Trainer:0,Energy:0};
 for(const cardId of cards){
  const c=CATALOG.get(cardId);
  if(!c)continue;
  counts[c.supertype==='Pokémon'?'Pokemon':c.supertype==='Trainer'?'Trainer':'Energy']++;
 }
 if(!result.valid)throw Error('Invalid competitive benchmark '+id+': '+result.errors.join('; '));
 if(result.basicCount<4)throw Error('Too few starting Basics in '+id);
 // A missing evolution link silently turns the strategy into a useless dead
 // card; every evolved card needs its printed parent somewhere in this deck.
 for(const cardId of cards){
  const c=CATALOG.get(cardId);
  if(!c?.evolvesFrom||isBasicPokemon(c))continue;
  const parents=cards.map(x=>CATALOG.get(x)?.name);
  if(!parents.includes(c.evolvesFrom))throw Error('Missing evolution prerequisite for '+c.name+' in '+id);
 }
 return {id,label:archetypes[id].label,family:archetypes[id].family,
  era:archetypes[id].era,total:cards.length,basics:result.basicCount,counts};
}
const entries=Object.freeze(Object.keys(archetypes).map(inspect));
module.exports=Object.freeze({archetypes,entries,list,inspect});
