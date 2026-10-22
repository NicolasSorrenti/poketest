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

test('both Active slots share a centered position and attacks stay beside yours',()=>{
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

test('Classic, RPG, Cube, and online duel pages load the override last',()=>{
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
