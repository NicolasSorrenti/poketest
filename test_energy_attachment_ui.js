'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/engine.js','utf8'),prefix=src.split('async function load()')[0];
const box=()=>({classList:{add(){},remove(){},toggle(){}},textContent:'',style:{},append(){},querySelectorAll(){return[]},innerHTML:'',animate(){return {finished:Promise.resolve()}},getBoundingClientRect(){return {left:0,top:0,width:1,height:1}}});
const ctx={console,Math,document:{getElementById:box,querySelector:()=>null,createElement:box,querySelectorAll:()=>[]},setTimeout:()=>0,clearTimeout(){},window:{}};
vm.createContext(ctx);vm.runInContext(prefix.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const state=vm.runInContext(`lookup=new Map([
 ['a',{id:'a',name:'Active',hp:'60',supertype:'Pokémon',subtypes:['Basic'],types:['Water'],attacks:[]}],
 ['b',{id:'b',name:'Bench',hp:'50',supertype:'Pokémon',subtypes:['Basic'],types:['Water'],attacks:[]}],
 ['e1',{id:'e1',name:'Water Energy',supertype:'Pokémon',subtypes:['Basic'],types:[]}],['e2',{id:'e2',name:'Water Energy',supertype:'Pokémon',subtypes:['Basic'],types:[]}]
]);engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.players[0].active=unit('a');engine.players[0].bench=[unit('b')];engine.players[0].hand=['e1','e2'];engine.players[1].active=unit('a');engine.phase='game';engine.started=true;engine.turn=0;render=()=>{};
const classified={energy:energy(lookup.get('e1')),basic:basic(lookup.get('e1')),benchAttempt:engine.playBasic(0)};const first=engine.attach(0,-1);engine.players[0].energyUsed=false;const second=engine.attach(0,0);JSON.stringify({classified,first,second,active:engine.players[0].active.energies,bench:engine.players[0].bench[0].energies,hand:engine.players[0].hand})`,ctx);
assert.deepEqual(JSON.parse(state),{classified:{energy:true,basic:false,benchAttempt:false},first:true,second:true,active:['e1'],bench:['e2'],hand:[]});
assert.match(src,/attach-energy-action/,'selected Energy exposes explicit attachment actions');
assert.match(src,/Attach to \$\{engine\.card\(p\.active\)/,'Active attachment button is rendered');
assert.match(src,/p\.bench\.forEach\(\(unit,slot\)=>addAttach/,'each Benched Pokémon receives an attachment button');
console.log('PASS: malformed Basic Energy is not a Pokémon, attaches to Active or Bench, and has explicit UI controls');
