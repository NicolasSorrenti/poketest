'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const variants=[
 {id:'base1-20',pikachu:'base1-58',lightning:'base1-100',water:'base1-102',dce:'base1-96',colorless:'base1-99',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-24',pikachu:'base4-87',lightning:'base4-128',water:'base4-130',dce:'base4-124',colorless:'base4-127',formats:[['online-preview',60],['online-preview',40]]}
];
function unit(id,energies=[],damage=0,status=null){return {id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0};}
function game(format,size,v){const deck=[...Array(4).fill(v.id),...Array(4).fill(v.pikachu),...Array(52).fill(v.colorless)].slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit(v.id);p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.colorless);p.prizes=Array(size===40?4:6).fill(v.colorless);}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload={}){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
function choose(g,side,selected){act(g,side,'choose',{decisionId:g.pendingDecision.id,selected});}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Thundershock coin outcomes: heads adds Paralysis after applying Lightning Weakness; tails does not.
 for(const [seed,status] of [[50000,'Paralyzed'],[0,null]]){const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning]);g.players[1].active=unit('base1-2',[v.water,v.water,v.water]);g.rngState=seed;act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.status,status);scenarios++;}
 // Preventing damage alone does not suppress Thundershock's separate paralysis effect.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning]);g.players[1].active=unit('base1-2',[v.water,v.water,v.water]);g.players[1].active.shield={preventDamage:true,expires:5};g.rngState=50000;act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,'Paralyzed');scenarios++;}
 // Paralyzed defender cannot attack and clears Paralyzed after its own turn.
 {const g=game(format,size,v);g.players[1].active=unit('base1-2',[v.water,v.water,v.water],0,'Paralyzed');g.turn=1;g.turnSerial=5;reject(g,1,'attack',{attackIndex:0});act(g,1,'end_turn',{});assert.notEqual(g.players[1].active?.status,'Paralyzed');scenarios++;}
 // Thunderpunch heads deals 40 before Lightning Weakness and has no recoil.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning,v.dce]);g.players[1].active=unit('base1-2');g.rngState=50000;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,80);assert.equal(g.players[0].active.damage,0);scenarios++;}
 // Tails deals 30 before Weakness and 10 recoil; a damage-only shield blocks the target, not the recoil.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning,v.dce]);g.players[1].active=unit('base1-2');g.players[1].active.shield={preventDamage:true,expires:5};g.rngState=0;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].active.damage,10);scenarios++;}
 // Thunderpunch recoil can Knock Out Electabuzz and awards the opponent a Prize.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning,v.dce],60);g.players[1].active=unit('base1-2');g.rngState=0;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active,null);assert.equal(g.pendingAction.kind,'take_prize');assert.equal(g.pendingDecision.actor,1);scenarios++;}
 // If tails Knocks Out both Actives, Prize prompts are queued for each player in turn.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning,v.dce],60);g.players[1].active=unit(v.pikachu,[],10);g.rngState=0;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active,null);assert.equal(g.players[1].active,null);assert.equal(g.pendingDecision.actor,1);choose(g,1,['prize:0']);assert.equal(g.pendingDecision.actor,0);scenarios++;}
 // DCE pays only Colorless; Lightning remains a required typed unit.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.dce]);reject(g,0,'attack',{attackIndex:0});reject(g,0,'attack',{attackIndex:1});scenarios+=2;}
 // Thunderpunch rejects a lone Lightning without its Colorless unit.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.lightning]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
}
console.log(`PASS Electabuzz Thundershock/Thunderpunch coin, status, shield, recoil and simultaneous KO scenarios (${scenarios})`);
