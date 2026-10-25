'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const VN=require('../rpg_conversations'),STORY=require('../rpg_story');
const REGISTRY=require('../rpg_character_packs.generated'),NARRATIVE=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests');
const names=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const cast=Object.assign(Object.fromEntries(names.map(id=>[id,{
 intro:'Hi.',repeat:'Good to see you.',talk:['I was thinking about the tournament.','My practice changed this morning.','It is good to have a moment away from the tables.']
}])),NARRATIVE.cast,SIDE.cast);
const make=()=>STORY.normalize({day:1,slot:0,location:'shop',storyDone:{},storyMissed:{},relationships:{},partner:null,talked:{},hungOut:{}});
test('all currently registered NPCs have natural back-and-forth chats without rewards or random story state changes',()=>{
 assert.ok(Object.keys(cast).length>=20);
 for(const [id,c] of Object.entries(cast)){
  const state=make(),before=JSON.stringify(state);
  const first=VN.dialogue(state,id,c,null,{first:true});
  const daily=VN.dialogue(state,id,c,null);
  for(const lines of [first,daily]){
   assert.ok(lines.length>=3,id+' needs an actual dialogue exchange');
   assert.ok(lines.some(line=>line.speaker==='Protagonist'),id+' includes the player speaking');
   assert.ok(lines.some(line=>line.speaker===id),id+' speaks with their established voice');
   assert.ok(lines.every(line=>typeof line.text==='string'&&line.text.trim()));
  }
  assert.equal(JSON.stringify(state),before,'casual conversation must not alter player stats or time');
 }
});
test('natural conversations vary by day but do not re-roll during a reload',()=>{
 const c=cast.hana,s=make();
 const first=VN.dialogue(s,'hana',c,null);
 assert.deepEqual(VN.dialogue({...s},'hana',c,null),first);
 const variantDays=new Set(Array.from({length:20},(_,i)=>VN.dialogue({...s,day:i+1},'hana',c,null)[0].text));
 assert.ok(variantDays.size>1);
});
test('contextual choices are occasional, two at most, and require no daily reward',()=>{
 let without=0,withPrompt=0;
 for(const id of Object.keys(cast)){
  for(let day=1;day<=20;day++){
   const s={day,slot:0,talked:{},hungOut:{},appointments:[]};
   const replies=VN.choices(s,id);
   assert.ok(replies.length<=2,'no command-heavy menus');
   assert.ok(!replies.some(row=>/affection|trust|focus|credits|reward|\+\d/.test(row[0])),'hide mechanical rewards');
   if(replies.length)withPrompt++;else without++;
  }
 }
 assert.ok(without>withPrompt,'most ordinary chats have no decisions');
 assert.ok(withPrompt>0,'a few invitations remain possible');
});
test('authoritative story graph remains playable with low-grind sequenced progression',()=>{
 assert.deepEqual(STORY.validate(),[]);
 for(const id of names){
  const scenes=STORY.events.filter(e=>e.id.startsWith(id+'_route_'));
  const s=make();
  for(const e of scenes){
   s.day=e.start;s.slot=e.slot;s.location=e.place;
   assert.equal(STORY.qualifies(e,s),true,id+' should not require unrelated daily conversations before '+e.id);
   const index=e.choices.findIndex(c=>c.kind!=='commit');
   assert.ok(index>=0);
   STORY.resolve(s,e.id,index);
  }
  assert.equal(s.relationships[id].affection>=3,true,id+' earns enough affection from their own route');
 }
});
test('romance readiness respects completed story chapters, exclusivity, and older saves',()=>{
 const s=make();s.relationships.reina.affection=3;s.relationships.reina.trust=0;
 assert.equal(VN.commitmentReady(s,'reina'),false);
 for(let i=1;i<=3;i++)s.storyDone['reina_route_'+i]={day:i,choice:2};
 assert.equal(VN.commitmentReady(s,'reina'),true);
 s.partner='hana';assert.equal(VN.commitmentReady(s,'reina'),false);
});

test('unrecognized NPC Talk never stitches an unrelated opening after a repetitive protagonist filler',()=>{
 const actor={intro:'I just moved here.',talk:['I lost the map to the station.','I am saving up for a new bike.']};
 const previous=new Set();
 for(let day=1;day<=28;day++){
  const state={day,slot:1};
  const lines=VN.dialogue(state,'visiting-trainer',actor,null);
  assert.deepEqual(lines.map(x=>x.speaker),['visiting-trainer','Protagonist','visiting-trainer']);
  assert.equal(lines[0].text,actor.talk[VN.topic(state,'visiting-trainer',2)]);
  assert.notEqual(lines[2].text,actor.talk[(VN.topic(state,'visiting-trainer',2)+1)%2]);
  assert.ok(!lines.some(x=>/And how are things going otherwise\?/.test(x.text)));
  previous.add(lines[1].text);
 }
 assert.ok(previous.size>=3,'fallback protagonist should vary instead of repeating a stock line');
});

test('existing casual chats expose stable memory IDs without changing a single authored line',()=>{
 const MEMORY=require('../rpg_dialogue_memory');
 const EVERYDAY=require('../rpg_everyday_chats');
 const CHARACTER=require('../rpg_character_chats');
 for(const npc of Object.keys(EVERYDAY.topics)){
  const actor=cast[npc]||{intro:'Hi',talk:['How is your day?','The weather is nice.']};
  const seen=new Set();
  for(let day=1;day<=90;day++)for(let slot=0;slot<3;slot++){
   const state={day,slot};
   const saved=JSON.stringify(state);
   const entry=VN.dialogueEntry(state,npc,actor,null,{present:[]});
   assert.deepEqual(entry.lines,VN.dialogue(state,npc,actor,null,{present:[]}));
   assert.equal(JSON.stringify(state),saved,'selection cannot write a fake memory');
   assert.ok(entry.id?.startsWith('casual:')&&entry.id.includes(':'+npc+':'));
   seen.add(entry.id);
   if(entry.source==='everyday')
    assert.ok(EVERYDAY.topics[npc].some((topic,i)=>topic[0]===entry.lines[0].text&&entry.id===MEMORY.casualId('everyday',npc,i)));
   if(entry.source==='character')
    assert.ok(CHARACTER.scenes[npc].some((topic,i)=>topic[0]===entry.lines[0].text&&entry.id===MEMORY.casualId('character',npc,i)));
  }
  assert.ok(seen.has(MEMORY.casualId('everyday',npc,0)),npc+' ordinary topic must be reachable');
  assert.ok(seen.has(MEMORY.casualId('character',npc,1)),npc+' character-specific topic must be reachable');
 }
 const first=VN.dialogueEntry({day:1,slot:0},'hana',cast.hana,null,{first:true});
 assert.equal(first.id,null,'introductions are not retroactively counted as casual conversations');
});

test('cross-character callbacks can accompany unrelated Talk only after hearing the other NPC',()=>{
 const MEMORY=require('../rpg_dialogue_memory');
 const generic={intro:'Hello!',talk:['A regular chat.','A different day.']};
 let reachable=0;
 for(const [npc,rows] of Object.entries(MEMORY.asides)){
  const reference=rows[4],from=reference.from,[bank,index]=reference.requires.split(':');
  const originalId=MEMORY.casualId(bank,from,Number(index));
  assert.ok(originalId,npc+' must have a real source conversation');
  const unseen={day:25,slot:1,dialogueMemory:{entries:{},casualSeen:{},asidesSeen:{}}};
  const earlier=JSON.stringify(unseen),base=VN.dialogueEntry(unseen,npc,cast[npc]||generic,null,{present:[]});
  assert.equal(MEMORY.aside(unseen,npc,base.id),null,'missing cross-character history may not trigger a callback');
  assert.equal(JSON.stringify(unseen),earlier,'unseen selection cannot create evidence');
  // Actually select the originating source topic in the 90-day timeline, not
  // just fabricate knowledge of an arbitrary nonexistent dialogue.
  const witnessed=Array.from({length:69},(_,i)=>i+1).flatMap(day=>
   [0,1,2].map(slot=>({day,slot}))).find(t=>
    VN.dialogueEntry(t,from,cast[from]||generic,null,{present:[]}).id===originalId);
  assert.ok(witnessed,from+' original dialogue can actually be shown');
  const save={day:witnessed.day,slot:witnessed.slot,
   dialogueMemory:{entries:{},casualSeen:{},asidesSeen:{}}};
  assert.equal(MEMORY.markCasual(save,originalId),true);
  const encountered=Array.from({length:90-witnessed.day},(_,i)=>witnessed.day+i+1).flatMap(day=>
   [0,1,2].map(slot=>({day,slot}))).find(t=>{
    const present={...save,...t},talk=VN.dialogueEntry(present,npc,cast[npc]||generic,null,{present:[]});
    return talk.id&&MEMORY.aside(present,npc,talk.id)?.id==='aside:'+npc+':4';
   });
  assert.ok(encountered,npc+' must be able to recall '+from+' in unrelated Talk');
  const later={...save,...encountered};
  const unrelated=VN.dialogueEntry(later,npc,cast[npc]||generic,null,{present:[]});
  const aside=MEMORY.aside(later,npc,unrelated.id);
  assert.ok(aside&&aside.requires===originalId);
  assert.notEqual(unrelated.id,originalId,'callback runs in a separate, unrelated conversation');
  assert.equal(aside.lines.length,3);
  assert.equal(MEMORY.markAside(later,aside.id),true);
  assert.equal(MEMORY.markAside(later,aside.id),false);
  reachable++;
 }
 assert.equal(reachable,22);
});
