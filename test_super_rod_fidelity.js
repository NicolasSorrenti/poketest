'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function setup(seed){let g=createGame({format:'gym-expanded',decks:[deck,deck],seed:3});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;g.rngState=seed;for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.discard=[];}g.players[0].hand=['neo1-103'];g.players[0].discard=['base1-44','base1-30'];return g;}
function run(g,type,payload){let r=applyCommand(g,0,{type,payload});assert.ok(r.ok,r.error);}
let outcomes={};for(let seed=0;seed<5000000&&Object.keys(outcomes).length<2;seed+=50000){let g=setup(seed);run(g,'play_trainer',{handIndex:0});let d=g.pendingDecision;if(d?.kind==='rodCard'){let id=d.options[0].cardId;if(id==='base1-44'||id==='base1-30')outcomes[id]=g;}}
for(const id of ['base1-44','base1-30']){const g=outcomes[id];assert.ok(g,'Expected coin outcome for '+id);const d=g.pendingDecision;assert.equal(d.optional,false,'Super Rod must recover an eligible card');let before=structuredClone(g);let r=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,decline:true}});assert.equal(r.ok,false);assert.deepEqual(g,before);run(g,'choose',{decisionId:d.id,selected:[d.options[0].id]});assert.ok(g.players[0].hand.includes(id));assert.ok(!g.players[0].discard.includes(id));}
console.log('PASS Super Rod requires eligible Basic or Evolution recovery');
