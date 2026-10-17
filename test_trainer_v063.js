'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const folder=__dirname;
const data=fs.readdirSync(folder+'/cards').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(folder+'/cards/'+f)));
const engineSource=fs.readFileSync(folder+'/engine.js','utf8').split('async function load()')[0];
const context={Math,console,window:{},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{},appendChild(){}}),querySelector:()=>null},setTimeout(){},clearTimeout(){},innerWidth:1600};
vm.createContext(context);
vm.runInContext(engineSource.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),context);
for(const file of ['trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js','trainer_rules_v062.js','trainer_rules_v063.js'])vm.runInContext(fs.readFileSync(folder+'/'+file,'utf8'),context);
function run(s){return vm.runInContext(s,context)}
context.fixtureCards=data;
function setup(){
 run(`lookup=new Map(fixtureCards.map(c=>[c.id,c]));render=()=>{};battlefieldAttack=()=>{};
 engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.over=false;
 engine.turn=0;engine.round=4;engine.turnSerial=12;engine.started=true;engine.stadium=null;
 engine.players[0].active=unit('base1-58');engine.players[1].active=unit('base1-53');
 engine.players[0].bench=[unit('base1-35')];engine.players[1].bench=[unit('base1-35')];
 engine.players[0].prizes=['base1-97'];engine.players[1].prizes=['base1-98'];
 engine.players[0].deck=Array(12).fill('base1-98');engine.players[1].deck=Array(12).fill('base1-97');
 deckSearchRequest=null;cpuResumeChoice=null;engine._trainer60ExpPrompt=null;`);
 return run('engine');
}
let count=0;
function test(label,callback){try{callback();count++}catch(e){console.error('FAILED:',label);throw e}}
const expId='neo4-93',ninjaId='gym2-115';
test('EXP.ALL with only one possible transfer asks the human instead of automatically consuming the tool',()=>{
 const g=setup();g.turn=1;const human=g.players[0];human.active.damage=300;
 human.active.incomingAttack={turnSerial:g.turnSerial,damage:40};
 human.active.energies=['base1-98'];human.bench[0].attachedTrainers=[{id:expId}];
 const recipient=human.bench[0];
 assert.equal(g.resolveKO(),null);
 const prompt=run('deckSearchRequest');assert.ok(prompt?.defenderPrompt);
 assert.deepEqual(Array.from(prompt.options,o=>o.index),['skip','0:0']);
 assert.equal(human.active.energies.length,1);assert.equal(human.bench[0].energies.length,0);
 assert.equal(prompt.execute('bad'),false);
 assert.equal(human.bench[0].energies.length,0);
 assert.equal(prompt.execute('0:0'),true);
 assert.deepEqual(Array.from(recipient.energies),['base1-98']);
 assert.ok(human.discard.includes(expId));assert.equal(human.active.id,'base1-35');
});
test('EXP.ALL single eligible transfer can be declined without consuming the tool separately',()=>{
 const g=setup();g.turn=1;const human=g.players[0];human.active.damage=300;
 human.active.incomingAttack={turnSerial:g.turnSerial,damage:50};human.active.energies=['base1-98'];
 human.bench[0].attachedTrainers=[{id:expId}];
 assert.equal(g.resolveKO(),null);
 assert.equal(run('deckSearchRequest').execute('skip'),true);
 assert.equal(human.active.energies.length,0);
 assert.equal(human.active.attachedTrainers[0].id,expId);
 assert.equal(human.discard.filter(x=>x==='base1-98').length,1);
});
test('EXP.ALL with multiple Basic Energy and two recipients preserves exact chosen recipient and Energy',()=>{
 const g=setup();g.turn=1;const human=g.players[0];human.active.damage=300;
 human.active.incomingAttack={turnSerial:g.turnSerial,damage:50};human.active.energies=['base1-98','base1-99'];
 human.bench.push(run("unit('base1-58')"));
 human.bench[0].attachedTrainers=[{id:expId}];human.bench[1].attachedTrainers=[{id:expId}];
 const first=human.bench[0],second=human.bench[1];
 assert.equal(g.resolveKO(),null);
 const prompt=run('deckSearchRequest');assert.equal(prompt.execute('1:1'),true);
 assert.deepEqual(Array.from(second.energies),['base1-99']);assert.deepEqual(Array.from(first.energies),[]);
});
test('EXP.ALL cannot transfer Energy to a simultaneously knocked-out Bench recipient',()=>{
 const g=setup();g.turn=1;const human=g.players[0];human.active.damage=300;
 human.active.incomingAttack={turnSerial:g.turnSerial,damage:50};human.active.energies=['base1-98'];
 human.bench[0].attachedTrainers=[{id:expId}];human.bench[0].damage=300;
 assert.notEqual(g.resolveKO(),null);
 assert.equal(run('deckSearchRequest'),null);
 assert.ok(!human.bench.some(u=>u.energies.includes('base1-98')));
});
test('EXP.ALL rejects a recipient that is knocked out after prompting without transferring Energy',()=>{
 const g=setup();g.turn=1;const human=g.players[0];human.active.damage=300;
 human.active.incomingAttack={turnSerial:g.turnSerial,damage:50};human.active.energies=['base1-98'];
 human.bench[0].attachedTrainers=[{id:expId}];
 assert.equal(g.resolveKO(),null);
 const prompt=run('deckSearchRequest');human.bench[0].damage=300;
 assert.equal(prompt.execute('0:0'),false);
 assert.deepEqual(Array.from(human.active.energies),['base1-98']);
 assert.equal(human.discard.includes(expId),false);
 run('deckSearchRequest=null;engine._trainer60ExpPrompt=null');
});
test('Ninja Trick is discarded when its host retreats, independently of voluntary Ninja Trick use',()=>{
 const g=setup(),p=g.players[0];p.active.attachedTrainers=[{id:ninjaId}];p.active.energies=['base1-98','base1-99'];
 assert.equal(g.retreat(0),true);
 assert.equal(p.bench[0].attachedTrainers.filter(t=>t.id===ninjaId).length,0);
 assert.equal(p.discard.filter(id=>id===ninjaId).length,1);
});
test('Ninja Trick is discarded by Switch while the Active moves onto the Bench',()=>{
 const g=setup(),p=g.players[0];p.active.attachedTrainers=[{id:ninjaId}];p.hand=['base1-95'];
 // Use actual Switch record rather than relying on guessed card numbering.
 p.hand=[data.find(c=>c.name==='Switch'&&c.supertype==='Trainer').id];
 assert.equal(g.trainer(0,0),true);
 assert.equal(p.discard.filter(id=>id===ninjaId).length,1);
 assert.equal(p.bench[0].attachedTrainers.some(t=>t.id===ninjaId),false);
});
test('Invalid Switch under Chaos Gym does not flip, move Pokémon, or consume Trainer',()=>{
 const g=setup(),p=g.players[0];g.stadium={id:'gym2-102',owner:0};p.bench=[];
 const switchId=data.find(c=>c.name==='Switch'&&c.supertype==='Trainer').id;p.hand=[switchId];
 context.originalCoin=run('coin');run('coin=()=>{throw Error("Unexpected coin flip") }');
 try {assert.equal(g.trainer(0,0),false);assert.deepEqual(Array.from(p.hand),[switchId]);assert.equal(p.active.id,'base1-58');}
 finally {run('coin=originalCoin');}
});
test('Invalid Potion under Chaos Gym cannot be consumed when no Pokémon has damage',()=>{
 const g=setup(),p=g.players[0];g.stadium={id:'gym2-102',owner:0};
 const potionId=data.find(c=>c.name==='Potion'&&c.supertype==='Trainer').id;p.hand=[potionId];
 context.originalCoin=run('coin');run('coin=()=>{throw Error("Unexpected coin flip") }');
 try {assert.equal(g.trainer(0,-1),false);assert.deepEqual(Array.from(p.hand),[potionId]);}
 finally {run('coin=originalCoin');}
});
console.log(`PASS v0.6.3: ${count} Trainer reaction, optional transfer, tool lifecycle and Chaos Gym legality scenarios`);
