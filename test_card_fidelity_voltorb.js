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
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:53});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const id of ['base1-67','base4-98']){
 const card=CATALOG.get(id);assert.equal(card.name,'Voltorb');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Lightning']);
 assert.deepEqual(card.attacks,[{name:'Tackle',cost:['Colorless'],damage:'10',text:''}]);
 assert.deepEqual(card.weaknesses,[{type:'Fighting',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-67','base4-98']){
  // Any attached Energy pays Tackle's Colorless requirement and remains in play.
  for(const energy of ['base1-102','base1-96']){const g=game(format,size);g.players[0].active=unit(id,[energy]);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.deepEqual(g.players[0].active.energies,[energy]);scenarios++;}
  // Lightning damage is reduced by Sandshrew's -30 Resistance, to zero.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102']);g.players[1].active=unit('base1-62');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);scenarios++;}
  // Voltorb's Fighting Weakness doubles Hitmonchan's Jab; Defender then
  // reduces the post-Weakness result from 40 to 20.
  {const g=game(format,size);g.players[0].active=unit('base1-7',['base1-97']);g.players[1].active=unit(id);g.players[1].active.attachedTrainers=[{id:'base1-80',expires:100}];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
  {const g=game(format,size);g.players[0].active=unit(id);reject(g,0,'attack',{attackIndex:0});assert.equal(g.turn,0);scenarios++;}
 }
}
assert.equal(scenarios,42);
console.log(`PASS Voltorb Base/Base Set 2 Tackle, Colorless payment, Weakness and Resistance (${scenarios} reducer scenarios)`);
