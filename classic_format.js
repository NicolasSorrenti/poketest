'use strict';
// Rules-only set legality boundary. The archive can include later sets, but
// Classic competitive decks are restricted to these exact printed IDs.
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoClassicFormat=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(host){
 const SETS=Object.freeze(['base1','base2','base3','base5']);
 const SET_NAMES=Object.freeze({base1:'Base Set',base2:'Jungle',base3:'Fossil',base4:'Base Set 2',base5:'Team Rocket',gym1:'Gym Heroes',gym2:'Gym Challenge',neo1:'Neo Genesis',neo2:'Neo Discovery',neo3:'Neo Revelation',neo4:'Neo Destiny'});
 const allowed=new Set(SETS);
 const fullGym=new Set([...Array.from({length:132},(_,i)=>`gym1-${i+1}`),...Array.from({length:132},(_,i)=>`gym2-${i+1}`)]);
 const neoPrints=new Set(typeof require==='function'?[...require('./neo_genesis_decks').neoIds,...require('./neo_discovery_decks').entries.flatMap(e=>require('./neo_discovery_decks').list(e.id).filter(id=>id.startsWith('neo1-')))]:[]);
 const neo40Prints=new Set(typeof require==='function'?require('./neo_v040_pool').ids:[]);
 const neo46Prints=new Set(typeof require==='function'?require('./neo_v046_pool').ids:[]);
 const neoDestinyPrints=new Set(typeof require==='function'?require('./neo_destiny_decks').neoIds:[]);
 const neoDiscoveryPrints=new Set(typeof require==='function'?[...require('./neo_discovery_decks').neoIds,...require('./neo_bonus_pool').ids]:[]);
 const reprints=new Set(typeof require==='function'?require('./retail_theme_decks').entries.filter(e=>!e.gym).flatMap(e=>require('./retail_theme_decks').list(e.id)).filter(id=>id.startsWith('base4')):[]);
 const curatedGym=new Set(typeof require==='function'?require('./retail_theme_decks').gymIds:[]);
 function setOf(id){return typeof id==='string'?id.split('-')[0]:null;}
 function isAllowed(idOrCard,{gym=false,reprint=false,gymFull=false,neo=false}={}){const id=typeof idOrCard==='string'?idOrCard:idOrCard?.id;return Boolean(allowed.has(setOf(id))||((gym||reprint||gymFull)&&reprints.has(id))||(gym&&curatedGym.has(id))||(gymFull&&(fullGym.has(id)||setOf(id)==='base4'))||(neo&&(neoPrints.has(id)||neoDiscoveryPrints.has(id)||neoDestinyPrints.has(id)||neo40Prints.has(id)||neo46Prints.has(id)||curatedGym.has(id)||reprints.has(id))));}
 function illegalCards(ids,{gym=false,reprint=false,gymFull=false,neo=false}={}){return [...new Set((ids||[]).filter(id=>!isAllowed(id,{gym,reprint,gymFull,neo})))];}
 function validateDeck(deck,lookup,{gym=false,reprint=false,gymFull=false,neo=false}={}){
  // Core deck legality validates size, card existence, Basic requirement and
  // historical four-of limit. Format adds an independent strict ID whitelist.
  const core=typeof module==='object'&&module.exports?require('./core_rules'):host?.NeoCoreRules;
  if(!core)throw Error('Core rules must be loaded before format validation');
  const result=core.validateDeck(deck,lookup);
  const disallowed=Array.isArray(deck)?illegalCards(deck,{gym,reprint,gymFull,neo}):[];
  const unownCount=neo&&Array.isArray(deck)?deck.filter(id=>{const c=lookup.get(id);return c?.supertype==='Pokémon'&&c?.subtypes?.includes('Basic')&&c.name.startsWith('Unown');}).length:0;
  const errors=[...result.errors,...(unownCount>4?[`Neo Unown rule: maximum 4 Unown Basic Pokémon (found ${unownCount})`]:[]),...disallowed.map(id=>`Not legal in ${neo?"Neo curated theme preview":gymFull?"Gym Expanded preview":gym?"curated Gym theme":reprint?"curated retail themes":"Base–Rocket Classic"}: ${id}`)];
  return {...result,valid:errors.length===0,errors,disallowed};
 }
 return Object.freeze({id:'classic-base-rocket',name:'Base–Rocket Classic',SETS,SET_NAMES,FULL_GYM_IDS:Object.freeze([...fullGym]),GYM_IDS:Object.freeze([...curatedGym]),REPRINT_IDS:Object.freeze([...reprints]),NEO_IDS:Object.freeze([...neoPrints,...neoDiscoveryPrints,...neoDestinyPrints,...neo40Prints,...neo46Prints]),setOf,isAllowed,illegalCards,validateDeck});
});
