'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-93',pokemon:'base1-44',format:'classic'},
 {id:'base4-120',pokemon:'base4-67',format:'online-preview'}
];
const fire='base1-98',grass='base1-99';
const unit=(id,status=null,poison=false)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status,poison,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(v.id),...Array(4).fill(fire),...Array(48).fill(grass)];
 const g=createGame({format:v.format,decks:[deck,deck],seed:59312});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){
  p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[fire,grass];p.discard=[];
  p.prizes=Array(6).fill(fire);p.prizeFaceUp=Array(6).fill(false);
  p.energyUsed=false;p.turnPlays=[];p.retreated=false;
 }
 return g;
}
function act(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.ok(r.ok,`${type}: ${r.error}`);
 return r;
}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id);
 assert.equal(card.name,'Gust of Wind');
 assert.deepEqual(card.rules,["Choose 1 of your opponent's Benched Pokémon and switch it with his or her Active Pokémon."]);
 // Sole target is forced; clear conditions from the Active as it moves to Bench.
 {
  const g=game(v),player=g.players[0],foe=g.players[1];
  player.hand=[v.id];
  foe.active=unit('base1-46','Asleep',true);
  foe.bench=[unit('base1-56')];
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null,'one opposing Benched Pokémon needs no target prompt');
  assert.equal(foe.active.id,'base1-56','the chosen Benched Pokémon becomes Active');
  assert.equal(foe.bench[0].id,'base1-46','the former Active moves to the Bench');
  assert.equal(foe.bench[0].status,null,'conditions clear when the former Active is Benched');
  assert.equal(foe.bench[0].poison,false,'Poison clears when the former Active is Benched');
  assert.deepEqual(player.discard,[v.id]);
  scenarios++;
 }
 // With multiple candidates, the player using Gust owns the target choice.
 {
  const g=game(v),player=g.players[0],foe=g.players[1];
  player.hand=[v.id];
  foe.active=unit('base1-46');foe.bench=[unit('base1-56'),unit('base1-47')];
  act(g,0,'play_trainer',{handIndex:0});
  const d=g.pendingDecision;
  assert.ok(d,'multiple opposing Benched Pokémon retain the target prompt');
  assert.equal(d.actor,0,'the Gust player chooses the replacement');
  assert.deepEqual(d.options.map(o=>o.id),['bench:0','bench:1']);
  act(g,0,'choose',{decisionId:d.id,selected:['bench:1']});
  assert.equal(g.pendingDecision,null);
  assert.equal(foe.active.id,'base1-47','the selected target becomes Active');
  assert.deepEqual(foe.bench.map(u=>u.id),['base1-56','base1-46']);
  scenarios++;
 }
}
console.log(`PASS Gust of Wind Base/Base Set 2 target ownership, sole-target auto-resolution and switching cleanup (${scenarios} reducer scenarios)`);
