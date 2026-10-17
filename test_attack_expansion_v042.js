'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const el=()=>({classList:{add(){},remove(){}},style:{},textContent:''});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
ctx.Math.random=()=>0.01; // guaranteed heads
vm.createContext(ctx);vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const run=s=>vm.runInContext(s,ctx);
const sets=['gym1','gym2'];const all=sets.flatMap(x=>JSON.parse(fs.readFileSync(`${__dirname}/cards/${x}.json`)));
const find=(name,attack)=>all.find(c=>c.name===name&&c.attacks?.some(a=>a.name===attack));
const examples=[['Lt. Surge\'s Electabuzz','Charge','recoverLightningAttach'],['Rocket\'s Zapdos','Plasma','recoverLightningAttach'],['Rocket\'s Zapdos','Electroburn','lightningSelfRecoil'],['Erika\'s Venusaur','Growth','coinGrassGrowth'],["Koga's Arbok",'Poison Buildup','selfPoison']];
const cards=examples.map(([name,attack,pattern])=>{const c=find(name,attack);assert(c,`${name} / ${attack}`);const a=c.attacks.find(x=>x.name===attack);assert.equal(run(`engine.attackPattern(${JSON.stringify(a)})`),pattern);return c});
const dummy={id:'defender-test',name:'Defender',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'200',attacks:[]};
const L={id:'light-test',name:'Lightning Energy',supertype:'Energy',subtypes:['Basic']};
const G={id:'grass-test',name:'Grass Energy',supertype:'Energy',subtypes:['Basic']};
ctx.fixture=[...cards,dummy,L,G];run('lookup=new Map(fixture.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};');
function reset(card,energyIds){run(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.players[0].active=unit(${JSON.stringify(card.id)});engine.players[1].active=unit('defender-test');engine.players[0].active.energies=${JSON.stringify(energyIds)};engine.players[0].prizes=['defender-test'];engine.players[1].prizes=['defender-test'];engine.phase='game';engine.turn=0;engine.round=2;engine.over=false;`)}
const charge=cards[0];reset(charge,['light-test','light-test']);run(`engine.players[0].discard=['light-test','light-test','grass-test']`);assert(run(`engine.attack(${charge.attacks.findIndex(a=>a.name==='Charge')},null,true)`));assert.equal(run('engine.players[0].active.energies.length'),4);assert.equal(run('engine.players[0].discard.length'),1);
const zap=cards[1];reset(zap,['light-test','light-test']);run(`engine.players[0].discard=['light-test','grass-test']`);assert(run(`engine.attack(${zap.attacks.findIndex(a=>a.name==='Plasma')},null,true)`));assert.equal(run('engine.players[0].active.energies.length'),3);assert.equal(run('engine.players[0].discard.length'),1);
reset(zap,['light-test','light-test','light-test','light-test']);assert(run(`engine.attack(${zap.attacks.findIndex(a=>a.name==='Electroburn')},null,true)`));assert.equal(run('engine.players[0].active.damage'),40);
const venus=cards[3];reset(venus,['grass-test']);run(`engine.players[0].hand=['grass-test','grass-test','light-test']`);assert(run(`engine.attack(${venus.attacks.findIndex(a=>a.name==='Growth')},null,true)`));assert.equal(run('engine.players[0].active.energies.length'),3);assert.equal(run('engine.players[0].hand.length'),1);
const arbok=cards[4];reset(arbok,['grass-test','grass-test']);assert(run(`engine.attack(${arbok.attacks.findIndex(a=>a.name==='Poison Buildup')},null,true)`));assert.equal(run('engine.players[0].active.poison'),true);assert.equal(run('engine.players[1].active.poison'),false);
console.log('PASS: Charge, Plasma, Electroburn, Growth, Poison Buildup');
