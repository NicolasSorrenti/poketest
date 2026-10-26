'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const packs=require('../rpg_character_packs.generated'),OUTFITS=require('../rpg_outfits');
const art=packs.byId('laca').art,base='/rpg-assets/characters/laca/';
const source=fs.readFileSync('rpg.js','utf8');
const body=source.slice(source.indexOf('function portraitPaths('),source.indexOf('\nfunction scenePortraitSource('));
const state={location:'shop',slot:1,day:1};
const portrait=vm.runInNewContext('('+body+')',{cast:{laca:{portrait:'/rpg-assets/laca.png'}},activeOutfitSceneId:null,OUTFITS,state,window:{NeoRpgCharacterPacks:packs},expressionGuests:new Set(['laca'])});
test('five exact native candidates reach scene resolver without changing outfit selection',()=>{
 for(const emotion of ['embarrassed','angry','flirty'])assert.equal(portrait('laca',emotion)[0],base+'outfits/casual/'+emotion+'.png');
 for(const emotion of ['happy','concerned','vulnerable','sad']){
  const expected=base+'outfits/lifeguard/'+(emotion==='happy'?'happy':'concerned')+'.png';
  for(const sceneId of Object.keys(art.outfits.sceneOverrides))assert.equal(portrait('laca',emotion,sceneId)[0],expected);
  state.location='park';state.slot=0;assert.equal(portrait('laca',emotion)[0],expected);
  state.slot=1;assert.equal(portrait('laca',emotion)[0],expected);
 }
 state.location='shop';state.slot=1;
 assert.equal(portrait('laca','happy')[0],art.outfits.variants.casual.expressions.happy);
 assert.deepEqual(art,JSON.parse(fs.readFileSync('characters/laca/art_manifest.json')));
});
test('installed candidates retain source hashes, alpha and native dimensions',()=>{
 const records=JSON.parse(fs.readFileSync('art-production/pr140-laca-five/inventory.json')).files;
 for(const [slot,filename] of Object.entries({'casual-embarrassed':'original.png','casual-angry':'attempt-01-original.png','casual-flirty':'casual-flirty-original.png','lifeguard-happy':'original.png','lifeguard-concerned':'attempt-01-original.png'})){
  const [outfit,emotion]=slot.split('-'),path='rpg-assets/characters/laca/outfits/'+outfit+'/'+emotion+'.png';
  const bytes=fs.readFileSync(path),original=fs.readFileSync('art-production/pr140-laca-five/candidates/'+slot+'/'+filename);
  assert.deepEqual(bytes,original);
  const entry=records.find(r=>r.path===path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],entry.dimensions);assert.equal(bytes[25],6);assert.deepEqual(entry.alpha_extrema,[0,255]);
 }
});
