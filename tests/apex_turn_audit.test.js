'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,parse}=require('../scripts/apex-turn-audit');
const attach=(side,turn,damage)=>({side,turnSerial:turn,cardId:'base1-102',
 targetDamageBefore:damage,command:{type:'attach_energy',payload:{slot:-1}}});
const center=(side,turn)=>({side,turnSerial:turn,cardId:'base1-85',
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
test('keeps both players and different turns separate',()=>{
 assert.deepEqual(audit([attach(0,8,40),center(1,8),center(0,9)]),[]);
});
test('validates audit settings',()=>{
 assert.equal(parse(['--deck','rain_dance','--pairs','1']).pairs,1);
 assert.throws(()=>parse(['--deck','invalid']),/Invalid audit settings/);
});
