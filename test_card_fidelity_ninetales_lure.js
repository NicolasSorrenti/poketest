'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-12'),...Array(4).fill('base1-68'),...Array(52).fill('base1-99')];
const unit=(id,energies=[],status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status,poison:false,playedTurn:0});
function game(format='classic',size=60){const d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.turnSerial=4;for(const p of g.players){p.active=unit('base1-12',['base1-99','base1-102']);p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99')}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 // One legal replacement is automatic; switching clears the outgoing Pokémon's Special Condition.
 {const g=game(format,size);g.players[1].active=unit('base1-3',[],'Paralyzed');g.players[1].bench=[unit('base1-9')];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.id,'base1-9');assert.equal(g.players[1].bench[0].id,'base1-3');assert.equal(g.players[1].bench[0].status,null);assert.equal(g.players[1].active.damage,0);}
 // With multiple replacements, the attacking player owns the choice and cannot select outside the Bench.
 {const g=game(format,size);g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-9'),unit('base1-4')];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['bench:0','bench:1']);reject(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:1']});assert.equal(g.players[1].active.id,'base1-4');assert.equal(g.players[1].bench[1].id,'base1-3');}
 // No opposing Bench is legal: Lure does not switch or ask for a target.
 {const g=game(format,size);g.players[1].active=unit('base1-3');g.players[1].bench=[];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.id,'base1-3');}
 // Lure still has its printed two-Colorless attack cost.
 {const g=game(format,size);g.players[0].active.energies=['base1-99'];reject(g,0,'attack',{attackIndex:0});}
}
console.log('PASS Ninetales Lure cost, target ownership, single-target auto-switch, no-Bench case and status clearing');
