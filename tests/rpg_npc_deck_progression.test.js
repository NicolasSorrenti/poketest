'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const NPC=require('../rpg_npc_deck_progression');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck}=require('../core_rules');
const PARTNER=require('../rpg_partner_decks');
const service=new ClassicLocalService();

const MAIN=Object.freeze({
 hana:'power_reserve',reina:'blackout',shiori:'overgrowth',yuna:'zap',
 akari:'gym_new_voltage',camila:'rocket_lab',marina:'water_blast',kaede:'rocket_lab',
 jun:'fossil_lab',teo:'hotfoot',iris:'cold_fusion',elio:'bodyguard',
 alma:'lockdown',nereo:'cold_fusion'
});
const rank=ids=>Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(x=>x===id).length]));
test('NPC decks advance exactly on act boundaries',()=>{
 for(const [day,tier] of [[1,1],[30,1],[31,2],[60,2],[61,3],[90,3],[91,3]])
  assert.equal(NPC.tierForDay(day),tier,'Day '+day);
 assert.equal(NPC.tierForDay(undefined),1);
});
test('all primary and supporting NPCs have distinct legal Act I, II and III decks',()=>{
 for(const [npc,theme] of Object.entries(MAIN)){
  const original=service.decklist(theme);
  assert.equal(original.length,60,npc);
  const a=NPC.upgrade({npc,tier:1,original,catalog:CATALOG});
  const b=NPC.upgrade({npc,tier:2,original,catalog:CATALOG});
  const c=NPC.upgrade({npc,tier:3,original,catalog:CATALOG});
  assert.deepEqual(a,original,npc+' Act I keeps source');
  assert.notDeepEqual(b,a,npc+' Act II differs');
  assert.notDeepEqual(c,b,npc+' Act III differs');
  for(const [i,cards] of [a,b,c].entries()){
   assert.equal(cards.length,60,npc+' Act '+(i+1));
   const legality=validateDeck(cards,CATALOG);
   assert.equal(legality.valid,true,npc+' Act '+(i+1)+': '+legality.errors.join('; '));
   const counts=rank(cards);
   assert.ok(Object.keys(counts).every(id=>CATALOG.has(id)),'unknown card in '+npc);
  }
  assert.deepEqual(original,service.decklist(theme),'never mutate a shared retail or lab recipe');
 }
});
test('signature Pokémon evolve legally when reinforced and original basic lines remain available',()=>{
 for(const [npc,theme] of Object.entries(MAIN)){
  const original=service.decklist(theme);
  const progressed=NPC.upgrade({npc,tier:3,original,catalog:CATALOG});
  const target=NPC.PROFILES[npc]?.ace;
  if(!target||!original.includes(target))continue;
  const card=CATALOG.get(target);
  if(!card?.evolvesFrom||!original.some(id=>CATALOG.get(id)?.name===card.evolvesFrom))continue;
  assert.ok(progressed.filter(id=>id===target).length>=original.filter(id=>id===target).length);
 }
});
test('undocumented future NPCs receive legal deterministic archetype upgrades',()=>{
 const original=service.decklist('brushfire');
 const first=NPC.upgrade({npc:'new_guest',tier:3,original,catalog:CATALOG});
 const second=NPC.upgrade({npc:'new_guest',tier:3,original,catalog:CATALOG});
 assert.deepEqual(first,second);
 assert.equal(validateDeck(first,CATALOG).valid,true);
 assert.notDeepEqual(first,original);
});
test('Classic RPG uses upgraded CPU deck without changing default single matches or custom collaboration',()=>{
 const original=service.decklist('blackout');
 const baseline=service.create({deck:'brushfire',opponent:'blackout',seed:91});
 assert.equal(baseline.cpu.deckTier,1);
 const upgraded=service.create({deck:'brushfire',opponent:'blackout',npcDeckId:'reina',npcDeckTier:3,seed:92});
 assert.equal(upgraded.cpu.deckTier,3);
 assert.equal(upgraded.cpu.level,baseline.cpu.level,'deck progression does not change CPU skill');
 const playerEdited=service.create({deck:'brushfire',opponent:'blackout',customOpponentDeck:[...original],
  npcDeckId:'reina',npcDeckTier:3,seed:93});
 assert.equal(playerEdited.cpu.deckTier,null,'player-edited partner deck takes priority');
 assert.throws(()=>service.create({deck:'brushfire',opponent:'blackout',npcDeckTier:4}),/tier/);
 assert.throws(()=>service.create({deck:'brushfire',opponent:'blackout',npcDeckTier:3}),/identity/);
 assert.equal(PARTNER.count(original)['base1-7']>0,true);
});
test('RPG snapshots a tier at challenge time and forwards it to the existing Classic authority',()=>{
 const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
 const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
 const live=fs.readFileSync(path.join(root,'classic_live.js'),'utf8');
 assert.match(rpg,/npcDeckTier=state\.day<=30\?1:state\.day<=60\?2:3/);
 assert.match(rpg,/competitiveTitle:competition\?\.title\|\|null,npcDeckTier/);
 assert.match(rpg,/npcTier=/);
 assert.match(live,/npcDeckId:rpgNpc,npcDeckTier:/);
 assert.match(live,/customOpponentDeck/);
});

test('RPG opponent progression never alters the authoritative player starting deck',()=>{
 const source=service.decklist('blackout');
 const recipe=NPC.upgrade({npc:'reina',tier:3,original:source,catalog:CATALOG});
 assert.equal(recipe.length,60);
 assert.deepEqual(service.decklist('blackout'),source,'shared preset must not be modified by RPG progression');
 assert.equal(recipe.filter(id=>id==='base1-7').length,3,'Reina gains additional Hitmonchan copies');
 assert.equal(recipe.filter(id=>id==='base1-71').length,1,'Reina gains Computer Search');
 assert.ok(recipe.includes('base1-74'),'Reina gains Item Finder');
});
