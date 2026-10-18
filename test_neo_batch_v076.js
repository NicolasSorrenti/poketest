'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const U=(id)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:151});
 g.phase='game';g.round=5;g.turn=0;g.turnSerial=12;
 for(const p of g.players){p.active=U('base1-58');p.bench=[U('base1-46')];p.hand=[];p.discard=[];p.deck=['base1-98','base1-99','base1-100','base1-101','base1-102','base1-80','base1-58'];p.prizes=['base1-98','base1-80','base1-58'];}
 g.players[0].hand=['neo4-94','neo1-92'];
 g.players[1].prizeFaceUp=[true,false,true];
 return g;
}
function send(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.equal(r.ok,true,type+': '+r.error);
}
function reveal(g,who){return publicView(g,who).players[1].revealedPrizes;}
function play(g){send(g,0,'play_trainer',{handIndex:0});}
function choose(g,selected){
 const d=g.pendingDecision;assert.ok(d);
 send(g,d.actor,'choose',{decisionId:d.id,selected});
}
function ownedCards(g){const p=g.players[1];return [...p.deck,...p.hand,...p.prizes,...p.discard].sort();}
for(const replace of [false,true]){
 const g=game(),before=ownedCards(g);
 assert.deepEqual(reveal(g,null),[{index:0,id:'base1-98'},{index:2,id:'base1-58'}]);
 play(g);
 assert.equal(g.pendingDecision.actor,0);
 choose(g,[replace?'choice:1':'choice:0']);
 assert.equal(g.pendingDecision,null);
 assert.deepEqual(ownedCards(g),before,'Replacing Prizes preserves every owned card');
 if(replace){
  assert.deepEqual(g.players[1].prizeFaceUp,[],'Replaced Prizes have no inherited reveal flags');
  for(const viewer of [0,1,null])assert.deepEqual(reveal(g,viewer),[],'New Prize identities stay hidden');
  assert.equal(publicView(g,0).players[1].prizes,undefined,'Client cannot see face-down Prize IDs');
  assert.equal(g.players[1].prizes.length,3);
  // After a replacement, Card-Flip Game can select any new Prize again.
  send(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision.kind,'flipPrize');
  assert.equal(g.pendingDecision.options.length,3,'All three replacement Prizes are hidden');
 }else{
  for(const viewer of [0,1,null])
   assert.deepEqual(reveal(g,viewer),[{index:0,id:'base1-98'},{index:2,id:'base1-58'}],
    'Declining replacement retains existing public cards');
  send(g,0,'play_trainer',{handIndex:0});
  assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['prize:1'],
   'Existing Card-Flip reveals remain ineligible after declining');
 }
}
{
 const g=game();g.prizesFaceUp=true;
 play(g);choose(g,['choice:1']);
 for(const viewer of [0,1,null])assert.equal(reveal(g,viewer).length,3,
  'Global all-Prizes-face-up Stadium/Trainer effect still reveals replacement cards');
 assert.deepEqual(g.players[1].prizeFaceUp,[]);
}
console.log('PASS Neo v0.76: Impostor Invention replacement clears stale Card-Flip metadata, preserves declines/global reveal');
