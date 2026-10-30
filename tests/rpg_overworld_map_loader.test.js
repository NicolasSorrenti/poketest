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
 assert.match(page,/overworld\/prototype\.js\?v=all-seven-locations-20261029/);
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
 assert.match(code,/const pin=!layoutDev/);
 assert.match(code,/b\.classList\.add\('neo-hotspot-pin'\)/);
 assert.match(code,/width:'56px',height:'56px'/);
 assert.match(css,/\.hotspot\.neo-hotspot-pin/);
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/neo-overworld-layout-editor/);
});

test('all seven production locations use identical small visible landmark tap targets',()=>{
 const vm=require('node:vm');const context={window:{}};vm.runInNewContext(manifest,context);
 for(const loc of ['arcade','shop','home','park','cafe','center','library']){
  const map=context.window.NeoOverworld[loc];
  assert.ok(map&&map.image&&map.hotspots.length>0,loc+' missing playable hotspots');
  const ids=new Set();
  for(const h of map.hotspots){
   assert.ok(!ids.has(h.id),loc+' duplicate hotspot '+h.id);ids.add(h.id);
   assert.ok(h.w>0&&h.h>0,loc+' invalid hotspot dimensions');
  }
 }
 assert.match(code,/const pin=!layoutDev/);
 assert.match(code,/Object.assign\(h,rect\)/);
 assert.match(code,/width:'56px',height:'56px'/);
});

test('six artwork-aligned hotspot layouts are bounded with known interactable IDs',()=>{
 const vm=require('node:vm');const ctx={window:{}};vm.runInNewContext(manifest,ctx);
 const expected={
  home:['desk','bed','wardrobe','window'],
  park:['waterfront','benches','flyer-board','garden'],
  cafe:['counter','strategy-tables','window-seats','coffee-station'],
  center:['tournament','duel','registration','practice'],
  library:['study','books','reading','archives'],
  shop:['shelves','counter','tables','lounge']
 };
 for(const [id,hotspotIds] of Object.entries(expected)){
  const m=ctx.window.NeoOverworld[id];
  assert.equal(m.width,1550,id+' image width');
  assert.equal(m.height,1120,id+' image height');
  assert.deepEqual(Array.from(m.hotspots,h=>h.id),hotspotIds,id+' action ID compatibility');
  for(const h of m.hotspots)assert.ok(h.x>=0&&h.y>=0&&h.w>=40&&h.h>=40&&h.x+h.w<=m.width&&h.y+h.h<=m.height,id+' invalid region '+h.id);
 }
 const home=ctx.window.NeoOverworld.home.hotspots;
 assert.ok(home.find(h=>h.id==='bed').x<home.find(h=>h.id==='desk').x,'home bed left of desk on artwork');
 assert.ok(ctx.window.NeoOverworld.park.hotspots.find(h=>h.id==='flyer-board').y>650,'park noticeboard on lower path');
});
