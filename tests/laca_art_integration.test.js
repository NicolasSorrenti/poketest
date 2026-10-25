'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const packs=require('../rpg_character_packs.generated.js');
const outfits=require('../rpg_outfits.js');
const preduel=require('../rpg_preduel.js');

const root=path.join(__dirname,'..');
const pngInfo=file=>{
 const b=fs.readFileSync(path.join(root,file));
 assert.equal(b.readUInt32BE(0),0x89504e47,'PNG signature: '+file);
 return {width:b.readUInt32BE(16),height:b.readUInt32BE(20),colorType:b[25]};
};
const laca=packs.byId('laca');
const art=laca?.art;

test('Laca has eight approved expressions per outfit',()=>{
 const names=['neutral','happy','flirty','embarrassed','angry','surprised','sad','inviting'];
 for(const outfit of ['casual','lifeguard']){
  const variant=art.outfits.variants[outfit];
  for(const name of names)assert.ok(variant.expressions[name],outfit+': '+name);
  for(const name of names){
   const rel=variant.expressions[name].replace(/^\//,'');
   assert.ok(fs.existsSync(path.join(root,rel)),rel);
   const info=pngInfo(rel);
   assert.deepEqual([info.width,info.height],[768,1024]);
   assert.equal(info.colorType,6,'portrait must retain alpha: '+rel);
  }
 }
});

test('Laca outfit selection preserves story overrides and work context',()=>{
 assert.equal(outfits.select(art.outfits,{sceneId:'laca_route_1'}).key,'lifeguard');
 assert.equal(outfits.select(art.outfits,{location:'park',slot:0,day:1}).key,'lifeguard');
 assert.equal(outfits.select(art.outfits,{location:'shop',slot:1,day:1}).key,'casual');
});

test('Laca square booster art is installed and selected before legacy fallbacks',()=>{
 for(const outfit of ['casual','lifeguard']){
  const rel=art.boosterArt[outfit].replace(/^\//,'');
  assert.ok(fs.existsSync(path.join(root,rel)),rel);
  const info=pngInfo(rel);
  assert.deepEqual([info.width,info.height],[1024,1024]);
 }
 assert.equal(preduel.boosterArtCandidates('laca','casual')[0],art.boosterArt.casual);
 assert.equal(preduel.boosterArtCandidates('laca','lifeguard')[0],art.boosterArt.lifeguard);
});

test('No dedicated Laca battle reactions are claimed when none are installed',()=>{
 const reactionDir=path.join(root,'rpg-assets','reactions','laca');
 assert.equal(fs.existsSync(reactionDir),false);
});
