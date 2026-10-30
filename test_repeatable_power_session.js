'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function setup(id){let g=createGame({format:'classic',decks:[deck,deck],seed:12});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.discard=[];}g.players[0].active=unit(id);g.players[0].bench=[unit('base1-44')];return g;}
function act(g,type,payload={}){let r=applyCommand(g,0,{type,payload});assert.ok(r.ok,r.error);}
function pick(g,id){let d=g.pendingDecision;assert.ok(d);act(g,'choose',{decisionId:d.id,selected:[id]});}
{
 const g=setup('base1-1');g.players[0].active.damage=30;
 act(g,'use_power',{slot:-1,repeat:true});assert.equal(g.pendingDecision.optional,true);
 const locked=applyCommand(g,0,{type:'end_turn',payload:{}});assert.equal(locked.ok,false);
 const wrong=applyCommand(g,1,{type:'choose',payload:{decisionId:g.pendingDecision.id,decline:true}});assert.equal(wrong.ok,false);
 pick(g,'slot:-1');pick(g,'slot:0');assert.equal(g.players[0].active.damage,20);
 assert.equal(g.pendingDecision.kind,'source');pick(g,'slot:-1');pick(g,'slot:0');assert.equal(g.players[0].active.damage,10);
 let d=g.pendingDecision;assert.equal(d.optional,true);act(g,'choose',{decisionId:d.id,decline:true});assert.equal(g.pendingDecision,null);
}
{
 const g=setup('base1-15');g.players[0].active.energies=['base1-99','base1-99'];
 act(g,'use_power',{slot:-1,repeat:true});pick(g,'slot:-1');pick(g,'index:0');pick(g,'slot:0');
 assert.equal(g.players[0].bench[0].energies.length,1);assert.equal(g.pendingDecision.kind,'source');
 pick(g,'slot:-1');pick(g,'index:0');pick(g,'slot:0');assert.equal(g.players[0].bench[0].energies.length,2);
 let d=g.pendingDecision;act(g,'choose',{decisionId:d.id,decline:true});assert.equal(g.pendingDecision,null);
}
{
 const g=setup('base1-1');g.players[0].active.damage=10;act(g,'use_power',{slot:-1});pick(g,'slot:-1');pick(g,'slot:0');assert.equal(g.pendingDecision,null,'legacy non-repeat activation must finish');
}
{
 // A transfer cannot knock out its recipient. With no legal recipient, the
 // repeated session ends without creating an impossible mandatory prompt.
 const g=setup('base1-1');g.players[0].active.damage=70;
 g.players[0].bench[0].damage=30; // Base Bulbasaur has 40 HP.
 act(g,'use_power',{slot:-1,repeat:true});assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].active.damage,70);
}
{
 // Selecting Finish before any transfer is a no-op.
 const g=setup('base1-15');g.players[0].active.energies=['base1-99'];
 act(g,'use_power',{slot:-1,repeat:true});
 let d=g.pendingDecision;act(g,'choose',{decisionId:d.id,decline:true});
 assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,['base1-99']);
}
console.log('PASS repeatable Damage Swap and Energy Trans sessions');
