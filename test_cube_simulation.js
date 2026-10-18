'use strict';
const assert=require('node:assert/strict');
const {CubeService}=require('./cube_service');
const {simulateCpuMatch}=require('./cube_bracket');
const {buildCpuDeck}=require('./cube_strategy');
const c=new CubeService(),created=c.create({seed:475});
let state=created,token=created.token;
while(!state.done)state=c.pick(token,state.pack[0].id,state.revision);
const picks=c.session(token).draft.picks;
const decks=picks.slice(2).map(buildCpuDeck);
const result=simulateCpuMatch(decks[0],decks[1],{seed:9941,maxTurns:18,levelA:3,levelB:4});
assert([0,1].includes(result.winner));
assert(result.actions>0,'CPU-vs-CPU simulation must execute the engine, not select a random winner');
assert(['played','prizes','remaining-pokemon','seed-tiebreak'].includes(result.method));
assert.deepEqual(result,simulateCpuMatch(decks[0],decks[1],{seed:9941,maxTurns:18,levelA:3,levelB:4}),
 'Seeded CPU-vs-CPU simulation must be reproducible');
console.log('PASS Cube CPU-vs-CPU: authoritative actions, bounded completion and deterministic result');
