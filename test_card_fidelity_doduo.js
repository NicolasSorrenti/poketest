'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-48',format:'classic',grass:'base1-99',fire:'base1-98',dce:'base1-96'},
 {id:'base1-48',format:'neo-theme',grass:'base1-99',fire:'base1-98',dce:'base1-96'},
 {id:'base1-48',format:'online-preview',grass:'base1-99',fire:'base1-98',dce:'base1-96',size:60},
 {id:'base1-48',format:'online-preview',grass:'base1-99',fire:'base1-98',dce:'base1-96',size:40},
 {id:'base4-72',format:'online-preview',grass:'base4-127',fire:'base4-126',dce:'base4-124',size:60},
 {id:'base4-72',format:'online-preview',grass:'base4-127',fire:'base4-126',dce:'base4-124',size:40}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){const size=v.size||60,deck=Array(4).fill(v.id).concat(Array(size-4).fill(v.grass));
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:103});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(size===40?4:6).fill(v.grass);p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'unpaid Fury Attack must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}

const sequences=[{seed:0,flips:['tails','tails'],heads:0},{seed:3,flips:['tails','heads'],heads:1},{seed:682,flips:['heads','tails'],heads:1},{seed:686,flips:['heads','heads'],heads:2}];
let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),a=c.attacks[0];assert.equal(c.name,'Doduo');assert.equal(c.hp,'50');assert.deepEqual(c.types,['Colorless']);
 assert.equal(a.name,'Fury Attack');assert.deepEqual(a.cost,['Colorless']);assert.equal(a.damage,'10x');
 assert.equal(a.text,'Flip 2 coins. This attack does 10 damage times the number of heads.');scenarios++;
 const other=CATALOG.get(v.id==='base1-48'?'base4-72':'base1-48').attacks[0];
 assert.deepEqual({name:a.name,cost:a.cost,damage:a.damage,text:a.text},{name:other.name,cost:other.cost,damage:other.damage,text:other.text});scenarios++;
 // Exercise TT, TH, HT and HH. Count each head and preserve flip order; no
 // player chooses a result or the damage amount.
 for(const test of sequences){const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.rngState=test.seed;g.coinFlips=[];g.coinSeq=0;
  act(g,0,'attack',{attackIndex:0});assert.deepEqual(g.coinFlips.map(x=>x.result),test.flips);
  assert.equal(g.players[1].active.damage,10*test.heads);assert.equal(g.pendingDecision,null);scenarios++;}
 // One Double Colorless card pays the one-unit cost; it does not add heads or damage.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);g.rngState=686;g.coinFlips=[];g.coinSeq=0;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.coinFlips.length,2);assert.equal(g.pendingDecision,null);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
console.log(`PASS Doduo Fury Attack cost, both flips, head count and Base Set print parity (${scenarios} reducer scenarios)`);
