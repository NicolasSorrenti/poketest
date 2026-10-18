'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const SOL=require('../rpg_sol_character');
const PACK=require('../rpg_narrative_pack');
const STORY=require('../rpg_story');
const SCHEDULES=require('../rpg_schedules');
const EPILOGUE=require('../rpg_epilogue');
const {DECKS,deckOptions}=require('../classic_local_service');

const route=SOL.events.filter(e=>e.id.startsWith('sol_route_'));
const sample=(e)=>STORY.normalize({day:e.start,slot:e.slot,location:e.place,
 storyDone:{},storyMissed:{},storyFlags:{},relationships:{},routeOutcomes:{},partner:null});
test('Sol has an unmistakably adult SFW style bible, a real deck and a weekly timetable',()=>{
 assert.deepEqual(SOL.validate(),[]);
 assert.deepEqual(PACK.validate(),[]);
 assert.deepEqual(STORY.validate(),[]);
 assert.deepEqual(SCHEDULES.validate(),[]);
 assert.equal(SOL.cast.sol.age,26);
 assert.equal(SOL.cast.sol.deck,'hot_water');
 assert.ok(DECKS[SOL.cast.sol.deck]);
 assert.ok(deckOptions().some(d=>d.id===SOL.cast.sol.deck));
 assert.ok(SOL.cast.sol.talk.length>=5);
 assert.ok(SOL.cast.sol.hangouts.length>=4);
 assert.ok(SOL.looks.sol.palette&&SOL.looks.sol.hair&&SOL.looks.sol.outfits.length>=3);
 assert.equal(SCHEDULES.locationFor('sol',7,1),null);
 assert.ok(SCHEDULES.itinerary('sol',8).includes('park'));
 assert.equal(EPILOGUE.displayName('sol'),'Sol Varela');
});
test('Sol has five romance-or-friendship chapters plus two local crossovers, all accessible',()=>{
 assert.equal(route.length,5);
 assert.equal(SOL.events.length,7);
 assert.equal(STORY.events.length,56);
 assert.equal(new Set(SOL.events.map(e=>e.id)).size,7);
 for(const e of SOL.events){
  const s=sample(e);s.relationships.sol.affection=12;s.relationships.sol.trust=12;
  if(e.prerequisite)s.storyDone[e.prerequisite]={day:e.start-1,choice:0};
  assert.ok(STORY.available(s).some(x=>x.id===e.id),e.id+' unreachable');
  assert.equal(SCHEDULES.locationFor('sol',e.start,e.slot,[e]),e.place);
  for(const guest of e.participants||[])assert.equal(SCHEDULES.locationFor(guest,e.start,e.slot,[e]),e.place,e.id+' guest missing');
  assert.ok(e.lines.some(l=>l.speaker==='Protagonist'));
  assert.ok(e.lines.length>=6);
  assert.ok(e.choices.every(c=>c.label&&c.reply&&c.delta));
 }
});
test('every route choice is meaningful and produces different later dialogue',()=>{
 for(let i=1;i<route.length;i++){
  const previous=route[i-1],now=route[i];
  assert.equal(now.prerequisite,previous.id);
  const texts=[];
  for(const choice of previous.choices){
   const s=sample(now);
   s.storyDone[previous.id]={day:previous.start,choice:0};
   s.storyFlags[previous.id]=choice.flag;
   texts.push(STORY.linesFor(s,now.id)[0].text);
  }
  assert.equal(new Set(texts).size,previous.choices.length,now.id+' ignores a previous decision');
 }
});
test('Sol can develop trust without forcing romance and can commit in the finale',()=>{
 const finale=route[4],state=sample(finale);
 state.relationships.sol.affection=12;state.relationships.sol.trust=8;
 state.storyDone[finale.prerequisite]={choice:0,day:route[3].start};
 assert.equal(STORY.resolve(state,finale.id,0).partner,'sol');
 assert.equal(state.routeOutcomes.sol,'romance');
 assert.equal(EPILOGUE.report(state).partner,'Sol Varela');
 assert.throws(()=>STORY.resolve(state,finale.id,0));
 const friend=sample(finale);friend.relationships.sol.affection=10;friend.relationships.sol.trust=5;friend.partner='hana';
 friend.storyDone[finale.prerequisite]={choice:0,day:route[3].start};
 assert.throws(()=>STORY.resolve(friend,finale.id,0),/committed/);
 assert.equal(STORY.resolve(friend,finale.id,1).partner,'hana');
 assert.equal(friend.routeOutcomes.sol,'friendship');
});
test('a choice and story result survive a JSON save/load without awarding twice',()=>{
 const first=route[0],s=sample(first);
 const result=STORY.resolve(s,first.id,1);
 assert.equal(result.choice.flag,'sol_ask');
 const restored=STORY.normalize(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.storyFlags[first.id],'sol_ask');
 assert.equal(restored.relationships.sol.affection,1);
 assert.throws(()=>STORY.resolve(restored,first.id,1));
 const e=route[1];restored.day=e.start;restored.slot=e.slot;restored.location=e.place;
 restored.relationships.sol.affection=2;
 assert.ok(STORY.available(restored).some(x=>x.id===e.id));
 assert.notEqual(STORY.linesFor(restored,e.id)[0].text,e.lines[0].text);
});
test('HTML, server, and runtime load Sol data before the narrative and show her special hangouts',()=>{
 const html=fs.readFileSync('rpg.html','utf8');
 const server=fs.readFileSync('server.js','utf8');
 const runtime=fs.readFileSync('rpg.js','utf8');
 assert.ok(html.indexOf('/rpg_sol_character.js')>=0);
 assert.ok(html.indexOf('/rpg_sol_character.js')<html.indexOf('/rpg_narrative_pack.js'));
 assert.match(server,/pathname==='\/rpg_sol_character\.js'/);
 assert.match(runtime,/c\.hangouts/);
 assert.equal(PACK.cast.sol.name,'Sol Varela');
});
