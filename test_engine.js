'use strict';
// Targeted, dependency-free smoke test of Fossil Hitmonlee and AI decisions.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8');
const pre=src.split('async function load()')[0];
const objects=new Map();
const context={Math,console,document:{getElementById:()=>({classList:{add(){},remove(){}},textContent:'',style:{}}),querySelector:()=>null},setTimeout:()=>0,clearTimeout(){},prompt:()=> '1'};
vm.createContext(context);
vm.runInContext(pre.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();').replace('async function cpu(generation){','async function cpu(generation){'),context);
vm.runInContext(`lookup=new Map([
['base3-7',{id:'base3-7',name:'Hitmonlee',supertype:'Pokémon',hp:'60',types:['Fighting'],attacks:[{name:'Stretch Kick',cost:['Fighting','Fighting'],text:"If your opponent has any Benched Pokémon, choose 1 of them and this attack does 20 damage to it. (Don't apply Weakness and Resistance for Benched Pokémon.)"},{name:'High Jump Kick',cost:['Fighting','Fighting','Fighting'],damage:'50'}]}],
['base3-target',{id:'base3-target',name:'Bench Target',hp:'20',weaknesses:[{type:'Fighting',value:'×2'}],resistances:[],attacks:[]}],
['base1-energy',{id:'base1-energy',name:'Fighting Energy',supertype:'Energy'}],
['base1-defender',{id:'base1-defender',name:'Defender',hp:'120',attacks:[]}]]);
engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.turn=1;engine.phase='game';engine.started=true;engine.round=1;
engine.players[1].active=unit('base3-7');engine.players[1].active.energies=['base1-energy','base1-energy'];
engine.players[0].active=unit('base1-defender');engine.players[0].bench=[unit('base3-target')];engine.players[0].prizes=['base1-energy'];engine.players[1].prizes=['base1-energy'];
engine.end=()=>{};render=()=>{};`,context);
assert.equal(vm.runInContext('engine.legalAttack(lookup.get("base3-7").attacks[0])',context),true);
assert.equal(vm.runInContext('attackScore(lookup.get("base3-7").attacks[0],engine)',context),105);
assert.equal(vm.runInContext('engine.attack(0,0)',context),true);
assert.equal(vm.runInContext('engine.players[0].bench.length',context),0);
assert.equal(vm.runInContext('engine.players[1].hand.length',context),1);
assert.equal(vm.runInContext('engine.players[0].active.damage',context),0);
console.log('PASS: Stretch Kick legal, AI evaluates Bench KO, KO awards Prize, Active untouched');
