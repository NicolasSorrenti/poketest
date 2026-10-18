'use strict';
// Cube Draft foundations. The eligible universe is deliberately restricted to
// cards in the 28 historically tested theme decks, NOT the entire imported DB.
// Handler checks are conservative but do not certify rare cross-card interactions.
const {CATALOG}=require('./headless_duel');
const {isEnergy,isBasicPokemon}=require('./core_rules');
const {list:authentic}=require('./authentic_decks');
const RETAIL=require('./retail_theme_decks');
const GENESIS=require('./neo_genesis_decks');
const DISCOVERY=require('./neo_discovery_decks');
const DESTINY=require('./neo_destiny_decks');
const A=require('./attack_effects_core');
const P=require('./classic_power_core');
const T=require('./classic_trainer_core');
const themes=['base1:Blackout','base1:Brushfire','base1:Overgrowth','base1:Zap!','base2:Power Reserve','base2:Water Blast'];
const sourceDecks=()=>[
 ...themes.map(x=>authentic(x)),
 ...[RETAIL,GENESIS,DISCOVERY,DESTINY].flatMap(mod=>mod.entries.map(e=>mod.list(e.id)))
];
function supported(id){
 const c=CATALOG.get(id);
 if(!c||isEnergy(c))return false;
 if(c.supertype==='Trainer')return T.SUPPORTED.has(c.name);
 if(c.supertype!=='Pokémon')return false;
 return (c.attacks||[]).every(a=>!!A.compile(a))&&
 (c.abilities||[]).every(a=>[P.ACTIVATED,P.PASSIVE,P.ONPLAY].some(x=>x.has(a.name)));
}
function eligibleIds(){
 const ids=new Set(sourceDecks().flat().filter(supported));
 return [...ids].sort();
}
// Deterministic seeded Fisher-Yates. Seed used ONLY to reproduce draft tests.
function random(seed){
 let x=seed>>>0;
 return ()=>{x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
function shuffle(input,rng){const a=[...input];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makePool({size=240,seed=1}={}){
 if(!Number.isInteger(size)||size<60||size>720||!Number.isSafeInteger(seed)||seed<0)throw Error('Invalid cube configuration');
 const ids=eligibleIds(),pokemon=ids.filter(id=>CATALOG.get(id).supertype==='Pokémon'),trainers=ids.filter(id=>CATALOG.get(id).supertype==='Trainer');
 if(!pokemon.length||!trainers.length)throw Error('Insufficient verified cards');
 const rng=random(seed),wantedPokemon=Math.round(size*.65);
 // Card duplicates are intentional: unlike singleton Magic cubes, evolution
 // lines require multiple Basics and Stage 1 cards to draft playable decks.
 function expand(items,wanted){
  const result=[];let bag=shuffle(items,rng);
  while(result.length<wanted){if(!bag.length)bag=shuffle(items,rng);result.push(bag.pop());}
  return result;
 }
 return shuffle([...expand(pokemon,wantedPokemon),...expand(trainers,size-wantedPokemon)],rng);
}
function makeDraft({players=4,packs=4,cardsPerPack=15,seed=1,pool}={}){
 if(!Number.isInteger(players)||players<2||players>8||!Number.isInteger(packs)||packs<1||packs>8||!Number.isInteger(cardsPerPack)||cardsPerPack<5||cardsPerPack>20)throw Error('Invalid draft settings');
 const count=players*packs*cardsPerPack;
 const cards=pool? [...pool]:makePool({size:Math.max(240,count),seed});
 if(cards.length<count||cards.some(id=>!supported(id)))throw Error('Cube contains unsupported cards or is too small');
 const order=shuffle(cards,random(seed^0xabcdef));
 const rounds=Array.from({length:packs},(_,i)=>Array.from({length:players},(_,seat)=>order.slice((i*players+seat)*cardsPerPack,(i*players+seat+1)*cardsPerPack)));
 return {players,packs,cardsPerPack,rounds,round:0,pick:0,available:rounds[0].map(a=>[...a]),picks:Array.from({length:players},()=>[]),done:false};
}
function draftPick(state,seat,id){
 if(state.done)throw Error('Draft finished');
 if(!Number.isInteger(seat)||seat<0||seat>=state.players)throw Error('Invalid seat');
 if(state.picks[seat].length!==state.round*state.cardsPerPack+state.pick)throw Error('Seat already picked');
 const pack=state.available[seat],index=pack.indexOf(id);
 if(index<0)throw Error('Card not in current pack');
 pack.splice(index,1);state.picks[seat].push(id);
 if(state.picks.every(p=>p.length===(state.round*state.cardsPerPack+state.pick+1))){
  if(state.pick+1===state.cardsPerPack){
   state.round++;state.pick=0;
   if(state.round===state.packs){state.done=true;state.available=[];return state;}
   state.available=state.rounds[state.round].map(a=>[...a]);
  }else{
   const direction=state.round%2===0?1:-1;
   const passed=state.available.map(a=>[...a]);
   state.available=passed.map((_,seat)=>passed[(seat-direction+state.players)%state.players]);
   state.pick++;
  }
 }
 return state;
}
function availableForSeat(state,seat){return state.done?[]:[...state.available[seat]];}
// Deck assembly accepts drafted non-Energy IDs and any basic Energy (provided externally).
function validateBuild(drafted,deck,{deckSize=40}={}){
 if(!Array.isArray(drafted)||!Array.isArray(deck)||deck.length!==deckSize)return {valid:false,reason:'Wrong deck size'};
 const counts=new Map();
 for(const id of drafted)counts.set(id,(counts.get(id)||0)+1);
 let basics=0;
 for(const id of deck){
  const c=CATALOG.get(id);
  if(!c)return {valid:false,reason:'Unknown card '+id};
  if(isBasicPokemon(c))basics++;
  if(isEnergy(c)&&/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(c.name))continue;
  const n=counts.get(id)||0;
  if(!n)return {valid:false,reason:'Card was not drafted: '+id};
  counts.set(id,n-1);
 }
 return basics?{valid:true}:{valid:false,reason:'At least one Basic Pokémon is required'};
}
module.exports={supported,eligibleIds,makePool,makeDraft,draftPick,availableForSeat,validateBuild};
