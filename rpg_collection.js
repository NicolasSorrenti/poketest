'use strict';
/* RPG-owned cards and collection. No changes to the Classic reducer. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgCollection=api;})(typeof window!=='undefined'?window:null,function(){
 const expand=groups=>groups.flatMap(([n,id])=>Array(n).fill(id));
 const trainers=[[2,'base1-91'],[3,'base1-94'],[2,'base1-95'],[1,'base1-93'],[2,'base1-87'],[2,'base1-81'],[2,'base1-83'],[2,'base1-80']];
 const starters=Object.freeze([
 {id:'ember_garden',name:'Ember Garden',types:['Fire','Grass'],description:'Small fire attackers backed by growing Grass Pokémon; gradual evolution and healing.',cards:expand([[3,'base1-46'],[2,'base1-24'],[3,'base1-28'],[1,'base1-23'],[2,'base1-60'],[2,'base1-68'],[3,'base1-44'],[2,'base1-30'],[2,'base1-66'],...trainers,[13,'base1-98'],[11,'base1-99']])},
 {id:'tidal_circuit',name:'Tidal Circuit',types:['Water','Lightning'],description:'Flexible Water attackers and fragile Electric basics. Upgrade your lines to win longer matches.',cards:expand([[3,'base1-63'],[2,'base1-42'],[2,'base1-41'],[1,'base1-25'],[2,'base1-65'],[1,'base1-64'],[3,'base1-58'],[2,'base1-53'],[2,'base1-67'],[1,'base1-21'],[1,'base1-61'],...trainers,[13,'base1-102'],[11,'base1-100']])},
 {id:'mind_and_muscle',name:'Mind & Muscle',types:['Psychic','Fighting'],description:'Psychic disruption and hard-working Fighting Pokémon; few shortcuts or power rares.',cards:expand([[3,'base1-43'],[2,'base1-32'],[3,'base1-49'],[1,'base1-31'],[2,'base1-50'],[1,'base1-29'],[3,'base1-52'],[2,'base1-34'],[2,'base1-62'],[1,'base1-56'],...trainers,[13,'base1-101'],[11,'base1-97']])}
 ]);
 const byId=new Map(starters.map(s=>[s.id,s]));
 const upgrade=['base1-88','base1-84','base1-93','base1-91','base1-95','base1-23','base1-12','base1-14','base1-25','base1-64','base1-9','base1-21','base1-32','base1-29','base1-34','base1-19','base1-30','base1-42','base1-77','base1-92','base1-94','base1-81','base1-82','base1-90','base1-46','base1-44','base1-63','base1-58','base1-43','base1-52','base1-98','base1-99','base1-100','base1-102','base1-101','base1-97'];
 const poolByStarter={
  ember_garden:['base1-12','base1-23','base1-24','base1-30','base1-44','base1-45','base1-46','base1-54','base1-60','base1-66','base1-68','base1-81','base1-82','base1-83','base1-84','base1-88','base1-91','base1-92','base1-93','base1-94','base1-95','base1-98','base1-99'],
  tidal_circuit:['base1-9','base1-14','base1-21','base1-25','base1-35','base1-38','base1-41','base1-42','base1-53','base1-58','base1-59','base1-63','base1-64','base1-65','base1-67','base1-81','base1-82','base1-84','base1-88','base1-91','base1-92','base1-93','base1-94','base1-95','base1-100','base1-102'],
  mind_and_muscle:['base1-19','base1-29','base1-31','base1-32','base1-34','base1-43','base1-47','base1-49','base1-50','base1-52','base1-56','base1-62','base1-81','base1-82','base1-84','base1-88','base1-91','base1-92','base1-93','base1-94','base1-95','base1-97','base1-101']
 };
 const SETS=Object.freeze({base1:{name:'Base Set',size:102,rares:16},base2:{name:'Jungle',size:64,rares:16},base3:{name:'Fossil',size:62,rares:15},neo1:{name:'Neo Genesis',size:111,rares:19},neo2:{name:'Neo Discovery',size:75,rares:17},neo3:{name:'Neo Revelation',size:66,rares:14},neo4:{name:'Neo Destiny',size:113,rares:16}});
 const CHARACTER_SETS=Object.freeze({hana:'base1',reina:'base3',shiori:'neo2',yuna:'base2',akari:'neo1',camila:'base3',marina:'neo3',kaede:'neo4',jinx:'neo4',luna:'neo3'});
 const ENERGY=new Set(['base1-96','base1-97','base1-98','base1-99','base1-100','base1-101','base1-102']);
 const allAllowed=new Set([...starters.flatMap(s=>s.cards),...upgrade,...Object.keys(SETS).flatMap(set=>Array.from({length:SETS[set].size},(_,i)=>set+'-'+(i+1)))]);
 const rank=ids=>Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(x=>x===id).length]));
 const chooseRandom=(list,rng=Math.random)=>list[Math.min(list.length-1,Math.floor(Math.max(0,rng())*list.length))];
 const setForCharacter=id=>{if(!id)return 'base1';if(CHARACTER_SETS[id])return CHARACTER_SETS[id];const sets=Object.keys(SETS);let hash=2166136261;for(const letter of id){hash^=letter.charCodeAt(0);hash=Math.imul(hash,16777619);}return sets[(hash>>>0)%sets.length];};
 function randomPack(set,rng=Math.random){
  const info=SETS[set]||SETS.base1,actual=SETS[set]?set:'base1';
  const rare=chooseRandom(Array.from({length:info.rares},(_,i)=>actual+'-'+(i+1)),rng);
  // Energy is guaranteed even when the expansion has no Basic Energy printing.
  const energy=chooseRandom([...ENERGY].filter(id=>id!=='base1-96'),rng);
  const all=Array.from({length:info.size-info.rares},(_,i)=>actual+'-'+(info.rares+i+1)).filter(id=>!ENERGY.has(id));
  const cards=[rare,energy];
  for(let i=0;i<8;i++)cards.push(chooseRandom(all,rng));
  // Shuffle so the guaranteed cards are not revealed in a fixed position.
  for(let i=cards.length-1;i>0;i--){const j=Math.min(i,Math.floor(Math.max(0,rng())*(i+1)));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
 }
 function fresh(){return {starter:null,owned:{},deck:[],draft:null,packs:0,rewards:0,lastPack:null};}
 function hydrate(state){
  const x=state.deckJourney;if(x===null||x===undefined)return state;
  if(!x||typeof x!=='object'||Array.isArray(x)){state.deckJourney=fresh();return state}
  if(!byId.has(x.starter)){state.deckJourney=fresh();return state}
  if(!x.owned||typeof x.owned!=='object'||Array.isArray(x.owned))x.owned={};
  for(const id of Object.keys(x.owned))if(!allAllowed.has(id)||!Number.isInteger(x.owned[id])||x.owned[id]<0||x.owned[id]>999)delete x.owned[id];
  x.deck=Array.isArray(x.deck)&&x.deck.length===60?x.deck.filter(id=>allAllowed.has(id)):byId.get(x.starter).cards.slice();
  if(x.deck.length!==60)x.deck=byId.get(x.starter).cards.slice();
  for(const [id,n] of Object.entries(rank(x.deck)))x.owned[id]=Math.max(n,x.owned[id]||0);
  if(!Array.isArray(x.draft)||x.draft.length>60||x.draft.some(id=>!allAllowed.has(id)))x.draft=null;
  if(!x.lastPack||!Array.isArray(x.lastPack.cards)||![5,10].includes(x.lastPack.cards.length)||x.lastPack.cards.some(id=>!allAllowed.has(id)))x.lastPack=null;
  else{x.lastPack.source=x.lastPack.source==='win'?'win':'shop';x.lastPack.opened=x.lastPack.opened===true;}
  x.packs=Number.isInteger(x.packs)&&x.packs>=0?x.packs:0;x.rewards=Number.isInteger(x.rewards)&&x.rewards>=0?x.rewards:0;
  return state;
 }
 function choose(state,id){if(state.deckJourney?.starter)throw Error('Starter deck already chosen');
  const starter=byId.get(id);if(!starter)throw Error('Choose one of the three starter decks');
  state.deckJourney={starter:id,owned:rank(starter.cards),deck:[...starter.cards],draft:null,packs:0,rewards:0,lastPack:null};state.playerDeck='custom';
  return starter;
 }
 function check(deck,owned){
  const errors=[];
  if(!Array.isArray(deck)||deck.length!==60)errors.push('The deck must contain exactly 60 cards.');
  const counts=rank(Array.isArray(deck)?deck:[]);
  for(const [id,n] of Object.entries(counts)){
   if(!allAllowed.has(id))errors.push('Unknown campaign card '+id);
   if(n>(owned?.[id]||0))errors.push('You do not own '+n+' copies of '+id);
   if(!ENERGY.has(id)&&n>4)errors.push('Four-copy limit exceeded for '+id);
  }
  const basics=new Set(['base1-46','base1-28','base1-60','base1-68','base1-44','base1-66','base1-63','base1-41','base1-65','base1-58','base1-53','base1-67','base1-61','base1-43','base1-49','base1-31','base1-50','base1-52','base1-62','base1-56']);
  if(!Object.keys(counts).some(id=>basics.has(id)))errors.push('You need at least one Basic Pokémon.');
  return {valid:errors.length===0,errors,counts};
 }
 function draft(state){hydrate(state);const x=state.deckJourney;if(!x?.starter)throw Error('Choose a starter first');
  if(!x.draft)x.draft=[...x.deck];return x.draft;
 }
 function change(state,remove,add){const x=state.deckJourney;draft(state);
  if(remove===add)throw Error('Choose two different cards');
  const at=x.draft.indexOf(remove);
  if(at<0||!allAllowed.has(add))throw Error('Choose a card to replace and one you own');
  const updated=[...x.draft];updated.splice(at,1,add);
  const v=check(updated,x.owned);if(!v.valid)throw Error(v.errors[0]);
  x.draft=updated;return updated;
 }
 function edit(state,id,quantity){
  const x=state.deckJourney,prior=draft(state);
  if(!allAllowed.has(id)||!Number.isInteger(quantity)||Math.abs(quantity)!==1)throw Error('Invalid deck edit');
  const updated=[...prior],counts=rank(updated);
  if(quantity<0){
   const at=updated.lastIndexOf(id);if(at<0)throw Error('This card is not in your deck');
   updated.splice(at,1);
  }else{
   if(updated.length>=60)throw Error('Remove a card before adding another');
   if((counts[id]||0)>=(x.owned[id]||0))throw Error('You do not own another copy of this card');
   if(!ENERGY.has(id)&&(counts[id]||0)>=4)throw Error('Four-copy limit reached');
   updated.push(id);
  }
  x.draft=updated;return updated;
 }
 function save(state){const x=state.deckJourney;draft(state);const v=check(x.draft,x.owned);
  if(!v.valid)throw Error(v.errors.join(' '));x.deck=[...x.draft];x.draft=null;return x.deck;
 }
 function cancel(state){if(state.deckJourney)state.deckJourney.draft=null}
 function grant(x,ids,source,set,giver){
  for(const id of ids)x.owned[id]=(x.owned[id]||0)+1;
  x.lastPack={cards:[...ids],source,set,giver:giver||null,opened:false};
  return ids;
 }
 function reward(state,win,giver=null,rng=Math.random){
  const x=state.deckJourney;
  if(!x?.starter||!win)return null;
  const set=setForCharacter(giver),ids=randomPack(set,rng);
  x.rewards++;
  return grant(x,ids,'win',set,giver);
 }
 function buyPack(state){const x=state.deckJourney;
  if(!x?.starter)throw Error('Choose your starter before opening packs');
  if(state.location!=='shop'||state.day>90)throw Error('Buy booster packs at the card shop');
  if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.activeSituation||state.activeArc||state.activeEncounter)throw Error('Finish the current scene first');
  if((state.credits||0)<20)throw Error('A training pack costs 20 credits');
  const set='base1',ids=randomPack(set);
  state.credits-=20;x.packs++;return grant(x,ids,'shop',set,null);
 }
 return Object.freeze({starters,upgrade,ENERGY,SETS,CHARACTER_SETS,setForCharacter,randomPack,byId:id=>byId.get(id),fresh,hydrate,choose,check,draft,edit,change,save,cancel,reward,buyPack,rank});
});
