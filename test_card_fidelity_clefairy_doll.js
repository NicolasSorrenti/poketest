'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const RULES=require('./core_rules');
const {list}=require('./authentic_decks');
const configs=[
 {format:'classic',size:60},
 {format:'neo-theme',size:60},
 {format:'online-preview',size:60},
 {format:'online-preview',size:40}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:19});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);assert.deepEqual(g,before,'rejected command must be atomic');}
function seedFor(heads){for(let seed=0;seed<10000;seed++){let x=seed;const result=[];for(let i=0;i<heads.length;i++){x=(Math.imul(x,1664525)+1013904223)>>>0;result.push(x>=0x80000000);}if(result.every((x,i)=>x===heads[i]))return seed;}throw Error('coin sequence not found');}
let scenarios=0;
const doll=CATALOG.get('base1-70');
assert.equal(doll.name,'Clefairy Doll');assert.equal(doll.supertype,'Trainer');assert.equal(doll.hp,'10');assert.deepEqual(doll.subtypes,[]);assert.deepEqual(doll.attacks,[]);assert.equal(RULES.isBasicPokemon(doll),false);scenarios++;
for(const {format,size} of configs){
 // It is a Trainer in hand: it cannot start the game or be benched as an
 // ordinary Basic, and must resolve through the Trainer-play command.
 {const g=game(format,size);g.phase='setup';g.players[0].active=null;g.players[0].hand=['base1-70'];reject(g,0,'setup_select',{handIndex:0});scenarios++;}
 {const g=game(format,size);g.players[0].hand=['base1-70'];reject(g,0,'bench',{handIndex:0});act(g,0,'play_trainer',{handIndex:0});assert.equal(g.players[0].bench[0].id,'base1-70');assert.equal(g.players[0].bench[0].cardOwnerSide,0);assert.ok(!g.players[0].discard.includes('base1-70'));scenarios++;}
 // No attacks and no retreat, even though the Doll occupies a Pokémon slot.
 {const g=game(format,size);g.players[0].active=unit('base1-70');reject(g,0,'attack',{attackIndex:0});g.players[0].bench=[unit('base1-58')];reject(g,0,'retreat',{slot:0});scenarios++;}
 // Printed Special Condition immunity also blocks no-damage attack effects.
 {const g=game(format,size);g.players[0].active=unit('base1-5',['base1-96']);g.players[1].active=unit('base1-70');g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.status,null);scenarios++;}
 // Poison is an attack effect independent from damage; Defender prevents the
 // damage but the Doll still cannot become Poisoned.
 {const g=game(format,size);g.players[0].active=unit('base1-69',['base1-99']);g.players[1].active=unit('base1-70');g.players[1].active.attachedTrainers=[{id:'base1-80',expires:99}];g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.poison,false);assert.equal(g.players[1].active.status,null);scenarios++;}
 // A Knocked Out Doll leaves play and requires the usual replacement, but it
 // is not a Knocked Out Pokémon for Prize purposes.
 {const g=game(format,size);g.players[0].active=unit('base1-7',['base1-97']);g.players[1].active=unit('base1-70');g.players[1].bench=[unit('base1-58')];const prizes=g.players[0].prizes.length;act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].prizes.length,prizes);assert.notEqual(g.pendingAction?.kind,'take_prize');assert.equal(g.players[1].active.id,'base1-58');assert.ok(g.players[1].discard.includes('base1-70'));scenarios++;}
 // The owner may discard a Benched Doll before attacking; its attachments go
 // to discard with it and the Active Pokémon stays put.
 {const g=game(format,size);g.players[0].active=unit('base1-3');g.players[0].bench=[unit('base1-70',['base1-99'])];act(g,0,'discard_clefairy_doll',{slot:0});assert.equal(g.players[0].bench.length,0);assert.equal(g.players[0].active.id,'base1-3');assert.ok(g.players[0].discard.includes('base1-70'));assert.ok(g.players[0].discard.includes('base1-99'));scenarios++;}
 // Discarding an Active Doll promotes the only Bench Pokémon automatically.
 {const g=game(format,size);g.players[0].active=unit('base1-70');g.players[0].bench=[unit('base1-58')];act(g,0,'discard_clefairy_doll',{slot:-1});assert.equal(g.players[0].active.id,'base1-58');assert.equal(g.pendingAction,null);assert.ok(g.players[0].discard.includes('base1-70'));scenarios++;}
 // Multiple promotion options belong to the Doll owner; an Active Doll with
 // no replacement and a non-Doll Pokémon cannot use this action.
 {const g=game(format,size);g.players[0].active=unit('base1-70');g.players[0].bench=[unit('base1-58'),unit('base1-44')];act(g,0,'discard_clefairy_doll',{slot:-1});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2);scenarios++;}
 {const g=game(format,size);g.players[0].active=unit('base1-70');act(g,0,'discard_clefairy_doll',{slot:-1});assert.equal(g.over,true);assert.equal(g.winner,1);assert.ok(g.players[0].discard.includes('base1-70'));const other=game(format,size);reject(other,0,'discard_clefairy_doll',{slot:-1});scenarios++;}
 if(format==='classic'){
  // Zone identity matters: Clefairy Doll is Trainer in discard, so Old Rod
  // recovers it only on the both-tails Trainer result, never both-heads.
  for(const heads of [false,true]){const g=game(format,size);g.players[0].hand=['neo3-64'];g.players[0].discard=['base1-70'];g.rngState=seedFor([heads,heads]);act(g,0,'play_trainer',{handIndex:0});if(heads){assert.equal(g.pendingDecision,null);assert.ok(g.players[0].discard.includes('base1-70'));}else{assert.ok(g.pendingDecision.options.some(o=>o.cardId==='base1-70'));act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['disc:0']});assert.ok(g.players[0].hand.includes('base1-70'));}scenarios++;}
  // Rocket's Minefield Gym also triggers because the Doll becomes a Basic
  // Pokémon while it is being played from hand.
  for(const heads of [false,true]){const g=game(format,size);g.stadium={id:'gym2-119',owner:0};g.players[0].stadium='gym2-119';g.players[0].hand=['base1-70'];g.rngState=seedFor([heads]);act(g,0,'play_trainer',{handIndex:0});if(heads){assert.equal(g.players[0].bench[0].id,'base1-70');assert.equal(g.players[0].bench[0].damage,0);}else{assert.equal(g.players[0].bench.length,0);assert.ok(g.players[0].discard.includes('base1-70'));assert.equal(g.players[1].prizes.length,size===40?4:6);}scenarios++;}
  // Historical Chaos Gym interaction: the Doll is a Trainer when played,
  // so it flips and may be reused by the opponent as their own Pokémon.
  {const g=game(format,size);g.stadium={id:'gym2-102',owner:0};g.players[0].stadium='gym2-102';g.players[0].hand=['base1-70'];g.players[1].bench=[];g.rngState=seedFor([false]);act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.kind,'chaos-redirect');assert.equal(g.pendingDecision.actor,1);assert.ok(g.players[0].discard.includes('base1-70'));act(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['choice:use']});assert.equal(g.players[1].bench[0].id,'base1-70');assert.equal(g.players[1].bench[0].cardOwnerSide,0);assert.ok(!g.players[0].discard.includes('base1-70'));scenarios++;}
  {const g=game(format,size);g.stadium={id:'gym2-102',owner:0};g.players[0].stadium='gym2-102';g.players[0].hand=['base1-70'];g.rngState=seedFor([true]);act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[0].bench[0].id,'base1-70');scenarios++;}
  {const g=game(format,size);g.players[0].active=unit('base1-7',['base1-97']);g.players[1].active=unit('base1-70');g.players[1].active.cardOwnerSide=0;g.players[1].bench=[unit('base1-58')];act(g,0,'attack',{attackIndex:0});assert.ok(g.players[0].discard.includes('base1-70'));assert.ok(!g.players[1].discard.includes('base1-70'));assert.equal(g.players[0].prizes.length,size===40?4:6);assert.equal(g.players[1].active.id,'base1-58');scenarios++;}
  {const g=game(format,size);g.turn=1;g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-70')];g.players[1].bench[0].cardOwnerSide=0;g.players[1].hand=['base1-78'];act(g,1,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,1);act(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['slot:0']});assert.ok(g.players[0].hand.includes('base1-70'));assert.ok(!g.players[1].hand.includes('base1-70'));scenarios++;}
  // If the opponent's Bench is full, the redirected Doll cannot be used.
  {const g=game(format,size);g.stadium={id:'gym2-102',owner:0};g.players[0].stadium='gym2-102';g.players[0].hand=['base1-70'];g.players[1].bench=Array.from({length:5},()=>unit('base1-58'));g.rngState=seedFor([false]);act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision,null);assert.ok(g.players[0].discard.includes('base1-70'));scenarios++;}
 }
}
console.log(`PASS Clefairy Doll Basic setup, status/attack restrictions, no-Prize Knock Out, voluntary discard and promotion (${scenarios} reducer scenarios)`);
