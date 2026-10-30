'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const world=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const images={
 iris:'rpg-assets/characters/iris/dialogue/neutral.png',
 alma:'rpg-assets/characters/alma/overworld/standing-front.png',
 barb:'rpg-assets/characters/barb/portraits/primary.png',
 elena:'rpg-assets/characters/elena/overworld/standing-portfolio.png'
};
test('approved masters are existing binary files; Iris copy is unmodified',()=>{
 for(const [id,p] of Object.entries(images)){
  assert.ok(fs.existsSync(path.join(root,p)),id+' master source missing: '+p);
  assert.match(rpg,new RegExp(id+":'\\/rpg-assets\\/characters\\/"));
 }
 assert.deepEqual(fs.readFileSync(path.join(root,images.iris)),
  fs.readFileSync(path.join(root,'rpg-assets/characters/iris/overworld/standing-front.png')));
});
test('portrait selector only uses masters for neutral expression and keeps day-locked variants',()=>{
 assert.doesNotThrow(()=>new vm.Script(rpg,{filename:'rpg.js'}));
 assert.match(rpg,/return expression==='neutral'\?APPROVED_DIALOGUE_MASTERS\[id\]\|\|null:null;/);
 assert.match(rpg,/return alternate\?\[alternate,\.\.\.dialogue\.filter\(path=>path!==alternate\)\]:dialogue;/);
 assert.match(rpg,/const dialogue=master\?\[master,\.\.\.normal\.filter\(path=>path!==master\)\]:normal;/);
 assert.match(rpg,/approvedMaster\?\[\.06,0,\.88,\.47\]/);
 assert.match(rpg,/const sources=srcs\?\.length\?srcs:/);
});
test('standalone crop is active only when image actually loads the approved file',()=>{
 assert.doesNotThrow(()=>new vm.Script(world,{filename:'rpg-overworld-integration.js'}));
 for(const p of Object.values(images))assert.ok(world.includes('/'+p),'missing source guard for '+p);
 assert.match(world,/person\.classList\.toggle\('neo-ow-dialogue-front-master',isApprovedMaster\)/);
 assert.match(world,/person\.classList\.remove\('neo-ow-dialogue-front-master'\)/);
 assert.match(world,/#neoOverworldStoryDock #scene:has\(#rpgSceneCG:not\(\[hidden\]\)\) #neoOverworldScenePeople\{display:none!important\}/);
});
