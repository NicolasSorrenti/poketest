'use strict';
// This verifies bounded, real CPU-vs-human command sequences, NOT naturally
// finished matches or exhaustive individual historical effects.
const assert=require('node:assert/strict');
const {ClassicLocalService}=require('./classic_local_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy}=require('./core_rules');
const decks=['brock','misty','koga','sabrina','blaine','giovanni','gym_new_garden','gym_new_voltage'];
let accepted=0,attacks=0,choices=0,turns=0,scenarios=0;
for(let seed=1;seed<=4;seed++)for(let n=0;n<decks.length;n++){
 const S=new ClassicLocalService();let state=S.create({deck:decks[n],opponent:decks[(n+seed)%decks.length],seed:seed*101+n*409});const token=state.token;
 const action=(type,payload={})=>{state=S.action(token,{type,payload},state.revision);accepted++;assert.deepEqual(state.counts,[60,60],`Card conservation ${decks[n]}`);assert.equal(state.view.players[1].hand,undefined);assert.equal(state.view.players[1].prizes,undefined);};
 const hand=state.view.players[0].hand,ix=hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));assert.ok(ix>=0);action('setup_select',{handIndex:ix});action('setup_confirm');
 if(state.view.mulliganBonus){assert.equal(state.view.mulliganBonus.side,0);action('setup_bonus_draw',{count:0});}
 for(let step=0;step<48&&!state.view.over;step++){
  if(state.view.pendingDecision){const d=state.view.pendingDecision;assert.equal(d.actor,0);action('choose',{decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)});choices++;continue;}
  assert.equal(state.view.turn,0);
  const p=state.view.players[0];const basic=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  if(p.bench.length<2&&basic>=0){action('bench',{handIndex:basic});continue;}
  const energy=p.hand.findIndex(id=>isEnergy(CATALOG.get(id)));
  if(energy>=0&&!state.you.energyUsed){action('attach_energy',{handIndex:energy,slot:-1});continue;}
  // Attempt supported Gym Trainers; illegal choices/costs are not valid moves.
  let played=false;
  for(let i=0;i<p.hand.length;i++){
    if(CATALOG.get(p.hand[i])?.supertype!=='Trainer')continue;
    try{action('play_trainer',{handIndex:i});played=true;break;}
    catch(e){if(!/unported|not enough|No |illegal|Cannot|requires|Need|must|valid|already|not a|Unavailable|no /i.test(e.message))throw e;}
  }
  if(played)continue;
  let moved=false;const moves=CATALOG.get(p.active?.id)?.attacks||[];
  for(let i=0;i<moves.length;i++){
   try{action('attack',{attackIndex:i});attacks++;moved=true;break;}
   catch(e){if(!/Energy|illegal|unported|prevents|confus|requires|attack|target|No |heal|no attached|cannot|not enough|discard|blocked|prohibit|lock|damage|fail/i.test(e.message))throw e;}
  }
  if(moved)continue;action('end_turn');turns++;
 }
 scenarios++;
}
assert.ok(attacks>15&&turns>25,`Expected meaningful Gym actions, got attacks=${attacks},turns=${turns}`);
console.log(`PASS Gym mixed CPU integrations: ${scenarios} bounded sessions; ${accepted} authoritative actions; ${attacks} attacks; ${choices} choices; ${turns} end turns; conservation and private-state guards`);
