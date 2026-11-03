'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {scoop:'base1-78',basic:'base1-46',format:'classic'},
 {scoop:'base4-107',basic:'base4-69',format:'online-preview'}
];
const energy='base1-98';
const unit=(id,opts={})=>({
 id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0,...opts
});
function game(v){
 const deck=Array(56).fill(energy).concat(Array(4).fill(v.basic));
 const g=createGame({format:v.format,decks:[deck,deck],seed:78107});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){
  p.active=unit(v.basic);p.bench=[];p.hand=[];p.deck=[v.basic,energy];
  p.discard=[];p.prizes=Array(6).fill(energy);p.prizeFaceUp=Array(6).fill(false);
  p.energyUsed=false;p.turnPlays=[];p.retreated=false;
 }
 return g;
}
function act(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;
}
let scenarios=0;
for(const v of variants){
 assert.equal(CATALOG.get(v.scoop).name,'Scoop Up');
 assert.equal(CATALOG.get(v.scoop).rules[0],
  'Choose 1 of your Pokémon in play and return its Basic Pokémon card to your hand. (Discard all cards attached to that card.)');
 scenarios++;

 // The sole Pokémon in play is a forced target, not a meaningful player choice.
 // The printed effect cannot be declined, and the result is a loss because
 // the actor no longer has any Pokémon in play.
 {
  const g=game(v),p=g.players[0];
  p.hand=[v.scoop];p.active=unit(v.basic,{energies:[energy],damage:20});
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null);
  assert.equal(p.active,null);
  assert.deepEqual(p.hand,[v.basic]);
  assert.ok(p.discard.includes(v.scoop));
  assert.ok(p.discard.includes(energy));
  assert.equal(g.over,true);
  assert.equal(g.winner,1);
  scenarios++;
 }
 // Benched Stage 2 returns its original Basic only. Its Stage 1, Stage 2,
 // Energy and attached Trainer are discarded, and damage disappears.
 {
  const g=game(v),p=g.players[0];
  p.hand=[v.scoop];
  p.bench=[unit('base1-4',{
   under:['base1-24',v.basic],energies:[energy],attachedTrainers:[{id:'base1-84'}],damage:80
  })];
  act(g,0,'play_trainer',{handIndex:0});
  const d=g.pendingDecision;
  assert.ok(d);assert.equal(d.actor,0);assert.equal(d.kind,'target');
  assert.deepEqual(d.options.map(o=>o.id),['slot:-1','slot:0']);
  act(g,0,'choose',{decisionId:d.id,selected:['slot:0']});
  assert.equal(g.pendingDecision,null);
  assert.deepEqual(p.hand,[v.basic]);
  assert.equal(p.bench.length,0);
  for(const card of [v.scoop,'base1-4','base1-24',energy,'base1-84']){
   assert.ok(p.discard.includes(card),`Missing discarded ${card}`);
  }
  assert.ok(!p.discard.includes(v.basic),'The Basic must return to hand');
  assert.equal(p.active.id,v.basic,'Scooping a Benched Pokémon does not change Active');
  scenarios++;
 }
 // Picking up a damaged Basic from the Bench returns it without damage,
 // status, Energy or attached Trainers. It must not touch the opponent.
 {
  const g=game(v),p=g.players[0],op=g.players[1];
  p.hand=[v.scoop];p.bench=[unit(v.basic,{energies:[energy],damage:20,poison:true})];
  const other=structuredClone(op);
  act(g,0,'play_trainer',{handIndex:0});
  const d=g.pendingDecision;
  assert.ok(d);act(g,0,'choose',{decisionId:d.id,selected:['slot:0']});
  assert.deepEqual(p.hand,[v.basic]);
  assert.ok(p.discard.includes(energy));
  assert.deepEqual(op,other,'Opponent must not be affected');
  scenarios++;
 }
}
console.log(`PASS Scoop Up Base/Base Set 2 Basic return, discard, target ownership and forced-choice handling (${scenarios} scenarios)`);
