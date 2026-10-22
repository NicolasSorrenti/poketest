'use strict';
// Bounded human-vs-CPU command sequences through the actual session service.
// These do not claim every game ended naturally or every rare ruling is certified.
const assert=require('node:assert/strict');
const {ClassicLocalService}=require('./classic_local_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy,canEvolve}=require('./core_rules');
const decks=['cold_fusion','hotfoot','brainwave','wallop'];
let accepted=0,attacks=0,choices=0,evolutions=0,trainers=0;
for(let seed=1;seed<=4;seed++)for(let d=0;d<decks.length;d++){
 const S=new ClassicLocalService();let st=S.create({deck:decks[d],opponent:decks[(d+seed)%decks.length],seed:seed*11731+d*9127});const token=st.token;
 const step=(type,payload={})=>{st=S.action(token,{type,payload},st.revision);accepted++;assert.deepEqual(st.counts,[60,60],'60-card conservation');assert.equal(st.view.players[1].hand,undefined);assert.equal(st.view.players[1].prizes,undefined);};
 const legal=(type,payload={})=>{try{step(type,payload);return true;}catch(e){if(/not your turn|Invalid decision|Unknown or expired/.test(e.message))throw e;return false;}};
 const basic=st.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
 assert.ok(basic>=0);step('setup_select',{handIndex:basic});step('setup_confirm');
 if(st.view.mulliganBonus){assert.equal(st.view.mulliganBonus.side,0);step('setup_bonus_draw',{count:0});}
 for(let iter=0;iter<65&&!st.view.over;iter++){
  if(st.view.pendingDecision){const q=st.view.pendingDecision;assert.equal(q.actor,0);step('choose',{decisionId:q.id,selected:q.options.slice(0,q.min).map(x=>x.id)});choices++;continue;}
  assert.equal(st.view.turn,0);
  const p=st.view.players[0];let moved=false;
  for(let i=0;i<p.hand.length&&!moved;i++){
   const c=CATALOG.get(p.hand[i]);if(!c?.evolvesFrom)continue;
   for(let slot=-1;slot<p.bench.length;slot++){
    const t=slot===-1?p.active:p.bench[slot];if(!t||!canEvolve(c,CATALOG.get(t.id)))continue;
    if(legal('evolve',{handIndex:i,slot})){evolutions++;moved=true;break;}
   }
  }
  if(moved)continue;
  const b=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  if(b>=0&&p.bench.length<3){step('bench',{handIndex:b});continue;}
  const en=p.hand.findIndex(id=>isEnergy(CATALOG.get(id)));
  if(en>=0&&!st.you.energyUsed){step('attach_energy',{handIndex:en,slot:-1});continue;}
  for(let i=0;i<p.hand.length&&!moved;i++)if(CATALOG.get(p.hand[i])?.supertype==='Trainer'&&legal('play_trainer',{handIndex:i})){trainers++;moved=true;}
  if(moved)continue;
  for(let i=0;i<(CATALOG.get(p.active?.id)?.attacks||[]).length&&!moved;i++)if(legal('attack',{attackIndex:i})){attacks++;moved=true;}
  if(!moved)step('end_turn');
 }
}
assert.ok(attacks>8&&choices>0,`Need attack and choice coverage: ${attacks},${choices}`);
console.log(`PASS Neo v0.27: 16 seeded authoritative sessions, ${accepted} commands, ${attacks} attacks, ${choices} decisions, ${trainers} Trainers, ${evolutions} evolutions; card conservation and private hands`);
