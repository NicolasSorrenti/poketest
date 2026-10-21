'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../rpg_collection');

const campaign=starter=>{
 const state={day:1,slot:0,credits:80,location:'shop',results:[],deckJourney:C.fresh()};
 C.choose(state,starter);return state;
};
const seed=random=>{
 let i=0;return ()=>((random+i++*163)%1000)/1000;
};

test('three different starter packs are available immediately with two free mini choices',()=>{
 const state=campaign('ember_garden'),offers=C.themedPacks(state);
 assert.equal(offers.length,8);
 assert.deepEqual(offers.filter(x=>x.unlocked).map(x=>x.id),['arena','evolution','toolkit']);
 assert.equal(offers.every(x=>x.total>=x.owned&&x.completion>=0&&x.completion<=100),true);
 assert.equal(state.deckJourney.welcomePacks,2);
 const before=JSON.stringify(state.deckJourney.deck);
 const first=C.buyThemedPack(state,'toolkit',()=>.5);
 assert.equal(first.length,5);assert.equal(state.credits,80);
 assert.equal(state.deckJourney.packs,0);assert.equal(state.deckJourney.welcomePacks,1);
 assert.equal(state.deckJourney.lastPack.theme,'toolkit');
 assert.equal(state.deckJourney.lastPack.kind,'welcome');
 assert.throws(()=>C.buyThemedPack(state,'evolution'),/Reveal your previous booster/);
 state.deckJourney.lastPack.opened=true;
 const second=C.buyThemedPack(state,'evolution',()=>.5);
 assert.equal(second.length,5);assert.equal(state.credits,80);
 assert.equal(state.deckJourney.welcomePacks,0);
 state.deckJourney.lastPack.opened=true;
 const paid=C.buyThemedPack(state,'arena',()=>.5);
 assert.equal(paid.length,10);assert.equal(state.credits,60);
 assert.equal(state.deckJourney.packs,1);assert.equal(state.deckJourney.lastPack.kind,'themed');
 assert.equal(JSON.stringify(state.deckJourney.deck),before,'opening packs never edits the equipped deck');
 assert.equal(Object.values(state.deckJourney.owned).reduce((sum,n)=>sum+n,0),80);
 const saved=JSON.parse(JSON.stringify(state));C.hydrate(saved);
 assert.deepEqual(saved.deckJourney,state.deckJourney);
});
test('old saves do not receive welcome freebies retroactively and saved vouchers still redeem',()=>{
 const s=campaign('tidal_circuit');
 delete s.deckJourney.welcomePacks;
 C.hydrate(s);assert.equal(s.deckJourney.welcomePacks,0);
 C.awardVoucher(s,'base5');s.day=90;
 const before=s.credits;
 const legacy=C.redeemVoucher(s,'base5',()=>.4);
 assert.equal(legacy.length,10);
 assert.equal(s.credits,before);
 assert.equal(s.deckJourney.lastPack.set,'base5');
 assert.equal(s.deckJourney.vouchers.base5,0);
});
test('five new themes unlock by milestone while old themes remain in the shop',()=>{
 const s=campaign('mind_and_muscle');
 const gates=[[8,'wilderness'],[22,'rocket'],[33,'gym'],[48,'johto'],[68,'mystery']];
 for(const [day,id] of gates){
  s.day=day-1;
  assert.equal(C.themedPacks(s).find(x=>x.id===id).unlocked,false,id+' too early');
  s.day=day;
  assert.equal(C.themedPacks(s).find(x=>x.id===id).unlocked,true,id+' unlock');
 }
 s.day=90;
 assert.equal(C.themedPacks(s).every(x=>x.unlocked),true);
 assert.equal(C.themedPacks(s).find(x=>x.id==='arena').price,20);
 assert.equal(C.themedPacks(s).find(x=>x.id==='toolkit').price,24);
});
test('no themed booster leaks a printing from an expansion not yet unlocked',()=>{
 const s=campaign('ember_garden');
 for(const day of [1,8,14,17,22,33,48,68,80,90]){
  s.day=day;
  for(const offer of C.themedPacks(s).filter(o=>o.unlocked)){
   for(const n of [5,10])for(let i=0;i<6;i++){
    const pack=C.randomThemedPack(s,offer.id,seed(i*37),n);
    assert.equal(pack.length,n);
    assert.ok(pack.every(id=>C.canOwn(id)),'every card ID must exist in authentic sets');
    const kinds=pack.map(C.packRarity);
    assert.equal(kinds.filter(x=>x==='energy').length,1,offer.id+' Energy slot');
    assert.equal(kinds.filter(x=>['rare','holo','secret'].includes(x)).length,1,offer.id+' rare slot');
    assert.equal(kinds.filter(x=>x==='uncommon').length,n===5?1:3,offer.id+' uncommon slot');
    assert.equal(kinds.filter(x=>x==='common').length,n===5?2:5,offer.id+' common slot');
    assert.ok(pack.every(id=>C.ENERGY.has(id)||offer.sources.includes(id.split('-')[0])),
     offer.id+' contains a locked or irrelevant expansion');
   }
  }
 }
});
test('Evolution Workshop always provides one legal Stage 1 + matching Basic at campaign start',()=>{
 const s=campaign('ember_garden');
 const byId=new Map(require('../cards/base1.json').map(c=>[c.id,c]));
 for(let i=0;i<24;i++){
  const pack=C.randomThemedPack(s,'evolution',seed(i*41),10);
  const stage1=pack.filter(id=>byId.get(id)?.subtypes?.includes('Stage 1'));
  assert.ok(stage1.some(id=>pack.some(other=>byId.get(other)?.name===byId.get(id)?.evolvesFrom)),
   'Evolution booster missing its guaranteed connected Basic and Stage 1');
 }
});
test('Trainer Toolkit guarantees actual Trainer slots instead of only random Pokémon',()=>{
 const s=campaign('tidal_circuit');
 const byId=new Map(require('../cards/base1.json').map(c=>[c.id,c]));
 for(let i=0;i<10;i++){
  const pack=C.randomThemedPack(s,'toolkit',seed(i*73),10);
  assert.ok(pack.filter(id=>byId.get(id)?.supertype==='Trainer').length>=3);
 }
});
test('classic packs stay relevant after Neo cards arrive and are searchable by wishlist',()=>{
 const s=campaign('tidal_circuit');
 s.day=90;
 const checks=[['arena','base1-46'],['evolution','base1-24'],['toolkit','base1-88'],
  ['evolution','neo4-31'],['toolkit','neo1-91']];
 for(const [theme,id] of checks)assert.equal(C.themeContains(s,theme,id),true,theme+' missing '+id);
 assert.equal(C.themedPacks(s).find(x=>x.id==='toolkit').sources.includes('neo4'),true);
 s.day=1;assert.equal(C.themeContains(s,'evolution','neo4-31'),false);
 assert.equal(C.themeContains(s,'johto','neo4-31'),false,'a locked pack should never advertise this card');
});
test('welcome choice and paid packs fail atomically while locked, busy or lacking funds',()=>{
 const s=campaign('ember_garden');
 const snapshot=JSON.stringify(s);
 assert.throws(()=>C.buyThemedPack(s,'rocket'),/not unlocked/);
 assert.throws(()=>C.buyThemedPack(s,'missing'),/does not exist/);
 assert.equal(JSON.stringify(s),snapshot);
 s.location='park';
 assert.throws(()=>C.buyThemedPack(s,'arena'),/card shop/);
 s.location='shop';s.pendingDuel={id:'duel'};
 assert.throws(()=>C.buyThemedPack(s,'arena'),/current scene/);
 assert.equal(s.deckJourney.welcomePacks,2);
 s.pendingDuel=null;s.deckJourney.welcomePacks=0;s.credits=19;
 const blocked=JSON.stringify(s);
 assert.throws(()=>C.buyThemedPack(s,'arena'),/20 credits/);
 assert.equal(JSON.stringify(s),blocked);
});
test('NPC rewards use thematic pools without bypassing the weekly mini cap or gift vouchers',()=>{
 const s=campaign('ember_garden');
 const kaede=C.reward(s,true,'kaede',()=>.44,{duelId:'early-kaede'});
 assert.equal(kaede.length,5);
 assert.equal(s.deckJourney.lastPack.theme,'arena');
 assert.ok(kaede.every(id=>id.startsWith('base1-')));
 assert.equal(C.reward(s,true,'kaede',()=>.44,{duelId:'early-kaede'}),null);
 assert.equal(C.reward(s,true,'reina',()=>.4,{duelId:'reina'}).length,5);
 assert.equal(C.reward(s,true,'hana',()=>.4,{duelId:'hana'}),null);
 s.day=90;s.deckJourney.lastPack.opened=true;
 const late=C.reward(s,true,'kaede',()=>.2,{story:true,duelId:'late-kaede'});
 assert.equal(late.length,5);
 assert.equal(s.deckJourney.lastPack.theme,'mystery');
 const allowed=C.themedPacks(s).find(x=>x.id==='mystery').sources;
 assert.ok(late.every(id=>C.ENERGY.has(id)||allowed.includes(id.split('-')[0])));
});
