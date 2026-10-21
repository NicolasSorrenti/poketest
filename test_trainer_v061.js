'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=fs.readdirSync(__dirname+'/cards').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(__dirname+'/cards/'+f)));
const source=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const ctx={Math,console,window:{},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{},appendChild(){},querySelectorAll(){return []}}),querySelector:()=>null},setTimeout(){},clearTimeout(){},innerWidth:1600};
vm.createContext(ctx);vm.runInContext(source,ctx);
for(const script of ['trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+script,'utf8'),ctx);
function fresh({me='gym1-52',foe='base1-58',myEnergy=['base1-98'],enemyEnergy=[],myBench=[],enemyBench=[]}={}){
 vm.runInContext("lookup=new Map();engine.players=[statePlayer('Human',[]),statePlayer('Rival',[])];engine.turn=0;engine.round=4;engine.turnSerial=9;engine.phase='game';engine.over=false;engine.started=true;engine.stadium=null;engine._trainer61Vermilion=null;engine._trainer60ExpPrompt=null;render=()=>{};deckSearchRequest=null;selected=null;",ctx);
 const g=vm.runInContext('engine',ctx),make=vm.runInContext('unit',ctx),lookup=vm.runInContext('lookup',ctx);for(const card of data)lookup.set(card.id,card);
 const p=g.players[0],f=g.players[1];p.active=make(me);f.active=make(foe);p.active.energies=myEnergy.slice();f.active.energies=enemyEnergy.slice();p.bench=myBench.map(make);f.bench=enemyBench.map(make);
 p.deck=Array(15).fill('base1-98');f.deck=Array(15).fill('base1-97');p.prizes=['base1-98'];f.prizes=['base1-97'];return {g,p,f};
}
function flipTo(heads,run){ctx.__prev=vm.runInContext('coin',ctx);vm.runInContext(`coin=()=>${heads}`,ctx);try{return run()}finally{vm.runInContext('coin=__prev',ctx)}}
let tested=0;function t(name,fn){try{fn();tested++}catch(e){console.error('FAILED: '+name);throw e}}
t('Vermilion Gym optionally declines without affecting attack damage',()=>{const {g,p,f}=fresh();g.stadium={id:'gym1-120',owner:0};assert.equal(g.attack(0,null,true),null);assert.equal(f.active.damage,0);assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(0),true);assert.equal(f.active.damage,20);assert.equal(p.active.damage,0)});
t('Vermilion Gym on heads adds 10 final damage',()=>{const {g,p,f}=fresh();g.stadium={id:'gym1-120',owner:0};flipTo('true',()=>{assert.equal(g.attack(0,null,true),null);assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(1),true)});assert.equal(f.active.damage,30);assert.equal(p.active.damage,0)});
t('Vermilion Gym on tails damages the attacking Pokémon instead',()=>{const {g,p,f}=fresh();g.stadium={id:'gym1-120',owner:0};flipTo('false',()=>{assert.equal(g.attack(0,null,true),null);assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(1),true)});assert.equal(f.active.damage,20);assert.equal(p.active.damage,10)});
t('Vermilion Gym rejects wrong choices without starting attack or altering state',()=>{const {g,p,f}=fresh();g.stadium={id:'gym1-120',owner:0};assert.equal(g.attack(0,null,true),null);assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(500),false);assert.equal(f.active.damage,0);assert.equal(p.active.damage,0)});
t('Vermilion Gym does not offer a choice for other Trainers Pokémon',()=>{const {g,f}=fresh({me:'base1-58'});g.stadium={id:'gym1-120',owner:0};assert.equal(g.attack(0,null,true),true);assert.equal(f.active.damage,10)});
t('Vermilion Gym Tails inflicts recoil even for an attack with zero printed damage',()=>{
 const {g,p,f}=fresh({me:'gym1-82',myEnergy:['base1-98']});g.stadium={id:'gym1-120',owner:0};
 flipTo('false',()=>{assert.equal(g.attack(0,null,true),null);assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(1),true)});
 assert.equal(p.active.damage,10);assert.equal(f.active.damage,0);
});
t("Brock's Protection restores opposing attack-discarded Energy to its Pokémon",()=>{
 const {g,f,p}=fresh({me:'gym1-61',foe:'gym1-21',myEnergy:['base1-98'],enemyEnergy:['base1-100']});f.active.attachedTrainers=[{id:'gym2-101'}];
 assert.equal(g.attack(0,null,true),true);assert.deepEqual(f.active.energies,['base1-100']);assert.equal(f.discard.includes('base1-100'),false);assert.ok(p.discard.includes('base1-98'));
});
t('Unprotected Pokémon still lose Energy to an opposing attack',()=>{
 const {g,f}=fresh({me:'gym1-61',foe:'gym1-21',myEnergy:['base1-98'],enemyEnergy:['base1-100']});
 assert.equal(g.attack(0,null,true),true);assert.equal(f.active.energies.length,0);assert.ok(f.discard.includes('base1-100'));
});
t('Ecogym returns opposing non-Colorless Energy discarded by an attack to its owner',()=>{
 const {g,f}=fresh({me:'gym1-61',foe:'gym1-21',myEnergy:['base1-98'],enemyEnergy:['base1-100']});g.stadium={id:'neo1-84',owner:0};
 assert.equal(g.attack(0,null,true),true);assert.equal(f.active.energies.length,0);assert.equal(f.hand.includes('base1-100'),true);assert.equal(f.discard.includes('base1-100'),false);
});
t('Ecogym does not return Energy voluntarily discarded by its owner',()=>{
 const {g,p,f}=fresh({me:'gym1-61',foe:'gym1-21',myEnergy:['base1-98'],enemyEnergy:[]});g.stadium={id:'neo1-84',owner:0};
 assert.equal(g.attack(0,null,true),true);assert.equal(p.discard.includes('base1-98'),true);assert.equal(p.hand.includes('base1-98'),false);
});
t('Ecogym does not return Double Colorless Energy discarded by an opposing Trainer',()=>{
 const {g,p,f}=fresh({me:'gym1-52',foe:'gym1-21',enemyEnergy:['base1-96']});
 g.stadium={id:'neo1-84',owner:0};p.hand=['base1-92'];
 assert.equal(g.trainer58(0,[-1,0]),true);
 assert.equal(f.active.energies.length,0);assert.equal(f.hand.includes('base1-96'),false);assert.equal(f.discard.includes('base1-96'),true);
});
t("Brock's Protection reverses an opposing attack moving Energy into hand",()=>{
 const {g,f}=fresh({foe:'gym1-21',enemyEnergy:['base1-100']});
 f.active.attachedTrainers=[{id:'gym2-101'}];
 const snapshot=vm.runInContext('trainer61EnergySnapshot(engine,engine.foe)',ctx);
 f.hand.push(f.active.energies.pop());
 g.trainer61RestoreOpposingEnergy(f,snapshot);
 assert.deepEqual(f.active.energies,['base1-100']);assert.equal(f.hand.includes('base1-100'),false);
});
t("Brock's Protection reverses an opposing attack moving Energy onto the Bench",()=>{
 const {g,f}=fresh({foe:'gym1-21',enemyEnergy:['base1-100'],enemyBench:['base1-58']});
 f.active.attachedTrainers=[{id:'gym2-101'}];
 const snapshot=vm.runInContext('trainer61EnergySnapshot(engine,engine.foe)',ctx);
 f.bench[0].energies.push(f.active.energies.pop());
 g.trainer61RestoreOpposingEnergy(f,snapshot);
 assert.deepEqual(f.active.energies,['base1-100']);assert.equal(f.bench[0].energies.length,0);
});
t("Brock's Protection reverses an opposing attack shuffling Energy into the deck",()=>{
 const {g,f}=fresh({foe:'gym1-21',enemyEnergy:['base1-100']});
 f.active.attachedTrainers=[{id:'gym2-101'}];
 const snapshot=vm.runInContext('trainer61EnergySnapshot(engine,engine.foe)',ctx);
 f.deck.push(f.active.energies.pop());
 g.trainer61RestoreOpposingEnergy(f,snapshot);
 assert.deepEqual(f.active.energies,['base1-100']);assert.equal(f.deck.includes('base1-100'),false);
});
t("Brock's Protection uses attachment state at attack start",()=>{
 const {g,f}=fresh({foe:'gym1-21',enemyEnergy:['base1-100']});
 const before=vm.runInContext('trainer61EnergySnapshot(engine,engine.foe)',ctx);
 f.active.attachedTrainers=[{id:'gym2-101'}];
 f.discard.push(f.active.energies.pop());
 g.trainer61RestoreOpposingEnergy(f,before);
 assert.equal(f.active.energies.length,0);
 assert.ok(f.discard.includes('base1-100'));
});
console.log('PASS v0.6.1: '+tested+' Trainer attack-interaction scenarios');
