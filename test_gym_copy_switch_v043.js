'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,props={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...props});
function setup(enemy,bench=true){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:11});
 g.phase='game';g.round=4;g.turn=0;g.turnSerial=9;
 g.players[0].active=U('gym2-90',{energies:['base1-101']});g.players[0].bench=[U('base1-3'),U('base1-4')];
 g.players[1].active=U(enemy);g.players[1].bench=bench?[U('base1-58'),U('base1-46')]:[];return g;
}
function cmd(g,side,type,payload){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function threeHeads(g){for(let seed=0;seed<30000;seed++){
 const probe=structuredClone(g);probe.rngState=seed;
 const result=applyCommand(probe,0,{type:'attack',payload:{attackIndex:0}});
 if(result.ok&&probe.pendingAction?.kind==='psyduck_esp_copy'){g.rngState=seed;cmd(g,0,'attack',{attackIndex:0});return;}}
 throw Error('No three-heads Psyduck roll');
}
// Attacker chooses a defending replacement when copying Lure, even though it
// is printed on the Defending Pokemon (no Energy payment for the copied move).
{
 const g=setup('base1-12');threeHeads(g);
 const choice=g.pendingDecision.options.find(o=>o.label==='Lure');assert.ok(choice,'Lure must be copyable');
 cmd(g,0,'choose',{decisionId:g.pendingDecision.id,selected:[choice.id]});
 assert.equal(g.pendingAction?.kind,'psyduck_esp_bench');assert.equal(g.pendingDecision.actor,0);
 const unauthorized=applyCommand(g,1,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:1']}});assert.equal(unauthorized.ok,false);
 cmd(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:1']});
 assert.equal(g.players[1].active.id,'base1-46');assert.equal(g.players[1].bench[1].id,'base1-12');
}
// Copying Teleport switches Psyduck, and must prompt for the attacking
// player's own Bench, not the defender's.
{
 const g=setup('base2-35');threeHeads(g);
 const choice=g.pendingDecision.options.find(o=>o.label==='Teleport');assert.ok(choice);
 cmd(g,0,'choose',{decisionId:g.pendingDecision.id,selected:[choice.id]});
 assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2);
 cmd(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});
 assert.equal(g.players[0].active.id,'base1-3');assert.equal(g.players[0].bench[0].id,'gym2-90');
}
// Copying Whirlwind applies the damage first and delegates the replacement
// to the defender's player (damage first).
{
 const g=setup('base1-57');threeHeads(g);
 const choice=g.pendingDecision.options.find(o=>o.label==='Whirlwind');assert.ok(choice);
 cmd(g,0,'choose',{decisionId:g.pendingDecision.id,selected:[choice.id]});
 assert.equal(g.players[1].active.damage,10);
 assert.equal(g.pendingDecision?.actor,1);
 cmd(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});
 assert.equal(g.players[1].active.id,'base1-58');assert.equal(g.players[1].bench[0].id,'base1-57');
}
console.log('PASS v0.43 Misty Psyduck copies Lure, Teleport and Whirlwind with correct actor, targets and damage');
