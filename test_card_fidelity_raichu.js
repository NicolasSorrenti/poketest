'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const variants=[
 {pokemon:'base1-14',pikachu:'base1-58',lightning:'base1-100',dce:'base1-96',colorless:'base1-99',grass:'base1-99',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {pokemon:'base4-16',pikachu:'base4-87',lightning:'base4-128',dce:'base4-124',colorless:'base4-127',grass:'base4-127',formats:[['neo-theme',60],['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size,v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(v.pikachu),...Array(52).fill(v.grass)];
 const d=size===40?deck.slice(0,40):deck;
 const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});
 g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-9');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(size===40?4:6).fill(v.grass)}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Agility heads protects from both Thunder Wave's damage and its paralysis during the opponent's next turn.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.lightning,v.dce]);g.players[1].active=unit('base1-9',[...Array(3).fill('base1-100')]);g.rngState=50000;act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'heads');assert.deepEqual(g.players[0].active.shield,{allEffects:true,preventDamage:false,expires:6});g.turn=1;g.turnSerial=5;g.rngState=50000;act(g,1,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'heads');assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.status,null);scenarios++;}
 // Tails gives no Agility protection: Thunder Wave's damage and paralysis both resolve.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.lightning,v.dce]);g.players[1].active=unit('base1-9',[...Array(3).fill('base1-100')]);g.rngState=0;act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'tails');assert.equal(g.players[0].active.shield,undefined);g.turn=1;g.turnSerial=5;g.rngState=50000;act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,30);assert.equal(g.players[0].active.status,'Paralyzed');scenarios++;}
 // Protection expires after that one opposing turn.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.lightning,v.dce]);g.players[1].active=unit('base1-9',[...Array(3).fill('base1-100')]);g.rngState=50000;act(g,0,'attack',{attackIndex:0});g.turn=1;g.turnSerial=6;g.rngState=50000;act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,30);assert.equal(g.players[0].active.status,'Paralyzed');scenarios++;}
 // Thunder heads does 60 without recoil; tails adds 30 self-damage, with no weakness multiplier.
 {for(const [seed,result,selfDamage] of [[50000,'heads',0],[0,'tails',30]]){const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.lightning,v.lightning,v.lightning,v.colorless]);g.rngState=seed;act(g,0,'attack',{attackIndex:1});assert.equal(g.coinFlips.at(-1).result,result);assert.equal(g.players[1].active.damage,60);assert.equal(g.players[0].active.damage,selfDamage);scenarios++;}}
 // Thunder recoil can Knock Out Raichu and awards the opponent a Prize.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.lightning,v.lightning,v.lightning,v.colorless],60);g.rngState=0;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active,null);assert.equal(g.pendingAction.kind,'take_prize');assert.equal(g.pendingDecision.actor,1);scenarios++;}
 // Both attacks enforce their printed Lightning requirements without partial mutation.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.dce]);reject(g,0,'attack',{attackIndex:0});}
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.lightning,v.lightning,v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios+=2;}
}
console.log(`PASS Raichu Base and Base Set 2 Agility, Thunder, costs, protection timing, recoil and Prize flow (${scenarios} scenarios)`);
