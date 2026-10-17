'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const UNIT=(id,e={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:2,...e});
function game(id='base1-20',energy=['base1-96']){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:85});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=10;
 g.players[0].active=UNIT(id,{energies:energy});g.players[0].bench=[UNIT('base1-58')];
 g.players[1].active=UNIT('base1-58');g.players[1].bench=[UNIT('base1-46')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
{
 const g=game();send(g,0,'retreat',{slot:0});
 assert.equal(g.players[0].active.id,'base1-58','Two-retreat-cost Electabuzz can pay one DCE');
 assert.deepEqual(g.players[0].discard,['base1-96']);
}
{
 const g=game('neo4-49',['neo4-16']);send(g,0,'retreat',{slot:0});
 assert.equal(g.players[0].active.id,'base1-58','One Miracle pays two retreat units');
 assert.deepEqual(g.players[0].discard,['neo4-16']);
}
{
 const g=game('base1-20',['base1-96','base1-98','base1-99']);send(g,0,'retreat',{slot:0});
 assert.ok(g.pendingDecision,'Different valid payments require user choice');
 assert.equal(g.pendingDecision.min,1);assert.equal(g.pendingDecision.max,2);
 let r=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['energy:1']}});
 assert.equal(r.ok,false,'One Basic cannot pay two units');
 const id=g.pendingDecision.id;send(g,0,'choose',{decisionId:id,selected:['energy:0']});
 assert.equal(g.players[0].active.id,'base1-58');
 assert.ok(g.players[0].discard.includes('base1-96'));
 assert.equal(g.players[0].discard.includes('base1-98'),false,'Unused Basics stay attached to Benched Electabuzz');
}
{
 const g=game('base1-20',['base1-98','base1-99','base1-100']);
 send(g,0,'retreat',{slot:0});assert.ok(g.pendingDecision);
 const id=g.pendingDecision.id;send(g,0,'choose',{decisionId:id,selected:['energy:1','energy:2']});
 assert.equal(g.players[0].active.id,'base1-58');
 assert.equal(g.players[0].discard.length,2);
}
{
 const g=game('base1-58',['base1-96','base1-99']);send(g,0,'retreat',{slot:0});
 assert.ok(g.pendingDecision);assert.equal(g.pendingDecision.max,1,'Cost one can select at most one Energy card');
 send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['energy:0']});
 assert.equal(g.players[0].discard.includes('base1-96'),true,'DCE may overpay a one-unit retreat');
}
{
 const g=game('base1-20',['base1-98']);const r=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,false,'Insufficient single-unit Energy cannot retreat');
 assert.equal(g.players[0].active.id,'base1-20','Rejected retreat is transactional');
}
console.log('PASS v0.60: per-card multi-unit retreat for DCE/Miracle, optional payments, no over-selection');
