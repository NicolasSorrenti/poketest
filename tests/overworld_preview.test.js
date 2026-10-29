'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'overworld/manifest.js'),'utf8'),context);
const {arcade,shop,characters,preview,artPreview,shopPreview}=context.window.NeoOverworld;
test('preview uses the canonical continuous Pixel Palace background and valid asset paths',()=>{
  assert.equal(arcade.id,'arcade');
  assert.deepEqual([arcade.width,arcade.height],[1550,1120]);
  for(const asset of [arcade.image,...Object.values(characters).flatMap(c=>[c.face,...Object.values(c.poses||{}).map(p=>p.src)])]){
    assert.ok(fs.existsSync(path.join(root,asset.slice(1))),asset);
  }
});
test('shop art preview uses its actual image aspect and valid candidate sprites',()=>{
  assert.ok(fs.existsSync(path.join(root,shop.image.slice(1))));
  assert.equal(shop.id,'shop');
  assert.deepEqual([shop.width,shop.height],[1475,1066]);
  for(const group of [artPreview,shopPreview])for(const p of group){
    assert.ok(characters[p.id].poses[p.pose]);
    assert.ok(shop.anchors[p.anchor]||arcade.anchors[p.anchor]);
  }
  assert.equal(shopPreview.length,2);
});
test('all normal preview characters have one placement with valid foot coordinates',()=>{
  assert.equal(new Set(preview.map(p=>p.id)).size,preview.length);
  for(const p of preview){
    assert.ok(characters[p.id]);
    const foot=p.foot||arcade.anchors[p.anchor];
    assert.ok(foot&&foot.x>0&&foot.x<arcade.width&&foot.y>0&&foot.y<arcade.height,p.id);
  }
  assert.equal(preview.filter(p=>p.id==='reina').length,1);
  assert.equal(preview.find(p=>p.id==='reina').pose,'arcade');
  assert.ok(characters.reina.poses.standing&&characters.reina.poses.arcade);
});
test('hotspots have unique IDs and stay on the image',()=>{
  assert.equal(new Set(arcade.hotspots.map(h=>h.id)).size,arcade.hotspots.length);
  for(const h of arcade.hotspots){
    assert.ok(h.x>0&&h.x<=arcade.width&&h.y>0&&h.y<=arcade.height&&h.w>0&&h.h>0,h.id);
  }
});
