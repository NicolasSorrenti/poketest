'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const PAGES=require('../rpg_overworld_text_pages');
const source=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const game=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const page=fs.readFileSync(path.join(root,'rpg-overworld.html'),'utf8');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const measure=s=>Array.from(s).length;

test('two desktop lines per page without truncating authored text',()=>{
 const text='Reina wants to tell you about her tournament hopes and plans for the next challenge.';
 const pages=PAGES.split(text,15,2,measure);
 assert.ok(pages.length>1);
 for(const p of pages) {
  assert.ok(p.split('\n').length<=2,p);
  for(const line of p.split('\n'))assert.ok(measure(line)<=15,line);
 }
 assert.equal(pages.join(' ').replace(/\n/g,' ').replace(/\s+/g,' '),text);
});
test('three mobile lines per page and very long unbroken tokens stay readable',()=>{
 const text='supercalifragilisticexpialidocious then one two three four five six';
 const pages=PAGES.split(text,10,3,measure);
 assert.ok(pages.length>=2);
 for(const p of pages){
  assert.ok(p.split('\n').length<=3);
  for(const line of p.split('\n'))assert.ok(measure(line)<=10,line);
 }
 assert.equal(pages.join('').replace(/\n/g,'').replace(/\s/g,''),text.replace(/\s/g,''));
});
test('changing screen width changes pagination without advancing the story state',()=>{
 const text='A friend talks for a long time about tomorrow and the important match coming up soon.';
 const desktop=PAGES.split(text,30,2,measure);
 const mobile=PAGES.split(text,12,3,measure);
 assert.notDeepEqual(desktop,mobile);
 assert.ok(desktop.every(p=>p.split('\n').length<=2));
 assert.ok(mobile.every(p=>p.split('\n').length<=3));
 assert.match(source,/pageIndex\+\+;syncDialoguePages\(false\)/);
 assert.match(source,/neo-ow-paging #neoOverworldStoryDock #choices/);
 assert.match(source,/stopImmediatePropagation\(\)/);
 assert.doesNotMatch(source,/pageContinue\.onclick=[^;]*act\(/);
});
test('the dedicated Overworld keeps the clicked character until Back to map',()=>{
 assert.match(source,/interactionFocus=message\.id/);
 assert.match(source,/const idleFocus=!data\.storyActive/);
 assert.match(source,/syncPortraits\(hasCG,idleFocus\)/);
 assert.match(source,/neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not\(\[hidden\]\)/);
 assert.match(source,/interactionFocus=null;bridge\(\)\?\.clearInteraction\?\.\(\);hideStory/);
 assert.match(game,/clearInteraction\(\)\{if\(overworldControlsLocked\(\)\)return false;state\.selected=null;persist\(\);render\(\);return true;/);
 assert.match(game,/portrait\(id\)\{return cast\[id\]/);
});
test('only the Overworld page loads the dialog pager; static server serves it',()=>{
 assert.match(page,/rpg_overworld_text_pages\.js\?v=20261029-measured-pages-v1/);
 assert.match(page,/rpg-overworld-integration\.js\?v=20261029-portrait-flush-2/);
 assert.match(server,/publicScripts\.add\('rpg_overworld_text_pages\.js'\)/);
 const original=fs.readFileSync(path.join(root,'rpg.html'),'utf8');
 assert.doesNotMatch(original,/rpg_overworld_text_pages\.js/);
});
