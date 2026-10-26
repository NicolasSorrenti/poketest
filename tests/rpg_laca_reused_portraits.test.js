'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto');
const packs=require('../rpg_character_packs.generated'),outfits=require('../rpg_outfits');
const art=packs.byId('laca').art,base='/rpg-assets/characters/laca/';
test('Laca casual routes use the compatible full-body expressions',()=>{
 const expressions={neutral:'outfits/casual/neutral.webp',happy:'expression-portraits/happy.webp',surprised:'expression-portraits/surprised.webp',vulnerable:'expression-portraits/concerned.webp',sad:'expression-portraits/concerned.webp'};
 for(const [emotion,relative] of Object.entries(expressions))
  assert.equal(outfits.sources(art,{location:'shop',slot:1,day:1},emotion)[0],base+relative);
 assert.equal(outfits.sources(art,{sceneId:'laca_route_1'},'neutral')[0],base+'outfits/lifeguard/neutral.webp');
 // Workwear stays in its own route; casual artwork must never replace it.
 assert.match(outfits.sources(art,{sceneId:'laca_route_1'},'happy')[0],/outfits\/lifeguard\//);
});
test('Archived Laca expression bytes remain identical to reused installed artwork',()=>{
 for(const emotion of ['happy','surprised','concerned']){
  const live=fs.readFileSync('.'+base+'expression-portraits/'+emotion+'.webp');
  const archived=fs.readFileSync('rpg-assets/rejected-artwork/expressions-v1/laca/'+emotion+'.webp');
  assert.equal(crypto.createHash('sha256').update(live).digest('hex'),crypto.createHash('sha256').update(archived).digest('hex'));
 }
});
