'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const FORMAT=require('./classic_format');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(trainer,seed=22){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:72});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=19;g.rngState=seed;
 g.players[0].active=U('base1-3');g.players[0].bench=[U('base1-46')];
 g.players[1].active=U('base1-58',{energies:['base1-99','base1-100','base1-102']});g.players[1].bench=[U('base1-46')];
 g.players[0].hand=[trainer];g.players[1].hand=[];
 g.players[0].deck=['base1-98','base1-99','base1-100','base1-101','base1-102','base1-97','base1-80','base1-46'];
 g.players[1].deck=Array(20).fill('base1-99');
 for(const p of g.players){p.discard=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,selected){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:selected??[d.options[0].id]});}
for(const id of require('./neo_v064_pool').ids){assert.ok(FORMAT.isAllowed(id,{neo:true}),id);assert.ok(new ClassicLocalService().cardPool().find(c=>c.id===id)?.supported,id);}
{
 const g=game('neo1-95'),original=[...g.players[0].deck].sort().join('|');
 send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.actor,0);
 assert.equal(g.pendingDecision.options.length,5,'Owner sees five shuffled top cards');
 assert.equal(JSON.stringify(publicView(g,1)).includes('New Pokédex: select'),false,'Opponent does not see private reorder');
 const ordered=[];
 for(let i=0;i<5;i++){
  const d=g.pendingDecision;assert.equal(d.actor,0);assert.equal(d.options.length,5-i);
  const chosen=d.options[d.options.length-1];ordered.push(chosen.label);choose(g,[chosen.id]);
 }
 assert.equal(g.pendingDecision,null);
 assert.deepEqual(g.players[0].deck.slice(-5).reverse().map(id=>require('./headless_duel').CATALOG.get(id).name),ordered,'Future draws match chosen order');
 assert.equal([...g.players[0].deck].sort().join('|'),original,'Reordering never changes card counts');
 assert.ok(g.players[0].discard.includes('neo1-95'));
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<20000&&!(heads&&tails);seed+=991){
  const g=game('neo4-98',seed);g.players[0].hand=['neo4-98','base1-99','base1-46'];
  const original=g.players[0].deck.length;
  send(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision.actor,0);
  assert.equal(g.pendingDecision.options.length,1,'Amplifier requires a real Energy from hand');
  choose(g);
  if(g.pendingDecision){
   heads=true;assert.equal(g.pendingDecision.actor,0);
   assert.ok(g.pendingDecision.options.every(x=>/Energy/.test(x.label)),'Only Basic Energy in search');
   choose(g,g.pendingDecision.options.slice(0,3).map(x=>x.id));
   assert.equal(g.players[0].hand.length,4,'Cost and Trainer gone, three Basic Energy recovered');
   assert.equal(g.players[0].deck.length,original-2);
  }else{
   tails=true;assert.equal(g.players[0].deck.length,original+1);
   assert.deepEqual(g.players[0].hand,['base1-46']);
  }
  assert.ok(g.players[0].discard.includes('neo4-98'));
  assert.equal(g.message.some(x=>/Energy Amplifier revealed/.test(String(x))),true,'Energy shuffled into deck was shown');
 }
 assert.ok(heads&&tails,'Amplifier needs heads and tails tests');
}
{
 let foundChoices=false,foundAuto=false,foundTails=false;
 for(let seed=0;seed<20000&&!(foundChoices&&foundAuto&&foundTails);seed+=761){
  const g=game('neo4-96',seed);
  const before=g.players[1].active.energies.length;
  send(g,0,'play_trainer',{handIndex:0});
  if(g.pendingDecision){
   foundChoices=true;
   assert.equal(g.pendingDecision.actor,0);
   const d=g.pendingDecision;choose(g,d.options.slice(0,d.min).map(x=>x.id));
  }else if(g.players[1].active.energies.length===0)foundAuto=true;
  else foundTails=true;
  assert.equal(g.players[0].turn===undefined,true);
  assert.equal(g.turn,1,'Thought Wave Machine ends user turn immediately');
  const moved=before-g.players[1].active.energies.length;
  assert.equal(g.players[1].hand.length,moved+1,'Transferred Energy plus the mandatory beginning-of-turn draw; no discard');
  assert.equal(g.players[1].discard.length,0);
  assert.ok(g.players[0].discard.includes('neo4-96'));
 }
 assert.ok(foundChoices&&foundAuto&&foundTails,'Thought Wave covers tails, user choice and all-Energy results');
}
console.log('PASS v0.64: exact New Pokédex draw-order, Amplifier energy payment/coin/search, Thought Wave heads choices and forced turn end');
