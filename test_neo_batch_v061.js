'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const FORMAT=require('./classic_format');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:2,...x});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:83});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=14;g.rngState=104;
 g.players[0].active=U('base1-3',{energies:Array(4).fill('base1-99')});
 g.players[0].bench=[U('base1-46')];
 g.players[1].active=U('base1-58',{energies:['base1-102']});
 g.players[1].bench=[U('base1-46')];
 for(const p of g.players){p.prizes=Array(6).fill('base1-99');p.deck=Array(30).fill('base1-99');p.hand=[];p.discard=[];}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,ids){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:ids??[d.options[0].id]});}
function attach(g,tool,side=1,slot=0){
 g.turn=side;g.players[side].hand.push(tool);send(g,side,'play_trainer',{handIndex:g.players[side].hand.length-1});
 const id='slot:'+slot;assert.ok(g.pendingDecision.options.some(o=>o.id===id),'Must have legal Tool target');choose(g,[id]);
 assert.ok((slot===-1?g.players[side].active:g.players[side].bench[slot]).attachedTrainers.some(t=>t.id===tool));
 g.turn=0;
}
for(const id of require('./neo_v061_pool').ids){
 assert.equal(FORMAT.isAllowed(id,{neo:true}),true);
 assert.ok(new ClassicLocalService().cardPool().find(c=>c.id===id)?.supported,id);
}
{
 const g=game();attach(g,'neo1-86',1,-1);
 assert.equal(g.players[1].active.attachedTrainers[0].id,'neo1-86');
 const r=applyCommand(g,1,{type:'play_trainer',payload:{handIndex:0}});
 assert.equal(r.ok,false,'Cannot play a Trainer without it being in hand');
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<12000&&!(heads&&tails);seed+=937){
  const g=game();g.rngState=seed;g.players[1].active.attachedTrainers=[{id:'neo1-86'}];
  send(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].discard.includes('neo1-86'),true,'Focus Band always discarded after trigger');
  if(g.players[1].active?.id==='base1-58'){
   heads=true;assert.equal(g.players[1].active.damage,30,'Heads preserves exactly 10 HP');
   assert.equal(g.players[1].discard.includes('base1-58'),false);
  }else{
   tails=true;assert.ok(g.players[1].discard.includes('base1-58'),'Tails does not prevent KO');
  }
 }
 assert.ok(heads&&tails,'Focus Band must resolve both seeded outcomes');
}
{
 const g=game();g.turn=1;g.players[1].active.damage=30;g.players[1].active.poison=true;
 g.players[1].active.attachedTrainers=[{id:'neo1-86'}];
 send(g,1,'end_turn');
 assert.equal(g.players[1].discard.includes('base1-58'),true,'Poison KO is not prevented by Focus Band');
 assert.equal(g.players[1].discard.includes('neo1-86'),true);
 assert.equal(g.message.some(t=>/Focus Band saved/.test(typeof t==='string'?t:JSON.stringify(t))),false);
}
{
 const g=game();attach(g,'neo4-93');
 send(g,0,'attack',{attackIndex:1});
 assert.equal(g.pendingDecision?.actor,1,'Defender owns EXP.ALL trigger choice');
 assert.equal(g.pendingDecision.kind,'neo-exp-all');
 assert.ok(g.pendingDecision.options.every(o=>o.id.startsWith('move:0:')));
 choose(g,[g.pendingDecision.options[0].id]);
 assert.equal(g.players[1].bench[0].energies.includes('base1-102'),true,'Basic Energy moved before KO');
 assert.equal(g.players[1].discard.includes('neo4-93'),true,'EXP.ALL consumed on accepted move');
 assert.equal(g.players[1].discard.includes('base1-102'),false);
 assert.equal(g.players[1].discard.includes('base1-58'),true,'Active still Knocked Out');
}
{
 const g=game();attach(g,'neo4-93');
 send(g,0,'attack',{attackIndex:1});
 const d=g.pendingDecision;assert.equal(d.actor,1);send(g,1,'choose',{decisionId:d.id,selected:[]});
 assert.equal(g.players[1].bench[0].attachedTrainers.some(t=>t.id==='neo4-93'),true,'Decline keeps EXP.ALL');
 assert.equal(g.players[1].discard.includes('base1-102'),true,'Basic Energy follows KO when declined');
}
{
 const g=game();attach(g,'neo4-93');
 g.players[1].active.energies=['base1-96'];
 send(g,0,'attack',{attackIndex:1});
 assert.notEqual(g.pendingDecision?.kind,'neo-exp-all','Special Energy never qualifies');
 assert.equal(g.players[1].bench[0].attachedTrainers.some(t=>t.id==='neo4-93'),true);
}
{
 const g=game();attach(g,'neo4-93');
 send(g,0,'attack',{attackIndex:1});
 const d=g.pendingDecision;
 const r=applyCommand(g,1,{type:'choose',payload:{decisionId:d.id,selected:['move:4:50']}});
 assert.equal(r.ok,false,'Invalid ENERGY/target cannot be submitted');
 assert.equal(g.pendingDecision.id,d.id,'Rejected selection preserves transaction');
}
console.log('PASS Neo v0.61: tool attach, Focus Band KO coin/status, EXP.ALL accepted/declined, ownership, Basic-only and atomic decisions');
