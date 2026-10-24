'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const chats=require('../rpg_everyday_chats');
const VN=require('../rpg_conversations');
const DIALOGUE=require('../rpg_dialogue');
const VOICED=require('../rpg_character_chats');
const roster=['hana','reina','shiori','yuna','akari','camila','marina','kaede',
 'jun','teo','iris','elio','alma','nereo','elena','jinx','luna','rina','sierra','sol','laca','barb'];
const actor={intro:'Nice to meet you.',repeat:'Hello again.',talk:['A card topic.','A tournament topic.']};
test('every known character has twenty-one independent, well-formed everyday conversations',()=>{
 assert.deepEqual(Object.keys(chats.topics).sort(),[...roster].sort());
 assert.deepEqual(chats.validate(),[]);
 for(const id of roster){
  assert.equal(chats.topics[id].length,21,id);
  const openings=chats.topics[id].map(lines=>lines[0]);
  assert.equal(new Set(openings).size,21,id+' repeats itself');
  assert.ok(chats.topics[id].every(lines=>[3,5].includes(lines.length)));
 }
});
test('dialogue remains stable on reload and cycles through all 21 casual topics',()=>{
 for(const id of roster){
  const seen=new Set(),spoken=new Set(),s={day:1,slot:1,relationships:{},talked:{}};
  const before=JSON.stringify(s);
  const same=chats.select(s,id);
  assert.deepEqual(chats.select({...s},id),same,id);
  for(let day=1;day<=90;day++){
   const state={...s,day};
   const lines=chats.select(state,id);
   assert.deepEqual(lines.map(x=>x.speaker),Array.from({length:lines.length},(_,i)=>i%2?'Protagonist':id));
   assert.ok(lines.every(x=>x.text.trim()));
   seen.add(lines[0].text);
   const out=VN.dialogue(state,id,actor,DIALOGUE);
   assert.ok(out.length>=3,id);
   assert.ok(out.some(x=>x.speaker==='Protagonist'));
   if(chats.shouldUse(state,id)){
    assert.deepEqual(out,lines,'casual scene should appear on most days');
    spoken.add(lines[0].text);
   }
  }
  assert.equal(seen.size,21,id+' does not rotate through every topic');
  assert.equal(spoken.size,21,id+' normal Talk never displays some topics');
  assert.equal(JSON.stringify(s),before,id+' casual chat changed save state');
 }
});
test('first meetings and existing characteristic dialogue remain accessible',()=>{
 for(const id of roster){
  const s={day:1,slot:0};
  const first=VN.dialogue(s,id,actor,DIALOGUE,{first:true});
  assert.equal(first[0].text,actor.intro,id+' must retain the first meeting');
  assert.ok(first.some(x=>x.speaker===id));
  const oldDay=Array.from({length:90},(_,i)=>({...s,day:i+1}))
   .find(state=>!chats.shouldUse(state,id)&&!VOICED.shouldUse(state,id));
  assert.ok(oldDay,id+' must still have classic dialogue days');
  const legacy=VN.dialogue(oldDay,id,actor,DIALOGUE);
  assert.equal(legacy[0].text,actor.talk[VN.topic(oldDay,id,actor.talk.length)],id);
 }
 assert.equal(chats.select({day:5,slot:0},'unknown'),null);
 assert.equal(chats.shouldUse({day:5,slot:0},'unknown'),false);
});
