'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicCounterplay,evaluateTurn}=require('../cpu_lookahead');

const helpers={
 hpRemaining:u=>u.hp-u.damage,
 strongestAffordableAttack:u=>u.dmg||0,
 projectedAttackValue:u=>u.dmg||0
};
function board(status=null){
 return {phase:'game',turnSerial:9,
  self:{active:{id:'hit',hp:80,damage:0,energies:[]},
   bench:[{id:'backup',hp:60,damage:0,energies:[]}],
   hand:[],prizeCount:3,deckCount:20},
  opponent:{active:{id:'enemy',hp:80,damage:0,dmg:80,status},
   bench:[],prizeCount:3}};
}
test('Apex discounts a Confused Active counterattack by its mandatory coin flip',()=>{
 const normal=board(),confused=board('Confused'),asleep=board('Asleep');
 const assess=o=>publicCounterplay(o,helpers,o.self.active,o.opponent,true);
 assert.deepEqual(assess(normal),{expected:80,koChance:1,benchThreat:0});
 assert.deepEqual(assess(confused),{expected:40,koChance:.5,benchThreat:0});
 assert.deepEqual(assess(asleep),{expected:0,koChance:0,benchThreat:0});
 // Preserve the previously calibrated lower-tier threat estimate.
 assert.equal(publicCounterplay(confused,helpers).koChance,1);
});
test('Apex turn planner no longer treats a Confused counter-KO as guaranteed',()=>{
 const scoring={...helpers,
  card:id=>({name:id,supertype:'Pokémon',attacks:[{cost:['Colorless'],damage:'20'}]}),
  candidates:()=>[],score:()=>0,attackBonus:()=>0,knockoutChance:()=>0};
 const normal=board(),confused=board('Confused');
 const apex={side:1,level:8,style:{survival:1}};
 assert.ok(evaluateTurn(confused,apex,scoring)>evaluateTurn(normal,apex,scoring),
  'a 50% counter-KO is less urgent than a guaranteed one');
 const level7={...apex,level:7};
 assert.equal(evaluateTurn(confused,level7,scoring),evaluateTurn(normal,level7,scoring),
  'Level 7 retains its existing threat evaluation');
});
