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
 for(const already of [false,true]){
  const g=game(format,size);g.players[0].active=unit('base1-11',Array(3).fill('base1-99'));g.players[1].active=unit('base1-2');
  if(already){g.players[1].active.poison=true;g.players[1].active.poisonDamage=10;}
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.poisonDamage,20);assert.equal(g.players[1].active.damage,40);assert.ok(g.message.some(x=>x.includes('takes 20 Poison damage')));
  act(g,1,'end_turn',{});assert.equal(g.players[1].active.damage,60);assert.ok(g.message.filter(x=>x.includes('takes 20 Poison damage')).length===2);
 }
 {const g=game(format,size);g.players[0].active.poison=true;g.players[0].active.poisonDamage=10;act(g,0,'end_turn',{});assert.equal(g.players[0].active.damage,10);assert.ok(g.message.some(x=>x.includes('takes 10 Poison damage')));}
 const g=game(format,size);g.players[0].active=unit('base1-11',['base1-99','base1-99','base1-98']);reject(g,0,'attack',{attackIndex:1});
}
console.log('PASS Nidoking Toxic damage, replacement and checkup log');
