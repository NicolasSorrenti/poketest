'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const variants=[
 {format:'classic',pokemon:'base1-44'},
 {format:'online-preview',pokemon:'base4-67'}
];
const revive='base1-89',basic='base1-46',energy='base1-98';
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(revive),...Array(4).fill(energy),...Array(48).fill('base1-99')];
 const g=createGame({format:v.format,decks:[deck,deck],seed:89117});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[energy];p.discard=[];p.prizes=Array(6).fill(energy);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,s)=>g.players[s];
function act(g,s,type,payload={}){const r=applyCommand(g,s,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;
for(const v of variants){
 assert.equal(CATALOG.get(revive).name,'Revive');
 assert.equal(CATALOG.get(revive).rules[0],'Put 1 Basic Pokémon card from your discard pile onto your Bench. Put damage counters on that Pokémon equal to half its HP (rounded down to the nearest 10). (You can\'t play Revive if your Bench is full.)');
 assert.equal(CATALOG.get(basic).hp,'50');
 scenarios++;
 // Printed restriction: reject atomically at five occupied slots.
 {
  const g=game(v),p=player(g,0);p.bench=Array.from({length:5},()=>unit(v.pokemon));p.discard=[basic];p.hand=[revive];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.match(r.error,/full.*Bench/i);assert.deepEqual(g,before);scenarios++;
 }
 // Narrow Gym makes four occupied slots a full Bench, so play is still illegal.
 {
  const g=game(v),p=player(g,0);g.stadium={id:'gym1-124'};p.bench=Array.from({length:4},()=>unit(v.pokemon));p.discard=[basic];p.hand=[revive];
  const before=structuredClone(g),r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(r.ok,false);assert.match(r.error,/full.*Bench/i);assert.deepEqual(g,before);scenarios++;
 }
 // With room, the player chooses a Basic from their own public discard and
 // puts it on their own Bench with half HP damage rounded down to the nearest 10.
 {
  const g=game(v),p=player(g,0);p.bench=Array.from({length:4},()=>unit(v.pokemon));p.discard=[basic];p.hand=[revive];
  act(g,0,'play_trainer',{handIndex:0});const d=g.pendingDecision;
  assert.ok(d);assert.equal(d.actor,0);assert.equal(d.kind,'recover');assert.deepEqual(d.options.map(o=>o.cardId),[basic]);
  act(g,0,'choose',{decisionId:d.id,selected:[d.options[0].id]});
  const after=player(g,0);
  assert.equal(after.bench.length,5);assert.equal(after.bench[4].id,basic);assert.equal(after.bench[4].damage,20,'50 HP halves to 25, then rounds down to 20');
  assert.deepEqual(after.discard,[revive]);assert.equal(player(g,1).bench.length,0);assert.equal(g.pendingDecision,null);scenarios++;
 }
}
console.log(`PASS Revive Base eligibility, Narrow Gym limit, target ownership, and damage rounding (${scenarios} reducer scenarios)`);
