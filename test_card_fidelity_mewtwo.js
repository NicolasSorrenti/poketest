'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-10'),...Array(56).fill('base1-101')];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format='classic',size=60){const d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-10');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-101');p.prizes=Array(size===40?4:6).fill('base1-101')}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 // Barrier's extra discard is Psychic-only; identical Psychic cards need no picker, and its next-turn shield stops damage and effects.
 {const g=game(format,size);g.players[0].active=unit('base1-10',['base1-101','base1-101','base1-98']);g.players[1].active=unit('base1-9',['base1-100','base1-100','base1-100']);g.rngState=50000;act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,['base1-101','base1-98']);assert.deepEqual(g.players[0].discard,['base1-101']);assert.deepEqual(g.players[0].active.shield,{allEffects:true,expires:6});g.turn=1;g.turnSerial=5;act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.status,null);}
 // Ineligible attached Energy cannot satisfy Barrier's additional Psychic Energy discard.
 {const g=game(format,size);g.players[0].active=unit('base1-10',['base1-101','base1-101','base1-98']);act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,['base1-101','base1-98']);assert.equal(g.players[0].discard[0],'base1-101');}
 // Rainbow Energy can supply Psychic, but is a distinct discard outcome, so retain the player's choice.
 {const g=game(format,size);g.players[0].active=unit('base1-10',['base1-101','base1-101','base5-17']);act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.kind,'pay-energy');assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['energy:0','energy:1','energy:2']);act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['energy:2']});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,['base1-101','base1-101']);assert.deepEqual(g.players[0].discard,['base5-17']);}
 // Psychic counts attached Energy cards; Double Colorless is one card, not two Energy units.
 {const g=game(format,size);g.players[0].active=unit('base1-10',['base1-101','base1-96']);g.players[1].active=unit('base1-9',['base1-100','base1-96']);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30);}
 // Barrier still needs its printed attack cost; the extra Psychic discard is not a substitute for it.
 {const g=game(format,size);g.players[0].active=unit('base1-10',['base1-101','base1-98']);reject(g,0,'attack',{attackIndex:1});}
}
console.log('PASS Mewtwo Psychic Energy requirement, automatic equivalent discard, attack cost and Barrier shield scenarios');
