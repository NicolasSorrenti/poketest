'use strict';
const assert=require('node:assert/strict');
const Core=require('./rpg_collection'),Index=require('./rpg_pack_index');
const day1={day:1,credits:100,deckJourney:{starter:'ember_garden',owned:{'base1-4':1}},relationships:{},bonds:{}};
const early=Index.create(Core,day1);
const charizard=early.sourcesFor('base1-4');
assert(charizard.some(p=>p.id==='set:base1'&&p.available),'Base Set Charizard must appear in an available Base Set booster');
assert(!charizard.some(p=>p.id==='set:base2'),'The Base Set printing must not appear in a Jungle expansion booster');
const secret=early.sourcesFor('neo4-106');
assert(secret.some(p=>p.id==='set:neo4'&&!p.available),'Neo Destiny secret should show its future expansion');
assert(!secret.some(p=>p.id==='set:neo4'&&p.available),'Neo Destiny should not be available on day one');
const rocket=early.sourcesFor('base5-1');
assert(rocket.some(p=>p.id==='theme:rocket'&&!p.available),'Rocket printings should be shown as a future Rocket themed pull');
assert(!rocket.some(p=>p.id==='theme:rocket'&&p.available),'Locked Rocket printing cannot drop early');
const energy=early.sourcesFor('base1-98');
assert.equal(energy.filter(p=>p.kind==='set').length,Object.keys(Core.SETS).length,'Basic Energy comes from every expansion booster');
assert(early.sourcesFor('missing-1').length===0,'Invalid cards have no pack sources');
const late=Index.create(Core,{...day1,day:90});
assert(late.sourcesFor('neo4-106').some(p=>p.id==='set:neo4'&&p.available),'Neo Destiny becomes available by day 90');
assert(late.sourcesFor('base5-1').some(p=>p.id==='theme:rocket'&&p.available),'Rocket-themed pack unlocks late');
const item=early.record({id:'base1-4',name:'Charizard'});
assert.equal(item.owned,1);
assert.equal(item.rarity,'holo');
console.log('RPG pack index: card printing, rarity, real unlocks, shared energy and future pack sources OK');


// Cached lookup must agree with the live booster eligibility rules on representative printings.
for(const day of [1,40,90]){
 const state={...day1,day};
 const lookup=Index.create(Core,state);
 for(const cardId of ['base1-4','base1-46','base1-96','base1-98','base2-1','base3-46','base5-1','gym2-127','neo1-50','neo2-75','neo3-65','neo4-106']){
  for(const theme of Core.THEMED_PACKS){
   const actual=lookup.sourcesFor(cardId).some(p=>p.id==='theme:'+theme.id&&p.available);
   assert.equal(actual,Core.themeContains(state,theme.id,cardId),day+' '+theme.id+' '+cardId+' eligibility mismatch');
  }
 }
}
console.log('Cached themed booster sources match gameplay eligibility.');
