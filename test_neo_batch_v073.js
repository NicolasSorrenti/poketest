'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(opponent,bench=[]){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:12});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=14;
 g.players[0].active=U('gym2-90',{energies:['base1-101']});g.players[0].bench=[U('base1-46')];
 g.players[1].active=U(opponent);g.players[1].bench=bench.map(id=>U(id));
 for(const p of g.players){p.prizes=Array(6).fill('base1-99');p.hand=[];p.discard=[];p.deck=Array(15).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:[id]});}
function esp(g){
 for(let seed=0;seed<30000;seed++){
  const trial=structuredClone(g);trial.rngState=seed;
  const r=applyCommand(trial,0,{type:'attack',payload:{attackIndex:0}});
  if(r.ok&&trial.pendingAction?.kind==='psyduck_esp_copy'){
   g.rngState=seed;send(g,0,'attack',{attackIndex:0});return;
  }
 }
 throw Error('No triple-head ESP roll');
}
function copy(g,name){
 const i=CATALOG.get(g.players[1].active.id).attacks.findIndex(a=>a.name===name);
 assert.ok(i>=0,'Missing '+name);
 assert.ok(g.pendingDecision.options.some(o=>o.id==='attack:'+i),'Copied attack must be selectable');
 choose(g,'attack:'+i);
}
{
 const g=game('base5-7',['base1-46','base1-58']);esp(g);copy(g,'Flitter');
 assert.equal(g.pendingDecision.actor,0);
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['bench:-1','bench:0','bench:1']);
 const wrong=applyCommand(g,1,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:1']}});
 assert.equal(wrong.ok,false,'Defender cannot select attacking target');
 choose(g,'bench:1');
 assert.equal(g.players[1].bench[1].damage,20);
 assert.equal(g.players[1].active.damage,0);
}
{
 const g=game('base5-7');esp(g);copy(g,'Flitter');
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['bench:-1']);
 choose(g,'bench:-1');
 assert.equal(g.players[1].active.damage,20);
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<20000&&!(heads&&tails);seed++){
  const g=game('base5-62');g.rngState=seed;
  const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:0}});
  if(!r.ok||g.pendingAction?.kind!=='psyduck_esp_copy')continue;
  copy(g,'Coin Hurl');choose(g,'bench:-1');
  const last=g.coinFlips.at(-1).result;
  assert.equal(g.players[1].active.damage,last==='heads'?20:0,'Independent copied coin determines damage');
  if(last==='heads')heads=true;else tails=true;
 }
 assert.ok(heads&&tails,'Copied Coin Hurl must give both outcomes');
}
{
 const g=game('base3-48');esp(g);copy(g,'Minimize');
 assert.equal(g.players[0].active.shield.reduce,20,'Copied Minimize protects Psyduck');
 assert.equal(g.players[1].active.shield,undefined);
}
console.log('PASS v0.73 ESP secondary targets, Coin Hurl and copied Minimize');
