'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const reactions=require('../rpg_match_reactions'),gallery=require('../rpg_cg_gallery');
const source=fs.readFileSync(require.resolve('../rpg.js'),'utf8');
const body=source.slice(source.indexOf('function portraitPaths('),source.indexOf('\nfunction scenePortraitSource('));
const portrait=vm.runInNewContext('('+body+')',{activeOutfitSceneId:null});
const base='/rpg-assets/characters/alma/expression-portraits/';
test('Alma scene expressions stay in the canonical female cafe set',()=>{
 for(const expression of ['neutral','happy','soft','concerned','surprised','vulnerable','irritated','determined','unknown']){
  const name=['neutral','happy','soft','concerned','surprised'].includes(expression)?expression:'neutral';
  assert.deepEqual(Array.from(portrait('alma',expression)),[base+name+'.webp','/rpg-assets/alma.png']);
  assert.ok(fs.existsSync('.'+base+name+'.webp'));
 }
});
test('Alma battle reactions and gallery avoid incompatible guest and suit art',()=>{
 for(const kind of ['default','play_card','evolve','power','hurt','big_hit','weakness_hit','status_hit','ko_taken','ko_scored']){
  const expected=['play_card','evolve','power','ko_scored'].includes(kind)?'happy':
   ['hurt','big_hit','weakness_hit'].includes(kind)?'surprised':
   ['status_hit','ko_taken'].includes(kind)?'concerned':'neutral';
  assert.equal(reactions.assetFor({},'alma',kind),base+expected+'.webp');
 }
 assert.equal(gallery.artCandidates({character:'alma',path:'/rpg-assets/missing.webp'}).at(-1).path,base+'neutral.webp');
 assert.equal(reactions.assetFor({},'alma','attack'),base+'happy.webp');
 const attack='/rpg-assets/reactions/alma/attack.png';
 assert.equal(reactions.assetFor({characters:{alma:{attack}}},'alma','attack'),attack);
});
