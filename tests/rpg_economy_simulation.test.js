'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SCENARIOS,simulate,report,compare}=require('../scripts/simulate-rpg-economy');
test('balance model is deterministic, uses real reward receipts and does not alter the game state',()=>{
 const a=simulate(SCENARIOS[0],123),b=simulate(SCENARIOS[0],123);
 assert.deepEqual(a,b);
 assert.equal(a.wins+a.losses,30);
 assert.equal(a.voucherPacks,2);
 assert.equal(a.signatureCards,1);
 assert.ok(a.miniPacks<=26);
 assert.equal(a.welcomeMini,2);
 assert.equal(a.totalCardCopies,60+a.welcomeMini*5+a.miniPacks*5+a.shopPacks*10+a.voucherPacks*10+a.signatureCards);
});
test('regular and duel-heavy scenarios scale without unlimited free mini-boosters',()=>{
 const a=simulate(SCENARIOS[1],123),b=simulate(SCENARIOS[2],123);
 assert.equal(a.wins+a.losses,45);
 assert.equal(b.wins+b.losses,180);
 assert.equal(a.voucherPacks,4);
 assert.equal(b.voucherPacks,0);
 assert.ok(a.miniPacks<=26&&b.miniPacks<=26);
 assert.ok(b.shopPacks>a.shopPacks,'repeat duels still create purchasing power');
});
test('model reports bounded, reproducible ranges and rejects bad sample counts',()=>{
 assert.deepEqual(report(3),report(3));
 assert.equal(report(3).length,3);
 assert.throws(()=>report(0),/1..1000/);
 assert.throws(()=>report(1001),/1..1000/);
});

test('weekly credits reduce grinder income while preserving matched duel outcomes',()=>{
 const regular=simulate(SCENARIOS[1],321),grinder=simulate(SCENARIOS[2],321);
 const regularOld=simulate(SCENARIOS[1],321,{uncappedCredits:true});
 const grinderOld=simulate(SCENARIOS[2],321,{uncappedCredits:true});
 assert.equal(regular.wins,regularOld.wins);
 assert.equal(grinder.wins,grinderOld.wins);
 assert.ok(regular.earnedCredits<=regularOld.earnedCredits);
 assert.ok(grinder.earnedCredits<grinderOld.earnedCredits);
 assert.ok(grinder.shopPacks<=grinderOld.shopPacks);
 assert.deepEqual(compare(3),compare(3));
 assert.ok(compare(3).every(x=>x.capped.earnedCredits<=x.uncapped.earnedCredits));
});
