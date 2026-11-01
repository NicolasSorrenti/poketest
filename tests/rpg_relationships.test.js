'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const REL=require('../rpg_relationships');
test('migrates historical bond and relationship saves only once',()=>{
 const s={relationships:{hana:{affection:2,trust:8,respect:3}},bonds:{hana:{affection:5,trust:4,duels:3}}};
 REL.hydrate(s,['hana']);
 assert.deepEqual([s.relationships.hana.affection,s.relationships.hana.trust,s.relationships.hana.duels],[5,8,3]);
 assert.deepEqual([s.bonds.hana.affection,s.bonds.hana.trust,s.bonds.hana.duels],[5,8,3]);
 REL.apply(s,'hana',{trust:-2});
 const roundtrip=JSON.parse(JSON.stringify(s));
 REL.hydrate(roundtrip,['hana']);
 assert.equal(roundtrip.relationships.hana.trust,6);
 assert.equal(roundtrip.bonds.hana.trust,6,'old trust cannot resurrect after penalty');
});
test('reward and penalties update both compatibility views exactly once',()=>{
 const s={relationships:{},bonds:{}};REL.hydrate(s,['reina']);
 REL.apply(s,'reina',{trust:2,affection:3,respect:2,duels:1});
 REL.apply(s,'reina',{trust:-1});
 assert.equal(s.relationships.reina.trust,1);
 assert.equal(s.bonds.reina.trust,1);
 assert.equal(s.relationships.reina.respect,2);
 assert.equal(s.bonds.reina.duels,1);
});
test('legacy bond-only characters and late-added character packs hydrate safely',()=>{
 const s={relationshipModelVersion:1,relationships:{},bonds:{laca:{trust:5}}};
 REL.hydrate(s,['laca','barb']);
 assert.equal(s.relationships.laca.trust,5);
 assert.equal(s.bonds.barb.trust,0);
 REL.apply(s,'barb',{affection:1});
 assert.equal(s.bonds.barb.affection,1);
});
test('reject invalid changes before writing and clamp negative trust',()=>{
 const s={relationships:{hana:{trust:1}},bonds:{}};
 const before=JSON.stringify(s);
 assert.throws(()=>REL.apply(s,'hana',{trust:NaN}),/Invalid/);
 assert.equal(JSON.stringify(s),before);
 REL.apply(s,'hana',{trust:-99});
 assert.equal(s.relationships.hana.trust,0);
});

test('missed appointment penalty survives a JSON save and reload',()=>{
 const APPOINTMENTS=require('../rpg_appointments');
 const s={day:6,slot:0,relationships:{hana:{trust:5,affection:2}},
  bonds:{hana:{trust:5,affection:2}},appointments:[
   {id:1,npc:'hana',day:5,slot:2,place:'shop',status:'booked'}
  ]};
 REL.hydrate(s,['hana']);
 assert.equal(APPOINTMENTS.expire(s).length,1);
 assert.equal(s.relationships.hana.trust,4);
 const restored=JSON.parse(JSON.stringify(s));
 REL.hydrate(restored,['hana']);
 assert.equal(restored.relationships.hana.trust,4);
 assert.equal(restored.bonds.hana.trust,4);
 assert.equal(APPOINTMENTS.expire(restored).length,0,'no double penalty');
});
test('duel receipt grants one mirrored trust change and resists duplicate settlement',()=>{
 const BRIDGE=require('../rpg_duel_bridge');
 const s={relationships:{reina:{trust:1,respect:0,duels:0}},
  bonds:{reina:{trust:1,duels:0}},pendingDuel:{id:'test-duel'},
  results:[],eventsDone:{},points:0,credits:0,day:5};
 REL.hydrate(s,['reina']);
 const d={id:'test-duel',npc:'reina',day:5};
 assert.ok(BRIDGE.settle(s,d,0,'Reina'));
 assert.equal(s.relationships.reina.trust,3);
 assert.equal(s.bonds.reina.trust,3);
 assert.equal(s.relationships.reina.duels,1);
 assert.equal(BRIDGE.settle(s,d,0,'Reina'),null);
 assert.equal(s.bonds.reina.trust,3);
});

test('character preferences produce weighted bond scores and ranks',()=>{
 const hana={relationships:{},bonds:{}},yuna={relationships:{},bonds:{}};
 REL.apply(hana,'hana',{trust:2});
 REL.apply(yuna,'yuna',{trust:2});
 assert.deepEqual(REL.profileFor('hana').weights,{trust:4,respect:3,affection:2,attraction:1});
 assert.deepEqual(REL.profileFor('yuna').weights,{affection:4,attraction:3,trust:2,respect:1});
 assert.equal(REL.bondScore(hana,'hana'),8);
 assert.equal(REL.bondScore(yuna,'yuna'),4);
 assert.equal(REL.bondRank(hana,'hana'),1);
 REL.apply(hana,'hana',{trust:3,respect:3,affection:3});
 assert.equal(REL.bondRank(hana,'hana'),3);
});
