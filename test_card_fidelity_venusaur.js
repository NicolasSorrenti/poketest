'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');

// Base Set Venusaur (base1-15) and its Base Set 2 reprint (base4-18) have
// identical Energy Trans and Solarbeam text. Base Set 2 is reducer-tested in
// the online preview, not claimed as legal in the curated Classic format.
const variants=[
 {id:'base1-15',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-18',formats:[['online-preview',60],['online-preview',40]]}
];
const grass='base1-99',colorless='base1-98';
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size,venusaur){
 const deck=[...Array(4).fill('base1-45'),...Array(56).fill(grass)],d=size===40?deck.slice(0,40):deck;
 const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});
 g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(grass);p.prizes=Array(size===40?4:6).fill(grass);}
 g.players[0].active=unit(venusaur);g.players[0].bench=[unit('base1-45'),unit('base1-45')];
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
function pick(g,side,id){const d=g.pendingDecision;assert.ok(d);act(g,side,'choose',{decisionId:d.id,selected:[id]});}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Energy Trans may be used repeatedly in the same turn; Finish closes the
 // session after any number of transfers and does not pass the turn.
 {const g=game(format,size,v.id);g.players[0].active.energies=[grass,grass];g.players[0].bench[0].energies=[grass];g.players[0].bench[1].energies=[grass];
  act(g,0,'use_power',{slot:-1,repeat:true});assert.equal(g.pendingDecision.kind,'source');assert.equal(g.pendingDecision.optional,true);
  pick(g,0,'slot:0');assert.equal(g.pendingDecision.kind,'target');pick(g,0,'slot:1');
  assert.equal(g.players[0].active.energies.length,2);assert.equal(g.players[0].bench[1].energies.length,2);assert.equal(g.pendingDecision.kind,'source');
  pick(g,0,'slot:1');pick(g,0,'slot:-1');assert.equal(g.players[0].bench[1].energies.length,1);assert.equal(g.players[0].active.energies.length,3);
  assert.equal(g.pendingDecision.kind,'source');act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});assert.equal(g.pendingDecision,null);assert.equal(g.turn,0);scenarios++;}
 // A single eligible Grass Energy needs no energy-card picker; another Energy
 // type on that source is not eligible for Energy Trans.
 {const g=game(format,size,v.id);g.players[0].bench[0].energies=[grass,'base1-100'];act(g,0,'use_power',{slot:-1,repeat:true});pick(g,0,'slot:0');assert.equal(g.pendingDecision.kind,'target');pick(g,0,'slot:-1');assert.deepEqual(g.players[0].bench[0].energies,['base1-100']);assert.deepEqual(g.players[0].active.energies,[grass]);act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});scenarios++;}
 // Two Base Set printings of Basic Grass Energy have the same transfer
 // outcome, so no Energy-card prompt is needed; Rainbow Energy is not eligible.
 {const g=game(format,size,v.id);g.players[0].bench[0].energies=[grass,'base4-127','base5-17'];act(g,0,'use_power',{slot:-1,repeat:true});pick(g,0,'slot:0');assert.equal(g.pendingDecision.kind,'target');pick(g,0,'slot:-1');assert.deepEqual(g.players[0].bench[0].energies,['base4-127','base5-17']);assert.deepEqual(g.players[0].active.energies,[grass]);act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});scenarios++;}
 // Energy Trans cannot attach to the same Pokémon it came from and cannot be
 // activated after Venusaur becomes Asleep, Confused, or Paralyzed.
 {const g=game(format,size,v.id);g.players[0].active.energies=[grass];g.players[0].bench[0].energies=[grass];act(g,0,'use_power',{slot:-1,repeat:true});pick(g,0,'slot:-1');assert.ok(!g.pendingDecision.options.some(x=>x.id==='slot:-1'));reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['slot:-1']});}
 for(const status of ['Asleep','Confused','Paralyzed']){const g=game(format,size,v.id);g.players[0].active.status=status;g.players[0].bench[0].energies=[grass];reject(g,0,'use_power',{slot:-1,repeat:true});scenarios++;}
 // Solarbeam is four Grass, not four generic Energy, for 60 damage.
 {const g=game(format,size,v.id);g.players[0].active.energies=[grass,grass,grass,grass];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,60);scenarios++;}
 {const g=game(format,size,v.id);g.players[0].active.energies=[grass,grass,grass,colorless];reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
console.log(`PASS Venusaur Energy Trans repeat/Finish, eligibility, status and Solarbeam cost (${scenarios} scenarios)`);
