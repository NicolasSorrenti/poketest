'use strict';
// Shared first-player decision used in RPG, solo, Cube and online battles.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {isBasicPokemon,countCards}=require('./core_rules');
const id={hit:'base1-7',rat:'base1-61',machop:'base1-52',seel:'base1-41',fight:'base1-97'};
const deck=[...Array(4).fill(id.hit),...Array(4).fill(id.rat),
 ...Array(4).fill(id.machop),...Array(4).fill(id.seel),...Array(44).fill(id.fight)];
function act(g,side,type,payload={}){
 const result=applyCommand(g,side,{type,payload});
 assert.ok(result.ok,type+': '+result.error);
}
const outcomes=new Set();
for(let seed=1;seed<=64;seed++){
 const g=createGame({decks:[deck,deck],names:['Host or hero','Guest or NPC'],format:'online-preview',seed});
 assert.equal(g.phase,'setup');
 assert.equal(g.coinFlips?.length||0,0,'Do not flip until setup is complete');
 const initialHand=[];
 for(let side=0;side<2;side++){
  const handIndex=g.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  assert.ok(handIndex>=0,'Setup must have a Basic Pokemon');
  act(g,side,'setup_select',{handIndex});
  initialHand[side]=g.players[side].hand.length;
  act(g,side,'setup_confirm');
 }
 if(g.mulliganBonus)act(g,g.mulliganBonus.side,'setup_bonus_draw',{count:0});
 assert.equal(g.phase,'game','Flip happens after setup and optional mulligan bonus');
 assert.equal(g.startingPlayer,g.turn);
 assert.equal(g.coinFlips.length,1,'Exactly one opening flip');
 const heads=g.coinFlips[0].result==='heads';
 assert.equal(g.turn,heads?0:1,'Heads selects seat zero, tails selects seat one');
 outcomes.add(g.turn);
 assert.ok(g.message.some(s=>s.includes('Opening coin flip:')&&s.includes(g.players[g.turn].name)));
 for(let side=0;side<2;side++){
  assert.equal(g.players[side].hand.length,initialHand[side]+(side===g.turn?1:0),'Only the starter takes the opening draw');
  assert.equal(countCards(g.players[side]),60,'Coin flip cannot duplicate or lose cards');
 }
 const host=publicView(g,0),guest=publicView(g,1);
 assert.equal(host.turn,guest.turn,'Both views agree on starting seat');
 assert.deepEqual(host.coinFlips,guest.coinFlips,'Both views show identical opening flip');
 assert.equal(host.players[1].hand,undefined,'Guest hand stays private');
 assert.equal(guest.players[0].hand,undefined,'Host hand stays private');
 assert.equal(g.round,1,'Opening round is one even if guest starts');
 const oldTurn=g.turn;
 act(g,oldTurn,'end_turn');
 assert.equal(g.turn,1-oldTurn);
 assert.equal(g.round,1,'Round cannot increase before both players have acted');
 act(g,g.turn,'end_turn');
 assert.equal(g.turn,oldTurn);
 assert.equal(g.round,2,'Round increases when the starter gets the next turn');
}
assert.deepEqual([...outcomes].sort(),[0,1],'Both seats must be able to win the opening flip');
console.log('PASS opening coin flip: both seats, first draw, public sync, hidden information and correct round progression');
