'use strict';
const assert=require('node:assert/strict');
const {createGame,reduce}=require('./headless_duel');
const {list}=require('./authentic_decks');
function fixture(id,energy){
 const g=createGame({decks:[list('base1:Blackout'),list('base1:Brushfire')],format:'classic',seed:719});
 g.phase='game';g.turn=0;
 const unit=(id,energy=[])=>({id,under:[],energies:[...energy],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
 g.players[0].active=unit(id,energy);g.players[1].active=unit('base1-52',[]);
 return g;
}
let g=fixture('base3-55',['base1-101','base1-101']);g.players[0].discard=[];
let snapshot=structuredClone(g);
let response=reduce(g,0,{type:'attack',payload:{attackIndex:1}});
assert.equal(response.ok,false);assert.match(response.error,/Scavenge requires/);
assert.equal(g.pendingDecision,null,'Invalid Scavenge must not open a mandatory Energy choice');
assert.deepEqual(g,snapshot,'No partial state mutation');
g=fixture('base2-57',['base1-99','base1-99']);
g.players[0].active.attackLock={targetId:'base1-52',expires:2};
snapshot=structuredClone(g);
response=reduce(g,0,{type:'attack',payload:{attackIndex:1}});
assert.equal(response.ok,false);assert.match(response.error,/Cannot attack/);
assert.equal(g.pendingDecision,null,'Locked attack must not open a deck search');
assert.deepEqual(g,snapshot,'Rejected attack must remain atomic');
console.log('PASS Classic attack preflight: invalid Scavenge and attack-locked Call for Family cannot trap a player in a mandatory decision');
