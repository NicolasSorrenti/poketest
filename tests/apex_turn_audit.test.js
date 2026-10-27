'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,parse}=require('../scripts/apex-turn-audit');
const attach=(side,turn,damage,slot=-1)=>({side,turnSerial:turn,cardId:'base1-102',
 targetDamageBefore:damage,command:{type:'attach_energy',payload:{slot}}});
const center=(side,turn,damagedSlots=[-1])=>({side,turnSerial:turn,cardId:'base1-85',
 centerDamagedSlotsBefore:damagedSlots,
 command:{type:'play_trainer',payload:{handIndex:0}}});
test('flags an attachment to damaged Pokémon before Pokémon Center in same turn',()=>{
 const result=audit([attach(1,8,40),center(1,8)]);
 assert.equal(result.length,1);
 assert.equal(result[0].type,'energy-before-pokemon-center');
});
test('does not flag Energy after Center or on an undamaged Pokémon',()=>{
 assert.deepEqual(audit([center(1,8),attach(1,8,40)]),[]);
 assert.deepEqual(audit([attach(1,8,0),center(1,8)]),[]);
});
test('counts a discarded attachment only once across repeated Centers',()=>{
 const result=audit([attach(1,8,40),center(1,8),center(1,8)]);
 assert.equal(result.length,1,'the first Center already discarded this Energy');
 assert.equal(result[0].index,1);
});
test('still detects a new attachment between two Centers',()=>{
 const result=audit([attach(1,8,40),center(1,8),attach(1,8,20),center(1,8)]);
 assert.equal(result.length,2);
 assert.deepEqual(result.map(v=>v.index),[1,3]);
});
test('does not accuse an attachment when its target was healed before Center',()=>{
 assert.deepEqual(audit([attach(1,8,40),center(1,8,[])]),[]);
});
test('does not confuse damage on another Pokémon with the attachment target',()=>{
 assert.deepEqual(audit([attach(1,8,40,0),center(1,8,[-1])]),[]);
 assert.equal(audit([attach(1,8,40,0),center(1,8,[0])]).length,1);
});
test('discards stale evidence after a trainer or board-position action',()=>{
 const trainer={side:1,turnSerial:8,cardId:'base1-94',
  command:{type:'play_trainer',payload:{handIndex:0}}};
 const retreat={side:1,turnSerial:8,command:{type:'retreat',payload:{slot:0}}};
 assert.deepEqual(audit([attach(1,8,40),trainer,center(1,8)]),[]);
 assert.deepEqual(audit([attach(1,8,40),retreat,center(1,8)]),[]);
});
test('preserves wasted-Energy evidence through draw-only Trainers',()=>{
 for(const cardId of ['base1-91','base1-88']){
  const draw={side:1,turnSerial:8,cardId,
   command:{type:'play_trainer',payload:{handIndex:0}}};
  const result=audit([attach(1,8,40),draw,center(1,8)]);
  assert.equal(result.length,1,cardId+' cannot heal or reposition the attachment target');
  assert.equal(result[0].attachmentIndex,0);
  assert.deepEqual(audit([attach(1,8,40),draw,center(1,8,[])]),[],
   'a healed target must not produce a false positive');
 }
});
test('retains a valid attachment through a harmless bench placement',()=>{
 const bench={side:1,turnSerial:8,command:{type:'bench',payload:{handIndex:0}}};
 assert.equal(audit([attach(1,8,40),bench,center(1,8)]).length,1);
});
test('requires a pre-Center damage snapshot before reporting wasted Energy',()=>{
 const legacy=center(1,8);
 delete legacy.centerDamagedSlotsBefore;
 assert.deepEqual(audit([attach(1,8,40),legacy]),[]);
});
test('keeps both players and different turns separate',()=>{
 assert.deepEqual(audit([attach(0,8,40),center(1,8),center(0,9)]),[]);
});
test('validates audit settings',()=>{
 assert.equal(parse(['--deck','rain_dance','--pairs','1']).pairs,1);
 assert.throws(()=>parse(['--deck','invalid']),/Invalid audit settings/);
});
