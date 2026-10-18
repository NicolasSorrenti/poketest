'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),T=require('../rpg_tournaments');
const state=(day=30)=>T.hydrate({day,slot:1,location:'center',points:0,credits:80,pendingDuel:null});
test('all brackets have three distinct rounds',()=>{assert.deepEqual(T.validate(),[]);assert.equal(T.cups.length,3);});
test('real victories advance rounds and pay once',()=>{const s=state();for(let i=0;i<3;i++){const d=T.begin(s,'neighborhood');assert.equal(d.tournamentRound,i);const out=T.settle(s,d,{outcome:'Victory'});assert.equal(out.won,true);assert.equal(T.settle(s,d,{outcome:'Victory'}),null);}assert.equal(T.status(s,'neighborhood').state,'champion');assert.equal(s.points,27);assert.equal(s.credits,133);assert.throws(()=>T.begin(s,'neighborhood'));});
test('defeat eliminates without awarding tournament bonuses',()=>{const s=state(60),d=T.begin(s,'regional');const out=T.settle(s,d,{outcome:'Defeat'});assert.equal(out.state,'eliminated');assert.equal(s.points,0);assert.equal(s.credits,80);assert.equal(T.available(s).length,0);});
test('draw permits a rematch and records result',()=>{const s=state(),d=T.begin(s,'neighborhood');assert.equal(T.settle(s,d,{outcome:'Draw'}).draw,true);assert.equal(T.status(s,'neighborhood').round,0);assert.equal(T.status(s,'neighborhood').results.length,1);assert.equal(T.begin(s,'neighborhood').npc,d.npc);});
test('different brackets preserve independent save state',()=>{const s=state(),d=T.begin(s,'neighborhood');T.settle(s,d,{outcome:'Victory'});s.day=60;const q=T.begin(s,'regional');T.settle(s,q,{outcome:'Victory'});const loaded=JSON.parse(JSON.stringify(s));assert.equal(T.status(loaded,'neighborhood').round,1);assert.equal(T.status(loaded,'regional').round,1);});
test('late registration expires and prevents replay',()=>{const s=state(36);assert.ok(T.expire(s).includes('neighborhood'));s.day=30;assert.equal(T.available(s).length,0);});
test('championship rounds fit within final days',()=>{const s=state(88);assert.equal(T.begin(s,'championship').npc,'kaede');s.day=91;assert.ok(T.expire(s).includes('championship'));});

test('repeated draw receipt cannot settle same bracket attempt twice',()=>{
 const s=state(),d=T.begin(s,'neighborhood');
 assert.equal(T.settle(s,d,{outcome:'Draw'}).draw,true);
 assert.equal(T.settle(s,d,{outcome:'Draw'}),null);
 assert.equal(T.status(s,'neighborhood').results.length,1);
 const next=T.begin(s,'neighborhood');
 assert.notEqual(d.tournamentAttempt,next.tournamentAttempt);
 T.settle(s,next,{outcome:'Victory'});
 assert.equal(T.status(s,'neighborhood').round,1);
});
test('malformed receipt cannot mutate bracket progression',()=>{
 const s=state(),d=T.begin(s,'neighborhood'),before=JSON.stringify(s);
 assert.throws(()=>T.settle(s,d,{outcome:'Unknown'}),/Invalid/);
 assert.equal(JSON.stringify(s),before);
});
