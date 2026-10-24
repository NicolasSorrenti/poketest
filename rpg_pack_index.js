'use strict';
// Read-only source lookup. Uses the same pools and unlock rules as actual RPG boosters.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgPackIndex=api;
})(typeof window!=='undefined'?window:null,function(){
 function create(core,state={}){
  if(!core?.SETS||!core?.PACK_POOLS||!core?.themeContains)throw Error('RPG collection rules are missing');
  const progress={...state,day:Math.max(1,Number(state.day)||1)};
  // A Day 90 projection shows future *eligibility*, not a guaranteed drop.
  const future={...progress,day:90};
  const offers=core.shopPacks(progress);
  const themes=core.themedPacks(progress);
  const offerBySet=new Map(offers.map(offer=>[offer.set,offer]));
  const futureThemes=core.themedPacks(future);
  const themePools=new Map();
  function possible(offer,unlockedSets){
   const ids=new Set();
   if(!offer?.unlocked)return ids;
   for(const set of unlockedSets)
    for(const rarity of ['common','uncommon'])for(const id of core.PACK_POOLS[set]?.[rarity]||[])ids.add(id);
   for(const rarity of ['rare','holo','secret'])
    for(const id of core.selectThemePool(offer.sources,rarity,offer.rare))ids.add(id);
   for(const id of energyIds)ids.add(id);
   return ids;
  }
  const availableSets=offers.filter(offer=>offer.unlocked).map(offer=>offer.set);
  const futureSets=core.shopPacks(future).filter(offer=>offer.unlocked).map(offer=>offer.set);
  for(const theme of core.THEMED_PACKS){
   themePools.set(theme.id,{
    current:possible(themes.find(p=>p.id===theme.id),availableSets),
    future:possible(futureThemes.find(p=>p.id===theme.id),futureSets)
   });
  }
  function sourcesFor(id){
   if(typeof id!=='string'||!core.canOwn(id))return [];
   const split=id.lastIndexOf('-'),set=id.slice(0,split),rarity=core.packRarity(id),energy=energyIds.has(id);
   const sources=[];
   for(const entry of descriptors){
    if(entry.kind==='set'){
     const possible=energy||entry.set===set&&!!core.PACK_POOLS[set]?.[rarity]?.includes(id);
     if(possible)sources.push({...entry,available:!!offerBySet.get(entry.set)?.unlocked});
    }else{
     const pools=themePools.get(entry.theme),available=pools.current.has(id);
     const futurePossible=available||pools.future.has(id);
     if(futurePossible)sources.push({...entry,available});
    }
   }
   return sources;
  }
  return Object.freeze({
   packs:descriptors,
   sourcesFor,
   record(card){
    const id=card.id,sources=sourcesFor(id);
    return {...card,rarity:core.packRarity(id)||'unknown',owned:Math.max(0,Number(progress.deckJourney?.owned?.[id])||0),
     printSet:core.SETS[id.slice(0,id.lastIndexOf('-'))]?.name||'Unknown set',sources};
   },
   status:{day:progress.day,starter:!!progress.deckJourney?.starter}
  });
 }
 return Object.freeze({create});
});
