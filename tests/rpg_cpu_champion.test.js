'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ClassicLocalService}=require('../classic_local_service');
const {NPC_PROFILES}=require('../cpu_profiles');
const {configuration,SKILLS}=require('../cpu_policy');
const {RPG_CPU_LEVEL,forRpgDuel,upgradeRpgSession}=require('../rpg_cpu_config');

test('RPG uses the highest supported CPU tier for named and guest opponents',()=>{
 assert.equal(RPG_CPU_LEVEL,Math.max(...Object.keys(SKILLS).map(Number)),'campaign AI uses the strongest configured skill');
 const service=new ClassicLocalService();
 for(const [npc,profile] of Object.entries(NPC_PROFILES)){
  const params=forRpgDuel({deck:'brushfire',opponent:'blackout',npcDeckId:npc,seed:110,
   difficulty:1,advancedTactics:false});
  const duel=service.create(params);
  const saved=service.session(duel.token);
  assert.equal(duel.cpu.level,RPG_CPU_LEVEL,npc+' should always use the strongest skill');
  assert.equal(duel.cpu.personality,profile.personality,npc+' keeps a distinctive style');
  assert.equal(duel.cpu.advancedTactics,true,npc+' uses advanced tactics');
  for(const key of ['prizeRace','knockoutTempo','opponentResponse','evolutionTempo','energyHorizon'])
   assert.equal(saved.cpuConfig[key],true,npc+' '+key);
 }
 const guest=service.create(forRpgDuel({deck:'brushfire',opponent:'blackout',
  npcDeckId:'guest_cpu',seed:111}));
 assert.equal(guest.cpu.level,RPG_CPU_LEVEL,'unprofiled story opponents must not drop to level 3');
 assert.equal(guest.cpu.personality,'balanced');
});

test('Campaign CPU promotion never changes the shared Single Match defaults',()=>{
 const service=new ClassicLocalService();
 const solo=service.create({deck:'brushfire',opponent:'blackout',seed:112});
 assert.equal(solo.cpu.level,3);
 assert.equal(solo.cpu.advancedTactics,false);
 const expert=service.create({deck:'brushfire',opponent:'blackout',seed:113,difficulty:4});
 assert.equal(expert.cpu.level,4);
});

test('Older local and cloud checkpoints are promoted without changing duel state',()=>{
 const original=configuration({level:2,personality:'risk_taking',seed:49,side:1});
 const game={players:[{},{ }],turnSerial:10};
 const session={cpuConfig:original,revision:7,game,token:'unchanged'};
 assert.equal(upgradeRpgSession(session),session);
 assert.equal(session.cpuConfig.level,RPG_CPU_LEVEL);
 assert.equal(session.cpuConfig.skill,SKILLS[RPG_CPU_LEVEL]);
 assert.equal(session.cpuConfig.personality,'risk_taking');
 assert.equal(session.cpuConfig.seed,49);
 for(const flag of ['prizeRace','knockoutTempo','opponentResponse','evolutionTempo','energyHorizon'])
  assert.equal(session.cpuConfig[flag],true);
 assert.equal(session.game,game);
 assert.equal(session.revision,7);
 assert.equal(session.token,'unchanged');
 const oldChampion=configuration({level:5,personality:'tactical',seed:431,side:1,
  evolutionTempo:false,energyHorizon:false});
 const oldSession={cpuConfig:oldChampion,revision:3,game};
 upgradeRpgSession(oldSession);
 assert.equal(oldSession.cpuConfig.level,RPG_CPU_LEVEL,'cloud save from Champion is promoted');
 assert.equal(oldSession.cpuConfig.evolutionTempo,true,'old explicit false must not disable new RPG tactics');
 assert.equal(oldSession.cpuConfig.energyHorizon,true,'old explicit false must not disable new RPG tactics');
 assert.equal(oldSession.cpuConfig.personality,'tactical');
 assert.equal(oldSession.cpuConfig.seed,431);
 assert.equal(oldSession.game,game);
 const savedNpc={npc:'reina',cpuConfig:configuration({level:5,personality:'balanced',seed:91}),game,revision:2};
 upgradeRpgSession(savedNpc);
 assert.equal(savedNpc.cpuConfig.level,RPG_CPU_LEVEL);
 assert.equal(savedNpc.cpuConfig.personality,NPC_PROFILES.reina.personality,
  'a restored named character retains the canonical personality from the current roster');
 assert.equal(savedNpc.game,game);
 assert.equal(savedNpc.revision,2);
 const updated=session.cpuConfig;
 upgradeRpgSession(session);
 assert.equal(session.cpuConfig,updated,'already upgraded checkpoints are left intact');
});
