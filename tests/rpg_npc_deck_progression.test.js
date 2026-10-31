'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const NPC=require('../rpg_npc_deck_progression');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck,canEvolve}=require('../core_rules');
const FORMAT=require('../classic_format');
const PARTNER=require('../rpg_partner_decks');
const service=new ClassicLocalService();
const rank=ids=>Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(x=>x===id).length]));
const pokemon=ids=>ids.filter(id=>CATALOG.get(id)?.supertype==='Pokémon');

test('the 25 authored starting recipes are distinct, deterministic, and independent from retail decks',()=>{
 assert.equal(NPC.NAMES.length,25);
 const sourceDecks=Object.fromEntries(['power_reserve','blackout','overgrowth','zap','gym_new_voltage','rocket_lab','water_blast','fossil_lab','hotfoot','cold_fusion','bodyguard','lockdown'].map(id=>[id,service.decklist(id)]));
 const packages=[];
 for(const npc of NPC.NAMES){
  const recipe=NPC.recipeFor({npc,tier:1,catalog:CATALOG});
  assert.equal(recipe.length,60,npc+' starting deck size');
  assert.deepEqual(recipe,NPC.STARTING_RECIPES[npc],npc+' authored recipe is stable');
  assert.equal(validateDeck(recipe,CATALOG).valid,true,npc+' starting recipe: '+validateDeck(recipe,CATALOG).errors.join('; '));
  assert.ok(recipe.every(id=>CATALOG.has(id)),npc+' uses historical IDs only');
  assert.deepEqual(FORMAT.illegalCards(recipe,{gymFull:true,neo:true}),[],npc+' starting recipe uses cards unsupported by the live historical format');
  assert.deepEqual(Object.keys(rank(recipe)).filter(id=>!CATALOG.has(id)),[]);
  packages.push(new Set(pokemon(recipe)));
 }
 for(let i=0;i<packages.length;i++)for(let j=i+1;j<packages.length;j++)
  assert.deepEqual([...packages[i]].filter(id=>packages[j].has(id)),[],NPC.NAMES[i]+' and '+NPC.NAMES[j]+' reuse a Pokémon card package');
 for(const [id,cards] of Object.entries(sourceDecks))assert.deepEqual(service.decklist(id),cards,'shared retail recipe changed: '+id);
});

test('all characters return legal, deterministic 60-card decks at each of seven tiers',()=>{
 for(const npc of NPC.NAMES)for(let tier=1;tier<=7;tier++){
  const a=NPC.recipeFor({npc,tier,catalog:CATALOG}),b=NPC.recipeFor({npc,tier,catalog:CATALOG});
  assert.deepEqual(a,b,npc+' tier '+tier+' determinism');
  assert.equal(a.length,60,npc+' tier '+tier+' size');
  const legality=validateDeck(a,CATALOG);
  assert.equal(legality.valid,true,npc+' tier '+tier+': '+legality.errors.join('; '));
  assert.ok(a.every(id=>CATALOG.has(id)),npc+' tier '+tier+' contains unsupported ID');
  assert.deepEqual(FORMAT.illegalCards(a,{gymFull:true,neo:true}),[],npc+' tier '+tier+' leaves the live card pool');
  const creatures=pokemon(a).map(id=>CATALOG.get(id));
  for(const evolution of creatures.filter(card=>card.evolvesFrom))
   assert.ok(creatures.some(parent=>canEvolve(evolution,parent)),npc+' tier '+tier+' strands '+evolution.name);
  for(const [name,n] of Object.entries(a.reduce((m,id)=>{const c=CATALOG.get(id);if(c?.supertype!=='Energy')m[c.name]=(m[c.name]||0)+1;return m;},{})))
   assert.ok(n<=4,npc+' tier '+tier+' has '+n+' copies of '+name);
 }
});

test('all seven tiers add a strategy upgrade at each campaign milestone',()=>{
 for(const npc of NPC.NAMES){
  const decks=Array.from({length:7},(_,i)=>NPC.recipeFor({npc,tier:i+1,catalog:CATALOG}));
  for(let i=1;i<decks.length;i++)assert.notDeepEqual(decks[i],decks[i-1],npc+' tier '+(i+1)+' must improve the previous tier');
  const count=(tier,id)=>decks[tier-1].filter(x=>x===id).length;
  assert.ok(count(2,'base1-71')>count(1,'base1-71'),npc+' tier 2 adds Computer Search');
  assert.ok(count(3,'base1-76')>=2,npc+' tier 3 adds evolution support');
  assert.ok(count(3,NPC.PROFILES[npc].midline)>count(2,NPC.PROFILES[npc].midline),npc+' tier 3 strengthens its own evolution line');
  assert.ok(count(4,'base3-59')>=2,npc+' tier 4 adds Energy Search');
  assert.ok(NPC.PROFILES[npc].disruption.some(id=>count(5,id)>count(4,id)),npc+' tier 5 adds its disruption or recovery package');
  assert.ok(count(6,'base1-71')>count(5,'base1-71'),npc+' tier 6 improves search');
  assert.ok(count(6,NPC.PROFILES[npc].ace)>count(5,NPC.PROFILES[npc].ace),npc+' tier 6 adds its ace');
  assert.ok(count(7,NPC.PROFILES[npc].finisher)>count(6,NPC.PROFILES[npc].finisher),npc+' tier 7 adds its finisher');
 }
});

test('the named character themes remain explicit in the authored Pokemon cores',()=>{
 const expected={
  barb:['neo1-52','neo1-38'],laca:['neo1-4'],daisy:['base1-6','base5-47'],rina:['base4-18'],
  sol:['gym1-1','gym2-33'],jinx:['neo1-1'],luna:['neo2-8'],elena:['base2-13','gym1-26'],sierra:['base5-27','base5-23'],
  jicy:['neo2-65','neo2-15','neo1-74','neo1-37','neo1-41','neo3-5']
 };
 for(const [npc,ids] of Object.entries(expected))for(const id of ids)
  assert.ok(NPC.STARTING_RECIPES[npc].includes(id),npc+' must retain signature card '+id);
 assert.match(NPC.STRATEGIES.barb,/Psychic\/Lightning/);
 assert.match(NPC.STRATEGIES.laca,/Water evolution tempo/);
 assert.match(NPC.STRATEGIES.daisy,/Water reversal/);
  assert.match(NPC.STRATEGIES.rina,/Grass beatdown/);
 assert.match(NPC.STRATEGIES.sol,/Fire\/Water/);
 assert.match(NPC.STRATEGIES.jinx,/Lightning aggression/);
 assert.match(NPC.STRATEGIES.luna,/Water tempo control/);
 assert.match(NPC.STRATEGIES.elena,/Jungle control/);
 assert.match(NPC.STRATEGIES.sierra,/Fighting disruption/);
 assert.match(NPC.STRATEGIES.jicy,/Cute Colorless bruisers/);
});

test('NPC deck tiers advance on the requested days and story chapters only affect that NPC',()=>{
 for(const [day,tier] of [[1,1],[15,1],[16,2],[30,2],[31,3],[45,3],[46,4],[60,4],[61,5],[75,5],[76,6],[90,6],[91,7]])assert.equal(NPC.tierForDay(day),tier,'Day '+day);
 assert.equal(NPC.tierForDay(undefined),1);
 const s={day:15,storyDone:{reina_route_1:{day:12}}};
 assert.equal(NPC.tierForOpponent(s,'reina'),1);s.day=16;
 assert.equal(NPC.tierForOpponent(s,'reina'),2);assert.equal(NPC.tierForOpponent(s,'hana'),2,'calendar progress applies to the full roster');
 assert.equal(NPC.tierForOpponent({day:45,storyDone:{jinx_route_3:{day:45}}},'jinx'),3);
 assert.equal(NPC.tierForOpponent({day:45,storyDone:{}},'reina'),3,'calendar reaches tier 3 on Day 31');
 assert.equal(NPC.tierForOpponent({day:NaN},'reina'),1);
 assert.equal(NPC.tierForOpponent({day:20,storyDone:{other_route_3:true}},'bad/npc'),2);
});

test('unknown guest fallback is deterministic and does not mutate its provided recipe',()=>{
 const original=service.decklist('brushfire'),first=NPC.upgrade({npc:'new_guest',tier:3,original,catalog:CATALOG});
 assert.deepEqual(first,original);assert.deepEqual(NPC.upgrade({npc:'new_guest',tier:3,original,catalog:CATALOG}),first);
 assert.equal(validateDeck(first,CATALOG).valid,true);assert.deepEqual(service.decklist('brushfire'),original);
});

test('Classic RPG uses authored CPU decks while preserving normal and custom partner matches',()=>{
 const original=service.decklist('blackout'),baseline=service.create({deck:'brushfire',opponent:'blackout',npcDeckId:'reina',npcDeckTier:1,seed:91});
 const upgraded=service.create({deck:'brushfire',opponent:'blackout',npcDeckId:'reina',npcDeckTier:7,seed:92});
 assert.equal(upgraded.cpu.deckTier,7);assert.equal(upgraded.cpu.level,baseline.cpu.level,'deck progression does not change CPU skill');
 const playerEdited=service.create({deck:'brushfire',opponent:'blackout',customOpponentDeck:[...original],npcDeckId:'reina',npcDeckTier:7,seed:93});
 assert.equal(playerEdited.cpu.deckTier,null,'player-edited partner deck takes priority');
 assert.throws(()=>service.create({deck:'brushfire',opponent:'blackout',npcDeckTier:8}),/tier/);
 assert.throws(()=>service.create({deck:'brushfire',opponent:'blackout',npcDeckTier:3}),/identity/);
 assert.ok(PARTNER.count(original)['base1-7']>0);
});

test('Classic service loads each authored RPG deck at both the starting and final tiers',()=>{
 const live=new ClassicLocalService({maxSessions:200});
 const physicalDeck=player=>[
  ...(player.deck||[]),...(player.hand||[]),...(player.discard||[]),...(player.prizes||[]),
  ...[player.active,...(player.bench||[])].filter(Boolean).flatMap(unit=>[
   unit.id,...(unit.under||[]).map(card=>typeof card==='string'?card:card.id),
   ...(unit.energies||[]).map(card=>typeof card==='string'?card:card.id),
   ...(unit.attachedTrainers||[]).map(card=>typeof card==='string'?card:card.id)
  ])
 ];
 const frequency=ids=>ids.reduce((out,id)=>{out[id]=(out[id]||0)+1;return out;},{});
 for(const npc of NPC.NAMES)for(const tier of [1,7]){
  const result=live.create({deck:'brushfire',opponent:'blackout',npcDeckId:npc,npcDeckTier:tier,seed:6100+tier});
  const actual=physicalDeck(live.sessions.get(result.token).game.players[1]);
  assert.deepEqual(frequency(actual),frequency(NPC.recipeFor({npc,tier,catalog:CATALOG})),npc+' tier '+tier+' must feed the authored recipe to Classic');
  assert.equal(result.cpu.deckTier,tier);
 }
});

test('RPG snapshots the tier at challenge time and forwards it to Classic',()=>{
 const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
 const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8'),live=fs.readFileSync(path.join(root,'classic_live.js'),'utf8');
 assert.match(rpg,/NPC_DECKS\?\.tierForOpponent\?\.\(state,id\)/);
 assert.match(rpg,/competitiveTitle:competition\?\.title\|\|null,npcDeckTier/);assert.match(rpg,/npcTier=/);
 assert.match(live,/npcDeckId:rpgNpc,npcDeckTier:/);assert.match(live,/customOpponentDeck/);
});

test('NPC recipe construction never changes retail recipes or the player deck',()=>{
 for(const theme of ['blackout','rocket_lab','water_blast','power_reserve','fossil_lab']){
  const source=service.decklist(theme),copy=[...source];
  for(const npc of NPC.NAMES)for(let tier=1;tier<=7;tier++)NPC.recipeFor({npc,tier,original:source,catalog:CATALOG});
  assert.deepEqual(source,copy,theme+' source deck must remain unchanged');
  assert.deepEqual(service.decklist(theme),copy,theme+' service recipe must remain unchanged');
 }
});

test('NPC progression browser global matches the authoritative Node exports',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const script=fs.readFileSync(path.join(__dirname,'..','rpg_npc_deck_progression.js'),'utf8'),window={};
 vm.runInNewContext(script,{window});
 assert.equal(window.NeoRpgNpcDeckProgression.tierForOpponent({day:20,storyDone:{reina_route_1:{day:10}}},'reina'),2);
 const bootstrap=fs.readFileSync(path.join(__dirname,'..','rpg_character_bootstrap.js'),'utf8');assert.match(bootstrap,/rpg_npc_deck_progression\.js/);
});

test('deck variants remain legal and preserve the authored Pokemon and Energy package',()=>{
 for(const npc of NPC.NAMES)for(let tier=1;tier<=7;tier++){
  const original=NPC.recipeFor({npc,tier,catalog:CATALOG});
  for(const variant of [0,1,2]){
   const cards=NPC.varyDeck(original,npc,variant,CATALOG);
   assert.equal(cards.length,60);assert.equal(validateDeck(cards,CATALOG).valid,true,npc+' tier '+tier+' variant '+variant);
   assert.deepEqual(cards.filter(id=>CATALOG.get(id)?.supertype!=='Trainer').sort(),original.filter(id=>CATALOG.get(id)?.supertype!=='Trainer').sort());
  }
 }
});
