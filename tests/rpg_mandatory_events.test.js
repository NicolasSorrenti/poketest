'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../rpg_mandatory_events');
const scene=(id,kind='season',earliestDay=1,priority=50,trigger={all:[{dayGte:earliestDay}]})=>({
 id,kind,earliestDay,priority,trigger,delivery:kind==='season'?'world':'remote_or_present',characterId:kind==='bond'?'rina':undefined,timeCost:0,
 lines:[{speaker:'Narrator',text:'Town updates.'}],choices:[{label:'Understood',reply:'Onwards.',flag:id+'_ack',effects:{flags:[id+'_seen']}}]
});
const init=(day=1,slot=0)=>({day,slot,storyDone:{},storyFlags:{},flags:{},relationships:{rina:{trust:2}},results:[],tournaments:{}});
test('validation rejects unknown keys, references, speaker, reserved names and event cycles',()=>{
 const a=scene('a'),b=scene('b','bond',30,60,{all:[{eventSeen:'a'},{storyDone:'rina_route_2'},{relationship:{npc:'rina',metric:'trust',gte:2}}]});
 assert.deepEqual(M.validate([a,b],{characterIds:['rina'],storyIds:['rina_route_2']}),[]);
 assert.match(M.validate([{...a,trigger:{javascript:'oops'}}])[0],/unsupported predicate/);
 assert.ok(M.validate([a,{...b,id:'a'}]).some(x=>/Duplicate/.test(x)));
 assert.ok(M.validate([{...a,lines:[{speaker:'unknown',text:'x'}]}],{characterIds:['rina']}).some(x=>/speaker/.test(x)));
 assert.ok(M.validate([{...a,trigger:{eventSeen:'b'}},{...b,trigger:{eventSeen:'a'}}]).some(x=>/Circular/.test(x)));
 assert.ok(M.validate([a],{storyIds:['a']}).some(x=>/reserved/.test(x)));
});
test('missed calendar day is never lost, and subsequent queue remains stable',()=>{
 const events=[scene('start','season',1,60),scene('cup','season',29)];
 const s=init(32,2);
 M.queue(s,events);assert.deepEqual(s.mandatoryEventState.pending.map(x=>x.id),['start','cup']);
 M.queue(s,events);assert.equal(s.mandatoryEventState.pending.length,2);
 assert.equal(M.takeNext(s,events).id,'start');
 M.advanceDialogue(s,events);M.choose(s,events,0);M.finish(s,events);
 assert.equal(M.takeNext(s,events),null,'one scene per period');
 s.slot=0;s.day++;assert.equal(M.takeNext(s,events).id,'cup');
});
test('season outranks bond, then high priority and stable ID',()=>{
 const events=[scene('z','bond',1,99),scene('a','season',1,15),scene('b','season',1,40),scene('c','bond',1,50)];
 const s=init();
 assert.deepEqual(M.queue(s,events).map(x=>x.id),['b','a','z','c']);
});
test('active duel, quest and saved conversations prevent taking queued events',()=>{
 const e=[scene('ready')],s=init();
 s.pendingDuel={id:'match'};assert.equal(M.takeNext(s,e),null);assert.equal(s.mandatoryEventState.pending.length,1);
 delete s.pendingDuel;s.activeStory={id:'a'};assert.equal(M.takeNext(s,e),null);
 delete s.activeStory;assert.equal(M.takeNext(s,e,{safe:false}),null);
 assert.equal(M.takeNext(s,e).id,'ready');
});
test('saved response resumes and finishes once; effects and legacy story keys preserved',()=>{
 const events=[scene('a')],s=init();s.storyDone.previous={day:1};
 M.takeNext(s,events);M.advanceDialogue(s,events);M.choose(s,events,0);
 const restored=JSON.parse(JSON.stringify(s));
 assert.equal(restored.mandatoryEventState.active.phase,'response');
 assert.equal(M.finish(restored,events).event.id,'a');
 assert.equal(M.finish(restored,events),null);
 assert.equal(restored.flags.a_seen,true);
 assert.equal(restored.storyFlags.a,'a_ack');
 assert.deepEqual(restored.storyDone.previous,{day:1});
 assert.equal(M.queue(restored,events).length,0);
});
test('legacy saves, removed events and unsatisfied bond prerequisites',()=>{
 const e=[scene('a'),scene('r','bond',30,60,{all:[{storyDone:'rina_route_2'},{relationship:{npc:'rina',metric:'trust',gte:2}}]})];
 const s=init(39);s.mandatoryEventState={seen:{old:{day:1}},pending:[{id:'deleted'},{id:'a'}],active:{id:'deleted',phase:'lines'}};
 M.hydrate(s,e);assert.equal(s.mandatoryEventState.active,null);
 assert.deepEqual(M.queue(s,e).map(x=>x.id),['a']);
 s.storyDone.rina_route_2=true;
 assert.deepEqual(M.queue(s,e).map(x=>x.id),['a','r']);
 assert.equal(s.mandatoryEventState.seen.old.day,1,'preserve old archive');
});
