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
const unit=(id,energies=[],attachedTrainers=[])=>({id,under:[],energies:[...energies],attachedTrainers:[...attachedTrainers],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:17});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g);const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} must reject insufficient Energy`);assert.deepEqual(g,before,'rejected attack is atomic');}
let scenarios=0;
for(const id of ['base1-61','base4-89']){
 const rattata=CATALOG.get(id);
 assert.equal(rattata.name,'Rattata');assert.equal(rattata.hp,'30');assert.deepEqual(rattata.types,['Colorless']);
 assert.deepEqual(rattata.attacks,[{name:'Bite',cost:['Colorless'],damage:'20',text:''}]);
 assert.deepEqual(rattata.weaknesses,[{type:'Fighting',value:'×2'}]);
 assert.deepEqual(rattata.resistances,[{type:'Psychic',value:'-30'}]);assert.deepEqual(rattata.retreatCost,[]);scenarios++;
 for(const {format,size} of configs){
  // Any one Energy pays Bite's Colorless cost; extra Energy does not increase
  // its fixed 20 damage, and Double Colorless remains attached after attacking.
  for(const energies of [['base1-98'],['base1-96'],['base1-96','base1-101']]){
   const g=game(format,size);g.players[0].active=unit(id,energies);g.players[1].active=unit('base1-52');
   act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.deepEqual(g.players[0].active.energies,energies);assert.equal(g.pendingDecision,null);scenarios++;
  }
  {const g=game(format,size);g.players[0].active=unit(id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
  // Fighting doubles damage into Rattata before Defender reduces it by 20.
  // Psychic Resistance reduces Mewtwo's 10-damage attack below zero.
  {const g=game(format,size);g.players[0].active=unit('base1-52',['base1-97']);g.players[1].active=unit(id,[],[{id:'base1-80',expires:99}]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
  {const g=game(format,size);g.players[0].active=unit('base1-10',['base1-101','base1-98']);g.players[1].active=unit(id);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);scenarios++;}
 }
}
assert.equal(scenarios,50);
console.log(`PASS Rattata Base/Base Set 2 Bite, weakness and resistance (${scenarios} reducer scenarios)`);
