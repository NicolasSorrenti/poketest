'use strict';
const assert=require('node:assert/strict');
const {CATALOG}=require('./headless_duel');
const {eligibleIds,makePool,makeDraft}=require('./cube_draft');
const {PRESETS,makePresetPool}=require('./cube_presets');
const {preferredPrintings,mixedPrintingNames,setOf}=require('./cube_printings');

const plusPower=[...CATALOG.keys()].filter(id=>CATALOG.get(id).name==='PlusPower'&&
 ['base1','base4'].includes(setOf(id)));
assert.equal(new Set(plusPower.map(setOf)).size,2,'Expected both Base and Base Set 2 PlusPower prints');
assert.deepEqual(mixedPrintingNames(plusPower),['PlusPower']);
const chosen=preferredPrintings(plusPower);
assert(chosen.every(id=>setOf(id)==='base1'),'Base Set should be canonical for PlusPower');
assert.deepEqual(mixedPrintingNames(chosen),[]);
const old=eligibleIds(),eligiblePlus=old.filter(id=>CATALOG.get(id).name==='PlusPower');
const preferredPlus=preferredPrintings(eligiblePlus);
assert.deepEqual(mixedPrintingNames(preferredPlus),[]);
for(const p of PRESETS){
 for(const seed of [1,2,19,1337]){
  const pool=makePresetPool({preset:p.id,seed});
  assert.equal(pool.length,240);
  assert.deepEqual(mixedPrintingNames(pool),[],p.name+' contains a mixed expansion printing');
  if(p.id==='foundations'){
   for(const id of pool)assert(['base1','base2','base3'].includes(setOf(id)),'Illegal Kanto-era card: '+id);
   const sets=new Set(pool.map(setOf));
   assert.equal(sets.size,3,'Base/Jungle/Fossil should all appear');
  }
 }
}
const balanced=makePool({seed:19});
assert.deepEqual(mixedPrintingNames(balanced),[]);
const conflicting=[...balanced];
if(eligiblePlus.length>1){
 const first=eligiblePlus[0],second=eligiblePlus.find(id=>setOf(id)!==setOf(first));
 if(second){
  conflicting[0]=first;conflicting[1]=second;
  assert.throws(()=>makeDraft({seed:1,pool:conflicting}),/mixes reprints/);
 }
}
console.log('PASS Cube printings: Base/Jungle/Fossil-only pool and one expansion per card name across every preset');
