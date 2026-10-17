'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const U=(id,rest={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...rest});
assert.equal(ATTACK.compile(CATALOG.get('gym2-90').attacks[0]).kind,'gym:psyduck-esp');
let checks=[];
for(let seed=0;seed<5000000&&checks.length<4;seed+=20291){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:45});g.phase='game';g.round=6;g.turn=0;g.turnSerial=8;g.rngState=seed;
 g.players[0].active=U('gym2-90',{energies:['base1-101']});g.players[1].active=U('base1-46');g.players[0].hand=[];g.players[0].deck=['base1-3','base1-4','base1-5'];g.players[1].bench=[U('base1-3')];
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:0}});assert.ok(r.ok,r.error);
 const hits=(g.coinFlips||[]).slice(0,3).filter(f=>f.result==='heads').length;
 if(checks.includes(hits))continue;
 if(hits===3){assert.equal(g.pendingAction?.kind,'psyduck_esp_copy');assert.ok(g.pendingDecision.options.some(o=>o.label==='Scratch'));
  const pick=g.pendingDecision.options.find(o=>o.label==='Scratch');const a=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:[pick.id]}});assert.ok(a.ok,a.error);assert.equal(g.players[1].active.damage,20);}
 if(hits===2){assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].hand.length,0);}
 if(hits===1){assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].hand.length,1);}
 if(hits===0){assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].hand.length,0);}
 checks.push(hits);
}
assert.deepEqual(checks.sort(),[0,1,2,3]);
console.log('PASS v0.41 Misty’s Psyduck ESP: 0,1,2,3 heads; draw, Water weakness, selected copy and privacy-safe prompts');
