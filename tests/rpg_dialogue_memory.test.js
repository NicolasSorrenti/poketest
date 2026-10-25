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

test('all existing and expanded incidental references have valid authored prerequisites',()=>{
 const Character=require('../rpg_character_chats');
 assert.deepEqual(Object.keys(Memory.asides).sort(),Object.keys(Everyday.topics).sort());
 assert.deepEqual(Memory.validate(),[]);
 for(const [npc,rows] of Object.entries(Memory.asides)){
  assert.equal(rows.length,6,npc+' must have six distinct references');
  for(const row of rows.slice(0,2)){
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
  for(const [index,item] of rows.slice(0,2).entries()){
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
 assert.equal(Memory.markCasual(state,Memory.casualId('everyday','hana',0)),true);
 assert.equal(Memory.markCasual(state,'react:duel:hana:old'),false);
 assert.equal(Memory.markCasual(state,'casual:other:hana:0'),false);
 assert.equal(Memory.markCasual(state,'casual:everyday:hana:0:injected'),false);
 assert.equal(Memory.markAside(state,'aside:hana:99'),false);
 const restart={day:1};Memory.hydrate(restart);
 assert.deepEqual(restart.dialogueMemory.casualSeen,{});
 assert.deepEqual(restart.dialogueMemory.asidesSeen,{});
});

test('remembered topic identities survive reordering or inserting other authored chats',()=>{
 const Character=require('../rpg_character_chats');
 for(const [kind,bank] of [['everyday',Everyday.topics],['character',Character.scenes]]){
  const rows=bank.hana,first=rows[0],second=rows[1];
  const savedId=Memory.casualId(kind,'hana',0);
  try{
   rows[0]=second;rows[1]=first;
   assert.equal(Memory.casualId(kind,'hana',1),savedId,'same original topic must retain its ID after reordering');
  }finally{rows[0]=first;rows[1]=second;}
  assert.equal(Memory.casualId(kind,'hana',0),savedId);
 }
 const s={day:9};
 assert.equal(Memory.markCasual(s,'casual:everyday:hana:0'),false,
  'old position-shaped IDs must never masquerade as a completed authored conversation');
});

test('new asides include two additional personal topics, a grounded cross-character reference and a sequel',()=>{
 const CHARACTER=require('../rpg_character_chats');
 const extraCount=Object.values(Memory.asides).reduce((n,rows)=>n+rows.length-2,0);
 assert.equal(extraCount,88,'22 characters get four more callbacks each');
 for(const [npc,rows] of Object.entries(Memory.asides)){
  assert.equal(rows.length,6,npc+' has two original and four new callbacks');
  for(const [i,row] of rows.entries()){
   assert.equal(row.lines.length,3,npc+':'+i);
   assert.ok(row.lines.every(line=>typeof line==='string'&&line.trim()),npc+' has complete lines');
   if(i===2)assert.ok(Everyday.topics[npc][1],npc+' first expansion anchored to an existing everyday topic');
   if(i===3)assert.ok(CHARACTER.scenes[npc][2],npc+' second expansion anchored to an existing character topic');
   if(i===4){
    assert.ok(row.from&&row.from!==npc,npc+' cross-reference names a different NPC');
    const [type,index]=row.requires.split(':');
    assert.ok((type==='everyday'?Everyday.topics:CHARACTER.scenes)[row.from][Number(index)],npc+' refers to a real older scene');
   }
   if(i===5)assert.equal(row.requires,'aside:0',npc+' sequel follows an existing callback');
  }
 }
 assert.deepEqual(Memory.validate(),[]);
});

test('all 88 new callbacks require a prior completed scene and can play without changing resources',()=>{
 for(const [npc,rows] of Object.entries(Memory.asides)){
  for(let index=2;index<rows.length;index++){
   const item=rows[index],state={day:12,slot:1,credits:80,points:0,
    relationships:{[npc]:{affection:2,trust:1}},dialogueMemory:{entries:{},casualSeen:{},asidesSeen:{}}};
   const key='aside:'+npc+':'+index;
   assert.equal(Memory.markAside(state,key),false,npc+' cannot mark unseen reference '+index);
   for(let day=12;day<=18;day++){
    assert.equal(Memory.aside({...state,day},npc,'casual:classic:'+npc+':0'),null,npc+' cannot mention unheard prerequisites');
   }
   const [source,idxText]=item.requires.split(':'),from=item.from||npc;
   let dependency;
   if(source==='aside'){
    // The first, existing aside needs its own prerequisite dialogue first.
    const original=rows[Number(idxText)];
    const [kind,topic]=original.requires.split(':');
    const initial=Memory.casualId(kind,npc,Number(topic));
    assert.ok(initial,npc+' chain prerequisite exists');
    assert.equal(Memory.markCasual(state,initial),true);
    state.day=13;
    assert.equal(Memory.markAside(state,'aside:'+npc+':'+idxText),true);
    dependency='aside:'+npc+':'+idxText;
   }else{
    dependency=Memory.casualId(source,from,Number(idxText));
    assert.ok(dependency,npc+' source exists');
    assert.equal(Memory.markCasual(state,dependency),true);
   }
   const referenceDay=state.day;
   assert.equal(Memory.markAside(state,key),false,'cannot cite same-day conversation');
   assert.equal(Memory.aside(state,npc,'casual:classic:'+npc+':0'),null,'no same-day callback');
   const first=Array.from({length:90-referenceDay},(_,i)=>i+referenceDay+1).flatMap(day=>
    [0,1,2].map(slot=>({day,slot}))).find(t=>{
     const next={...state,...t};
     return Memory.aside(next,npc,'casual:classic:'+npc+':0')?.id===key;
    });
   assert.ok(first,npc+' new callback '+index+' should be reachable before campaign end');
   const day=first.day,slot=first.slot;state.day=day;state.slot=slot;
   const checkpoint=JSON.stringify(state),scene=Memory.aside(state,npc,'casual:classic:'+npc+':0');
   assert.equal(scene.requires,dependency);
   assert.equal(JSON.stringify(state),checkpoint,'selection is pure and must not modify saves');
   assert.deepEqual(scene.lines.map(x=>x.speaker),[npc,'Protagonist',npc]);
   assert.deepEqual(Memory.aside(JSON.parse(JSON.stringify(state)),npc,'casual:classic:'+npc+':0'),scene);
   assert.equal(Memory.markAside(state,key),true);
   assert.equal(Memory.markAside(state,key),false,'already completed scene must not repeat');
   assert.equal(state.credits,80);
   assert.equal(state.relationships[npc].affection,2);
   assert.equal(state.points,0);
  }
 }
});

test('cross-character callbacks do not invent another NPC\'s prior dialogue',()=>{
 for(const [npc,rows] of Object.entries(Memory.asides)){
  const cross=rows[4],id=Memory.casualId(...[cross.requires.split(':')[0],cross.from,Number(cross.requires.split(':')[1])]);
  const own=Memory.casualId('everyday',npc,1);
  const s={day:20,slot:1,dialogueMemory:{entries:{},casualSeen:{},asidesSeen:{}}};
  assert.equal(Memory.markCasual(s,own),true);
  for(let day=21;day<=35;day++)for(let slot=0;slot<3;slot++){
   const next={...s,day,slot},ref=Memory.aside(next,npc,'casual:classic:'+npc+':0');
   assert.notEqual(ref?.id,'aside:'+npc+':4','same-NPC talk cannot fabricate other-character history');
  }
  assert.equal(Memory.markAside(s,'aside:'+npc+':4'),false);
  assert.equal(Memory.markCasual(s,id),true);
  assert.equal(Memory.markAside(s,'aside:'+npc+':4'),false,'same-day reference is still forbidden');
 }
});
