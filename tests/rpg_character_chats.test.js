'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const voiced=require('../rpg_character_chats');
const everyday=require('../rpg_everyday_chats');
const VN=require('../rpg_conversations');
const DIALOGUE=require('../rpg_dialogue');
const cast=['hana','reina','shiori','yuna','akari','camila','marina','kaede',
 'jun','teo','iris','elio','alma','nereo','elena','jinx','luna','rina','sierra','sol','laca','barb'];
const actor={intro:'The canonical first meeting.',repeat:'Still here.',talk:['Original card topic.','Another original topic.']};
test('in-character expansion covers every NPC with four authored five-beat conversations',()=>{
 assert.deepEqual(Object.keys(voiced.scenes).sort(),[...cast].sort());
 assert.deepEqual(voiced.validate(),[]);
 for(const id of cast){
  const rows=voiced.scenes[id];
  assert.equal(rows.length,4,id);
  assert.equal(new Set(rows.map(row=>row[0])).size,4,id);
  assert.ok(rows.every(row=>row.length===5&&row.every(line=>line.trim())),id);
 }
});
test('new voiced topics are stable, reachable, and never mutate story/save/affection',()=>{
 for(const npc of cast){
  const shown=new Set();let vanilla=0,flavored=0,casual=0;
  const state={day:1,slot:1,location:'shop',relationships:{[npc]:{affection:2}},talked:{},storyDone:{},storyFlags:{}};
  const before=JSON.stringify(state);
  assert.deepEqual(voiced.select(state,npc),voiced.select({...state},npc));
  for(let day=1;day<=90;day++){
   const s={...state,day};
   const content=VN.dialogue(s,npc,actor,DIALOGUE);
   assert.ok(content.length>=3,npc+' missing back-and-forth');
   if(everyday.shouldUse(s,npc)){
    casual++;
    assert.deepEqual(content,everyday.select(s,npc));
   }else if(voiced.shouldUse(s,npc)){
    flavored++;
    assert.deepEqual(content,voiced.select(s,npc));
    assert.deepEqual(content.map(x=>x.speaker),[npc,'Protagonist',npc,'Protagonist',npc]);
    shown.add(content[0].text);
   }else{
    vanilla++;
    assert.equal(content[0].text,actor.talk[VN.topic(s,npc,actor.talk.length)]);
   }
  }
  assert.equal(shown.size,4,npc+' has unreachable in-character topics');
  assert.ok(flavored>=10&&vanilla>=3&&casual>=60,npc+' lost its mixed dialogue');
  assert.equal(JSON.stringify(state),before,npc+' mutates state');
 }
});
test('introductions, unknown characters, and original dialogue remain unchanged',()=>{
 for(const npc of cast){
  const state={day:2,slot:0};
  const initial=VN.dialogue(state,npc,actor,DIALOGUE,{first:true});
  assert.equal(initial[0].text,actor.intro,npc);
 }
 assert.equal(voiced.select({day:10,slot:0},'unregistered'),null);
 assert.equal(voiced.shouldUse({day:10,slot:0},'unregistered'),false);
});
