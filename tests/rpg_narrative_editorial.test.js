'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Story=require('../rpg_story');
const Bonds=require('../rpg_bond_chapters');
const Dialogue=require('../rpg_dialogue');
const Packs=require('../rpg_character_packs.generated');
const Native=require('../rpg_narrative_pack');

test('all fifteen supporting bond chapters keep stable mechanics while using visual story beats',()=>{
 assert.equal(Bonds.events.length,15);
 assert.deepEqual(Bonds.validate(),[]);
 for(const e of Bonds.events){
  assert.equal(e.lines.length,5,'preserve saved line indexes '+e.id);
  assert.ok(e.lines.some(l=>l.speaker==='Narrator'),'missing environmental action '+e.id);
  assert.ok(e.lines.some(l=>l.speaker==='Protagonist'),'missing dialogue '+e.id);
  assert.equal(e.lines.at(-1).speaker,e.npc,'final line should belong to NPC '+e.id);
  assert.equal(e.choices.length,2,'choices must remain intact '+e.id);
  assert.ok(e.choices.every(c=>c.kind&&c.flag&&c.delta&&c.reply),'incomplete branch '+e.id);
  assert.strictEqual(Dialogue.storyLines(e.id,e.lines),e.lines,'stock moral appended '+e.id);
  for(const flag of Object.keys(e.openingByFlag||{})){
   assert.equal(e.lines[0].speaker,e.npc,'conditional start must be NPC voice '+e.id);
   const lines=Story.linesFor({storyFlags:{[e.prerequisite]:flag}},e.id);
   assert.equal(lines[0].text,e.openingByFlag[flag],'prior choice no longer affects scene '+e.id);
   assert.equal(lines[0].speaker,e.npc,'conditional text misattributed '+e.id);
  }
 }
});

test('four crossover scenes keep both character voices and previous-choice openings',()=>{
 const ids=['jinx_marina_cross_1','jinx_alma_cross_1','sol_alma_cross_1','sol_marina_cross_1'];
 const cast=new Set(['marina','alma','jinx','sol']);
 for(const id of ids){
  const e=Story.byId(id);
  assert.ok(e,id);
  assert.ok(e.lines.some(l=>l.speaker==='Narrator'),'needs stage description '+id);
  assert.ok(e.lines.some(l=>l.speaker==='Protagonist'),'needs protagonist voice '+id);
  assert.ok([...new Set(e.lines.map(l=>l.speaker))].filter(x=>cast.has(x)).length>=2,'both NPCs need a turn '+id);
  assert.ok(Object.keys(e.openingByFlag||{}).length>=3,'prior chapter branch missing '+id);
  for(const [flag,opening] of Object.entries(e.openingByFlag)){
   const lines=Story.linesFor({storyFlags:{[e.prerequisite]:flag}},id);
   assert.equal(lines[0].text,opening);
   assert.equal(lines[0].speaker,e.lines[0].speaker);
  }
  assert.deepEqual(Packs.events.find(x=>x.id===id)?.lines,e.lines,'registry out of sync '+id);
 }
});

test('nine recurring guest chapters and eight original-cast crossovers keep believable staged speakers',()=>{
 const ids=['jun_guest_1','jun_guest_2','jun_guest_3','teo_guest_1','teo_guest_2','teo_guest_3','iris_guest_1','iris_guest_2','iris_guest_3',
  'hana_cross_1','yuna_cross_1','camila_cross_1','marina_cross_1','reina_cross_1','akari_cross_1','kaede_cross_1','shiori_cross_1'];
 assert.deepEqual(Native.validate(),[]);
 for(const id of ids){
  const e=Story.byId(id);
  assert.ok(e,'missing native scene '+id);
  assert.equal(e.lines.length,6,'preserve in-progress save indices '+id);
  assert.ok(e.lines.some(l=>l.speaker==='Narrator'),'no scene description '+id);
  assert.ok(e.lines.some(l=>l.speaker==='Protagonist'),'no player exchange '+id);
  assert.equal(e.choices.length,2,'branch count changed '+id);
  assert.strictEqual(Dialogue.storyLines(id,e.lines),e.lines,'do not add generic moral '+id);
  for(const [flag,opening] of Object.entries(e.openingByFlag||{})){
   assert.equal(e.lines[0].speaker,e.npc,'conditional dialogue belongs to NPC '+id);
   assert.equal(Story.linesFor({storyFlags:{[e.prerequisite]:flag}},id)[0].text,opening,'branch continuity '+id);
  }
 }
});

test('contextual UI choices keep the previous line and hide cost microcopy',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8');
 assert.ok(ui.includes('const last=ARC.linesFor(state,a.id).at(-1)'), 'arc choice should preserve spoken line');
 assert.ok(!ui.includes('How will you answer?'), 'stock NPC choice prompt still present');
 assert.ok(ui.includes("o.label,'situationChoice:'"),'situation choices should use concise labels');
 assert.ok(!ui.includes("o.label+' · ⏳ 1 period"),'situation choices should not print costs');
 assert.ok(ui.includes("log('Finished '+e.title"),'journal entries should report facts');
});
