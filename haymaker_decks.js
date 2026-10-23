'use strict';
// Curated 60-card Basic-only Haymaker decks across Base through Neo Destiny.
// All five original Base/Jungle/Fossil recipes are preserved exactly.
// Original card text, standard four-of rule, no evolution cards.
const ORIGINAL_RECIPES=Object.freeze({
 haymaker_classic:{
  name:'Haymaker · Classic Punch (Fighting / Lightning)',
  description:'Hitmonchan, Electabuzz and Scyther backed by draw, Gust and Energy Removal.',
  pokemon:[[4,'base1-7'],[4,'base1-20'],[3,'base2-26'],[2,'base1-27'],[2,'base2-47']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[4,'base1-84'],
   [3,'base1-93'],[3,'base1-92'],[2,'base1-79'],[2,'base1-78'],[1,'base1-95']],
  energy:[[7,'base1-97'],[7,'base1-100'],[4,'base1-96']]
 },
 haymaker_fire:{
  name:'Haymaker · Firestorm (Fire / Lightning)',
  description:'Fossil Magmar and Electabuzz apply status pressure while Scyther attacks with colorless Energy.',
  pokemon:[[4,'base3-39'],[4,'base1-20'],[3,'base2-26'],[2,'base1-27'],[1,'base2-5']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-93'],
   [4,'base1-84'],[3,'base1-92'],[1,'base1-79'],[2,'base1-78']],
  energy:[[9,'base1-98'],[8,'base1-100'],[4,'base1-96']]
 },
 haymaker_psychic:{
  name:'Haymaker · Mind Games (Psychic / Fighting)',
  description:'Mewtwo, Jynx and Hitmonchan attack different Weaknesses; Chansey absorbs pressure.',
  pokemon:[[4,'base1-10'],[4,'base1-7'],[3,'base2-26'],[2,'base1-31'],[1,'base1-3']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-84'],
   [3,'base1-93'],[3,'base1-92'],[2,'base1-79'],[2,'base1-78'],[1,'base1-95']],
  energy:[[9,'base1-101'],[7,'base1-97'],[4,'base1-96']]
 },
 haymaker_water:{
  name:'Haymaker · Tidal Punch (Water / Fighting)',
  description:'Lapras leads quickly, Hitmonchan punishes Lightning targets and Articuno closes games.',
  pokemon:[[4,'base3-25'],[4,'base1-7'],[3,'base2-26'],[2,'base3-17'],[1,'base2-5']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-93'],
   [3,'base1-84'],[3,'base1-92'],[2,'base1-78'],[1,'base1-95'],[1,'base1-79']],
  energy:[[11,'base1-102'],[6,'base1-97'],[4,'base1-96']]
 },
 haymaker_jungle:{
  name:'Haymaker · Jungle Tempo (Lightning / Grass)',
  description:'Electabuzz pushes damage while Scyther, Lickitung and Tauros sustain the board.',
  pokemon:[[4,'base2-26'],[4,'base1-20'],[4,'base2-38'],[2,'base2-47'],[1,'base2-5']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-84'],
   [3,'base1-93'],[3,'base1-92'],[2,'base1-78'],[2,'base1-79'],[1,'base1-95']],
  energy:[[11,'base1-100'],[4,'base1-99'],[4,'base1-96']]
 }
});

// Additional decks are additive: existing IDs, card IDs and counts above never
// change. Each new recipe is a full legal 60-card build, not a 40-card Cube list.
// Core Trainer suites deliberately reuse classic staples so every deck has
// enough search, draw, removal and switching to function without evolving.
const ROCKET_TRAINERS=[
 [4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],
 [3,'base1-84'],[3,'base1-93'],[3,'base1-92'],[2,'base1-78'],
 [2,'base5-72'],[1,'base5-77']
]; // 26
const GYM_TRAINERS=[
 [4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],
 [3,'base1-84'],[3,'base1-93'],[3,'base1-92'],[2,'base1-78'],
 [2,'base1-79'],[1,'base1-95']
]; // 26
const NEO_TRAINERS=[
 [4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],
 [3,'base1-84'],[3,'base1-93'],[3,'base1-92'],[2,'base1-78'],
 [2,'neo1-96'],[1,'neo1-86']
]; // 26
const MORE_RECIPES=Object.freeze({
 haymaker_base2:{
  era:'Base Set 2',
  name:'Haymaker · Second Impact (Base Set 2)',
  description:'Base Set 2 Hitmonchan, Electabuzz and Scyther with reprinted classic Trainer pressure.',
  pokemon:[[4,'base4-8'],[4,'base4-24'],[3,'base4-17'],[2,'base4-40'],[2,'base4-48']],
  trainers:[[4,'base4-118'],[3,'base4-116'],[3,'base4-101'],[2,'base4-103'],
   [3,'base4-113'],[3,'base4-120'],[3,'base4-119'],[2,'base4-108'],
   [2,'base4-107'],[2,'base4-123']],
  energy:[[7,'base4-125'],[7,'base4-128'],[4,'base4-124']]
 },
 haymaker_rocket_blitz:{
  era:'Team Rocket',
  name:'Haymaker · Rocket Blitz (Rocket / Fire)',
  description:'Team Rocket Voltorb, Charmander and Ponyta, plus Fossil Magmar: fast attacks and Sneak Attack.',
  pokemon:[[4,'base5-69'],[4,'base5-50'],[3,'base5-64'],[2,'base3-39'],[2,'base2-26']],
  trainers:ROCKET_TRAINERS,
  energy:[[9,'base1-98'],[6,'base1-100'],[4,'base1-96']]
 },
 haymaker_rocket_venom:{
  era:'Team Rocket',
  name:'Haymaker · Rocket Venom (Grass / Fire)',
  description:'Team Rocket Koffing, Ekans and Oddish apply disruption while Magmar hits directly.',
  pokemon:[[4,'base5-58'],[4,'base5-56'],[3,'base5-63'],[2,'base3-39'],[2,'base2-26']],
  trainers:ROCKET_TRAINERS,
  energy:[[9,'base1-99'],[6,'base1-98'],[4,'base1-96']]
 },
 haymaker_gym_heroes:{
  era:'Gym Heroes',
  name:'Haymaker · Gym Heroes Clash (Fighting / Lightning)',
  description:"Rocket's Hitmonchan and Lt. Surge's Electabuzz headline a Gym-era Basic-only roster.",
  pokemon:[[4,'gym1-6'],[4,'gym1-11'],[3,'gym1-52'],[2,'gym1-33'],[2,'gym1-22']],
  trainers:GYM_TRAINERS,
  energy:[[8,'gym1-127'],[7,'gym1-130'],[4,'base1-96']]
 },
 haymaker_gym_challenge:{
  era:'Gym Challenge',
  name:'Haymaker · Gym Challenge Psyshock (Psychic / Lightning)',
  description:"Rocket's Mewtwo and Zapdos join Sabrina's Psychic attackers to control the Prize race.",
  pokemon:[[4,'gym2-15'],[4,'gym2-14'],[3,'gym2-57'],[2,'gym2-59'],[2,'gym2-86']],
  trainers:GYM_TRAINERS,
  energy:[[9,'gym2-131'],[6,'gym1-130'],[4,'base1-96']]
 },
 haymaker_rocket_gym:{
  era:'Gym Heroes / Gym Challenge',
  name:"Haymaker · Rocket's League (Fighting / Lightning)",
  description:"Rocket's Gym Pokémon mix aggressive Basics and durable Colorless attackers.",
  pokemon:[[4,'gym1-11'],[4,'gym2-15'],[3,'gym1-33'],[2,'gym1-22'],[2,'gym2-86']],
  trainers:GYM_TRAINERS,
  energy:[[8,'gym1-127'],[7,'gym1-130'],[4,'base1-96']]
 },
 haymaker_neo_genesis:{
  era:'Neo Genesis',
  name:'Haymaker · Johto Opening (Fire / Lightning)',
  description:'Neo Genesis Magmar and Electabuzz pressure opponents while Miltank and Stantler buy time.',
  pokemon:[[4,'neo1-33'],[4,'neo1-40'],[3,'neo1-41'],[2,'neo1-76'],[2,'neo1-70']],
  trainers:NEO_TRAINERS,
  energy:[[8,'neo1-107'],[7,'neo1-109'],[4,'base1-96']]
 },
 haymaker_neo_discovery:{
  era:'Neo Discovery',
  name:'Haymaker · Discovery Fighters (Fighting / Grass)',
  description:'Neo Discovery Hitmontop, Yanma and Scyther form a Basic-only fighting line.',
  pokemon:[[4,'neo2-3'],[4,'neo2-17'],[4,'neo2-46'],[3,'neo2-57']],
  trainers:NEO_TRAINERS,
  energy:[[8,'neo1-106'],[7,'neo1-108'],[4,'base1-96']]
 },
 haymaker_neo_revelation:{
  era:'Neo Revelation',
  name:'Haymaker · Legendary Pressure (Fire / Lightning)',
  description:'Entei and Raikou bring late-era raw damage alongside Stantler and Farfetch’d tempo.',
  pokemon:[[4,'neo3-6'],[4,'neo3-13'],[4,'neo3-38'],[3,'neo3-43']],
  trainers:NEO_TRAINERS,
  energy:[[8,'neo1-107'],[7,'neo1-109'],[4,'base1-96']]
 },
 haymaker_neo_destiny:{
  era:'Neo Destiny',
  name:'Haymaker · Destiny Assault (Fighting / Grass)',
  description:'Neo Destiny Hitmonlee, Heracross, Scyther and Hitmonchan apply direct Basic pressure.',
  pokemon:[[4,'neo4-42'],[4,'neo4-55'],[3,'neo4-41'],[2,'neo4-31'],[2,'neo4-69']],
  trainers:NEO_TRAINERS,
  energy:[[8,'neo1-106'],[7,'neo1-108'],[4,'base1-96']]
 },
 haymaker_neo_dark:{
  era:'Neo 1–4 + Team Rocket',
  name:'Haymaker · Dark Neon (Darkness / Grass)',
  description:'Sneasel, Houndour and Murkrow use limited Darkness/Rainbow Energy; Chansey holds the board.',
  pokemon:[[4,'neo1-25'],[4,'neo2-39'],[3,'neo3-46'],[2,'neo4-31'],[2,'neo4-55']],
  trainers:NEO_TRAINERS.slice(0,-1),
  energy:[[4,'neo1-104'],[4,'base5-80'],[8,'neo1-108'],[4,'base1-96']]
 },
 haymaker_all_eras:{
  era:'Base → Neo Destiny',
  name:'Haymaker · All-Era All-Stars (Fighting / Lightning)',
  description:"Classic Hitmonchan, Rocket's Zapdos, Neo Electabuzz and Hitmontop combine the eras.",
  pokemon:[[4,'base1-7'],[4,'gym2-15'],[3,'neo1-33'],[2,'neo2-3'],[2,'neo3-38']],
  trainers:NEO_TRAINERS,
  energy:[[8,'neo1-106'],[7,'neo1-109'],[4,'base1-96']]
 }
});
const recipes=Object.freeze({...ORIGINAL_RECIPES,...MORE_RECIPES});
const expand=rows=>rows.flatMap(([amount,id])=>Array(amount).fill(id));
const entries=Object.freeze(Object.entries(recipes).map(([id,recipe])=>
 Object.freeze({id,name:recipe.name,description:recipe.description,era:recipe.era||'Base / Jungle / Fossil',haymaker:true})));
function list(id){
 if(!Object.hasOwn(recipes,id))return null;
 const recipe=recipes[id];
 return expand([...recipe.pokemon,...recipe.trainers,...recipe.energy]);
}
function has(id){return typeof id==='string'&&Object.hasOwn(recipes,id);}
function validateRecipes(){
 for(const id of Object.keys(recipes)){
  const r=recipes[id],p=expand(r.pokemon),t=expand(r.trainers),e=expand(r.energy);
  if(p.length<10||p.length>20||t.length<15||e.length<12||p.length+t.length+e.length!==60)
   throw Error('Invalid Haymaker card balance: '+id);
  for(const [category,ids] of [['Pokémon',p],['Trainer',t],['Energy',e]]){
   if(ids.some(cardId=>!/^(base[1-5]|gym[12]|neo[1-4])-\d+$/.test(cardId)))
    throw Error('Haymaker uses unknown-era printing: '+id+' '+category);
  }
 }
}
validateRecipes();
module.exports=Object.freeze({recipes,entries,list,has,validateRecipes});
