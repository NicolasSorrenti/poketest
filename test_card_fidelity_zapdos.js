'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const variants=[
 {id:'base1-16',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-20',formats:[['online-preview',60],['online-preview',40]]}
];
const lightning='base1-100',dce='base1-96';
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format,size,zapdos){const deck=[...Array(4).fill(zapdos),...Array(56).fill(lightning)],d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(lightning);p.prizes=Array(size===40?4:6).fill(lightning);}g.players[0].active=unit(zapdos);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Thunder always deals 60. Tails adds 30 to Zapdos; heads does not.
 for(const [seed,result,recoil] of [[50000,'heads',0],[0,'tails',30]]){const g=game(format,size,v.id);g.players[0].active.energies=[lightning,lightning,lightning,dce];g.rngState=seed;act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,result);assert.equal(g.players[1].active.damage,60);assert.equal(g.players[0].active.damage,recoil);scenarios++;}
 // Thunder's tails recoil can Knock Out its already-damaged user and awards
 // a Prize to the opponent after the attack resolves.
 {const g=game(format,size,v.id);g.players[0].active.energies=[lightning,lightning,lightning,dce];g.players[0].active.damage=60;g.rngState=0;act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'tails');assert.equal(g.players[0].active,null);assert.equal(g.pendingAction.kind,'take_prize');assert.equal(g.pendingDecision.actor,1);scenarios++;}
 // Thunderbolt requires four Lightning, deals 100, and discards every Energy
 // card attached to Zapdos after use, including non-Lightning Energy.
 {const g=game(format,size,v.id);g.players[0].active.energies=[lightning,lightning,lightning,lightning,dce];act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,100);assert.deepEqual(g.players[0].active.energies,[]);assert.deepEqual(g.players[0].discard,[lightning,lightning,lightning,lightning,dce]);assert.equal(g.pendingDecision,null);scenarios++;}
 // Double Colorless supplies two Colorless, not the fourth required Lightning.
 {const g=game(format,size,v.id);g.players[0].active.energies=[lightning,lightning,lightning,dce];reject(g,0,'attack',{attackIndex:1});scenarios++;}
}
console.log(`PASS Zapdos Thunder and Thunderbolt coin, recoil, cost and discard scenarios (${scenarios} scenarios)`);
