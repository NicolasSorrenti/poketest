'use strict';
const assert=require('node:assert/strict');
const C=require('./cube_draft');
const S=require('./cube_strategy');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy,canEvolve}=require('./core_rules');
for(let seed=1;seed<=5;seed++){
 const pool=C.makePool({seed,size:240});
 assert.equal(pool.length,240);
 assert.deepEqual(pool,C.makePool({seed,size:240}));
 assert(pool.every(C.supported),'Unrecognized or unplayable Cube card');
 assert(pool.every(id=>!isEnergy(CATALOG.get(id))));
 const pokemon=pool.filter(id=>CATALOG.get(id)?.supertype==='Pokémon');
 assert.equal(pokemon.length,156);
 const basics=pokemon.filter(id=>isBasicPokemon(CATALOG.get(id)));
 assert(basics.length>=100,'At least 100 basic slots');
 const evolved=pokemon.filter(id=>!isBasicPokemon(CATALOG.get(id)));
 for(const id of evolved)assert(pokemon.some(p=>canEvolve(CATALOG.get(id),CATALOG.get(p))),id+' has no compatible evolution line');
 const draft=C.makeDraft({seed,pool});
 while(!draft.done){
  for(let seat=0;seat<4;seat++){
   const pack=C.availableForSeat(draft,seat);
   C.draftPick(draft,seat,S.cpuPick(pack,draft.picks[seat]));
  }
 }
 assert(draft.picks.every(p=>p.length===60));
 for(const picks of draft.picks){
  const deck=S.buildCpuDeck(picks);
  assert.equal(deck.length,40);
  assert.equal(C.validateBuild(picks,deck).valid,true);
  const creatures=deck.filter(id=>CATALOG.get(id)?.supertype==='Pokémon');
  assert(creatures.some(id=>isBasicPokemon(CATALOG.get(id))));
  const colored=new Set(deck.filter(id=>isEnergy(CATALOG.get(id))).map(id=>CATALOG.get(id).name));
  assert(colored.size<=2,'AI deck should have at most two Energy colors');
  // There must be at least one attack with an achievable Energy cost,
  // excluding Powers-only utility Pokémon.
  assert(creatures.some(id=>S.usableAttacks(CATALOG.get(id),[...colored].map(x=>x.replace(' Energy',''))).length));
 }
}
console.log('PASS Cube balance: five seeds, 20 CPU decks, linked evolution slots, Energy coherence');
