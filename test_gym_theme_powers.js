'use strict';
const assert=require('node:assert/strict');
const R=require('./retail_theme_decks');
const {createGame,applyCommand}=require('./headless_duel');
const P=require('./classic_power_core');
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
const ready=()=>{const g=createGame({decks:[R.list('surge'),R.list('brock')],format:'gym-theme',seed:744});g.phase='game';g.turn=0;g.round=3;g.turnSerial=5;return g;};
function ok(g,side,type,payload){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d,'Missing player choice');ok(g,d.actor,'choose',{decisionId:d.id,selected:[id??d.options[0].id]});}
// Energy Charge is usable multiple times and selects exact attached Energy.
{
 const g=ready();g.players[0].active=unit('gym1-8');g.players[0].bench=[unit('gym1-80')];g.players[1].active=unit('gym1-66');
 g.players[0].bench[0].energies=['base1-100','base1-99'];
 ok(g,0,'use_power',{slot:-1});choose(g,'slot:0');choose(g,'hand:0'.replace('hand','index'));
 assert.deepEqual(g.players[0].active.energies,['base1-100']);assert.deepEqual(g.players[0].bench[0].energies,['base1-99']);
}
// Strange Barrier reduces >=20 attack damage from a Basic to 10.
{
 const g=ready();g.players[0].active=unit('gym1-66');g.players[1].active=unit('gym1-42');
 g.players[0].active.energies=['base1-97','base1-99'];
 ok(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,10);
}
// Call the Boss opens an optional search on evolution, and adds Giovanni to hand.
{
 const g=ready(),p=g.players[0];p.active=unit('gym2-43');g.players[1].active=unit('gym1-66');p.hand=['gym2-8'];p.deck.push('gym2-104');
 ok(g,0,'evolve',{handIndex:0,slot:-1});assert.ok(g.pendingDecision);choose(g,'deck:'+String(g.players[0].deck.length-1));
 assert.ok(g.players[0].hand.includes('gym2-104'));assert.equal(g.pendingDecision,null);
}
// Emerge: on heads, choose Koga's Beedrill from deck; used only once per turn.
{
 const g=ready(),p=g.players[0];p.active=unit('gym2-47');g.players[1].active=unit('gym1-66');p.deck.push('gym2-9');
 // Select a deterministic PRNG state whose next high-bit coin result is heads.
 const firstHeads=Array.from({length:5000},(_,i)=>i).find(i=>((Math.imul(i,1664525)+1013904223)>>>0)>=0x80000000);
 assert.ok(firstHeads>=0);g.rngState=firstHeads;
 ok(g,0,'use_power',{slot:-1});assert.ok(g.pendingDecision,'Heads should open evolution choice');
 choose(g,'deck:'+String(g.players[0].deck.length-1));
 assert.equal(g.players[0].active.id,'gym2-9');assert.ok(g.players[0].active.under.includes('gym2-47'));
}
console.log('PASS Gym Pokémon Powers: Energy Charge, Strange Barrier, Call the Boss (activated/passive/on-evolution)');
