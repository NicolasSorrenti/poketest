'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const SOCIAL=require('../rpg_social_activities');
const Cast={hana:{name:'Hana'},reina:{name:'Reina'},shiori:{name:'Shiori'},yuna:{name:'Yuna'},
 akari:{name:'Akari'},camila:{name:'Camila'},marina:{name:'Marina'},kaede:{name:'Kaede'},
 sol:{name:'Sol',socialProfile:{favorites:['adventure','playful'],neutral:['creative'],
 voice:['Sol cheers the whole way.','Sol grins and takes it in stride.','Sol looks surprised, but stays to have fun.']}}};
const state=(extras={})=>({day:5,slot:1,location:'shop',focus:75,credits:80,insight:0,
 relationships:{},bonds:{},hungOut:{},...extras});
test('18 reusable activities span six real public venues with exact, distinct IDs',()=>{
 assert.deepEqual(SOCIAL.validate(),[]);
 assert.equal(SOCIAL.activities.length,18);
 assert.deepEqual(new Set(SOCIAL.activities.map(a=>a.place)),new Set(['shop','arcade','park','cafe','center','library']));
 assert.equal(new Set(SOCIAL.activities.map(a=>a.id)).size,18);
});
test('all eight canonical adult heroines have at least two distinct favorites and neutral interests',()=>{
 for(const id of ['hana','reina','shiori','yuna','akari','camila','marina','kaede']){
  const p=SOCIAL.profile(id,Cast);
  assert.ok(p.favorites.length>=2&&p.neutral.length>=2);assert.equal(p.voice.length,3);
 }
});
test('the same venue offers different preferred activities for different personalities',()=>{
 const s=state();
 const hana=SOCIAL.options(s,'hana',['hana'],Cast),reina=SOCIAL.options(s,'reina',['reina'],Cast);
 assert.equal(hana.length,3);assert.equal(reina.length,3);
 assert.equal(hana.find(x=>x.id==='shop_welcome').affinity,'favorite');
 assert.equal(reina.find(x=>x.id==='shop_welcome').affinity,'unfamiliar');
 assert.equal(reina.find(x=>x.id==='shop_deck_lab').affinity,'favorite');
});
test('friendly favorite outing grants affection and trust but never romance or direct TCG bonuses',()=>{
 const s=state();const got=SOCIAL.complete(s,'hana','shop_welcome',['hana'],Cast);
 assert.equal(got.affection,2);assert.equal(got.trust,1);assert.equal(got.respect,0);
 assert.equal(s.focus,67);assert.equal(s.credits,80);assert.equal(s.bonds.hana.affection,2);
 assert.equal(s.relationships.hana.trust,1);assert.equal(s.relationships.hana.attraction,0);
 assert.equal(s.partner,undefined);assert.equal(s.points,undefined);assert.equal(s.preparation,undefined);
 assert.equal(s.hungOut['5:hana'],true);assert.equal(s.socialHistory.hana.lastActivity,'shop_welcome');
});
test('competitive shared activity builds respect without fabricating duel results',()=>{
 const s=state();const got=SOCIAL.complete(s,'reina','shop_deck_lab',['reina'],Cast);
 assert.equal(got.respect,2);assert.equal(got.insight,1);assert.equal(got.affection,2);
 assert.equal(s.relationships.reina.respect,2);assert.equal(s.insight,1);
 assert.equal(s.results,undefined);assert.equal(s.pendingDuel,undefined);
});
test('unfamiliar activity remains viable without punishing a friendship route',()=>{
 const s=state();const got=SOCIAL.complete(s,'reina','shop_welcome',['reina'],Cast);
 assert.equal(got.affinity,'unfamiliar');assert.equal(got.affection,1);assert.equal(got.trust,0);
 assert.ok(got.line.includes('Reina'));assert.equal(s.relationships.reina.affection,1);
});
test('a second activity with same NPC on the same day is rejected before spending resources',()=>{
 const s=state();SOCIAL.complete(s,'hana','shop_welcome',['hana'],Cast);
 const before=JSON.stringify(s);
 assert.throws(()=>SOCIAL.complete(s,'hana','shop_custom',['hana'],Cast),/Already spent/);
 assert.equal(JSON.stringify(s),before);
});
test('generic existing hangout shares the same once-per-day gate',()=>{
 const s=state({hungOut:{'5:hana':true}});const before=JSON.stringify(s);
 assert.ok(SOCIAL.options(s,'hana',['hana'],Cast).every(a=>a.disabledReason==='Already spent time together today'));
 assert.throws(()=>SOCIAL.complete(s,'hana','shop_welcome',['hana'],Cast),/Already spent/);
 assert.equal(JSON.stringify(s),before);
});
test('costs and resources are validated atomically before mutation',()=>{
 for(const [extra,activity,error] of [
  [{focus:0},'shop_deck_lab',/Not enough focus/],
  [{credits:0},'shop_custom',/Not enough credits/]
 ]){
  const s=state(extra),before=JSON.stringify(s);
  assert.throws(()=>SOCIAL.complete(s,'hana',activity,['hana'],Cast),error);
  assert.equal(JSON.stringify(s),before);
 }
});
test('only present, known NPCs can use activities at the actual location',()=>{
 const s=state();
 assert.deepEqual(SOCIAL.options(s,'hana',[],Cast),[]);
 assert.throws(()=>SOCIAL.complete(s,'hana','shop_welcome',[],Cast),/not available/);
 assert.throws(()=>SOCIAL.complete(s,'hana','park_riverside',['hana'],Cast),/not available/);
 assert.throws(()=>SOCIAL.complete(s,'nonexistent','shop_welcome',['nonexistent'],Cast),/Unknown/);
 s.pendingDuel={id:'test'};
 assert.throws(()=>SOCIAL.complete(s,'hana','shop_welcome',['hana'],Cast),/Finish your current scene/);
});
test('repeating the same favorite tag soon has softer returns and no bonus insight',()=>{
 const s=state();const first=SOCIAL.complete(s,'reina','shop_deck_lab',['reina'],Cast);
 assert.equal(first.respect,2);assert.equal(first.insight,1);
 s.day=6;s.location='library';s.slot=0;
 const second=SOCIAL.complete(s,'reina','library_research',['reina'],Cast);
 assert.equal(second.repeated,true);assert.equal(second.affection,1);
 assert.equal(second.trust,0);assert.equal(second.respect,1);assert.equal(second.insight,0);
 assert.equal(s.socialHistory.reina.count,2);
});
test('changing favorite tags avoids the diminishing reward and is deterministic',()=>{
 const s=state({location:'arcade'});const first=SOCIAL.complete(s,'yuna','arcade_coop',['yuna'],Cast);
 assert.equal(first.affection,2);
 s.day=6;
 const second=SOCIAL.complete(s,'yuna','arcade_music',['yuna'],Cast);
 assert.equal(second.repeated,false);assert.equal(second.affection,2);
 assert.equal(s.socialHistory.yuna.lastTag,'creative');
});
test('metadata is extensible for independently authored new characters and keeps safe fallback',()=>{
 const s=state({location:'park'});
 const x=SOCIAL.complete(s,'sol','park_explore',['sol'],Cast);
 assert.equal(x.affinity,'favorite');assert.match(x.line,/Sol cheers/);
 const other={jun:{name:'Jun'}};
 const p=SOCIAL.profile('jun',other);assert.deepEqual(p.favorites,[]);
 assert.equal(SOCIAL.options(state(),'jun',['jun'],other).length,3);
});
test('JSON roundtrip preserves social history and legacy malformed history repairs safely',()=>{
 const s=state();SOCIAL.complete(s,'hana','shop_welcome',['hana'],Cast);
 const restored=JSON.parse(JSON.stringify(s));SOCIAL.hydrate(restored);
 assert.equal(restored.socialHistory.hana.count,1);
 restored.socialHistory.unknown={lastDay:5,lastTag:'hacked',count:1};
 SOCIAL.hydrate(restored);assert.equal(restored.socialHistory.unknown,undefined);
 assert.equal(restored.relationships.hana.affection,2);
});
test('outings are disabled beyond day 90 or while another VN scene is active',()=>{
 const s=state({day:91});assert.deepEqual(SOCIAL.options(s,'hana',['hana'],Cast),[]);
 s.day=5;s.activeStory={id:'test'};
 assert.ok(SOCIAL.options(s,'hana',['hana'],Cast).every(a=>a.disabledReason==='Finish your current scene first'));
});
