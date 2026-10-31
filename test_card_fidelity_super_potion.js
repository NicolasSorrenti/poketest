'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const variants=[
 {id:'base1-90',pokemon:'base1-44',format:'classic'},
 {id:'base4-117',pokemon:'base4-67',format:'online-preview'}
];
const dce='base1-96',fire='base1-98',grass='base1-99';
const unit=(id,damage=0,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(v.id),...Array(4).fill(fire),...Array(48).fill(grass)];
 const g=createGame({format:v.format,decks:[deck,deck],seed:90117});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[fire];p.discard=[];p.prizes=Array(6).fill(fire);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,s)=>g.players[s];
function act(g,s,type,payload={}){const r=applyCommand(g,s,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id);
 assert.equal(card.name,'Super Potion');
 assert.equal(card.rules[0],v.id==='base1-90'?'Discard 1 Energy card attached to your own Pokémon in order to remove up to 4 damage counters from that Pokémon.':'Discard 1 Energy card attached to 1 of your own Pokémon in order to remove up to 4 damage counters from that Pokémon.');
 assert.equal(CATALOG.get('base1-90').rules[0].replace('attached to your own Pokémon','attached to 1 of your own Pokémon'),CATALOG.get('base4-117').rules[0],'printings have wording variation but equivalent effect');
 scenarios++;
 // A single eligible Pokémon forces the target. Two identical Double Colorless
 // Energy cards also have identical costs, so both prompts are skipped.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.pokemon,70,[dce,dce]);p.hand=[v.id];
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null,'forced target and identical Energy resolve without prompts');
  const after=player(g,0);
  assert.equal(after.active.damage,30,'Super Potion removes exactly four counters');
  assert.deepEqual(after.active.energies,[dce]);assert.deepEqual(after.discard,[v.id,dce]);
  scenarios++;
 }
 // If several Pokémon qualify, target remains the player's choice. After the
 // chosen target is fixed, its only Energy is automatic.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.pokemon,50,[dce]);p.bench=[unit('base1-46',40,[fire])];p.hand=[v.id];
  act(g,0,'play_trainer',{handIndex:0});
  let d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,0);assert.equal(d.kind,'target');
  act(g,0,'choose',{decisionId:d.id,selected:['slot:-1']});
  assert.equal(g.pendingDecision,null,'single attached Energy is forced after choosing among targets');
  assert.equal(player(g,0).active.damage,10);assert.deepEqual(player(g,0).active.energies,[]);
  assert.equal(player(g,0).bench[0].damage,40,'unselected damaged Pokémon is unchanged');
  scenarios++;
 }
 // If fewer than four counters exist, remove them all, still paying one Energy.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.pokemon,20,[fire]);p.hand=[v.id];
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null);
  assert.equal(player(g,0).active.damage,0);assert.deepEqual(player(g,0).discard,[v.id,fire]);scenarios++;
 }
 // Different attached Energy cards are not equivalent: keep the cost choice.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.pokemon,50,[dce,fire]);p.hand=[v.id];
  act(g,0,'play_trainer',{handIndex:0});
  let d=g.pendingDecision;assert.ok(d);assert.equal(d.kind,'ownEnergy');assert.equal(d.actor,0);
  assert.deepEqual(d.options.map(o=>o.cardId),[dce,fire]);
  act(g,0,'choose',{decisionId:d.id,selected:[d.options[1].id]});
  assert.equal(g.pendingDecision,null);assert.equal(player(g,0).active.damage,10);assert.deepEqual(player(g,0).active.energies,[dce]);
  assert.ok(player(g,0).discard.includes(fire));
  scenarios++;
 }
}
console.log(`PASS Super Potion Base/Base Set 2 target and Energy auto-choice, exact healing, and cost (${scenarios} reducer scenarios)`);
