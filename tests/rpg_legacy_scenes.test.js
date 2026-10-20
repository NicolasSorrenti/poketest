'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const S=require('../rpg_legacy_scenes');
const STORY=require('../rpg_story');
const DIALOGUE=require('../rpg_dialogue');
const heroes=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];

test('each of the eight original characters has four complete narration-led chapters',()=>{
 assert.equal(Object.keys(S.scenes).length,32);
 assert.deepEqual(STORY.validate(),[]);
 for(const npc of heroes)for(let chapter=1;chapter<=4;chapter++){
  const id=npc+'_route_'+chapter,entry=S.byId(id),event=STORY.byId(id);
  assert.ok(entry&&event,'missing '+id);
  assert.ok(entry.lines.length>=6,'scene needs interaction beats '+id);
  assert.equal(entry.lines[0].speaker,'Narrator','scene should establish its setting '+id);
  assert.ok(entry.lines.some(l=>l.speaker==='Protagonist'),'player must actually speak '+id);
  assert.ok(entry.lines.some(l=>l.speaker===npc),'NPC must actually speak '+id);
  assert.ok(entry.lines.every(l=>l.text&&l.text.trim().length>0),'no blank dialogue '+id);
  assert.ok(entry.lines.filter(l=>l.speaker==='Narrator').every(l=>l.text.length>10),'descriptive beats must have substance '+id);
  assert.deepEqual(event.lines,entry.lines,'source must be wired to live story graph '+id);
  assert.equal(event.choices.length,3,id+' should keep original choice count');
  assert.equal(entry.choices.length,3);
  for(let i=0;i<3;i++){
   assert.equal(event.choices[i].label,entry.choices[i].label);
   assert.equal(event.choices[i].reply,entry.choices[i].reply);
   assert.ok(event.choices[i].delta&&event.choices[i].kind,'choice mechanics must remain intact');
  }
  assert.strictEqual(DIALOGUE.storyLines(id,event.lines),event.lines,'avoid canned appended beats '+id);
 }
});
test('endings preserve original romance, friendship, and noncommit choices',()=>{
 for(const npc of heroes){
  const e=STORY.byId(npc+'_route_4');
  assert.deepEqual(e.choices.map(c=>c.kind),['commit','friend','honest'],npc+' ending changed branch mechanics');
  assert.equal(e.choices[0].flag,'romance');
  assert.equal(e.choices[1].flag,'friendship');
  assert.equal(e.choices[2].flag,'friendship');
 }
});
test('RPG HTML loads scene prose before the story engine, and narrator receives styling',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','rpg.html'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'..','rpg.css'),'utf8');
 const main=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8');
 assert.ok(html.includes('/rpg_legacy_scenes.js'));
 assert.ok(html.indexOf('/rpg_legacy_scenes.js')<html.indexOf('/rpg_story.js'));
 assert.match(css,/\.dialogue\.is-narration/);
 assert.match(main,/shown\?\.speaker==='Narrator'/);
});
