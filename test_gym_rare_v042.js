'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const U=(id,props={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...props});
function game(format='online-preview') {const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format,seed:281});g.phase='game';g.round=5;g.turnSerial=10;g.turn=0;g.players[0].active=U('base1-58',{energies:['base1-100','base1-100']});g.players[1].active=U('base1-58');g.players[0].bench=[U('base1-3')];g.players[1].bench=[U('base1-3')];g.players[0].hand=[];g.players[1].hand=[];return g;}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,type+': '+r.error);}
function chaosTails(){const g=game('gym-expanded');g.stadium={id:'gym2-102',owner:0};g.players[0].stadium='gym2-102';g.players[0].hand=['base1-71'];for(let seed=0;seed<50000;seed++){g.rngState=seed;const trial=structuredClone(g);send(trial,0,'play_trainer',{handIndex:0});if(trial.pendingAction?.kind==='chaos_redirect')return trial;}throw Error('No Chaos tails');}
// (1) Nested redirected two-card cost and custom deck-search choice must take
// their costs from the opponent (not owner) and preserve owner card disposal.
{
 const g=chaosTails();const p=g.players[1];p.hand=['base1-99','base1-98','base1-100'];p.deck=['base1-3','base1-4'];const id=g.pendingDecision.id;
 send(g,1,'choose',{decisionId:id,selected:['choice:use']});
 assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.kind,'cost');
 const costChoices=g.pendingDecision.options.slice(0,2).map(x=>x.id);
 send(g,1,'choose',{decisionId:g.pendingDecision.id,selected:costChoices});
 assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.kind,'find');
 send(g,1,'choose',{decisionId:g.pendingDecision.id,selected:[g.pendingDecision.options[0].id]});
 assert.equal(g.pendingDecision,null);assert.equal(g.players[1].hand.length,2); // 3 original cards - 2 discarded + 1 searched
 assert.ok(g.players[1].discard.includes('base1-99'));
 assert.ok(g.players[1].discard.includes('base1-98'));
 assert.ok(g.players[0].discard.includes('base1-71'));
 assert.equal(g.players[1].discard.includes('base1-71'),false);
}
// (2) A face-down Psychic Pokémon is not a Psylink source until revealed.
{
 const g=game();g.players[0].active=U('gym2-16',{energies:['base1-101','base1-101','base1-101','base1-101']});g.players[0].bench=[U('base2-22',{secretPlanFaceDown:true,secretPlanOwner:0,secretPlanSerial:20})];
 const owner=publicView(g,0);assert.equal(owner.players[0].active.effectiveAttacks.length,CATALOG.get('gym2-16').attacks.length,'Hidden psychic Pokemon leaked into Psylink');
 const guest=publicView(g,1),watch=publicView(g,null);assert.equal(guest.players[0].bench[0].id,'gym2-107');assert.equal(watch.players[0].bench[0].id,'gym2-107');
 const bad=applyCommand(g,0,{type:'attack',payload:{attackIndex:1}});assert.equal(bad.ok,false);
}
// (3) Face-down Baby is treated as a normal Basic until revealed: no Baby flip.
{
 function run(id,hidden){const g=game();g.players[1].active=U(id,hidden?{secretPlanFaceDown:true,secretPlanOwner:1,secretPlanSerial:55}:{});g.rngState=101;send(g,0,'attack',{attackIndex:0});return g;}
 const secret=run('neo1-22',true),basic=run('base1-58',false);
 assert.equal(secret.rngState,basic.rngState,'Hidden Baby consumed a Baby-rule flip');
 assert.equal(secret.players[1].active.damage,basic.players[1].active.damage,'Hidden Baby illegally blocked attack damage');
}
// (4) A Dark Pokemon behind Secret Plan must not get its printed Rocket's
// Hideout HP modifier until the card is revealed.
{
 const g=game();g.stadium={id:'neo3-63',owner:0};g.players[0].stadium='neo3-63';
 g.players[0].active=U('neo2-10',{energies:['neo1-19']});
 g.players[1].active=U('base5-4',{secretPlanFaceDown:true,secretPlanOwner:1,secretPlanSerial:60});
 send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].active.damage,0,'Rocket Hideout applied Dark bonus to a concealed non-Dark face-down Basic');
}
// (5) Psyduck should copy recoil and coin-recoil attacks without energy costs.
{
 const recoil=CATALOG.get('base1-58').attacks[1];assert.equal(ATTACK.compile(recoil).kind,'coin-recoil');
 const g=game('gym-expanded');g.players[0].active=U('gym2-90',{energies:['base1-101']});g.players[1].active=U('base1-58');g.players[0].deck=Array(4).fill('base1-3');
 let seed=null;for(let i=0;i<100000;i++){const test=structuredClone(g);test.rngState=i;send(test,0,'attack',{attackIndex:0});if(test.pendingAction?.kind==='psyduck_esp_copy'){seed=i;break;}}
 assert.notEqual(seed,null);g.rngState=seed;send(g,0,'attack',{attackIndex:0});
 assert.ok(g.pendingDecision.options.some(o=>o.label==='Thunder Jolt'),'Three-head ESP must offer legal recoil attack');
 const option=g.pendingDecision.options.find(o=>o.label==='Thunder Jolt');send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:[option.id]});
 assert.ok(g.players[1].active.damage>=30);
}
// (6) Three-head ESP can copy a targeted Bench attack and ask for the target
// through a second validated decision, without damaging the wrong Bench slot.
{
 const g=game('gym-expanded');g.players[0].active=U('gym2-90',{energies:['base1-101']});
 g.players[1].active=U('base3-7');g.players[1].bench=[U('base1-3'),U('base1-58')];
 let seed=null;for(let i=0;i<100000;i++){
  const check=structuredClone(g);check.rngState=i;send(check,0,'attack',{attackIndex:0});
  if(check.pendingAction?.kind==='psyduck_esp_copy'){seed=i;break;}
 }
 assert.notEqual(seed,null);g.rngState=seed;send(g,0,'attack',{attackIndex:0});
 const opt=g.pendingDecision.options.find(o=>o.label==='Stretch Kick');assert.ok(opt);
 send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:[opt.id]});
 assert.equal(g.pendingAction.kind,'psyduck_esp_bench');assert.equal(g.pendingDecision.actor,0);
 const unauthorized=applyCommand(g,1,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:1']}});
 assert.equal(unauthorized.ok,false);
 send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:1']});
 assert.equal(g.pendingDecision,null);assert.equal(g.players[1].bench[0].damage,0);
 assert.equal(g.players[1].bench[1].damage,20);
 assert.equal(g.players[1].active.damage,0);
}
// (7) Chaos Gym -> Psychic Control -> Bill: a nested virtual Trainer chain
// resolves with the new actor's cards, never duplicating either source Trainer.
{
 const g=game('gym-expanded');g.rngState=3;g.stadium={id:'gym2-102',owner:0};g.players[0].stadium='gym2-102';
 g.players[0].hand=['gym2-121'];g.players[0].discard=['base1-91'];g.players[1].deck=Array(6).fill('base1-3');
 send(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingAction.kind,'chaos_redirect');
 send(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['choice:use']});
 assert.equal(g.pendingDecision?.kind,'copy');assert.equal(g.pendingDecision.actor,1);
 const pre=g.players[1].hand.length;
 send(g,1,'choose',{decisionId:g.pendingDecision.id,selected:[g.pendingDecision.options[0].id]});
 assert.equal(g.players[1].hand.length,pre+2);
 assert.ok(g.players[0].discard.includes('gym2-121'));
 assert.ok(g.players[0].discard.includes('base1-91'));
 assert.equal(g.players[1].discard.includes('gym2-121'),false);
 assert.equal(g.players[1].discard.includes('base1-91'),false);
}
console.log('PASS v0.42 rare Gym: nested Chaos costs, Secret Plan privacy/baby rule, Psylink and Psyduck recoil copy');
