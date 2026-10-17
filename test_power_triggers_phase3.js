'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const math=Object.create(Math);math.random=()=>0;
const box=()=>({classList:{add(){},remove(){}},textContent:'',style:{},append(){},querySelectorAll(){return[]},innerHTML:''});
const ctx={console,Math:math,document:{getElementById:box,querySelector:()=>null,createElement:box,querySelectorAll:()=>[]},setTimeout:()=>0,clearTimeout(){},window:{}};
vm.createContext(ctx);vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`lookup=new Map([
 ['odd',{id:'odd',name:"Erika's Oddish",hp:'40',supertype:'Pokémon',subtypes:['Basic'],types:['Grass'],abilities:[{name:'Photosynthesis'}],attacks:[]}],
 ['snor',{id:'snor',name:"Rocket's Snorlax",hp:'90',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],abilities:[{name:'Restless Sleep'}],attacks:[]}],
 ['fire',{id:'fire',name:'Fire Energy',supertype:'Energy'}],['tr',{id:'tr',name:'Bill',supertype:'Trainer'}]
]);engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.players[0].active=unit('odd');engine.players[0].active.energies=['fire'];engine.players[1].active=unit('snor');engine.phase='game';engine.turn=0;engine.round=1;engine.started=true;render=()=>{};`);
assert.equal(run(`engine.energies(engine.players[0].active)[0]`),'Grass','Photosynthesis converts attached Energy while active');
run(`engine.players[1].active.status='Asleep';engine.players[0].active.damage=0;lookup.get('odd').attacks=[{name:'Hit',cost:[],damage:'10',text:''}];engine.end=()=>{};engine.attack(0);`);
assert.equal(run(`engine.players[0].active.damage`),20,'Restless Sleep damages the attacker even while Snorlax is Asleep');
for(const name of ['Photosynthesis','Restless Sleep','Pollen Defense','Energy Drain','Shock Blast','Frog Song','Darkness','Deep Sleep','Scare','Hot Plate','Mind Games'])assert.equal(run(`IMPLEMENTED_POWERS.has(${JSON.stringify(name)})`),true,name);
console.log('PASS: phase-3 passive and triggered Powers, including status-exception behavior');
