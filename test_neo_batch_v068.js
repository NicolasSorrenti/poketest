'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:246});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=242;
 g.players[0].active=U('base1-3',{energies:Array(4).fill('base1-99')});g.players[0].bench=[U('base1-46')];
 g.players[1].active=U('base1-58',{energies:['base1-98','base1-102']});
 g.players[1].bench=[U('base1-46',{attachedTrainers:[{id:'neo4-93'}]}),U('base1-5',{attachedTrainers:[{id:'neo4-93'}]})];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(20).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:id?[id]:[d.options[0].id]});}
function settle(g){for(let i=0;i<10&&g.pendingDecision;i++){const d=g.pendingDecision;send(g,d.actor,'choose',{decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)});}assert.equal(g.pendingDecision,null,'All mandatory prize/promote decisions resolved');}
{
 const g=game();send(g,0,'attack',{attackIndex:1}); // Chansey Double-edge 80; defender active KO
 assert.equal(g.pendingDecision?.kind,'neo-exp-all');
 assert.equal(g.pendingDecision.actor,1,'EXP.ALL must be offered to defending owner');
 assert.equal(g.pendingDecision.options.length,4,'2 Basic Energy × 2 holders = 4 choices');
 const id='move:1:1';assert.ok(g.pendingDecision.options.some(x=>x.id===id));
 choose(g,id);
 assert.equal(g.players[1].bench[1].energies.includes('base1-102'),true,'Exactly selected Energy moves to second holder');
 assert.equal(g.players[1].bench[0].attachedTrainers.some(t=>t.id==='neo4-93'),true,'First unused holder keeps Tool');
 assert.equal(g.players[1].bench[1].attachedTrainers.some(t=>t.id==='neo4-93'),false);
 assert.equal(g.players[1].discard.includes('neo4-93'),true);
 assert.equal(g.players[1].discard.includes('base1-98'),true,'Unmoved Energy discarded with KO');
 assert.equal(g.players[1].discard.includes('base1-102'),false);
 settle(g);
 assert.equal(g.players[0].prizes.length,5,'One prize awarded only once');
}
{
 let saved=false,knocked=false;
 for(let seed=1;seed<9000&&!(saved&&knocked);seed+=263){
  const g=game();g.rngState=seed;
  g.players[1].active.attachedTrainers=[{id:'neo1-86'}];
  send(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].discard.includes('neo1-86'),true,'Focus Band consumed regardless of flip');
  if(g.players[1].active?.id==='base1-58'){
   saved=true;assert.equal(g.players[1].active.damage,30);
   assert.notEqual(g.pendingDecision?.kind,'neo-exp-all','A saved Active cannot trigger EXP.ALL');
   assert.equal(g.players[0].prizes.length,6);
  }else{
   knocked=true;assert.equal(g.pendingDecision?.kind,'neo-exp-all','Failed Focus Band permits EXP.ALL');
   choose(g);settle(g);assert.equal(g.players[0].prizes.length,5);
  }
 }
 assert.ok(saved&&knocked,'Test Focus Band heads and tails with EXP.ALL waiting on the Bench');
}
{
 let saved=false,knocked=false;
 for(let seed=1;seed<9000&&!(saved&&knocked);seed+=263){
  const g=game();g.rngState=seed;
  g.players[0].active=U('base1-9',{energies:['base1-100','base1-100','base1-99','base1-99']});
  g.players[1].active=U('base1-3');
  g.players[1].bench=[U('base1-58',{damage:30,attachedTrainers:[{id:'neo1-86'}]}),U('base1-46')];
  send(g,0,'attack',{attackIndex:1}); // Magneton Selfdestruct: bench splash and self-KO
  assert.ok(g.players[1].discard.includes('neo1-86'),'Benched Focus Band consumed');
  const alive=g.players[1].bench.some(u=>u.id==='base1-58');
  if(alive){saved=true;assert.equal(g.players[1].bench.find(u=>u.id==='base1-58').damage,30);}
  else{knocked=true;assert.ok(g.players[1].discard.includes('base1-58'));}
 }
 assert.ok(saved&&knocked,'Both bench Focus Band outcomes must be exercised');
}
{
 const g=game();g.players[0].active=U('base1-9',{energies:['base1-100','base1-100','base1-99','base1-99']});
 g.players[1].bench=[U('base1-46')];g.players[1].active=U('base1-58');
 send(g,0,'attack',{attackIndex:1});
 settle(g);
 assert.equal(g.players[0].prizes.length,5,'Defender active KO gives one Prize');
 assert.equal(g.players[1].prizes.length,5,'Selfdestruct attacker KO gives opposing Prize');
 assert.equal(g.over,false,'With benches remaining, simultaneous Active KOs continue');
 assert.ok(g.players.every(p=>p.active),'Both players promote surviving Bench Pokémon');
}
console.log('PASS v0.68: double-KO and double-EXP.ALL choices, Focus Band prevention/Bench, two-sided Prize settlement');
