'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const bootstrap=fs.readFileSync(path.join(root,'rpg_character_bootstrap.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'scripts/cloudflare-pages-build.js'),'utf8');
test('Cloudflare Pages static roster is an entitlement-filtered artifact',()=>{
 assert.match(builder,/filterPacks\(generatedPacks\.packs, ''\)/);
 assert.match(builder,/rpg-character-packs\.public\.json/);
 assert.match(builder,/publicScripts\.delete\('rpg_character_packs\.generated\.js'\)/);
});
test('bootstrap prefers server-verified API and safely falls back on static 404',()=>{
 assert.ok(bootstrap.indexOf("timedFetch('/api/rpg/character-packs'")<bootstrap.indexOf("timedFetch('/rpg-character-packs.public.json'"));
 assert.match(bootstrap,/response\.status!==404&&response\.status!==405/);
 assert.match(bootstrap,/Array\.isArray\(data\?\.packs\)/);
 assert.doesNotMatch(bootstrap,/fetch\('\/rpg_character_packs\.generated\.js'/);
});
test('both RPG entry points refresh roster bootstrap cache',()=>{
 for(const name of ['rpg.html','rpg-overworld.html']){
  const html=fs.readFileSync(path.join(root,name),'utf8');
  assert.match(html,/rpg_character_bootstrap\.js\?v=auth-recovery-20261101/);
 }
});
