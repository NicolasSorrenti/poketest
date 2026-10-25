'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Memory=require('../rpg_dialogue_memory');
const Everyday=require('../rpg_everyday_chats');

test('continuity arcs cover all 22 existing casual Talk characters with complete authored branches',()=>{
 assert.deepEqual(Object.keys(Memory.threads).sort(),Object.keys(Everyday.topics).sort());
 assert.deepEqual(Memory.validate(),[]);
 for(const [npc,t] of Object.entries(Memory.threads)){
  assert.ok(t.intro.every(x=>typeof x==='string'&&x.trim()),npc);
  assert.equal(new Set(Object.values(t.choices).map(c=>c.label)).size,2,npc);
  assert.notEqual(t.choices.a.followup[0],t.choices.b.followup[0],npc+' decisions must be reflected differently');
 }
});

test('old saves gain an empty optional memory without inventing anything previously said',()=>{
 const s={day:15,relationships:{hana:{affection:4}},storyDone:{reina_route_1:{day:8,choice:0}}};
 const before=JSON.stringify(s.relationships);
 assert.equal(Memory.offer({...s,dialogueMemory:null,day:1},'hana'),null);
 assert.deepEqual(Memory.hydrate(s),{entries:{},casualSeen:{},asidesSeen:{}});
 assert.equal(JSON.stringify(s.relationships),before);
 assert.equal(Object.keys(s.dialogueMemory.entries).length,0);
 assert.equal(Memory.offer(s,'unknown'),null);
});

test('every NPC remembers the exact answer, keeps the follow-up on reload, and cannot farm rewards',()=>{
 for(const [npc,thread] of Object.entries(Memory.threads)){
  const offerDay=Array.from({length:83},(_,i)=>i+4).find(day=>Memory.offer({day},npc)?.kind==='intro');
  assert.ok(offerDay,npc+' should offer a topic during the campaign');
  for(const branch of ['a','b']){
   const s={day:offerDay,slot:1,credits:80,points:3,relationships:{[npc]:{affection:2,trust:1}},dialogueMemory:{entries:{}}};
   const original=JSON.stringify({credits:s.credits,points:s.points,relationships:s.relationships});
   const o=Memory.offer(s,npc);
   assert.equal(o.lines.length,3);
   assert.equal(o.choices.length,2);
   assert.deepEqual(Memory.offer(JSON.parse(JSON.stringify(s)),npc),o,'no reload reroll');
   assert.equal(JSON.stringify({credits:s.credits,points:s.points,relationships:s.relationships}),original,'offers are read-only');
   assert.equal(Memory.mark(s,'memory:'+npc+':'+thread.topic+':followup'),false,'unheard memory cannot be marked seen');
   const reply=Memory.choose(s,npc,branch);
   assert.equal(reply[0].text,thread.choices[branch].label);
   assert.equal(reply[1].text,thread.choices[branch].reply);
   assert.equal(Memory.choose(s,npc,branch==='a'?'b':'a'),null,'recorded player response is immutable');
   assert.equal(Memory.offer(s,npc),null,'a callback cannot fire on the same day');
   const reload=JSON.parse(JSON.stringify(s));
   reload.day++;
   assert.equal(Memory.offer(reload,npc),null,'the follow-up must wait at least two days');
   reload.day++;
   const followup=Memory.offer(reload,npc);
   assert.equal(followup.kind,'followup');
   assert.equal(followup.lines[0].text,thread.choices[branch].followup[0]);
   assert.ok(followup.lines.some(line=>line.speaker==='Protagonist'));
   assert.equal(Memory.offer(JSON.parse(JSON.stringify(reload)),npc).id,followup.id);
   assert.equal(Memory.mark(reload,followup.id),true);
   assert.equal(Memory.mark(reload,followup.id),false,'acknowledgement is once-only');
   assert.equal(Memory.offer(reload,npc),null);
   assert.equal(JSON.stringify({credits:reload.credits,points:reload.points,relationships:reload.relationships}),original);
  }
 }
});

test('forged choices, unowned acknowledgements, invalid days and new seasons cannot fabricate callbacks',()=>{
 const s={day:4,dialogueMemory:{entries:{}}};
 assert.equal(Memory.choose(s,'not-a-person','a'),null);
 assert.equal(Memory.choose(s,'hana','forged'),null);
 assert.equal(Memory.mark(s,'memory:hana:basilisk:followup'),false);
 assert.equal(Memory.mark(s,'react:duel:hana:1'),false);
 assert.equal(Memory.offer({...s,day:91},'hana'),null);
 const restarted={day:1};Memory.hydrate(restarted);
 assert.deepEqual(restarted.dialogueMemory.entries,{});
});

test('all 44 incidental references are tied to actual everyday or character Talk topics',()=>{
 const Character=require('../rpg_character_chats');
 assert.deepEqual(Object.keys(Memory.asides).sort(),Object.keys(Everyday.topics).sort());
 assert.deepEqual(Memory.validate(),[]);
 for(const [npc,rows] of Object.entries(Memory.asides)){
  assert.equal(rows.length,2,npc+' must have two different references');
  for(const row of rows){
   const [source,indexText]=row.requires.split(':'),index=Number(indexText);
   const bank=source==='everyday'?Everyday.topics[npc]:Character.scenes[npc];
   assert.ok(bank[index],npc+' referenced source exists');
   assert.ok(row.lines.length===3&&row.lines.every(text=>typeof text==='string'&&text.trim()),npc+' has a coherent aside');
   assert.ok(Memory.casualId(source,npc,index),npc+' source can be persisted');
  }
 }
});

test('optional references never appear before the referenced dialogue is completed',()=>{
 for(const [npc,rows] of Object.entries(Memory.asides)){
  for(const [index,item] of rows.entries()){
   const [source,topic]=item.requires.split(':'),id=Memory.casualId(source,npc,Number(topic));
   const state={day:14,slot:0,credits:80,relationships:{[npc]:{affection:2}},dialogueMemory:{entries:{},casualSeen:{},asidesSeen:{}}};
   for(let day=14;day<=35;day++)for(let slot=0;slot<3;slot++){
    assert.equal(Memory.aside({...state,day,slot},npc,'casual:classic:'+npc+':0'),null,npc+' must not mention unseen Talk');
   }
   assert.equal(Memory.markAside(state,'aside:'+npc+':'+index),false);
   assert.equal(Memory.markCasual(state,id),true);
   assert.equal(Memory.markCasual(state,id),false,'once remembered, original day is stable');
   assert.equal(state.dialogueMemory.casualSeen[id].day,14);
   assert.equal(Memory.aside(state,npc,'casual:classic:'+npc+':0'),null,'same-day callback prohibited');
   const opportunity=Array.from({length:76},(_,i)=>i+15).flatMap(day=>
    [0,1,2].map(slot=>({day,slot}))).find(x=>
     Memory.aside({...state,...x},npc,'casual:classic:'+npc+':0')?.id==='aside:'+npc+':'+index);
   assert.ok(opportunity,npc+' callback needs to be reachable within the season');
   state.day=opportunity.day;state.slot=opportunity.slot;
   const original=JSON.stringify(state),callback=Memory.aside(state,npc,'casual:classic:'+npc+':0');
   assert.equal(JSON.stringify(state),original,'checking callbacks must not mutate save state');
   assert.equal(callback.requires,id);
   assert.equal(callback.lines[0].text,item.lines[0]);
   assert.equal(callback.lines[1].speaker,'Protagonist');
   assert.equal(Memory.aside(state,npc,id),null,'a conversation cannot reference itself');
   assert.deepEqual(Memory.aside(JSON.parse(JSON.stringify(state)),npc,'casual:classic:'+npc+':0'),callback);
   assert.equal(Memory.markAside(state,callback.id),true);
   assert.equal(Memory.markAside(state,callback.id),false,'read callbacks cannot repeat');
   const future={...state,day:state.day+1,slot:0};
   assert.ok(!Memory.aside(future,npc,'casual:classic:'+npc+':0')?.id?.includes('aside:'+npc+':'+index));
   assert.equal(state.credits,80);
   assert.equal(state.relationships[npc].affection,2);
  }
 }
});

test('malformed memory IDs and older saves cannot invent casual history or callbacks',()=>{
 const state={day:12,dialogueMemory:{entries:{}}};
 assert.equal(Memory.aside(state,'hana','casual:character:hana:1'),null);
 assert.equal(Memory.markCasual(state,'casual:everyday:hana:0'),true);
 assert.equal(Memory.markCasual(state,'react:duel:hana:old'),false);
 assert.equal(Memory.markCasual(state,'casual:other:hana:0'),false);
 assert.equal(Memory.markCasual(state,'casual:everyday:hana:0:injected'),false);
 assert.equal(Memory.markAside(state,'aside:hana:99'),false);
 const restart={day:1};Memory.hydrate(restart);
 assert.deepEqual(restart.dialogueMemory.casualSeen,{});
 assert.deepEqual(restart.dialogueMemory.asidesSeen,{});
});
