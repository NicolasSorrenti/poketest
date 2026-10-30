'use strict';
// Regression for Energy symbols that disappeared from imported mid-sentence text.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const F='base1-98',G='base1-99',W='base1-102',L='base1-100';
function unit(id,energies=[]){return {id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};}
function game(id,energies,seed=21){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed});
 g.phase='game';g.round=7;g.turnSerial=20;g.turn=0;g.rngState=seed;
 g.players[0].active=unit(id,energies);g.players[1].active=unit('base1-3');
 g.players.forEach(p=>{p.bench=[unit('base1-44')];p.hand=[];p.deck=Array(12).fill(G);p.prizes=Array(6).fill(G);p.discard=[];});
 return g;
}
function attack(g,name){
 const card=CATALOG.get(g.players[0].active.id),i=card.attacks.findIndex(a=>a.name===name);
 assert.ok(i>=0,'Missing '+name+' on '+card.id);
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:i}});
 assert.equal(r.ok,true,card.id+': '+r.error);
 return g.pendingDecision;
}
function wrong(g,picks){
 const json=JSON.stringify(g),d=g.pendingDecision;
 const r=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:picks}});
 assert.equal(r.ok,false,'Wrong typed discard was accepted');
 assert.equal(JSON.stringify(g),json,'Rejected choice must be atomic');
}
function valid(g,picks){
 const r=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:picks}});
 assert.equal(r.ok,true,r.error);
}
// Entei: 2 Fire are needed even if other Energy is attached.
{
 const a=CATALOG.get('neo3-6').attacks.find(a=>a.name==='Searing Flames');
 assert.match(a.text,/Discard 2 Fire Energy cards/);
 assert.equal(ATTACK.compile(a)?.onlyType,'Fire');
 const g=game('neo3-6',[F,G,F,F]);
 const d=attack(g,'Searing Flames');
 assert.equal(d,null,'Searing Flames should auto-discard equivalent Fire Energy cards');
 assert.deepEqual(g.players[0].discard,[F,F]);
 assert.equal(g.players[0].active.energies.includes(G),true);
 assert.ok(g.message.some(line=>line.includes('discarded')&&line.includes('Fire Energy')));
}
for(const [id,kind] of [['base5-4','continuous-fireball'],['base5-21','continuous-fireball'],['base5-32','fireball'],['base5-35','playing-with-fire']]){
 const name=kind==='continuous-fireball'?'Continuous Fireball':kind==='fireball'?'Fireball':'Playing with Fire';
 const a=CATALOG.get(id).attacks.find(a=>a.name===name);
 assert.match(a.text,/Fire Energy cards attached to/,id+' type information lost');
 assert.equal(ATTACK.compile(a)?.kind,kind);
 for(const seed of [0x80000000,0xffffffff,0x70000000,0x90000000,0xffff0000,0x75000000,0x12345678,0x87654321,0,1,2]){
  const g=game(id,[F,F,F,G],seed);
  const d=attack(g,name);
  assert.equal(d,null,id+' should auto-discard identical Fire Energy cards');
  const flipCount=kind==='continuous-fireball'?3:1;
  const heads=g.coinFlips.slice(-flipCount).filter(x=>x.result==='heads').length;
  const discarded=kind==='continuous-fireball'?heads:Number(heads>0);
  const damage=kind==='continuous-fireball'?50*heads:kind==='fireball'?(heads?70:0):(heads?50:30);
  assert.equal(g.players[1].active.damage,damage,id+' damage did not match coin result');
  assert.equal(g.players[0].discard.filter(cardId=>cardId===F).length,discarded,id+' discarded wrong number of Fire Energy cards');
  if(discarded)assert.ok(g.message.some(line=>line.includes('discarded')&&line.includes('Fire Energy')),id+' must notify about discarded Energy');
 }
 const g=game(id,[G,G,G,G]);
 const before=JSON.stringify(g);
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:CATALOG.get(id).attacks.findIndex(a=>a.name===name)}});
 if(kind!=='continuous-fireball'){assert.equal(r.ok,false,id+' requires Fire attached');assert.equal(JSON.stringify(g),before);}
}
// A Basic Fire and Rainbow Energy both provide Fire, but discarding them has distinct consequences.
{
 let prompted=false;
 for(const seed of [0x80000000,0xffffffff,0x70000000,0x90000000,0xffff0000,0x75000000,0x12345678,0x87654321,0,1,2]){
  const g=game('base5-32',[F,F,F,'base5-17',G],seed);
  g.players[0].active.damage=10; // Rainbow Energy attachment damage is already accounted for.
  const d=attack(g,'Fireball');
  if(!d)continue;
  prompted=true;
  assert.deepEqual(d.options.map(o=>o.id),['energy:0','energy:1','energy:2','energy:3']);
  wrong(g,['energy:4']);
  valid(g,['energy:3']);
  assert.equal(g.players[0].discard.at(-1),'base5-17');
  assert.ok(g.message.some(line=>line.includes('discarded')&&line.includes('Rainbow Energy')));
  break;
 }
 assert.ok(prompted,'Fireball must preserve a meaningful Basic Fire versus Rainbow choice on heads');
}
// Typhlosion Flame Wheel, explicitly 3 Fire rather than any 3 Energy.
{
 const g=game('neo1-18',[F,F,F,F,G]);
 const d=attack(g,'Flame Wheel');
 assert.equal(d,null,'Flame Wheel should auto-discard equivalent Fire Energy cards');
 assert.deepEqual(g.players[0].discard,[F,F,F]);
 assert.equal(g.players[0].active.energies.includes(G),true);
 assert.ok(g.message.some(line=>line.includes('discarded')&&line.includes('Fire Energy')));
}
console.log('PASS: Entei, Team Rocket Fire costs, and Typhlosion reject non-Fire payments');
