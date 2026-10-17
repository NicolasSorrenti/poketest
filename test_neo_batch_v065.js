'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const F=require('./classic_format');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function setup(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:43});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=15;
 g.players[0].active=U('base1-46');g.players[0].bench=[U('base1-58')];
 g.players[1].active=U('base1-58');g.players[1].bench=[U('base1-46')];
 g.players[0].hand=['neo1-92'];g.players[0].deck=Array(20).fill('base1-99');
 g.players[1].hand=[];g.players[1].deck=Array(20).fill('base1-99');
 g.players[0].prizes=['base1-98','base1-99','base1-46'];
 g.players[1].prizes=['base1-98','base1-80','base1-58'];
 for(const p of g.players){p.discard=[];p.energyUsed=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d,'Expected a decision');act(g,d.actor,'choose',{decisionId:d.id,selected:[id]});}
assert.equal(F.isAllowed('neo1-92',{neo:true}),true);
assert.equal(new ClassicLocalService().cardPool().find(c=>c.id==='neo1-92')?.supported,true);
for(const [index,guess,correct] of [[0,0,true],[1,1,true],[2,2,true],[0,2,false],[1,0,false]]){
 const g=setup(),before=g.players[0].hand.length,oldDeck=g.players[0].deck.length;
 act(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.actor,0);
 assert.equal(g.pendingDecision.options.length,3);
 assert.ok(g.pendingDecision.options.every(x=>/^prize:\d+$/.test(x.id)&&!x.label.includes('Energy')&&!x.label.includes('Trainer')),'Prizes must be hidden in choices');
 assert.equal(publicView(g,0).players[1].revealedPrizes.length,0);
 assert.equal(publicView(g,1).players[1].revealedPrizes.length,0);
 assert.equal(publicView(g,null).players[1].revealedPrizes.length,0);
 choose(g,'prize:'+index);assert.equal(g.pendingDecision.actor,0);
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['kind:0','kind:1','kind:2']);
 choose(g,'kind:'+guess);
 assert.equal(g.pendingDecision,null);
 for(const viewer of [0,1,null]){
  const view=publicView(g,viewer),prizes=view.players[1].revealedPrizes;
  assert.deepEqual(prizes,[{index,id:g.players[1].prizes[index]}],'Face-up Prize must be public to both players and spectators');
  assert.equal(JSON.stringify(view).includes(g.players[1].prizes.filter((_,i)=>i!==index)[0]),false,'Other Prize identity must stay hidden');
 }
 assert.equal(g.players[1].prizes.length,3,'Card-Flip must not take the Prize');
 assert.equal(g.players[0].hand.length,before-1+(correct?2:0),'Only correct guesses draw 2');
 assert.equal(g.players[0].deck.length,oldDeck-(correct?2:0));
 assert.equal(g.players[0].discard.includes('neo1-92'),true);
 const copy=structuredClone(g);assert.deepEqual(publicView(copy,null).players[1].revealedPrizes,publicView(g,null).players[1].revealedPrizes,'Face-up state survives serialization');
 if(index<2){
  g.players[0].hand=['neo1-92'];act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision.options.some(o=>o.id==='prize:'+index),false,'A revealed Prize cannot be selected again');
 }
}
{
 const g=setup();g.players[1].prizes=['base1-98','base1-80','base1-58'];g.players[1].prizeFaceUp=[true,false,true];
 g.turn=1;g.players[1].active=U('base1-46',{energies:['base1-98']});
 g.players[0].active=U('base1-58',{damage:30});
 act(g,1,'attack',{attackIndex:0});
 if(g.pendingDecision?.kind==='prize-card')choose(g,'prize:0');
 assert.equal(g.players[1].prizes.length,2);
 assert.deepEqual(g.players[1].prizeFaceUp,[false,true],'Taking the first Prize shifts reveal flags with remaining Prizes');
 assert.deepEqual(publicView(g,0).players[1].revealedPrizes,[{index:1,id:'base1-58'}]);
}
{
 const g=setup();g.players[1].prizeFaceUp=[true,true,true];
 const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.equal(r.ok,false,'No Card-Flip if opponent has no face-down Prizes');
 assert.deepEqual(g.players[0].hand,['neo1-92'],'Rejected action is transactional');
}
console.log('PASS Neo v0.65: Card-Flip guesses, private selection, permanent public reveal, Prize index shifts, serializable state');
