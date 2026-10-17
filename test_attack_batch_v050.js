'use strict';
// Targeted engine-level, card-record-driven tests for counterattacks and interactive damage effects.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};vm.createContext(ctx);vm.runInContext(source,ctx);const run=s=>vm.runInContext(s,ctx);
const originals=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(x=>require('./cards/'+x+'.json'));
const extras=[...['Water','Fire','Fighting','Psychic','Grass','Lightning'].map(t=>({id:'test50-'+t,name:t+' Energy',supertype:'Energy',subtypes:['Basic']})),{id:'test50-target',name:'Practice Partner',supertype:'Pokémon',subtypes:['Basic'],hp:'600',types:['Colorless'],weaknesses:[],resistances:[],retreatCost:[],attacks:[{name:'Smash',cost:['Colorless'],damage:'20',text:''},{name:'Tackle',cost:['Colorless'],damage:'50',text:''}],abilities:[]}];
ctx.localCards=[...originals,...extras];run('cards=localCards;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};battlefieldAttack=()=>{};queuePrizeFX=()=>{}');
let n=0;
function prepare(id,name,{heads=true,setup='',enemyEnergy='test50-Fire'}={}){
 const c=originals.find(x=>x.id===id);assert(c,id);const index=c.attacks.findIndex(a=>a.name===name);assert(index>=0,`${id}:${name}`);
 const needed=c.attacks[index].cost.map(type=>'test50-'+(type==='Colorless'?'Fire':type));
 run(`engine.players=[statePlayer('You',[]),statePlayer('Opponent',[])];engine.phase='game';engine.turn=0;engine.round=6;engine.turnSerial=10;engine.over=false;engine.players[0].active=unit(${JSON.stringify(id)});engine.players[1].active=unit('test50-target');engine.players[0].active.energies=${JSON.stringify([...needed,'test50-Fire'])};engine.players[1].active.energies=[${JSON.stringify(enemyEnergy)}];engine.players[0].bench=[unit('test50-target'),unit('test50-target')];engine.players[1].bench=[unit('test50-target'),unit('test50-target')];engine.players[0].prizes=['test50-target','test50-target'];engine.players[1].prizes=['test50-target','test50-target'];deckSearchRequest=null;engine.pendingSweetScent=null;${setup}`);
 ctx.Math.random=()=>heads?0.01:0.99;
 assert.equal(run(`engine.attackPattern(engine.card(engine.me.active).attacks[${index}])`),'batch50');
 n++;
 return (choice=null)=>run(`engine.attack(${index},null,true,${JSON.stringify(choice)})`);
}
function strike({amount=20,heads=true}={}){
 // Opponent attacks after the defensive turn has ended, without advancing the scripted timer past its expiry.
 run("engine.turn=1;engine.turnSerial=Math.max(11,engine.turnSerial);engine.me.active.energies=['test50-Fire'];");
 ctx.Math.random=()=>heads?0.01:0.99;
 return run(`engine.attack(${amount===20?0:1},null,true)`);
}
// Response effects survive a knock-out, use realized incoming damage, and expire after one opposing turn.
for(const [id,name,returned] of [['base5-46','Mirror Shell',20],['gym1-11','Crosscounter',40],['gym1-12','Fire Wall',50],['neo2-16','Counter',20],['neo2-35','Counter',20]]){
 const trigger=prepare(id,name);assert(trigger());assert(strike());assert.equal(run('engine.me.active.damage'),returned,`${id} returned damage`);
 const defender=run('engine.players[0].active.damage');assert.equal(defender,20);
 run('engine.me.active.damage=0;engine.turnSerial=12;');assert(strike());assert.equal(run('engine.me.active.damage'),0,`${id} protection expired`);
}
// A counterattack still triggers on an attack that knocks its user out. Its return damage resolves before KO cleanup.
let ko=prepare('base5-46','Mirror Shell');assert(ko());
run('engine.me.active.damage=engine.maxHP(engine.me.active)-10');
assert(strike());assert.equal(run('engine.players[1].active.damage'),20);
assert.equal(run('engine.players[0].discard.includes("base5-46")'),true);
// Switching clears effects that only last while the original user stays Active.
// Crosscounter should do nothing on tails but still take ordinary damage.
let go=prepare('gym1-11','Crosscounter');assert(go());assert(strike({heads:false}));assert.equal(run('engine.me.active.damage'),0);assert.equal(run('engine.foe.active.damage'),20);
// Reflect Shield prevents attack damage on Heads and returns 20; on Tails it does neither.
go=prepare('neo4-109','Reflect Shield');assert(go());assert(strike({heads:true}));assert.equal(run('engine.players[0].active.damage'),0);assert.equal(run('engine.players[1].active.damage'),20);
go=prepare('neo4-109','Reflect Shield');assert(go());assert(strike({heads:false}));assert.equal(run('engine.players[0].active.damage'),20);assert.equal(run('engine.players[1].active.damage'),0);
// Secrete Poison triggers only when damaged, spreads exactly 10 to opposing Bench, bypassing WR.
go=prepare('neo2-41','Secrete Poison');assert(go());assert(strike());assert.equal(run('engine.players[1].active.poison'),true);assert.equal(run('engine.players[1].bench[0].damage'),10);assert.equal(run('engine.players[1].bench[1].damage'),10);
// Shadow Images: Tails prevents damage without preventing other attack effects; Heads lets damage through and ends effect.
go=prepare('gym1-13','Shadow Images');assert(go());assert(strike({heads:false}));assert.equal(run('engine.players[0].active.damage'),0);assert.equal(run('engine.players[0].active.shadowImages'),true);
run('engine.turn=1;engine.turnSerial=11;');assert(strike({heads:true}));assert.equal(run('engine.players[0].active.damage'),20);assert.equal(run('engine.players[0].active.shadowImages'),false);
// Giant Growth changes maxHP and Pound's base damage, but only while Active and only after Heads.
go=prepare('gym2-10','Giant Growth');assert(go());assert.equal(run('engine.maxHP(engine.me.active)'),80);assert.equal(run('engine.card(engine.me.active).attacks[1].damage'),'10');assert(run('engine.attack(1,null,true)'));assert.equal(run('engine.foe.active.damage'),30);
go=prepare('gym2-10','Giant Growth',{heads:false});assert(go());assert.equal(run('engine.maxHP(engine.me.active)'),Number(originals.find(c=>c.id==='gym2-10').hp));
// Rushing Flames: the chosen cards must be valid and distinct; coins count exactly discarded Energy.
go=prepare('neo4-10','Rushing Flames',{setup:"engine.me.bench[0].energies=['test50-Grass','test50-Fire'];"});assert.equal(go(),false);assert.equal(run('deckSearchRequest.multi'),true);
let snapshot=run('JSON.stringify(engine.players)');assert.equal(go([0,0]),false);assert.equal(run('JSON.stringify(engine.players)'),snapshot);
assert.equal(go([100,101]),true);assert.equal(run('engine.foe.active.damage'),80);assert.equal(run('engine.me.bench[0].energies.length'),0);
go=prepare('neo4-10','Rushing Flames',{heads:false});assert(go([0]));assert.equal(run('engine.foe.active.damage'),0);
// Sweet Scent coin flip is made once, then the correct side chooses the damaged target.
go=prepare('neo1-29','Sweet Scent',{heads:true,setup:'engine.me.active.damage=30;engine.foe.active.damage=40'});assert.equal(go(),false);assert.equal(run('deckSearchRequest.options[0].index'),-1);snapshot=run('JSON.stringify(engine.players)');assert.equal(go(999),false);assert.equal(run('JSON.stringify(engine.players)'),snapshot);assert(go(-1));assert.equal(run('engine.me.active.damage'),10);assert.equal(run('engine.foe.active.damage'),40);
go=prepare('neo1-29','Sweet Scent',{heads:false,setup:'engine.me.active.damage=30;engine.foe.active.damage=40'});assert.equal(go(),false);assert(go(-1));assert.equal(run('engine.foe.active.damage'),20);assert.equal(run('engine.me.active.damage'),30);
const r=run("engine.attackAudit()");assert.equal(r.filter(x=>x.pattern==='batch50').length,11);
console.log(`PASS v0.5.0: ${n} prepared matches; 11 exact historical attack records, reaction effects, duration, KO response, damage prevention, multiple choice validation and HP modification.`);
