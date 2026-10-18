'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const U=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:153});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;
 for(const p of g.players){p.active=U('base1-58');p.bench=[U('base1-46')];p.hand=[];p.discard=[];p.deck=Array(8).fill('base1-99');}
 g.players[0].prizes=['base1-98','base1-80','base1-58'];g.players[0].prizeFaceUp=[true,false,true];
 g.players[1].prizes=['base1-100','base1-101','base1-102'];g.players[1].prizeFaceUp=[true,true,false];
 g.players[0].hand=['gym1-112'];return g;
}
function send(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.equal(r.ok,true,type+': '+r.error);
}
function choose(g,choice){
 const d=g.pendingDecision;assert.ok(d,'Expected server-authorized Treaty decision');
 send(g,d.actor,'choose',{decisionId:d.id,selected:[choice]});
}
function revealed(g,owner){
 return publicView(g,null).players[owner].revealedPrizes;
}
{
 const g=game();send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.actor,1,'Opponent chooses Treaty outcome');
 choose(g,'mode:0');
 assert.equal(g.pendingDecision.actor,1,'Opponent chooses their own Prize');
 choose(g,'prize:1');
 assert.equal(g.pendingDecision.actor,0,'Treaty player chooses their own Prize');
 choose(g,'prize:0');
 assert.equal(g.pendingDecision,null);
 assert.deepEqual(g.players[1].prizes,['base1-100','base1-102']);
 assert.deepEqual(g.players[1].prizeFaceUp,[true,false]);
 assert.deepEqual(g.players[0].prizes,['base1-80','base1-58']);
 assert.deepEqual(g.players[0].prizeFaceUp,[false,true]);
 assert.deepEqual(revealed(g,1),[{index:0,id:'base1-100'}]);
 assert.deepEqual(revealed(g,0),[{index:1,id:'base1-58'}]);
 assert.ok(g.players[1].hand.includes('base1-101'));
 assert.ok(g.players[0].hand.includes('base1-98'));
 for(const viewer of [0,1,null]){
  const view=publicView(g,viewer);
  assert.deepEqual(view.players[0].revealedPrizes,[{index:1,id:'base1-58'}]);
  assert.deepEqual(view.players[1].revealedPrizes,[{index:0,id:'base1-100'}]);
 }
}
{
 const g=game(),before=g.players.map(p=>[...p.prizes]),flags=g.players.map(p=>[...p.prizeFaceUp]);
 send(g,0,'play_trainer',{handIndex:0});choose(g,'mode:1');
 assert.deepEqual(g.players.map(p=>p.prizes),before,'Draw mode does not touch Prizes');
 assert.deepEqual(g.players.map(p=>p.prizeFaceUp),flags,'Draw mode does not touch reveal flags');
 assert.equal(g.players[0].hand.length,1,'Treaty player draws exactly one card');
 assert.equal(g.players[1].hand.length,0);
}
console.log('PASS Gym v0.77: Lt Surge Treaty keeps per-player face-up Prize flags aligned during Prize claims');
