'use strict';
const assert=require('node:assert/strict');
const R=require('./retail_theme_decks');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const P=require('./classic_power_core');
const u=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0,...more});
function game(){const g=createGame({decks:[R.list('brock'),R.list('misty')],format:'gym-theme',seed:4364});g.phase='game';g.turn=0;g.round=4;g.turnSerial=8;g.players[0].active=u('base1-7',{energies:['base1-97']});g.players[1].active=u('gym1-10');return g;}
function ok(g,who,type,payload){const result=applyCommand(g,who,{type,payload});assert(result.ok,`${type}: ${result.error}`);return result;}
function reply(g,selected,decline=false){const d=g.pendingDecision;assert(d,'Missing expected decision');ok(g,d.actor,'choose',{decisionId:d.id,...(decline?{decline:true}:{selected})});}
// Flee: defender, not attacker, decides whether and where to switch.
{
 const g=game();g.players[1].bench=[u('gym1-66'),u('gym1-85')];
 ok(g,0,'attack',{attackIndex:0});assert(g.pendingDecision,'Tentacruel must get a Flee reaction');
 assert.equal(g.pendingDecision.actor,1);
 assert.equal(g.pendingDecision.kind,'flee');
 reply(g,['bench:1']);
 assert.equal(g.players[1].active.id,'gym1-85');
 assert.equal(g.players[1].bench[1].id,'gym1-10');
 assert.equal(g.players[1].bench[1].damage,20);
 assert.equal(g.pendingDecision,null);
}
// Flee may be declined; the original Active remains and takes damage.
{
 const g=game();g.players[1].bench=[u('gym1-66')];
 ok(g,0,'attack',{attackIndex:0});assert(g.pendingDecision);
 reply(g,null,true);
 assert.equal(g.players[1].active.id,'gym1-10');
 assert.equal(g.players[1].active.damage,20);
}
// Bench Guard: defender chooses Rhydon, redirecting a damage counter away
// from a Benched Pokémon, and resolving card effects and turn afterwards.
{
 const g=game();const p=g.players[0],f=g.players[1];
 p.active=u('gym1-20',{energies:['base1-97','base1-97','base1-99']});
 f.active=u('base1-46');f.bench=[u('gym1-2'),u('gym1-66')];
 ok(g,0,'attack',{attackIndex:0});
 // Rock Slide has an attacker-controlled bench-targeting decision first.
 for(let i=0;g.pendingDecision&&g.pendingDecision.actor===0&&i<4;i++){
  const d=g.pendingDecision;reply(g,[d.options.find(x=>x.id==='bench:1')?.id??d.options[0].id]);
 }
 assert.equal(g.pendingDecision?.actor,1,'Bench Guard belongs to defending player');
 assert.equal(g.pendingDecision?.kind,'bench-guard');
 reply(g,['guard:0']);
 assert.equal(g.players[1].bench[0].damage,10,'Rhydon redirects one damage counter');
 assert.equal(g.players[1].bench[1].damage,0,'Original Benched Pokémon is shielded');
 assert.equal(g.pendingDecision,null);
}
// Sabrina copies a nonpersistent Trainer from opponent discard without
// moving the card out of that discard. The copied Trainer may have decisions.
{
 const g=game();const p=g.players[0],f=g.players[1];
 p.hand=['gym2-121'];f.discard=['base1-91'];p.deck=Array(15).fill('base1-99');
 // Some RNG seeds are heads; find one by trying real reducer transactions.
 let chosen=null;
 for(let seed=0;seed<5000;seed++){
  const probe=structuredClone(g);probe.rngState=seed;
  const r=applyCommand(probe,0,{type:'play_trainer',payload:{handIndex:0}});
  if(r.ok&&probe.pendingDecision?.kind==='copy'){chosen=probe;break;}
 }
 assert(chosen,'Psychic Control must offer copied one-shot Trainer on heads');
 reply(chosen,['disc:0']);
 assert.deepEqual(chosen.players[1].discard,['base1-91']);
 assert.equal(chosen.players[0].hand.length,2,'Copied Bill should draw two cards');
 assert.equal(chosen.players[0].discard.filter(id=>id==='gym2-121').length,1);
 assert.equal(chosen.players[0].discard.filter(id=>id==='base1-91').length,0,'Virtual copy cannot create cards');
}
console.log('PASS v0.29 reactive Gym effects: Flee accept/decline and active swap, Bench Guard targeted interception, Psychic Control copied Bill without card duplication.');
