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
 const SETS=Object.freeze({
  base1:{name:'Base Set',size:102,rares:16},
  base2:{name:'Jungle',size:64,rares:16},
  base3:{name:'Fossil',size:62,rares:15},
  base4:{name:'Base Set 2',size:130,rares:20},
  base5:{name:'Team Rocket',size:83,rares:17},
  gym1:{name:'Gym Heroes',size:132,rares:19},
  gym2:{name:'Gym Challenge',size:132,rares:20},
  neo1:{name:'Neo Genesis',size:111,rares:19},
  neo2:{name:'Neo Discovery',size:75,rares:17},
  neo3:{name:'Neo Revelation',size:66,rares:14},
  neo4:{name:'Neo Destiny',size:113,rares:16}
 });
 // Every product can be obtained by day progression, relationships, or earlier accomplishments.
 // No rare card / collection-completion grind is necessary to finish the story.
 const SHOP_OFFERS=Object.freeze([
  {set:'base1',price:20,day:1,description:'The foundations of competitive play.'},
  {set:'base2',price:25,day:8,npc:'yuna',description:'Jungle partners and unexpected tricks.'},
  {set:'base3',price:25,day:14,npc:'reina',description:'Ancient Pokémon and fossil strategies.'},
  {set:'base4',price:28,day:17,npc:'hana',description:'Classic reprints for familiar strategies.'},
  {set:'base5',price:30,day:22,npc:'camila',description:'Dark evolutions and mischievous disruption.'},
  {set:'gym1',price:35,day:33,npc:'hana',cup:'neighborhood',description:'Leader Pokémon with their own tactics.'},
  {set:'gym2',price:38,day:43,npc:'akari',cup:'neighborhood',description:'Gym battles and signature strategies.'},
  {set:'neo1',price:40,day:48,npc:'akari',cup:'regional',description:'Johto discoveries and evolving teams.'},
  {set:'neo2',price:45,day:58,npc:'shiori',description:'New evolutions and precise tactics.'},
  {set:'neo3',price:50,day:68,npc:'marina',cup:'regional',description:'Powerful choices from Johto.'},
  {set:'neo4',price:55,day:80,npc:'kaede',cup:'championship',description:'High-stakes cards for the season finale.'}
 ]);

 const CHARACTER_SETS=Object.freeze({hana:'base1',reina:'base3',shiori:'neo2',yuna:'base2',akari:'neo1',camila:'base5',marina:'neo3',kaede:'neo4',jinx:'neo4',luna:'neo3',elena:'base2',rina:'base1',sierra:'base5',sol:'base1',jun:'base3',teo:'base2',iris:'neo1',elio:'base3',alma:'base2',nereo:'neo3'});
 const ENERGY=new Set(['base1-96','base1-97','base1-98','base1-99','base1-100','base1-101','base1-102']);
 const allAllowed=new Set([...starters.flatMap(s=>s.cards),...upgrade,...Object.keys(SETS).flatMap(set=>Array.from({length:SETS[set].size},(_,i)=>set+'-'+(i+1)))]);
 const rank=ids=>Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(x=>x===id).length]));
 const chooseRandom=(list,rng=Math.random)=>list[Math.min(list.length-1,Math.floor(Math.max(0,rng())*list.length))];
 // Historical rarity indexes sourced from PokemonTCG/pokemon-tcg-data/cards/en.
 // Includes Rare Trainers, duplicate non-holo rares and Shining/Secret printings.
 const PACK_RARITIES=Object.freeze({"base1":{"holo":[[1,16]],"rare":[[17,22],[70,79]],"uncommon":[[23,42],[80,90],[96,96]],"common":[[43,69],[91,95]],"secret":[],"energy":[[97,102]]},"base2":{"holo":[[1,16]],"rare":[[17,32]],"uncommon":[[33,48]],"common":[[49,64]],"secret":[],"energy":[]},"base3":{"holo":[[1,15]],"rare":[[16,30]],"uncommon":[[31,45],[58,58]],"common":[[46,57],[59,62]],"secret":[],"energy":[]},"base4":{"holo":[[1,20]],"rare":[[21,32],[101,108]],"uncommon":[[33,64],[109,117],[124,124]],"common":[[65,100],[118,123]],"secret":[],"energy":[[125,130]]},"base5":{"holo":[[1,17]],"rare":[[18,31],[71,72],[80,80]],"uncommon":[[32,48],[73,77],[81,82]],"common":[[49,70],[78,79]],"secret":[[83,83]],"energy":[]},"gym1":{"holo":[[1,19]],"rare":[[20,34],[97,104]],"uncommon":[[35,60],[105,120]],"common":[[61,96],[121,126]],"secret":[],"energy":[[127,132]]},"gym2":{"holo":[[1,20]],"rare":[[21,30],[100,110]],"uncommon":[[31,59],[111,123]],"common":[[60,99],[124,126]],"secret":[],"energy":[[127,132]]},"neo1":{"holo":[[1,19]],"rare":[[20,25],[83,90],[104,105]],"uncommon":[[26,52],[91,98]],"common":[[53,82],[99,103]],"secret":[],"energy":[[106,111]]},"neo2":{"holo":[[1,17]],"rare":[[18,36]],"uncommon":[[37,52],[72,74]],"common":[[53,71],[75,75]],"secret":[],"energy":[]},"neo3":{"holo":[[1,14]],"rare":[[15,27]],"uncommon":[[28,40],[60,63]],"common":[[41,59],[64,64]],"secret":[[65,66]],"energy":[]},"neo4":{"holo":[[1,16]],"rare":[[17,30],[92,96]],"uncommon":[[31,60],[97,103]],"common":[[61,91],[104,105]],"secret":[[106,113]],"energy":[]}});
 const expandRanges=(set,ranges)=>ranges.flatMap(([from,to])=>Array.from({length:to-from+1},(_,i)=>set+'-'+(from+i)));
 const PACK_POOLS=Object.freeze(Object.fromEntries(Object.entries(PACK_RARITIES).map(([set,groups])=>
  [set,Object.fromEntries(Object.entries(groups).map(([rarity,ranges])=>[rarity,expandRanges(set,ranges)]))])));
 const packRarity=id=>{
  if(typeof id!=='string')return null;
  const split=id.lastIndexOf('-'),pool=PACK_POOLS[id.slice(0,split)];
  return pool?(Object.keys(pool).find(rarity=>pool[rarity].includes(id))||null):null;
 };
 const setForCharacter=id=>{if(!id)return 'base1';if(CHARACTER_SETS[id])return CHARACTER_SETS[id];const sets=Object.keys(SETS);let hash=2166136261;for(const letter of id){hash^=letter.charCodeAt(0);hash=Math.imul(hash,16777619);}return sets[(hash>>>0)%sets.length];};
 function randomPack(set,rng=Math.random,count=10){
  if(count!==5&&count!==10)throw Error('Only five- and ten-card packs are supported');
  const actual=PACK_POOLS[set]?set:'base1',pool=PACK_POOLS[actual];
  // Tuned game probabilities: 25% holo, plus 1% Secret/Shining in eligible sets.
  const roll=Math.max(0,Math.min(0.999999,rng())),hasSecret=pool.secret.length>0;
  const rarity=hasSecret&&roll<0.01?'secret':roll<(hasSecret?0.26:0.25)?'holo':'rare';
  const rare=chooseRandom(pool[rarity].length?pool[rarity]:pool.rare,rng);
  // Basic Energy always comes from Base Set, even when the chosen set has none.
  const energy=chooseRandom([...ENERGY].filter(id=>id!=='base1-96'),rng);
  const cards=[rare,energy],uncommons=count===5?1:3,commons=count===5?2:5;
  for(let i=0;i<uncommons;i++)cards.push(chooseRandom(pool.uncommon,rng));
  for(let i=0;i<commons;i++)cards.push(chooseRandom(pool.common,rng));
  for(let i=cards.length-1;i>0;i--){const j=Math.min(i,Math.floor(Math.max(0,rng())*(i+1)));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
 }
 function shopPacks(state){
  const owned=state?.deckJourney?.owned||{};
  return SHOP_OFFERS.map(offer=>{
   const set=offer.set,info=SETS[set],unique=Object.keys(owned).filter(id=>id.startsWith(set+'-')&&owned[id]>0).length;
   const affection=Math.max(Number(state?.relationships?.[offer.npc]?.affection)||0,Number(state?.bonds?.[offer.npc]?.affection)||0);
   const story=offer.npc&&Object.keys(state?.storyDone||{}).some(id=>id.startsWith(offer.npc+'_route_')&&state.storyDone[id]);
   const cup=offer.cup&&state?.tournaments?.[offer.cup]?.state==='champion';
   const vouchers=state?.deckJourney?.vouchers?.[set]||0;
   const unlocked=!offer.npc||state?.day>=offer.day||affection>=3||!!story||!!cup||unique>0||vouchers>0;
   const hint=offer.npc?'Day '+offer.day+' · bond with '+offer.npc+' · or win matching cards'+(offer.cup?' · '+offer.cup+' cup':''):'Available from Day 1';
   return {...offer,name:info.name,total:info.size,owned:unique,completion:Math.round(100*unique/info.size),unlocked,vouchers,unlockHint:hint};
  });
 }
 function fresh(){return {starter:null,owned:{},deck:[],draft:null,packs:0,rewards:0,lastPack:null,pendingPacks:[],vouchers:{},weeklyWins:{},weeklyPacks:{},rewardedDuels:{}};}
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
  else{x.lastPack.source=['win','shop','gift'].includes(x.lastPack.source)?x.lastPack.source:'shop';x.lastPack.opened=x.lastPack.opened===true;}
  if(!Array.isArray(x.pendingPacks))x.pendingPacks=[];
  x.pendingPacks=x.pendingPacks.filter(p=>p&&Array.isArray(p.cards)&&[5,10].includes(p.cards.length)&&p.cards.every(id=>allAllowed.has(id))&&['win','shop','gift'].includes(p.source));
  for(const p of x.pendingPacks)p.opened=false;
  for(const key of ['weeklyWins','weeklyPacks','rewardedDuels'])
   if(!x[key]||typeof x[key]!=='object'||Array.isArray(x[key]))x[key]={};
  for(const [key,value] of Object.entries(x.weeklyWins))
   if(!/^([1-9]|1[0-3]):[a-z0-9_-]{1,70}$/.test(key)||value!==true)delete x.weeklyWins[key];
  for(const [week,count] of Object.entries(x.weeklyPacks))
   if(!/^([1-9]|1[0-3])$/.test(week)||!Number.isInteger(count)||count<0||count>2)delete x.weeklyPacks[week];
  for(const [id,used] of Object.entries(x.rewardedDuels))
   if(typeof id!=='string'||!id||id.length>150||used!==true)delete x.rewardedDuels[id];
  if(!x.vouchers||typeof x.vouchers!=='object'||Array.isArray(x.vouchers))x.vouchers={};
  for(const [set,n] of Object.entries(x.vouchers))if(!SETS[set]||!Number.isInteger(n)||n<0||n>99)delete x.vouchers[set];
  x.packs=Number.isInteger(x.packs)&&x.packs>=0?x.packs:0;x.rewards=Number.isInteger(x.rewards)&&x.rewards>=0?x.rewards:0;
  return state;
 }
 function choose(state,id){if(state.deckJourney?.starter)throw Error('Starter deck already chosen');
  const starter=byId.get(id);if(!starter)throw Error('Choose one of the three starter decks');
  state.deckJourney={...fresh(),starter:id,owned:rank(starter.cards),deck:[...starter.cards]};state.playerDeck='custom';
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
 function grant(x,ids,source,set,giver,kind=null){
  for(const id of ids)x.owned[id]=(x.owned[id]||0)+1;
  const pack={cards:[...ids],source,set,giver:giver||null,opened:false};
  if(kind)pack.kind=kind;
  // Preserve every unviewed reward, even across a reload.
  if(x.lastPack&&!x.lastPack.opened)x.pendingPacks.push(pack);
  else x.lastPack=pack;
  return ids;
 }
 // Called after authentic duel settlement. Routine wins have a weekly cap;
 // authored story wins and tournament championships are separate milestones.
 function reward(state,win,giver=null,rng=Math.random,context={}){
  const x=state?.deckJourney;
  if(!x?.starter||!win)return null;
  hydrate(state);
  const day=Number.isInteger(context.day)?context.day:state.day;
  if(!Number.isInteger(day)||day<1||day>90)return null;
  const duelId=typeof context.duelId==='string'?context.duelId:null;
  if(duelId&&x.rewardedDuels[duelId])return null;
  const week=String(Math.ceil(day/7)),npc=giver||'trainer',key=week+':'+npc;
  const story=context.story===true,championship=context.championship===true;
  if(!story&&!championship&&(x.weeklyWins[key]||(x.weeklyPacks[week]||0)>=2))return null;
  // NPC victory rewards do not bypass expansion unlock progression.
  const desired=setForCharacter(giver);
  const set=shopPacks(state).some(p=>p.set===desired&&p.unlocked)?desired:'base1';
  const ids=randomPack(set,rng,championship?10:5);
  if(!story&&!championship)x.weeklyPacks[week]=(x.weeklyPacks[week]||0)+1;
  x.weeklyWins[key]=true;
  if(duelId)x.rewardedDuels[duelId]=true;
  x.rewards++;
  return grant(x,ids,'win',set,giver,championship?'championship':story?'story':'weekly');
 }
 function buyPack(state,set='base1',rng=Math.random){const x=state?.deckJourney;
  if(!x?.starter)throw Error('Choose your starter before opening packs');
  if(state.location!=='shop'||state.day>90)throw Error('Buy booster packs at the card shop');
  if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.activeSituation||state.activeArc||state.activeEncounter)throw Error('Finish the current scene first');
  if(x.lastPack&&!x.lastPack.opened)throw Error('Reveal your previous booster before buying another');
  const offer=shopPacks(state).find(p=>p.set===set);
  if(!offer)throw Error('This booster does not exist');
  if(!offer.unlocked)throw Error(offer.name+' is not unlocked yet');
  if((state.credits||0)<offer.price)throw Error('A '+offer.name+' pack costs '+offer.price+' credits');
  const ids=randomPack(set,rng);
  state.credits-=offer.price;x.packs++;return grant(x,ids,'shop',set,null);
 }
 function awardSignature(state,id){
  if(!state?.deckJourney?.starter||!allAllowed.has(id))throw Error('Invalid signature card');
  const owned=state.deckJourney.owned;owned[id]=(owned[id]||0)+1;
  return id;
 }
 function awardVoucher(state,set){
  if(!state?.deckJourney?.starter||!SETS[set])throw Error('Invalid booster voucher');
  const vouchers=state.deckJourney.vouchers||(state.deckJourney.vouchers={});
  vouchers[set]=(vouchers[set]||0)+1;return vouchers[set];
 }
 function redeemVoucher(state,set,rng=Math.random){
  const x=state?.deckJourney;
  if(!x?.starter||!SETS[set])throw Error('Invalid booster voucher');
  if(state.location!=='shop'||state.day>90)throw Error('Redeem booster vouchers at the card shop');
  if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.activeSituation||state.activeArc||state.activeEncounter)throw Error('Finish the current scene first');
  if(x.lastPack&&!x.lastPack.opened)throw Error('Reveal your previous booster before opening another');
  if(!x.vouchers?.[set])throw Error('You have no '+SETS[set].name+' booster vouchers');
  const ids=randomPack(set,rng);
  x.vouchers[set]--;x.packs++;
  return grant(x,ids,'gift',set,null);
 }
 return Object.freeze({starters,upgrade,ENERGY,SETS,SHOP_OFFERS,shopPacks,canOwn:id=>allAllowed.has(id),awardSignature,awardVoucher,redeemVoucher,CHARACTER_SETS,setForCharacter,randomPack,packRarity,PACK_POOLS,byId:id=>byId.get(id),fresh,hydrate,choose,check,draft,edit,change,save,cancel,reward,buyPack,rank});
});
