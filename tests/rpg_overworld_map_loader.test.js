'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'overworld/prototype.js'),'utf8');
const page=fs.readFileSync(path.join(root,'overworld-prototype.html'),'utf8');
const manifest=fs.readFileSync(path.join(root,'overworld/manifest.js'),'utf8');
test('installed overworld maps are loaded from canonical location folders',()=>{
 assert.match(code,/canonicalBase='\/rpg-assets\/locations\/'\+map\.id\+'\/overworld-map'/);
 assert.match(code,/canonicalBase\+'\.webp'/);
 assert.match(code,/canonicalBase\+'\.png'/);
 assert.match(code,/canonicalBase\+'\.jpg'/);
});
test('blueprint remains safe fallback if all installed map formats fail',()=>{
 assert.match(code,/map\.blueprint\?/);
 assert.match(code,/map\.image\]/);
 assert.match(code,/candidateIndex\+1<candidates\.length/);
 assert.match(code,/setMapSource\(candidateIndex\+1\)/);
 assert.match(code,/neo-overworld-missing-map/);
 assert.match(code,/map\.image\]/);
});
test('Pixel Palace preserved and all six user-uploaded location maps selected',()=>{
 assert.match(manifest,/rpg-assets\/locations\/arcade\/overworld-map\.webp/);
 for(const loc of ['home','park','cafe','center','library','shop'])assert.ok(manifest.includes('/rpg-assets/locations/'+loc+'/overworld-map-candidate-20261029.webp'));
 assert.match(code,/map\.blueprint\?[\s\S]*?\[map\.image\]/);
});
test('the embedded map HTML references the fixed loader',()=>{
 assert.match(page,/overworld\/prototype\.js\?v=landmark-pins-20261029/);
});

test('explicit development mode exports revised anchors and hotspots without touching RPG state',()=>{
 assert.match(code,/const layoutDev=dev&&!params.has\('rpg-integration'\)/);
 assert.match(code,/function draggable\(el,point,update\)/);
 assert.match(code,/localStorage.setItem\(layoutKey,JSON.stringify\(layout\)\)/);
 assert.match(code,/navigator.clipboard.writeText\(json\)/);
 assert.match(code,/Math.max\(24,Math.min\(h.w,map.width/);
});

test('Park and Cafe interactive hotspot IDs are descriptive and remain inside map width',()=>{
 const vm=require('node:vm');
 const ctx={window:{}};vm.runInNewContext(manifest,ctx);
 for(const location of ['park','cafe']){
  const m=ctx.window.NeoOverworld[location];
  for(const h of m.hotspots){
   assert.ok(!['a','b','c','d'].includes(h.id),'placeholder hotspot '+h.id);
   assert.ok(h.x>=0&&h.y>=0&&h.x+h.w<=m.width&&h.y+h.h<=m.height,location+' out-of-bounds '+h.label);
  }
 }
 assert.match(code,/neo-layout-resize/);
 assert.match(code,/Math\.round\(clamp\(held\.w/);
});

test('Uploaded environment artwork has explicit tap markers instead of oversized invisible regions',()=>{
 const css=fs.readFileSync(path.join(root,'overworld/prototype.css'),'utf8');
 assert.match(code,/map\.artworkStatus==='uploaded'&&!layoutDev/);
 assert.match(code,/b\.classList\.add\('neo-hotspot-pin'\)/);
 assert.match(code,/width:'56px',height:'56px'/);
 assert.match(css,/\.hotspot\.neo-hotspot-pin/);
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/neo-overworld-layout-editor/);
});
