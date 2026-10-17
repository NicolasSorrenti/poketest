'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const R=require('./retail_theme_decks');
const A=require('./attack_effects_core');
const cards=require('./cards/gym2.json');
const unit=(id,energies=[])=>({id,under:[],energies,attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
for(const [id,attack,energy,expected] of [
 ['gym2-12','Electro Beam','base1-102',40],
 ['gym2-15','Electroburn','base1-100',70]]){
 const printed=cards.find(c=>c.id===id).attacks.find(a=>a.name===attack);
 assert.ok(A.compile(printed),'Must compile '+attack);
 const g=createGame({decks:[R.list('brock'),R.list('misty')],format:'gym-expanded',seed:212});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=5;
 const mine=g.players[0],theirs=g.players[1];
 mine.active=unit(id,Array(4).fill(energy));theirs.active=unit('base1-3');
 const result=applyCommand(g,0,{type:'attack',payload:{attackIndex:cards.find(c=>c.id===id).attacks.findIndex(a=>a.name===attack)}});
 assert.ok(result.ok,attack+': '+result.error);
 assert.equal(g.pendingDecision,null);
 console.log(id,result,g.players[1].active?.damage,g.phase,g.log?.slice(-3));
 assert.ok(g.players[1].active.damage>0,'Attack must damage opponent '+id+' '+JSON.stringify(g.events?.slice(-5)));
 if(attack==='Electroburn')assert.equal(g.players[0].active.damage,40,'10 recoil per Lightning Energy');
 else assert.ok(g.players[0].active.energies.length===0||g.players[0].active.energies.length===4,'coin flip must discard all or none');
}
console.log('PASS Gym v0.28: Electro Beam and Electroburn execute and apply real Energy/recoil outcomes');
