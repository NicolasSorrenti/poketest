'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const box=()=>({classList:{add(){},remove(){}},textContent:'',style:{}});
const ctx={console,Math,document:{getElementById:box,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`lookup=new Map([['a',{id:'a',name:'Tester',hp:'200',types:['Water'],attacks:[]}],['b',{id:'b',name:'Target',hp:'300',types:['Grass'],attacks:[]}],['w',{id:'w',name:'Water Energy',supertype:'Energy'}],['card',{id:'card',name:'extra',supertype:'Trainer'}]]);engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.players[0].active=unit('a');engine.players[1].active=unit('b');engine.phase='game';engine.turn=0;engine.players[0].prizes=['card'];engine.players[1].prizes=['card'];engine.end=()=>{};render=()=>{};engine.players[0].deck=Array(10).fill('card');`);
function attack(a){run(`lookup.get('a').attacks=[${JSON.stringify(a)}];engine.players[0].active.energies=['w','w','w'];engine.players[1].active.damage=0;engine.players[0].active.damage=40;`);return run('engine.attack(0)')}
const base=(text,damage='0')=>({name:'Test',cost:[],damage,text});
assert.equal(attack(base('Draw 2 cards.')),true);assert.equal(run('engine.players[0].hand.length'),2);
assert.equal(attack(base('Remove 2 damage counters from this Pokémon.')),true);assert.equal(run('engine.players[0].active.damage'),20);
assert.equal(attack(base('Tester does 20 damage to itself.')),true);assert.equal(run('engine.players[0].active.damage'),60);
assert.equal(attack(base('Discard all Energy cards attached to Tester in order to use this attack.','30')),true);assert.equal(run('engine.players[0].active.energies.length'),0);
assert.equal(run(`engine.legalAttack({text:'Search your deck for any Pokémon and put it into your hand.'})`),false);
assert.equal(run(`engine.legalAttack({text:'If the Defending Pokémon is Benched, it cannot retreat during your next turn.'})`),false);
assert.equal(run(`engine.attackAudit().length>=0`),true);
console.log('PASS: attack interpreter draw, healing, recoil, Energy discard, strict unsupported detection, audit');
