'use strict';
const assert=require('node:assert/strict');
const {CATALOG}=require('./headless_duel');
const {isEnergy}=require('./core_rules');
const C=require('./cube_draft');
const ids=C.eligibleIds();
assert(ids.length>=60,'Not enough conservative cube cards');
assert(ids.every(C.supported));
assert(ids.every(id=>!isEnergy(CATALOG.get(id))));
const pool=C.makePool({size:240,seed:1337});
assert.equal(pool.length,240);
assert.deepEqual(pool,C.makePool({size:240,seed:1337}));
const pokemon=pool.filter(id=>CATALOG.get(id).supertype==='Pokémon');
assert.equal(pokemon.length,156);
assert.equal(pool.length-pokemon.length,84);
const s=C.makeDraft({seed:1337,pool});
assert.equal(s.available.length,4);
assert.equal(s.available[0].length,15);
assert.throws(()=>C.draftPick(s,0,'unknown'),/Card not in current pack/);
let first=s.available[0][0];
const originalCopies=s.available.flat().filter(id=>id===first).length;
C.draftPick(s,0,first);
assert.throws(()=>C.draftPick(s,0,s.available[0][0]),/already picked/);
for(let seat=1;seat<4;seat++)C.draftPick(s,seat,s.available[seat][0]);
assert.equal(s.pick,1);
assert.equal(s.available[0].length,14);
// A different physical copy of the same printing may be passed to this
// seat; an ID appearing again is valid. Count copies instead of uniqueness.
const remainingCopies=s.available.flat().filter(id=>id===first).length;
const pickedCopies=s.picks.flat().filter(id=>id===first).length;
assert.equal(remainingCopies+pickedCopies,originalCopies,
 'Drafting must neither clone nor lose physical copies of a printing');
while(!s.done){
 for(let seat=0;seat<4;seat++){
  const candidates=C.availableForSeat(s,seat);
  if(candidates.length)C.draftPick(s,seat,candidates[0]);
 }
}
assert.equal(s.round,4);
assert.equal(s.picks.length,4);
assert(s.picks.every(x=>x.length===60));
assert.equal(s.picks.flat().length,240);
const total=(cards)=>{const m=new Map();for(const id of cards)m.set(id,(m.get(id)||0)+1);return [...m].sort()};
assert.deepEqual(total(s.picks.flat()),total(pool),'Every physical cube copy drafted exactly once');
const basic=s.picks[0].find(id=>CATALOG.get(id).supertype==='Pokémon'&&(CATALOG.get(id).subtypes||[]).includes('Basic'));
assert(basic,'Test seed should draft a basic');
const energy=[...CATALOG].find(([,c])=>c.name==='Water Energy'&&isEnergy(c))?.[0];
assert(energy,'Missing basic energy in catalog');
const build=[basic,...Array(39).fill(energy)];
assert.equal(C.validateBuild(s.picks[0],build).valid,true);
assert.equal(C.validateBuild([],build).valid,false);
assert.equal(C.validateBuild(s.picks[0],build.slice(1)).valid,false);
console.log('PASS cube draft: conservative pool, deterministic 4-player draft, card conservation, deck eligibility');
