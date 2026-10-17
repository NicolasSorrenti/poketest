'use strict';
// Tests action outcomes, not only card-text classifier recognition.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const run=s=>vm.runInContext(s,ctx);
const sets=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'];
const cards=sets.flatMap(s=>JSON.parse(fs.readFileSync(path.join(__dirname,'cards',s+'.json'))));
const fixtures=[...cards,...['Fire','Psychic','Water','Fighting','Lightning','Grass','Darkness'].map(t=>({id:`test-${t}`,name:`${t} Energy`,supertype:'Energy',subtypes:['Basic']})),
 {id:'test-defender',name:'Large dummy',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'400',attacks:[{name:'Dummy',cost:['Colorless'],damage:'10',text:''}],abilities:[]},
 {id:'test-stage',name:'Stage dummy',supertype:'Pokémon',subtypes:['Stage 1'],types:['Colorless'],hp:'150',attacks:[],abilities:[]},
 {id:'test-baby',name:'Baby dummy',supertype:'Pokémon',subtypes:['Baby'],types:['Colorless'],hp:'30',attacks:[],abilities:[]}];
ctx.fixtures=fixtures;
run('cards=fixtures;lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};battlefieldAttack=()=>{}');
const report=JSON.parse(fs.readFileSync(path.join(__dirname,'attack_coverage.json')));
assert.equal(report.totalAttacks,1479);assert(report.handled>=1378);assert(report.unsupported.length<=101);
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'batch46_targets.json')));
let count=0;
for(const k of Object.keys(run('ATTACK47'))){const [id,name]=k.split('|');const c=cards.find(c=>c.id===id);const attack=c.attacks.find(a=>a.name===name);assert(attack,`${k} exists`);assert.equal(run(`engine.attackPattern(${JSON.stringify(attack)})`),'batch47',`attackPattern works with card-JSON object ${k}`);count++}
assert.equal(count,18);
function prep(id,name,{oppBench=3,meBench=2,heads=true,setup='',turn=0}={}){
 const card=cards.find(c=>c.id===id),index=card.attacks.findIndex(a=>a.name===name);assert(index>=0,id+' '+name);
 const costs=(card.attacks[index].cost||[]).map(t=>'test-'+(t==='Colorless'?'Fire':t));
 run(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.turn=${turn};engine.round=5;engine.turnSerial=0;engine.over=false;
 engine.players[${turn}].active=unit(${JSON.stringify(id)});engine.players[${1-turn}].active=unit('test-defender');
 engine.players[${turn}].active.energies=${JSON.stringify([...costs,...costs,'test-Fire','test-Fire'])};
 engine.players[${turn}].bench=Array.from({length:${meBench}},()=>unit('test-defender'));
 engine.players[${1-turn}].bench=Array.from({length:${oppBench}},()=>unit('test-defender'));
 engine.players[${turn}].deck=['test-Fire','test-baby','base1-6','test-Fire','neo3-65','test-Fire'];
 engine.players[${1-turn}].deck=['test-Water','test-Fire','test-Fire','test-Fire','test-Fire','test-Fire'];
 engine.players[0].prizes=Array(6).fill('test-defender');engine.players[1].prizes=Array(6).fill('test-defender');
 deckSearchRequest=null;${setup}`);
 ctx.Math.random=()=>heads?0.01:0.99;
 return {card,index,go:(target=null,choice=null)=>run(`engine.attack(${index},${JSON.stringify(target)},true,${JSON.stringify(choice)})`)};
}
let x=prep('base3-14','Gigashock');assert.equal(x.go(),false,'mandatory multi-choice prompts');assert.equal(run('deckSearchRequest.multi'),true);assert.equal(run('deckSearchRequest.min'),3);assert.equal(run('deckSearchRequest.max'),3);let before=run('JSON.stringify(engine.players)');assert.equal(x.go(null,[0,0,1]),false,'duplicate targets rejected');assert.equal(x.go(null,[0,1]),false,'three distinct required');assert.equal(x.go(null,[0,1,5]),false,'invalid slot rejected');assert.equal(run('JSON.stringify(engine.players)'),before,'invalid targets leave state unchanged');assert(x.go(null,[0,1,2]));assert.equal(run('engine.foe.bench.map(x=>x.damage).join(",")'),'10,10,10');
x=prep('base3-29','Gigashock',{oppBench:1});assert(x.go(null,[0]));assert.equal(run('engine.foe.bench[0].damage'),10);
x=prep('gym1-20','Rock Slide');assert(x.go(null,[1,2]));assert.equal(run('engine.foe.bench.map(x=>x.damage).join(",")'),'0,10,10');assert.equal(run('engine.foe.active.damage'),20);
x=prep('gym1-21','Tunneling');assert(x.go(null,[0,2]));assert.equal(run('engine.foe.bench.map(x=>x.damage).join(",")'),'20,0,20');assert.equal(run('engine.me.active.attackLocks[0].name'),'*');assert.equal(run('engine.me.active.attackLocks[0].until'),6);
x=prep('gym1-21','Tunneling',{oppBench:0});assert(x.go(null,[]));assert.equal(run('engine.foe.active.damage'),20);
x=prep('gym2-4','Wide Solarbeam');assert.equal(x.go(null,[0]),false);assert(x.go(null,[0,1]));assert.equal(run('engine.foe.bench[2].damage'),0);assert.equal(run('engine.foe.active.damage'),20);
x=prep('gym2-4','Wide Solarbeam',{setup:"lookup.get('test-defender').abilities=[{name:'Aurora Veil',type:'Pokemon Power'}]"});assert(x.go(null,[0,1]));assert.equal(run('engine.foe.bench[0].damage'),0,'Aurora Veil prevents Bench damage');run("lookup.get('test-defender').abilities=[]");
for(const [id,n] of [['neo1-24',20],['neo2-13',30]]){
 x=prep(id,'Feint Attack');assert.equal(x.go(),false,'manual target is required');assert.equal(x.go(3),false,'invalid target leaves match unchanged');assert(x.go(1));assert.equal(run('engine.foe.bench[1].damage'),n);assert.equal(run('engine.foe.active.damage'),0);
 x=prep(id,'Feint Attack',{setup:'engine.foe.active.attackShield=Infinity;engine.foe.active.preventAttackEffects=true;'});assert(x.go(-1));assert.equal(run('engine.foe.active.damage'),n,'ignores attack protection as printed');
}
for(const id of ['base3-12','base3-27']){
 x=prep(id,'Wildfire');const options=run('batch47Options(engine,batch47Rule(engine.card(engine.me.active),engine.card(engine.me.active).attacks['+x.index+']))');
 assert(options.length>=2);assert.equal(x.go(),false,'Fire Energy selection required');const before=run('JSON.stringify(engine.players)');assert.equal(x.go(null,[99]),false);assert.equal(run('JSON.stringify(engine.players)'),before);assert(x.go(null,[options[0].index,options[1].index]));assert.equal(run('engine.foe.discard.length'),2);assert.equal(run('engine.foe.deck.length'),4);assert.equal(run('engine.me.discard.length'),2);
}
for(const id of ['basep-8','basep-9']){
 x=prep(id,'Devolution Beam',{setup:"engine.foe.bench[1]=unit('test-stage');engine.foe.bench[1].under=['test-defender'];engine.foe.bench[1].damage=50;engine.foe.bench[1].status='Asleep';engine.foe.bench[1].poison=true;engine.foe.bench[1].energies=['test-Fire'];"});
 assert.equal(x.go(),false);const opts=run('deckSearchRequest.options');assert.equal(opts.length,1);assert.equal(opts[0].index,8);const pre=run('JSON.stringify(engine.players)');assert.equal(x.go(null,6),false);assert.equal(run('JSON.stringify(engine.players)'),pre);assert(x.go(null,8));assert.equal(run('engine.foe.bench[1].id'),'test-defender');assert.equal(run('engine.foe.bench[1].energies.length'),1);assert.equal(run('engine.foe.bench[1].poison'),false);assert.equal(run('engine.foe.hand.includes("test-stage")'),true);
}
x=prep('basep-8','Devolution Beam',{setup:"engine.foe.active=unit('test-stage');engine.foe.active.under=['test-baby'];engine.foe.active.damage=40;"});assert(x.go(null,6));assert.equal(run('engine.foe.active.damage'),0,'devolved Pokémon with less HP gets Knocked Out and replaced');assert.equal(run('engine.me.hand.length'),1,'Knock Out gives the attacking player a Prize');
x=prep('basep-35',"Let's Play!",{setup:"engine.me.deck=['test-Water','test-baby','test-Fire'];"});assert.equal(x.go(),false);assert.equal(run('deckSearchRequest.options.length'),1);assert(x.go(null,1));assert.equal(run('engine.me.bench.at(-1).id'),'test-baby');assert.equal(run('engine.me.deck.length'),2);
x=prep('basep-35',"Let's Play!",{meBench:5});assert.equal(x.go(),false,'cannot play with full Bench');
x=prep('neo3-66','Dragon Bond',{setup:"engine.me.deck=['test-Fire','neo3-65','base1-6','neo3-65'];"}); // card 'base1-6' Gyarados
assert.equal(x.go(),false);let choices=run('deckSearchRequest.options');assert(choices.some(y=>y.name==='Gyarados'));assert(x.go(null,2));assert.equal(run('engine.me.hand.includes("base1-6")'),true);
// Coins and conditional choices: decisions are validated before committing the attack.
for(const [id,attack,states] of [['neo2-19','Magic Dust',['Asleep','Confused','Paralyzed','Poisoned']],['neo3-12','Delta Beam',['Asleep','Confused','Paralyzed']]]){
 for(let j=0;j<states.length;j++){
  x=prep(id,attack);const prev=run('JSON.stringify(engine.players)');assert.equal(x.go(),false);assert.equal(run('deckSearchRequest.options.length'),states.length);assert.equal(run('JSON.stringify(engine.players)'),prev);assert(x.go(null,j));
  assert.equal(run('engine.foe.active.status'),states[j]==='Poisoned'?null:states[j]);assert.equal(run('engine.foe.active.poison'),states[j]==='Poisoned');
 }
 x=prep(id,attack,{heads:false});assert(x.go(null,0));assert.equal(run('engine.foe.active.status'),null);
 x=prep(id,attack,{setup:'engine.foe.active.preventAttackEffects=true'});assert(x.go(null,0));assert.equal(run('engine.foe.active.status'),null,'shield blocks status effect');
}
x=prep('neo1-3','Sweet Nectar',{setup:'engine.me.bench[1].damage=60;engine.me.active.damage=30;'});
assert.equal(x.go(),false);assert(x.go(null,2));assert.equal(run('engine.me.bench[1].damage'),0);assert.equal(run('engine.me.active.damage'),30);
x=prep('neo1-3','Sweet Nectar',{heads:false,setup:'engine.me.active.damage=40'});assert(x.go(null,0));assert.equal(run('engine.me.active.damage'),40);
x=prep('neo4-5','Crushing Blow',{setup:"engine.foe.active.energies=['test-Water','test-Fire','test-Lightning']"});
assert.equal(x.go(),false);assert.equal(run('deckSearchRequest.options.length'),3);const prev=run('JSON.stringify(engine.players)');assert.equal(x.go(null,12),false);assert.equal(run('JSON.stringify(engine.players)'),prev);
assert(x.go(null,1));assert.equal(run('engine.foe.active.energies.join(",")'),'test-Water,test-Lightning');assert.equal(run('engine.foe.discard[0]'),'test-Fire');
x=prep('neo4-5','Crushing Blow',{heads:false,setup:"engine.foe.active.energies=['test-Water','test-Fire']"});assert(x.go(null,1));assert.equal(run('engine.foe.active.energies.length'),2);
x=prep('neo4-5','Crushing Blow');assert(x.go());assert.equal(run('engine.foe.active.damage'),50,'attack deals damage even without Energy attached');
x=prep('gym2-63','Pranks',{setup:"engine.foe.discard=['test-Fire','test-Water'];engine.foe.deck=['test-Lightning']"});assert.equal(x.go(),false);assert(x.go(null,1));assert.equal(run('engine.foe.deck.at(-1)'),'test-Water');assert.equal(run('engine.foe.discard.length'),1);
x=prep('gym2-63','Pranks',{heads:false,setup:"engine.foe.discard=['test-Fire'];engine.foe.deck=['test-Water']"});assert(x.go(null,0));assert.equal(run('engine.foe.deck.at(-1)'),'test-Water');
// Rival chooses valid targets without opening player-only choice modals.
x=prep('neo1-24','Feint Attack',{turn:1});assert(x.go());assert.equal(run('engine.foe.active.damage'),20);
x=prep('gym1-20','Rock Slide',{turn:1});assert(x.go());assert.equal(run('engine.foe.bench.map(x=>x.damage).join(",")'),'10,10,10');
console.log('PASS v0.4.7: 18 previously unsupported attack records; multi-target selection, Bench protection, defensive bypass, Energy discard, deck milling, devolution and deck searches.');
