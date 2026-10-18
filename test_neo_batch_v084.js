'use strict';
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v084');
function printed(id,name){const a=CATALOG.get(id)?.attacks?.find(x=>x.name===name);assert.ok(a,id+' '+name);return a;}
const flips=(...items)=>{const seq=[...items];return ()=>{assert.ok(seq.length,'Unexpected RNG flip');return seq.shift();};};
function outcome(id,name,sequence=[],ctx={}){return ATTACK.resolve(ATTACK.compile(printed(id,name)),flips(...sequence),ctx);}
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),attack=printed(id,name);
 assert.equal(ATTACK.compile(attack)?.kind,'neo84:'+kind);
 assert.equal(ATTACK.compile({...attack,text:attack.text+' altered'}),null,'strict Neo signature '+key);
}
assert.equal(outcome('neo3-14','Aurora Wave',[true,true]).status,'Paralyzed');
assert.equal(outcome('neo3-14','Aurora Wave',[true,false]).status,'Asleep');
assert.equal(outcome('neo3-14','Aurora Wave',[false,false]).status,undefined);
assert.equal(outcome('neo3-16','Psychic Leaf',[true,false,true],{enemyEnergy:3}).damage,30);
assert.equal(outcome('neo3-16','Psychic Leaf',[true,false,true],{enemyEnergy:3}).healFromDamage,'full');
assert.equal(outcome('neo3-34','Octazooka',[true]).attackPenalty,true);
assert.equal(outcome('neo3-34','Octazooka',[false]).attackPenalty,undefined);
assert.equal(outcome('neo3-42','Positive Ion',[true]).damage,20);
assert.equal(outcome('neo3-42','Positive Ion',[false]).damage,10);
assert.equal(outcome('neo3-43','Leek Jab').disableThisAttack,true);
assert.equal(outcome('neo3-65','Outrage',[true],{selfCounters:3}).damage,60);
assert.equal(outcome('neo3-65','Outrage',[false],{selfCounters:3}).damage,0);
assert.equal(outcome('neo4-32','Clamping Jaw').noRetreat,true);
assert.equal(outcome('neo4-32','Clamping Jaw').attackPenalty,true);
assert.equal(outcome('neo4-35','Explosion').selfDamage,60);
assert.deepEqual(outcome('neo4-44','Expand').shield,{reduce:10});
assert.equal(outcome('neo4-56','Spike Ball Tackle').selfDamage,10);
assert.equal(outcome('neo4-63','Shed').healSelf,10);
assert.equal(outcome('neo4-70','Leer',[true]).attackLock,true);
assert.equal(outcome('neo4-70','Leer',[false]).attackLock,undefined);
assert.equal(outcome('neo4-74','Giant Wave').disableAllAttacks,true);
assert.equal(outcome('neo4-79','Migraine',[true]).status,'Confused');
assert.equal(outcome('neo4-79','Migraine',[false]).selfStatus,'Confused');

const energy={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Fighting:'base1-97',Lightning:'base1-100',Psychic:'base1-101',Colorless:'base1-99',Darkness:'neo1-104'};
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(id,name){
 const d=list('base1:Brushfire');const g=createGame({decks:[d,d],format:'online-preview',seed:84});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=912;
 g.players[0].active=U(id,{energies:printed(id,name).cost.map(type=>energy[type])});
 g.players[1].active=U('base1-2',{energies:['base1-99','base1-99','base1-99']});
 for(const p of g.players){p.bench=[U('base1-44')];p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function use(g,name){
 const idx=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:idx}});
 assert.equal(r.ok,true,name+': '+r.error);
 assert.equal(g.pendingDecision,null,'Unexpected card decision '+name);
}
{
 const g=game('neo3-14','Aurora Wave');use(g,'Aurora Wave');
 assert.ok([null,'Asleep','Paralyzed'].includes(g.players[1].active.status));
 assert.equal(g.players[1].active.damage,30);
}
{
 const g=game('neo3-16','Psychic Leaf');g.players[0].active.damage=30;
 use(g,'Psychic Leaf');
 assert.ok(g.players[0].active.damage<=30);
 assert.ok(g.players[1].active.damage>=10);
}
{
 const g=game('neo4-32','Clamping Jaw');use(g,'Clamping Jaw');
 assert.ok(g.players[1].active.noRetreat?.expires>g.turnSerial);
 assert.ok(g.players[1].active.attackPenalty?.expires>g.turnSerial);
}
{
 const g=game('neo4-44','Expand');use(g,'Expand');
 assert.equal(g.players[0].active.shield?.reduce,10);
}
{
 const g=game('neo4-74','Giant Wave');use(g,'Giant Wave');
 assert.ok(g.players[0].active.gymAttackCooldown?.expires>g.turnSerial);
}
{
 const g=game('neo4-63','Shed');g.players[0].active.damage=20;use(g,'Shed');
 assert.equal(g.players[0].active.damage,10);
}
console.log('PASS Neo v0.84: 14 verified signatures, both outcomes and six full reducer effects');
