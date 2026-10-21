'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {candidate,VARIANTS}=require('../scripts/rpg-npc-candidates');
const Trial=require('../scripts/benchmark-rpg-npc-candidates');
const NPC=require('../rpg_npc_deck_progression');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck,canEvolve}=require('../core_rules');
test('each proposed recipe is legal at both tiers and never edits shared source decks',()=>{
 const service=new ClassicLocalService();
 for(const [npc,variants] of Object.entries(VARIANTS)){
  const theme=service.decklist(Trial.PRESETS[npc]),before=JSON.stringify(theme);
  for(const tier of [1,2,3]){
   const baseline=NPC.baselineUpgrade({npc,tier,original:theme,catalog:CATALOG});
   for(const variant of variants){
    const cards=candidate({npc,tier,original:theme,catalog:CATALOG,variant});
    assert.equal(cards.length,60);
    const legal=validateDeck(cards,CATALOG);
    assert.equal(legal.valid,true,npc+' '+tier+' '+variant+' '+legal.errors.join('; '));
    assert.ok(cards.every(id=>CATALOG.has(id)));
    if(tier===1||variant==='baseline')assert.deepEqual(cards,baseline);
   }
  }
  assert.equal(JSON.stringify(theme),before,'benchmark must not alter production source theme');
 }
});
test('Reina variants retain original strong rival setup with less single-card or Trainer pressure',()=>{
 const service=new ClassicLocalService(),source=service.decklist('blackout');
 const base=candidate({npc:'reina',tier:3,original:source,catalog:CATALOG});
 const soft=candidate({npc:'reina',tier:3,original:source,catalog:CATALOG,variant:'soft-ace'});
 const control=candidate({npc:'reina',tier:3,original:source,catalog:CATALOG,variant:'soft-disruption'});
 const frequency=(deck,id)=>deck.filter(x=>x===id).length;
 assert.equal(frequency(base,'base1-7'),3);
 assert.equal(frequency(soft,'base1-7'),2);
 assert.equal(frequency(control,'base1-7'),3);
 assert.ok(frequency(control,'base1-92')<frequency(base,'base1-92'));
 assert.equal(frequency(control,'base1-79'),0);
});
test('Yuna can experiment with Lightning Basic attackers without changing Energy costs',()=>{
 const service=new ClassicLocalService(),src=service.decklist('zap');
 const base=candidate({npc:'yuna',tier:3,original:src,catalog:CATALOG});
 const stronger=candidate({npc:'yuna',tier:3,original:src,catalog:CATALOG,variant:'electabuzz-trio'});
 const count=(deck,id)=>deck.filter(x=>x===id).length;
 assert.equal(count(stronger,'base1-20'),3);
 assert.equal(count(stronger,'base1-10'),count(base,'base1-10'));
 assert.equal(count(stronger,'base1-100'),count(base,'base1-100'));
 assert.equal(count(stronger,'base1-101'),count(base,'base1-101'));
});
test('Camila retains an authentic playable Vileplume chain in all control candidates',()=>{
 const service=new ClassicLocalService(),src=service.decklist('rocket_lab');
 for(const tier of [2,3])for(const variant of VARIANTS.camila){
  const cards=candidate({npc:'camila',tier,original:src,catalog:CATALOG,variant});
  const has=id=>cards.some(x=>x===id);
  assert.ok(['base5-63','base5-36','base5-30'].every(has),variant+' removed her line');
  assert.equal(canEvolve(CATALOG.get('base5-36'),CATALOG.get('base5-63')),true);
  assert.equal(canEvolve(CATALOG.get('base5-30'),CATALOG.get('base5-36')),true);
  assert.ok(cards.filter(id=>id==='base1-99').length>=7);
  assert.ok(cards.filter(id=>id==='base1-102').length>=5);
 }
});
test('benchmark validates inputs and preserves independent duel choice paths',()=>{
 assert.deepEqual(Trial.parse(['--days','45,80','--npcs','camila','--styles','toolkit','--seeds','3']).days,[45,80]);
 assert.throws(()=>Trial.parse(['--days','31']),/Invalid days/);
 assert.throws(()=>Trial.parse(['--styles','unknown']),/Invalid styles/);
 assert.throws(()=>Trial.parse(['--npcs','someone']),/Invalid NPCs/);
 assert.throws(()=>Trial.parse(['--seeds','0']),/Invalid seeds/);
 assert.throws(()=>Trial.parse(['--pairs','0']),/Invalid pairs/);
 const service=new ClassicLocalService(),src=service.decklist('blackout');
 assert.throws(()=>candidate({npc:'reina',tier:2,original:src,catalog:CATALOG,variant:'unknown'}),/Unknown candidate/);
});

test('production Yuna and Camila tunes match measured candidates and retain original baselines',()=>{
 const service=new ClassicLocalService();
 const chosen=[['yuna','zap','electabuzz-pair'],['camila','rocket_lab','rocket-hybrid']];
 for(const [npc,theme,variant] of chosen){
  const original=service.decklist(theme);
  const act1=NPC.upgrade({npc,tier:1,original,catalog:CATALOG});
  assert.deepEqual(act1,original,npc+' Act I must remain original');
  for(const tier of [2,3]){
   const tuned=NPC.upgrade({npc,tier,original,catalog:CATALOG});
   const compared=candidate({npc,tier,original,catalog:CATALOG,variant});
   assert.deepEqual(tuned,compared,npc+' Act '+tier+' should match the exact measured 60 cards');
   const baseline=NPC.baselineUpgrade({npc,tier,original,catalog:CATALOG});
   assert.notDeepEqual(tuned,baseline);
  }
 }
});
