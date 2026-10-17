'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(src,ctx);const run=s=>vm.runInContext(s,ctx);
const all=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(x=>require('./cards/'+x+'.json'));
const extra=[{id:'copy-normal',name:'Copy Target',supertype:'Pokémon',subtypes:['Basic'],hp:'250',types:['Colorless'],weaknesses:[],resistances:[],attacks:[{name:'Heavy Tackle',damage:'30',cost:['Fire','Fire'],text:''},{name:'Sleep Powder',damage:'10',cost:['Grass'],text:'The Defending Pokémon is now Asleep.'}],abilities:[],retreatCost:[]},
 {id:'copy-weak',name:'Training Opponent',supertype:'Pokémon',subtypes:['Basic'],hp:'300',types:['Colorless'],weaknesses:[{type:'Colorless',value:'×2'}],resistances:[],attacks:[{name:'Slap',cost:[],damage:'20',text:''}],abilities:[],retreatCost:[]},
 {id:'copy-basic',name:'Line Basic',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Water'],weaknesses:[],resistances:[],attacks:[{name:'Splash',cost:['Water'],damage:'40',text:''}],abilities:[],retreatCost:[]},
 {id:'copy-energy',name:'Colorless Energy',supertype:'Energy',subtypes:[],attacks:[],abilities:[]}];
ctx.localCards=[...all,...extra];run('cards=localCards;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};battlefieldAttack=()=>{};queuePrizeFX=()=>{};');
let checks=0;
function setup(attacker='base1-5',defender='copy-normal'){
 run(`engine.players=[statePlayer('You',[]),statePlayer('AI',[])];engine.phase='game';engine.round=8;engine.turnSerial=20;engine.turn=0;engine.over=false;engine.lastAttackAction=null;engine.players[0].active=unit(${JSON.stringify(attacker)});engine.players[0].active.energies=Array(6).fill('copy-energy');engine.players[0].bench=[unit('copy-basic')];engine.players[1].active=unit(${JSON.stringify(defender)});engine.players[1].bench=[unit('copy-normal')];engine.players[0].prizes=['copy-energy'];engine.players[1].prizes=['copy-energy'];deckSearchRequest=null;`);
 ctx.Math.random=()=>0.01;
}
function attackIndex(name){return run(`engine.card(engine.me.active).attacks.findIndex(x=>x.name===${JSON.stringify(name)})`)}
function select(){return run('deckSearchRequest?.options?.map(x=>({index:x.index,name:x.name}))')}
function fire(name,choice){const i=attackIndex(name);return run(`engine.attack(${i},null,true,${choice===undefined?'null':JSON.stringify(choice)})`)}
setup();assert.equal(run('engine.attackPattern(engine.card(engine.me.active).attacks[1])'),'attackCopy');
assert.equal(fire('Metronome'),false);assert(select().some(x=>x.name.includes('Heavy Tackle')));checks++;
assert.equal(fire('Metronome',99),false);assert.equal(run('engine.foe.active.damage'),0);checks++;
assert.equal(fire('Metronome',0),true);assert.equal(run('engine.foe.active.damage'),30);checks++;
setup();assert.equal(fire('Metronome'),false);assert.equal(fire('Metronome',1),true);assert.equal(run('engine.foe.active.damage'),10);assert.equal(run('engine.foe.active.status'),'Asleep');checks++;
// Metronome waives additional discard costs, but Mini-Metronome must pay them.
setup('base1-5','base1-4');run('engine.me.active.energies=["copy-energy","copy-energy","copy-energy"];');
assert.equal(fire('Metronome'),false);assert(fire('Metronome',0));assert.equal(run('engine.foe.active.damage'),100);assert.equal(run('engine.me.active.energies.length'),3);checks++;
setup('basep-30','base1-4');run('engine.me.active.energies=["copy-energy","copy-energy"];');
assert.equal(fire('Mini-Metronome'),false);assert(fire('Mini-Metronome',0));assert.equal(run('engine.me.active.energies.length'),0);assert.equal(run('engine.me.discard.length'),2);checks++;
setup('basep-30');ctx.Math.random=()=>.99;assert(fire('Mini-Metronome'));assert.equal(run('engine.foe.active.damage'),0);checks++;
setup('basep-30');assert.equal(fire('Mini-Metronome'),false);assert.equal(fire('Mini-Metronome',0),true);assert.equal(run('engine.foe.active.damage'),30);checks++;
// Canceling the attack picker must not let the player reroll the coin.
setup('basep-30');let flips=0;ctx.Math.random=()=>{flips++;return .01};
assert.equal(fire('Mini-Metronome'),false);run('deckSearchRequest=null;');assert.equal(fire('Mini-Metronome'),false);assert.equal(flips,1);assert(fire('Mini-Metronome',0));checks++;
setup('neo1-16');assert.equal(fire('Super Metronome'),false);assert(select().some(x=>x.name.includes('Heavy Tackle')));assert.equal(fire('Super Metronome',0),true);assert.equal(run('engine.foe.active.damage'),30);checks++;
setup('neo3-19');run("engine.me.active.under=['copy-basic'];");assert.equal(fire('Genetic Memory'),false);assert(select().some(x=>x.name.includes('Splash')));assert(fire('Genetic Memory',0));assert.equal(run('engine.foe.active.damage'),40);checks++;
setup('neo2-11');assert.equal(fire('Sketch'),false);assert.equal(select(),undefined);checks++;
setup('neo2-11');run("engine.lastAttackAction={turnSerial:19,attacker:engine.foe.active,cardId:'copy-normal',index:0,defendingTeam:[engine.me.active]}");assert.equal(fire('Sketch'),false);assert.equal(fire('Sketch',0),true);assert.equal(run('engine.foe.active.damage'),30);checks++;
setup('neo2-11');run("engine.lastAttackAction={turnSerial:19,attacker:engine.foe.active,cardId:'copy-normal',index:0,defendingTeam:[]}");assert.equal(fire('Sketch'),false);checks++;
// Capture an actual previous opponent attack. Mirror Move uses its *final* damage,
// without recalculating new Weakness and Resistance (Colorless weakness here).
setup('base1-22','copy-weak');run("engine.turn=1;engine.turnSerial=19;engine.me.active.energies=[];");
assert.equal(run('engine.attack(0,null,true)'),true);assert.equal(run('engine.foe.active.damage'),20);
run('engine.turn=0;engine.turnSerial=20;');assert(fire('Mirror Move'));assert.equal(run('engine.foe.active.damage'),20);checks++;
setup('base1-22');assert.equal(fire('Mirror Move'),false);checks++;
const coverage=run('engine.attackAudit()');assert.equal(coverage.filter(x=>x.pattern==='attackCopy').length,14);checks++;
console.log(`PASS v0.5.2 attack copying: ${checks} scenarios (selection, validation, type, status, coin, genetic ancestry, previous attack history, Mirror Move).`);
