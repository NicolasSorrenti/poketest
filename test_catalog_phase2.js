'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {applyCardCorrections}=require('./card_corrections');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const el=()=>({classList:{add(){},remove(){}},textContent:'',style:{}}),ctx={console,Math,document:{getElementById:el,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const run=s=>vm.runInContext(s,ctx),all=applyCardCorrections(['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'].flatMap(s=>JSON.parse(fs.readFileSync(`${__dirname}/cards/${s}.json`))));
const find=(card,attack)=>all.flatMap(c=>c.name===card?(c.attacks||[]):[]).find(a=>a.name===attack);
const cases=[
 ['Farfetch\'d','Leek Slap','oncePerPlayCoin'],['Gastly','Destiny Bond','destinyBond'],
 ['Bellsprout','Call for Family','searchBasicToBench'],['Persian','Pounce','defendReduce'],
 ['Rhyhorn','Leer','coinPreventAttack'],['Mewtwo','Energy Absorption','recoverEnergyAttach'],
 ['Gastly','Energy Conversion','recoverEnergyHandRecoil'],['Slowpoke','Scavenge','recoverTrainer'],
 ['Hitmontop','Rapid Spin','rapidSpin'],['Sabrina\'s Abra','Psyscan','revealHand'],
 ['Scyther','Slashing Strike','selfAttackLock'],['Rocket\'s Snorlax','Collapse','selfSleep'],
 ['Erika\'s Weepinbell','Sleep Poison','sleepPoison'],['Rapidash','Super Singe','coinBurn'],
 ['Entei','Protective Flame','benchShield']
];
for(const [card,name,pattern] of cases){const a=find(card,name);assert(a,`${card} ${name} exists`);assert.equal(run(`engine.attackPattern(${JSON.stringify(a)})`),pattern,`${card} ${name}`)}
assert.equal(run(`engine.attackPattern(${JSON.stringify(find('Clefable','Metronome'))})`),null,'copy attacks remain blocked until full attack-copy execution and choices exist');
console.log('PASS: phase-2 catalog mechanics are executable patterns; attack copying remains strictly unsupported');
