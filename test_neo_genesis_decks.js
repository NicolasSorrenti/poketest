'use strict';
const assert=require('node:assert/strict');
const NEO=require('./neo_genesis_decks');
const FORMAT=require('./classic_format');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy}=require('./core_rules');
const T=require('./classic_trainer_core'),P=require('./classic_power_core'),A=require('./attack_effects_core');
const unit=(id,opts={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0,...opts});
const ok=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type} ${r.error||''}`);return r;};
const ready=()=>{const g=createGame({decks:[NEO.list('cold_fusion'),NEO.list('hotfoot')],format:'neo-theme',seed:897});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;g.players[0].active=unit('neo1-80');g.players[1].active=unit('neo1-61');return g;};
const reply=(g,ids)=>{const d=g.pendingDecision;assert.ok(d,'Expected choice');ok(g,d.actor,'choose',{decisionId:d.id,selected:ids??d.options.slice(0,d.min).map(x=>x.id)});};
assert.equal(NEO.entries.length,2);assert.equal(NEO.neoIds.length,33);
assert.equal(deckOptions().length,33);
for(const row of NEO.entries){
 const cards=NEO.list(row.id);
 assert.equal(cards.length,60);
 assert.ok(cards.some(id=>isBasicPokemon(CATALOG.get(id))));
 assert.ok(cards.filter(id=>isEnergy(CATALOG.get(id))).length>=20);
 assert.equal(FORMAT.validateDeck(cards,CATALOG,{neo:true}).valid,true);
 assert.equal(FORMAT.validateDeck(cards,CATALOG).valid,false,'Classic must reject Neo printings');
 const local=new ClassicLocalService();let s=local.create({deck:row.id,opponent:'blackout',seed:8312});
 assert.equal(s.format,'neo-theme');assert.deepEqual(s.counts,[60,60]);assert.equal(s.view.players[1].hand,undefined);
 const token=s.token;
 const basics=s.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
 s=local.action(token,{type:'setup_select',payload:{handIndex:basics}},s.revision);
 s=local.action(token,{type:'setup_confirm',payload:{}},s.revision);
 assert.equal(s.view.phase,'game');assert.deepEqual(s.counts,[60,60]);
 assert.deepEqual(local.decklist(row.id),cards);
}
assert.ok(!FORMAT.isAllowed('neo1-9',{neo:true}),'Lugia is not in either starter and must remain locked');
assert.ok(FORMAT.isAllowed('neo1-8',{neo:true}));
assert.equal(new ClassicLocalService().cardPool().length,705+new Set([...NEO.neoIds,...require('./neo_discovery_decks').neoIds,...require('./neo_bonus_pool').ids,...require('./neo_destiny_decks').neoIds,...require('./neo_v040_pool').ids,...require('./neo_v046_pool').ids]).size);
assert.equal(T.SUPPORTED.has('Professor Elm'),true);
for(const name of ["Bill's Teleporter",'Moo-Moo Milk','Pokémon March','Professor Elm','Super Rod'])assert.ok(T.SUPPORTED.has(name),`Missing Trainer: ${name}`);
// Neo Trainer cards resolve in the same reducer as every existing Classic Trainer.
{
 const g=ready(),p=g.players[0];p.hand=['neo1-96','neo1-80'];p.deck=['neo1-80','neo1-81',...Array(12).fill('neo1-111')];
 ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.players[0].hand.length,7);
 assert.ok(g.players[0].trainerLockedUntil>g.turnSerial);
 assert.equal(applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}}).ok,false);
}
{
 const g=ready(),p=g.players[0];p.hand=['neo1-101'];p.active.damage=40;
 ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,0);
 reply(g,['slot:-1']);assert.ok(g.players[0].active.damage<=40&&g.players[0].active.damage>=0);assert.equal(g.pendingDecision,null);
}
{
 const g=ready(),p=g.players[0],f=g.players[1];p.hand=['neo1-102'];p.bench=[];f.bench=[];
 p.deck=['neo1-80','neo1-111'];f.deck=['neo1-61','neo1-108'];
 ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,1,'Opponent chooses first');
 reply(g,[g.pendingDecision.options[0].id]);assert.equal(g.pendingDecision.actor,0,'Then owner chooses');
 reply(g,[g.pendingDecision.options[0].id]);assert.equal(g.players[0].bench.length,1);assert.equal(g.players[1].bench.length,1);
 assert.equal(g.pendingDecision,null);
}
{
 const g=ready(),p=g.players[0];p.hand=['neo1-103'];p.discard=['neo1-80','neo1-31'];
 ok(g,0,'play_trainer',{handIndex:0});if(g.pendingDecision){assert.equal(g.pendingDecision.actor,0);reply(g,[g.pendingDecision.options[0].id]);}
 assert.equal(g.players[0].hand.length,1,'Super Rod recovers exactly one eligible Pokémon');
 assert.equal(g.pendingDecision,null);
}
// Full print-signature attack registry: no generic no-op fallback.
const neoAttacks=[...new Set([...NEO.list('cold_fusion'),...NEO.list('hotfoot')])].flatMap(id=>(CATALOG.get(id)?.attacks||[]).map(a=>({id,a})));
const readyAttacks=neoAttacks.filter(x=>!!A.compile(x.a));
assert.ok(readyAttacks.length>=35,`Expected at least 35 executable Neo attacks; got ${readyAttacks.length}`);
const lookup=(id,name)=>neoAttacks.find(x=>x.id===id&&x.a.name===name)?.a;
assert.equal(A.resolve(A.compile(lookup('neo1-62','Fin Slap')),()=>true,{damagedPreviousTurn:true}).damage,30);
assert.equal(A.resolve(A.compile(lookup('neo1-62','Fin Slap')),()=>true,{damagedPreviousTurn:false}).damage,20);
assert.equal(A.resolve(A.compile(lookup('neo1-75','Scary Face')),()=>true).noRetreat,true);
assert.equal(A.resolve(A.compile(lookup('neo1-27','Spider Web')),()=>false).noRetreat,false);
assert.equal(A.resolve(A.compile(lookup('neo1-7','Leech Seed')),()=>true).healFromDamage,'seed');
{const g=ready();g.players[0].active=unit('neo1-23',{energies:['neo1-107']});g.players[1].active=unit('neo1-61');const serial=g.turnSerial;ok(g,0,'attack',{attackIndex:0});assert.equal(g.powerBlankUntil,serial+3);}
// Baby rule: unsuccessful attack targeting Neo Elekid or Magby consumes turn, not the target.
{
 const g=ready();g.players[0].active=unit('neo1-80',{energies:['neo1-111']});g.players[1].active=unit('neo1-23');g.rngState=0;
 ok(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.turn,1);
}
// Playful Punch is available from the Bench, ends the turn, and is still processed by the authoritative engine.
{
 const g=ready(),p=g.players[0];p.bench=[unit('neo1-22')];
 ok(g,0,'use_power',{slot:0});assert.equal(g.turn,1);assert.equal(g.pendingDecision,null);
}
console.log(`PASS Neo Genesis retail decks: 2 exact 60-card lists, ${NEO.neoIds.length} curated Neo printings, ${readyAttacks.length}/${neoAttacks.length} attack programs, 5 Trainer effects, Baby rule, Power, strict pool, local duel startup and hidden hands.`);
// Every newly added Neo attack kind is exercised through the game reducer, not
// just the compiler. Existing CPU and duel tests cover older families.
for(const {id,a} of neoAttacks){
 const prog=A.compile(a);if(!prog?.kind.startsWith('neo:'))continue;
 const g=ready();g.players[0].active=unit(id);g.players[1].active=unit('base1-3');
 const eng={Grass:'neo1-108',Fire:'neo1-107',Water:'neo1-111',Lightning:'neo1-109',Colorless:'neo1-111'};
 g.players[0].active.energies=(a.cost||[]).map(t=>eng[t]||'neo1-111');
 const index=CATALOG.get(id).attacks.indexOf(a); // by identity within CATALOG
 const result=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});
 assert.ok(result.ok,`${id} ${a.name} action failed: ${result.error}`);
 assert.equal(g.pendingDecision,null,`${id} ${a.name}: unresolved choice`);
}
console.log('PASS Neo Genesis: all newly migrated attack families executed through reducer');
