'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const variants=[
 {id:'base1-17',dragon:'base1-18',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-21',dragon:'base4-22',formats:[['online-preview',60],['online-preview',40]]}
];
const grass='base1-99',fire='base1-98',lightning='base1-100',dce='base1-96';
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size,beedrill,dragon){const deck=[...Array(4).fill('base1-44'),...Array(4).fill(beedrill),...Array(4).fill(dragon),...Array(48).fill(grass)],d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(grass);p.prizes=Array(size===40?4:6).fill(grass)}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
function pick(g,side,id){const d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected:[id]});}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Twineedle and Slam use two flips: 0, 30, or 60 damage for 0, 1, or 2 heads.
 for(const [seed,heads,damage] of [[0,0,0],[32768,1,30],[1000,2,60]]){
  for(const [attacker,index,id] of [[v.id,0,'Twineedle'],[v.dragon,0,'Slam']]){const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(attacker,[grass,fire,lightning]);g.rngState=seed;act(g,0,'attack',{attackIndex:index});const flips=g.coinFlips.slice(-2);assert.equal(flips.filter(x=>x.result==='heads').length,heads,`${id} seed ${seed}`);assert.equal(g.players[1].active.damage,damage);scenarios++;}
 }
 // Both attacks reject insufficient generic Energy without changing game state.
 {const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(v.id,[grass,fire]);reject(g,0,'attack',{attackIndex:0});}
 {const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(v.dragon,[dce,grass]);reject(g,0,'attack',{attackIndex:1});scenarios+=2;}
 // Poison Sting deals 40 on either result; only heads applies Poison.
 for(const [seed,result,poison,damage] of [[1000,'heads',true,50],[0,'tails',false,40]]){const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(v.id,[grass,grass,grass]);g.rngState=seed;act(g,0,'attack',{attackIndex:1});assert.equal(g.coinFlips.at(-1).result,result);assert.equal(g.players[1].active.damage,damage);assert.equal(g.players[1].active.poison,poison);scenarios++;}
 // Hyper Beam deals its 20 even with no Energy to remove; attacker chooses
 // among distinct defender Energy, while identical Basic reprints auto-resolve.
 {const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(v.dragon,[grass,fire,lightning,dce]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);assert.equal(g.pendingDecision,null);}
 {const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(v.dragon,[grass,fire,lightning,dce]);g.players[1].active.energies=[grass,grass];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.energies.length,1);assert.equal(g.players[1].discard[0],grass);scenarios++;}
 {const g=game(format,size,v.id,v.dragon);g.players[0].active=unit(v.dragon,[grass,fire,lightning,dce]);g.players[1].active.energies=[grass,lightning];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2);pick(g,0,'energy:1');assert.equal(g.players[1].active.energies[0],grass);assert.deepEqual(g.players[1].discard,[lightning]);assert.equal(g.players[1].discard.length,1);scenarios++;}
}
console.log(`PASS Beedrill and Dragonair coin attacks, Poison Sting and Hyper Beam selection (${scenarios} scenarios)`);
