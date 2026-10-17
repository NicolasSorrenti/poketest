'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const el=()=>({classList:{add(){},remove(){}},textContent:'',style:{}});
const ctx={console,Math,document:{getElementById:el,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const run=s=>vm.runInContext(s,ctx);
const cases=[
 ['selfDamageBonus','Does 10 damage plus 10 more damage for each damage counter on Tauros.'],
 ['defenderDamageBonus','Does 10 damage plus 10 more damage for each damage counter on the Defending Pokémon.'],
 ['selfDamageMinus','Does 60 damage minus 10 for each damage counter on Machoke.'],
 ['selfDamageTimes','Does 10 damage times number of damage counters on Magikarp.'],
 ['benchCountBonus','Does 10 damage plus 10 more damage for each of your Benched Pokémon.'],
 ['cantRetreat',"The Defending Pokémon can't retreat during your opponent's next turn."],
 ['smokescreen',"If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing."],
 ['discardDefenderEnergy','If the Defending Pokémon has any Energy cards attached to it, choose 1 of them and discard it.'],
 ['ownBenchSpread',"Does 10 damage to each of your own Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)"]
];
for(const [expected,text] of cases)assert.equal(run(`engine.attackPattern(${JSON.stringify({name:'Test',text})})`),expected,text);
run(`lookup=new Map([
 ['a',{id:'a',name:'Tauros',supertype:'Pokémon',hp:'100',types:['Colorless'],attacks:[{name:'Rampage',cost:[],damage:'10',text:'Does 10 damage plus 10 more damage for each damage counter on Tauros.'}]}],
 ['d',{id:'d',name:'Defender',supertype:'Pokémon',hp:'200',types:['Colorless'],attacks:[]}]
]); engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.turn=0;engine.phase='game';engine.started=true;engine.round=1;engine.players[0].active=unit('a');engine.players[0].active.damage=30;engine.players[1].active=unit('d');engine.players[0].prizes=['d'];engine.players[1].prizes=['a'];engine.end=()=>{};render=()=>{};`);
assert.equal(run('engine.attack(0,null,true)'),true);
assert.equal(run('engine.players[1].active.damage'),40);
console.log('PASS: expanded executable attack families and damage-counter scaling');
