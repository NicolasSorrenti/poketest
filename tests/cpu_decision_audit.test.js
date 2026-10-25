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


test('winning attack is a justified skip rather than a missed attachment',()=>{
 const result=summarize([{...row(7,'attack',true),wonGame:true}]);
 assert.equal(result.opportunities,1);
 assert.equal(result.missedUsefulAttachments,0);
 assert.equal(result.justifiedWinningSkips,1);
 assert.deepEqual(result.missedTurns,[]);
});
test('winning after attack resolution choices still excuses the attachment',()=>{
 const result=summarize([row(8,'attack',true),{...row(8,'choose'),wonGame:true}]);
 assert.equal(result.missedUsefulAttachments,0);
 assert.equal(result.justifiedWinningSkips,1);
});
test('losing terminal attack still counts as a missed attachment',()=>{
 const result=summarize([{...row(9,'attack',true),wonGame:false}]);
 assert.equal(result.missedUsefulAttachments,1);
 assert.equal(result.justifiedWinningSkips,0);
});
