'use strict';
const assert=require('node:assert/strict');
const C=require('./cube_draft');
const {PRESETS,getPreset,makePresetPool,typeOf,TYPES}=require('./cube_presets');
const {CATALOG}=require('./headless_duel');
const {isEnergy,isBasicPokemon,canEvolve}=require('./core_rules');
const {cpuPick,buildCpuDeck}=require('./cube_strategy');
const {CubeService}=require('./cube_service');
const {CubeRoomService}=require('./cube_room_service');

assert.equal(PRESETS.length,5);
assert.equal(new Set(PRESETS.map(p=>p.id)).size,5);
assert.equal(getPreset().id,'balanced');
assert.throws(()=>getPreset('__proto__'),/Unknown Cube preset/);
assert.throws(()=>makePresetPool({preset:'hacked'}),/Unknown Cube preset/);
assert.throws(()=>makePresetPool({preset:'elemental',size:99}),/require 240/);
for(const preset of PRESETS){
 for(const seed of [11,475]){
  const pool=makePresetPool({preset:preset.id,seed});
  assert.equal(pool.length,240,preset.name+' exact size');
  assert.deepEqual(pool,makePresetPool({preset:preset.id,seed}),preset.name+' seed repeatable');
  assert(pool.every(id=>C.supported(id)),preset.name+' unsupported printings');
  assert(pool.every(id=>!isEnergy(CATALOG.get(id))),preset.name+' drafted Energy');
  const pokemon=pool.filter(id=>CATALOG.get(id).supertype==='Pokémon');
  assert.equal(pokemon.length,preset.pokemon,preset.name+' Pokémon quota');
  assert.equal(pool.length-pokemon.length,preset.trainers,preset.name+' Trainer quota');
  const basics=pokemon.filter(id=>isBasicPokemon(CATALOG.get(id)));
  assert(basics.length>=95,preset.name+' not enough Basic Pokémon');
  const evolved=pokemon.filter(id=>!isBasicPokemon(CATALOG.get(id)));
  for(const id of evolved){
   assert(pokemon.some(parent=>canEvolve(CATALOG.get(id),CATALOG.get(parent))),
    preset.name+' orphan evolution: '+id);
  }
  if(preset.id==='elemental'){
   for(const type of TYPES){
    const n=basics.filter(id=>typeOf(id)===type).length;
    assert(n>=19,'Elemental Rivals needs 19 '+type+' Basics, found '+n);
   }
  }
 }
}
for(const preset of PRESETS.filter(x=>x.id!=='balanced')){
 const draft=C.makeDraft({seed:17,preset:preset.id});
 assert.equal(draft.preset,preset.id);
 while(!draft.done){
  for(let seat=0;seat<4;seat++){
   const options=C.availableForSeat(draft,seat);
   C.draftPick(draft,seat,cpuPick(options,draft.picks[seat]));
  }
 }
 assert(draft.picks.every(p=>p.length===60));
 const trainerCounts=[];
 for(const picks of draft.picks){
  const deck=buildCpuDeck(picks,{preset:preset.id});
  assert.equal(deck.length,40);
  assert.equal(C.validateBuild(picks,deck).valid,true,preset.name+' CPU deck illegal');
  trainerCounts.push(deck.filter(id=>CATALOG.get(id)?.supertype==='Trainer').length);
 }
 if(preset.id==='mayhem'){
  const avg=trainerCounts.reduce((sum,n)=>sum+n,0)/trainerCounts.length;
  assert(avg>=11,'Trainer Mayhem CPU decks must actually play a Trainer-heavy configuration: '+avg);
 }
}
const solo=new CubeService();
const selected=solo.create({seed:17,preset:'neo'});
assert.equal(selected.preset,'neo');
assert.throws(()=>solo.create({preset:'not-a-cube'}),/Unknown Cube preset/);
const rooms=new CubeRoomService();
const host=rooms.create({name:'Host',preset:'elemental',seed:1234});
const friend=rooms.join({code:host.code,name:'Friend'});
assert.equal(rooms.state(host.code,friend.token).preset,'elemental');
rooms.ready(host.code,host.token,true);
rooms.ready(host.code,friend.token,true);
const started=rooms.start(host.code,host.token);
assert.equal(started.preset,'elemental');
assert.equal(rooms.room(host.code).draft.preset,'elemental');
assert.throws(()=>rooms.create({name:'Host',preset:'invalid'}),/Unknown Cube preset/);
console.log('PASS themed cubes: 5 presets, 240-card pools, seeded archetypes, legal CPU builds and multiplayer format locking');
