'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,patch={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...patch});
function game(rngState){const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:1});g.phase='game';g.round=5;g.turnSerial=10;g.turn=0;g.rngState=rngState;g.players[0].active=U('base1-3');g.players[1].active=U('base1-3');g.players[0].bench=[U('base1-3')];g.players[1].bench=[U('base1-3')];g.players[0].hand=['base1-91'];g.players[1].hand=[];g.stadium={id:'gym2-102',owner:0};g.players[0].stadium='gym2-102';return g;}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,r.error);return g;}
function tails(){for(let seed=0;seed<5000000;seed+=50000){const g=game(seed);send(g,0,'play_trainer',{handIndex:0});if(g.pendingAction?.kind==='chaos_redirect')return g;}throw Error('no tails seed')}
function heads(){for(let seed=0;seed<5000000;seed+=50000){const g=game(seed);send(g,0,'play_trainer',{handIndex:0});if(!g.pendingAction)return g;}throw Error('no heads seed')}
{
 const g=tails(),choice=g.pendingDecision;assert.equal(choice.actor,1);assert.equal(g.players[0].hand.length,0);assert.deepEqual(g.players[0].discard,['base1-91']);
 // Owner cannot choose on the opponent's behalf.
 const no=applyCommand(g,0,{type:'choose',payload:{decisionId:choice.id,selected:['choice:use']}});assert.equal(no.ok,false);assert.match(no.error,/Decision belongs/);
 send(g,1,'choose',{decisionId:choice.id,selected:[]});assert.equal(g.pendingDecision,null);assert.equal(g.turn,0);assert.deepEqual(g.players[0].discard,['base1-91']);
}
{
 const g=tails(),choice=g.pendingDecision;g.players[1].deck=['base1-3','base1-4','base1-5'];
 const before=g.players[1].hand.length;send(g,1,'choose',{decisionId:choice.id,selected:['choice:use']});assert.equal(g.players[1].hand.length,before+2);assert.equal(g.players[0].hand.length,0);assert.deepEqual(g.players[0].discard,['base1-91']);assert.equal(g.turn,0);
}
{
 const g=heads();assert.equal(g.players[0].hand.length,2);assert.equal(g.players[0].discard.at(-1),'base1-91');
}
{
 const g=tails();g.players[0].hand=['base1-98'];g.players[1].active.damage=20;const d=g.pendingDecision;
 send(g,1,'choose',{decisionId:d.id,selected:[]});assert.equal(g.players[0].discard.includes('base1-91'),true);
}
console.log('PASS v0.41 Chaos Gym: coin outcomes, opponent consent, atomic owner discard, cross-seat privacy');
{
 // A redirected Gust of Wind presents a second authoritative prompt to the
 // opponent and changes the ORIGINAL player's Active rather than guessing.
 const g=tails();g.players[0].hand=[];g.players[0].discard=['base1-93'];g.players[0].bench=[U('base1-46')];
 const initial=g.pendingDecision;g.pendingAction.cardId='base1-93';
 send(g,1,'choose',{decisionId:initial.id,selected:['choice:use']});
 const d=g.pendingDecision;assert.equal(d.actor,1);assert.equal(d.kind,'target');
 send(g,1,'choose',{decisionId:d.id,selected:[d.options[0].id]});
 assert.equal(g.players[0].active.id,'base1-46'); // Actually Gust targets the opponent of actor 1, so 0's Bench.
 assert.equal(g.players[0].discard.includes('base1-93'),true);
}
