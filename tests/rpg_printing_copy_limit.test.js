'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const Core=require('../rpg_collection');
const base=Core.byId('ember_garden').cards;
const owned=Object.fromEntries([...new Set(base)].map(id=>[id,60]));
function replaceCopies(cards,remove,add,amount){
 const deck=[...cards];for(let i=0;i<amount;i++){const index=deck.indexOf(remove);assert.ok(index>=0);deck[index]=add;}return deck;
}
test('different printings of Charmander share a four-card limit',()=>{
 const deck=[...base];
 // Keep a legal starter framework, and insert five printings of the same card.
 for(const id of ['base1-46','base1-46','base1-46','base4-69','base4-69']){
  const at=deck.findIndex(x=>x==='base1-98');assert.ok(at>=0);deck[at]=id;
 }
 const inventory={...owned,'base1-46':20,'base4-69':20};
 const result=Core.check(deck,inventory);
 assert.equal(result.valid,false);
 assert.match(result.errors.join(' '),/Four-copy limit exceeded for Charmander/);
});
test('four mixed printings are legal, a fifth is rejected',()=>{
 const deck=[...base];
 // The starter contains three Base Set Charmander. Swap one non-Charmander
 // for a Base Set 2 printing to reach four identical printed names.
 const slot=deck.indexOf('base1-98');assert.ok(slot>=0);deck[slot]='base4-69';
 const inventory={...owned,'base4-69':5};
 assert.equal(Core.check(deck,inventory).valid,true);
 const fifth=[...deck];fifth[fifth.indexOf('base1-99')]='base4-69';
 assert.match(Core.check(fifth,inventory).errors.join(' '),/Four-copy limit exceeded for Charmander/);
});
test('Miracle Energy is capped at one printing',()=>{
 assert.equal(Core.cardName('base4-69'),'Charmander');
 assert.equal(Core.isBasicEnergyId('base1-98'),true);
 assert.equal(Core.isBasicEnergyId('base1-96'),false);
});
