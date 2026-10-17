'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const CLASSIC=require('./classic_trainer_core');
const cards=['base1','base2','base3','base5'].flatMap(s=>require('./cards/'+s+'.json'));
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,energy=['base1-99','base1-98'],damage=20)=>({id,under:[],energies:[...energy],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
const trainers=cards.filter(c=>c.supertype==='Trainer');
function ledger(g){return g.players.flatMap(p=>[...p.deck,...p.hand,...p.prizes,...p.discard,...[p.active,...p.bench].filter(Boolean).flatMap(u=>[u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id)])]).sort();}
let passes=0;
for(const c of trainers){
 const g=createGame({decks:[deck,deck],format:'classic',seed:482});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;
 const p=g.players[0],f=g.players[1];
 p.active=unit('base1-44');p.bench=[unit('base1-27'),unit('base1-52')];
 f.active=unit('base1-44');f.bench=[unit('base1-27'),unit('base1-44')];
 p.deck=['base1-34','base1-99','base1-98','base1-27','base1-52','base1-44','base1-91','base1-2','base5-20'];
 f.deck=[...p.deck];
 p.discard=['base1-91','base1-99','base1-44','base1-52'];f.discard=[...p.discard];
 p.prizes=Array(6).fill('base1-99');f.prizes=Array(6).fill('base1-99');
 p.hand=[c.id,'base1-44','base1-91','base1-94','base1-102','base1-34','base1-98'];
 f.hand=['base1-91','base1-93','base1-94'];
 // Ensure Pokémon Breeder has a legal Stage 2 / Basic match.
 if(c.name==='Pokémon Breeder'){p.hand.push('base1-2');p.active=unit('base1-63');}
 if(c.name==='Devolution Spray'){p.active=unit('base1-34');p.active.under=['base1-52'];}
 if(c.name==='Revive'||c.name==='Pokémon Flute')p.bench=p.bench.slice(0,1),f.bench=f.bench.slice(0,1);
 if(c.name==='Challenge!'){p.bench=p.bench.slice(0,1);f.bench=f.bench.slice(0,1);}
 if(c.name==='Pokémon Trader')p.hand.push('base1-44');
 const before=ledger(g);
 const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.ok(r.ok,`${c.id} ${c.name} initiation: ${r.error}`);
 let steps=0;
 while(g.pendingDecision&&steps++<10){const d=g.pendingDecision;const choices=d.options.slice(0,d.min).map(x=>x.id);
  const res=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected:choices}});
  assert.ok(res.ok,`${c.id} ${c.name} stage ${d.kind}: ${res.error}`);
 }
 assert.ok(steps<10,`${c.name}: stalled decision chain`);
 assert.equal(g.pendingDecision,null,c.name+' unfinished');
 assert.deepEqual(ledger(g),before,`${c.name} changed the number or identity of cards`);
 assert.ok(g.players[0].discard.includes(c.id)||g.players[0].active.attachedTrainers.some(t=>t.id===c.id)||g.players[0].bench.some(u=>u.attachedTrainers.some(t=>t.id===c.id)),`${c.name} was not played`);
 passes++;
}
console.log(`PASS Classic Trainer matrix: ${passes}/${trainers.length} physical records, ${new Set(trainers.map(c=>c.name)).size} distinct Trainers with end-to-end choice resolution`);
