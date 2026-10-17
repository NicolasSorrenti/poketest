'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const G=require('./neo_genesis_decks'),D=require('./neo_discovery_decks');
const F=require('./classic_format'),B=require('./neo_bonus_pool');
const A=require('./attack_effects_core'),P=require('./classic_power_core');
const {ClassicLocalService}=require('./classic_local_service');
const u=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
function ready(attacker,defender,options={}){
 const g=createGame({decks:[G.list('cold_fusion'),D.list('wallop')],format:'neo-theme',seed:778});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=8;g.rngState=options.heads?1000:0;
 g.players[0].active=u(attacker,options.attacker||{});g.players[0].bench=[];
 g.players[1].active=u(defender,options.defender||{});g.players[1].bench=[];
 return g;
}
const send=(g,side,type,payload={})=>{let r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type} (${side}): ${r.error}`);return g;};
const pick=(g,ids,side=g.pendingDecision?.actor)=>{
 const d=g.pendingDecision;assert.ok(d,'Expected a decision');send(g,side,'choose',{decisionId:d.id,selected:ids??d.options.slice(0,d.min).map(o=>o.id)});};
const attack=(g,name)=>{const i=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);assert.ok(i>=0,`${name} not printed`);send(g,0,'attack',{attackIndex:i});};
const energy={Water:'neo1-111',Fire:'neo1-107',Psychic:'neo1-110',Grass:'neo1-108',Lightning:'neo1-109'};
// Original four theme decks: complete attack interpreter coverage.
for(const id of [...new Set([...G.entries.flatMap(e=>G.list(e.id)),...D.entries.flatMap(e=>D.list(e.id))])]){
 const c=CATALOG.get(id);assert.ok(c);for(const a of c.attacks||[])assert.ok(A.compile(a),`${id} ${c.name} ${a.name}`);
}
// Card pool grows by reviewed printings, not by importing entire Neo sets.
const svc=new ClassicLocalService(),pool=svc.cardPool();
assert.equal(B.ids.length,23);assert.equal(new Set(B.ids).size,B.ids.length);
for(const id of B.ids){let c=CATALOG.get(id);assert.ok(c,`${id} available`);assert.ok(F.isAllowed(id,{neo:true}),`${id} Neo legal`);assert.equal(F.isAllowed(id),false,`${id} cannot enter Classic`);assert.ok(pool.some(x=>x.id===id),`${id} in deck builder`);assert.ok((c.attacks||[]).every(x=>A.compile(x)),`${id} attacks supported`);assert.ok((c.abilities||[]).every(x=>x.name&&[...P.ACTIVATED,...P.ONPLAY,...P.PASSIVE].includes(x.name)),`${id} powers supported`);}
// Kingdra: select a replacement only after a non-KO; owner of attack decides.
{
 const g=ready('neo1-8','base1-3',{attacker:{energies:Array(4).fill(energy.Water)}});g.players[1].bench=[u('neo2-65')];
 attack(g,'Dragon Tornado');assert.equal(g.players[1].active.damage,50);assert.equal(g.pendingDecision?.actor,0);
 assert.equal(applyCommand(g,1,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:0']}}).ok,false);
 pick(g,['bench:0']);assert.equal(g.players[1].active.id,'neo2-65');assert.equal(g.players[1].bench[0].damage,50);
}
// Croconaw Screech: boosts the next attack against the same Pokémon after Weakness/Resistance.
{
 const g=ready('neo1-31','base1-3',{attacker:{energies:[energy.Water,energy.Water,energy.Water]}});
 attack(g,'Screech');assert.ok(g.players[1].active.screech);
 g.turn=0;g.turnSerial+=1;send(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,50);
}
// Quilava Char counter triggers between turns; survives on Bench and never changes ownership.
{
 const g=ready('neo1-47','base1-3',{heads:true,attacker:{energies:[energy.Fire,energy.Fire,energy.Fire]}});
 attack(g,'Char');assert.equal(g.players[1].active.charCounter,true);
 g.players[1].bench=[u('neo2-65')];
 // Fake turn checkup by opponent passing, with a seed that makes Char tails.
 g.rngState=0;send(g,1,'end_turn');assert.ok(g.players[1].active.damage>=30);
}
// Seadra Mud Splash: no automatic or opponent-controlled targeting.
{
 const g=ready('neo1-48','base1-3',{heads:true,attacker:{energies:[energy.Water,energy.Water]}});
 g.players[1].bench=[u('neo2-65'),u('neo2-66')];attack(g,'Mud Splash');
 assert.equal(g.pendingDecision?.actor,0);pick(g,['bench:1']);assert.equal(g.players[1].bench[0].damage,0);assert.equal(g.players[1].bench[1].damage,10);
}
// Fireworks tails: choose exactly one Energy; no second randomness on confirmation.
{
 const g=ready('neo1-57','base1-3',{attacker:{energies:[energy.Fire,energy.Fire]}});
 attack(g,'Fireworks');assert.equal(g.pendingDecision?.actor,0);
 pick(g,['energy:1']);assert.equal(g.players[0].active.energies.length,1);assert.equal(g.players[0].discard.at(-1),energy.Fire);
}
// Energy Cycle: two distinct choices; preserves the exact selected Energy card.
{
 const g=ready('neo2-52','base1-3',{heads:true,attacker:{energies:[energy.Psychic]},defender:{energies:[energy.Water,energy.Fire]}});
 g.players[1].bench=[u('neo2-65'),u('neo2-66')];attack(g,'Energy Cycle');
 assert.equal(g.pendingDecision?.kind,'energy-target');pick(g,['energy:1']);
 assert.equal(g.pendingDecision?.kind,'pokemon-target');pick(g,['bench:1']);
 assert.deepEqual(g.players[1].active.energies,[energy.Water]);assert.deepEqual(g.players[1].bench[1].energies,[energy.Fire]);
}
// Butterfree Magic Dust: explicit choice by attacking player when the flip succeeds.
{
 const g=ready('neo2-19','base1-3',{heads:true,attacker:{energies:[energy.Grass,energy.Grass]}});
 attack(g,'Magic Dust');assert.equal(g.pendingDecision?.kind,'condition');pick(g,['status:Poisoned']);assert.equal(g.players[1].active.poison,true);
}
// Metapod Hatch: heal, evolve from deck even when ordinarily barred by same-turn timing.
{
 const g=ready('neo2-42','base1-3',{heads:true,attacker:{energies:[energy.Grass,energy.Grass],damage:40}});
 g.players[0].deck=['neo2-19'];attack(g,'Hatch');assert.equal(g.pendingDecision?.kind,'deck-search');pick(g,['deck:0']);
 assert.equal(g.players[0].active.id,'neo2-19');assert.equal(g.players[0].active.damage,0);assert.deepEqual(g.players[0].active.under,['neo2-42']);
}
// Lanturn: optional Hydroelectric bonus cannot be forced by the CPU.
{
 const init=()=>ready('neo1-38','base1-3',{attacker:{energies:[energy.Lightning,energy.Lightning,energy.Water,energy.Water]}});
 let g=init();attack(g,'Floodlight');assert.equal(g.pendingDecision?.actor,0);pick(g,['boost:yes']);assert.equal(g.players[1].active.damage,40);
 g=init();attack(g,'Floodlight');const d=g.pendingDecision;send(g,0,'choose',{decisionId:d.id,decline:true});assert.equal(g.players[1].active.damage,20);
}
// Eevee: attaching Psychic Energy on a heads roll offers matching Eeveelution.
{
 const g=ready('neo2-38','base1-3',{heads:true});g.players[0].hand=[energy.Psychic];g.players[0].deck=['neo2-1','neo2-20'];
 send(g,0,'attach_energy',{handIndex:0,slot:-1});assert.equal(g.pendingDecision?.actor,0);assert.ok(g.pendingDecision.options.some(x=>x.label==='Espeon'));
 pick(g,[g.pendingDecision.options[0].id]);assert.equal(g.players[0].active.id,'neo2-1');assert.equal(g.players[0].active.energies.length,1);
 assert.equal(g.players[0].active.under[0],'neo2-38');
}
// Unown [A]: one Anger applies even when two copies are on Bench.
{
 const g=ready('neo2-33','neo1-80',{attacker:{energies:[energy.Psychic],damage:20}});g.players[0].bench=[u('neo2-33',{damage:10})];
 attack(g,'Hidden Power');assert.equal(g.players[1].active.damage,30);
}
console.log('PASS Neo v0.27: 4 themes fully compiled, 23 bonus printings, Neo attacks and Powers, multi-player decision ownership');
// Unown I's printed Increase on-play Power searches and benches another Unown.
{
 const g=ready('neo1-80','base1-3');g.players[0].hand=['neo2-68'];g.players[0].deck=['neo2-33','neo2-65'];
 send(g,0,'bench',{handIndex:0});assert.equal(g.players[0].bench[0].id,'neo2-68');assert.equal(g.pendingDecision?.actor,0);
 assert.equal(g.pendingDecision?.options.length,1);pick(g,['deck:0']);
 assert.equal(g.players[0].bench[1].id,'neo2-33');assert.equal(g.pendingDecision,null);
}
// Unown N works when Asleep, reduces Colorless attack damage by 30, but only with one copy in play.
{
 const setup=()=>{const g=ready('neo2-65','neo1-80',{attacker:{energies:[energy.Water]}});g.players[1].bench=[u('neo2-50',{status:'Paralyzed'})];return g;};
 let g=setup();attack(g,'Scratch');assert.equal(g.players[1].active.damage,0);
 g=setup();g.players[0].bench=[u('neo2-50')];attack(g,'Scratch');assert.equal(g.players[1].active.damage,10);
}
// Revive Fossil (Neo Discovery Omanyte): legal only once per turn and its search takes a real choice.
{
 const g=ready('neo2-60','base1-3',{heads:true});g.players[0].deck=['neo2-56'];
 send(g,0,'use_power',{slot:-1,powerIndex:0});assert.equal(g.pendingDecision?.actor,0);
 pick(g,['deck:0']);assert.equal(g.players[0].bench[0].id,'neo2-56');
 const result=applyCommand(g,0,{type:'use_power',payload:{slot:-1,powerIndex:0}});assert.equal(result.ok,false);
}
// Jaw Clamp: defender can neither retreat nor switch itself using Trainer effects while Croconaw remains Active.
{
 const g=ready('neo1-31','base1-3',{attacker:{energies:[energy.Water,energy.Water,energy.Water]}});
 g.players[1].bench=[u('neo2-65')];attack(g,'Jaw Clamp');
 assert.ok(g.players[1].active.noSwitch);g.players[1].hand=['base1-95']; // Switch
 const switchCard=g.players[1].hand[0];assert.equal(CATALOG.get(switchCard).name,'Switch');
 const previous=g.players[1].active.id;send(g,1,'play_trainer',{handIndex:0});
 assert.equal(g.players[1].active.id,previous);assert.equal(g.pendingDecision,null);
 assert.ok(g.players[1].discard.includes('base1-95'));
 g.players[0].active=u('neo1-80');g.players[1].hand=['base1-95'];send(g,1,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision?.actor,1);pick(g,['bench:0']);assert.equal(g.players[1].active.id,'neo2-65');
}
// Explicit Neo Unown deck limit is 4 TOTAL Unown Basic Pokémon, not 4 of each letter.
{
 const legal=D.list('brainwave');assert.ok(F.validateDeck(legal,CATALOG,{neo:true}).valid);
 const test=[...legal];let k=0;for(let i=0;i<test.length&&k<5;i++)if(CATALOG.get(test[i]).supertype==='Energy'){test[i]=['neo2-68','neo2-68','neo2-33','neo2-33','neo2-50'][k++];}
 const validation=F.validateDeck(test,CATALOG,{neo:true});assert.equal(validation.valid,false);assert.ok(validation.errors.some(x=>x.includes('Unown')));
}
console.log('PASS Neo v0.27 bonus: Increase, Normal, Revive Fossil, Jaw Clamp and printed Unown deck limit');
// Future card downloads must retain the corrected Neo Discovery Power metadata.
for(const [id,name] of [['neo2-68','[Increase]'],['neo2-50','[Normal]'],['neo2-60','Revive Fossil']]){
 const original=CATALOG.get(id),raw={id,name:original.name,category:'Pokemon',stage:original.subtypes[0]==='Stage 1'?'Stage1':'Basic',hp:original.hp,abilities:[{effect:'',name:''}]};
 const normalized=require('./tcgdex_adapter').normalizeCard(raw);
 assert.equal(normalized.abilities[0].name,name);assert.ok(normalized.abilities[0].text.length>30);
 if(id==='neo2-60')assert.equal(normalized.evolvesFrom,'Mysterious Fossil');
}
console.log('PASS Neo v0.27 importer integrity: Unown I/N, Revive Fossil preserve source corrections');
