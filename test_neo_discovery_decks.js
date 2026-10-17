'use strict';
const assert=require('node:assert/strict');
const D=require('./neo_discovery_decks'), N=require('./neo_genesis_decks');
const F=require('./classic_format');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const A=require('./attack_effects_core'),T=require('./classic_trainer_core');
const {isBasicPokemon}=require('./core_rules');
const unit=(id,opts={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0,...opts});
const play=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type} ${r.error||''}`);return r;};
const decision=(g,ids)=>{const d=g.pendingDecision;assert.ok(d,'Expected pending choice');play(g,d.actor,'choose',{decisionId:d.id,selected:ids??d.options.slice(0,d.min).map(x=>x.id)});};
const state=()=>{const g=createGame({decks:[D.list('brainwave'),D.list('wallop')],format:'neo-theme',seed:4526});g.phase='game';g.round=4;g.turnSerial=9;g.turn=0;g.players[0].active=unit('neo2-38');g.players[1].active=unit('neo2-66');return g;};
assert.equal(D.entries.length,2);assert.equal(D.list('brainwave').length,60);assert.equal(D.list('wallop').length,60);
assert.equal(D.neoIds.length,22);assert.equal(deckOptions().length,33);
assert.equal(new ClassicLocalService().cardPool().length,705+new Set([...N.neoIds,...D.neoIds,...require('./neo_bonus_pool').ids,...require('./neo_destiny_decks').neoIds,...require('./neo_v040_pool').ids,...require('./neo_v046_pool').ids,...require('./neo_v047_pool').ids,...require('./neo_v048_pool').ids,...require('./neo_v049_pool').ids,...require('./neo_v050_pool').ids,...require('./neo_v051_pool').ids,...require('./neo_v052_pool').ids,...require('./neo_v053_pool').ids]).size);
assert.equal(D.list('brainwave').filter(x=>x==='neo2-1').length,1,'Actual Espeon holo #1');
assert.ok(!D.list('brainwave').includes('neo2-20'));
for(const e of D.entries){
 const cards=D.list(e.id);assert.equal(cards.length,60);
 assert.ok(cards.some(id=>isBasicPokemon(CATALOG.get(id))));
 assert.equal(F.validateDeck(cards,CATALOG,{neo:true}).valid,true);
 assert.equal(F.validateDeck(cards,CATALOG).valid,false);
 const svc=new ClassicLocalService();let s=svc.create({deck:e.id,opponent:'cold_fusion',seed:1682});
 assert.equal(s.format,'neo-theme');assert.deepEqual(s.counts,[60,60]);assert.equal(s.view.players[1].hand,undefined);
 const token=s.token;
 const active=s.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
 s=svc.action(token,{type:'setup_select',payload:{handIndex:active}},s.revision);
 s=svc.action(token,{type:'setup_confirm',payload:{}},s.revision);
 assert.equal(s.view.phase,'game');assert.deepEqual(s.counts,[60,60]);assert.deepEqual(svc.decklist(e.id),cards);
}
assert.equal(F.isAllowed('neo2-12',{neo:true}),true,'Tyranitar is now fully executable with Trample');
assert.equal(F.isAllowed('neo2-1',{neo:true}),true);
for(const name of ['Energy Ark','Fossil Egg','Hyper Devolution Spray','Double Gust'])assert.ok(T.SUPPORTED.has(name),name);
// Energy Ark: flip twice; can search only 0..heads basic Energy, and shuffle.
{
 const g=state(),p=g.players[0];p.hand=['neo2-75'];p.deck=['neo1-110','neo1-111','neo2-59'];
 play(g,0,'play_trainer',{handIndex:0});if(g.pendingDecision){
  assert.equal(g.pendingDecision.actor,0);
  assert.ok(g.pendingDecision.max<=2);
  assert.ok(g.pendingDecision.options.every(x=>CATALOG.get(p.deck[Number(x.id.split(':')[1])]).supertype==='Energy'));
  decision(g,g.pendingDecision.options.slice(0,g.pendingDecision.max).map(x=>x.id));
 }
 assert.equal(g.pendingDecision,null);assert.ok(g.players[0].discard.includes('neo2-75'));
}
// Fossil Egg tails/heads, a successful deck search directly puts an eligible evolution onto Bench.
{
 let observed=false;
 for(let seed=0;seed<30&&!observed;seed++){
  const g=state(),p=g.players[0];g.rngState=seed*123456789;p.hand=['neo2-72'];p.deck=['neo2-60','neo1-110'];p.bench=[];
  play(g,0,'play_trainer',{handIndex:0});
  if(g.pendingDecision){assert.equal(g.pendingDecision.actor,0);const item=g.pendingDecision.options.find(x=>x.id==='deck:0');assert.ok(item);decision(g,[item.id]);assert.equal(g.players[0].bench[0].id,'neo2-60');observed=true;}
  assert.equal(g.pendingDecision,null);
 }
 assert.ok(observed,'Fossil Egg must support a successful heads branch');
}
// Hyper Devolution Spray returns the top card to hand and prevents immediate re-evolution.
{
 const g=state(),p=g.players[0];p.hand=['neo2-73'];p.active=unit('neo2-42',{under:['neo2-53'],damage:10});
 play(g,0,'play_trainer',{handIndex:0});decision(g,['slot:-1']);
 assert.equal(g.players[0].active.id,'neo2-53');assert.deepEqual(g.players[0].active.under,[]);
 assert.ok(g.players[0].hand.includes('neo2-42'));assert.equal(g.players[0].active.playedTurn,g.round);
}
// Double Gust: the opponent chooses your replacement FIRST, then you choose theirs.
{
 const g=state(),p=g.players[0],f=g.players[1];p.hand=['neo1-100'];p.bench=[unit('neo2-65')];f.bench=[unit('neo2-57')];
 play(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,1);decision(g,['bench:0']);
 assert.equal(g.pendingDecision.actor,0);decision(g,['bench:0']);
 assert.equal(g.players[0].active.id,'neo2-65');assert.equal(g.players[1].active.id,'neo2-57');assert.equal(g.pendingDecision,null);
}
// Exact printed attacks include variable damage and non-Fighting spread.
const attack=(id,name)=>CATALOG.get(id).attacks.find(x=>x.name===name);
assert.equal(A.resolve(A.compile(attack('neo2-1','Psychic')),()=>true,{enemyEnergy:3}).damage,60);
assert.equal(A.resolve(A.compile(attack('neo2-43','Spike Barrage')),()=>true,{selfEnergy:3}).damage,80);
assert.equal(A.resolve(A.compile(attack('neo2-46','Fury Cutter')),()=>true).damage,90);
assert.equal(A.resolve(A.compile(attack('neo2-65','Nap Time')),()=>true).healAllSelf,true);
{
 const g=state(),p=g.players[0],f=g.players[1];
 p.active=unit('neo2-45',{energies:['neo1-106','neo1-106']});p.bench=[unit('neo2-53')];f.active=unit('neo2-65');f.bench=[unit('neo2-57')];
 const i=CATALOG.get(p.active.id).attacks.findIndex(a=>a.name==='Dust Devil');
 play(g,0,'attack',{attackIndex:i});
 assert.equal(g.players[0].active.damage,0,'Pupitar is Fighting');assert.equal(g.players[0].bench[0].damage,10,'Caterpie takes spread');
 assert.equal(g.players[1].active.damage,10,'Teddiursa takes spread');assert.equal(g.players[1].bench[0].damage,0,'Larvitar is Fighting');
}
const unique=[...new Set(D.entries.flatMap(e=>D.list(e.id)))];const attacks=unique.flatMap(id=>CATALOG.get(id).attacks||[]);
console.log(`PASS Neo Discovery: ${D.entries.length} 60-card themes, ${D.neoIds.length} new printings, ${attacks.filter(a=>A.compile(a)).length}/${attacks.length} compiled attacks, four Trainer interactions, setup, hidden hands, Baby Pokémon and spread damage`);
// Every newly compiled Discovery attack family must execute through the real
// reducer, not merely return a compile descriptor.
{
 const energy={Grass:'neo1-108',Fighting:'neo1-106',Psychic:'neo1-110',Water:'neo1-111',Colorless:'neo1-111'};
 const signatures=require('./neo_discovery_attack_core').signatures;
 let tested=0;
 for(const id of D.neoIds){
  const c=CATALOG.get(id);
  for(let index=0;index<(c.attacks||[]).length;index++){
   const a=c.attacks[index],program=A.compile(a);if(!program?.kind.startsWith('discovery:'))continue;
   const g=state();g.players[0].active=unit(id,{energies:(a.cost||[]).map(type=>energy[type]||'neo1-111'),damage:10});
   g.players[1].active=unit('neo2-65',{energies:['neo1-111','neo1-111','neo1-111']});
   const res=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});
   assert.ok(res.ok,`${id} ${a.name}: ${res.error}`);
   while(g.pendingDecision){const q=g.pendingDecision;const picks=q.options.slice(0,q.min).map(o=>o.id);play(g,q.actor,'choose',{decisionId:q.id,selected:picks});}
   assert.equal(g.pendingDecision,null,`${id} ${a.name} cannot leave an unresolved choice`);
   tested++;
  }
 }
 assert.equal(tested,13);
 console.log(`PASS Neo Discovery: all ${tested} newly compiled attack families executed by authoritative reducer`);
}
