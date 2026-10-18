'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const U=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
function game(hand=[]){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:175});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=19;
 for(const x of g.players){x.active=U('base1-58');x.bench=[U('base1-46')];x.discard=[];x.hand=[];x.deck=['base1-98','base1-99','base1-100','base1-101'];x.prizes=['base1-80','base1-58','base1-99'];}
 g.players[0].hand=['gym2-108',...hand];
 g.players[0].prizeFaceUp=[true,false,true];
 return g;
}
function send(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.equal(r.ok,true,type+': '+r.error);
}
function choose(g,choice){
 const d=g.pendingDecision;assert.ok(d);
 send(g,d.actor,'choose',{decisionId:d.id,selected:[choice]});
}
function play(g){
 send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.actor,0);
 choose(g,'prize:0');
 assert.equal(g.pendingDecision.actor,1,'Opponent controls the permission');
}
{
 const g=game(['base1-101']),n=g.players[0].deck.length;
 play(g);choose(g,'choice:1');
 assert.equal(g.pendingDecision.actor,0,'Owner chooses replacement');
 assert.ok(g.pendingDecision.options.some(o=>o.id==='n:1'));
 choose(g,'n:1');
 assert.equal(g.players[0].prizes[0],'base1-101');
 assert.ok(g.players[0].hand.includes('base1-80'),'Original Prize added to hand');
 assert.equal(g.players[0].prizeFaceUp[0],false);
 assert.deepEqual(publicView(g,null).players[0].revealedPrizes,[{index:2,id:'base1-99'}]);
 assert.equal(g.players[0].deck.length,n,'Accepting does not draw');
}
{
 const g=game(['base1-101']),n=g.players[0].deck.length;
 play(g);choose(g,'choice:0');
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].prizes[0],'base1-80');
 assert.equal(g.players[0].prizeFaceUp[0],false,'Declined Prize turned face-down');
 assert.equal(g.players[0].deck.length,n-1,'Denial draws one');
 assert.ok(g.players[0].hand.includes('base1-101'));
}
{
 const g=game(),n=g.players[0].deck.length;
 play(g);choose(g,'choice:1');
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].deck.length,n,'Approval with no swap cannot draw');
 assert.equal(g.players[0].hand.length,0);
 assert.equal(g.players[0].prizes[0],'base1-80');
 assert.equal(g.players[0].prizeFaceUp[0],true,'No physical swap leaves old public Prize');
}
{
 const g=game(['base1-101']);g.prizesFaceUp=true;
 play(g);choose(g,'choice:1');choose(g,'n:1');
 assert.equal(g.players[0].prizeFaceUp[0],false);
 assert.equal(publicView(g,null).players[0].revealedPrizes.length,3,
 'Global reveal continues to show replacement cards');
}
console.log('PASS Gym v0.78: Mistys Wish denied draw, approved exchange, no-spare-card case and Prize privacy');
