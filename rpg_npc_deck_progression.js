'use strict';
// Game-economy RPG-only NPC recipes. Classic/online/cube decks remain unchanged.
// Every upgrade keeps the character's original themed deck as the starting point.
const PROFILES=Object.freeze({
 hana:{ace:'base2-5',trainers:['base1-77','base1-71','base1-88','base1-74']}, // Kangaskhan / setup
 reina:{ace:'base1-7',trainers:['base1-84','base1-71','base1-93','base1-74']}, // Hitmonchan / tempo
 shiori:{ace:'base1-17',trainers:['base1-88','base1-77','base1-71','base1-74']}, // Beedrill / evolution
 yuna:{ace:'base1-10',trainers:['base1-84','base1-74','base1-71','base1-88']}, // Mewtwo / surprises
 akari:{trainers:['base1-79','base1-71','base1-74','base1-92']}, // disruption
 camila:{ace:'base5-25',trainers:['base1-79','base1-71','base1-75','base1-74']}, // Dark Gyarados
 marina:{ace:'base2-12',trainers:['base1-77','base1-71','base1-88','base1-74']}, // Vaporeon
 kaede:{ace:'base5-31',trainers:['base1-79','base1-75','base1-71','base1-74']}, // Dark Weezing
 jun:{ace:'base3-21',trainers:['base1-71','base1-79','base1-88','base1-74']},
 teo:{ace:'neo1-7',trainers:['base1-84','base1-88','base1-71','base1-74']},
 iris:{ace:'neo1-8',trainers:['base1-77','base1-71','base1-88','base1-74']},
 elio:{ace:'base3-13',trainers:['base1-91','base1-71','base1-88','base1-77']},
 alma:{ace:'base3-10',trainers:['base1-79','base1-71','base1-88','base1-74']},
 nereo:{ace:'neo1-8',trainers:['base1-77','base1-88','base1-71','base1-74']},
 rina:{trainers:['base1-84','base1-91','base1-71','base1-74']},
 sol:{trainers:['base1-77','base1-91','base1-71','base1-88']},
 jinx:{trainers:['base1-79','base1-84','base1-71','base1-74']},
 luna:{trainers:['base1-77','base1-88','base1-71','base1-74']},
 elena:{trainers:['base1-77','base1-91','base1-71','base1-74']},
 sierra:{trainers:['base1-84','base1-93','base1-71','base1-74']}
});
const DEFAULT=Object.freeze({trainers:['base1-91','base1-88','base1-71','base1-74']});
const FODDER=Object.freeze(['Potion','Super Potion','Pokédex','Defender','Full Heal','Maintenance','Revive','Pokémon Flute']);
const tierForDay=day=>Number.isInteger(day)&&day>=61?3:Number.isInteger(day)&&day>=31?2:1;
const count=(cards,id)=>cards.filter(c=>c===id).length;
const isBasicEnergy=card=>card?.supertype==='Energy'&&/^(Fire|Grass|Water|Lightning|Fighting|Psychic) Energy$/.test(card.name||'');
const cardNameCount=(cards,name,catalog)=>cards.filter(id=>catalog.get(id)?.name===name).length;
function eligible(cardId,cards,catalog){
 const card=catalog.get(cardId);
 if(!card||card.supertype!=='Pokémon'||cardNameCount(cards,card.name,catalog)>=4)return false;
 if(!card.evolvesFrom)return true;
 // Prevent adding an evolution when its prerequisite isn't already in the recipe.
 return cards.some(id=>catalog.get(id)?.name===card.evolvesFrom);
}
function bestAce(cards,catalog,preferred){
 if(preferred&&cards.includes(preferred)&&eligible(preferred,cards,catalog))return preferred;
 const unique=[...new Set(cards)].filter(id=>eligible(id,cards,catalog));
 unique.sort((a,b)=>{
  const card=id=>catalog.get(id);
  const score=id=>((card(id).subtypes||[]).includes('Stage 2')?100:0)+
   ((card(id).subtypes||[]).includes('Stage 1')?40:0)+(Number(card(id).hp)||0);
  return score(b)-score(a)||a.localeCompare(b);
 });
 return unique[0]||null;
}
function cutFor(cards,added,catalog,kind){
 const picks=[];
 // Trainer upgrades replace redundant healing/low-impact support before reducing Energy.
 if(kind==='trainer')for(const name of FODDER){
  for(let i=0;i<cards.length;i++)if(catalog.get(cards[i])?.name===name)picks.push(i);
 }
 const energyTotal=cards.filter(id=>isBasicEnergy(catalog.get(id))).length;
 // Retain at least twelve Basic Energy (additional Double Colorless cards are untouched).
 if(energyTotal>12){
  const colors=[...new Set(cards.filter(id=>isBasicEnergy(catalog.get(id))))];
  colors.sort((a,b)=>count(cards,b)-count(cards,a)||a.localeCompare(b));
  for(const id of colors)for(let i=0;i<cards.length;i++)if(cards[i]===id)picks.push(i);
 }
 // Rare case: retain the deck's composition but trade a low-impact Trainer for the ace.
 if(kind==='ace')for(const name of FODDER){
  for(let i=0;i<cards.length;i++)if(catalog.get(cards[i])?.name===name)picks.push(i);
 }
 return picks.find(i=>cards[i]!==added)??-1;
}
function upgrade({npc,tier,original,catalog}){
 if(!Array.isArray(original)||original.length!==60)throw Error('NPC progression requires a valid 60-card theme deck');
 if(!Number.isInteger(tier)||tier<1||tier>3)throw Error('Invalid NPC deck tier');
 if(!(catalog instanceof Map))throw Error('NPC progression requires the authoritative card catalogue');
 const out=[...original];
 if(tier===1)return out;
 const profile=PROFILES[npc]||DEFAULT;
 function insert(id,kind){
  const card=catalog.get(id);if(!card)return false;
  if(!isBasicEnergy(card)&&cardNameCount(out,card.name,catalog)>=4)return false;
  if(kind==='ace'&&!eligible(id,out,catalog))return false;
  const i=cutFor(out,id,catalog,kind);
  if(i<0)return false;
  out[i]=id;return true;
 }
 // Act II: improve the signature threat and add two ways to find or support it.
 let ace=bestAce(out,catalog,profile.ace);
 if(ace)insert(ace,'ace');
 for(const id of profile.trainers.slice(0,2))insert(id,'trainer');
 if(tier===3){
  // Act III: a second signature copy plus stronger search/disruption.
  ace=bestAce(out,catalog,profile.ace);
  if(ace)insert(ace,'ace');
  for(const id of profile.trainers.slice(2,4))insert(id,'trainer');
 }
 return out;
}
module.exports=Object.freeze({PROFILES,tierForDay,upgrade,eligible,count});
