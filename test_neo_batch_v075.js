'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(target='base1-4',energies=['base1-101','base1-98','base1-98','base1-99']){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:51});
 g.phase='game';g.round=8;g.turn=0;g.turnSerial=19;
 g.players[0].active=U('gym2-90',{energies});
 g.players[0].bench=[U('base1-46')];
 g.players[1].active=U(target);g.players[1].bench=[U('base1-58')];
 for(const p of g.players){p.discard=[];p.hand=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(20).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,ids){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:ids});}
function triple(g){
 for(let seed=0;seed<45000;seed++){
  const trial=structuredClone(g);trial.rngState=seed;
  const r=applyCommand(trial,0,{type:'attack',payload:{attackIndex:0}});
  if(!r.ok)continue;
  if(trial.coinFlips.slice(-3).every(x=>x.result==='heads')){
   g.rngState=seed;send(g,0,'attack',{attackIndex:0});
   assert.equal(g.coinFlips.slice(-3).filter(x=>x.result==='heads').length,3);
   return;
  }
 }
 throw Error('No three-head ESP flip found in deterministic seeds');
}
{
 const g=game();triple(g);
 assert.equal(g.pendingDecision?.kind,'opponent-attack');
 assert.ok(g.pendingDecision.options.some(x=>x.label==='Fire Spin'));
 choose(g,['attack:0']);
 assert.equal(g.pendingDecision?.actor,0,'Attacking Psyduck player pays copied attack cost');
 assert.equal(g.pendingAction?.kind,'psyduck_esp_payment');
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['energy:1','energy:2']);
 const d=g.pendingDecision;
 const unauthorized=applyCommand(g,1,{type:'choose',payload:{decisionId:d.id,selected:['energy:1','energy:2']}});
 assert.equal(unauthorized.ok,false,'Defending player cannot choose which of Psyduck Energy to discard');
 const underpay=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:['energy:1']}});
 assert.equal(underpay.ok,false,'Fire Spin requires 2 additional attached Fire Energy');
 assert.equal(g.players[0].active.energies.length,4,'Invalid choice cannot discard an Energy card');
 choose(g,['energy:1','energy:2']);
 assert.equal(g.players[0].discard.filter(id=>id==='base1-98').length,2,'Both additional Fire Energy paid exactly once');
 assert.equal(g.players[0].active.energies.length,2);
 assert.equal(g.players[0].active.energies.includes('base1-101'),true,'ESP itself requires Psychic, not discarded');
 assert.equal(g.players[1].active.damage,100,'Copied Fire Spin actually damages opponent');
 assert.equal(g.turn,1,'Copied attack finishes the turn');
 assert.equal(g.pendingDecision,null);
}
{
 const g=game('base1-4',['base1-101','base1-98']);
 triple(g);
 assert.equal(g.pendingDecision,null,'No supported payable attack should not ask for an impossible selection');
 assert.equal(g.turn,1,'All three heads without a payable copy still consumes turn');
 assert.equal(g.players[1].active.damage,0);
 assert.equal(g.players[0].active.energies.length,2);
}
{
 const g=game('neo2-11',['base1-101']);
 triple(g);
 assert.equal(g.pendingDecision,null,'All copies unsupported must not yield a free reroll');
 assert.equal(g.turn,1);
 assert.equal(g.players[1].active.damage,0);
}
{
 const g=game('base1-4',['base1-101','base1-98','base5-17','base1-99']);
 triple(g);choose(g,['attack:0']);
 assert.ok(g.pendingDecision.options.some(x=>x.id==='energy:2'),'Rainbow counts as attached Fire Energy for copied Fire Spin');
 choose(g,['energy:1','energy:2']);
 assert.equal(g.players[0].discard.includes('base5-17'),true);
 assert.equal(g.players[0].discard.includes('base1-98'),true);
 assert.equal(g.players[1].active.damage,100);
}
console.log('PASS v0.75 Psyduck ESP paid Fire Spin, Rainbow eligibility, copy ownership, and no free reroll');
