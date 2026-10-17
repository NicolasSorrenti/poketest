'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
const game=()=>{const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:2026});g.phase='game';g.turn=0;g.turnSerial=10;g.round=6;g.players[0].active=U('gym2-78');g.players[1].active=U('base1-46');g.players[0].bench=[U('base1-3')];g.players[1].bench=[U('base1-3')];g.players[0].prizes=Array(6).fill('base1-99');g.players[1].prizes=Array(6).fill('base1-99');g.players[0].hand=[];g.players[1].hand=[];return g;};
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,`${type}: ${r.error}`);return g;}
function pick(g,selected){const d=g.pendingDecision;assert.ok(d,'Choice required');send(g,d.actor,'choose',{decisionId:d.id,selected:selected??[d.options[0].id]});}
function findCoin(predicate){for(let seed=0;seed<100000;seed++){const g=game();g.rngState=seed;if(predicate(g))return g;}throw Error('No seed');}
// Koga's Ninja Trick leaves play when the Pokémon is switched to the Bench by
// a normal Trainer, and when it retreats, not just when its reaction is used.
{
 const g=game();g.players[0].active.attachedTrainers=[{id:'gym2-115'}];g.players[0].hand=['base1-95'];send(g,0,'play_trainer',{handIndex:0});pick(g);
 assert.equal(g.players[0].bench[0].id,'gym2-78');assert.equal(g.players[0].bench[0].attachedTrainers.some(t=>t.id==='gym2-115'),false);
 assert.ok(g.players[0].discard.includes('gym2-115'));
}
{
 const g=game();g.players[0].active=U('gym2-78',{energies:['base1-99','base1-99'],attachedTrainers:[{id:'gym2-115'}]});
 send(g,0,'retreat',{slot:0});pick(g,['energy:0']);
 assert.equal(g.players[0].bench[0].attachedTrainers.some(t=>t.id==='gym2-115'),false);
 assert.ok(g.players[0].discard.includes('gym2-115'));
}
// Chaos Gym: historical 2003 WoTC ruling says opponents CANNOT redirect
// attached Trainer cards, which must also remain in owner's discard.
{
 const g=findCoin(g=>{g.stadium={id:'gym2-102',owner:0};g.players[0].hand=['gym2-101'];g.players[0].active=U('gym2-45');const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});return r.ok&&g.message.some(x=>x.includes('tails'));});
 assert.ok(g.players[0].discard.includes('gym2-101'));
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[1].active.attachedTrainers.length,0);
 assert.equal(g.players[0].active.attachedTrainers.length,0);
}
// For redirected turn-ending trainers, the opponent's virtual use cannot end
// the active player's turn (WoTC Chaos Gym ruling).
{
 let result=null;
 for(let seed=0;seed<40000&&!result;seed++){
  const g=game();g.rngState=seed;g.stadium={id:'gym2-102',owner:0};g.players[0].hand=['gym1-119'];g.players[0].active=U('base1-46');
  const x=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  if(x.ok&&g.pendingAction?.kind==='chaos_redirect')result=g;
 }
 assert.ok(result,'Need Chaos Gym tails');
 const g=result;pick(g,['choice:use']);assert.equal(g.turn,0,'Redirected turn-ending effect wrongly ended the active turn');
}
// Brock's Protection is also applicable to attacks moving Energy to the
// opposing Bench, not only to discard. Damage still resolves normally.
{
 let seen=false;
 for(let seed=0;seed<1000;seed++){
  const g=game();g.rngState=seed;g.players[0].active=U('neo2-52',{energies:['base1-101']});g.players[1].active=U('gym2-45',{energies:['base1-99'],attachedTrainers:[{id:'gym2-101'}]});g.players[1].bench=[U('base1-3')];
  const before=g.players[1].active.energies.join(',');
  send(g,0,'attack',{attackIndex:0});
  if(g.coinFlips?.at(-1)?.result!=='heads')continue;
  seen=true;
  assert.equal(g.players[1].active.energies.join(','),before);
  assert.equal(g.players[1].bench[0].energies.length,0);
  assert.equal(g.players[1].active.damage,20,'Protection must not prevent damage (Psychic weakness applies)');
  assert.equal(g.pendingDecision,null,'Protection should not ask attacker to move protected Energy');
  break;
 }
 assert.ok(seen);
}
// Charity returns only if the attached Pokémon survives end-of-turn Checkup.
{
 const g=game();g.players[0].active=U('base1-46',{damage:30,attachedTrainers:[{id:'gym1-99'}]});
 send(g,0,'end_turn');assert.ok(g.players[0].hand.includes('gym1-99'));
 assert.equal(g.players[0].active.attachedTrainers.length,0);
}
{
 const g=game();g.players[0].active=U('base1-46',{damage:40,poison:true,poisonDamage:10,attachedTrainers:[{id:'gym1-99'}]});
 send(g,0,'end_turn');assert.equal(g.players[0].hand.includes('gym1-99'),false,'Poison KO should discard Charity');
 assert.ok(g.players[0].discard.includes('gym1-99'));
}
console.log('PASS v0.44 Gym Trainer fidelity: Koga switching, Chaos attached cards and turn-ending, Brock Energy movement');
