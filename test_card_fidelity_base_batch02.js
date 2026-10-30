'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format='classic',size=60){const d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');}return g;}
function act(g,side,type,payload){let r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){let before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false);assert.deepEqual(g,before);}
function choose(g,side,selected){act(g,side,'choose',{decisionId:g.pendingDecision.id,selected});}
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 // Scrunch protects damage only: Bubblebeam's paralysis still happens.
 for(const [seed,prevented] of [[0,false],[50000,true]]){
  const g=game(format,size);g.players[0].active=unit('base1-3',['base1-99','base1-99']);g.players[1].active=unit('base1-6',Array(4).fill('base1-102'));g.rngState=seed;
  act(g,0,'attack',{attackIndex:0});assert.equal(Boolean(g.players[0].active.shield),prevented);g.rngState=50000;
  act(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,prevented?0:40);assert.equal(g.players[0].active.status,'Paralyzed');
 }
 // Double-edge deals 80 to each Pokémon; the attacker can be Knocked Out.
 {const g=game(format,size);g.players[0].active=unit('base1-3',Array(4).fill('base1-99'));g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,80);assert.equal(g.players[1].active.damage,80);}
 // Dragon Rage and Bubblebeam retain their printed Water costs and damage.
 {const g=game(format,size);g.players[0].active=unit('base1-6',Array(3).fill('base1-102'));g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,50);}
 {const g=game(format,size);g.players[0].active=unit('base1-6',Array(3).fill('base1-102'));reject(g,0,'attack',{attackIndex:1});}
 for(const [seed,status] of [[0,null],[50000,'Paralyzed']]){const g=game(format,size);g.players[0].active=unit('base1-6',Array(4).fill('base1-102'));g.players[1].active=unit('base1-3');g.rngState=seed;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.players[1].active.status,status);}
 // Fire Spin requires both four Fire units and two discarded cards, with a meaningful choice.
 {const g=game(format,size);g.players[0].active=unit('base1-4',['base1-98','base1-98','base1-99','base1-99']);g.players[1].active=unit('base1-3');act(g,0,'use_power',{slot:-1});act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);choose(g,0,['energy:0','energy:2']);assert.deepEqual(g.players[0].active.energies,['base1-98','base1-99']);assert.deepEqual([...g.players[0].discard].sort(),['base1-98','base1-99']);assert.equal(g.players[1].active.damage,100);}
 {const g=game(format,size);g.players[0].active=unit('base1-4',['base1-98','base1-98','base1-98','base1-99']);reject(g,0,'attack',{attackIndex:0});}
 // Energy Burn turns all attached Energy Fire until end of turn and is disabled by special conditions.
 {const g=game(format,size);g.players[0].active=unit('base1-4',['base1-98','base1-98','base1-99','base1-99']);g.players[1].active=unit('base1-3');act(g,0,'use_power',{slot:-1});act(g,0,'attack',{attackIndex:0});choose(g,0,['energy:0','energy:2']);assert.equal(g.players[1].active.damage,100);assert.equal(g.players[0].active.energyBurnUntil,undefined);}
 for(const status of ['Asleep','Confused','Paralyzed']){const g=game(format,size);g.players[0].active=unit('base1-4',['base1-99']);g.players[0].active.status=status;reject(g,0,'use_power',{slot:-1});}
}
console.log('PASS Base Chansey, Charizard and Gyarados scenarios across Classic, Neo, online and Cube');
