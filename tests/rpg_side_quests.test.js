'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const SIDE=require('../rpg_side_quests');
const STORY=require('../rpg_story');
const SCHEDULES=require('../rpg_schedules');
const BRIDGE=require('../rpg_duel_bridge');
const {DECKS,deckOptions}=require('../classic_local_service');
const sample=(stage,extra={})=>{
 const s={day:stage.start,slot:stage.slot,location:stage.place,credits:80,focus:75,insight:0,reputation:0,preparation:0,
 sideQuests:{},activeSideQuest:null,storyDone:{},storyMissed:{},relationships:{},bonds:{},results:[],points:0,eventsDone:{},...extra};
 STORY.normalize(s);SIDE.hydrate(s);return s;
};
const present=s=>SCHEDULES.peopleAt(s.day,s.slot,s.location,[...SIDE.appointments(s)]);

test('supporting quests use description instead of forcing NPCs to narrate their actions',()=>{
 for(const quest of SIDE.quests){
  const first=quest.stages[0];
  assert.equal(first.lines.length,6,quest.id+' keeps its choice timing');
  assert.equal(first.lines[0].speaker,'Narrator',quest.id+' establishes the setting');
  assert.ok(first.lines.some(x=>x.speaker===first.npc),quest.id+' still has a speaking NPC');
  assert.ok(first.lines.every(x=>typeof x.text==='string'&&x.text.length>5));
 }
});
test('three non-romance townspeople have visual direction, valid schedules and legal Classic deck presets',()=>{
 assert.deepEqual(SIDE.validate(),[]);
 assert.deepEqual(SCHEDULES.validate(),[]);
 const options=new Set(deckOptions().map(x=>x.id));
 assert.equal(SIDE.quests.length,3);
 assert.deepEqual(SIDE.quests.map(q=>q.stages.length),[3,3,3]);
 for(const [id,c] of Object.entries(SIDE.cast)){
  assert.ok(c.age>=18);
  assert.ok(DECKS[c.deck]&&options.has(c.deck),'Invalid deck: '+id);
  assert.ok(SIDE.looks[id].silhouette&&SIDE.looks[id].hair&&SIDE.looks[id].palette);
  assert.equal(SCHEDULES.locationFor(id,SIDE.arrivals[id]-1,1),null);
  assert.ok(SCHEDULES.itinerary(id,SIDE.arrivals[id]).some(x=>x!=='home'));
 }
});
test('all nine side-quest encounters are reachable only in their own location, period and chapter',()=>{
 for(const quest of SIDE.quests)for(let i=0;i<quest.stages.length;i++){
  const stage=quest.stages[i],progress=i?{status:'active',step:i,history:Array.from({length:i},(_,j)=>({step:j,day:quest.stages[j].start,flag:'earlier'}))}:null;
  const s=sample(stage,{sideQuests:progress?{[quest.id]:progress}:{}});
  assert.equal(SCHEDULES.locationFor(stage.npc,stage.start,stage.slot,[...SIDE.appointments(s)]),stage.place);
  assert.ok(present(s).includes(stage.npc));
  assert.ok(SIDE.available(s,present(s)).some(x=>x.quest.id===quest.id),quest.id+' chapter '+i);
  s.slot=(stage.slot+1)%3;
  assert.ok(!SIDE.available(s,present(s)).some(x=>x.quest.id===quest.id));
  s.slot=stage.slot;s.location='home';
  assert.ok(!SIDE.available(s,present(s)).some(x=>x.quest.id===quest.id));
 }
});
test('starting a quest, reloading, choosing, and completing a chapter pays rewards exactly once',()=>{
 const q=SIDE.quests[0],s=sample(q.stages[0]);
 assert.equal(s.relationships.elio.trust,0,'Minor cast receives zero-value bond records');
 assert.ok(SIDE.begin(s,q.id,present(s)));
 assert.equal(s.sideQuests[q.id].step,0);
 assert.equal(s.activeSideQuest.phase,'lines');
 assert.equal(SIDE.begin.bind(null,s,q.id,present(s)) instanceof Function,true);
 assert.throws(()=>SIDE.begin(s,q.id,present(s)));
 const saved=JSON.parse(JSON.stringify(s));SIDE.hydrate(saved);
 assert.equal(saved.activeSideQuest.id,q.id);
 saved.activeSideQuest.phase='response';saved.activeSideQuest.choice=0;
 const before=saved.credits,delta=q.stages[0].choices[0].delta;
 const receipt=SIDE.finishChoice(saved,q.id,0,present(saved));
 assert.equal(receipt.done,false);
 assert.equal(saved.credits,before+delta.credits);
 assert.equal(saved.sideQuests[q.id].step,1);
 assert.equal(saved.relationships.elio.trust,1);
 assert.equal(saved.activeSideQuest,null);
 assert.throws(()=>SIDE.finishChoice(saved,q.id,0,present(saved)));
 assert.equal(saved.credits,before+delta.credits);
});
test('earlier choices produce distinct opening dialogue in later chapters',()=>{
 for(const q of SIDE.quests){
  const x=q.stages[1],s=sample(x,{sideQuests:{[q.id]:{status:'active',step:1,history:[{step:0,flag:q.stages[0].choices[0].flag}]}}});
  const a=SIDE.linesFor(s,q.id)[1].text;
  s.sideQuests[q.id].history[0].flag=q.stages[0].choices[1].flag;
  const b=SIDE.linesFor(s,q.id)[1].text;
  assert.notEqual(a,b,q.id+' has no callback for earlier choice');
  assert.equal(SIDE.linesFor(s,q.id)[0].text,x.lines[0].text,'Essential opening context must remain intact');
  const resumed=JSON.parse(JSON.stringify(s));resumed.activeSideQuest={id:q.id,phase:'lines',index:x.lines.length,choice:null};
  SIDE.hydrate(resumed);assert.ok(resumed.activeSideQuest,'Inserted callback must not break a saved scene near its final line');
 }
});
test('a complete conversation-only quest survives save/load, without accidental repeat rewards',()=>{
 const q=SIDE.byId('quiet_table'),s=sample(q.stages[0]);let gain=0;
 for(let i=0;i<3;i++){
  const e=q.stages[i];s.day=e.start;s.slot=e.slot;s.location=e.place;
  SIDE.begin(s,q.id,present(s));
  s.activeSideQuest.phase='response';s.activeSideQuest.choice=1;
  const before=s.credits;
  const x=SIDE.finishChoice(s,q.id,1,present(s));
  gain+=s.credits-before;
  assert.equal(x.done,i===2);
 }
 assert.equal(s.sideQuests[q.id].status,'complete');
 assert.equal(s.sideQuests[q.id].history.length,3);
 const loaded=sample(q.stages[2],JSON.parse(JSON.stringify(s)));
 assert.equal(SIDE.journal(loaded).find(x=>x.id===q.id).status,'complete');
 assert.equal(loaded.credits,80+gain);
 assert.ok(!SIDE.available(loaded,present(loaded)).some(x=>x.quest.id===q.id));
});
test('the final quest duel has three actual match outcomes; no reward can be duplicated',()=>{
 for(const winner of [0,1,null]){
  const q=SIDE.byId('borrowed_deck'),e=q.stages[2],s=sample(e,{
   sideQuests:{[q.id]:{status:'active',step:2,history:[{step:0,flag:'elio_own_list'},{step:1,flag:'elio_budget'}]}},
   activeSideQuest:{id:q.id,phase:'duel',index:5,choice:null}
  });
  assert.ok(SIDE.canDuel(s,q.id,present(s)));
  const pending={id:'side-actual-'+String(winner),npc:'elio',day:s.day,sideQuestId:q.id,sideQuestStage:2};
  s.pendingDuel=pending;
  const receipt=BRIDGE.settle(s,pending,winner,SIDE.cast.elio.name);
  assert.ok(receipt,'Existing duel bridge must deliver a real match result');
  const before=s.credits,bonus=SIDE.settleDuel(s,pending,receipt);
  assert.equal(s.sideQuests[q.id].status,'complete');
  assert.equal(s.sideQuests[q.id].history.length,3);
  assert.equal(bonus.credits,e.reward[winner===0?'win':winner===1?'loss':'draw'].credits);
  assert.equal(s.credits,before+bonus.credits);
  assert.equal(SIDE.settleDuel(s,pending,receipt),null,'second award');
  assert.equal(s.credits,before+bonus.credits);
 }
});
test('missed stages expire only once, never claim rewards and clear unfinished dialogue',()=>{
 const q=SIDE.byId('river_route'),e=q.stages[0],s=sample(e);
 SIDE.begin(s,q.id,present(s));
 const before=s.credits;
 s.day=e.end+1;
 assert.ok(SIDE.expire(s).includes(q.id));
 assert.equal(s.activeSideQuest,null);
 assert.equal(s.sideQuests[q.id].status,'missed');
 assert.deepEqual(SIDE.expire(s),[]);
 assert.equal(s.credits,before);
 assert.ok(!SIDE.available(s,[]).some(x=>x.quest.id===q.id));
});
test('the browser uses the side quest script, saves and action paths',()=>{
 const html=fs.readFileSync('rpg.html','utf8'),app=fs.readFileSync('rpg.js','utf8'),server=fs.readFileSync('server.js','utf8');
 assert.ok(html.indexOf('rpg_side_quests.js')<html.indexOf('rpg_schedules.js'));
 for(const id of ['sideQuestEvents','sideQuestJournal'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(app,/SIDE\.hydrate\(state\)/);
 assert.match(app,/SIDE\.finishChoice\(state/);
 assert.match(app,/SIDE\.settleDuel\(state/);
 assert.match(app,/sideQuestId:sideQuest\?\.id/);
 assert.match(server,/pathname==='\/rpg_side_quests\.js'/);
});
