'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-91',pokemon:'base1-44',format:'classic'},
 {id:'base4-118',pokemon:'base4-67',format:'online-preview'}
];
const fire='base1-98',grass='base1-99';
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(v.id),...Array(4).fill(fire),...Array(48).fill(grass)];
 const g=createGame({format:v.format,decks:[deck,deck],seed:59118});
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
 assert.equal(card.name,'Bill');
 assert.deepEqual(card.rules,['Draw 2 cards.']);
 const g=game(v);
 g.players[0].hand=[v.id];g.players[1].hand=[grass];g.players[1].deck=[fire,grass];
 const opponentHand=[...g.players[1].hand],opponentDeck=[...g.players[1].deck];
 act(g,0,'play_trainer',{handIndex:0});
 // applyCommand replaces game.players transactionally; read fresh player objects.
 const p=g.players[0],foe=g.players[1];
 assert.equal(g.pendingDecision,null,'Bill has no target or card-choice prompt');
 assert.deepEqual(p.hand,[grass,fire],'Bill draws exactly two cards in deck-top order');
 assert.deepEqual(p.deck,[]);
 assert.deepEqual(p.discard,[v.id],'Bill is discarded after resolving');
 assert.deepEqual(foe.hand,opponentHand);
 assert.deepEqual(foe.deck,opponentDeck);
 scenarios++;
}
console.log(`PASS Bill Base/Base Set 2 draw count, ownership, and no-choice resolution (${scenarios} scenarios)`);
