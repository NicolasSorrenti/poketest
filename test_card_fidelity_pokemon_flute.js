'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {flute:'base1-86',pokemon:'base1-44',format:'classic'},
 {flute:'base1-86',pokemon:'base4-67',format:'online-preview'}
];
const energy='base1-98';
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=Array(56).fill(energy).concat(Array(4).fill(v.pokemon));
 const g=createGame({format:v.format,decks:[deck,deck],seed:86115});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[v.pokemon,energy];p.discard=[];p.prizes=Array(6).fill(energy);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,side)=>g.players[side];
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;

for(const v of variants){
 const card=CATALOG.get(v.flute);
 assert.equal(card.name,'Pokémon Flute');
 assert.equal(card.rules[0],"Choose 1 Basic Pokémon card from your opponent's discard pile and put it onto his or her Bench. (You can't play Pokémon Flute if your opponent's Bench is full.)");
 scenarios++;

 // The card itself explicitly forbids play when the opponent's Bench is full.
 // Rejection must leave the hand, discard pile, and target Bench unchanged.
 {
  const g=game(v),p=player(g,0),foe=player(g,1);
  foe.bench=Array.from({length:5},()=>unit(v.pokemon));foe.discard=[v.pokemon];p.hand=[v.flute];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.match(r.error,/full.*bench/i);assert.deepEqual(g,before);
  scenarios++;
 }

 // Narrow Gym reduces the usable Bench capacity to four. Pokémon Flute must
 // reject at four just as it rejects at five without the Stadium.
 {
  const g=game(v),p=player(g,0),foe=player(g,1);
  g.stadium={id:'gym1-124'};foe.bench=Array.from({length:4},()=>unit(v.pokemon));foe.discard=[v.pokemon];p.hand=[v.flute];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.match(r.error,/full.*bench/i);assert.deepEqual(g,before);
  scenarios++;
 }

 // With a free slot, the player of Pokémon Flute chooses a Basic from the
 // opponent's public discard pile, and that Pokémon is placed on the opponent's
 // Bench—not the actor's Bench.
 {
  const g=game(v),p=player(g,0),foe=player(g,1);
  foe.bench=Array.from({length:4},()=>unit(v.pokemon));foe.discard=[v.pokemon];p.hand=[v.flute];
  act(g,0,'play_trainer',{handIndex:0});
  const decision=g.pendingDecision;
  assert.ok(decision);assert.equal(decision.actor,0);assert.equal(decision.kind,'recover');
  assert.deepEqual(decision.options.map(o=>o.cardId),[v.pokemon]);
  act(g,0,'choose',{decisionId:decision.id,selected:[decision.options[0].id]});
  const after=player(g,1),actor=player(g,0);
  assert.equal(after.bench.length,5);assert.equal(after.bench[4].id,v.pokemon);
  assert.deepEqual(after.discard,[]);assert.equal(actor.bench.length,0);
  assert.deepEqual(actor.discard,[v.flute]);assert.equal(g.pendingDecision,null);
  scenarios++;
 }
}

console.log(`PASS Pokémon Flute Base full-Bench eligibility and opponent Bench placement (${scenarios} reducer scenarios)`);
