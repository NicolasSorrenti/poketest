'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
function game(p0,p1){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:177});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=22;
 for(const p of g.players){p.active=U('base1-58');p.bench=[U('base1-46')];p.deck=Array(8).fill('base1-99');p.hand=[];p.discard=[];}
 g.players[0].hand=['gym1-112'];g.players[0].prizes=p0;g.players[1].prizes=p1;
 return g;
}
function send(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.equal(r.ok,true,type+': '+r.error);
}
function choose(g,v){
 const d=g.pendingDecision;assert.ok(d);
 send(g,d.actor,'choose',{decisionId:d.id,selected:[v]});
}
function take(g){
 send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.actor,1);
 choose(g,'mode:0');
 choose(g,'prize:0');choose(g,'prize:0');
 assert.equal(g.pendingDecision,null);
}
{
 const g=game(['base1-80'],['base1-98','base1-99']);
 take(g);
 assert.equal(g.players[0].prizes.length,0);
 assert.equal(g.players[1].prizes.length,1);
 assert.equal(g.over,true,'Treaty last Prize ends match');
 assert.equal(g.winner,0,'Treaty player taking their last Prize wins');
 assert.equal(applyCommand(g,0,{type:'end_turn',payload:{}}).ok,false,'Completed game refuses further moves');
}
{
 const g=game(['base1-80','base1-99'],['base1-98']);
 take(g);
 assert.equal(g.over,true);
 assert.equal(g.winner,1,'Opponent can win if their last Prize taken');
}
{
 const g=game(['base1-80'],['base1-98']);
 take(g);
 assert.equal(g.over,true);
 assert.equal(g.winner,null,'Simultaneous last Prize has no single winner; sudden death pending');
}
{
 const g=game(['base1-80'],['base1-98']);
 send(g,0,'play_trainer',{handIndex:0});choose(g,'mode:1');
 assert.equal(g.over,false,'Draw-only Treaty never awards final Prize');
 assert.equal(g.winner,null);
}
console.log('PASS Gym v0.79: Treaty detects final Prize victory and simultaneous historical win conditions');
