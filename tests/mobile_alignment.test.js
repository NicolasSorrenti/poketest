'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const alignment=file('duel_mobile_alignment.css');
const polish=file('duel_mobile_polish.css');

test('base alignment and final polish are mobile-only',()=>{
 for(const css of [alignment,polish]){
  assert.match(css,/^\/\*[\s\S]*?\*\/\s*@media\s*\(max-width:\s*780px\)/);
  assert.doesNotMatch(css,/@media\s*\(min-width:/);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
 }
});

test('base alignment centers the Active and five Bench positions',()=>{
 assert.match(alignment,/\.opponent-territory\s+\.active-zone\s+\.pokemon-strip\s*\{/);
 assert.match(alignment,/#myActive\s*\{[^}]*grid-column:2!important/);
 assert.equal((alignment.match(/%3Crect x=/g)||[]).length,5);
 assert.match(alignment,/\.bench-zone\s+\.pokemon-strip\s*\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
});

test('mobile polish removes navy card backing and uses compact Prize counters',()=>{
 assert.match(polish,/\.poke \.pokemon-face\s*\{[^}]*background:transparent!important/);
 assert.ok(polish.includes('.prize-group:not(.prize-awaiting):not(:has(.prize-face-up)) .prize-back:not(:first-child)'));
 assert.match(polish,/\.prize-group\.prize-awaiting \.prize-select\s*\{[^}]*pointer-events:auto!important/);
 assert.ok(polish.includes('.prize-group:has(.prize-face-up) .prize-back'));
});

test('only mobile uses attack strip; the hand cannot be hidden',()=>{
 assert.match(polish,/#mobileAttackDock\s*\{[^}]*display:block!important/);
 assert.match(polish,/#fieldAttackDock\s*\{[^}]*display:none!important/);
 for(const [page,client] of [['classic_live.html','classic_live.js'],['online.html','online.js']]){
  const html=file(page),js=file(client);
  assert.ok(!html.includes('id="handToggle"'),page+' hides no hand');
  assert.ok(html.includes('id="mobileAttackDock"'),page+' has attack dock');
  assert.ok(html.includes('id="handFan"'),page+' retains hand fan');
  assert.ok(!js.includes("setHandVisible(false)"),client+' never collapses hand');
  assert.ok(!js.includes("$('handToggle')"),client+' does not bind removed control');
 }
});

test('Classic and online load mobile polish after mobile alignment',()=>{
 for(const page of ['classic_live.html','online.html']){
  const html=file(page);
  const links=[...html.matchAll(/<link\s+[^>]*rel="stylesheet"[^>]*>/g)].map(m=>m[0]);
  const mobilePolish=links.find(link=>/href="duel_mobile_polish\.css\?v=\d+"/.test(link));
  assert.ok(mobilePolish,page+' includes the mobile polish stylesheet');
  assert.match(mobilePolish,/media="\(max-width: 780px\)"/);
  assert.ok(html.indexOf('duel_mobile_alignment.css?v=1')<html.indexOf('duel_mobile_polish.css?v='));
  for(const id of ['myActive','enemyActive','myBench','enemyBench','fieldAttackDock','mobileAttackDock','attackPanel']){
   assert.ok(html.includes('id="'+id+'"'),page+' retains '+id);
  }
 }
});
