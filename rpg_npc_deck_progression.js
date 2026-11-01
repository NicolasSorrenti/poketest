'use strict';
// Authored, historical-card RPG NPC recipes. These seven campaign tiers are
// built from private recipes; retail theme decks are never used as templates.
// Recipe entries list card IDs, so building a deck is deterministic and does
// not depend on catalog iteration order or mutate shared deck arrays.
const PROFILES=Object.freeze({
 hana:{pokemon:['base2-54','base2-54','base2-54','base2-54','base2-16','base2-16','base2-5','base2-5','base2-5','base1-5','base1-5','base1-3','base1-3','base1-57','base1-57','base1-57','base1-22','base1-22'],energy:[['base1-101',10],['base1-96',4],['base5-17',4]],signatureTrainers:['base1-86','base1-94'],bench:['base1-3','base1-57','base1-22'],midline:'base2-16',ace:'base2-16',finisher:'base2-1',disruption:['base1-89','base1-95'],tier6Support:'base1-89',strategy:'Colorless teamwork, sturdy setup, and Wigglytuff pressure'},
 reina:{pokemon:['base1-7','base1-7','base1-7','base1-7','base3-7','base3-7','base2-55','base2-55','base2-55','base2-55','base2-43','base2-43','base2-43','neo2-3','neo2-3','neo2-3','neo1-43','neo1-43'],energy:[['base1-97',18]],signatureTrainers:['base1-84','base1-92'],bench:['neo1-43','neo1-43','base2-55'],midline:'base2-43',ace:'neo2-3',finisher:'base3-7',disruption:['base1-79','base1-79'],tier6Support:'base1-74',strategy:'Fast Fighting pressure, efficient attackers, and energy denial'},
 shiori:{pokemon:['base1-69','base1-69','base1-69','base1-69','base1-33','base1-33','base1-33','base1-17','base1-17','base2-10','base2-10','base2-10','base2-59','base2-59','base2-59','base2-41','base2-41','base2-41'],energy:[['base1-99',18]],signatureTrainers:['base1-76','base1-85'],bench:['base2-59','base2-41','base2-41'],midline:'base1-17',ace:'base1-17',finisher:'base2-10',disruption:['base1-89','base1-94'],tier6Support:'base1-77',strategy:'Grass evolution control, spread pressure, and damage management'},
 yuna:{pokemon:['base5-55','base5-55','base5-55','base5-55','base2-4','base2-4','base2-4','gym2-15','gym2-15','gym2-15','gym2-15','neo1-12','neo1-12','neo1-12','base1-10','base1-10','base1-10','base1-10'],energy:[['base1-100',11],['base1-101',7]],signatureTrainers:['base1-91','base1-84'],bench:['neo1-12','neo1-12','base5-55'],midline:'base2-4',ace:'base1-16',finisher:'gym2-14',disruption:['base1-92','base5-16'],tier6Support:'base1-74',strategy:'High-variance Lightning/Psychic tempo with Jolteon, Pichu, and surprise power'},
 akari:{pokemon:['neo1-73','neo1-73','neo1-73','neo1-73','base3-43','base3-43','base3-43','base1-49','base1-49','base1-49','base1-49','base3-8','base3-8','base3-8','base1-31','base1-31','base1-31','base1-31'],energy:[['base1-101',18]],signatureTrainers:['base1-75','gym1-118'],bench:['base1-31','base1-31','base1-49'],midline:'base3-43',ace:'base3-8',finisher:'base5-12',disruption:['base1-73','base5-16'],tier6Support:'base1-74',strategy:'Hand disruption, Psychic denial, and slow advantage'},
 camila:{pokemon:['base5-63','base5-63','base5-63','base5-63','base5-36','base5-36','base5-36','base5-30','base5-30','base5-70','base5-70','base5-70','base5-70','base5-24','base5-24','base5-24','base5-48','base5-48'],energy:[['base1-99',18]],signatureTrainers:['base5-73','base5-78'],bench:['base5-48','base5-70','base5-70'],midline:'base5-36',ace:'base5-30',finisher:'base5-30',disruption:['base5-16','base1-79'],tier6Support:'base5-77',strategy:'Dark Vileplume control with poison pressure and a secondary Golbat line'},
 marina:{pokemon:['base2-51','base2-51','base2-51','base2-51','base2-12','base2-12','base2-12','base1-41','base1-41','base1-41','base1-41','base1-25','base1-25','base1-25','base1-65','base1-65','base1-64','base1-64'],energy:[['base1-102',18]],signatureTrainers:['base1-81','base1-94'],bench:['base1-41','base1-65','base1-41'],midline:'base2-12',ace:'base1-25',finisher:'base1-64',disruption:['base1-89','neo1-98'],tier6Support:'base1-77',strategy:'Water setup into resilient evolutions and a heavy Vaporeon finish'},
 kaede:{pokemon:['base5-58','base5-58','base5-58','base5-58','base5-31','base5-31','base5-31','base5-57','base5-57','base5-57','base5-57','base5-41','base5-41','base5-41','base5-69','base5-69','base5-34','base5-34'],energy:[['base1-99',11],['base1-100',7]],signatureTrainers:['base5-16','base5-78'],bench:['base5-69','base5-58','base5-58'],midline:'base5-31',ace:'base5-41',finisher:'base5-34',disruption:['base1-79','base5-16'],tier6Support:'base5-73',strategy:'Dark Weezing and Muk disruption with poison and efficient attackers'},
 jun:{pokemon:['neo1-77','neo1-77','neo1-77','neo1-77','base3-52','base3-52','base3-52','base3-52','base3-40','base3-40','base3-40','base3-50','base3-50','base3-50','base3-9','base3-9','base3-1','base3-1'],energy:[['base1-102',10],['base1-97',8]],signatureTrainers:['base3-62','base3-62'],bench:['neo1-77','neo1-77','base3-50'],midline:'base3-40',ace:'base3-9',finisher:'base3-1',disruption:['base1-92','base1-79'],tier6Support:'base1-77',strategy:'Fossil control with Aerodactyl tempo and layered ancient evolutions'},
 teo:{pokemon:['neo1-56','neo1-56','neo1-56','neo1-56','neo1-46','neo1-46','neo1-46','neo1-17','neo1-17','base1-28','base1-28','base1-28','base1-23','base1-23','base1-60','base1-60','base1-36','base1-36'],energy:[['base1-98',18]],signatureTrainers:['gym2-124','base1-84'],bench:['base1-60','base1-60','base1-36'],midline:'neo1-46',ace:'neo1-17',finisher:'base1-23',disruption:['base1-84','base1-92'],tier6Support:'base1-74',strategy:'Fast Fire tempo, early prize racing, and escalating evolution pressure'},
 iris:{pokemon:['base3-53','base3-53','base3-53','base3-53','base3-35','base3-35','base3-35','gym1-65','gym1-65','gym1-65','gym1-65','gym2-21','gym2-21','gym2-21','gym1-32','gym1-32','gym1-10','gym1-10'],energy:[['base1-102',10],['base1-98',8]],signatureTrainers:['gym1-114','gym2-124'],bench:['gym1-65','gym1-65','gym1-65'],midline:'base3-35',ace:'gym2-21',finisher:'gym1-10',disruption:['base1-92','base1-89'],tier6Support:'base1-77',strategy:'Adaptive Water/Fire midrange with flexible stage-one threats'},
 elio:{pokemon:['base1-56','base1-56','base1-56','base1-56','neo1-15','neo1-15','neo1-15','base1-53','base1-53','base1-53','base1-53','base1-9','base1-9','base1-9','neo1-13','neo1-13','neo1-13','neo1-13'],energy:[['base1-97',8],['base1-100',10]],signatureTrainers:['base1-80','neo1-86'],bench:['neo1-13','neo1-13','neo1-13'],midline:'base1-9',ace:'neo1-15',finisher:'base1-20',disruption:['base1-80','base1-89'],tier6Support:'base1-74',strategy:'Fossil-like defensive basics, Metal resilience, and patient board setup'},
 alma:{pokemon:['base1-43','base1-43','base1-43','base1-43','base1-32','base1-32','base1-32','base1-1','base1-1','base2-52','base2-52','base2-52','base2-52','base2-35','base2-35','base2-35','base3-3','base3-3'],energy:[['base1-101',15],['base1-99',3]],signatureTrainers:['base1-85','base1-94'],bench:['base3-3','base3-3','base2-52'],midline:'base1-32',ace:'base1-1',finisher:'base2-35',disruption:['base1-79','base1-90'],tier6Support:'base1-74',strategy:'Alakazam damage control, resource exhaustion, and slow lock pressure'},
 nereo:{pokemon:['neo1-62','neo1-62','neo1-62','neo1-62','neo1-48','neo1-48','neo1-48','neo1-8','neo1-8','neo1-82','neo1-82','neo1-82','base3-54','base3-54','neo1-64','neo1-64','neo1-64','neo1-64'],energy:[['base1-102',18]],signatureTrainers:['neo1-103','base1-81'],bench:['neo1-64','neo1-64','neo1-64'],midline:'neo1-48',ace:'neo1-8',finisher:'base3-32',disruption:['neo1-98','base1-89'],tier6Support:'base1-77',strategy:'Patient Water control, recovery, and layered Kingdra pressure'},
 barb:{pokemon:['neo1-67','neo1-67','neo1-67','neo1-67','neo1-52','neo1-52','neo1-52','neo1-55','neo1-55','neo1-55','neo1-55','neo1-38','neo1-38','neo1-38','neo1-58','neo1-58','neo1-72','neo1-72'],energy:[['base1-101',9],['base1-100',9]],signatureTrainers:['neo1-91','neo1-88'],bench:['neo1-72','neo1-72','neo1-58'],midline:'neo1-52',ace:'neo1-38',finisher:'base1-20',disruption:['neo1-98','base1-92'],tier6Support:'base1-74',strategy:'Creative Psychic/Lightning tempo with Xatu tricks and Lanturn pivots'},
 laca:{pokemon:['neo1-80','neo1-80','neo1-80','neo1-80','neo1-31','neo1-31','neo1-31','neo1-4','neo1-4','neo1-66','neo1-66','neo1-66','neo1-2','neo1-2','neo2-37','neo2-37','neo2-37','neo2-37'],energy:[['base1-102',18]],signatureTrainers:['base1-84','neo1-85'],bench:['neo2-37','neo2-37','neo2-37'],midline:'neo1-31',ace:'neo1-4',finisher:'neo1-2',disruption:['base1-92','base1-79'],tier6Support:'base1-77',strategy:'Aggressive Water evolution tempo with Feraligatr and Marill pressure'},
 daisy:{pokemon:['base5-47','base5-47','base5-47','base5-47','base1-6','base1-6','base1-6','base3-10','base3-2','base3-2','base3-2','base3-10','base3-10','base3-10','neo3-49','neo3-49','neo3-49','neo3-49'],energy:[['base1-102',18]],signatureTrainers:['base1-78','base1-94'],bench:['neo3-49','neo3-49','neo3-49'],midline:'base1-6',ace:'base3-2',finisher:'base5-25',disruption:['base1-89','neo1-98'],tier6Support:'base1-74',strategy:'Water reversal, comeback tools, and a late Gyarados burst'},
 rina:{pokemon:['base4-67','base4-67','base4-67','base4-67','base4-44','base4-44','base4-44','base4-18','base4-18','gym1-13','gym1-13','gym1-13','base2-9','base2-9','base2-9','base1-66','base1-66','base1-66'],energy:[['base1-99',18]],signatureTrainers:['base1-84','base1-81'],bench:['base1-66','base1-66','gym1-13'],midline:'base4-44',ace:'base4-18',finisher:'base4-18',disruption:['base1-92','base1-89'],tier6Support:'base1-77',strategy:'Grass beatdown built around Venusaur, sturdy basics, and sustained pressure'},
 sol:{pokemon:['gym1-1','gym1-1','gym1-1','gym1-63','gym1-63','gym1-63','gym1-63','gym2-33','gym2-33','gym2-33','base3-51','base3-51','base3-51','base3-51','base3-38','base3-38','neo1-23','neo1-23'],energy:[['base1-98',10],['base1-102',8]],signatureTrainers:['gym2-124','base1-95'],bench:['neo1-23','neo1-23','gym1-63'],midline:'gym2-33',ace:'base3-38',finisher:'gym1-1',disruption:['base1-92','base1-79'],tier6Support:'base1-74',strategy:'Fire/Water surprise tempo, switching between fast attackers and pressure'},
 jinx:{pokemon:['neo1-65','neo1-65','neo1-65','neo1-65','neo1-34','neo1-34','neo1-34','neo1-1','neo1-1','base1-58','base1-58','base1-58','base1-14','base1-14','neo1-22','neo1-22','neo1-22','neo1-22'],energy:[['base1-100',18]],signatureTrainers:['base1-84','base1-93'],bench:['base1-58','base1-58','neo1-22'],midline:'neo1-34',ace:'neo1-1',finisher:'base1-14',disruption:['base1-92','base1-79'],tier6Support:'base1-74',strategy:'Pure Lightning aggression with fast Raichu and Ampharos pressure'},
 luna:{pokemon:['base1-59','base1-59','base1-59','base1-59','base1-38','base1-38','base1-38','neo2-8','neo2-8','base2-53','base2-53','base2-53','base2-53','base2-46','base2-46','base2-46','base1-27','base1-27'],energy:[['base1-102',18]],signatureTrainers:['base1-94','neo1-87'],bench:['base1-27','base2-53','base2-53'],midline:'base1-38',ace:'neo2-8',finisher:'base2-46',disruption:['base1-92','neo1-98'],tier6Support:'base1-77',strategy:'Gentle Water tempo control with Politoed, Suicune, and patient pivots'},
 elena:{pokemon:['base2-63','base2-63','base2-63','base2-63','base2-13','base2-13','base2-13','gym1-75','gym1-75','gym1-75','gym1-75','gym1-48','gym1-48','gym1-26','gym1-26','gym1-79','gym1-79','gym1-79'],energy:[['base1-99',18]],signatureTrainers:['gym1-109','gym1-103'],bench:['gym1-79','gym1-75','gym1-75'],midline:'base2-13',ace:'gym1-26',finisher:'gym1-26',disruption:['gym1-110','base1-89'],tier6Support:'base1-74',strategy:'Jungle control through status, Venomoth, and a Victreebel evolution line'},
 sierra:{pokemon:['base5-59','base5-59','base5-59','base5-59','base5-40','base5-40','base5-40','base5-27','base5-27','base5-52','base5-52','base5-52','base5-52','base5-23','base5-23','base5-23','base1-62','base1-62'],energy:[['base1-97',18]],signatureTrainers:['base1-79','base1-93'],bench:['base1-62','base1-62','base5-52'],midline:'base5-40',ace:'base5-27',finisher:'base5-23',disruption:['base1-79','base5-16'],tier6Support:'base1-74',strategy:'Fighting disruption built around Dark Machamp, Dark Dugtrio, and energy denial'},
 lyla:{pokemon:['neo2-38','neo2-38','neo2-38','neo2-38','neo2-13','neo2-13','neo2-13','neo2-1','neo2-1','neo2-1','neo2-1','neo1-24','neo1-24','neo1-25','neo1-25','neo4-65','neo4-65','neo4-65'],energy:[['neo1-104',4],['neo1-110',12],['base1-96',2]],signatureTrainers:['neo1-96','neo1-86'],bench:['neo1-24','neo4-65','neo1-25'],midline:'neo2-13',ace:'neo4-4',finisher:'neo4-4',disruption:['neo1-100','neo1-96'],tier6Support:'neo1-86',strategy:'Silent Runway: Umbreon bench pressure backed by reliable Psychic attackers and flexible Colorless energy'},
 jicy:{pokemon:['neo2-65','neo2-65','neo2-65','neo2-65','neo2-15','neo2-15','neo1-74','neo1-74','neo1-74','neo1-74','neo1-37','neo1-37','neo1-41','neo1-41','neo3-5','neo3-5','neo3-5','neo3-5'],energy:[['base1-97',14],['base1-96',4]],signatureTrainers:['neo1-86','neo1-93'],bench:['neo1-74','neo3-5','neo3-5'],midline:'neo2-15',ace:'neo1-37',finisher:'neo1-41',disruption:['neo1-86','neo1-93'],tier6Support:'neo3-61',strategy:'Cute Colorless bruisers: Teddiursa, Ursaring, Snubbull, Granbull, Miltank, and Delibird; healing, paralysis, and surprise damage'},
});

const STRATEGIES=Object.freeze(Object.fromEntries(Object.entries(PROFILES).map(([id,p])=>[id,p.strategy])));
const NAMES=Object.freeze(Object.keys(PROFILES));
const BASE_TRAINERS=Object.freeze([
 'base1-91','base1-91','base1-91','base1-88','base1-88','base1-71',
 'base1-77','base1-77','base1-93','base1-93','base1-95',
 'base1-92','base1-92','base1-84','base1-84','base1-94','base1-94',
 'base1-90','base1-89','base1-81','base1-79','base1-79'
]);
const STARTING_RECIPES=Object.freeze(Object.fromEntries(NAMES.map(id=>[id,Object.freeze([
 ...PROFILES[id].pokemon,...BASE_TRAINERS,...PROFILES[id].signatureTrainers,
 ...PROFILES[id].energy.flatMap(([energy,n])=>Array(n).fill(energy))
])])));
const DAYS=Object.freeze([1,16,31,46,61,76,91]);
const FODDER=Object.freeze(['Potion','Super Potion','Pokédex','Defender','Full Heal','Maintenance','Revive','Pokémon Flute','Poké Ball']);
const count=(cards,id)=>cards.filter(card=>card===id).length;
const cardNameCount=(cards,name,catalog)=>cards.filter(id=>catalog.get(id)?.name===name).length;
function tierForDay(day){return Number.isInteger(day)&&day>=91?7:Number.isInteger(day)&&day>=76?6:Number.isInteger(day)&&day>=61?5:Number.isInteger(day)&&day>=46?4:Number.isInteger(day)&&day>=31?3:Number.isInteger(day)&&day>=16?2:1;}
const completed=(records,id)=>!!records&&typeof records==='object'&&!Array.isArray(records)&&Object.prototype.hasOwnProperty.call(records,id)&&!!records[id];
function tierForOpponent(state,npc){
 const calendar=tierForDay(state?.day);if(!PROFILES[npc])return calendar;
 const chapter=n=>['route','guest','bond'].some(kind=>completed(state?.storyDone,npc+'_'+kind+'_'+n));
 const rivalry=npc==='reina'&&state?.arcFlags;
 if(Number.isInteger(state?.day)&&state.day>=45&&(chapter(3)||(rivalry&&completed(rivalry,'reina_rival_2'))))return Math.max(calendar,3);
 if(Number.isInteger(state?.day)&&state.day>=18&&(chapter(1)||(rivalry&&completed(rivalry,'reina_rival_1'))))return Math.max(calendar,2);
 return calendar;
}
function evolutionPrerequisite(card,catalog,cards){
 if(!card?.evolvesFrom)return true;
 const parent=card.evolvesFrom;
 return cards.some(id=>{
  const found=catalog.get(id)?.name;
  return found===parent||found?.endsWith(' '+parent)||parent.endsWith(' '+found)
   ||(parent.startsWith('Dark ')&&found==='Dark '+parent.slice(5))
   ||(found?.startsWith('Dark ')&&found.slice(5)===parent);
 });
}
function insertRecipeCard(cards,id,catalog){
 const card=catalog.get(id);if(!card)throw Error('Unknown historical RPG card '+id);
 if(card.supertype==='Pokémon'){
  if(cardNameCount(cards,card.name,catalog)>=4)throw Error('RPG recipe exceeds four-copy limit for '+card.name);
  if(!evolutionPrerequisite(card,catalog,cards))throw Error('RPG recipe has no evolution prerequisite for '+card.name);
 }
 cards.push(id);
}
function removeExact(cards,id){const i=cards.indexOf(id);if(i<0)throw Error('RPG recipe upgrade cannot replace missing '+id);cards.splice(i,1);}
function replaceMany(cards,from,to,n,catalog){for(let i=0;i<n;i++){removeExact(cards,from);insertRecipeCard(cards,to,catalog);}}
function addPokemonUpgrade(cards,id,benchId,catalog){
 const card=catalog.get(id);if(!card)throw Error('Unknown historical RPG finisher '+id);
 if(!evolutionPrerequisite(card,catalog,cards))throw Error('RPG upgrade strands '+card.name);
 if(cardNameCount(cards,card.name,catalog)>=4)throw Error('RPG upgrade exceeds four-copy limit for '+card.name);
 removeExact(cards,benchId);cards.push(id);
}
function buildAuthoredRecipe(npc,tier,catalog){
 if(!Number.isInteger(tier)||tier<1||tier>7)throw Error('Invalid NPC deck tier');
 const profile=PROFILES[npc];if(!profile)return null;
 if(!(catalog instanceof Map))throw Error('NPC progression requires the authoritative card catalogue');
 const cards=[...STARTING_RECIPES[npc]];
 // Day 16: replace weak healing with reliable deck access.
 if(tier>=2)replaceMany(cards,'base1-94','base1-71',2,catalog);
 // Day 31: improve the chosen evolution plan and support Stage 2 lines.
 if(tier>=3){replaceMany(cards,'base1-77','base1-76',2,catalog);addPokemonUpgrade(cards,profile.midline,profile.bench[0],catalog);}
 // Day 46: add dependable energy access for the deck's colors.
 if(tier>=4){replaceMany(cards,'base1-90','base3-59',1,catalog);replaceMany(cards,'base1-84','base3-59',1,catalog);}
 // Day 61: add character-specific disruption or recovery.
 if(tier>=5){removeExact(cards,'base1-89');removeExact(cards,'base1-84');for(const id of profile.disruption)insertRecipeCard(cards,id,catalog);}
 // Day 76: strengthen the main line and turn energy search into premium access.
 if(tier>=6){replaceMany(cards,'base3-59','base1-71',1,catalog);replaceMany(cards,'base3-59',profile.tier6Support,1,catalog);addPokemonUpgrade(cards,profile.ace,profile.bench[1],catalog);}
 // Day 91: add the character's signature finisher.
 if(tier>=7)addPokemonUpgrade(cards,profile.finisher,profile.bench[2],catalog);
 if(cards.length!==60)throw Error(npc+' tier '+tier+' recipe has '+cards.length+' cards');
 return cards;
}
function baselineUpgrade({npc,tier,original,catalog}){
 const authored=buildAuthoredRecipe(npc,tier,catalog);if(authored)return authored;
 if(!Array.isArray(original)||original.length!==60)throw Error('NPC progression requires a valid 60-card theme deck');
 return [...original];
}
function recipeFor(args){return baselineUpgrade(args);}
function upgrade(args){return baselineUpgrade(args);}
function variantForDuel(id){let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h%3;}
function varyDeck(cards,npc,variant,catalog){
 if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('Invalid NPC deck variant');
 const out=[...cards];if(!variant)return out;
 const profile=PROFILES[npc]||PROFILES.hana,candidates=variant===1?[...profile.signatureTrainers].reverse():[...profile.signatureTrainers];
 const fallback=['base1-91','base1-88','base1-93','base1-92'];let changes=0;
 for(let i=0;i<out.length&&changes<(variant===1?4:6);i++){
  const current=catalog.get(out[i]);if(current?.supertype!=='Trainer'||!FODDER.includes(current.name))continue;
  const replacement=[...candidates,...fallback].find(id=>id!==out[i]&&catalog.get(id)?.supertype==='Trainer'&&cardNameCount(out,catalog.get(id).name,catalog)<4);
  if(replacement){out[i]=replacement;changes++;}
 }
 return out;
}
function validateRecipe(cards,catalog){
 if(!Array.isArray(cards)||cards.length!==60)return {valid:false,errors:['Deck must contain exactly 60 cards']};
 const errors=[];
 for(const id of cards)if(!catalog.has(id))errors.push('Unknown card '+id);
 const copies={};for(const id of cards){const c=catalog.get(id);if(c&&c.supertype!=='Energy'){copies[c.name]=(copies[c.name]||0)+1;if(copies[c.name]>4)errors.push('More than four copies of '+c.name);}}
 const pokemon=cards.map(id=>catalog.get(id)).filter(c=>c?.supertype==='Pokémon');
 const basics=pokemon.filter(c=>(c.subtypes||[]).some(x=>x==='Basic'||x==='Baby'));
 if(!basics.length)errors.push('Deck must contain a Basic Pokémon');
 for(const c of pokemon)if(c.evolvesFrom&&!pokemon.some(p=>p.name===c.evolvesFrom)&&!cards.some(id=>catalog.get(id)?.name===c.evolvesFrom))errors.push('No prerequisite for '+c.name);
 return {valid:errors.length===0,errors};
}
const api=Object.freeze({PROFILES,STRATEGIES,NAMES,STARTING_RECIPES,DAYS,recipeFor,tierForDay,tierForOpponent,variantForDuel,varyDeck,upgrade,baselineUpgrade,buildAuthoredRecipe,validateRecipe,count});
if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof window!=='undefined')window.NeoRpgNpcDeckProgression=api;
