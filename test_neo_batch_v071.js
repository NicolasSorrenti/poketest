'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(id,enemyBench=['base1-58','base1-46'],ownBench=['base1-46','base1-58']){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:53});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=15;g.rngState=1987;
 g.players[0].active=U('base1-5',{energies:['base1-99','base1-99','base1-99']});
 g.players[0].bench=ownBench.map(x=>U(x));
 g.players[1].active=U(id);g.players[1].bench=enemyBench.map(x=>U(x));
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(15).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);return r;}
function choose(g,id,side){const d=g.pendingDecision;assert.ok(d,'Must have pending choice');send(g,side===undefined?d.actor:side,'choose',{decisionId:d.id,selected:[id]});}
function copied(g,name){
 const i=CATALOG.get(g.players[1].active.id).attacks.findIndex(x=>x.name===name);
 assert.ok(i>=0,'Missing '+name);
 send(g,0,'attack',{attackIndex:1});
 assert.equal(g.pendingDecision?.actor,0);
 assert.ok(g.pendingDecision.options.some(o=>o.id==='attack:'+i));
 choose(g,'attack:'+i);
}
{
 const g=game('base1-12');
 copied(g,'Lure');assert.equal(g.pendingDecision.actor,0);
 assert.equal(g.pendingDecision.options.length,2);
 assert.equal(g.pendingDecision.options[0].id,'bench:0');
 const reject=applyCommand(g,1,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:1']}});
 assert.equal(reject.ok,false,'Defender cannot choose attack-copy target');
 choose(g,'bench:1');
 assert.equal(g.players[1].active.id,'base1-46');
 assert.equal(g.players[1].bench[1].id,'base1-12');
 assert.equal(g.pendingDecision,null);
}
{
 const g=game('base2-35',[],['base1-46','base1-58']);
 copied(g,'Teleport');assert.equal(g.pendingDecision.actor,0);
 choose(g,'bench:1');
 assert.equal(g.players[0].active.id,'base1-58','Copied Teleport switches the copy USER');
 assert.equal(g.players[0].bench[1].id,'base1-5');
 assert.equal(g.players[1].active.id,'base2-35');
}
{
 const g=game('base3-5');
 copied(g,'Dark Mind');
 assert.equal(g.pendingDecision.actor,0);
 choose(g,'bench:1');
 assert.equal(g.players[1].bench[1].damage,10,'Copied Dark Mind damages chosen Bench');
 assert.equal(g.players[1].bench[0].damage,0);
}
{
 const g=game('base5-7',[],['base1-46','base1-58']);
 copied(g,'Flitter');
 assert.equal(g.pendingDecision?.actor,0,'Any-Pokémon target should be chosen');
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['bench:-1'],'With no Bench, only the defending Active is legal');
 choose(g,'bench:-1');
 assert.equal(g.players[1].active.damage,20,'Copied Flitter targets Active without Weakness/Resistance');
}
{
 const g=game('base5-24');
 copied(g,'Flitter');
 assert.equal(g.pendingDecision?.actor,0);
 choose(g,'bench:0');
 assert.equal(g.players[1].bench[0].damage,20);
 assert.equal(g.players[1].active.damage,0);
}
{
 const g=game('base1-57');
 copied(g,'Whirlwind');
 assert.equal(g.players[1].active.damage,10,'Copied Whirlwind damages first');
 assert.equal(g.pendingDecision.actor,1,'The defending player chooses Whirlwind replacement');
 choose(g,'bench:0');
 assert.equal(g.players[1].active.id,'base1-58');
}
{
 const g=game('base2-35',[],['base1-46']);
 copied(g,'Teleport');
 const r=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:2']}});
 assert.equal(r.ok,false,'Illegal copied Bench index rejected without partial mutation');
 assert.equal(g.players[0].active.id,'base1-5');
 choose(g,'bench:0');assert.equal(g.players[0].active.id,'base1-46');
}
console.log('PASS v0.71: historical Metronome choice chains Lure, Teleport, Dark Mind, Flitter, Whirlwind, actor checks and illegal-target rollback');
