'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8');
const pre=src.split('async function load()')[0];
const sandbox={Math,console,document:{getElementById:()=>({classList:{add(){},remove(){}},style:{}}),querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(sandbox);
vm.runInContext(pre.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),sandbox);
const evaluate=(s)=>vm.runInContext(s,sandbox);
evaluate(`lookup=new Map([
 ['b',{id:'b',name:'Charmander',supertype:'Pokémon',subtypes:['Basic'],hp:'50',types:['Fire'],attacks:[]}],
 ['s1',{id:'s1',name:'Charmeleon',supertype:'Pokémon',subtypes:['Stage 1'],evolvesFrom:'Charmander',hp:'80',types:['Fire'],attacks:[]}],
 ['s2',{id:'s2',name:'Charizard',supertype:'Pokémon',subtypes:['Stage 2'],evolvesFrom:'Charmeleon',hp:'120',types:['Fire'],attacks:[]}],
 ['defender',{id:'defender',name:'Venusaur',hp:'100',weaknesses:[{type:'Fire',value:'×2'}],resistances:[{type:'Fighting',value:'-30'}]}],
 ['en',{id:'en',name:'Fire Energy',supertype:'Energy'}]
]);render=()=>{};engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.turn=0;engine.round=2;engine.phase='game';engine.started=true;engine.players[0].active=unit('b');engine.players[0].active.playedTurn=1;engine.players[0].hand=['s1'];engine.players[0].prizes=['en'];engine.players[1].active=unit('defender');engine.players[1].prizes=['en'];`);
assert.equal(evaluate('engine.evolve(0,-1)'),true);
assert.equal(evaluate('engine.players[0].discard.length'),0,'evolution does not discard prior stage');
assert.equal(evaluate('engine.players[0].active.under[0]'),'b');
evaluate('engine.round=3;engine.players[0].hand=["s2"];engine.players[0].turnPlays=[];');
assert.equal(evaluate('engine.evolve(0,-1)'),true);
assert.equal(evaluate('engine.players[0].active.under.length'),2);
evaluate('engine.players[0].active.energies=["en"];engine.players[0].active.damage=120;engine.resolveKO();');
assert.equal(evaluate('engine.players[0].discard.length'),4,'KO discards all stages and Energy');
assert.equal(evaluate('engine.players[1].hand.length'),1,'opponent receives one prize');
assert.equal(evaluate('calculateDamage(20,{types:["Fire"]},lookup.get("defender"))'),40);
assert.equal(evaluate('calculateDamage(20,{types:["Fighting"]},lookup.get("defender"))'),0);
assert.equal(evaluate('calculateDamage(50,{types:["Fighting"]},lookup.get("defender"))'),20);
// Paralysis remains throughout the opponent turn; clears only after affected player's own turn.
evaluate('engine.over=false;engine.players[0].active=unit("b");engine.players[0].active.status="Paralyzed";engine.players[1].active=unit("defender");engine.turn=1;engine.between();');
assert.equal(evaluate('engine.players[0].active.status'),'Paralyzed');
evaluate('engine.turn=0;engine.between()');
assert.equal(evaluate('engine.players[0].active.status'),null);
console.log('PASS: evolution stacks, full KO discard, original Weakness/Resistance, paralysis duration');
