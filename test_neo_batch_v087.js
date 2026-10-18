'use strict';
const assert=require('node:assert/strict');
const A=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v087');
const en={Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Grass:'base1-99',Fighting:'base1-97',Psychic:'base1-101',Colorless:'base1-99',Darkness:'neo1-104'};
const U=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
const printed=(id,name)=>{const a=CATALOG.get(id)?.attacks.find(x=>x.name===name);assert.ok(a,id+' '+name);return a;};
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=printed(id,name),p=A.compile(a);
 assert.equal(p?.kind,kind==='stoke'?'afternoon-nap':kind==='call-for-murkrow'?'call-family':'neo87:'+kind);
 assert.equal(A.compile({...a,text:a.text+' modified'}),null);
}
assert.notEqual(A.compile(printed('neo3-1','Gigavolt')).kind,'neo87:gigavolt','preserve historical v040 Gigavolt');
assert.notEqual(A.compile(printed('neo4-11','Mountain Smasher')).kind,'neo87:mountain-smasher','preserve historical v040 Mountain Smasher');
const resolve=(id,name,seq,ctx={})=>{const picks=[...seq];return A.resolve(A.compile(printed(id,name)),()=>{assert.ok(picks.length);return picks.shift();},ctx);};
assert.equal(resolve('neo3-1','Gigavolt',[true]).damage,60);
assert.equal(resolve('neo3-1','Gigavolt',[false]).status,'Paralyzed');
assert.equal(resolve('neo3-24','Swipe',[true]).discardOpponentTools,true);
assert.equal(resolve('neo3-24','Swipe',[false]).discardOpponentTools,undefined);
assert.equal(resolve('neo4-11','Mountain Smasher',[true,false,true],{selfEnergy:3}).damage,40);
assert.equal(resolve('neo4-11','Mountain Smasher',[true,false,true],{selfEnergy:3}).millOpponent,2);
assert.equal(resolve('neo4-11','Mountain Smasher',[],{selfEnergy:0}).damage,0);
function make(id,name){
 const deck=list('base1:Brushfire');const g=createGame({decks:[deck,deck],format:'online-preview',seed:321});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=345;
 g.players[0].active=U(id,{energies:printed(id,name).cost.map(t=>en[t])});
 g.players[1].active=U('base1-2');
 for(const p of g.players){p.bench=[U('base1-44')];p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function use(g,name){send(g,0,'attack',{attackIndex:CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name)});}
{
 const g=make('neo3-7','Stoke');const before=g.players[0].active.energies.length;
 use(g,'Stoke');const d=g.pendingDecision;assert.equal(d?.actor,0);
 send(g,0,'choose',{decisionId:d.id,selected:[d.options[0].id]});
 assert.equal(g.players[0].active.energies.length,before+1);
}
{
 const g=make('neo3-46','Call for Family');g.players[0].deck.push('neo3-46');
 const prior=g.players[0].bench.length;
 use(g,'Call for Family');const d=g.pendingDecision;assert.equal(d?.actor,0);
 assert.ok(d.options.some(x=>x.label==='Murkrow'));
 send(g,0,'choose',{decisionId:d.id,selected:[d.options[0].id]});
 assert.equal(g.players[0].bench.length,prior+1);
 assert.equal(g.players[0].bench.at(-1).id,'neo3-46');
}
{
 let sawHeads=false,sawTails=false;
 for(let seed=0;seed<100&&(!sawHeads||!sawTails);seed++){
  const g=make('neo3-24','Swipe');g.rngState=seed*6553600;
  g.players[1].active.attachedTrainers=[{id:'base1-80',expires:100}];
  g.players[1].bench[0].attachedTrainers=[{id:'neo1-93',expires:100}];
  use(g,'Swipe');
  if(g.coinFlips.at(-1).result==='heads'){
   sawHeads=true;
   assert.deepEqual(g.players[1].active.attachedTrainers,[]);
   assert.deepEqual(g.players[1].bench[0].attachedTrainers,[]);
   assert.ok(g.players[1].discard.includes('base1-80'));
   assert.ok(g.players[1].discard.includes('neo1-93'));
  }else{
   sawTails=true;
   assert.equal(g.players[1].active.attachedTrainers.length,1);
   assert.equal(g.players[1].bench[0].attachedTrainers.length,1);
  }
 }
 assert.ok(sawHeads&&sawTails,'both Swipe outcomes');
}
{
 const g=make('neo4-11','Mountain Smasher');g.players[0].active.energies=['base1-97','base1-97','base1-97','base1-97'];
 const before=g.players[1].deck.length;
 use(g,'Mountain Smasher');
 const heads=g.coinFlips.slice(-4).filter(x=>x.result==='heads').length;
 assert.equal(g.players[1].deck.length,before-heads-1,'Mountain Smasher mills each heads, then opponent draws for next turn');
 assert.equal(g.players[1].active.damage,20*heads);
}
console.log('PASS Neo v087: 3 newly signed attacks, two retained v040 scripts, owned searches, tools and deck milling');
