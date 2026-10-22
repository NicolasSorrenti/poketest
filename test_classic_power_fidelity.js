'use strict';
// Black-box historical Power checks through the authoritative reducer and per-player views.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,status=null)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status,poison:false,playedTurn:0});
function ready(id='base5-66',status=null){
 const g=createGame({format:'classic',decks:[deck,deck],seed:20261022});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;
 for(const p of g.players){
  p.active=unit('base1-44');p.bench=[unit('base1-44')];
  p.deck=['base1-91','base1-99'];p.hand=[];p.discard=[];
  p.prizes=['base1-44','base1-27','base1-91','base1-98'];
 }
 g.players[0].active=unit(id,status);
 return g;
}
function ok(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.ok(r.ok,type+' failed: '+r.error);return r;
}
function choose(g,id){
 const d=g.pendingDecision;assert.ok(d,'Expected pending decision');
 ok(g,d.actor,'choose',{decisionId:d.id,selected:[id]});
}
function blind(d,n){
 assert.deepEqual(d.options.map(x=>x.id),Array.from({length:n},(_,i)=>'prize:'+i));
 assert.deepEqual(d.options.map(x=>x.label),Array.from({length:n},(_,i)=>'Prize '+(i+1)),
  'Choosing a face-down Prize must not reveal card names');
}
let checks=0;
{
 const g=ready(),p=g.players[0];
 p.prizeFaceUp=[false,false,true,false];
 const beforePrizes=[...p.prizes],beforeDeck=[...p.deck];
 ok(g,0,'use_power',{slot:-1});
 blind(g.pendingDecision,4);
 blind(publicView(g,0).pendingDecision,4);
 assert.equal(publicView(g,1).pendingDecision.options,undefined,'Opponent must not receive private choices');
 const d=g.pendingDecision,prior=structuredClone(g);
 const rejected=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:['prize:99']}});
 assert.equal(rejected.ok,false,'Cannot choose an out-of-range Prize');
 assert.deepEqual(g,prior,'Invalid Prize selection must not change game state');
 choose(g,'prize:2');
 const resolved=g.players[0]; // applyCommand atomically replaces game/player objects.
 assert.equal(resolved.prizes[2],beforeDeck.at(-1),'Top deck card replaces the selected Prize');
 assert.equal(resolved.deck.at(-1),beforePrizes[2],'Selected Prize goes to the top of the deck');
 assert.deepEqual(resolved.prizes.filter((_,i)=>i!==2),beforePrizes.filter((_,i)=>i!==2));
 assert.equal(resolved.prizeFaceUp[2],false,'A replacement Prize must not inherit an earlier reveal');
 assert.ok(!publicView(g,0).players[0].prizes,'Own unrevealed Prize identities stay private');
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false,'Trickery only once per turn');
 checks++;
}
{
 const g=ready();g.players[0].deck=[];
 const old=structuredClone(g);
 const r=applyCommand(g,0,{type:'use_power',payload:{slot:-1}});
 assert.equal(r.ok,false,'Trickery cannot activate with an empty deck');
 assert.deepEqual(g,old,'Failed Trickery cannot consume the Power');
 checks++;
}
{
 const g=ready('base5-66','Asleep');
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false,'Trickery blocked by Sleep');
 checks++;
}
{
 const g=ready('base1-44');
 g.players[0].bench=[unit('base5-66')];
 ok(g,0,'use_power',{slot:0});
 blind(g.pendingDecision,4);
 choose(g,'prize:1');
 assert.equal(g.players[0].deck.at(-1),'base1-27','Benched Rattata can use Trickery');
 checks++;
}
{
 const g=ready('neo4-87','Asleep'); // Unown [S] explicitly works under Special Conditions.
 ok(g,0,'use_power',{slot:-1});
 blind(g.pendingDecision,4);
 choose(g,'prize:1');
 assert.ok(publicView(g,0).players[0].privateMessages.at(-1).includes(CATALOG.get('base1-27').name));
 assert.equal(publicView(g,1).players[0].privateMessages,undefined);
 checks++;
}
{
 const g=ready('neo4-88','Confused'); // Unown [T] explicitly works while Confused.
 ok(g,0,'use_power',{slot:-1});
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].active.powerUsed['[Tell]'],g.turnSerial);
 checks++;
}
{
 const g=ready('neo4-86','Paralyzed'); // Unown [L] / [Laugh] also ignores status.
 ok(g,0,'use_power',{slot:-1});
 assert.equal(g.players[0].active.powerUsed['[Laugh]'],g.turnSerial);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 checks++;
}
{
 const g=ready('base2-55'); // Mankey Peek: choose a specific, unrevealed Prize position.
 ok(g,0,'use_power',{slot:-1});
 choose(g,'peek:4');
 blind(g.pendingDecision,4);
 assert.equal(publicView(g,1).pendingDecision.options,undefined);
 choose(g,'prize:2');
 assert.ok(publicView(g,0).players[0].privateMessages.at(-1).includes(CATALOG.get('base1-91').name));
 assert.equal(publicView(g,1).players[0].privateMessages,undefined);
 checks++;
}
console.log('PASS historical Pokémon Power hidden-information and activation fidelity:',checks,'scenarios');
