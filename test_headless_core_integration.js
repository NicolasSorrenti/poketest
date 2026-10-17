'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const core=require('./core_rules');
const source=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const fake={classList:{add(){},remove(){}},style:{},textContent:'',querySelectorAll(){return []}};
let invoked=0;const instrumented={...core,canPayEnergy:(...args)=>{invoked++;return core.canPayEnergy(...args)}};
const ctx={NeoCoreRules:instrumented,Math,console,document:{getElementById(){return fake},querySelector(){return null}},setTimeout:()=>0,clearTimeout(){},prompt:()=>null};
vm.createContext(ctx);
vm.runInContext(source.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const card=(id,name,supertype,extra={})=>({id,name,supertype,attacks:[],abilities:[],types:[],subtypes:[],...extra});
const fixtures=[
 card('b','Bulbasaur','Pokémon',{subtypes:['Basic'],hp:'50',types:['Grass']}),
 card('i','Ivysaur','Pokémon',{subtypes:['Stage 1'],evolvesFrom:'Bulbasaur',hp:'70'}),
 card('f','Fire Energy','Energy'),card('g','Grass Energy','Energy'),
 card('c','Charmander','Pokémon',{subtypes:['Basic'],hp:'50'}),
 card('t','Bill','Trainer',{rules:['Draw 2 cards.']}),
];
ctx.seedCards=fixtures;
vm.runInContext(`lookup=new Map(seedCards.map(c=>[c.id,c]));engine.players=[statePlayer('One',[]),statePlayer('Two',[])];engine.turn=0;engine.round=2;engine.phase='game';engine.started=true;engine.over=false;engine.players[0].active=unit('b');engine.players[1].active=unit('c');engine.players[0].hand=['f','i','t','g'];engine.players[0].active.playedTurn=0;render=()=>{};battleFX=()=>Promise.resolve();`,ctx);
// Checks that real Engine delegates to the extracted module, not just equivalent code.
try{
 assert.equal(vm.runInContext('engine.attach(0,-1)',ctx),true);
 assert.equal(vm.runInContext('engine.players[0].active.energies.length',ctx),1);
 assert.equal(vm.runInContext('engine.players[0].energyUsed',ctx),true);
 assert.equal(vm.runInContext('engine.attach(2,-1)',ctx),false);
 assert.equal(vm.runInContext('engine.evolve(0,-1)',ctx),true);
 assert.equal(vm.runInContext('engine.players[0].active.id',ctx),'i');
 assert.equal(vm.runInContext('engine.players[0].active.energies[0]',ctx),'f');
 assert.equal(vm.runInContext("engine.afford(engine.players[0].active,['Fire'])",ctx),true);
 assert.equal(vm.runInContext("engine.afford(engine.players[0].active,['Grass'])",ctx),false);
 assert.ok(invoked>=2);
}finally{}
console.log('PASS actual browser Engine: attach Energy, enforce once per turn, evolve preserving Energy, pay typed attack costs through extracted core');
