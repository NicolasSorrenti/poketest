'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Dialogue=require('../rpg_dialogue');
const Pack=require('../rpg_narrative_pack');
const Side=require('../rpg_side_quests');
const Story=require('../rpg_story');

const regular=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const cast={...Object.fromEntries(regular.map(id=>[id,{name:id,intro:'Hello from '+id,flirt:'Hello',talk:['First daily topic','Second daily topic','Third daily topic']}])) ,...Pack.cast,...Side.cast};
const newRoutes=['jinx','luna','sol','rina','elena','sierra'];
const expected=[...regular,'jun','teo','iris','elio','alma','nereo',...newRoutes];

test('all 20 registered characters speak in multi-line greetings, Talk and flirt exchanges',()=>{
 assert.deepEqual(Object.keys(cast).sort(),expected.sort());
 for(const id of expected){
  const actor=cast[id];
  assert.ok(actor.name,'missing NPC '+id);
  const greet=Dialogue.greetingLines(id,actor.intro||'Hello');
  assert.equal(greet.length,3,id+' needs voiced introduction');
  assert.deepEqual(greet.map(x=>x.speaker),[id,'Protagonist',id],id+' greeting speaker order');
  const flirt=Dialogue.flirtLines(id,actor.flirt||'');
  assert.equal(flirt.length,4,id+' needs character-specific flirt exchange');
  assert.deepEqual(flirt.map(x=>x.speaker),['Protagonist',id,'Protagonist',id]);
  assert.ok(actor.talk?.length>0,'missing talk topics for '+id);
  for(let index=0;index<actor.talk.length;index++){
   const lines=Dialogue.talkLines(id,index,actor.talk[index]);
   assert.equal(lines.length,5,id+' daily topic '+index+' needs proper back-and-forth');
   assert.deepEqual(lines.map(x=>x.speaker),[id,'Protagonist',id,'Protagonist',id]);
   assert.equal(lines[0].text,actor.talk[index],'preserve authored NPC opening');
   assert.ok(lines.every(x=>typeof x.text==='string'&&x.text.trim().length>10));
  }
 }
});

test('all 30 added-character route chapters retain player choices after an extra spoken exchange',()=>{
 for(const id of newRoutes)for(let chapter=1;chapter<=5;chapter++){
  const key=id+'_route_'+chapter,event=Story.byId(key);
  assert.ok(event,'missing playable route: '+key);
  const original=Story.linesFor({storyFlags:{}},key);
  const lines=Dialogue.storyLines(key,original);
  assert.equal(lines.length,original.length+2,key);
  assert.deepEqual(lines.slice(-1),original.slice(-1),'the original choice prompt should stay last');
  assert.equal(lines.at(-3).speaker,'Protagonist',key);
  assert.equal(lines.at(-2).speaker,id,key);
  assert.ok(event.choices.length>=2);
  assert.strictEqual(Story.byId(key).choices,event.choices,'do not alter player decisions');
 }
});

test('narration-led original routes do not acquire redundant generic dialogue',()=>{
 for(const id of regular)for(let chapter=1;chapter<=4;chapter++){
  const key=id+'_route_'+chapter,original=Story.linesFor({storyFlags:{}},key);
  assert.ok(original.some(x=>x.speaker==='Narrator'),key+' should contain description');
  assert.strictEqual(Dialogue.storyLines(key,original),original,key+' must not append canned reassurance');
 }
 const event=Pack.events.find(x=>!/\broute\b/.test(x.id)&&Array.isArray(x.lines));
 assert.ok(event,'need a crossover encounter');
 const original=event.lines;
 assert.strictEqual(Dialogue.storyLines(event.id,original),original);
});

test('unknown characters cannot accidentally receive another character’s dialogue',()=>{
 assert.deepEqual(Dialogue.talkLines('unknown',0,'A new hello'),[{speaker:'unknown',text:'A new hello'}]);
 assert.deepEqual(Dialogue.greetingLines('unknown','Hello'),[{speaker:'unknown',text:'Hello'}]);
 assert.deepEqual(Dialogue.flirtLines('unknown','No thanks'),[{speaker:'unknown',text:'No thanks'}]);
});
