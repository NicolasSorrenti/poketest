'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {NPC_PROFILES,profileForNpc}=require('../cpu_profiles');
const {configuration,SKILLS}=require('../cpu_policy');
const {PROFILES:deckProfiles}=require('../rpg_npc_deck_progression');
const PACK=require('../rpg_character_packs.generated');
const SIDE=require('../rpg_side_quests');
const {ClassicLocalService}=require('../classic_local_service');
const {forRpgDuel,upgradeRpgSession,RPG_CPU_LEVEL}=require('../rpg_cpu_config');

test('every named RPG opponent has a legal character-specific CPU profile',()=>{
 const core=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
 const ids=new Set([...core,...Object.keys(PACK.cast),...Object.keys(SIDE.cast),...Object.keys(deckProfiles)]);
 for(const id of ids){
  assert.ok(Object.hasOwn(NPC_PROFILES,id),'Missing CPU personality: '+id);
  const p=profileForNpc(id);
  assert.ok(['aggressive','balanced','defensive','tactical','setup','risk_taking'].includes(p.personality),id);
  assert.ok(typeof NPC_PROFILES[id].reason==='string'&&NPC_PROFILES[id].reason.trim().length>0,id+' lacks a personality rationale');
  assert.equal(configuration({level:RPG_CPU_LEVEL,personality:p.personality}).skill,SKILLS[RPG_CPU_LEVEL]);
 }
 assert.ok(ids.size>=20,'Expected the full campaign and guest cast');
});

test('new guest profiles keep their style while RPG difficulty is forced to Champion',()=>{
 const service=new ClassicLocalService();
 for(const [id,personality] of [['barb','tactical'],['daisy','setup'],['elena','tactical'],['jinx','aggressive'],['laca','risk_taking'],['luna','defensive'],['rina','setup'],['sierra','tactical'],['sol','risk_taking']]){
  const duel=service.create(forRpgDuel({deck:'blackout',opponent:'brushfire',npcDeckId:id,seed:178}));
  assert.equal(duel.cpu.level,RPG_CPU_LEVEL,id);
  assert.equal(duel.cpu.personality,personality,id);
  assert.equal(duel.cpu.advancedTactics,true,id);
 }
});

test('restored RPG duels upgrade their NPC personality without reducing skill',()=>{
 const old=configuration({level:RPG_CPU_LEVEL,personality:'balanced',
  prizeRace:true,knockoutTempo:true,opponentResponse:true});
 const restored={npc:'barb',cpuConfig:old};
 upgradeRpgSession(restored);
 assert.equal(restored.cpuConfig.level,RPG_CPU_LEVEL);
 assert.equal(restored.cpuConfig.personality,'tactical');
 assert.equal(restored.cpuConfig.knockoutTempo,true);
 assert.equal(restored.cpuConfig.prizeRace,true);
 assert.equal(restored.cpuConfig.opponentResponse,true);
 assert.equal(upgradeRpgSession(restored),restored,'Repeated upgrades are idempotent');
 const unknown={npc:'not_in_cast',cpuConfig:old};
 upgradeRpgSession(unknown);
 assert.equal(unknown.cpuConfig,old,'Unknown opponents retain their valid current configuration');
});
