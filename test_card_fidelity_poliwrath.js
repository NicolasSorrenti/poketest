'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-13'),...Array(4).fill('base1-59'),...Array(52).fill('base1-99')];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format='classic',size=60){
 const d=size===40?deck.slice(0,40):deck;
 const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});
 g.phase='game';g.turn=0;g.turnSerial=4;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99')}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 // Water Gun counts only surplus Water cards, uses no more than two, and never counts surplus non-Water.
 for(const [energies,damage] of [
  [['base1-102','base1-102','base1-96'],30],
  [['base1-102','base1-102','base1-102','base1-96'],40],
  [['base1-102','base1-102','base1-102','base1-102','base1-102','base1-96'],50],
  [['base1-102','base1-102','base1-96','base1-98'],30]
 ]){
  const g=game(format,size);g.players[0].active=unit('base1-13',energies);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,damage);
 }
 // Wrong-type Energy cannot cover Water Gun's two Water requirement.
 {const g=game(format,size);g.players[0].active=unit('base1-13',['base1-98','base1-98','base1-96','base1-96']);reject(g,0,'attack',{attackIndex:0});}
 // Whirlpool still deals 40 when no Energy is attached and does not open a picker.
 {const g=game(format,size);g.players[0].active=unit('base1-13',['base1-102','base1-102','base1-96']);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.pendingDecision,null);}
 // A single attached Energy is removed automatically.
 {const g=game(format,size);g.players[0].active=unit('base1-13',['base1-102','base1-102','base1-96']);g.players[1].active.energies=['base1-99'];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[1].active.energies,[]);assert.deepEqual(g.players[1].discard,['base1-99']);}
 // Basic Grass reprints are one equivalent choice despite distinct catalog IDs.
 {const g=game(format,size);g.players[0].active=unit('base1-13',['base1-102','base1-102','base1-96']);g.players[1].active.energies=['base1-99','base4-127'];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.energies.length,1);assert.ok(g.message.some(x=>x.includes('discarded Grass Energy from')));}
 // Recycle Energy has a distinct printed effect, so the attacker chooses; discarding it returns it to its owner's hand.
 {const g=game(format,size);g.players[0].active=unit('base1-13',['base1-102','base1-102','base1-96']);g.players[1].active.energies=['base1-99','neo1-105'];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2);act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['energy:1']});assert.ok(g.players[1].hand.includes('neo1-105'));assert.deepEqual(g.players[1].active.energies,['base1-99']);}
}
console.log('PASS Poliwrath Water Gun costs and cap; Whirlpool no-target, equivalent reprints, player choice and Recycle Energy return across Classic, Neo, online-preview and 40-card Cube reducers');
