'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../scripts/benchmark-rpg-pack-strategies');
const Collection=require('../rpg_collection');
const Core=require('../core_rules');
const {CATALOG}=require('../headless_duel');

test('five checkpoints, three starters and five strategies are explicitly modeled',()=>{
 assert.deepEqual(P.DAYS,[15,30,45,60,80]);
 assert.deepEqual(P.STYLES,['mixed','toolkit','evolution','arena','latest']);
 assert.deepEqual(P.STARTERS,Collection.starters.map(x=>x.id));
 assert.deepEqual(P.NPCS,['hana','reina','camila','marina','shiori','yuna']);
});
test('identical seed and plan yields identical legal owned-card decks and income',()=>{
 for(const plan of P.STYLES){
  const a=P.collect('ember_garden',15,plan,111),b=P.collect('ember_garden',15,plan,111);
  assert.deepEqual(a,b,plan);
  assert.equal(a.deck.length,60);
  assert.equal(Core.validateDeck(a.deck,CATALOG).valid,true);
  assert.equal(a.budget,80+15*12);
  assert.ok(a.spent<=a.budget);
  assert.equal(a.remaining,a.budget-a.spent,'a different strategy does not create credits');
  assert.equal(a.totalCopies,60+10+a.freeRewards*5+a.purchasedPacks*10);
  assert.equal(a.welcomePacks,2);
  assert.ok(a.purchasedPacks<=15);
  assert.ok(a.metrics.basics>=12);
  assert.ok(a.metrics.energies>=18);
  assert.ok(a.metrics.workableEvolutions<=a.metrics.evolutions);
 }
});
test('pack choice changes collection and leaves the initial starter cards unchanged globally',()=>{
 const before=Collection.starters.map(x=>[...x.cards]);
 const evol=P.collect('tidal_circuit',30,'evolution',812);
 const tools=P.collect('tidal_circuit',30,'toolkit',812);
 assert.equal(evol.boughtByTheme.evolution,evol.purchasedPacks);
 assert.equal(tools.boughtByTheme.toolkit,tools.purchasedPacks);
 assert.ok(evol.purchasedPacks>0&&tools.purchasedPacks>0);
 assert.equal(Core.validateDeck(evol.deck,CATALOG).valid,true);
 assert.equal(Core.validateDeck(tools.deck,CATALOG).valid,true);
 assert.deepEqual(Collection.starters.map(x=>x.cards),before,'benchmark must not alter starter definitions');
});
test('checkpoints use honest legal owned copies for all three starter choices',()=>{
 for(const starter of P.STARTERS){
  const early=P.collect(starter,15,'mixed',2026);
  const late=P.collect(starter,80,'mixed',2026);
  for(const x of [early,late]){
   assert.equal(Core.validateDeck(x.deck,CATALOG).valid,true);
   assert.ok(x.metrics.trainers>0);
   assert.ok(x.metrics.basics>=12);
   assert.ok(x.uniqueCards>=20);
   assert.ok(x.totalCopies>=60);
   assert.ok(x.metrics.pokemonValue>=0);
  }
  assert.ok(late.purchasedPacks>early.purchasedPacks,'affordable packs accumulate throughout campaign');
  assert.ok(late.totalCopies>early.totalCopies);
 }
});
test('CLI validation and inexpensive readiness report expose meaningful cross-plan comparisons',()=>{
 assert.deepEqual(P.parse(['--days','15,45','--styles','toolkit,evolution','--seeds','2']).days,[15,45]);
 assert.throws(()=>P.parse(['--days','20']),/Invalid checkpoints/);
 assert.throws(()=>P.parse(['--styles','all-the-rares']),/Invalid pack styles/);
 assert.throws(()=>P.parse(['--starters','not-a-deck']),/Invalid starter/);
 assert.throws(()=>P.parse(['--npcs','not-an-npc']),/Invalid NPC/);
 assert.throws(()=>P.parse(['--seeds','0']),/Invalid seed count/);
 assert.throws(()=>P.parse(['--pairs','0']),/Invalid pair count/);
 const opts=P.parse(['--days','15','--styles','toolkit,evolution','--starters','ember_garden','--seeds','1']);
 const a=P.evaluate(opts),b=P.evaluate(opts);
 assert.deepEqual(a,b);
 assert.equal(a.aggregate.length,2);
 assert.equal(a.rows.length,2);
 assert.ok(a.aggregate.every(x=>x.day===15&&x.games===0));
 assert.deepEqual(a.errors,[]);
});

test('hypothetical price trials keep real pack contents and use the same income budget',()=>{
 const fixed=P.collect('ember_garden',45,'evolution',2026);
 const pricier=P.collect('ember_garden',45,'evolution',2026,{evolution:26});
 assert.equal(fixed.budget,pricier.budget);
 assert.ok(pricier.purchasedPacks<=fixed.purchasedPacks);
 assert.ok(pricier.spent<=pricier.budget);
 assert.equal(pricier.remaining,pricier.budget-pricier.spent);
 const normal=P.collect('tidal_circuit',45,'toolkit',2026);
 const cheaper=P.collect('tidal_circuit',45,'toolkit',2026,{toolkit:22});
 assert.equal(normal.budget,cheaper.budget);
 assert.ok(cheaper.purchasedPacks>=normal.purchasedPacks);
 assert.equal(Core.validateDeck(pricier.deck,CATALOG).valid,true);
 assert.equal(Core.validateDeck(cheaper.deck,CATALOG).valid,true);
 assert.equal(Collection.THEMED_PACKS.find(x=>x.id==='evolution').price,22,'never change actual prices in a trial');
 assert.equal(Collection.THEMED_PACKS.find(x=>x.id==='toolkit').price,24);
});
test('trial pricing arguments are validated and never leak into normal defaults',()=>{
 const parsed=P.parse(['--prices','evolution=26,toolkit=22','--days','45']);
 assert.deepEqual(parsed.prices,{evolution:26,toolkit:22});
 assert.deepEqual(P.parse([]).prices,{});
 for(const malformed of ['not-a-theme=20','evolution=0','toolkit=10.1','evolution=101']){
  assert.throws(()=>P.parse(['--prices',malformed]),/Invalid hypothetical pack price/);
 }
});
