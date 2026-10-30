'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format='classic',size=60){const d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99')}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 for(const [seed,status] of [[0,null],[50000,'Paralyzed']]){const g=game(format,size);g.players[0].active=unit('base1-9',['base1-100','base1-100','base1-100']);g.players[1].active=unit('base1-12');g.rngState=seed;act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.status,status);}
 {const g=game(format,size);g.players[0].active=unit('base1-9',['base1-100','base1-99','base1-99']);reject(g,0,'attack',{attackIndex:0});}
 // Selfdestruct damages both Benches without Lightning resistance reduction, does 80 recoil, and spends its four-Energy attack cost.
 {const g=game(format,size);g.players[0].active=unit('base1-9',Array(4).fill('base1-100'));g.players[0].bench=[unit('base1-47')];g.players[1].active=unit('base1-4');g.players[1].bench=[unit('base1-47')];act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].bench[0].damage,20);assert.equal(g.players[1].bench[0].damage,20);assert.equal(g.players[1].active.damage,80);assert.equal(g.players[0].active,null);assert.equal(g.pendingAction.kind,'take_prize');assert.ok(g.players[0].discard.includes('base1-9'));assert.ok(g.players[0].discard.filter(x=>x==='base1-100').length===4);}
 {const g=game(format,size);g.players[0].active=unit('base1-9',['base1-100','base1-99','base1-99','base1-99']);reject(g,0,'attack',{attackIndex:1});}
}
console.log('PASS Magneton Thunder Wave outcomes/cost and Selfdestruct bench, recoil, resistance and cost scenarios');
