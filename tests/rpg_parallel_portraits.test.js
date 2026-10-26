'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const packs=require('../rpg_character_packs.generated'),OUTFITS=require('../rpg_outfits'),reactions=require('../rpg_match_reactions');
const source=fs.readFileSync('rpg.js','utf8');
const body=source.slice(source.indexOf('function portraitPaths('),source.indexOf('\nfunction scenePortraitSource('));
const ids=['akari','camila','kaede','marina','reina','shiori','yuna','iris','jun','nereo','teo','hana','rina','sierra','sol','jinx','luna'];
const cast=Object.fromEntries(ids.map(id=>[id,{portrait:'/rpg-assets/'+id+'.png'}]));
const portrait=vm.runInNewContext('('+body+')',{cast,activeOutfitSceneId:null,OUTFITS,state:{},window:{NeoRpgCharacterPacks:packs},expressionGuests:new Set(),solExpressions:{}});
const base=id=>'/rpg-assets/characters/'+id+'/expression-portraits/';
test('reviewed scene slots reach installed art and unknown states use canonical fallback',()=>{
 for(const id of ids){
  const pair=['akari','camila','kaede','marina'].includes(id)?['happy','soft']:['neutral','happy','surprised'];
  for(const name of pair){
   const paths=Array.from(portrait(id,name));assert.equal(paths[0],base(id)+name+'.webp',id+': '+name);
   assert.ok(fs.existsSync('.'+paths[0]),paths[0]);
  }
  assert.equal(portrait(id,'unknown')[0],pair.includes('neutral')?base(id)+'neutral.webp':cast[id].portrait);
 }
});
test('wrong-identity guest emotions cannot leak through scene or battle selectors',()=>{
 for(const id of ['iris','jun','nereo','teo']){
  for(const name of ['vulnerable','irritated','determined'])assert.equal(portrait(id,name)[0],base(id)+'neutral.webp');
  for(const kind of ['default','attack','play_card','evolve','power','hurt','big_hit','weakness_hit','status_hit','ko_taken','ko_scored']){
   const path=reactions.assetFor({},id,kind);assert.ok(path.startsWith(base(id)),path);assert.ok(fs.existsSync('.'+path));
  }
 }
});
test('reviewed battle pairs are visible while dedicated attack takes precedence',()=>{
 for(const id of ['hana','reina','shiori','yuna','iris','jun','nereo','teo']){
  assert.equal(reactions.assetFor({},id,'play_card'),base(id)+'happy.webp');
  assert.equal(reactions.assetFor({},id,'hurt'),base(id)+'surprised.webp');
  const attack='/rpg-assets/reactions/'+id+'/attack.png';
  assert.equal(reactions.assetFor({characters:{[id]:{attack}}},id,'attack'),attack);
 }
 assert.equal(portrait('hana','vulnerable')[0],base('hana')+'soft.webp');
 assert.equal(portrait('hana','irritated')[0],base('hana')+'concerned.webp');
});
test('source and generated pack expressions agree and all files exist',()=>{
 for(const id of ['rina','sierra','sol','jinx','luna']){
  const manifest=JSON.parse(fs.readFileSync('characters/'+id+'/art_manifest.json'));
  assert.deepEqual(packs.byId(id).art.expressions,manifest.expressions);
  for(const path of Object.values(manifest.expressions))assert.ok(fs.existsSync('.'+path),path);
 }
});

test('Barb repair uses exact original PNG bytes in scene and battle routes',()=>{
 const manifest=JSON.parse(fs.readFileSync('characters/barb/art_manifest.json'));
 const art=packs.byId('barb').art;
 for(const name of ['concerned','soft']){
  const path='/rpg-assets/characters/barb/expression-portraits/'+name+'.png';
  assert.equal(OUTFITS.sources(art,{},name)[0],path);
  assert.equal(manifest.expressions[name],path);
  assert.deepEqual(fs.readFileSync('.'+path),fs.readFileSync('art-production/pr140-parallel/barb-repair/'+name+'.png'));
 }
 assert.equal(reactions.assetFor({},'barb','hurt'),manifest.expressions.concerned);
 assert.equal(reactions.assetFor({},'barb','ko_taken'),manifest.expressions.soft);
});
