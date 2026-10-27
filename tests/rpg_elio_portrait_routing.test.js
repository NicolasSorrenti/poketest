'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const neutral='/rpg-assets/elio.png';
const portrait=name=>'/rpg-assets/characters/elio/expression-portraits/'+name+'.png';

// Execute the real scene resolver declarations without bootstrapping the RPG UI.
const sceneSource=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const start=sceneSource.indexOf('function portraitPaths(');
const end=sceneSource.indexOf('function dialogueExpression(',start);
assert.ok(start>=0&&end>start);
const failedScenePortraits=new Set();
const scene=vm.createContext({activeOutfitSceneId:null,failedScenePortraits,state:{day:1},
 cast:{elio:{portrait:'/rpg-assets/characters/hana/neutral.webp'}},
 OUTFITS:{sources(){throw Error('Elio must bypass legacy outfit routing');}}});
vm.runInContext(sceneSource.slice(start,end),scene);
// Expose private candidate/framing helpers in the test VM only.
const battleSource=fs.readFileSync(path.join(root,'rpg_match_reactions.js'),'utf8');
const exportMarker='return {createDirector,makeExperience,assetFor,';
assert.ok(battleSource.includes(exportMarker));
const battle=vm.createContext({module:{exports:{}}});
vm.runInContext(battleSource.replace(exportMarker,
 'return {assetCandidates,artClass,createDirector,makeExperience,assetFor,'),battle);
const reactions=battle.module.exports;
const paths=(...args)=>Array.from(reactions.assetCandidates(...args));

test('scene uses only approved Elio expressions and canonical neutral',()=>{
 for(const [emotion,name] of [['happy','happy'],['smile','happy'],['surprised','surprised'],['soft','soft'],['vulnerable','soft'],['concerned','concerned'],['worried','concerned'],['irritated','concerned']]){
  assert.deepEqual(Array.from(scene.portraitPaths('elio',emotion)),[portrait(name),neutral]);
 }
 for(const emotion of ['neutral','determined','angry','unknown']){
  assert.deepEqual(Array.from(scene.portraitPaths('elio',emotion)),[neutral],emotion);
 }
 assert.equal(scene.scenePortraitSource('elio'),neutral);
});
test('scene missing expression falls back to canonical neutral',()=>{
 for(const name of ['happy','surprised','soft','concerned']){
  failedScenePortraits.clear();
  assert.equal(scene.scenePortraitSource('elio',name),portrait(name));
  failedScenePortraits.add(portrait(name));
  assert.equal(scene.scenePortraitSource('elio',name),neutral);
 }
 failedScenePortraits.clear();
});
test('battle routes approved expressions without legacy or female fallback candidates',()=>{
 const manifest={characters:{elio:{default:'/rpg-assets/characters/hana/neutral.webp',
  hurt:'/rpg-assets/characters/elio/vn-expressions/vulnerable.webp',
  match_cutin:'/rpg-assets/characters/elio/vn-expressions/happy.webp'}}};
 for(const kind of ['play_card','evolve','power','ko_scored']){
  assert.deepEqual(paths(manifest,'elio',kind),[portrait('happy'),neutral]);
 }
 for(const kind of ['hurt','big_hit','weakness_hit']){
  assert.deepEqual(paths(manifest,'elio',kind),[portrait('surprised'),neutral]);
 }
 for(const kind of ['default','attack','worried','soft','unknown']){
  assert.deepEqual(paths(manifest,'elio',kind),[neutral],kind);
 }
});
test('dedicated Elio attack leads and retains canonical fallback; invalid art is rejected',()=>{
 for(const extension of ['png','webp']){
  const attack='/rpg-assets/reactions/elio/attack.'+extension;
  const manifest={characters:{elio:{attack}}};
  assert.equal(reactions.assetFor(manifest,'elio','attack'),attack);
  assert.deepEqual(paths(manifest,'elio','attack'),[attack,neutral]);
 }
 for(const attack of ['/rpg-assets/reactions/hana/attack.png','https://host.test/elio.png']){
  assert.deepEqual(paths({characters:{elio:{attack}}},'elio','attack'),[neutral]);
 }
});
test('PNG and WebP expressions receive expression framing; attack retains wide framing',()=>{
 for(const folder of ['expression-portraits','vn-expressions']){
  for(const extension of ['png','webp'])assert.equal(
   reactions.artClass('/rpg-assets/characters/elio/'+folder+'/happy.'+extension),' has-vn-expression');
 }
 assert.equal(reactions.artClass(neutral),'');
 assert.equal(reactions.artClass('/rpg-assets/reactions/elio/attack.png'),' has-wide-action-art');
});

 test("stage selector retains approved Elio PNG and canonical fallback",()=>{
 const stageStart=sceneSource.indexOf("function personaCStageCandidates(");
 const stageEnd=sceneSource.indexOf("// Daily overworld-only",stageStart);
 vm.runInContext(sceneSource.slice(stageStart,stageEnd),scene);
 for(const emotion of ["happy","surprised","neutral"]){const expected=Array.from(scene.portraitPaths("elio",emotion));assert.deepEqual(Array.from(scene.personaCStageCandidates("elio",emotion,expected)),expected);}
 });


test("battle concern uses reviewed portrait",()=>{for(const kind of ["status_hit","ko_taken"])assert.deepEqual(paths({},"elio",kind),[portrait("concerned"),neutral]);});
