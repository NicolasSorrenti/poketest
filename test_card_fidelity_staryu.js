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
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:43});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);return r;}
let scenarios=0;
for(const id of ['base1-65','base4-95']){
 const card=CATALOG.get(id);assert.equal(card.name,'Staryu');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Water']);
 assert.deepEqual(card.attacks,[{name:'Slap',cost:['Water'],damage:'20',text:''}]);
 assert.deepEqual(card.weaknesses,[{type:'Lightning',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-65','base4-95']){
  // Slap deals 20, doubled by Charmander's Water Weakness.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102']);g.players[1].active=unit('base1-46');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40);scenarios++;}
  // Defender applies after Weakness: 20 becomes 40 then is reduced by 20.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102']);g.players[1].active=unit('base1-46');g.players[1].active.attachedTrainers=[{id:'base1-80',expires:100}];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
  // Colorless Energy alone cannot satisfy the printed Water requirement.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-96']);reject(g,0,'attack',{attackIndex:0});assert.equal(g.turn,0);scenarios++;}
 }
}
for(const {format,size} of configs.filter(x=>x.format!=='classic')){
 for(const id of ['base1-65','base4-95']){
  // Rainbow Energy provides the Water required by Slap in these later rulesets.
  const g=game(format,size);g.players[0].active=unit(id,['base5-17']);g.players[1].active=unit('base1-46');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40);scenarios++;
 }
}
assert.equal(scenarios,32);
console.log(`PASS Staryu Base/Base Set 2 Slap, typed Water cost, weakness and Defender ordering (${scenarios} reducer scenarios)`);
