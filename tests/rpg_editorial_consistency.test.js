'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Story=require('../rpg_story');
const Side=require('../rpg_side_quests');
const Pack=require('../rpg_narrative_pack');
const Registry=require('../rpg_character_packs.generated');
const Season=require('../rpg_season_events');
const Mandatory=require('../rpg_mandatory_events');
const Dialogue=require('../rpg_dialogue');

const original=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const supporting=['elio','alma','nereo','jun','teo','iris'];
const guests=['jinx','luna','sol','rina','elena','sierra'];

test('all nine side-quest stages express movement through narration, with no mechanical changes',()=>{
 assert.deepEqual(Side.validate(),[]);
 assert.equal(Side.quests.length,3);
 for(const quest of Side.quests){
  assert.equal(quest.stages.length,3);
  for(const stage of quest.stages){
   assert.equal(stage.lines.length,6,stage.title+' stable progression positions');
   assert.equal(stage.lines[0].speaker,'Narrator',stage.title+' opens with a description');
   assert.ok(stage.lines.filter(line=>line.speaker==='Narrator').length>=1,stage.title+' must establish at least one visual beat');
   assert.equal(stage.lines[stage.lines.length-1].speaker,stage.npc,'NPC must lead to its next action');
   assert.ok(stage.lines.every(line=>line.text&&line.text.trim()),'empty line '+stage.title);
   if(stage.kind==='talk')assert.equal(stage.choices.length,2,'choice count changed: '+stage.title);
   else assert.ok(stage.reward?.win&&stage.reward?.loss&&stage.reward?.draw,'duel rewards changed');
  }
 }
});

test('six required season events keep the original outcome flags and contextual narrator staging',()=>{
 const flags={
  neo_community_welcome:['welcome_compete','welcome_explore'],
  neo_community_day:['community_volunteer','community_encourage'],
  neo_cup_eve:['cup_practice','cup_watch'],
  neo_qualifier_eve:['qualifier_prepare','qualifier_support'],
  neo_final_preparations:['finale_focus','finale_gratitude'],
  neo_season_closure:['season_keep_going','season_reflect']
 };
 assert.equal(Season.events.length,6);
 for(const event of Season.events){
  assert.equal(event.kind,'season');
  assert.equal(event.lines[0].speaker,'Narrator');
  assert.ok(event.lines.some(line=>line.speaker==='Protagonist'),'player voice missing '+event.id);
  assert.ok(event.lines.some(line=>!['Narrator','Protagonist'].includes(line.speaker)),'character voice missing '+event.id);
  assert.deepEqual(event.choices.map(c=>c.flag),flags[event.id]);
  assert.equal(event.timeCost,0,'unwanted cost '+event.id);
 }
 const closure=Season.events.find(e=>e.closure);
 const text=closure.lines.map(x=>x.text).join(' ');
 for(const key of ['seasonRecord','championshipRecord','friendshipRecord'])assert.ok(text.includes('{{'+key+'}}'),'missing closure token '+key);
 const generated=fs.readFileSync(path.join(__dirname,'..','rpg_season_events.js'),'utf8');
 assert.match(generated,/AUTO-GENERATED/);
 assert.deepEqual(require('../rpg_season_events').events,Season.events);
});

test('remote-compatible bond scenes use natural invitations without changing flags or delivery',()=>{
 const expected={rina_initiates_practice:['rina_practice_yes','rina_practice_no'],sol_invites_quiet:['sol_quiet_yes','sol_quiet_no']};
 for(const [id,flags] of Object.entries(expected)){
  const scene=Registry.mandatoryEvents.find(e=>e.id===id);
  assert.ok(scene,'missing '+id);
  assert.equal(scene.delivery,'remote_or_present');
  assert.equal(scene.timeCost,0);
  assert.equal(scene.lines.length,4,'avoid changing active-save line indexes');
  assert.deepEqual(scene.choices.map(c=>c.flag),flags);
  assert.ok(scene.lines.every(line=>line.speaker==='Protagonist'||line.speaker===scene.characterId),'remote event must not claim unseeable action');
 }
 const all=[...Season.events,...Registry.mandatoryEvents];
 const characterIds=[...original,...supporting,...guests];
 const storyIds=[...new Set([...Story.events,...Registry.events].map(e=>e.id))];
 assert.deepEqual(Mandatory.validate(all,{characterIds,storyIds}),[]);
});

test('every everyday topic has its own paired exchange; new guest dialogue beats win over old fallback arrays',()=>{
 const all={...Side.cast,...Pack.cast,...Registry.cast};
 for(const id of [...supporting,...guests]){
  const actor=all[id];assert.ok(actor&&actor.talk.length>=3,'missing topic '+id);
  const openings=actor.talk.map((topic,index)=>{
   const lines=Dialogue.talkLines(id,index,topic);
   assert.deepEqual(lines.map(l=>l.speaker),[id,'Protagonist',id,'Protagonist',id]);
   return lines[1].text;
  });
  assert.equal(new Set(openings).size,actor.talk.length,id+' reused a generic fallback conversation');
 }
 for(const id of original){
  const starts=Array.from({length:3},(_,i)=>Dialogue.talkLines(id,i,'sample')[1].text);
  assert.equal(new Set(starts).size,3,'missing separate legacy topics '+id);
 }
 assert.equal(Dialogue.talkLines('jinx',0,all.jinx.talk[0])[1].text,"So what's the play when your first hand is terrible?");
 assert.equal(Dialogue.talkLines('sol',0,all.sol.talk[0])[1].text,'What have you found so far?');
});
