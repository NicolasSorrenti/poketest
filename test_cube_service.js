'use strict';
const assert=require('node:assert/strict');
const {CubeService}=require('./cube_service');
const service=new CubeService();
const created=service.create({seed:475});
const token=created.token;
assert.equal(typeof token,'string');
assert.equal(created.pack.length,15);
assert.equal(created.drafted.length,0);
assert.equal(created.opponentCounts.length,3);
assert.throws(()=>service.view('bad-token'),/Unknown or expired/);
let state=created,turns=0;
while(!state.done){
 const card=state.pack[0];
 assert(card&&card.id&&card.name,'Pack card must have a safe public summary');
 assert.throws(()=>service.pick(token,'not-in-pack',state.revision),/Card not in current pack/);
 state=service.pick(token,card.id,state.revision);
 turns++;
 assert.equal(state.drafted.length,turns);
 assert(state.opponentCounts.every(n=>n===turns),'CPU must pick every round');
 assert.throws(()=>service.pick(token,card.id,state.revision-1),/Stale draft revision/);
 assert(turns<=60,'Draft should terminate');
}
assert.equal(turns,60);
assert.equal(state.drafted.length,60);
assert.equal(state.pack.length,0);
assert(state.opponentCounts.every(n=>n===60));
assert.throws(()=>service.pick(token,'x',state.revision),/Draft finished/);
console.log('PASS cube service: human picks, CPU picks, 60 rounds, revision safety and hidden opponents');
