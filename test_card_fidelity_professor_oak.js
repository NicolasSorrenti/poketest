'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const variants=[
 {id:'base1-88',pokemon:'base1-44',format:'classic'},
 {id:'base4-116',pokemon:'base4-67',format:'online-preview'}
];
const fire='base1-98',grass='base1-99',bill='base1-91',oak2='base4-116';
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(v.id),...Array(4).fill(bill),...Array(48).fill(fire)];
 const g=createGame({format:v.format,decks:[deck,deck],seed:88116});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[fire,grass,bill];p.discard=[];p.prizes=Array(6).fill(fire);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,s)=>g.players[s];
function act(g,s,type,payload={}){const r=applyCommand(g,s,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id);
 assert.equal(card.name,'Professor Oak');
 assert.equal(card.rules[0],'Discard your hand, then draw 7 cards.');
 assert.deepEqual(CATALOG.get('base1-88').rules,CATALOG.get('base4-116').rules);
 scenarios++;
 // The played Oak is already committed to discard; every other card in hand
 // is discarded, then seven cards draw from the current deck top without a shuffle.
 {
  const g=game(v),p=player(g,0),foe=player(g,1);
  p.hand=[v.id,grass,bill,fire];p.deck=[fire,grass,bill,fire,grass,bill,fire,grass];
  foe.hand=[bill,fire];
  act(g,0,'play_trainer',{handIndex:0});
  const own=publicView(g,0),opp=publicView(g,1),after=player(g,0);
  assert.equal(g.pendingDecision,null);
  assert.equal(after.hand.length,7);
  assert.deepEqual(after.hand,[grass,fire,bill,grass,fire,bill,grass]);
  assert.equal(after.deck.length,1);
  assert.equal(after.discard.filter(id=>id===v.id).length,1);
  assert.equal(after.discard.filter(id=>id===grass).length,1);
  assert.equal(after.discard.filter(id=>id===bill).length,1);
  assert.equal(after.discard.filter(id=>id===fire).length,1);
  assert.deepEqual(opp.players[0].hand,undefined,'opponent cannot inspect actor hand');
  assert.deepEqual(own.players[1].hand,undefined,'actor cannot inspect opponent hand');
  assert.deepEqual(player(g,1).hand,[bill,fire]);
  scenarios++;
 }
 // WotC's rulebook says draw effects take all cards remaining and do not end
 // the game; inability to draw is only a loss at the beginning-of-turn draw.
 {
  const g=game(v),p=player(g,0);p.hand=[v.id,grass,bill];p.deck=[fire,grass];
  act(g,0,'play_trainer',{handIndex:0});
  const after=player(g,0);
  assert.deepEqual(after.hand,[grass,fire]);assert.equal(after.deck.length,0);
  assert.equal(g.over,false,'a draw effect that exhausts the deck is not an immediate loss');
  assert.equal(g.winner,null);assert.equal(g.pendingDecision,null);scenarios++;
 }
 {
  const g=game(v),p=player(g,0);p.hand=[v.id,bill];p.deck=[];
  act(g,0,'play_trainer',{handIndex:0});
  const after=player(g,0);
  assert.deepEqual(after.hand,[]);assert.deepEqual(after.discard,[v.id,bill]);
  assert.equal(g.over,false);assert.equal(g.pendingDecision,null);scenarios++;
 }
}
console.log(`PASS Professor Oak Base/Base Set 2 discard, draw order, privacy, and deck-out rules (${scenarios} reducer/protocol scenarios)`);
