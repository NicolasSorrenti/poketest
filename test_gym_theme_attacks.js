'use strict';
const assert=require('node:assert/strict');
const R=require('./retail_theme_decks');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const A=require('./attack_effects_core');
const GYM=require('./gym_theme_attack_core');
const ids=R.gymIds.filter(id=>CATALOG.get(id).supertype==='Pokémon');
const energy={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99'};
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
let completed=0;
const all=[];
for(const id of ids){const c=CATALOG.get(id);for(let i=0;i<(c.attacks||[]).length;i++)if(A.compile(c.attacks[i])?.kind.startsWith('gym:'))all.push({id,c,i,attack:c.attacks[i]});}
assert.ok(all.length>=26, `Expected at least 26 curated Gym attacks, got ${all.length}`);
for(const x of all){
 const g=createGame({decks:[R.list('brock'),R.list('misty')],format:'gym-theme',seed:300+completed});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;
 const p=g.players[0],f=g.players[1];p.active=unit(x.id);f.active=unit('base1-3'); // Chansey 120 HP
 const energies=x.attack.cost||[];
 p.active.energies=energies.map(e=>energy[e]||energy.Colorless);
 if(x.attack.name==='Water Punch')p.active.energies.push('base1-102');
 if(x.attack.name==='Retaliation'||x.attack.name==='Retaliate'||x.attack.name==='Fury Punch')p.active.damage=20;
 if(x.attack.name==='Synchronize')f.active.energies=p.active.energies.map(()=>energy.Grass);
 if(x.attack.name==='Rend')f.active.damage=10;
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:x.i}});
 assert.ok(r.ok,`${x.id}: ${x.attack.name}: ${r.error}`);
 for(let i=0;i<8&&g.pendingDecision;i++){
  const d=g.pendingDecision;const r2=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected:d.options.slice(0,d.min).map(o=>o.id)}});
  assert.ok(r2.ok,`${x.id}: ${x.attack.name} choice: ${r2.error}`);
 }
 assert.equal(g.pendingDecision,null,`${x.id}: ${x.attack.name} left a pending decision`);
 completed++;
}
// Some attack-specific outcome checks, using deterministic low-level resolution.
const pick=name=>all.find(x=>x.attack.name===name);
const rolls=(name,seq,c={})=>{let i=0;return A.resolve(A.compile(pick(name).attack),()=>seq[i++]??false,c);};
assert.equal(rolls('Super Fang',[],{enemyRemainingHP:50}).damage,30);
assert.equal(rolls('Water Punch',[true,false,true],{selfWater:3}).damage,50);
assert.equal(rolls('Fury Punch',[true],{selfCounters:3}).damage,60);
assert.equal(rolls('Spin Ball',[false]).damage,0);
assert.deepEqual(rolls('Sleep Poison',[]).statuses,['Asleep','Poisoned']);
assert.deepEqual(rolls('Fast-Acting Poison',[false,true]).flips,[false,true]);
assert.equal(rolls('Retaliate',[],{selfCounters:4}).damage,40);
assert.equal(rolls('Rend',[],{defenderCounters:2}).damage,40);
assert.equal(rolls('Risky Attack',[false]).selfDamage,100);
assert.equal(rolls('Double-edge',[]).selfDamage,20);
console.log(`PASS curated Gym attack effects: ${completed} newly implemented printed attacks with full reducer and outcome tests`);
