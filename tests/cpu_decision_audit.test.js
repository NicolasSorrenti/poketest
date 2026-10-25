'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summarize}=require('../cpu_decision_audit');
const row=(turnSerial,type,attachmentOpportunity=false,side=1)=>({
 side,turnSerial,attachmentOpportunity,command:{type,payload:{}}});
test('reports missed legal useful Energy on completed turns',()=>{
 const result=summarize([row(4,'play_trainer',true),row(4,'attack'),
  row(5,'attach_energy',true),row(5,'end_turn')]);
 assert.equal(result.turns,2);
 assert.equal(result.opportunities,2);
 assert.equal(result.missedUsefulAttachments,1);
 assert.deepEqual(result.missedTurns,[{side:1,turnSerial:4,attacked:true}]);
});
test('does not classify unfinished turns or opponents as missed',()=>{
 const result=summarize([row(3,'bench',true),row(3,'attach_energy',false,0),
  row(3,'end_turn',false,0)]);
 assert.equal(result.missedUsefulAttachments,0);
});
