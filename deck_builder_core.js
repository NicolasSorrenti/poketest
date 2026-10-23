'use strict';
// UI-independent deck editing and validation. The server always revalidates.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoDeckBuilder=api;})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const ALLOWED=new Set(['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4']);
 const BASIC_ENERGY=new Set(['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy']);
 const isBasicEnergy=c=>Boolean(c&&c.supertype==='Energy'&&BASIC_ENERGY.has(c.name));
 function verify(deck,catalog){
  const cards=Array.isArray(deck)?deck:[],lookup=new Map(catalog.map(c=>[c.id,c]));
  const byName=new Map(),unknown=[],blocked=[];let basic=0,unsupported=0;
  for(const id of cards){const c=lookup.get(id);if(!c){unknown.push(id);continue;}if(!ALLOWED.has(c.set))blocked.push(id);
   if(c.supertype==='Pokémon'&&c.subtypes?.includes('Basic'))basic++;
   if(!c.supported)unsupported++;
   if(!isBasicEnergy(c))byName.set(c.name,(byName.get(c.name)||0)+1);
  }
  const excessive=[...byName].filter(([,n])=>n>4).map(([name,n])=>`${name} (${n})`);
  const errors=[...(cards.length!==60?[`A deck needs 60 cards (${cards.length}/60).`]:[]),...(basic===0?['At least one Basic Pokémon is required.']:[]),...unknown.map(x=>`Unknown card: ${x}`),...blocked.map(x=>`Outside supported deck-builder sets: ${x}`),...excessive.map(x=>`Four-copy limit exceeded: ${x}`)];
  return {valid:errors.length===0,errors,total:cards.length,basic,unsupported,distinct:new Set(cards).size};
 }
 function change(deck,id,quantity,catalog){const card=catalog.find(c=>c.id===id);if(!card||!ALLOWED.has(card.set))throw Error('Card is not in a supported deck-builder set');
  if(!Number.isInteger(quantity)||Math.abs(quantity)!==1)throw Error('Quantity must change by one');
  const out=[...deck];if(quantity<0){const i=out.lastIndexOf(id);if(i>=0)out.splice(i,1);return out;}
  if(out.length>=60)throw Error('Deck already contains 60 cards');
  if(!isBasicEnergy(card)&&out.filter(x=>catalog.find(c=>c.id===x)?.name===card.name).length>=4)throw Error('Maximum four cards with the same name');
  out.push(id);return out;
 }
 return Object.freeze({verify,change,isBasicEnergy});
});
