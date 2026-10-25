'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const W='base1-102',CENTER='base1-85';
const unit=(id,damage,energies=[])=>({id,damage,energies,status:null,playedTurn:2});
const cfg=AI.configuration({side:1,level:8});
function board(){
 return {phase:'game',turn:1,round:5,turnSerial:10,over:false,
 self:{active:unit('base1-2',40,[W,W,W]),bench:[unit('base3-25',0)],
 hand:[W,CENTER],energyUsed:false,retreated:false,prizeCount:3,deckCount:20,discard:[]},
 opponent:{active:unit('base1-7',0,[W]),bench:[unit('base1-56',0)],prizeCount:3,discard:[]},decision:null};
}
test('holding a low-value Center must not suppress all Energy attachments',()=>{
 const o=board();
 const a={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 assert.notEqual(AI.score(a,o,cfg,{}),-1000);
});
test('high-value Center still prevents attachment to its damaged target',()=>{
 const o=board();o.self.active.energies=[];
 const a={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 assert.equal(AI.score(a,o,cfg,{}),-1000);
});
