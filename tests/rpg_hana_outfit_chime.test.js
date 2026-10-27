'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const focus=JSON.parse(fs.readFileSync('rpg-assets/characters/hana/overworld-variants/chime-focus.json','utf8'));
const variants=JSON.parse(fs.readFileSync('rpg-assets/characters/hana/overworld-variants/variants.json','utf8'));
const html=fs.readFileSync('rpg.html','utf8');
const runtime=fs.readFileSync('rpg.js','utf8');
const overlay=fs.readFileSync('rpg_outfit_chime.js','utf8');
const shared=JSON.parse(fs.readFileSync('rpg-assets/outfit-chime-focus.json','utf8'));
test('every Hana variant has an outfit focus window within image bounds',()=>{
 assert.equal(focus.durationMs,3000);
 for(const item of variants.variants){
  const name=item.path.split('/').pop(),range=focus.variants[name];
  assert.ok(range,'missing focus: '+name);
  assert.ok(range.top>=0&&range.bottom<=1&&range.bottom>range.top+.09,name);
 }
});
test('overlay loads before RPG bootstrap and contains no caption',()=>{
 assert.ok(html.indexOf('/rpg_outfit_chime.js')<html.indexOf('/rpg_character_bootstrap.js'));
 assert.match(overlay,/aria-hidden/);
 assert.match(overlay,/setTimeout/);
 assert.doesNotMatch(overlay,/overlay\.textContent\s*=/);
});
test('location entry reuses existing Hana portrait and skips events',()=>{
 assert.match(runtime,/NeoOutfitChime\.onEntry/);
 assert.match(runtime,/scenePortraitSource\(id,'neutral',null\)/);
 assert.match(runtime,/currentPeople\(\)\.filter/);
 assert.match(runtime,/!!state\.mandatoryEventState\?\.active/);
 assert.match(runtime,/hanaEncounterKey='entry:'/);
});

test('Akari and Barb portrait variants have focus coordinates',()=>{
 for(const [id,n] of [['akari',5],['barb',10]]){
  for(let i=1;i<=n;i++){
   const filename='special-day-'+i+'.png';
   assert.ok(fs.existsSync('rpg-assets/characters/'+id+'/portraits/'+filename));
   const focus=shared.characters[id].variants[filename];
   assert.ok(focus&&focus.top>=0&&focus.bottom<=1&&focus.bottom>focus.top);
  }
 }
 assert.match(runtime,/Object\.hasOwn\(SPECIAL_LOOKS,id\)/);
});
