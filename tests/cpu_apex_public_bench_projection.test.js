'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const {CATALOG}=require('../headless_duel');
const {publicCounterplay}=require('../cpu_lookahead');

const wigglytuff=CATALOG.get('base2-16');
const machop=[...CATALOG.values()].find(c=>c.name==='Machop'&&Number(c.hp)===50);
assert.equal(wigglytuff?.name,'Wigglytuff');
assert.ok(machop,'historical 50 HP Machop must be present');
const wave=wigglytuff.attacks.find(a=>a.name==='Do the Wave');
assert.ok(wave,'Do the Wave attack must be present');
const waveIndex=wigglytuff.attacks.indexOf(wave);
const wiggly=(energies=['base1-96'])=>({id:'base2-16',energies,damage:0,status:null});
const target=()=>({id:machop.id,energies:[],damage:0,status:null});
const bench=n=>Array.from({length:n},target);
const hpRemaining=u=>Math.max(0,Number(CATALOG.get(u.id).hp)-(u.damage||0));
const helpers={strongestAffordableAttack:AI.strongestAffordableAttack,
 projectedAttackValue:AI.projectedAttackValue,hpRemaining};

test('compiled bench-count damage works by effect, not only by attack name',()=>{
 const renamed={...wave,name:'Generic Bench Attack'};
 assert.equal(AI.estimatedDamage(renamed,wiggly(),target(),0),10);
 assert.equal(AI.estimatedDamage(renamed,wiggly(),target(),4),50);
 assert.equal(AI.knockoutChance(renamed,wiggly(),target(),0),0);
 assert.equal(AI.knockoutChance(renamed,wiggly(),target(),4),1);
});

test('affordable attacks and strategic projections use the attacker Bench count',()=>{
 const active=wiggly(['base1-96','base1-96']);
 const defender=target();
 assert.equal(AI.strongestAffordableAttack(active,defender,0),10);
 assert.equal(AI.strongestAffordableAttack(active,defender,4),50);
 assert.ok(AI.projectedAttackValue(active,defender,0,4)>
  AI.projectedAttackValue(active,defender,0,0)+100,
  'a guaranteed knockout must be recognized by the search evaluator');
});

test('opposing Wigglytuff with four Benched Pokémon is a visible knockout threat',()=>{
 const o={turnSerial:5,self:{active:target(),bench:[]},
  opponent:{active:wiggly(['base1-96','base1-96']),bench:bench(4)}};
 assert.equal(publicCounterplay(o,helpers).koChance,1);
 o.opponent.bench=[];
 assert.equal(publicCounterplay(o,helpers).koChance,0);
});

test('promoting a Benched Wigglytuff reduces its own Bench by one',()=>{
 const o={turnSerial:5,self:{active:target(),bench:[]},
  opponent:{active:target(),bench:[wiggly(['base1-96','base1-96']),...bench(3)]}};
 const threat=publicCounterplay(o,helpers);
 const promotedImpact=AI.projectedAttackValue(o.opponent.bench[0],o.self.active,5,3);
 const activeImpact=AI.projectedAttackValue(o.opponent.active,o.self.active,5,4);
 assert.ok(Math.abs(threat.benchThreat-.18*Math.max(0,promotedImpact-activeImpact))<1e-8,
  'search must not treat a promoted Bench attacker as still occupying its Bench slot');
});

test('Apex final-Prize and knockout-tempo bonuses recognize four-Bench Do the Wave',()=>{
 const cfg=AI.configuration({side:1,level:8});
 const o={phase:'game',turnSerial:5,
  self:{active:wiggly(['base1-96','base1-96']),bench:bench(4),prizeCount:1},
  opponent:{active:target(),bench:bench(1),prizeCount:3}};
 const action={type:'attack',payload:{attackIndex:waveIndex}};
 assert.equal(AI.prizeRaceBonus(action,o,cfg),550);
 assert.equal(AI.knockoutTempoBonus(action,o,cfg),550);
 o.self.bench=[];
 assert.equal(AI.prizeRaceBonus(action,o,cfg),0);
 assert.equal(AI.knockoutTempoBonus(action,o,cfg),0);
});

test('Energy attachment recognizes Do the Wave unlocked by the actual Bench',()=>{
 const cfg=AI.configuration({side:1,level:8});
 const o={phase:'game',turn:1,round:5,turnSerial:10,
  self:{active:wiggly(['base1-96']),bench:bench(4),hand:['base1-97'],
   energyUsed:false,retreated:false,prizeCount:3},
  opponent:{active:target(),bench:bench(1),prizeCount:3}};
 const action={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const withBench=AI.score(action,o,cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 o.self.bench=[];
 const withoutBench=AI.score(action,o,cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.ok(withBench>withoutBench+50,
  'attachment scoring must account for the damage unlocked by the Bench');
});
