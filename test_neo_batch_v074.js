'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(source='base5-7',enemyBench=['base1-46','base1-58']){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:194});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=21;
 g.players[0].active=U('neo1-16',{energies:['base1-99']});
 g.players[0].bench=[U('neo2-11',{energies:['base1-99','base1-99']})];
 g.players[1].active=U(source,{energies:['base1-99','base1-99']});
 g.players[1].bench=enemyBench.map(id=>U(id));
 for(const p of g.players){p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);return r;}
function choose(g,value){const d=g.pendingDecision;assert.ok(d,'Expected owner choice');send(g,d.actor,'choose',{decisionId:d.id,selected:[value]});}
function copy(g,name){
 const ix=CATALOG.get(g.players[1].active.id).attacks.findIndex(a=>a.name===name);
 assert.ok(ix>=0,'Missing '+name);
 assert.ok(g.pendingDecision?.options.some(o=>o.id==='attack:'+ix),'Copy target advertised '+name);
 choose(g,'attack:'+ix);
}
function startMetronome(g){
 for(let seed=0;seed<15000;seed+=13){
  const trial=structuredClone(g);trial.rngState=seed;
  const r=applyCommand(trial,0,{type:'attack',payload:{attackIndex:0}});
  if(r.ok&&trial.pendingAction?.kind==='neo50_select'&&trial.pendingAction?.stage==='source'){
   g.rngState=seed;send(g,0,'attack',{attackIndex:0});
   assert.equal(g.pendingDecision.actor,0);
   choose(g,'slot:-1');return;
  }
 }throw Error('No heads on Super Metronome in deterministic RNG range');
}
{
 const g=game('base5-7');
 startMetronome(g);copy(g,'Flitter');
 assert.equal(g.pendingDecision?.actor,0);
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['bench:-1','bench:0','bench:1']);
 const decision=g.pendingDecision;
 const other=applyCommand(g,1,{type:'choose',payload:{decisionId:decision.id,selected:['bench:1']}});
 assert.equal(other.ok,false,'The opposing player may not choose Togetic copied-attack targets');
 const bad=applyCommand(g,0,{type:'choose',payload:{decisionId:decision.id,selected:['bench:4']}});
 assert.equal(bad.ok,false,'Out-of-bounds targets cannot mutate state');
 assert.equal(g.pendingDecision.id,decision.id,'Rejected selection preserves choice');
 choose(g,'bench:1');
 assert.equal(g.players[1].bench[1].damage,20,'Flitter damages selected Bench directly');
 assert.equal(g.players[1].active.damage,0,'Opponent Active is untouched');
 assert.equal(g.players[0].active.damage,0,'Copy user is not the damage target');
}
{
 const g=game('base5-7',[]);
 startMetronome(g);copy(g,'Flitter');
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['bench:-1']);
 choose(g,'bench:-1');
 assert.equal(g.players[1].active.damage,20,'No Bench still permits selecting Active');
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<15000&&!(heads&&tails);seed+=97){
  const g=game('base5-62',['base1-46']);startMetronome(g);copy(g,'Coin Hurl');
  g.rngState=seed*673+11;choose(g,'bench:0');
  const flip=g.coinFlips.at(-1)?.result;
  assert.ok(flip==='heads'||flip==='tails','Coin Hurl uses its own coin');
  assert.equal(g.players[1].bench[0].damage,flip==='heads'?20:0);
  assert.equal(g.players[1].active.damage,0);
  heads||=flip==='heads';tails||=flip==='tails';
 }
 assert.ok(heads&&tails,'Independent target coin has both outcomes');
}
{
 const g=game('base5-7',['base1-46']);g.turn=1;g.turnSerial=23;
 send(g,1,'attack',{attackIndex:0});
 assert.equal(g.pendingDecision?.actor,1,'Source Flitter chose the damaged Pokémon');
 choose(g,'bench:-1');
 assert.equal(g.turn,0,'Smeargle player gets next turn');
 assert.equal(g.players[0].bench[0].neo50Observed?.serial,23);
 send(g,0,'retreat',{slot:0});
 send(g,0,'attack',{attackIndex:0});
 assert.equal(g.pendingDecision?.actor,0,'Sketch requires its own copied Flitter target');
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['bench:-1','bench:0']);
 choose(g,'bench:0');
 assert.equal(g.players[1].bench[0].damage,20,'Sketch also copies Active/Bench targeting');
 assert.equal(g.players[1].active.damage,0,'The original Dark Golbat stays undamaged');
}
console.log('PASS v0.74 Super Metronome and Sketch copied any-target/coin attacks with authorized Active/Bench choices');
