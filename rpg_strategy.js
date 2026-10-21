'use strict';
// Read-only deckbuilding guidance for the 90-day RPG. The Collection module remains authoritative.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgStrategy=api;
})(typeof window!=='undefined'?window:null,function(){
 const MAX_GOALS=8;
 const count=cards=>Object.fromEntries([...new Set(cards||[])].map(id=>[id,cards.filter(x=>x===id).length]));
 const setOf=id=>String(id||'').replace(/-\d+$/,'');
 const actualType=c=>c?.supertype==='Pokémon'?'pokemon':c?.supertype==='Energy'?'energy':c?.supertype==='Trainer'?'trainer':'other';
 const display=(id,cards)=>cards.get(id)?.name||id;
 function index(cards){return cards instanceof Map?cards:new Map((Array.isArray(cards)?cards:[]).filter(x=>x?.id).map(x=>[x.id,x]));}
 function hydrate(s,core){
  if(!s||!s.deckJourney?.starter)return null;
  if(!s.deckStrategy||typeof s.deckStrategy!=='object'||Array.isArray(s.deckStrategy))s.deckStrategy={wishlist:[]};
  const goals=s.deckStrategy;
  if(!Array.isArray(goals.wishlist))goals.wishlist=[];
  goals.wishlist=[...new Set(goals.wishlist.filter(id=>typeof id==='string'&&id.length<55&&
   core.canOwn(id)&&!core.ENERGY.has(id)))].slice(0,MAX_GOALS);
  return goals;
 }
 function toggle(s,id,core,cards){
  const goal=hydrate(s,core),catalog=index(cards);
  if(!goal||!catalog.has(id)||!core.canOwn(id)||core.ENERGY.has(id))
   throw Error('Choose a valid card from the historical collection');
  if(goal.wishlist.includes(id)){goal.wishlist=goal.wishlist.filter(x=>x!==id);return false;}
  if(goal.wishlist.length>=MAX_GOALS)throw Error('Track up to '+MAX_GOALS+' cards at a time');
  goal.wishlist.push(id);return true;
 }
 function profile(deck,catalog){
  const cards=index(catalog),counts={pokemon:0,trainer:0,energy:0,other:0},pokemonTypes={},energyTypes={};
  const pokemonNames=new Set(),basics=[];
  for(const id of deck||[]){
   const card=cards.get(id),type=actualType(card);counts[type]++;
   if(type==='pokemon'){
    for(const t of card.types||[])pokemonTypes[t]=(pokemonTypes[t]||0)+1;
    pokemonNames.add(card.name);
    if(card.subtypes?.includes('Basic'))basics.push(id);
   }
   if(type==='energy'){
    for(const t of card.types||[])energyTypes[t]=(energyTypes[t]||0)+1;
    // TCGdex basic energy records use the card name, not always a 'types' array.
    if(!card.types?.length&&card.name){const t=card.name.replace(/\s+Energy.*/,'');energyTypes[t]=(energyTypes[t]||0)+1;}
   }
  }
  const primary=Object.entries(pokemonTypes).filter(([t])=>t!=='Colorless').sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
  return {counts,pokemonTypes,energyTypes,primary,basics:basics.length,pokemonNames};
 }
 function relevant(card,p){
  const kind=actualType(card);
  if(kind==='trainer')return 4;
  if(kind==='pokemon'){
   const stage=card.subtypes||[];
   if(stage.includes('Stage 1')||stage.includes('Stage 2')){
    if(!p.pokemonNames.has(card.evolvesFrom))return -100;
    return 13;
   }
   const matches=(card.types||[]).filter(t=>p.primary.includes(t));
   return matches.length?8:card.types?.includes('Colorless')?4:-8;
  }
  return -100;
 }
 function swaps(s,all,core,limit=5){
  if(!s?.deckJourney?.starter)return [];
  const catalog=index(all),deck=s.deckJourney.draft||s.deckJourney.deck,owned=s.deckJourney.owned;
  const p=profile(deck,catalog),counts=count(deck),options=[];
  for(const [add,available] of Object.entries(owned||{})){
   const card=catalog.get(add);
   if(!card||!available||counts[add]>=Math.min(available,core.ENERGY.has(add)?60:4))continue;
   const kind=actualType(card),value=relevant(card,p);
   if(value<4)continue;
   const candidates=Object.keys(counts).filter(id=>id!==add&&actualType(catalog.get(id))===kind)
    .sort((a,b)=>{
     const aScore=relevant(catalog.get(a),p),bScore=relevant(catalog.get(b),p);
     return aScore-bScore||(counts[b]-counts[a])||a.localeCompare(b);
    });
   for(const remove of candidates){
    // Never suggest cutting the only Basic or intermediate evolution supporting a current evolution.
    if(kind==='pokemon'&&counts[remove]<=1&&deck.some(id=>
      catalog.get(id)?.evolvesFrom===catalog.get(remove)?.name))continue;
    if(kind==='pokemon'&&card.subtypes?.includes('Stage 1')&&
      catalog.get(remove)?.name===card.evolvesFrom&&counts[remove]<=1)continue;
    const next=[...deck],pos=next.indexOf(remove);next[pos]=add;
    if(!core.check(next,owned).valid)continue;
    const existing=relevant(catalog.get(remove),p),gain=value-existing;
    // A direct supporting evolution is valuable; do not claim every legal exchange is an upgrade.
    if(gain<2&&!(kind==='trainer'&&counts[remove]>=2&&counts[add]===0))continue;
    const explanation=kind==='pokemon'&&card.evolvesFrom?
      'You already run '+card.evolvesFrom+'; this card extends that evolution line.':
      kind==='pokemon'?'This fits your existing '+p.primary.join('/')+' attacker types.':
      'Try this Trainer in place of a repeated support card; review how it plays before committing.';
    options.push({add,remove,score:gain+(kind==='pokemon'?4:0),explanation});
    break;
   }
  }
  return options.sort((a,b)=>b.score-a.score||a.add.localeCompare(b.add)).slice(0,limit);
 }
 function prospects(s,all,core,limit=10){
  if(!s?.deckJourney?.starter)return [];
  const catalog=index(all),deck=s.deckJourney.draft||s.deckJourney.deck,p=profile(deck,catalog);
  const wishlist=new Set(s.deckStrategy?.wishlist||[]);
  const owned=s.deckJourney.owned||{},results=[];
  for(const card of catalog.values()){
   if(!core.canOwn(card.id)||core.ENERGY.has(card.id)||(owned[card.id]||0)>0)continue;
   const kind=actualType(card),score=relevant(card,p);
   if(score<=5)continue;
   // Avoid advertising an unplayable evolution with no present prerequisite.
   if(kind==='pokemon'&&!p.pokemonNames.has(card.evolvesFrom||'')&&!card.subtypes?.includes('Basic'))continue;
   results.push({id:card.id,name:card.name,set:setOf(card.id),score,tracked:wishlist.has(card.id),
    reason:kind==='pokemon'&&card.evolvesFrom?'Supports the '+card.evolvesFrom+' line already in your deck.':
    kind==='pokemon'?'Shares a Pokémon type with your current strategy.':'A Trainer to consider for future builds.'});
  }
  return results.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)||a.id.localeCompare(b.id)).slice(0,limit);
 }
 function goals(s,all,core){
  const catalog=index(all),wish=hydrate(s,core)?.wishlist||[];
  return wish.map(id=>({id,name:display(id,catalog),set:setOf(id),
    owned:s.deckJourney.owned[id]||0,inDeck:count(s.deckJourney.draft||s.deckJourney.deck)[id]||0}));
 }
 function packAdvice(s,all,core){
  if(!s?.deckJourney?.starter)return [];
  const wanted=goals(s,all,core).filter(x=>x.owned===0);
  // Theme pools span multiple expansions and grow when new printings unlock.
  // Only advertise goals that actually have a chance of appearing right now.
  return core.themedPacks(s).map(pack=>({
   ...pack,targets:pack.unlocked?wanted.filter(x=>core.themeContains(s,pack.id,x.id)).length:0,
   futureTargets:wanted.filter(x=>pack.sources.includes(x.set)).length
  })).sort((a,b)=>b.targets-a.targets||Number(b.unlocked)-Number(a.unlocked)||
   b.futureTargets-a.futureTargets||a.price-b.price);
 }
 function scout(deckIds,all,s){
  const catalog=index(all),ids=(Array.isArray(deckIds)?deckIds:[]).filter(id=>catalog.has(id));
  if(ids.length!==60)return null;
  const opp=profile(ids,catalog),you=profile(s?.deckJourney?.draft||s?.deckJourney?.deck||[],catalog);
  const weaknesses={};
  for(const id of ids){
   const card=catalog.get(id);
   if(actualType(card)!=='pokemon')continue;
   for(const weakness of card.weaknesses||[])if(weakness?.type)
    weaknesses[weakness.type]=(weaknesses[weakness.type]||0)+1;
  }
  const oppTypes=Object.entries(opp.pokemonTypes).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const useful=Object.entries(weaknesses).filter(([t])=>you.pokemonTypes[t]>0)
   .sort((a,b)=>b[1]-a[1]);
  const total=opp.counts.pokemon||0;
  return {composition:opp.counts,types:oppTypes.map(([name,n])=>({name,n})),
   weaknesses:useful.map(([name,n])=>({name,n})),
   note:useful.length?'Your deck contains '+useful.map(([t])=>t).join('/')+
    ' Pokémon; some opponent Pokémon are weak to those types. Check individual card matchups.':
    'Your main Pokémon types do not match obvious printed weaknesses in this theme. Review individual card matchups.',
   sample:total,playerPrimary:you.primary};
 }
 return Object.freeze({MAX_GOALS,index,setOf,hydrate,toggle,profile,swaps,prospects,goals,packAdvice,scout});
});
