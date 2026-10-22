'use strict';
const assert=require('node:assert/strict');
const {ClassicLocalService,DECKS}=require('./classic_local_service');
const LEGACY_DECKS=['blackout','brushfire','overgrowth','zap','power_reserve','water_blast','rocket_lab','fossil_lab'];
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy}=require('./core_rules');
let checks=0,turns=0,choices=0,trainers=0,attacks=0;
for(const set of LEGACY_DECKS){
 for(let seed=1;seed<=10;seed++){
  const service=new ClassicLocalService();
  let r=service.create({deck:set,opponent:LEGACY_DECKS[(seed+1)%LEGACY_DECKS.length],seed:seed*7919});const token=r.token;
  const run=(type,payload={})=>{const next=service.action(token,{type,payload},r.revision);r=next;checks++;assert.deepEqual(r.counts,[60,60],'Card conservation');assert.equal(r.view.players[1].hand,undefined,'CPU hidden hand');assert.equal(r.view.players[1].prizes,undefined,'CPU hidden prizes');
   for(const [index,frame] of (r.cpuPlayback||[]).entries()){
    assert.equal(frame.view.players[1].hand,undefined,'Replay must hide CPU hand');
    assert.equal(frame.view.players[1].prizes,undefined,'Replay must hide CPU prizes');
    assert.ok(Array.isArray(frame.activity),'Replay contains only public actions');
    assert.ok(!('game' in frame),'Never expose server game state in replay');
    if(index>0)assert.notEqual(frame.view.pendingDecision?.actor,1,'Do not announce CPU cards before private target choices resolve');
   }
   // End-turn checkup can require a human response (for example a Berry),
   // before control ever reaches the CPU. Such a response has no CPU replay yet.
   if(type==='end_turn'&&!r.view.over&&r.view.pendingDecision?.actor!==0){
    assert.ok(r.cpuPlayback?.length>=1,`CPU turn must expose the opening replay frame (deck=${set}, seed=${seed}, revision=${r.revision}, phase=${r.view.phase}, turn=${r.view.turn}, over=${r.view.over}, lastActions=${JSON.stringify(r.lastActions)})`);
    assert.equal(r.cpuPlayback[0].view.turn,1,'Replay starts on the CPU turn');
   }
   return r;};
  assert.deepEqual(r.counts,[60,60]);
  assert.equal(r.view.phase,'setup');
  assert.ok(r.view.players[1].handCount<7,'CPU placed opening Pokémon');
  const bad=r.view.players[0].hand.findIndex(id=>isEnergy(CATALOG.get(id)));
  if(bad>=0){assert.throws(()=>run('setup_select',{handIndex:bad}),/Basic Pokémon/);checks++;}
  assert.equal(r.revision,0,'Invalid command must not increment revision');
  let first=r.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  assert.ok(first>=0);run('setup_select',{handIndex:first});
  run('setup_confirm');
  if(r.view.mulliganBonus){assert.equal(r.view.mulliganBonus.side,0);run('setup_bonus_draw',{count:0});}
  assert.equal(r.view.phase,'game');
  for(let step=0;step<70&&!r.view.over;step++){
   if(r.view.pendingDecision){const d=r.view.pendingDecision;
    assert.equal(d.actor,0,'Bot decisions should auto-resolve');
    try{run('choose',{decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)});}catch(e){console.error('Failed decision',set,seed,step,d,'unit',r.view.players[0].active?.id,'turn',r.view.turn);throw e;}choices++;continue;
   }
   assert.equal(r.view.turn,0,'Bot should resolve its whole turn');
   let p=r.view.players[0];const basic=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   if(basic>=0&&p.bench.length<3){run('bench',{handIndex:basic});continue;}
   const energy=p.hand.findIndex(id=>isEnergy(CATALOG.get(id)));
   if(energy>=0&&!r.you.energyUsed){run('attach_energy',{handIndex:energy,slot:-1});continue;}
   const trainer=p.hand.findIndex(id=>CATALOG.get(id)?.name==='Bill');
   if(trainer>=0){try{run('play_trainer',{handIndex:trainer});trainers++;continue;}catch(e){if(!/illegal|no legal|invalid/i.test(e.message))throw e;}}
   const moves=CATALOG.get(p.active.id)?.attacks||[];let done=false;
   for(let i=0;i<moves.length;i++){
    try{run('attack',{attackIndex:i});attacks++;done=true;break;}catch(e){if(!/Energy|illegal|unported|prevents|confus|requires|attack|target|No legal|no damage|heal|no attached|cannot use|not enough|discard/i.test(e.message))throw e;}
   }
   if(done)continue;
   run('end_turn');turns++;
  }
  assert.throws(()=>service.action(token,{type:'end_turn',payload:{}},r.revision-1),/Stale/);checks++;
  assert.deepEqual(r.counts,[60,60]);
 }
}
// RPG's custom 60-card deck must start with four Prizes in routine duels,
// while special encounters still use six. Validate the actual service path.
for(const prizeCount of [4,6]){
 const service=new ClassicLocalService();
 let r=service.create({
  deck:'custom',customDeck:require('./authentic_decks').list('base1:Blackout'),
  opponent:'power_reserve',npcDeckId:'yuna',npcDeckTier:1,seed:7919,prizeCount
 });
 const token=r.token;
 assert.equal(r.view.phase,'setup');
 const basic=r.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
 assert.ok(basic>=0,'RPG player has a Basic Pokémon to set up');
 r=service.action(token,{type:'setup_select',payload:{handIndex:basic}},r.revision);
 r=service.action(token,{type:'setup_confirm',payload:{}},r.revision);
 assert.equal(r.view.players[0].prizeCount,prizeCount);
 assert.equal(r.view.players[1].prizeCount,prizeCount);
 assert.deepEqual(r.counts,[60,60],'RPG setup conserves both full decks');
 checks+=2;
}
const small=new ClassicLocalService({maxSessions:1});small.create();assert.throws(()=>small.create(),/Too many/);checks++;
assert.throws(()=>small.state('bogus'),/Unknown or expired/);checks++;
assert.ok(attacks>30&&choices>5,`Expected game interactions: attacks=${attacks}, choices=${choices}`);
console.log(`PASS authoritative local service: ${LEGACY_DECKS.length*10} CPU duels, ${checks} validated commands, ${attacks} attacks, ${choices} interactive responses, ${trainers} Bill Trainers, ${turns} explicit turn ends; hidden-information, stale revision, deck conservation`);
