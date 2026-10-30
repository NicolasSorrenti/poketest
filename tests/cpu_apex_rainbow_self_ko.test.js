'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const {CATALOG}=require('../headless_duel');

const rainbows=['base5-17','base5-80'];
for(const id of rainbows)assert.equal(CATALOG.get(id)?.name,'Rainbow Energy');
assert.equal(CATALOG.get('base1-97')?.name,'Fighting Energy');
const unit=(id,damage)=>({id,damage,energies:[],status:null,playedTurn:1});
const memo={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
function attachments(activeDamage,benchDamage,level=8){
 const o={phase:'game',turn:1,round:5,turnSerial:9,over:false,
  self:{active:unit('base2-16',activeDamage),bench:[unit('base1-52',benchDamage)],
   hand:[...rainbows,'base1-97'],energyUsed:false,retreated:false},
  opponent:{active:unit('base1-52',0),bench:[]}};
 return AI.candidates(o,AI.configuration({side:1,level}),memo)
  .filter(a=>a.type==='attach_energy').map(a=>[a.payload.handIndex,a.payload.slot]);
}

test('Apex does not attach either Rainbow Energy printing for a direct self-KO',()=>{
 // Wigglytuff has 80 HP, Machop 50 HP. Each has exactly 10 HP remaining.
 const picks=attachments(70,40);
 for(const index of [0,1])for(const slot of [-1,0])
  assert.ok(!picks.some(([i,s])=>i===index&&s===slot),
   'Rainbow printing '+index+' must not self-KO slot '+slot);
 for(const slot of [-1,0])
  assert.ok(picks.some(([i,s])=>i===2&&s===slot),
   'ordinary Fighting Energy must remain a legal attachment');
});

test('Apex keeps nonlethal Rainbow Energy attachments and lower-level behavior',()=>{
 const safe=attachments(69,39);
 for(const index of [0,1])for(const slot of [-1,0])
  assert.ok(safe.some(([i,s])=>i===index&&s===slot),
   'Rainbow printing '+index+' should be available with 11 HP left');
 const lower=attachments(70,40,7);
 assert.ok(lower.some(([i,s])=>i===0&&s===-1),
  'the change is intentionally scoped to Apex');
});
