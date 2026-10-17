'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const box=()=>({classList:{add(){},remove(){}},textContent:'',style:{}});
const context={console,Math,document:{getElementById:box,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){},prompt:()=> '1'};
vm.createContext(context);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),context);
vm.runInContext(`lookup=new Map([
 ['base3-48',{id:'base3-48',name:'Grimer',hp:'50',types:['Grass'],weaknesses:[{type:'Psychic',value:'×2'}],attacks:[{name:'Minimize',cost:['Grass'],damage:'',text:"All damage done by attacks to Grimer during your opponent's next turn is reduced by 20 (after applying Weakness and Resistance)."}]}],
 ['grass',{id:'grass',name:'Grass Energy',supertype:'Energy'}],
 ['psych',{id:'psych',name:'Psychic Energy',supertype:'Energy'}],
 ['foe',{id:'foe',name:'Attacker',hp:'150',types:['Psychic'],attacks:[{name:'Punch',cost:['Psychic'],damage:'30',text:''}]}],
 ['filler',{id:'filler',name:'Filler',hp:'60',types:['Grass'],attacks:[{name:'Tap',cost:[],damage:'10',text:''}]}]
]);
engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];
engine.players[0].active=unit('base3-48');engine.players[0].active.energies=['grass'];
engine.players[1].active=unit('foe');engine.players[1].active.energies=['psych'];
for(const p of engine.players){p.deck=['filler','filler','filler'];p.prizes=['filler','filler'];}
engine.phase='game';engine.started=true;engine.turn=0;render=()=>{};
`,context);
const ev=code=>vm.runInContext(code,context);
assert.equal(ev(`engine.attackPattern(lookup.get('base3-48').attacks[0])`),'defendReduce');
assert.equal(ev(`engine.afford(engine.players[0].active,lookup.get('base3-48').attacks[0].cost)`),true);
assert.equal(ev('engine.attack(0,null,true)'),true,'non-damaging attack must execute');
assert.equal(ev('engine.players[0].active.attackShield'),20);
assert.equal(ev('engine.players[1].active.damage'),0);
assert.equal(ev('engine.turn'),0,'deferred attack must not end turn');
assert.equal(ev('engine.end(),engine.turn'),1);
assert.equal(ev('engine.players[0].active.attackShield'),20,'shield survives owner turn end');
assert.equal(ev('engine.attack(0,null,true)'),true);
assert.equal(ev('engine.players[0].active.damage'),40,'30 Psychic ×2 -20 = 40');
assert.equal(ev('engine.end(),engine.turn'),0);
assert.equal(ev('engine.players[0].active.attackShield'),0,'expires after opponent turn');
assert.equal(ev('engine.attackScore'),undefined); // tested globally below
assert.ok(ev('attackScore(lookup.get("base3-48").attacks[0],engine)')>0,'AI considers protection useful');
console.log('PASS: Grimer Minimize costs one Grass, applies shield after Weakness, expires correctly, AI values protection');
