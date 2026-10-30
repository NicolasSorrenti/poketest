'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,damage=0)=>({id,under:[],energies:[],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function setup(){const g=createGame({format:'gym-expanded',decks:[deck,deck],seed:3});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;for(const p of g.players){p.active=unit('base1-44');p.bench=[unit('base1-44',30)];p.hand=[];p.discard=[];}g.players[0].hand=['neo1-101'];return g;}
function action(g,type,payload){let r=applyCommand(g,0,{type,payload});assert.ok(r.ok,r.error);}
{
 const g=setup();action(g,'play_trainer',{handIndex:0});const d=g.pendingDecision;
 assert.deepEqual(d.options.map(x=>x.id),['slot:-1','slot:0'],'Both undamaged and damaged Pokémon are legal targets');
 action(g,'choose',{decisionId:d.id,selected:['slot:-1']});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].bench[0].damage,30);assert.ok(g.players[0].discard.includes('neo1-101'));
}
{
 const g=setup();g.players[0].bench=[];action(g,'play_trainer',{handIndex:0});assert.ok(g.pendingDecision.options.some(x=>x.id==='slot:-1'),'Playing with only an undamaged Pokémon is legal');
}
console.log('PASS Moo-Moo Milk permits any of your Pokémon as target');
