'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../rpg_collection'),E=require('../rpg_epilogue');
const setup=()=>({deckJourney:C.fresh(),playerDeck:'blackout',credits:80,day:1,slot:0,location:'shop',results:[]});
test('three 60-card mixed-type starter decks use the verified Base Set card IDs, 20 Pokémon, 16 Trainers, 24 energy',()=>{
 assert.equal(C.starters.length,3);assert.equal(new Set(C.starters.flatMap(x=>x.types)).size,6);
 for(const starter of C.starters){
  const s=setup();C.choose(s,starter.id);
  assert.equal(s.deckJourney.deck.length,60,starter.id);
  assert.equal(C.check(s.deckJourney.deck,s.deckJourney.owned).valid,true,starter.id);
  assert.equal(s.deckJourney.deck.filter(x=>C.ENERGY.has(x)).length,24);
  assert.equal(s.deckJourney.deck.filter(x=>[...Array(26)].map((_,i)=>'base1-'+(i+70)).includes(x)).length,16);
  assert.equal(s.playerDeck,'custom');
 }
});
test('starter cannot be switched or accessed without explicit selection',()=>{
 const s=setup();assert.throws(()=>C.choose(s,'unknown'),/three starter decks/);
 assert.equal(s.deckJourney.starter,null);
 C.choose(s,'ember_garden');assert.throws(()=>C.choose(s,'tidal_circuit'),/already chosen/);
});
test('player cannot add cards not owned, exceed copies, or reduce Basic Pokémon count below one',()=>{
 const s=setup();C.choose(s,'ember_garden');
 const old=JSON.stringify(s.deckJourney.deck);
 assert.throws(()=>C.change(s,'base1-46','base1-88'),/do not own/);
 assert.equal(JSON.stringify(s.deckJourney.deck),old);
 const id=s.deckJourney.deck[0];assert.throws(()=>C.change(s,id,id),/different/);
});
test('valid swaps preserve exactly 60 cards and save as separate editable draft',()=>{
 const s=setup();C.choose(s,'ember_garden');
 C.reward(s,true);
 const newCard=Object.entries(s.deckJourney.owned).find(([id,n])=>!s.deckJourney.deck.includes(id)&&n>0);
 assert.ok(newCard,'reward should add a new card to edit into deck');
 const before=[...s.deckJourney.deck];
 const updated=C.change(s,'base1-94',newCard[0]);assert.equal(updated.length,60);
 assert.deepEqual(s.deckJourney.deck,before,'live deck is not changed until Save');
 C.save(s);assert.ok(s.deckJourney.deck.includes(newCard[0]));assert.equal(s.deckJourney.draft,null);
 assert.equal(C.check(s.deckJourney.deck,s.deckJourney.owned).valid,true);
});
test('winning earns exactly one card, losing cannot farm rewards',()=>{
 const s=setup();C.choose(s,'tidal_circuit');
 const before=Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0);
 assert.equal(C.reward(s,false),null);assert.equal(s.deckJourney.rewards,0);
 const win=C.reward(s,true);assert.ok(win);assert.equal(s.deckJourney.rewards,1);
 assert.equal(Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0),before+1);
});
test('shop packs spend 20 credits for exactly five owned cards; they cannot buy elsewhere or without funds',()=>{
 const s=setup();C.choose(s,'mind_and_muscle');
 const before=Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0);
 const cards=C.buyPack(s);assert.equal(cards.length,5);assert.equal(s.credits,60);assert.equal(s.deckJourney.packs,1);
 assert.equal(Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0),before+5);
 s.location='park';const original=JSON.stringify(s);
 assert.throws(()=>C.buyPack(s),/card shop/);assert.equal(JSON.stringify(s),original);
 s.location='shop';s.credits=19;assert.throws(()=>C.buyPack(s),/20 credits/);
});
test('real pending scenes block shop transactions and do not spend credits',()=>{
 const s=setup();C.choose(s,'ember_garden');s.pendingDuel={id:'test'};
 const credits=s.credits;assert.throws(()=>C.buyPack(s),/current scene/);assert.equal(s.credits,credits);
});
test('saved owned cards and edited deck survive reload',()=>{
 const s=setup();C.choose(s,'ember_garden');C.buyPack(s);
 const restored=JSON.parse(JSON.stringify(s));C.hydrate(restored);
 assert.deepEqual(restored.deckJourney,s.deckJourney);
 assert.equal(C.check(restored.deckJourney.deck,restored.deckJourney.owned).valid,true);
});
test('old campaign saves without collection remain legacy presets',()=>{
 const s={playerDeck:'blackout',deckJourney:null};C.hydrate(s);
 assert.equal(s.deckJourney,null);assert.equal(s.playerDeck,'blackout');
});
test('New Game+ resets RPG deck progress but preserves the gallery',()=>{
 const s={...setup(),day:91,ended:true,cgUnlocked:{hana_first_meeting:{day:1,slot:0}},cgViewed:{},playerDeck:'custom'};
 C.choose(s,'ember_garden');C.reward(s,true);
 const r=E.replay(s,()=>({...setup(),deckJourney:null}));
 assert.equal(r.deckJourney.starter,null);assert.equal(r.playerDeck,'blackout');
 assert.equal(r.cgUnlocked.hana_first_meeting.day,1);
});
