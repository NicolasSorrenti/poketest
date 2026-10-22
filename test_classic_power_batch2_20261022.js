'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,status=null,damage=0)=>({id,under:[],energies:[],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function make(id){
 const g=createGame({decks:[deck,deck],format:'classic',seed:42});g.phase='game';g.round=3;g.turnSerial=8;g.turn=0;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[unit('base1-27')];p.hand=['base1-91'];p.deck=['base1-44','base1-92','base1-93','base1-99'];p.prizes=['base1-27','base1-94'];p.discard=[];}
 g.players[0].active=unit(id);return g;
}
function go(g,type,payload={},side=0){const result=applyCommand(g,side,{type,payload});assert.ok(result.ok,type+' failed: '+result.error);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d,'Expected a decision');go(g,'choose',{decisionId:d.id,selected:[id]},d.actor);}
const ledger=g=>g.players.flatMap(p=>[...p.hand,...p.deck,...p.prizes,...p.discard,...[p.active,...p.bench].filter(Boolean).flatMap(u=>[u.id,...u.under,...u.energies])]).sort();
let scenarios=0;
{
 const g=make('neo3-39'),p=g.players[0];
 p.active.status='Asleep';p.bench=[unit('neo2-48',null,20)];
 const before=ledger(g);
 go(g,'use_power',{slot:-1});
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['slot:0']);
 choose(g,'slot:0');
 assert.equal(g.players[0].active.damage,10);
 assert.equal(g.players[0].bench[0].damage,10);
 assert.deepEqual(ledger(g),before);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 scenarios++;
}
{
 const g=make('neo3-39');g.players[0].bench=[unit('neo2-48',null,20)];
 g.players[0].active.damage=Number(CATALOG.get('neo3-39').hp)-10;
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false,
   '[Bear] cannot add damage when Unown B has 10 HP left');
 scenarios++;
}
{
 const g=make('neo3-40');
 g.rngState=1000;g.players[0].active.status='Confused';
 g.players[0].deck=['base1-91','base1-101','base1-93'];
 g.players[0].bench=[unit('neo2-47')];
 const before=ledger(g);
 go(g,'use_power',{slot:-1});
 assert.equal(g.coinFlips.at(-1).result,'heads');
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['deck:1']);
 choose(g,'deck:1');
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['slot:-1','slot:0']);
 choose(g,'slot:0');
 assert.ok(g.players[0].bench[0].energies.includes('base1-101'));
 assert.ok(!g.players[0].deck.includes('base1-101'));
 assert.deepEqual(ledger(g),before);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 scenarios++;
}
{
 const g=make('neo3-40');g.rngState=1;
 const before=ledger(g);
 go(g,'use_power',{slot:-1});
 assert.equal(g.coinFlips.at(-1).result,'tails');
 assert.equal(g.pendingDecision,null);
 assert.deepEqual(ledger(g),before);
 scenarios++;
}
{
 const g=make('neo4-20');
 g.rngState=1000;
 const beforeDeck=[...g.players[1].deck],before=ledger(g);
 go(g,'use_power',{slot:-1});
 assert.equal(g.coinFlips.at(-1).result,'heads');
 assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['choice:0','choice:1']);
 const privatelySeen=publicView(g,0).players[0].privateMessages.join(' ');
 assert.ok(privatelySeen.includes(CATALOG.get(beforeDeck.at(-1)).name));
 assert.equal(publicView(g,1).players[0].privateMessages,undefined);
 choose(g,'choice:1');
 assert.deepEqual([...g.players[1].deck].sort(),beforeDeck.sort());
 assert.deepEqual(ledger(g),before);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 scenarios++;
}
{
 const g=make('neo4-20');g.rngState=1;
 const before=[...g.players[1].deck];
 go(g,'use_power',{slot:-1});
 assert.equal(g.coinFlips.at(-1).result,'tails');
 assert.equal(g.pendingDecision,null);
 assert.deepEqual(g.players[1].deck,before);
 scenarios++;
}
{
 const g=make('neo4-20');g.players[0].active.status='Paralyzed';
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false,
   'Cunning disabled by Paralysis');
 scenarios++;
}
console.log('PASS Unown Bear/Yield and Dark Slowking Cunning:',scenarios,'scenarios');
