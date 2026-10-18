'use strict';
const assert=require('node:assert/strict');
const {CATALOG}=require('./headless_duel');
const {compile,resolve}=require('./attack_effects_core');
let coverage={flat:0,'coin-times':0,'coin-failure':0,'coin-bonus':0,status:0,'coin-status':0,recoil:0,'coin-recoil':0,'draw-one':0,'bench-own':0,'bench-target':0,'bench-both-recoil':0,'bench-splash-coin':0,'switch-defender':0,'switch-attacker':0,'switch-self':0,'energy-discard':0,'defender-counters':0,'own-counters':0,'flail-counters':0,'minus-counters':0,'bench-count':0,'coin-status-split':0,'coin-recoil-bonus':0,'ignore-weakness':0,unported:0};
for(const c of CATALOG.values())for(const a of c.attacks||[]){
 const program=compile(a);if(!program){coverage.unported++;continue;}
 coverage[program.kind]=(coverage[program.kind]||0)+1;
 let flipCount=0;// Until-tails attacks need a terminating deterministic flip sequence.
 const flip=()=>['coins-until-tails','neo82:needle-storm'].includes(program.kind)?++flipCount<=3:true;
 const context={extraEnergies:()=>0,teamNameCount:()=>0,allNamedCount:()=>0,enemyRemainingHP:0,selfEnergy:0,enemyBench:0,enemyEnergy:0,selfCounters:0,defenderCounters:0,benchCount:0};
 const yes=resolve(program,flip,context),no=resolve(program,()=>false,context);
 for(const result of [yes,no]){
  assert.ok(Number.isInteger(result.damage)&&result.damage>=0,`${c.id} ${a.name}`);
  assert.ok(result.flips.every(x=>typeof x==='boolean'));
 }
 if(program.kind==='flat'){assert.equal(yes.damage,no.damage);assert.equal(yes.damage,Number(a.damage));}
 else if(program.kind==='coin-times'){
  assert.equal(yes.damage,program.flips*program.each);assert.equal(no.damage,0);
  assert.equal(yes.flips.length,program.flips);
 }
 else if(program.kind==='coin-failure'){
  assert.equal(yes.damage,program.damage);assert.equal(no.damage,0);
 }
 else if(program.kind==='coin-bonus'){
  assert.equal(yes.damage,program.base+program.bonus);assert.equal(no.damage,program.base);
 }
 else if(program.kind==='status'){
  assert.equal(yes.status,program.status);assert.equal(no.status,program.status);
  assert.equal(yes.damage,program.damage);assert.equal(no.damage,program.damage);
 }
 else if(program.kind==='coin-status'){
  assert.equal(yes.status,program.status);assert.equal(no.status,null);
  assert.equal(yes.damage,program.damage);assert.equal(no.damage,program.damage);
 }
 else if(program.kind==='recoil'){
  assert.equal(yes.selfDamage,program.selfDamage);assert.equal(no.selfDamage,program.selfDamage);
  assert.equal(yes.damage,program.damage);
 }
 else if(program.kind==='coin-recoil'){
  assert.equal(yes.selfDamage,0);assert.equal(no.selfDamage,program.selfDamage);
  assert.equal(no.damage,program.damage);
 }
 else if(program.kind==='energy-discard'){
  assert.equal(yes.discardEnergy,program.quantity);assert.equal(no.discardEnergy,program.quantity);
 }
 else if(['bench-own','bench-target','bench-both-recoil','bench-splash-coin'].includes(program.kind)){
  assert.ok(yes.benchSide);
  if(program.kind==='bench-splash-coin'){
   assert.equal(yes.benchSide,'opponent');assert.equal(no.benchSide,'self');
  }else assert.equal(yes.benchDamage,program.benchDamage);
  if(program.kind==='bench-both-recoil')assert.equal(yes.selfDamage,program.selfDamage);
 }
 else if(program.kind.startsWith('switch-')){assert.equal(yes.forceSwitch,program.kind);assert.equal(no.forceSwitch,program.kind);}
 else if(['defender-counters','own-counters','flail-counters','minus-counters','bench-count'].includes(program.kind)){
  assert.equal(yes.damage,no.damage); // the default zero-counter context
 }
 else if(program.kind==='coin-status-split'){
  assert.equal(yes.status,program.heads);assert.equal(no.status,program.tails);
 }
 else if(program.kind==='coin-recoil-bonus'){
  assert.equal(yes.damage,program.base+program.bonus);assert.equal(no.selfDamage,program.selfDamage);
 }
 else if(program.kind==='ignore-weakness'){
  assert.equal(yes.ignoreWR,true);assert.equal(yes.damage,program.damage);
 }
 else if(program.kind==='draw-one'){
  assert.equal(yes.draw,1);assert.equal(no.draw,1);
  assert.equal(yes.damage,0);
 }

}
assert.ok(coverage.unported>=0);
assert.ok(1479-coverage.unported>=952, 'Attack compiler coverage regressed');
assert.equal(Object.values(coverage).reduce((a,b)=>a+b),1479);
assert.equal(compile({damage:'20',text:'The Defending Pokémon is now Paralyzed.'}).kind,'status');
assert.equal(compile({damage:'20',text:'The Defending Pokémon is now Paralyzed. Then draw 3 cards.'}),null);
assert.equal(compile({damage:'20x',text:'The Defending Pokémon is now Poisoned.'}),null);
assert.equal(compile({damage:'10',text:'Draw a card.'}),null);
assert.equal(compile({damage:'10x',text:'Flip 3 coins. This attack does 10 damage times the number of heads.'}).flips,3);
assert.equal(compile({damage:'10',text:'Flip 3 coins. This attack does 10 damage times the number of heads.'}),null);
assert.equal(compile({damage:'0',text:'This attack does 100 damage, do something strange.'}),null);
assert.throws(()=>resolve({kind:'unknown'},()=>true),/Unsupported/);
console.log(`PASS pure attack interpreter: ${1479-coverage.unported} attack records compiled, ${coverage.unported} unported, 1479 catalogued; heads/tails branches validated`);
