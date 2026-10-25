'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const DIRECTOR=require('../rpg_encounter_director');
const choices=[
 {id:'hana_walk',npc:'hana',start:1,end:85},
 {id:'yuna_arcade',npc:'yuna',start:1,end:85},
 {id:'reina_practice',npc:'reina',start:1,end:85}
];
test('encounter director prefers characters not recently seen',()=>{
 const state={day:21,slot:1,sliceOfLifeHistory:[
  {id:'hana_old',npc:'hana',day:20,slot:1},
  {id:'reina_old',npc:'reina',day:20,slot:1}]};
 assert.equal(DIRECTOR.select(state,choices).npc,'yuna');
});
test('limited-time opportunities take precedence before they expire',()=>{
 const state={day:15,slot:0,sliceOfLifeHistory:[{id:'hana',npc:'hana',day:14,slot:0}]};
 const selected=DIRECTOR.select(state,[{id:'hana_imminent',npc:'hana',end:15},
  {id:'yuna_later',npc:'yuna',end:90}]);
 assert.equal(selected.id,'hana_imminent');
});
test('selection is deterministic and read-only until a scene is started',()=>{
 const state={day:22,slot:2,sliceOfLifeHistory:[]},before=JSON.stringify(state);
 assert.deepEqual(DIRECTOR.select(state,choices),DIRECTOR.select(JSON.parse(before),choices));
 assert.equal(JSON.stringify(state),before);
 const chosen=DIRECTOR.select(state,choices);DIRECTOR.remember(state,chosen);
 assert.equal(state.sliceOfLifeHistory[0].id,chosen.id);
 assert.equal(state.sliceOfLifeHistory[0].day,22);
});
test('saved encounter history stays bounded and malformed entries are ignored',()=>{
 const state={day:67,slot:0,sliceOfLifeHistory:[
  {npc:'hana',id:'old',day:-1,slot:0},
  ...Array.from({length:60},(_,i)=>({npc:i%2?'hana':'reina',id:'moment'+i,day:10+i%50,slot:1}))
 ]};
 assert.equal(DIRECTOR.history(state).length,DIRECTOR.HISTORY_LIMIT);
 DIRECTOR.remember(state,choices[0]);
 assert.equal(state.sliceOfLifeHistory.length,DIRECTOR.HISTORY_LIMIT);
});
