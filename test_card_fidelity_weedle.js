'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const configs=[
 {format:'classic',size:60},
 {format:'neo-theme',size:60},
 {format:'online-preview',size:60},
 {format:'online-preview',size:40}
];
const unit=(id,energies=[],status=null,poison=false)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status,poison,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:61});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);assert.deepEqual(g,before,'rejected attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,ok=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){ok=false;break;}}if(ok)return seed;}throw Error('coin sequence not found');}
let scenarios=0;
for(const id of ['base1-69','base4-100']){
 const card=CATALOG.get(id);assert.equal(card.name,'Weedle');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Grass']);
 assert.deepEqual(card.attacks,[{name:'Poison Sting',cost:['Grass'],damage:'10',text:'Flip a coin. If heads, Defending Pokémon is now Poisoned.'}]);
 assert.deepEqual(card.weaknesses,[{type:'Fire',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-69','base4-100']){
  // Both outcomes deal 10; heads adds Poison and its first normal checkup.
  for(const heads of [false,true]){const g=game(format,size);g.players[0].active=unit(id,['base1-99']);g.players[1].active=unit('base1-3');g.rngState=seedFor([heads]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,heads?20:10);assert.equal(g.players[1].active.poison,heads);scenarios++;}
  // Poison coexists with Confusion; applying Poison again does not stack it.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99']);g.players[1].active=unit('base1-3',[],'Confused',true);g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.status,'Confused');scenarios++;}
  // WotC-era Confusion is checked before Poison Sting's own coin. On tails,
  // the attack and its effect stop; on heads, Poison Sting then flips normally.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99'],'Confused');g.players[1].active=unit('base1-3');g.rngState=seedFor([false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.poison,false);assert.equal(g.coinFlips.length,1);scenarios++;}
  for(const poisonHeads of [false,true]){const g=game(format,size);g.players[0].active=unit(id,['base1-99'],'Confused');g.players[1].active=unit('base1-3');g.rngState=seedFor([true,poisonHeads]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[1].active.damage,poisonHeads?20:10);assert.equal(g.players[1].active.poison,poisonHeads);assert.deepEqual(g.coinFlips.map(f=>f.result),["heads",poisonHeads?"heads":"tails"]);scenarios++;}
  // Defender reduces the 10 attack damage to zero, but the independent
  // Poison effect still occurs and then deals its normal checkup damage.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99']);g.players[1].active=unit('base1-3');g.players[1].active.attachedTrainers=[{id:'base1-80',expires:100}];g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.poison,true);scenarios++;}
  // The next opponent turn has another Poison checkup after its attack.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99']);g.players[1].active=unit('base1-58',['base1-96']);g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.damage,10);scenarios++;}
  {const g=game(format,size);g.players[0].active=unit(id,['base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 }
}
for(const {format,size} of configs.filter(x=>x.format!=='classic')){
 for(const id of ['base1-69','base4-100']){
  const g=game(format,size);g.players[0].active=unit(id,['base5-17']);g.players[1].active=unit('base1-3');g.rngState=seedFor([false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.poison,false);scenarios++;
 }
}
assert.equal(scenarios,80);
console.log(`PASS Weedle Base/Base Set 2 Poison Sting, coin outcomes, Poison timing/coexistence and typed Grass cost (${scenarios} reducer scenarios)`);
