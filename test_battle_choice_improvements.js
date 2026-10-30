'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(){const g=createGame({format:'gym-expanded',decks:[deck,deck],seed:12});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;for(const p of g.players){p.active=unit('base1-44');p.bench=[unit('base1-44')];p.hand=[];p.discard=[];}return g;}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,r.error);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:[id]});}
{
 const g=game();g.players[0].hand=['base1-92'];g.players[1].active.energies=['base1-99','base4-127'];
 send(g,0,'play_trainer',{handIndex:0});choose(g,'slot:-1');
 assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.energies.length,1);assert.equal(g.players[1].discard.length,1);
}
{
 const g=game();g.players[0].hand=['base1-92'];g.players[1].active.energies=['base1-99','base1-98'];
 send(g,0,'play_trainer',{handIndex:0});choose(g,'slot:-1');assert.equal(g.pendingDecision.kind,'enemyEnergy');
}
{
 const g=game();g.players[0].hand=['base1-79'];g.players[0].active.energies=['base1-99','base4-127'];g.players[1].active.energies=['base1-99','base4-127'];
 send(g,0,'play_trainer',{handIndex:0});choose(g,'slot:-1');assert.equal(g.pendingDecision.kind,'target');choose(g,'slot:-1');assert.equal(g.pendingDecision.kind,'enemyEnergy');assert.equal(g.pendingDecision.min,1);assert.equal(g.pendingDecision.max,2);
}
{
 const g=game();g.players[0].active=unit('base1-15');g.players[0].active.energies=['base1-99','base4-127'];
 send(g,0,'use_power',{slot:-1});choose(g,'slot:-1');assert.equal(g.pendingDecision.kind,'target');choose(g,'slot:0');assert.equal(g.players[0].bench[0].energies.length,1);
}
{
 let g;
 for(let seed=0;seed<5000000;seed+=50000){g=game();g.rngState=seed;g.players[0].hand=['gym2-121'];g.players[1].discard=['neo1-86','base1-92'];send(g,0,'play_trainer',{handIndex:0});if(g.pendingDecision?.kind==='copy')break;}
 assert.equal(g.pendingDecision?.kind,'copy');assert.deepEqual(g.pendingDecision.options.map(x=>x.cardId),['base1-92']);
}
console.log('PASS interchangeable basic Energy choices and Psychic Control exclusions');
