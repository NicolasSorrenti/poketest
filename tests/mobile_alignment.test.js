'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'duel_mobile_alignment.css'),'utf8');

test('mobile centering override never changes desktop styles',()=>{
 assert.match(css,/^\/\*[\s\S]*?\*\/\s*@media\s*\(max-width:\s*780px\)/);
 assert.doesNotMatch(css,/@media\s*\(min-width:/);
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
});

test('the base mobile alignment keeps both Active slots centered',()=>{
 assert.match(css,/\.opponent-territory\s+\.active-zone\s+\.pokemon-strip\s*\{/);
 assert.match(css,/\.active-with-attacks\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\)\s+minmax\(0,clamp\(/);
 assert.match(css,/#myActive\s*\{[^}]*grid-column:2!important/);
 assert.match(css,/#fieldAttackDock\s*\{[^}]*grid-column:3!important/);
 assert.doesNotMatch(css,/pointer-events:\s*none!important/,'real Active and Bench targets stay clickable');
});

test('five Bench slots stay centered even when empty',()=>{
 assert.equal((css.match(/%3Crect x=/g)||[]).length,5,'draw exactly five positions');
 assert.match(css,/\.bench-zone\s+\.pokemon-strip\s*\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
 assert.match(css,/\.bench-zone\s+\.pokemon-strip\s*\{[^}]*margin-left:auto!important/);
 assert.match(css,/\.bench-zone\s+\.pokemon-strip\s*>\s*\.empty\s*\{[^}]*background:transparent!important/);
});

test('Classic, RPG, Cube, and online duel pages load mobile polish after alignment',()=>{
 for(const file of ['classic_live.html','online.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const links=[...html.matchAll(/<link\s+[^>]*rel="stylesheet"[^>]*>/g)].map(m=>m[0]);
  const last=links.at(-1);
  assert.match(last,/href="duel_mobile_alignment\.css\?v=1"/,file+' loads override last');
  assert.match(last,/media="\(max-width: 780px\)"/,file+' keeps desktop untouched');
  for(const id of ['myActive','enemyActive','myBench','enemyBench','fieldAttackDock','attackPanel']){
   assert.ok(html.includes('id="'+id+'"'),file+' retains interactive '+id);
  }
 }
});


test('mobile cards have no opaque backing and normal Prizes use compact counters',()=>{
 const polish=fs.readFileSync(path.join(root,'duel_mobile_polish.css'),'utf8');
 assert.match(polish,/^\\/\\*[\\s\\S]*?\\*\\/\\s*@media\\s*\\(max-width:\\s*780px\\)/);
 assert.doesNotMatch(polish,/@media\\s*\\(min-width:/);
 assert.match(polish,/\\.poke \\.pokemon-face\\s*\\{[^}]*background:transparent!important/);
 assert.match(polish,/\\.prize-group:not\\(\\.prize-awaiting\\):not\\(:has\\(\\.prize-face-up\\)\\) \\.prize-back:not\\(:first-child\\)\\s*\\{[^}]*display:none!important/);
 assert.match(polish,/\\.prize-group\\.prize-awaiting[\\s\\S]*?\\.prize-select\\s*\\{[^}]*pointer-events:auto!important/);
});
test('the hand always stays visible; mobile attack dock is distinct from desktop field',()=>{
 for(const [page,client] of [['classic_live.html','classic_live.js'],['online.html','online.js']]){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const js=fs.readFileSync(path.join(root,client),'utf8');
  assert.ok(!html.includes('id="handToggle"'),page+' has no Hide Hand button');
  assert.ok(html.includes('id="mobileAttackDock"'),page+' keeps mobile attack dock');
  assert.ok(html.includes('id="handFan"'),page+' has visible hand fan');
  assert.ok(!js.includes("setHandVisible(false)"),client+' never closes the hand');
  assert.ok(!js.includes("getElementById('handToggle')"),client+' does not require removed button');
 }
 const polish=fs.readFileSync(path.join(root,'duel_mobile_polish.css'),'utf8');
 assert.match(polish,/#mobileAttackDock\\s*\\{[^}]*display:block!important/);
 assert.match(polish,/#fieldAttackDock\\s*\\{[^}]*display:none!important/);
});
