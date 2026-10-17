'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const fakeEl=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:fakeEl,querySelector:()=>null},setTimeout(){},clearTimeout(){}};vm.createContext(ctx);vm.runInContext(js,ctx);
const run=s=>vm.runInContext(s,ctx);
const originals=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(s=>require('./cards/'+s+'.json'));
const aux=[...['Fire','Water','Grass','Lightning','Psychic','Fighting','Metal'].map(t=>({id:'test-'+t,name:t+' Energy',supertype:'Energy',subtypes:['Basic']})),{id:'target49dark',name:'Dark Dummy Target',supertype:'Pokémon',hp:'500',types:['Colorless'],subtypes:['Basic'],weaknesses:[],resistances:[],attacks:[{name:'Strike',cost:['Colorless'],damage:'20',text:''}],abilities:[]},{id:'target49',name:'Dummy Target',supertype:'Pokémon',hp:'500',types:['Colorless'],subtypes:['Basic'],weaknesses:[{type:'Grass',value:'×2'}],resistances:[],attacks:[{name:'Strike',cost:['Colorless'],damage:'20',text:''}],abilities:[]}];
ctx.testCards=[...originals,...aux];run('cards=testCards;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};battlefieldAttack=()=>{}');
const coverage=require('./attack_coverage.json');assert.ok(coverage.handled>=1403);assert.ok(coverage.unsupported.length<=76);assert.equal(Object.keys(run('ATTACK49')).length,14);
let count=0;
function prepare(id,name,{heads=true,setup='',turn=0}={}){
 const card=originals.find(c=>c.id===id);assert(card,id);const i=card.attacks.findIndex(a=>a.name===name);assert(i>=0,id+' '+name);
 const req=card.attacks[i].cost.map(t=>'test-'+(t==='Colorless'?'Fire':t));
 run(`engine.players=[statePlayer('Human',[]),statePlayer('CPU',[])];engine.phase='game';engine.turn=${turn};engine.round=6;engine.turnSerial=1;engine.over=false;engine.players[${turn}].active=unit(${JSON.stringify(id)});engine.players[${1-turn}].active=unit('target49');engine.players[${turn}].active.energies=${JSON.stringify([...req,'test-Fire','test-Lightning','test-Grass'])};engine.players[${turn}].bench=[unit('target49'),unit('target49')];engine.players[${1-turn}].bench=[unit('target49'),unit('target49')];engine.players[${turn}].hand=['test-Fire','test-Lightning'];engine.players[${turn}].deck=['test-Grass','test-Fire','test-Lightning'];engine.players[${turn}].discard=['test-Water','test-Fire'];engine.players[0].prizes=Array(6).fill('target49');engine.players[1].prizes=Array(6).fill('target49');deckSearchRequest=null;${setup}`);
 ctx.Math.random=()=>heads?0.01:0.99;count++;
 assert.equal(run(`engine.attackPattern(engine.card(engine.me.active).attacks[${i}])`),'batch49');
 return (choice=null)=>run(`engine.attack(${i},null,true,${JSON.stringify(choice)})`);
}
// Target validation and genuine Weakness / Resistance usage.
let go=prepare('base1-39','Conversion 1');assert.equal(go(),false);assert.equal(run('deckSearchRequest.options.length'),8);let snapshot=run('JSON.stringify(engine.players)');assert.equal(go(100),false);assert.equal(run('JSON.stringify(engine.players)'),snapshot);assert(go(1));assert.equal(run('engine.foe.active.weaknessOverride'),'Fire');
go=prepare('base5-48','Conversion 1');assert(go(3));assert.equal(run('engine.foe.active.weaknessOverride'),'Lightning');
go=prepare('base1-39','Conversion 2');assert(go(2));assert.equal(run('engine.me.active.resistanceOverride'),'Water');
// Legacy Energy and target markers.
go=prepare('basep-46','Lightning Rod');assert.equal(go(),false);assert(go(1));assert.equal(run('engine.foe.bench[1].lightningRodMarker'),true);
go=prepare('basep-46','Lightning Bolt',{setup:'engine.foe.bench[0].lightningRodMarker=true;engine.foe.active.lightningRodMarker=true'});assert(go());assert.equal(run('engine.foe.active.damage'),30);assert.equal(run('engine.foe.bench[0].damage'),20);
// Multi-select must not discard duplicate/invalid selections.
go=prepare('basep-44','Burning Fire',{setup:"engine.me.bench[0].energies=['test-Fire']"});assert.equal(go(),false);snapshot=run('JSON.stringify(engine.players)');assert.equal(go([0,0]),false);assert.equal(run('JSON.stringify(engine.players)'),snapshot);assert(go([0,100]));assert.equal(run('engine.foe.active.damage'),30);assert.equal(run('engine.me.discard.length'),4);
// Optional discard / target: decline, and choose Bench 2.
go=prepare('base5-44','Flame Pillar');assert(go(-1));assert.equal(run('engine.foe.active.damage'),30);assert.equal(run('engine.foe.bench[1].damage'),0);
go=prepare('base5-44','Flame Pillar');assert(go(100));assert.equal(run('engine.foe.active.damage'),30);assert.equal(run('engine.foe.bench[1].damage'),10);
// Coin branches must not cause opposite outcomes.
go=prepare('basep-23','Lightning Burn',{heads:true});assert(go(1));assert.equal(run('engine.foe.active.damage'),30);assert.equal(run('engine.foe.bench[1].damage'),30);assert.equal(run('engine.me.active.damage'),0);
go=prepare('basep-23','Lightning Burn',{heads:false});assert(go(0));assert.equal(run('engine.foe.bench[0].damage'),0);assert.equal(run('engine.me.active.damage'),30);
// Lock-on must persist exactly for next turn and the original Defending Pokemon.
go=prepare('neo2-7','Lock-on',{heads:false});assert(go());assert.equal(run('engine.me.active.lockOnUntil'),7);run('engine.round=7');ctx.Math.random=()=>0.99;assert(run('engine.attack(1,null,true)'));assert.equal(run('engine.foe.active.damage'),50);assert.equal(run('engine.foe.active.status'),'Paralyzed');
go=prepare('neo2-26','Lock-on',{heads:false});assert(go());run('engine.round=8');assert(run('engine.attack(1,null,true)'));assert.equal(run('engine.foe.active.damage'),0);
// Dark Flame: discard one attached Energy and select Energy to retrieve.
go=prepare('neo3-8','Dark Flame');assert.equal(go(),false);assert(run('deckSearchRequest.options.length>0'));assert(go(0));assert.equal(run('engine.foe.active.damage'),20);assert.equal(run('engine.me.active.energies.includes("test-Water")'),true);
// Spread only to Pokemon that have the selected Energy type.
go=prepare('neo3-25','Core Stream',{setup:"engine.foe.active.energies=['test-Water'];engine.foe.bench[0].energies=['test-Lightning'];engine.foe.bench[1].energies=['test-Lightning']"});assert(go(3));assert.equal(run('engine.foe.active.damage'),0);assert.equal(run('engine.foe.bench[0].damage'),20);assert.equal(run('engine.foe.bench[1].damage'),20);
// Conditional opponent type and outcome.
go=prepare('neo4-25','Beatdown',{heads:true,setup:"engine.foe.active=unit('target49dark')"});assert(go());assert.equal(run('engine.foe.active.damage'),100);
go=prepare('neo4-25','Beatdown',{heads:false,setup:"engine.foe.active=unit('target49dark')"});assert(go());assert.equal(run('engine.foe.active.damage'),50);
// Belly Drum: damage, choose at most two distinct Basic Energy from deck, shuffle.
go=prepare('neo2-44','Belly Drum');assert.equal(go(),false);assert.equal(run('deckSearchRequest.multi'),true);snapshot=run('JSON.stringify(engine.players)');assert.equal(go([0,0]),false);assert.equal(run('JSON.stringify(engine.players)'),snapshot);assert(go([0,1]));assert.equal(run('engine.me.active.damage'),30);assert.equal(run('engine.me.active.energies.length'),6);assert.equal(run('engine.me.deck.length'),1);
go=prepare('neo2-44','Belly Drum',{setup:'engine.me.active.damage=40'});assert(go([0,1]));assert.equal(run('engine.me.deck.length'),3,'no search if Belly Drum knocks itself out');assert.equal(run('engine.me.discard.includes("neo2-44")'),true);
console.log(`PASS v0.4.9: ${count} prepared matches; 14 new historical attack records, player choice validation, statuses, protection windows, damage, Energy manipulation, and conditional effects.`);
