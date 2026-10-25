'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const W='base1-102',CENTER='base1-85',BLASTOISE='base1-2',LAPRAS='base3-25',HITMONCHAN='base1-7';
const unit=(id,damage,energies=[])=>({id,damage,energies,status:null,playedTurn:2});
function obs(){
 return {phase:'game',turn:1,round:6,turnSerial:9,over:false,stadium:null,
  self:{active:unit(BLASTOISE,40,[W]),bench:[unit(LAPRAS,20)],
   hand:[W,CENTER],energyUsed:false,retreated:false,prizeCount:3,discard:[],deckCount:20},
  opponent:{active:unit(HITMONCHAN,0,[W]),bench:[],prizeCount:3,discard:[],deckCount:20},decision:null};
}
const cfg=AI.configuration({side:1,level:8,personality:'balanced'});
test('Apex will not attach Energy before a strategically worthwhile Center',()=>{
 const o=obs();
 // Enough healing to justify discarding the existing attachment.
 o.self.active.damage=70;
 o.self.bench[0].damage=40;
 const attach=AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{});
 const heal=AI.score({type:'play_trainer',payload:{handIndex:1}},o,cfg,{});
 assert.equal(attach,-1000);
 assert.ok(heal>attach);
});
test('Energy remains attachable after Center or on an undamaged teammate',()=>{
 const o=obs();
 o.self.active.damage=0;
 assert.notEqual(AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{}),-1000);
 o.self.active.damage=40;
 o.self.hand=[W];
 assert.notEqual(AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{}),-1000);
});
test('Center evaluation accounts for discarded Energy on every healed Pokémon',()=>{
 const o=obs();
 const a={type:'play_trainer',payload:{handIndex:1}};
 const before=AI.score(a,o,cfg,{});
 o.self.bench[0].energies=[W,W,W];
 const after=AI.score(a,o,cfg,{});
 assert.ok(before>after+150,'avoid throwing away three additional Energy cards');
});
