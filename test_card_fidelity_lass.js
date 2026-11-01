'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');

const variants=[
 {lass:'base1-75',pokemon:'base1-44',energy:'base1-99',trainer:'base1-91'},
 {lass:'base4-104',pokemon:'base4-67',energy:'base4-127',trainer:'base4-122'}
];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v,format='classic'){
 const deck=Array(56).fill(v.energy).concat(Array(4).fill(v.pokemon));
 const g=createGame({format,decks:[deck,deck],seed:750104});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[v.pokemon,v.energy,v.pokemon,v.energy];p.discard=[];p.prizes=Array(6).fill(v.energy);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function player(g,side){return g.players[side];}
function act(g,side,type,payload={}){const result=applyCommand(g,side,{type,payload});assert.ok(result.ok,`${type}: ${result.error}`);return result;}
function names(ids){return ids.map(id=>CATALOG.get(id).name);}
let scenarios=0;

for(const v of variants){
 const format=v.lass==='base1-75'?'classic':'online-preview';
 const card=CATALOG.get(v.lass);
 assert.equal(card.name,'Lass');
 assert.equal(card.rules[0],'You and your opponent show each other your hands, then shuffle all the Trainer cards from your hands into your decks.');
 scenarios++;

 // The player plays Lass from hand; both remaining hands are revealed, while
 // only Trainers (not Pokémon or Energy) are shuffled into their own decks.
 {
  const g=game(v,format);
  player(g,0).hand=[v.lass,v.pokemon,v.trainer,v.energy];
  player(g,1).hand=[v.pokemon,v.trainer,v.energy];
  const before0=player(g,0).deck.slice(),before1=player(g,1).deck.slice();
  act(g,0,'play_trainer',{handIndex:0});
  const p=player(g,0),f=player(g,1),view0=publicView(g,0),view1=publicView(g,1);
  const reveal=view0.messages.find(m=>m.includes('Lass revealed both hands'));
  assert.ok(reveal,'the hand reveal is recorded');
  assert.ok(reveal.includes(`Player 1: ${names([v.pokemon,v.trainer,v.energy]).join(', ')}`));
  assert.ok(reveal.includes(`Player 2: ${names([v.pokemon,v.trainer,v.energy]).join(', ')}`));
  assert.ok(view1.messages.includes(reveal),'both players can see the same revealed hands');
  if(format==='online-preview')assert.ok(g.matchFeed.some(event=>event.text===reveal),'online match feed exposes the reveal to the opponent');
  assert.deepEqual(names(p.hand),[CATALOG.get(v.pokemon).name,CATALOG.get(v.energy).name]);
  assert.deepEqual(names(f.hand),[CATALOG.get(v.pokemon).name,CATALOG.get(v.energy).name]);
  assert.deepEqual(p.discard,[v.lass]);
  assert.ok(p.deck.includes(v.trainer));assert.ok(f.deck.includes(v.trainer));
  assert.equal(p.deck.length,before0.length+1);assert.equal(f.deck.length,before1.length+1);
  assert.equal(g.pendingDecision,null);
  scenarios++;
 }

 // The historical WotC ruling says an owner with no Trainer cards does not
 // shuffle. Both hands still reveal, and neither deck nor RNG is touched.
 {
  const g=game(v,format),before0=player(g,0).deck.slice(),before1=player(g,1).deck.slice(),rng=g.rngState;
  player(g,0).hand=[v.lass,v.pokemon,v.energy];
  player(g,1).hand=[v.pokemon,v.energy];
  act(g,0,'play_trainer',{handIndex:0});
  assert.deepEqual(player(g,0).deck,before0);
  assert.deepEqual(player(g,1).deck,before1);
  assert.equal(g.rngState,rng,'no shuffle means no RNG consumption');
  const reveal=publicView(g,1).messages.find(m=>m.includes('Lass revealed both hands'));
  assert.ok(reveal.includes(CATALOG.get(v.pokemon).name));
  assert.ok(reveal.includes(CATALOG.get(v.energy).name));
  assert.deepEqual(player(g,0).discard,[v.lass]);
  assert.equal(g.pendingDecision,null);
  scenarios++;
 }

 // If only the opponent has Trainer cards, their deck receives them while
 // the actor's no-Trainer deck is left byte-for-byte in its prior order.
 {
  const g=game(v,format),before0=player(g,0).deck.slice(),before1=player(g,1).deck.slice();
  player(g,0).hand=[v.lass,v.pokemon,v.energy];
  player(g,1).hand=[v.pokemon,v.trainer,v.energy];
  act(g,0,'play_trainer',{handIndex:0});
  assert.deepEqual(player(g,0).deck,before0);
  assert.equal(player(g,1).deck.length,before1.length+1);
  assert.ok(player(g,1).deck.includes(v.trainer));
  assert.deepEqual(names(player(g,1).hand),[CATALOG.get(v.pokemon).name,CATALOG.get(v.energy).name]);
  scenarios++;
 }
}

console.log(`PASS Lass hand-reveal and conditional-shuffle fidelity (${scenarios} reducer/protocol scenarios)`);
