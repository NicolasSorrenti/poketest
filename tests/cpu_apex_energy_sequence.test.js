'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const FIGHT='base1-97',HITMONCHAN='base1-7',MACHOP='base1-52',RATTATA='base1-61';
const cfg=AI.configuration({side:1,level:8});
const attack={type:'attack',payload:{attackIndex:0}};
const attach={type:'attach_energy',payload:{handIndex:0,slot:0}};
function board(){
 return {self:{active:{id:HITMONCHAN,energies:[FIGHT],damage:0,status:null},
   bench:[{id:MACHOP,energies:[],damage:0}],hand:[FIGHT],
   energyUsed:false,prizeCount:3},
  opponent:{active:{id:RATTATA,energies:[],damage:0},bench:[{id:RATTATA,energies:[],damage:0}]}};
}
test('Apex attaches useful Energy before a non-winning attack',()=>{
 const actions=AI.energyPreparationActions(board(),cfg,[attack,attach]);
 assert.deepEqual(actions,[attach]);
});
test('Apex retains a guaranteed winning knockout instead of forcing attachment',()=>{
 const o=board();o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 const actions=AI.energyPreparationActions(o,cfg,[attack,attach]);
 assert.deepEqual(actions,[attack,attach]);
});
test('Apex does not force attachment when Energy was already used',()=>{
 const o=board();o.self.energyUsed=true;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attack,attach]);
});
test('other CPU levels retain their existing attack ordering',()=>{
 const o=board();
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),[attack,attach]),[attack,attach]);
});


test('Apex does not suppress an attack for illegal Miracle Energy',()=>{
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=['neo4-16'];
 o.self.bench=[];
 o.self.retreated=false;
 const actions=AI.candidates(o,cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.equal(actions.some(a=>a.type==='attach_energy'),false);
 assert.equal(actions.some(a=>a.type==='attack'),true);
 assert.equal(AI.energyPreparationActions(o,cfg,actions).some(a=>a.type==='attack'),true);
});
test('Miracle Energy can target Light Pokémon unless attachment-blocked',()=>{
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=['neo4-16'];
 o.self.bench=[{id:'neo4-13',energies:[],damage:0,playedTurn:2}];
 o.self.retreated=false;
 const used={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 const actions=AI.candidates(o,cfg,used);
 assert.equal(actions.some(a=>a.type==='attach_energy'&&a.payload.slot===-1),false);
 assert.equal(actions.some(a=>a.type==='attach_energy'&&a.payload.slot===0),true);
 o.self.bench[0].energyAttachBlockSerial=12;
 assert.equal(AI.candidates(o,cfg,used).some(a=>a.type==='attach_energy'),false);
});

function benchEnergyBoard(energyId,energyUsed=false){
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=[HITMONCHAN,energyId];
 o.self.bench=[];
 o.self.energyUsed=energyUsed;
 return o;
}
const benchHitmonchan={type:'bench',payload:{handIndex:0}};
test('Apex does not treat illegal Miracle Energy as Bench attack readiness',()=>{
 const miracle=benchEnergyBoard('neo4-16');
 // An illegal Miracle Energy offers no attachment option, unlike a
 // legal off-type Energy which could still be attached for future turns.
 const noEnergy=benchEnergyBoard('base1-91'); // Bill, not an Energy card
 assert.equal(AI.score(benchHitmonchan,miracle,cfg,{}),
  AI.score(benchHitmonchan,noEnergy,cfg,{}));
});
test('Apex does not assume a second Energy attachment when already used',()=>{
 const spentFighting=benchEnergyBoard(FIGHT,true);
 const spentFire=benchEnergyBoard('base1-98',true);
 assert.equal(AI.score(benchHitmonchan,spentFighting,cfg,{}),
  AI.score(benchHitmonchan,spentFire,cfg,{}));
});
test('Apex still rewards a legal, available Energy for a newly benched attacker',()=>{
 const fighting=benchEnergyBoard(FIGHT);
 const fire=benchEnergyBoard('base1-98');
 assert.ok(AI.score(benchHitmonchan,fighting,cfg,{})>
  AI.score(benchHitmonchan,fire,cfg,{}));
});

function openingChoiceBoard(energyId){
 const o=board();
 o.phase='setup';
 o.self.active=null;
 o.self.bench=[];
 o.self.hand=[HITMONCHAN,energyId];
 return o;
}
const selectHitmonchan={type:'setup_select',payload:{handIndex:0}};
test('opening Active readiness ignores illegal Miracle Energy',()=>{
 const miracle=openingChoiceBoard('neo4-16');
 const noEnergy=openingChoiceBoard('base1-91'); // Bill, not an Energy
 assert.equal(AI.score(selectHitmonchan,miracle,cfg,{}),
  AI.score(selectHitmonchan,noEnergy,cfg,{}));
});
test('opening Active readiness still rewards legal matching Fighting Energy',()=>{
 const fighting=openingChoiceBoard(FIGHT);
 const noEnergy=openingChoiceBoard('base1-91');
 assert.ok(AI.score(selectHitmonchan,fighting,cfg,{})>
  AI.score(selectHitmonchan,noEnergy,cfg,{}));
});
