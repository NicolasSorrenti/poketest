'use strict';
/* Collection economy and 60-card legal deck editing for the RPG. No Pokémon rules are implemented here. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoHarborMarket=api;
})(typeof window!=='undefined'?window:null,function(){
 const PACK_PRICE=18,BASE_ENERGY=new Set(['Fire Energy','Water Energy','Grass Energy','Lightning Energy','Psychic Energy','Fighting Energy']);
 function normalize(state){
  if(!state.collection||typeof state.collection!=='object')state.collection={};
  const c=state.collection;
  if(!c.owned||typeof c.owned!=='object')c.owned={};
  if(!c.draft||typeof c.draft!=='object')c.draft={};
  if(!c.customDeck)c.customDeck=null;
  if(!Number.isInteger(c.packsOpened))c.packsOpened=0;
  if(!Number.isInteger(c.purchases))c.purchases=0;
  if(!('starterReady' in c))c.starterReady=false;
  if(!c.packLog)c.packLog=[];
  return c;
 }
 function sum(counts){return Object.values(counts).reduce((n,value)=>n+(Number(value)||0),0);}
 function counted(ids){const result={};for(const id of ids){if(typeof id!=='string')throw Error('Card id must be a string');result[id]=(result[id]||0)+1;}return result;}
 function seedStarter(state,ids){
  const c=normalize(state);
  if(c.starterReady)return false;
  if(!Array.isArray(ids)||ids.length!==60)throw Error('Starter must be an actual 60-card theme deck');
  const initial=counted(ids);for(const [id,qty] of Object.entries(initial))c.owned[id]=(c.owned[id]||0)+qty;
  c.draft={...initial};c.starterReady=true;return true;
 }
 function catalog(cards){
  const result=new Map();
  for(const card of cards||[])if(card&&typeof card.id==='string'&&typeof card.name==='string'){
   result.set(card.id,{id:card.id,name:card.name,supertype:card.supertype||'',subtypes:card.subtypes||[],number:Number((card.id.match(/-(\d+)$/)||[])[1])||0});
  }
  return result;
 }
 function price(card){
  if(!card)return 7;
  if(card.supertype==='Energy')return BASE_ENERGY.has(card.name)?3:15;
  if(card.subtypes.includes('Stage 2'))return 24;
  if(card.subtypes.includes('Stage 1'))return 13;
  if(card.supertype==='Trainer')return card.number>0&&card.number<30?18:9;
  return card.number>0&&card.number<=16?18:7;
 }
 function singles(state,cards){
  const pool=[...cards.values()].filter(c=>c.supertype!=='Energy'||!BASE_ENERGY.has(c.name));
  if(!pool.length)return [];
  const seen=new Set(),pick=[],seed=Math.max(1,state.day||1)*73+7;
  for(let n=0;n<Math.min(200,pool.length*3)&&pick.length<6;n++){
   const card=pool[(seed+n*37+(n*n)*7)%pool.length];
   if(!seen.has(card.id)){pick.push({...card,price:price(card)});seen.add(card.id);}
  }
  return pick;
 }
 function buySingle(state,cardId,cards){
  const c=normalize(state),item=singles(state,cards).find(x=>x.id===cardId);
  if(!item)throw Error('Card is not in today’s singles selection');
  if((state.credits||0)<item.price)throw Error('Not enough credits');
  state.credits-=item.price;c.owned[cardId]=(c.owned[cardId]||0)+1;c.purchases++;
  return item;
 }
 function nextRandom(seed){return (Math.imul(seed,1664525)+1013904223)>>>0;}
 function buyPack(state,cards){
  const c=normalize(state),pool=[...cards.values()];
  if(!c.starterReady)throw Error('Starter deck still loading');
  if(pool.length<30)throw Error('Card catalog is not available');
  if((state.credits||0)<PACK_PRICE)throw Error('Not enough credits for a booster');
  let seed=(Math.imul(state.day||1,99991)+Math.imul(c.packsOpened+1,8191))>>>0;
  const cardsByTier=[
   pool.filter(x=>x.supertype==='Energy'),
   pool.filter(x=>x.supertype==='Trainer'||x.subtypes.includes('Stage 1')),
   pool.filter(x=>x.subtypes.includes('Stage 2')||(x.number>0&&x.number<=16)),
   pool.filter(x=>x.supertype==='Pokémon'&&!x.subtypes.includes('Stage 2'))
  ];
  const types=[3,3,3,3,1,1,2,0],ids=[];
  for(const type of types){
   const category=cardsByTier[type].length?cardsByTier[type]:pool;
   seed=nextRandom(seed);
   const card=category[seed%category.length];ids.push(card.id);
  }
  // Atomic acquisition: only alter the player's wallet after all cards are resolved.
  state.credits-=PACK_PRICE;
  for(const id of ids)c.owned[id]=(c.owned[id]||0)+1;
  c.packsOpened++;c.packLog.unshift({day:state.day,cards:ids});
  c.packLog=c.packLog.slice(0,10);
  return ids.map(id=>cards.get(id));
 }
 function cardMax(card){return card&&BASE_ENERGY.has(card.name)&&card.supertype==='Energy'?60:4;}
 function adjustDraft(state,cardId,delta,cards){
  const c=normalize(state),card=cards.get(cardId);
  if(!card)throw Error('Unknown card');
  if(delta!==1&&delta!==-1)throw Error('Invalid card adjustment');
  const now=c.draft[cardId]||0,next=now+delta;
  if(next<0||next>(c.owned[cardId]||0))throw Error('You do not own enough copies');
  if(next>cardMax(card))throw Error('Four-copy limit');
  if(delta>0&&sum(c.draft)>=60)throw Error('Deck already has 60 cards; remove one first');
  if(next===0)delete c.draft[cardId];else c.draft[cardId]=next;
  return sum(c.draft);
 }
 function validateDeck(state,cards){
  const c=normalize(state),errors=[],byName={};
  if(sum(c.draft)!==60)errors.push('Your deck must contain exactly 60 cards');
  for(const [id,qty] of Object.entries(c.draft)){
   const card=cards.get(id);
   if(!card)errors.push('Unknown card '+id);
   if(!Number.isInteger(qty)||qty<1||qty>(c.owned[id]||0))errors.push('Not enough owned copies of '+id);
   if(card){
    byName[card.name]=(byName[card.name]||0)+qty;
    if(qty>cardMax(card))errors.push('Too many copies of '+card.name);
   }
  }
  for(const [name,qty] of Object.entries(byName))if(!BASE_ENERGY.has(name)&&qty>4)errors.push('More than four '+name+' across printings');
  const basics=Object.entries(c.draft).some(([id,qty])=>qty>0&&cards.get(id)?.supertype==='Pokémon'&&cards.get(id)?.subtypes.includes('Basic'));
  if(!basics)errors.push('A deck needs at least one Basic Pokémon');
  return errors;
 }
 function saveDeck(state,cards){
  const errors=validateDeck(state,cards);if(errors.length)throw Error(errors[0]);
  normalize(state).customDeck=Object.entries(state.collection.draft).flatMap(([id,qty])=>Array(qty).fill(id));
  state.playerDeck='custom';return state.collection.customDeck;
 }
 return Object.freeze({PACK_PRICE,normalize,counted,sum,seedStarter,catalog,price,singles,buySingle,buyPack,adjustDraft,validateDeck,saveDeck});
});
