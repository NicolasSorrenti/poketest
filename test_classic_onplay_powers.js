'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
const CATALOG=new Map(['base1','base2','base3','base5'].flatMap(s=>require('./cards/'+s+'.json')).map(c=>[c.id,c]));
const variants=['base5-5','base5-22','base5-7','base5-24','base5-12','base5-29'];
function ledger(g){return g.players.flatMap(p=>[...p.deck,...p.hand,...p.prizes,...p.discard,...[p.active,...p.bench].filter(Boolean).flatMap(u=>[u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id)])]).sort();}
let count=0;
for(const id of variants){
 const evolved=CATALOG.get(id);const base=['Dark Dragonite'].includes(evolved.name)?'base1-18':evolved.name==='Dark Golbat'?'base3-57':'base3-55';
 const g=createGame({format:'classic',decks:[deck,deck],seed:2123});g.phase='game';g.round=3;g.turn=0;g.turnSerial=4;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[unit(base)];p.hand=[];p.deck=['base1-44','base1-27','base1-99'];p.discard=['base1-44','base1-27'];p.prizes=Array(6).fill('base1-99');}
 g.players[0].hand=[id];
 const before=ledger(g);
 const r=applyCommand(g,0,{type:'evolve',payload:{handIndex:0,slot:0}});
 assert.ok(r.ok,`${id} / ${evolved.name}: ${r.error}`);
 let steps=0;while(g.pendingDecision){assert.ok(steps++<8);const d=g.pendingDecision;const v=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)}});assert.ok(v.ok,`${id}/${evolved.name} ${d.kind} -> ${v.error}`);}
 assert.deepEqual(ledger(g),before,`${id} on-play evolution card conservation`);
 count++;
}
console.log('PASS Classic on-play Pokémon Powers: ',count,'printed evolution variants');
