'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const FORMAT=require('./classic_format'),TRAINERS=require('./classic_trainer_core');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(trainer,seed=104){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed});
 g.phase='game';g.round=5;g.turn=0;g.turnSerial=12;g.rngState=seed;
 g.players[0].active=U('base1-58');g.players[0].bench=[U('base1-3')];
 g.players[1].active=U('base1-58');g.players[1].bench=[U('base1-3')];
 g.players[0].hand=[trainer,'base1-98'];g.players[1].hand=['base1-80','base1-99'];
 g.players[0].deck=['base1-99','base1-99','base1-98','neo2-50'];
 g.players[1].deck=['base1-100','base1-101','base1-102','base1-99'];
 g.players[0].discard=[];g.players[1].discard=[];
 for(const p of g.players)p.prizes=Array(6).fill('base1-99');
 return g;
}
function doIt(g,actor,type,payload={}){const r=applyCommand(g,actor,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function play(g){doIt(g,0,'play_trainer',{handIndex:0});}
function choose(g,value){const d=g.pendingDecision;assert.ok(d,'Expected Trainer decision');doIt(g,d.actor,'choose',{decisionId:d.id,selected:value??[d.options[0].id]});}
const pool=new ClassicLocalService().cardPool();
for(const id of require('./neo_v054_pool').ids){assert.ok(pool.find(c=>c.id===id)?.supported,id);assert.ok(FORMAT.isAllowed(id,{neo:true}),id);}
{
 const g=game('neo1-83');g.players[0].deck=['base1-99','base1-99','base1-98'];
 play(g);assert.equal(g.players[0].hand.filter(id=>id==='base1-99').length,2,'Arcade Game takes same-name cards');assert.equal(g.players[0].deck.length,1);
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<10000&&!(heads&&tails);seed+=977){
  const g=game('neo1-85',seed);g.players[0].discard=['base1-98','neo1-104'];
  play(g);
  if(g.pendingDecision){heads=true;assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2);
   choose(g,[g.pendingDecision.options[0].id]);assert.equal(g.players[0].discard.length,1);}
  else {tails=true;assert.equal(g.players[0].discard.length,2);}
 }
 assert.ok(heads&&tails,'Energy Charge both flips');
}
{
 const g=game('neo2-74');play(g);
 assert.equal(g.pendingDecision.actor,0);assert.ok(g.pendingDecision.options.some(x=>x.label.startsWith('Unown')));
 choose(g);assert.ok(g.players[0].bench.some(x=>x.id==='neo2-50'));
}
{
 let recovered=false;
 for(let seed=0;seed<10000&&!recovered;seed+=977){
  const g=game('neo3-64',seed);g.players[0].discard=['base1-3','base1-80'];
  play(g);
  if(g.pendingDecision){const candidate=g.pendingDecision.options[0].label;choose(g);assert.ok(g.players[0].hand.some(id=>id==='base1-3'||id==='base1-80'));recovered=true;}
 }
 assert.ok(recovered,'Old Rod has a selectable recovery branch');
}
{
 const g=game('neo4-103');play(g);
 assert.equal(g.pendingDecision.actor,0);choose(g,['hand:0']);
 assert.equal(g.pendingDecision.actor,1,'Opponent chooses how many cards to draw');
 choose(g,['count:2']);
 assert.equal(g.players[1].hand.length,3,'Opposing hand loses one then draws two');
 assert.ok(g.players[1].deck.includes('base1-80')||g.players[1].hand.includes('base1-80'));
}
console.log('PASS Neo v0.54: Arcade Game, Energy Charge, Ruin Wall, Old Rod and Evil Deeds');
