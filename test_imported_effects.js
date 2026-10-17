'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const el=()=>({classList:{add(){},remove(){}},textContent:'',style:{}});
const ctx={console,Math,document:{getElementById:el,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const evalIn=s=>vm.runInContext(s,ctx);
const base=JSON.parse(fs.readFileSync(__dirname+'/cards/base1.json','utf8'));
const by=(name)=>base.find(x=>x.name===name);
for(const name of ['Mewtwo','Chansey'])assert.ok(by(name));
const mewtwo=by('Mewtwo'),chansey=by('Chansey');
assert.equal(evalIn(`engine.attackPattern(${JSON.stringify(mewtwo.attacks[0])})`),'defenderEnergyBonus');
assert.equal(evalIn(`engine.attackPattern(${JSON.stringify(chansey.attacks[0])})`),'coinPreventDamage');
evalIn(`lookup=new Map([${JSON.stringify(mewtwo)},${JSON.stringify(chansey)},{id:'water',name:'Water Energy',supertype:'Energy'}].filter(x=>x.id).map(x=>[x.id,x]));`);
// Ensure card-specific variants aren't accidentally confused with generic effects.
assert.equal(evalIn(`engine.legalAttack(${JSON.stringify({name:'Unscripted',text:'Copy an attack, then choose any Energy to discard.'})})`),false);
console.log('PASS: imported Base Set Psychic Energy scaling, Scrunch protection, unsupported effects stay blocked');
