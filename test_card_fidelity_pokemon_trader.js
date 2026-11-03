'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const variants=[
 {trader:'base1-77',offered:'base1-44',found:'base1-46',energy:'base1-99',format:'classic'},
 {trader:'base4-106',offered:'base4-67',found:'base4-69',energy:'base4-127',format:'online-preview'}
];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
const act=(g,side,type,payload={})=>{
 const r=applyCommand(g,side,{type,payload});
 assert.ok(r.ok,`${type}: ${r.error}`);
 return r;
};
let scenarios=0;
for(const v of variants){
 assert.match(CATALOG.get(v.trader).rules.join(' '),/Show both cards to your opponent/);
 const make=()=>{
  const deck=Array(56).fill(v.energy).concat(Array(4).fill(v.offered));
  const g=createGame({format:v.format,decks:[deck,deck],seed:77106});
  g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
  for(const p of g.players){
   p.active=unit(v.offered);p.bench=[];p.hand=[];p.deck=[v.energy,v.found,v.energy];
   p.discard=[];p.prizes=Array(6).fill(v.energy);p.prizeFaceUp=Array(6).fill(false);
   p.energyUsed=false;p.turnPlays=[];p.retreated=false;
  }
  return g;
 };
 // The selected Pokémon in hand and the found Pokémon in the deck must
 // both be revealed publicly; no other deck card may be disclosed.
 {
  const g=make(),p=g.players[0];
  p.hand=[v.trader,v.offered];
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision?.actor,0);
  assert.equal(g.pendingDecision?.kind,'trade');
  act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['n:1']});
  assert.equal(g.pendingDecision?.actor,0);
  assert.equal(g.pendingDecision?.kind,'find');
  assert.equal(g.pendingDecision.options.length,1);
  act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['deck:1']});
  assert.equal(g.pendingDecision,null);
  assert.deepEqual(p.hand,[v.found]);
  assert.deepEqual(p.discard,[v.trader]);
  assert.equal(p.deck.length,3);
  assert.equal(p.deck.filter(id=>id===v.offered).length,1);
  assert.equal(p.deck.filter(id=>id===v.found).length,0);
  const messages=g.message.filter(line=>line.includes('Pokémon Trader revealed'));
  assert.equal(messages.length,1);
  assert.ok(messages[0].includes(CATALOG.get(v.offered).name));
  assert.ok(messages[0].includes(CATALOG.get(v.found).name));
  assert.ok(!messages[0].includes(CATALOG.get(v.energy).name));
  if(v.format==='online-preview'){
   const shown=g.matchFeed.filter(entry=>entry.kind==='message'&&entry.text.includes('Pokémon Trader revealed'));
   assert.equal(shown.length,1,'The online public match feed must receive both names');
  }
  scenarios++;
 }
 // Trainer must not be consumed when the player has no Pokémon to trade.
 {
  const g=make();g.players[0].hand=[v.trader,v.energy];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.deepEqual(g,before);scenarios++;
 }
 // A deck without Pokémon makes the exchange illegal, with no information leak.
 {
  const g=make();g.players[0].hand=[v.trader,v.offered];g.players[0].deck=[v.energy,v.energy];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.deepEqual(g,before);scenarios++;
 }
}
console.log(`PASS Pokémon Trader public reveal, exchange and illegal-play atomicity (${scenarios} scenarios)`);
