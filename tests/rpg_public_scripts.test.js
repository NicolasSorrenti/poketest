'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const html=fs.readFileSync(path.join(root,'rpg.html'),'utf8');
const bootstrap=fs.readFileSync(path.join(root,'rpg_character_bootstrap.js'),'utf8');
const scriptFiles=[
 ...Array.from(html.matchAll(/<script[^>]+src="\/([^"?]+\.js)(?:\?[^"]*)?"/g),m=>m[1]),
 ...Array.from(bootstrap.matchAll(/"\/([^"?]+\.js)(?:\?[^"]*)?"/g),m=>m[1])
];
test('every client RPG JS dependency exists and is permitted by static server routing',()=>{
 const publicRoute=server.slice(server.indexOf('const publicScripts=new Set'),server.indexOf('const target=path.resolve'));
 assert.ok(publicRoute.startsWith('const publicScripts=new Set'));
 for(const file of new Set(scriptFiles)){
  assert.ok(fs.existsSync(path.join(root,file)),file+' missing on disk');
  // Server allowlist is an initial set plus explicit pathname comparisons.
  assert.ok(publicRoute.includes("'"+file+"'")||publicRoute.includes("'/"+file+"'"),file+' missing from HTTP static allowlist');
 }
});
test('new RPG dependencies have explicit static routes',()=>{
 for(const file of ['rpg_error_diagnostics.js','rpg_mobile_events_v2.js','rpg_akari_barb_event.js']){
  assert.ok(server.includes("'"+file+"'"),file+' must be publicly served');
 }
 assert.ok(!server.includes("publicScripts.add('rpg_character_packs.generated.js')"));
});
