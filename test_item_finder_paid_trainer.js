'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(){const g=createGame({format:'gym-expanded',decks:[deck,deck],seed:3});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.discard=[];}return g;}
function ok(g,type,payload={}){const r=applyCommand(g,0,{type,payload});assert.ok(r.ok,r.error);}
function select(g,ids){const d=g.pendingDecision;assert.ok(d);ok(g,'choose',{decisionId:d.id,selected:ids});}
{
 const g=game();g.players[0].hand=['base1-74','base1-91','base1-99'];
 ok(g,'play_trainer',{handIndex:0});select(g,['n:1','n:2']);
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['paid:1']);
 select(g,['paid:1']);assert.deepEqual(g.players[0].hand,['base1-91']);
 assert.deepEqual(g.players[0].discard,['base1-74','base1-99']);
}
{
 const g=game();g.players[0].hand=['base1-74','base1-91','base1-99'];g.players[0].discard=['base1-94'];
 ok(g,'play_trainer',{handIndex:0});select(g,['n:1','n:2']);
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['disc:0','paid:1']);
 select(g,['disc:0']);assert.deepEqual(g.players[0].hand,['base1-94']);
 assert.deepEqual(g.players[0].discard,['base1-74','base1-91','base1-99']);
}
{
 const g=game();g.players[0].hand=['base1-74','base1-91','base1-99','base1-98'];
 ok(g,'play_trainer',{handIndex:0});let d=g.pendingDecision;
 const before=structuredClone(g);const result=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:['n:2','n:3']}});
 assert.equal(result.ok,false);assert.deepEqual(g,before,'Invalid payment leaves the choice and hand unchanged');
}
{
 let g;
 for(let seed=0;seed<5000000;seed+=50000){g=game();g.rngState=seed;g.players[0].hand=['gym2-121','base1-91','base1-99'];g.players[1].discard=['base1-74'];ok(g,'play_trainer',{handIndex:0});if(g.pendingDecision?.kind==='copy')break;}
 assert.equal(g.pendingDecision?.kind,'copy');select(g,['disc:0']);select(g,['n:0','n:1']);select(g,['paid:0']);
 assert.deepEqual(g.players[0].hand,['base1-91']);assert.deepEqual(g.players[0].discard,['gym2-121','base1-99']);assert.deepEqual(g.players[1].discard,['base1-74']);
}
console.log('PASS Item Finder can recover its Trainer payment, including Psychic Control');
