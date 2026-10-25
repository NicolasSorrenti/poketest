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
