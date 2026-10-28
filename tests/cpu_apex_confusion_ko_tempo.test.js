'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const cfg=AI.configuration({side:1,level:8});
const attack={type:'attack',payload:{attackIndex:0}};

function board(status,prizes=1){
 return {
  phase:'game',
  self:{
   active:{id:'base1-7',energies:['base1-97'],damage:0,status},
   bench:[{id:'base1-52',energies:[],damage:0}],
   hand:[],prizeCount:prizes
  },
  opponent:{
   active:{id:'base1-61',energies:[],damage:10,status:null},
   bench:[{id:'base1-61',energies:[],damage:0}]
  }
 };
}

test('Apex final-prize knockout tempo accounts for Confusion independently of attack flips',()=>{
 const normal=board(null),confused=board('Confused');
 const jab={name:'Jab',damage:'20',cost:['Fighting'],text:''};
 assert.equal(AI.knockoutChance(jab,normal.self.active,normal.opponent.active),1,
  'printed Jab knockout has no attack-specific coin flip');
 assert.equal(AI.knockoutTempoBonus(attack,normal,cfg),550);
 assert.equal(AI.knockoutTempoBonus(attack,confused,cfg),275,
  'mandatory Confusion flip halves the probability of winning immediately');
});

test('Apex ordinary knockout tempo also discounts Confusion without changing lower tiers',()=>{
 const normal=board(null,3),confused=board('Confused',3);
 assert.equal(AI.knockoutTempoBonus(attack,normal,cfg),125);
 assert.equal(AI.knockoutTempoBonus(attack,confused,cfg),62.5);
 assert.equal(AI.knockoutTempoBonus(attack,confused,AI.configuration({side:1,level:3})),0);
});

test('Apex Prize-race victory bonus discounts the mandatory Confusion flip',()=>{
 for(const [prizes,opponentBench] of [[1,true],[3,false]]){
  const normal=board(null,prizes),confused=board('Confused',prizes);
  if(!opponentBench){
   normal.opponent.bench=[];
   confused.opponent.bench=[];
  }
  const expected=550*cfg.style.damage;
  assert.equal(AI.prizeRaceBonus(attack,normal,cfg),expected);
  assert.equal(AI.prizeRaceBonus(attack,confused,cfg),expected/2,
   'a printed knockout is not a guaranteed game win when Confused');
 }
});

test('Apex Prize-race trade bonus discounts Confusion without affecting lower tiers',()=>{
 const normal=board(null,3),confused=board('Confused',3);
 assert.equal(AI.prizeRaceBonus(attack,normal,cfg),45*cfg.style.damage);
 assert.equal(AI.prizeRaceBonus(attack,confused,cfg),22.5*cfg.style.damage);
 assert.equal(AI.prizeRaceBonus(attack,confused,AI.configuration({side:1,level:3})),0);
});
