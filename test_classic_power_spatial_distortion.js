'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(seed=1000){
 const g=createGame({format:'classic',decks:[deck,deck],seed:22022});
 g.phase='game';g.round=3;g.turnSerial=8;g.turn=0;g.rngState=seed;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[unit('base1-27')];p.deck=['base1-99'];p.prizes=['base1-92'];p.hand=[];p.discard=[];}
 g.players[0].active=unit('neo4-8');return g;
}
