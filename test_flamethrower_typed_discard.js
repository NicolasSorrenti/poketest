'use strict';
// Printed Flamethrower costs must be enforced by the authoritative reducer,
// not merely by graying out choices in the browser.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {compile}=require('./attack_effects_core');
const {publicView}=require('./duel_protocol');
const fire='base1-98',grass='base1-99';
const prints=['base1-23','base1-24','base1-36','base2-3','base2-19',
 'base4-33','base4-35','base4-51','neo2-4','neo2-23'];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function match(id){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:21});
 g.phase='game';g.round=4;g.turnSerial=10;g.turn=0;g.over=false;
 g.players[0].active={...unit(id),energies:[fire,fire,grass,grass]};
 g.players[1].active=unit('base1-3');
 g.players.forEach(p=>{p.bench=[unit('base1-58')];p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-91');p.deck=Array(15).fill(grass)});
 return g;
}
function action(g,side,type,payload){
 return applyCommand(g,side,{type,payload});
}
for(const id of prints){
 const card=CATALOG.get(id);assert.ok(card,id+' missing');
 const attackIndex=card.attacks.findIndex(a=>a.name==='Flamethrower');
 assert.ok(attackIndex>=0,id+' has no Flamethrower');
 const attack=card.attacks[attackIndex],program=compile(attack);
 assert.match(attack.text,/Discard 1 Fire Energy card attached to /,id+' has wrong printed requirement');
 assert.ok(program,id+' effect did not compile');
 if(program.kind==='energy-discard')assert.equal(program.onlyType,'Fire',id+' typed cost lost');
 else assert.equal(program.kind,'neo48:flamethrower',id+' uses wrong cost handler');
 const g=match(id);
 const started=action(g,0,'attack',{attackIndex});
 assert.equal(started.ok,true,id+': '+started.error);
 const decision=g.pendingDecision;
 assert.ok(decision,id+' must prompt when more than one Fire Energy is attached');
 assert.deepEqual(decision.options.map(o=>o.id),['energy:0','energy:1'],id+' must only offer Fire Energy');
 assert.deepEqual(publicView(g,0).pendingDecision.options.map(o=>o.id),['energy:0','energy:1']);
 assert.equal(publicView(g,1).pendingDecision.options,undefined,'opponent must not see private choices');
 const unchanged=JSON.stringify(g);
 const refused=action(g,0,'choose',{decisionId:decision.id,selected:['energy:2']});
 assert.equal(refused.ok,false,id+' let Grass Energy pay Flamethrower');
 assert.equal(JSON.stringify(g),unchanged,id+' invalid cost mutated game');
 const chosen=action(g,0,'choose',{decisionId:decision.id,selected:['energy:1']});
 assert.equal(chosen.ok,true,id+': '+chosen.error);
 assert.equal(g.players[0].discard.at(-1),fire,id+' discarded a non-Fire Energy');
 assert.deepEqual(g.players[0].active.energies,[fire,grass,grass]);
 assert.equal(g.players[1].active.damage,Number.parseInt(attack.damage,10),id+' attack damage changed');
 assert.equal(g.pendingDecision,null,id+' left a dangling decision');
}
console.log('PASS: all ten historical Flamethrower printings restrict discard to Fire Energy, reject Grass atomically and resolve normally');
