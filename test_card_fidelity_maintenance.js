'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-83',pokemon:'base1-44',energy:'base1-99',trainer:'base1-91',format:'classic'},
 {id:'base4-112',pokemon:'base4-67',energy:'base4-127',trainer:'base4-122',format:'online-preview'}
];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=Array(56).fill(v.energy).concat(Array(4).fill(v.pokemon));
 const g=createGame({format:v.format,decks:[deck,deck],seed:83112});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[v.pokemon,v.energy,v.pokemon,v.energy];p.discard=[];p.prizes=Array(6).fill(v.energy);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,side)=>g.players[side];
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;

for(const v of variants){
 const card=CATALOG.get(v.id);
 assert.equal(card.name,'Maintenance');
 assert.equal(card.rules[0],'Shuffle 2 of the other cards from your hand into your deck in order to draw a card.');
 scenarios++;

 // WotC ruled Maintenance cannot be played without two other cards. The
 // rejected transaction must leave the trainer, hand, deck, and RNG intact.
 {
  const g=game(v);player(g,0).hand=[v.id,v.pokemon];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.match(r.error,/two other cards/i);assert.deepEqual(g,before);
  scenarios++;
 }

 // With exactly two other cards their return is forced: no chooser is needed.
 // The shuffle happens before the draw, even if the deck started empty.
 {
  const g=game(v);player(g,0).hand=[v.id,v.pokemon,v.energy];player(g,0).deck=[];
  const before=player(g,0).hand.slice();
  act(g,0,'play_trainer',{handIndex:0});
  const p=player(g,0);
  assert.equal(g.pendingDecision,null);
  assert.deepEqual(p.discard,[v.id]);
  assert.equal(p.hand.length,1);
  assert.equal(p.deck.length,1,'two cards are shuffled into an empty deck before drawing one');
  const total=[...p.hand,...p.deck,...p.discard].sort();
  assert.deepEqual(total,before.sort());
  scenarios++;
 }

 // More than two identical cards are equivalent choices and also resolve
 // automatically; the test uses exact card identities, not just card names.
 {
  const g=game(v);player(g,0).hand=[v.id,v.pokemon,v.pokemon,v.pokemon];
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null);
  assert.equal(player(g,0).hand.length,2,'one unselected card plus the draw remain in hand');
  assert.equal(player(g,0).deck.length,5);
  assert.equal(player(g,0).discard[0],v.id);
  scenarios++;
 }

 // Distinct options remain player-controlled and the acting player selects
 // exactly two cards, preserving the one card they chose to keep.
 {
  const g=game(v);player(g,0).hand=[v.id,v.pokemon,v.energy,v.trainer];
  act(g,0,'play_trainer',{handIndex:0});
  const d=g.pendingDecision;
  assert.equal(d.actor,0);assert.equal(d.kind,'cost');assert.equal(d.min,2);assert.equal(d.max,2);
  assert.deepEqual(d.options.map(o=>o.cardId),[v.pokemon,v.energy,v.trainer]);
  act(g,0,'choose',{decisionId:d.id,selected:['n:1','n:2']});
  assert.equal(g.pendingDecision,null);
  assert.equal(player(g,0).discard[0],v.id);
  assert.equal(player(g,0).hand.length,2,'one kept hand card plus the draw');
  assert.equal(player(g,0).deck.length,5,'selected two shuffle in, one card draws');
  scenarios++;
 }
}

console.log(`PASS Maintenance cost, draw, and automatic-choice fidelity (${scenarios} reducer scenarios)`);
