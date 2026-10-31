'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const baseNidoking=require('./cards/base1.json').find(c=>c.id==='base1-11');
const base2Nidoking=require('./cards/base4.json').find(c=>c.id==='base4-11');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format='classic',size=60){const d=size===40?deck.slice(0,40):deck;const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');}return g;}
function act(g,side,type,payload){let r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){let before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false);assert.deepEqual(g,before);}
function choose(g,side,selected){act(g,side,'choose',{decisionId:g.pendingDecision.id,selected});}
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 for(const id of ['base1-11','base4-11']){
  for(const already of [false,true]){
   const g=game(format,size);g.players[0].active=unit(id,Array(3).fill('base1-99'));g.players[1].active=unit('base1-2');
   if(already){g.players[1].active.poison=true;g.players[1].active.poisonDamage=10;}
   act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.poisonDamage,20);assert.equal(g.players[1].active.damage,40);assert.ok(g.message.some(x=>x.includes('takes 20 Poison damage')));
   act(g,1,'end_turn',{});assert.equal(g.players[1].active.damage,60);assert.ok(g.message.filter(x=>x.includes('takes 20 Poison damage')).length===2);
  }
  {const g=game(format,size);g.players[0].active.poison=true;g.players[0].active.poisonDamage=10;act(g,0,'end_turn',{});assert.equal(g.players[0].active.damage,10);assert.ok(g.message.some(x=>x.includes('takes 10 Poison damage')));}
  const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-98']);reject(g,0,'attack',{attackIndex:1});
 }
}
// Base Set and Base Set 2 have the same Thrash wording and costs. On tails,
// Metal Energy on non-Metal Nidoking reduces its self-damage twice: once as
// the attacker and once as the recipient. The second reduction must also
// prevent a would-be self-KO and Prize claim.
assert.deepEqual(baseNidoking.attacks[0].cost,['Grass','Colorless','Colorless']);
assert.equal(base2Nidoking.attacks[0].text,baseNidoking.attacks[0].text);
assert.deepEqual(base2Nidoking.attacks[0].cost,baseNidoking.attacks[0].cost);
assert.equal(base2Nidoking.attacks[1].text,baseNidoking.attacks[1].text);
assert.deepEqual(base2Nidoking.attacks[1].cost,baseNidoking.attacks[1].cost);
let thrashScenarios=0;
for(const [format,size] of [['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]){
 for(const id of ['base1-11','base4-11']){
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-96']);g.players[1].active=unit('base1-2');g.rngState=50000;
   act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'heads');assert.equal(g.players[1].active.damage,40);thrashScenarios++;
  }
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99']);g.players[1].active=unit('base1-2');reject(g,0,'attack',{attackIndex:0});thrashScenarios++;
  }
  for(const [rngState,flip,damage,selfDamage] of [[50000,'heads',40,0],[0,'tails',30,10]]){
   const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99']);g.players[1].active=unit('base1-2');g.rngState=rngState;
   act(g,0,'attack',{attackIndex:0});
   assert.equal(g.coinFlips.at(-1).result,flip);assert.equal(g.players[1].active.damage,damage);assert.equal(g.players[0].active.damage,selfDamage);
   thrashScenarios++;
  }
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99'],80);g.players[1].active=unit('base1-2');g.rngState=0;
   act(g,0,'attack',{attackIndex:0});
   assert.equal(g.players[0].active,null);assert.equal(g.players[1].active.damage,30);assert.equal(g.pendingAction.kind,'take_prize');assert.equal(g.pendingDecision.actor,1);
   thrashScenarios++;
  }
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99','neo1-19']);g.players[1].active=unit('base1-2');g.rngState=0;
   act(g,0,'attack',{attackIndex:0});
   assert.equal(g.coinFlips.at(-1).result,'tails');assert.equal(g.players[1].active.damage,20);assert.equal(g.players[0].active.damage,0);
   thrashScenarios++;
  }
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99','neo1-19'],80);g.players[1].active=unit('base1-2');g.rngState=0;
   act(g,0,'attack',{attackIndex:0});
   assert.equal(g.players[0].active.damage,80);assert.equal(g.players[1].active.damage,20);assert.equal(g.pendingAction,null);
   assert.equal(g.players[1].prizes.length,size===40?4:6);
   thrashScenarios++;
  }
 }
}
console.log(`PASS Nidoking Toxic and Thrash damage, Metal Energy double reduction, self-KO/Prize flow, and checkup (${thrashScenarios} Thrash scenarios)`);
