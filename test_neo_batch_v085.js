'use strict';
const assert=require('node:assert/strict');
const A=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v085');
const EN={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99',Darkness:'neo1-104',Metal:'neo1-19'};
const unit=(id,opts={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...opts});
const printed=(id,name)=>{const a=CATALOG.get(id)?.attacks?.find(a=>a.name===name);assert.ok(a,id+' '+name);return a;};
const flips=(...results)=>{const q=[...results];return ()=>{assert.ok(q.length,'unexpected flip');return q.shift();};};
const resolve=(id,name,coin=[],ctx={})=>A.resolve(A.compile(printed(id,name)),flips(...coin),ctx);
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=printed(id,name),compiled=A.compile(a);
 assert.equal(compiled?.kind,effect==='water-cannon'?'target-any':'neo85:'+effect);
 assert.equal(A.compile({...a,text:a.text+' changed'}),null,'exact printed signature '+key);
}
assert.equal(resolve('neo3-18','Rainbow Burn',[],{selfBasicTypes:4}).damage,70);
assert.equal(resolve('neo3-18','Rainbow Burn',[],{selfBasicTypes:0}).damage,30);
assert.equal(resolve('neo3-28','Tail Shock',[true]).benchSide,'opponent');
assert.equal(resolve('neo3-28','Tail Shock',[false]).benchDamage,undefined);
assert.equal(resolve('neo3-46','Flock Attack',[true,false,true],{murkrowBench:3}).damage,30);
assert.equal(resolve('neo3-46','Flock Attack',[],{murkrowBench:0}).damage,10);
assert.equal(resolve('neo4-33','MAX Burst',[true,false,true],{opponentAllEnergy:3}).damage,40);
assert.equal(resolve('neo4-33','MAX Burst',[],{opponentAllEnergy:0}).damage,0);
assert.equal(resolve('neo4-40','Slap Awake',[],{defenderStatus:'Asleep'}).damage,40);
assert.equal(resolve('neo4-40','Slap Awake',[],{defenderStatus:'Confused'}).clearDefenderSleepConfuse,true);
assert.equal(resolve('neo4-40','Slap Awake',[],{defenderStatus:null}).damage,20);
assert.equal(resolve('neo4-47','Core Blast',[],{enemySpecialEnergy:2}).damage,70);
assert.deepEqual(resolve('neo4-48','Pulse Guard').shield,{minimumDamage:30});
assert.equal(resolve('neo4-52','Hypno Shower').healBothBenches,10);
assert.equal(resolve('neo4-52','Hypno Shower').status,'Asleep');
assert.equal(resolve('neo4-53','Synchronize',[],{selfEnergy:3,enemyEnergy:3}).damage,40);
assert.equal(resolve('neo4-53','Synchronize',[],{selfEnergy:3,enemyEnergy:2}).damage,0);
assert.equal(resolve('neo4-62','Ink Blast',[],{extraEnergies:()=>4}).damage,40);
assert.equal(resolve('neo4-62','Ink Blast',[],{extraEnergies:()=>1}).damage,30);
assert.equal(resolve('neo4-62','Ink Blast',[],{extraEnergies:()=>0}).damage,20);
assert.equal(A.resolve(A.compile(printed('neo4-37','Water Cannon')),()=>true,{selfEnergy:4}).targetDamage,30);
assert.equal(A.resolve(A.compile(printed('neo4-37','Water Cannon')),()=>true,{selfEnergy:1}).targetDamage,10);
assert.throws(()=>resolve('neo3-46','Flock Attack',[],{murkrowBench:6}),/Invalid/);
assert.throws(()=>resolve('neo4-33','MAX Burst',[],{opponentAllEnergy:61}),/Invalid/);
function game(id,name){
 const deck=list('base1:Brushfire');
 const g=createGame({decks:[deck,deck],format:'online-preview',seed:725});
 g.phase='game';g.round=5;g.turn=0;g.turnSerial=12;g.rngState=725;
 g.players[0].active=unit(id,{energies:printed(id,name).cost.map(t=>EN[t])});
 g.players[1].active=unit('base1-2',{energies:['base1-99','base1-98','base1-102']});
 g.players[0].bench=[unit('base1-44',{damage:20}),unit('base1-44',{damage:10})];
 g.players[1].bench=[unit('base1-2',{damage:30}),unit('base1-2',{damage:20})];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function attack(g,name){const a=CATALOG.get(g.players[0].active.id).attacks.findIndex(x=>x.name===name);send(g,0,'attack',{attackIndex:a});}
{
 const g=game('neo4-37','Water Cannon');
 g.players[0].active.energies=['base1-102','base1-102','base1-102'];
 attack(g,'Water Cannon');assert.equal(g.pendingDecision?.actor,0);
 const d=g.pendingDecision;assert.ok(d.options.some(x=>x.id==='bench:1'));
 send(g,0,'choose',{decisionId:d.id,selected:['bench:1']});
 assert.equal(g.players[1].bench[1].damage,50);
 assert.equal(g.players[1].active.damage,0);
}
{
 const g=game('neo4-40','Slap Awake');g.players[1].active.status='Asleep';g.players[1].active.poison=true;
 attack(g,'Slap Awake');assert.equal(g.players[1].active.damage,50,'40 attack damage plus 10 Poison between-turn damage');
 assert.equal(g.players[1].active.status,null);
 assert.equal(g.players[1].active.poison,true,'Slap Awake does not cure independent Poison');
}
{
 const g=game('neo4-52','Hypno Shower');attack(g,'Hypno Shower');
 assert.equal(g.players[0].bench[0].damage,10);
 assert.equal(g.players[1].bench[0].damage,20);
 assert.ok([null,'Asleep'].includes(g.players[1].active.status),'Sleep may clear at the immediate between-turn wake check');
}
{
 const g=game('neo4-48','Pulse Guard');attack(g,'Pulse Guard');
 assert.equal(g.players[0].active.shield?.minimumDamage,30);
}
{
 const g=game('neo3-28','Tail Shock');attack(g,'Tail Shock');
 const heads=g.coinFlips.at(-1).result==='heads';
 assert.equal(g.players[1].bench[0].damage,heads?40:30);
}
{
 const g=game('neo4-47','Core Blast');g.players[1].active.energies=['base1-96','neo1-104'];
 attack(g,'Core Blast');assert.equal(g.players[1].active.damage,70);
}
console.log('PASS Neo v085: 11 exact effects, coin and context branches, six full reducer interactions');
