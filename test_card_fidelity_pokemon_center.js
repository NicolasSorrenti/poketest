'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {center:'base1-85',format:'classic'},
 {center:'base4-114',format:'online-preview'}
];
const chansey='base1-3',gyarados='base1-6',blastoise='base1-2';
const fire='base1-98',dce='base1-96',recycle='neo1-105';
const unit=(id,damage=0,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=Array(56).fill(fire).concat(Array(4).fill(chansey));
 const g=createGame({format:v.format,decks:[deck,deck],seed:85114});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(chansey);p.bench=[];p.hand=[];p.deck=[chansey,fire,gyarados,blastoise];p.discard=[];p.prizes=Array(6).fill(fire);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,side)=>g.players[side];
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;

for(const v of variants){
 const card=CATALOG.get(v.center);
 assert.equal(card.name,'Pokémon Center');
 assert.equal(card.rules[0],'Remove all damage counters from all of your own Pokémon with damage counters on them, then discard all Energy cards attached to those Pokémon.');
 assert.deepEqual(CATALOG.get('base1-85').rules,CATALOG.get('base4-114').rules);
 scenarios++;

 // “All” and “then” make the effect mandatory and global: it resolves on the
 // Active and every damaged Benched Pokémon without asking for targets. Energy
 // on an undamaged Pokémon stays attached; the opponent is never affected.
 {
  const g=game(v);let p=player(g,0),foe=player(g,1);
  p.active=unit(chansey,70,[fire,dce]);
  p.bench=[unit(gyarados,20,[fire]),unit(blastoise,0,[dce]),unit(chansey,10,[])];
  foe.active=unit(blastoise,30,[fire]);foe.bench=[unit(chansey,0,[dce])];
  p.hand=[v.center];
  act(g,0,'play_trainer',{handIndex:0});
  p=player(g,0);foe=player(g,1);
  assert.equal(g.pendingDecision,null,'global effect does not prompt for choices');
  assert.equal(p.active.damage,0);assert.deepEqual(p.active.energies,[]);
  assert.equal(p.bench[0].damage,0);assert.deepEqual(p.bench[0].energies,[]);
  assert.equal(p.bench[1].damage,0);assert.deepEqual(p.bench[1].energies,[dce],'undamaged Pokémon keeps its Energy');
  assert.equal(p.bench[2].damage,0);assert.deepEqual(p.bench[2].energies,[],'damaged Pokémon with no Energy is still healed');
  assert.equal(foe.active.damage,30);assert.deepEqual(foe.active.energies,[fire]);
  assert.equal(foe.bench[0].damage,0);assert.deepEqual(foe.bench[0].energies,[dce]);
  assert.equal(p.discard.filter(id=>id===fire).length,2);
  assert.equal(p.discard.filter(id=>id===dce).length,1);
  assert.equal(p.discard.filter(id=>id===v.center).length,1,'the Trainer itself is discarded once');
  scenarios++;
 }

 // Recycle Energy's own rule applies when Pokémon Center discards it from a
 // damaged Pokémon. A copy on an undamaged Pokémon remains in play.
 {
  const g=game(v);let p=player(g,0);
  p.active=unit(chansey,10,[recycle,fire]);
  p.bench=[unit(gyarados,0,[recycle])];p.hand=[v.center];
  act(g,0,'play_trainer',{handIndex:0});
  p=player(g,0);
  assert.equal(p.active.damage,0);assert.deepEqual(p.active.energies,[]);
  assert.deepEqual(p.bench[0].energies,[recycle]);
  assert.equal(p.hand.filter(id=>id===recycle).length,1,'discarded Recycle Energy returns to hand');
  assert.equal(p.discard.filter(id=>id===recycle).length,0);
  assert.equal(g.pendingDecision,null);
  scenarios++;
 }
}

console.log(`PASS Pokémon Center Base/Base Set 2 scope, mandatory board healing, Energy loss, and Recycle Energy interaction (${scenarios} reducer scenarios)`);
