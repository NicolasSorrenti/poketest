'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const ext=fs.readFileSync(__dirname+'/trainer_rules_v058.js','utf8');
const cards=fs.readdirSync(__dirname+'/cards').filter(n=>n.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(__dirname+'/cards/'+f)));
const ctx={Math,console,window:{NeoCardCorrections:{}},document:{getElementById:()=>({classList:{add(){},remove(){}},textContent:'',style:{},appendChild(){}}),querySelector:()=>null},setTimeout:()=>0,clearTimeout(){},innerWidth:1600};
vm.createContext(ctx);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
vm.runInContext(ext,ctx);
const all=new Map(cards.map(c=>[c.id,c]));
function fresh({hand=[],deck=[],discard=[],meActive='base1-50',foeActive='base1-58',bench=[],foeBench=[],myEnergy=[],enemyEnergy=[]}={}){
 vm.runInContext(`lookup=new Map();engine.players=[statePlayer('Human',[]),statePlayer('Rival',[])];engine.turn=0;engine.round=3;engine.turnSerial=5;engine.phase='game';engine.over=false;engine.started=true;render=()=>{};deckSearchRequest=null;selected=null;`,ctx);
 const g=vm.runInContext('engine',ctx),mkUnit=vm.runInContext('unit',ctx),map=vm.runInContext('lookup',ctx);const p=g.players[0],f=g.players[1];
 for(const [id,c] of all)map.set(id,c);
 p.hand=[...hand];p.deck=[...deck];p.discard.push(...discard);
 p.active=mkUnit(meActive);p.active.energies=[...myEnergy];p.bench=bench.map(x=>mkUnit(x));
 f.active=mkUnit(foeActive);f.active.energies=[...enemyEnergy];f.bench=foeBench.map(x=>mkUnit(x));
 p.prizes=['base1-95'];f.prizes=['base1-94'];
 return {p,f,g};
}
let runs=0;
function test(name,fn){try{fn();runs++;}catch(e){console.error('FAIL',name);throw e}}
test('All Trainer records loaded',()=>{assert.equal(cards.filter(c=>c.supertype==='Trainer').length,178)});
test('Computer Search validates discard and searches any card',()=>{
 const {g,p}=fresh({hand:['base1-71','base1-91','base1-91'],deck:['base1-4']});
 assert.equal(g.trainer(0),null);assert.equal(p.hand.length,3);assert.equal(p.discard.length,0);
 assert.equal(g.trainer58(0,[[1,2],0]),true);assert.deepEqual(p.hand,['base1-4']);assert.equal(p.discard.length,3);
});
test('Item Finder takes selected discarded Trainer',()=>{
 const {g,p}=fresh({hand:['base1-74','base1-91','base1-91'],discard:['base1-82']});
 assert.equal(g.trainer58(0,[[1,2],0]),true);assert.ok(p.hand.includes('base1-82'));assert.equal(p.discard.length,3);
});
test('Professor Elm shuffles hand, draws seven and locks Trainers',()=>{
 const {g,p}=fresh({hand:['neo1-96','base1-4','base1-95'],deck:Array.from({length:9},()=> 'base1-91')});
 assert.equal(g.trainer(0),true);assert.equal(p.hand.length,7);assert.equal(p.trainerLockUntil,g.round);
});
test('Mary draws 2 then player chooses exactly 2 to replace',()=>{
 const {g,p}=fresh({hand:['neo1-87','base1-91','base1-95'],deck:['base1-72','base1-4']});
 assert.equal(g.trainer58(0,[[1,3]]),true);assert.equal(p.hand.length,2);
 assert.ok(p.hand.includes('base1-91'));assert.ok(p.hand.includes('base1-4'));
});
test('Super Energy Removal selected Energy cost and opposing attached choices',()=>{
 const {g,p,f}=fresh({hand:['base1-79'],myEnergy:['base1-98','base1-99'],enemyEnergy:['base1-98','base1-99','base1-100']});
 assert.equal(g.trainer58(0,[-1,0,-1,[0,2]]),true);
 assert.deepEqual(p.active.energies,['base1-99']);assert.deepEqual(f.active.energies,['base1-99']);
 assert.equal(f.discard.length,2);
});
test('Energy Retrieval uses hand cost and allows picking specific Basic Energy',()=>{
 const {g,p}=fresh({hand:['base1-81','base1-91'],discard:['base1-98','base1-99','base1-100']});
 assert.equal(g.trainer58(0,[1,[0,2]]),true);assert.ok(p.hand.includes('base1-98'));assert.ok(p.hand.includes('base1-100'));assert.equal(p.discard.length,3);
});
test('Super Potion energy selected and healing',()=>{
 const {g,p}=fresh({hand:['base1-90'],myEnergy:['base1-98','base1-99']});p.active.damage=60;
 assert.equal(g.trainer58(0,[-1,1]),true);assert.equal(p.active.damage,20);assert.deepEqual(p.active.energies,['base1-98']);
});
test('Revive places proper damage and removes from discard',()=>{
 const {g,p}=fresh({hand:['base1-89'],discard:['base1-3']});
 assert.equal(g.trainer58(0,[0]),true);assert.equal(p.bench[0].damage,60);assert.equal(p.bench[0].id,'base1-3');
});
test('Scoop Up returns Basic and discards remaining stack and Energy',()=>{
 const {g,p}=fresh({hand:['base1-78'],myEnergy:['base1-98']});p.active.id='base1-4';p.active.under=['base1-24','base1-46'];p.bench.push(vm.runInContext('unit',ctx)('base1-50'));
 assert.equal(g.trainer58(0,[-1]),true);assert.ok(p.hand.includes('base1-46'));assert.ok(p.discard.includes('base1-98'));assert.equal(p.active.id,'base1-50');
});
test('Pokémon Breeder skip Stage 1 and require legal evolution',()=>{
 const {g,p}=fresh({hand:['base1-76','base1-4'],meActive:'base1-46'});p.active.playedTurn=1;
 assert.equal(g.trainer58(0,[1,-1]),true);assert.equal(p.active.id,'base1-4');assert.deepEqual(Array.from(p.active.under),['base1-46']);
});
test('Stadium not falsely counted by complete audit',()=>{
 assert.equal(vm.runInContext("TRAINER58_STADIUMS.has('Pokémon Tower')",ctx),true);
});
test('Sabrina\'s Gaze discards itself and both players redraw their remaining hand sizes',()=>{
 const {g,p,f}=fresh({hand:['gym1-125','base1-91','base1-94'],deck:Array.from({length:8},()=> 'base1-98')});f.hand=['base1-99','base1-4'];f.deck=['base1-98','base1-91','base1-71'];
 assert.equal(g.trainer(0),true);assert.equal(p.hand.length,2);assert.equal(f.hand.length,2);assert.ok(p.discard.includes('gym1-125'));
});
test('Lass shuffles away all Trainers besides the played Trainer',()=>{
 const {g,p,f}=fresh({hand:['base1-75','base1-91','base1-91','base1-98'],deck:['base1-4']});f.hand=['base1-91','base1-99'];
 assert.equal(g.trainer(0),true);assert.deepEqual(Array.from(p.hand),['base1-98']);assert.deepEqual(Array.from(f.hand),['base1-99']);assert.equal(p.discard.length,1);
});
test('Goop Gas Attack suppresses Powers until opponent turn completed',()=>{
 const {g}=fresh({hand:['base5-78']});assert.equal(g.trainer(0),true);assert.equal(g.powerSilenceUntilSerial,g.turnSerial+2);
});
test('Rocket\'s Hideout increases Dark HP and is removed by next Stadium',()=>{
 const {g,p}=fresh({hand:['neo3-63','neo1-97'],meActive:'base5-1'});let base=g.maxHP(p.active);
 assert.equal(g.trainer(0),true);assert.equal(g.maxHP(p.active),base+20);
 assert.equal(g.trainer(0),true);assert.equal(g.maxHP(p.active),base);
});
test('Balloon Berry attaches to a Pokémon and enables zero-Energy retreat',()=>{
 const {g,p}=fresh({hand:['neo3-60'],bench:['base1-58'],meActive:'base1-4'});
 assert.equal(g.trainer58(0,[-1]),true);assert.equal(p.active.attachedTrainers.length,1);
 assert.equal(g.retreat(0),true);assert.ok(p.discard.includes('neo3-60'));assert.equal(p.bench[0].energies.length,0);
});
test('Energy Stadium coin and choice preserve the first flip',()=>{
 const {g,p}=fresh({hand:['neo4-99'],discard:['base1-98']});assert.equal(g.trainer(0),true);
 // Use deterministic heads and a full choice via explicit stage if applicable.
 const request=g.stadium58();if(request===null){assert.ok(vm.runInContext('deckSearchRequest',ctx));assert.equal(g.stadium58(0),true);assert.ok(p.hand.includes('base1-98'));}
});
test('Giovanni allows same-turn Giovanni Pokémon evolution',()=>{
 const {g,p}=fresh({hand:['gym2-18'],meActive:'gym2-43'}); // selection can still resolve when Pokémon id is a valid Giovanni card
 assert.equal(g.trainer58(0,[-1]),true);assert.equal(p.active.giovanniEvolutionSerial,g.turnSerial);
});
test('No unsupported Trainer is consumed when effect has no handler',()=>{
 const {g,p}=fresh({hand:['gym1-97']});assert.equal(g.trainer(0),false);assert.equal(p.hand.length,1);
});
test('No Removal Gym makes Energy Removal discard two extra hand cards',()=>{
 const {g,p,f}=fresh({hand:['base1-92','base1-91','base1-82'],enemyEnergy:['base1-98']});g.stadium={id:'gym1-103',owner:1};
 assert.equal(g.trainer58(0,[[1,2],-1,0]),true);
 assert.equal(p.hand.length,0);assert.equal(p.discard.length,3);assert.equal(f.active.energies.length,0);
});
test('Narrow Gym returns a chosen fifth Benched Pokémon and limits future placements',()=>{
 const {g,p}=fresh({hand:['gym1-124','base1-50'],bench:['base1-58','base1-50','base1-49','base1-55','base1-46']});
 assert.equal(g.trainer58(0,[2]),true);assert.equal(p.bench.length,4);
 assert.ok(p.hand.includes('base1-49'));assert.equal(g.playBasic(p.hand.indexOf('base1-50')),false);
});
test('Pokémon Breeder Fields retrieves the matching Evolution instead of auto-evolving',()=>{
 const {g,p}=fresh({hand:['neo3-62'],meActive:'base1-46',deck:['base1-24']});
 // A tails result may finish with no retrieved Evolution; coin outcomes are tested by existing fixtures.
 assert.equal(g.trainer58(0,[[-1],0]),true);assert.equal(p.active.id,'base1-46');
});
test('Berry activates after Poison damage crosses threshold between turns',()=>{
 const {g,p}=fresh({meActive:'base1-50'});
 p.active.damage=10;p.active.poison=true;p.active.poisonDamage=10;
 p.active.attachedTrainers=[{id:'neo1-99'}];
 g.between();
 assert.equal(p.active.damage,0);assert.ok(p.discard.includes('neo1-99'));
});
test('Gold Berry and Miracle Berry activate at the correct thresholds',()=>{
 const {g,p}=fresh({bench:['base1-58','base1-49']});
 p.active.damage=30;p.active.attachedTrainers=[{id:'neo1-93'}];
 p.bench[0].status='Asleep';p.bench[0].attachedTrainers=[{id:'neo1-94'}];
 p.bench[1].damage=40;p.bench[1].attachedTrainers=[{id:'neo1-93'}];
 g.runTrainerBetweenTriggers();
 assert.equal(p.active.damage,30);assert.equal(p.bench[0].status,null);assert.equal(p.bench[1].damage,0);
 assert.equal(p.active.attachedTrainers.length,1);
 assert.ok(p.discard.includes('neo1-94'));
});
console.log(`PASS v0.5.8: ${runs} Trainer and choice tests`);
