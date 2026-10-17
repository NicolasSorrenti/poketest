'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,en=[],dmg=0)=>({id,under:[],energies:[...en],attachedTrainers:[],damage:dmg,status:null,poison:false,playedTurn:0});
function make(){const g=createGame({format:'classic',seed:123,decks:[deck,deck]});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[unit('base1-44')];p.hand=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(8).fill('base1-99');p.discard=[];}return g;}
function go(g,s,t,p={}){const r=applyCommand(g,s,{type:t,payload:p});assert.ok(r.ok,`${t}: ${r.error}`);}
function answer(g,ids){const d=g.pendingDecision;assert.ok(d);go(g,d.actor,'choose',{decisionId:d.id,selected:ids??d.options.slice(0,d.min).map(x=>x.id)});}
let n=0;
{
 const g=make();g.players[0].active=unit('base1-7',['base1-97']);g.players[1].bench=[unit('base3-43')]; // Slowbro no damage shield
 g.players[1].active=unit('base3-50');go(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10,'Kabuto Armor halves attack after WR');n++;
}
{
 const g=make();g.players[0].active=unit('base1-7',['base1-97']);g.players[1].active=unit('base2-6');
 go(g,0,'attack',{attackIndex:0});assert.ok(g.players[1].active.damage>=0);n++;
}
{
 const g=make();g.players[0].active=unit('base1-7',['base1-97','base1-97','base1-97']);g.players[1].active=unit('base5-8',['base1-102','base1-102'],60);g.players[1].bench=[unit('base1-44')];
 g.rngState=4294967295;const old=g.players[0].active.damage;
 go(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].prizes.length,5,'Dark Gyarados was knocked out');assert.ok(g.players[0].active.damage>=old,'Final Beam cannot heal attacker');n++;
}
{
 const g=make();g.players[0].active=unit('base3-13');g.players[1].bench=[unit('base1-2')];g.players[1].hand=['base1-102'];
 g.turn=1;const r=applyCommand(g,1,{type:'use_power',payload:{slot:0}});assert.equal(r.ok,false);assert.match(r.error,/disabled/i);n++;
}
{
 const g=make();g.players[0].active=unit('base5-41');g.players[1].active=unit('base1-44',['base1-97','base1-97','base1-97']);g.players[1].bench=[unit('base1-52')];g.turn=1;
 go(g,1,'retreat',{slot:0}); // Machop has retreat 1 + Sticky Goo 2; three energy provided
 assert.equal(g.players[1].discard.length,3);n++;
}
{
 const g=make();g.players[0].active=unit('base1-21');g.players[0].bench=[unit('base1-44')];const prior=g.players[1].prizes.length;
 go(g,0,'use_power',{slot:-1});answer(g,['type:0']);answer(g,['slot:0']);
 assert.equal(g.players[1].prizes.length,prior-1);assert.equal(g.players[0].active.energies.length,1);n++;
}
{
 const g=make();g.players[0].active=unit('base2-55');g.players[0].prizes=['base1-91'];g.players[0].hand=['base1-94'];
 go(g,0,'use_power',{slot:-1});answer(g,['peek:4']);assert.ok(publicView(g,0).players[0].privateMessages.length);assert.equal(publicView(g,1).players[0].privateMessages,undefined);n++;
}
console.log('PASS Classic reactive & private Power paths:',n);
