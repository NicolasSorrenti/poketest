'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {simulate,MODES}=require('../rpg_campaign_simulator');
test('each headless strategy traverses every period and delivers all mandatory season beats',()=>{
 for(const mode of MODES){
  const result=simulate(mode);
  assert.equal(result.periods,270,mode);
  assert.deepEqual([result.day,result.slot],[91,0],mode);
  assert.deepEqual(result.issues,[],mode+': '+result.issues.join('; '));
  assert.equal(result.seasonMilestones,result.requiredSeasonMilestones,mode);
  assert.ok(result.clubs>=0);
 }
},{timeout:60000});
test('campaign strategies exercise different gameplay paths without real battle receipts',()=>{
 const idle=simulate('idle'),social=simulate('social'),competitive=simulate('competitive');
 assert.equal(idle.counts.syntheticDuel,0);
 assert.equal(idle.completedStories,0);
 assert.ok(social.counts.story+social.counts.social>0);
 assert.ok(competitive.counts.syntheticDuel>0);
 assert.equal(competitive.syntheticDuels,true,'do not confuse the simulator with Classic TCG execution');
 assert.equal(social.appointmentsMissed,0,'the social policy must prioritize its booked plans');
},{timeout:60000});
test('repeating a campaign strategy gives identical reports and milestones',()=>{
 assert.deepEqual(simulate('balanced'),simulate('balanced'));
},{timeout:60000});
test('invalid strategy is rejected',()=>assert.throws(()=>simulate('cheat'),/Unknown campaign strategy/));

test('complete-season competitive policies settle real campaign standings only once',()=>{
 for(const mode of ['competitive','balanced']){
  const report=simulate(mode);
  assert.deepEqual(report.issues,[],mode);
  assert.equal(report.matchmakingVersion,2,'new campaigns use the expanded roster');
  assert.ok(report.competitiveSettled>=30,'should exercise dozens of circuit duels');
  assert.equal(report.competitiveMatches.length,report.competitiveSettled);
  assert.equal(new Set(report.competitiveMatches.map(m=>m.id)).size,report.competitiveSettled);
  assert.ok(report.competitiveMatches.every(m=>m.version===2&&m.day>=2&&m.day<=90));
  assert.ok(report.competitiveMatches.some(m=>m.kind==='daily'));
  assert.ok(report.competitiveMatches.some(m=>m.kind==='local'));
 }
},{timeout:60000});

test('every Saturday has distinct daily and local challengers throughout the expanded season',()=>{
 const C=require('../rpg_competitive_loop');
 for(let day=6;day<=90;day+=7){
  const daily=C.opponent(day,'daily',0,2);
  const semifinal=C.opponent(day,'local',0,2);
  const final=C.opponent(day,'local',1,2);
  assert.equal(new Set([daily,semifinal,final]).size,3,'duplicate day '+day);
 }
 const acts=[new Set(),new Set(),new Set()];
 for(let day=2;day<=90;day++){
  const act=C.tier(day),opponent=C.opponent(day,'daily',0,2);
  acts[act].add(opponent);
  if(day>2&&C.tier(day)===C.tier(day-1))
   assert.notEqual(opponent,C.opponent(day-1,'daily',0,2),'repeat day '+day);
 }
 assert.ok(acts[0].size>=6);
 assert.ok(acts[1].size>=7);
 assert.ok(acts[2].size>=7);
});

test('legacy competitive saves remain on the original roster after reload',()=>{
 const C=require('../rpg_competitive_loop');
 const restored=JSON.parse(JSON.stringify({day:48,slot:0,location:'center',credits:80,points:0,
  competitive:{daily:{},locals:{},processed:{}}}));
 const before=C.opponent(48,'daily',0,1);
 const challenge=C.begin(restored,'daily-48');
 assert.equal(restored.competitive.matchmakingVersion,1);
 assert.equal(challenge.npc,before);
 const receipt={duelId:'legacy-day48',outcome:'Victory'};
 const match={id:receipt.duelId,npc:challenge.npc,day:48,
  competitiveId:challenge.id,competitiveKind:'daily',competitiveRound:0};
 assert.equal(C.settle(restored,match,receipt).won,true);
 const after=JSON.parse(JSON.stringify(restored));
 assert.equal(after.competitive.matchmakingVersion,1);
 assert.equal(C.settle(after,match,receipt),null);
 assert.equal(after.points,4);
});
