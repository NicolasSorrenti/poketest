'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {candidate,VARIANTS}=require('../scripts/rpg-npc-candidates');
const Trial=require('../scripts/benchmark-rpg-npc-candidates');
const NPC=require('../rpg_npc_deck_progression');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck,canEvolve}=require('../core_rules');

test('experimental recipe variants stay legal and never edit shared source decks',()=>{
 const service=new ClassicLocalService();
 for(const [npc,variants] of Object.entries(VARIANTS)){
  const theme={reina:'blackout',yuna:'zap',camila:'rocket_lab'}[npc],source=service.decklist(theme),before=[...source];
  for(const tier of [1,2,3])for(const variant of variants){
   const cards=candidate({npc,tier,original:source,catalog:CATALOG,variant});
   assert.equal(cards.length,60,npc+' '+variant+' tier '+tier);
   const legal=validateDeck(cards,CATALOG);assert.equal(legal.valid,true,npc+' '+variant+' tier '+tier+' '+legal.errors.join('; '));
   assert.ok(cards.every(id=>CATALOG.has(id)));
   if(tier===1)assert.deepEqual(cards,NPC.STARTING_RECIPES[npc]);
   if(variant==='baseline')assert.deepEqual(cards,NPC.recipeFor({npc,tier,original:source,catalog:CATALOG}));
  }
  assert.deepEqual(source,before,'source theme was mutated');
 }
});

test('Reina experiment variants trade some early aggression or energy denial for safer tempo',()=>{
 const service=new ClassicLocalService(),source=service.decklist('blackout');
 const get=variant=>candidate({npc:'reina',tier:3,original:source,catalog:CATALOG,variant});
 const baseline=get('baseline'),soft=get('soft-ace'),control=get('soft-disruption');
 const count=(deck,id)=>deck.filter(x=>x===id).length;
 assert.equal(count(soft,'base1-7'),count(baseline,'base1-7')-1);
 assert.equal(count(soft,'base3-7'),count(baseline,'base3-7')+1);
 assert.ok(count(control,'base1-92')<count(baseline,'base1-92'));
 assert.ok(count(control,'base1-95')>count(baseline,'base1-95'));
});

test('Yuna experiment can trade Pichu copies for Lightning or Psychic attackers',()=>{
 const service=new ClassicLocalService(),source=service.decklist('zap');
 const get=variant=>candidate({npc:'yuna',tier:3,original:source,catalog:CATALOG,variant});
 const baseline=get('baseline'),stronger=get('electabuzz-trio'),hybrid=get('psychic-lightning');
 const count=(deck,id)=>deck.filter(x=>x===id).length;
 assert.equal(count(stronger,'base1-20'),2);
 assert.equal(count(stronger,'neo1-12'),count(baseline,'neo1-12')-2);
 assert.equal(count(hybrid,'base1-31'),2);
 assert.equal(count(hybrid,'base1-100'),count(baseline,'base1-100'));
});

test('Camila keeps her Dark Vileplume line and Grass energy in experimental variants',()=>{
 const service=new ClassicLocalService(),source=service.decklist('rocket_lab');
 for(const tier of [2,3])for(const variant of VARIANTS.camila){
  const cards=candidate({npc:'camila',tier,original:source,catalog:CATALOG,variant}),has=id=>cards.includes(id);
  assert.ok(['base5-63','base5-36','base5-30'].every(has),variant+' removed her line');
  assert.equal(canEvolve(CATALOG.get('base5-36'),CATALOG.get('base5-63')),true);
  assert.equal(canEvolve(CATALOG.get('base5-30'),CATALOG.get('base5-36')),true);
  assert.equal(cards.filter(id=>id==='base1-99').length,18,'monograss recipe retains its energy colors');
 }
});

test('benchmark inputs and production selection use the current authored recipe',()=>{
 assert.deepEqual(Trial.parse(['--days','45,80','--npcs','camila','--styles','toolkit','--seeds','3']).days,[45,80]);
 assert.throws(()=>Trial.parse(['--days','31']),/Invalid days/);
 assert.throws(()=>Trial.parse(['--styles','unknown']),/Invalid styles/);
 assert.throws(()=>Trial.parse(['--npcs','someone']),/Invalid NPCs/);
 assert.throws(()=>Trial.parse(['--seeds','0']),/Invalid seeds/);
 assert.throws(()=>Trial.parse(['--pairs','0']),/Invalid pairs/);
 const service=new ClassicLocalService(),source=service.decklist('blackout');
 assert.throws(()=>candidate({npc:'reina',tier:2,original:source,catalog:CATALOG,variant:'unknown'}),/Unknown candidate/);
 for(const npc of Object.keys(VARIANTS))assert.deepEqual(Trial.variantsFor(npc,'production'),['baseline']);
});

test('campaign benchmark tier schedule matches the six requested upgrade dates',()=>{
 for(const [day,tier] of [[15,1],[16,2],[30,2],[31,3],[45,3],[46,4],[60,4],[61,5],[75,5],[76,6],[90,6],[91,7]])
  assert.equal(Trial.tierForBenchmark(day,'reina','calendar'),tier,'Day '+day);
 assert.equal(Trial.tierForBenchmark(45,'reina','story'),3);
 assert.equal(Trial.tierForBenchmark(60,'camila','story'),4);
 assert.equal(Trial.tierForBenchmark(80,'yuna','calendar'),6);
 assert.equal(Trial.tierForBenchmark(80,'yuna','story'),6);
 const modes=Trial.parse(['--npc-tier','story','--player-level','2','--npc-level','3']);
 assert.equal(modes.npcTier,'story');assert.equal(modes.playerLevel,2);assert.equal(modes.npcLevel,3);
 assert.throws(()=>Trial.parse(['--npc-tier','unknown']),/Invalid NPC tier mode/);
 assert.throws(()=>Trial.parse(['--player-level','0']),/Invalid player CPU level/);
 assert.throws(()=>Trial.parse(['--npc-level','6']),/Invalid NPC CPU level/);
});

test('benchmark still uses real RPG CPU identities when requested',()=>{
 const {argumentsOf}=require('../benchmark_cpu');
 for(const [npc,level,personality] of [['reina',4,'aggressive'],['yuna',2,'risk_taking'],['camila',4,'tactical']])
  assert.deepEqual(Trial.npcCpu(npc,{npcProfile:'character'}),{level,personality});
 assert.deepEqual(Trial.variantsFor('reina','production'),['baseline']);
 const args=argumentsOf(['--left-level','3','--right-level','4','--left-personality','balanced','--right-personality','aggressive']);
 assert.equal(args.leftPersonality,'balanced');assert.equal(args.rightPersonality,'aggressive');
 assert.throws(()=>argumentsOf(['--right-personality','nonexistent']),/Unknown CPU personality/);
});
