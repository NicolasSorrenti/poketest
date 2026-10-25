'use strict';
const assert=require('node:assert/strict');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,canEvolve}=require('./core_rules');
const {makeDraft,supported,availableForSeat,draftPick,validateBuild}=require('./cube_draft');
const {mixedPrintingNames}=require('./cube_printings');
const {makePresetPool,getPreset}=require('./cube_presets');
const {sourcePool,isFocus,isDualAttacker,attackColors}=require('./cube_dual_energy');
const {cpuPick,buildCpuDeck,colorPlan}=require('./cube_strategy');

assert.equal(getPreset('dual_energy').pokemon,156);
const {pokemon:candidates,trainers}=sourcePool();
assert(candidates.length>=26);
assert(trainers.length>=15);
const pool=makePresetPool({preset:'dual_energy',seed:1});
assert.equal(pool.length,240);
assert.deepEqual(pool,makePresetPool({preset:'dual_energy',seed:9001}),
 'Dual Energy is a fixed cube; seed only randomizes packs');
assert(pool.every(supported),'All cube cards must have registered effects');
assert(pool.every(id=>!/^(ecard|ex)/.test(id)),
 'Never import e-Card / EX cards without matching duel engine support');
assert.deepEqual(mixedPrintingNames(pool),[],'No mixed printings of a name');
const counts=new Map();
for(const id of pool)counts.set(id,(counts.get(id)||0)+1);
assert([...counts.values()].every(n=>n<=4),'No more than four copies of any printing');
const pokemon=pool.filter(id=>CATALOG.get(id).supertype==='Pokémon');
assert.equal(pokemon.length,156);
assert.equal(pool.length-pokemon.length,84);
const basics=pokemon.filter(id=>isBasicPokemon(CATALOG.get(id)));
assert(basics.length>=95,'Provide enough opening Basics');
for(const id of pokemon.filter(id=>!isBasicPokemon(CATALOG.get(id))))
 assert(pokemon.some(p=>canEvolve(CATALOG.get(id),CATALOG.get(p))),
  'No orphan evolved Pokémon: '+id);
const focused=pokemon.filter(id=>isFocus(CATALOG.get(id)));
assert(focused.length>=12,
 'Dual-energy focus cards must actually occur frequently: '+focused.length);
for(const id of focused.filter(id=>isDualAttacker(CATALOG.get(id))))
 assert.equal(attackColors(CATALOG.get(id)).length,2);
const availableNames=new Set(pokemon.map(id=>CATALOG.get(id).name));
assert(availableNames.has('Golduck')||availableNames.has('Lanturn'),
 'Cube must contain at least one advertised flagship card');
assert.equal(colorPlan([], {preferDual:true}).length,1); // Empty drafts stay safe.
for(const seed of [1,17,475]){
 const d=makeDraft({preset:'dual_energy',seed});
 assert.equal(d.rounds.flat(2).length,240);
 while(!d.done){
  for(let seat=0;seat<d.players;seat++){
   const options=availableForSeat(d,seat);
   draftPick(d,seat,cpuPick(options,d.picks[seat],{preset:'dual_energy'}));
  }
 }
 assert(d.picks.every(p=>p.length===60));
 for(const picks of d.picks){
  const deck=buildCpuDeck(picks,{preset:'dual_energy'});
  assert.equal(deck.length,40);
  assert.equal(validateBuild(picks,deck).valid,true);
  assert(deck.some(id=>isBasicPokemon(CATALOG.get(id))));
  const energy=new Set(deck.filter(id=>CATALOG.get(id).supertype==='Energy')
   .map(id=>CATALOG.get(id).name));
  assert(energy.size<=2,'Two-color CPU support cannot require three-color Energy');
 }
}
const uniqueFocus=new Set(focused.map(id=>CATALOG.get(id).name));
const pairs={};
for(const id of focused){
 const key=attackColors(CATALOG.get(id)).slice().sort().join('/')||'power-synergy';
 pairs[key]=(pairs[key]||0)+1;
}
console.log('Dual Energy audit:',JSON.stringify({
 supportedPokemonPrintings:candidates.length,uniqueFocusNames:uniqueFocus.size,
 focusedSlots:focused.length,supportSlots:pokemon.length-focused.length,
 trainers:pool.length-pokemon.length,types:pairs
}));
console.log('PASS Dual Energy: 240-card supported fixed pool, evolution lines, 12 valid CPU drafts');
