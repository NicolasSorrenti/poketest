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
 const g=game(format,size);g.players[0].active=unit('base1-5',Array(3).fill('base1-99'));g.players[1].active=unit('base1-4');
 act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);choose(g,0,['attack:0']);
 assert.equal(g.players[1].active.damage,100);assert.deepEqual(g.players[0].active.energies,Array(3).fill('base1-99'));assert.equal(g.players[0].discard.length,0);
 const bad=game(format,size);bad.players[0].active=unit('base1-5',Array(2).fill('base1-99'));bad.players[1].active=unit('base1-4');reject(bad,0,'attack',{attackIndex:1});
}
console.log('PASS Clefairy Metronome copied Fire Spin cost and damage');
