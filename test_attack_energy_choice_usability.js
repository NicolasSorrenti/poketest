'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(){const g=createGame({format:'classic',decks:[deck,deck],seed:3});g.phase='game';g.turn=0;g.turnSerial=4;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(6).fill('base1-99')}return g}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,r.error)}
// Fire Blast: identical eligible Fire cards are auto-discarded with a turn update.
{const g=game();g.players[0].active=unit('base1-12',Array(4).fill('base1-98'));act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.energies.length,3);assert.ok(g.message.some(x=>x.includes('discarded 1 Fire Energy to use Fire Blast')))}
// Rainbow Energy can pay Fire; distinct eligible cards retain the choice prompt.
{const g=game();g.players[0].active=unit('base1-12',['base1-98','base1-98','base1-98','base5-17']);act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,4)}
// Fire Spin discards two identical cards automatically and reports both.
{const g=game();g.players[0].active=unit('base1-4',Array(6).fill('base1-98'));act(g,0,'attack',{attackIndex:0});assert.notEqual(g.pendingDecision?.kind,'energy-discard');assert.equal(g.players[0].active.energies.length,4);assert.ok(g.message.some(x=>x.includes('discarded 2 Fire Energy cards to use Fire Spin')))}
// Whirlpool's opponent Energy selection is automatic only when every Energy is identical.
{const g=game();g.players[0].active=unit('base1-13',Array(4).fill('base1-102'));g.players[1].active.energies=Array(3).fill('base1-99');act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.energies.length,2);assert.ok(g.message.some(x=>x.includes('discarded Grass Energy from')))}
{const g=game();g.players[0].active=unit('base1-13',Array(4).fill('base1-102'));g.players[1].active.energies=['base1-99','base1-98'];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2)}
console.log('PASS identical attack Energy discards are automatic and reported; distinct cards remain selectable');
