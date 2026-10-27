'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const focus=JSON.parse(fs.readFileSync('rpg-assets/characters/hana/overworld-variants/chime-focus.json','utf8'));
const variants=JSON.parse(fs.readFileSync('rpg-assets/characters/hana/overworld-variants/variants.json','utf8'));
const html=fs.readFileSync('rpg.html','utf8');
const runtime=fs.readFileSync('rpg.js','utf8');
const overlay=fs.readFileSync('rpg_hana_outfit_chime.js','utf8');
test('every Hana variant has an outfit focus window within image bounds',()=>{
 assert.equal(focus.durationMs,3000);
 for(const item of variants.variants){
  const name=item.path.split('/').pop(),range=focus.variants[name];
  assert.ok(range,'missing focus: '+name);
  assert.ok(range.top>=0&&range.bottom<=1&&range.bottom>range.top+.09,name);
 }
});
test('overlay loads before RPG bootstrap and contains no caption',()=>{
 assert.ok(html.indexOf('/rpg_hana_outfit_chime.js')<html.indexOf('/rpg_character_bootstrap.js'));
 assert.match(overlay,/aria-hidden/);
 assert.match(overlay,/setTimeout/);
 assert.doesNotMatch(overlay,/textContent\s*=/);
});
test('location entry reuses existing Hana portrait and skips events',()=>{
 assert.match(runtime,/HanaOutfitChime\.onEntry/);
 assert.match(runtime,/const portrait=hanaOverworldPortrait\(null\)/);
 assert.match(runtime,/currentPeople\(\)\.includes\('hana'\)/);
 assert.match(runtime,/!!state\.mandatoryEventState\?\.active/);
 assert.match(runtime,/hanaEncounterKey='entry:'/);
});
