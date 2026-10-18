'use strict';
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v082');

const coins=(...sequence)=>{const q=[...sequence];return ()=>{assert.ok(q.length,'unexpected coin');return q.shift();};};
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),original=CATALOG.get(id)?.attacks?.find(x=>x.name===name);
 assert.ok(original,'historical printing '+key);
 assert.equal(ATTACK.compile(original)?.kind,'neo82:'+kind);
 assert.equal(ATTACK.compile({...original,text:original.text+' altered'}),null,'exact text only: '+key);
}
function roll(id,name,flips=[],context={}){
 const attack=CATALOG.get(id).attacks.find(x=>x.name===name);
 return ATTACK.resolve(ATTACK.compile(attack),coins(...flips),context);
}
assert.equal(roll('neo3-30','Rock Tumble').ignoreResistance,true);
assert.equal(roll('neo4-20','Mind Shock').ignoreWR,true);
assert.equal(roll('neo3-36','Nap').healSelf,30);
assert.equal(roll('neo3-36','High-Speed Charge').disableThisAttack,true);
assert.equal(roll('neo4-38','Rock Tackle').selfDamage,10);
assert.equal(roll('neo3-53','Magma Ring').noRetreat,true);
assert.equal(roll('neo4-43','Corner').noRetreat,true);
assert.equal(roll('neo4-40','Dark Song',[true]).status,'Asleep');
assert.equal(roll('neo4-40','Dark Song',[false]).status,'Confused');
assert.deepEqual(roll('neo3-49','Needle Storm',[true,true,false]).flips,[true,true,false]);
assert.equal(roll('neo3-49','Needle Storm',[true,true,false]).damage,40);
assert.deepEqual(roll('neo4-31','Egg Toss',[false,true]).flips,[false,true]);
assert.equal(roll('neo4-31','Egg Toss',[false,true]).damage,0);
assert.equal(roll('neo4-31','Egg Toss',[true,true]).damage,80);
assert.equal(roll('neo3-37','Horn Swipe',[true,true]).damage,60);
assert.equal(roll('neo3-37','Horn Swipe',[true,false]).damage,20);
assert.equal(roll('neo3-31','Strange Dance',[true]).status,'Confused');
assert.equal(roll('neo3-31','Strange Dance',[false]).damage,20);
assert.equal(roll('neo3-55','Raging Headbutt',[true],{selfCounters:4}).damage,50);
assert.equal(roll('neo3-55','Raging Headbutt',[false],{selfCounters:4}).damage,10);
assert.equal(roll('neo4-51','Slash About',[],{selfEnergy:2,enemyEnergy:3}).damage,40);
assert.equal(roll('neo4-51','Slash About',[],{selfEnergy:3,enemyEnergy:3}).damage,20);

const energy={Grass:'base1-99',Water:'base1-102',Fire:'base1-98',Fighting:'base1-97',Psychic:'base1-101',Lightning:'base1-100',Darkness:'neo1-104',Metal:'neo1-19',Colorless:'base1-99'};
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(id,name){
 const deck=list('base1:Brushfire');
 const g=createGame({decks:[deck,deck],format:'online-preview',seed:71});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=12;g.rngState=456;
 const a=CATALOG.get(id).attacks.find(x=>x.name===name);
 assert.ok(a);
 g.players[0].active=U(id,{energies:a.cost.map(x=>energy[x])});
 g.players[1].active=U('base1-2',{energies:['base1-99','base1-99','base1-99']});
 g.players[0].bench=[U('base1-44')];
 g.players[1].bench=[U('base1-44')];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function use(g,name){
 const id=g.players[0].active.id;
 const i=CATALOG.get(id).attacks.findIndex(x=>x.name===name);
 const done=applyCommand(g,0,{type:'attack',payload:{attackIndex:i}});
 assert.equal(done.ok,true,name+': '+done.error);
 assert.equal(g.pendingDecision,null,name+' unexpected unfinished choice');
}
{
 const g=game('neo3-36','Nap');g.players[0].active.damage=40;
 use(g,'Nap');assert.equal(g.players[0].active.damage,10);
}
{
 const g=game('neo3-53','Magma Ring');
 use(g,'Magma Ring');assert.equal(g.players[1].active.damage,20);
 assert.ok(g.players[1].active.noRetreat?.expires>g.turnSerial);
}
{
 const g=game('neo3-36','High-Speed Charge');
 use(g,'High-Speed Charge');assert.equal(g.players[0].active.damage,30);
 assert.ok(g.players[0].active.gymAttackCooldown?.expires>g.turnSerial);
}
{
 const g=game('neo4-40','Dark Song');
 use(g,'Dark Song');assert.ok(['Asleep','Confused'].includes(g.players[1].active.status));
}
{
 const g=game('neo4-51','Slash About');
 use(g,'Slash About');assert.equal(g.players[1].active.damage,40);
}
{
 const g=game('neo4-20','Mind Shock');
 use(g,'Mind Shock');assert.equal(g.players[1].active.damage,30);
}
console.log('PASS Neo v0.82: 14 exact signatures, coin branches, timing flags, and six full reducer attacks');
