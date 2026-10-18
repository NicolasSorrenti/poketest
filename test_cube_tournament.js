'use strict';
const assert=require('node:assert/strict');
const {CubeService}=require('./cube_service');
const {ClassicLocalService}=require('./classic_local_service');
const cube=new CubeService(),classic=new ClassicLocalService({maxSessions:8});
let state=cube.create({seed:475}),token=state.token;
for(let i=0;i<60;i++)state=cube.pick(token,state.pack[0].id,state.revision);
const deck=state.suggestedDeck;
const start=cube.start(token,deck,state.revision,classic);
assert.equal(typeof start.duelToken,'string');
state=cube.view(token);
assert.equal(state.tournament.activeRound,1);
assert.equal(state.tournament.wins,0);
assert.equal(state.tournament.readyForNext,false);
assert.deepEqual(classic.session(start.duelToken).game.players[0].deck.length+classic.session(start.duelToken).game.players[0].hand.length,40);
assert.throws(()=>cube.next(token,state.revision,classic),/Finish the current/);
let duelToken=start.duelToken;
for(let i=0;i<3;i++){
 const session=classic.session(duelToken);
 assert.equal(session.cpuConfig.level,i+2,'Round should increase AI difficulty');
 assert.equal(session.game.prizeCount,4);
 assert.equal(session.game.deckSize,40);
 const original=cube.session(token).tournament.humanDeck;
 assert.deepEqual(original,deck,'Do not change the human deck between rounds');
 // Simulate a completed *authoritative game*, never a client-reported score.
 session.game.over=true;
 session.game.winner=i===0?0:i===1?1:null;
 state=cube.sync(token,classic);
 assert.equal(state.tournament.results.length,i+1);
 assert.equal(state.tournament.results[i].outcome,['win','loss','draw'][i]);
 const before=state.revision;
 assert.equal(cube.sync(token,classic).revision,before,'Finish must be idempotent');
 if(i<2){
  assert.equal(state.tournament.readyForNext,true);
  assert.throws(()=>cube.next(token,before-1,classic),/Stale draft/);
  const next=cube.next(token,before,classic);
  assert.notEqual(next.duelToken,duelToken);
  duelToken=next.duelToken;
  state=cube.view(token);
  assert.equal(state.tournament.readyForNext,false);
 }else{
  assert.equal(state.tournament.finished,true);
  assert.equal(state.tournament.wins,1);
  assert.equal(state.tournament.losses,1);
  assert.equal(state.tournament.draws,1);
  assert.throws(()=>cube.next(token,state.revision,classic),/Finish the current|Tournament complete/);
 }
}
console.log('PASS Cube tournament: three rounds, immutable deck, server-side results, no duplicate scores');
