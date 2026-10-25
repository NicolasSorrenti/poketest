'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VARIANTS,parse,evaluate}=require('../scripts/apex-championship');
const {FIXTURES}=require('../scripts/benchmark-cpu-competitive');
test('championship variants are explicit and never silently promoted',()=>{
 assert.equal(VARIANTS.champion.level,8);
 assert.equal(VARIANTS.mastermind.level,7);
 assert.equal(Object.keys(VARIANTS).length,5);
 assert.throws(()=>parse(['--challenger','champion']),/Unknown group or challenger/);
 assert.throws(()=>parse(['--challenger','unknown']),/Unknown group or challenger/);
 assert.throws(()=>parse(['--pairs','0']),/Invalid numeric parameter/);
});
test('every championship group contains six real-engine competitive matchups',()=>{
 for(const [group,fixtures] of Object.entries(FIXTURES)){
  assert.equal(fixtures.length,6,group);
  assert.equal(parse(['--group',group,'--challenger','direct']).group,group);
 }
});
test('championship smoke runs with mirrored seats and returns no promotion',()=>{
 const p=parse(['--group','aggression','--challenger','mastermind','--pairs','1','--max-turns','30','--seed','9327']);
 const r=evaluate(p);
 assert.equal(r.errors.length,0,JSON.stringify(r.errors));
 assert.equal(r.games,12);
 assert.equal(r.challengerWins+r.championWins+r.unfinished,12);
 assert.equal(r.promotionEligible,false);
 assert.equal(r.rows.length,6);
});
