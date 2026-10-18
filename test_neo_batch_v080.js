'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function duel(seed){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:41});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=22;g.rngState=seed;
 g.players[0].active=U('base1-58',{status:'Confused',energies:['base1-99','base1-98']});
 g.players[0].bench=[U('base1-46')];g.players[1].active=U('base1-58');g.players[1].bench=[U('base1-46')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(18).fill('base1-99');}
 return g;
}
let heads=false,tails=false;
for(let seed=1;seed<3000&&!(heads&&tails);seed++){
 const g=duel(seed*65536),before=g.players[0].active.energies.length;
 const result=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(result.ok,true,result.error);
 if(g.pendingDecision){const d=g.pendingDecision;const choice=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected:[d.options[0].id]}});assert.equal(choice.ok,true,choice.error);}
 if(g.players[0].active.id==='base1-58'){
  tails=true;
  assert.equal(g.players[0].active.status,'Confused');
  assert.equal(g.players[0].active.energies.length,before-1,'Tails still pays attached retreat Energy');
  assert.equal(g.players[0].discard.length,1);
  assert.equal(g.players[0].confusedRetreatFailed,true);
  assert.equal(applyCommand(g,0,{type:'retreat',payload:{slot:0}}).ok,false,'Cannot retry failed Confused retreat');
 }else{
  heads=true;
  assert.equal(g.players[0].active.id,'base1-46');
  assert.equal(g.players[0].bench[0].status,null,'Successful retreat clears Confusion');
  assert.equal(g.players[0].bench[0].energies.length,before-1);
  assert.equal(g.players[0].discard.length,1);
 }
}
assert.ok(heads&&tails,'Both actual RNG outcomes observed');
console.log('PASS v0.80: Confused retreat spends Energy on tails, locks retries, and clears condition on success');
