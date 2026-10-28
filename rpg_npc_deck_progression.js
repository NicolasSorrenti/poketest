'use strict';
// Game-economy RPG-only NPC recipes. Classic/online/cube decks remain unchanged.
// Every upgrade keeps the character's original themed deck as the starting point.
const PROFILES=Object.freeze({
 hana:{signature:'base2-5',ace:'base2-5',trainers:['base1-77','base1-71','base1-88','base1-74']}, // Kangaskhan / setup
 reina:{signature:'base1-7',ace:'base1-7',trainers:['base1-84','base1-71','base1-93','base1-74']}, // Hitmonchan / tempo
 shiori:{signature:'base1-17',ace:'base1-17',trainers:['base1-88','base1-77','base1-71','base1-74']}, // Beedrill / evolution
 yuna:{signature:'base1-10',ace:'base1-10',trainers:['base1-84','base1-74','base1-71','base1-88']}, // Mewtwo / surprises
 akari:{trainers:['base1-79','base1-71','base1-74','base1-92']}, // disruption
 camila:{signature:'base5-25',ace:'base5-25',trimDoubleColorless:true,minBasicEnergy:14,trainers:['base1-71','base1-88','base1-77','base1-76']}, // Dark Vileplume control / Gyarados
 marina:{signature:'base2-12',ace:'base2-12',trainers:['base1-77','base1-71','base1-88','base1-74']}, // Vaporeon
 kaede:{signature:'base5-31',ace:'base5-31',supports:['base5-41','base5-25'],trimDoubleColorless:true,minBasicEnergy:14,trainers:['base1-79','base1-75','base1-71','base1-74']}, // Dark Weezing / Muk / Gyarados
 jun:{signature:'base3-21',ace:'base3-21',trainers:['base1-71','base1-79','base1-88','base1-74']},
 teo:{signature:'neo1-7',ace:'neo1-7',trainers:['base1-84','base1-88','base1-71','base1-74']},
 iris:{signature:'neo1-8',ace:'neo1-8',trainers:['base1-77','base1-71','base1-88','base1-74']},
 elio:{signature:'base3-13',ace:'base3-13',trainers:['base1-91','base1-71','base1-88','base1-77']},
 alma:{signature:'base3-10',ace:'base3-10',trainers:['base1-79','base1-71','base1-88','base1-74']},
 nereo:{signature:'neo1-8',ace:'neo1-8',trainers:['base1-77','base1-88','base1-71','base1-74']},
 rina:{trainers:['base1-84','base1-91','base1-71','base1-74']},
 sol:{trainers:['base1-77','base1-91','base1-71','base1-88']},
 jinx:{trainers:['base1-79','base1-84','base1-71','base1-74']},
 luna:{trainers:['base1-77','base1-88','base1-71','base1-74']},
 elena:{trainers:['base1-77','base1-91','base1-71','base1-74']},
sierra:{trainers:['base1-84','base1-93','base1-71','base1-74']},
 barb:{signature:'base2-5',trainers:['base1-77','base1-71','base1-88','base1-74']},
 laca:{signature:'base2-12',trainers:['base1-77','base1-71','base1-88','base1-74']},
 daisy:{signature:'base2-61',trainers:['base1-77','base1-88','base1-71','base1-74']}
});
const DEFAULT=Object.freeze({trainers:['base1-91','base1-88','base1-71','base1-74']});
const FODDER=Object.freeze(['Potion','Super Potion','Pokédex','Defender','Full Heal','Maintenance','Revive','Pokémon Flute']);
// Seven campaign tiers: a new deck package every 15 in-game days.
const tierForDay=day=>Number.isInteger(day)&&day>=91?7:Number.isInteger(day)&&day>=76?6:Number.isInteger(day)&&day>=61?5:Number.isInteger(day)&&day>=46?4:Number.isInteger(day)&&day>=31?3:Number.isInteger(day)&&day>=16?2:1;
// The calendar remains a floor. Optional, completed character chapters can move
// that character's own deck ahead, not every opponent or the player's deck.
const completed=(records,id)=>!!records&&typeof records==='object'&&!Array.isArray(records)
 &&Object.prototype.hasOwnProperty.call(records,id)&&!!records[id];
function tierForOpponent(state,npc){
 const day=state?.day,calendar=tierForDay(day);
 if(typeof npc!=='string'||!/^[a-z][a-z0-9_]*$/.test(npc))return calendar;
 const chapter=number=>['route','guest','bond'].some(kind=>completed(state?.storyDone,npc+'_'+kind+'_'+number));
 const rivalry=npc==='reina'&&state?.arcFlags;
 if(Number.isInteger(day)&&day>=45&&(chapter(3)||(rivalry&&completed(rivalry,'reina_rival_2'))))return Math.max(calendar,3);
 if(Number.isInteger(day)&&day>=18&&(chapter(1)||(rivalry&&completed(rivalry,'reina_rival_1'))))return Math.max(calendar,2);
 return calendar;
}
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
function cutFor(cards,added,catalog,kind,{trimDoubleColorless=false,minBasicEnergy=12}={}){
 const picks=[];
 // Replace situational Trainers before lowering the deck's attack-ready Energy.
 // This also applies to new signature copies, which previously always cut
 // colored Energy even when the deck still carried several weak Potions.
 if(kind==='trainer'||kind==='ace')for(const name of FODDER){
  for(let i=0;i<cards.length;i++)if(catalog.get(cards[i])?.name===name)picks.push(i);
 }
 // Rocket's main attacks require two or three specifically colored Energy.
 // Two Double Colorless cards remain available for retreat/Colorless attacks,
 // but excess copies are a safer cut than Grass/Water in this archetype.
 if(trimDoubleColorless){
  const excess=cards.filter(id=>id==='base1-96').length-2;
  if(excess>0){
   let addedSpecial=0;
   for(let i=0;i<cards.length&&addedSpecial<excess;i++)
    if(cards[i]==='base1-96'){picks.push(i);addedSpecial++;}
  }
 }
 const energyTotal=cards.filter(id=>isBasicEnergy(catalog.get(id))).length;
 // Retain at least twelve Basic Energy (additional Double Colorless cards are untouched).
 if(energyTotal>minBasicEnergy){
  const colors=[...new Set(cards.filter(id=>isBasicEnergy(catalog.get(id))))];
  colors.sort((a,b)=>count(cards,b)-count(cards,a)||a.localeCompare(b));
  for(const id of colors)for(let i=0;i<cards.length;i++)if(cards[i]===id)picks.push(i);
 }
 return picks.find(i=>cards[i]!==added)??-1;
}
// Rebuild Camila's later-season Rocket lab into the Dark Vileplume control
// archetype promised by her character profile. Every exchange is one-for-one;
// only the campaign NPC copy changes, not the shared lab or any retail deck.
const CAMILA_FOCUS=Object.freeze({
 refined:[['base5-70','base5-63'],['base5-70','base5-63'],['base5-70','base5-36'],
  ['base5-24','base5-36'],['base5-24','base5-30']],
 expert:[['base5-66','base5-63'],['base5-66','base5-36'],
  ['base5-51','base5-30'],['base5-51','base5-58']]
});
function focusCamila(cards,tier,catalog){
 const changes=[...CAMILA_FOCUS.refined,...(tier===3?CAMILA_FOCUS.expert:[])];
 const needed={};
 for(const [from] of changes)needed[from]=(needed[from]||0)+1;
 if(!Object.entries(needed).every(([id,n])=>count(cards,id)>=n))return cards;
 for(const [from,to] of changes){
  if(!catalog.has(to))throw Error('Missing historical Dark Vileplume recipe card '+to);
  cards[cards.indexOf(from)]=to;
 }
 return cards;
}
function shapeSignature(out,profile,catalog){
 const id=profile.signature;
 if(!id||!catalog.has(id)||!out.includes(id))return out;
 const card=catalog.get(id);
 let copies=out.filter(x=>x===id).length;
 // Give shared retail recipes a clear character lead by consolidating
 // existing Pokémon from that same recipe around the signature line.
 while(copies<4){
  const at=out.findIndex(x=>x!==id&&catalog.get(x)?.supertype==='Pokémon'&&catalog.get(x)?.types?.some(t=>card.types?.includes(t)));
  if(at<0)break;
  out[at]=id;copies++;
 }
 return out;
}
function baselineUpgrade({npc,tier,original,catalog}){
 if(!Array.isArray(original)||original.length!==60)throw Error('NPC progression requires a valid 60-card theme deck');
 if(!Number.isInteger(tier)||tier<1||tier>7)throw Error('Invalid NPC deck tier');
 if(!(catalog instanceof Map))throw Error('NPC progression requires the authoritative card catalogue');
 const out=[...original];
 const profile=PROFILES[npc]||DEFAULT;
 shapeSignature(out,profile,catalog);
 function insert(id,kind){
  const card=catalog.get(id);if(!card)return false;
  if(!isBasicEnergy(card)&&cardNameCount(out,card.name,catalog)>=4)return false;
  if(kind==='ace'&&!eligible(id,out,catalog))return false;
  const i=cutFor(out,id,catalog,kind,profile);
  if(i<0)return false;
  out[i]=id;return true;
 }
 // Act II: improve the signature threat and add two ways to find or support it.
 let ace=bestAce(out,catalog,profile.ace);
 if(ace)insert(ace,'ace');
 for(const id of profile.trainers.slice(0,2))insert(id,'trainer');
 // Reinforce actual evolution lines rather than only adding powerful Trainers.
 // Rocket lab's three core lines already contain compatible Basics.
 for(const id of profile.supports||[])insert(id,'ace');
 if(tier>=3){
  // Tier 3: a second signature copy plus stronger search/disruption.
  ace=bestAce(out,catalog,profile.ace);
  if(ace)insert(ace,'ace');
  for(const id of profile.trainers.slice(2,4))insert(id,'trainer');
 }
 // Tiers 4-7 keep improving the same archetype every 15 days. Replacing
 // weak situational Trainers makes later matches more consistent without
 // changing the character's Pokémon identity or energy requirements.
 if(tier>=4)for(const id of profile.trainers)insert(id,'trainer');
 if(tier>=5){ ace=bestAce(out,catalog,profile.ace); if(ace)insert(ace,'ace'); }
 if(tier>=6)for(const id of [...profile.trainers].reverse())insert(id,'trainer');
 if(tier>=7){ ace=bestAce(out,catalog,profile.ace); if(ace)insert(ace,'ace'); }
 if(npc==='camila')focusCamila(out,tier,catalog);
 // A pair of Double Colorless Energy remains useful for retreat/neutral
 // attacks; any additional copies are less useful than the colored Grass/
 // Water Energy that powers this specific Rocket archetype's attacks.
 if(profile.trimDoubleColorless&&count(original,'base1-99')>0&&count(original,'base1-102')>0){
  let extra=Math.max(0,count(out,'base1-96')-2);
  for(let i=0;i<extra;i++){
   const at=out.indexOf('base1-96');
   if(at<0)break;
   out[at]=i%2===0?'base1-99':'base1-102';
  }
 }
 return out;
}
// Keep original tier recipes as a reproducible control group. The live RPG
// applies only per-character changes evaluated in mirrored CPU duels.
const BALANCED_SWAPS=Object.freeze({
 reina:[['base1-7','base1-56'],['base1-92','base1-95'],['base1-92','base1-94'],
  ['base1-79','base1-80']],
 yuna:[['base1-58','base1-20'],['base1-58','base1-20']],
 camila:[['base5-25','base5-41'],['base5-25','base5-31'],
  ['base1-102','base1-99'],['base1-102','base1-99']]
});
function applyBalancedSwaps(out,swaps,catalog){
 for(const [from,to] of swaps){
  const position=out.indexOf(from),next=catalog.get(to);
  if(position<0||!next)throw Error('Invalid tuned NPC recipe '+from+' / '+to);
  if(next.supertype!=='Energy'&&cardNameCount(out,next.name,catalog)>=4)
   throw Error('Tuned NPC deck exceeds printed copy limit for '+next.name);
  out[position]=to;
 }
 return out;
}
function variantForDuel(id){
 let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
 return h%3;
}
function varyDeck(cards,npc,variant,catalog){
 if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('Invalid NPC deck variant');
 const out=[...cards];if(!variant)return out;
 const profile=PROFILES[npc]||DEFAULT;
 const candidates=variant===1?[...profile.trainers].reverse():[...profile.trainers];
 const extras=variant===1?['base1-91','base1-88','base1-74']:['base1-77','base1-79','base1-71'];
 let changes=0;
 for(let i=0;i<out.length&&changes<(variant===1?4:6);i++){
  const current=catalog.get(out[i]);
  if(current?.supertype!=='Trainer'||!FODDER.includes(current.name))continue;
  const replacement=[...candidates,...extras].find(id=>id!==out[i]&&catalog.get(id)?.supertype==='Trainer'&&cardNameCount(out,catalog.get(id).name,catalog)<4);
  if(replacement){out[i]=replacement;changes++;}
 }
 return out;
}
function upgrade(args){
 const out=baselineUpgrade(args);
 if(args.tier===1||!BALANCED_SWAPS[args.npc])return out;
 return applyBalancedSwaps(out,BALANCED_SWAPS[args.npc],args.catalog);
}
const api=Object.freeze({PROFILES,tierForDay,tierForOpponent,variantForDuel,varyDeck,upgrade,baselineUpgrade,eligible,count});
if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof window!=='undefined')window.NeoRpgNpcDeckProgression=api;
