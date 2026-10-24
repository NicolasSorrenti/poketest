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
  const themeById=new Map(themes.map(theme=>[theme.id,theme]));
  const energyIds=new Set([...core.ENERGY].filter(id=>id!=='base1-96'));
  const descriptors=[
   ...core.SHOP_OFFERS.map(offer=>({id:'set:'+offer.set,name:core.SETS[offer.set].name+' Booster',kind:'set',set:offer.set})),
   ...core.THEMED_PACKS.map(theme=>({id:'theme:'+theme.id,name:theme.name,kind:'theme',theme:theme.id}))
  ];
  function sourcesFor(id){
   if(typeof id!=='string'||!core.canOwn(id))return [];
   const split=id.lastIndexOf('-'),set=id.slice(0,split),rarity=core.packRarity(id),energy=energyIds.has(id);
   const sources=[];
   for(const entry of descriptors){
    if(entry.kind==='set'){
     const possible=energy||entry.set===set&&!!core.PACK_POOLS[set]?.[rarity]?.includes(id);
     if(possible)sources.push({...entry,available:!!offerBySet.get(entry.set)?.unlocked});
    }else{
     const available=core.themeContains(progress,entry.theme,id);
     const futurePossible=available||core.themeContains(future,entry.theme,id);
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
