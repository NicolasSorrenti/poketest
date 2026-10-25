'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const FIGHT='base1-97',HITMONCHAN='base1-7',MACHOP='base1-52',RATTATA='base1-61';
const cfg=AI.configuration({side:1,level:8});
const attack={type:'attack',payload:{attackIndex:0}};
const attach={type:'attach_energy',payload:{handIndex:0,slot:0}};
function board(){
 return {self:{active:{id:HITMONCHAN,energies:[FIGHT],damage:0,status:null},
   bench:[{id:MACHOP,energies:[],damage:0}],hand:[FIGHT],
   energyUsed:false,prizeCount:3},
  opponent:{active:{id:RATTATA,energies:[],damage:0},bench:[{id:RATTATA,energies:[],damage:0}]}};
}
test('Apex attaches useful Energy before a non-winning attack',()=>{
 const actions=AI.energyPreparationActions(board(),cfg,[attack,attach]);
 assert.deepEqual(actions,[attach]);
});
test('Apex retains a guaranteed winning knockout instead of forcing attachment',()=>{
 const o=board();o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 const actions=AI.energyPreparationActions(o,cfg,[attack,attach]);
 assert.deepEqual(actions,[attack,attach]);
});
test('Apex does not force attachment when Energy was already used',()=>{
 const o=board();o.self.energyUsed=true;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attack,attach]);
});
test('other CPU levels retain their existing attack ordering',()=>{
 const o=board();
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),[attack,attach]),[attack,attach]);
});
