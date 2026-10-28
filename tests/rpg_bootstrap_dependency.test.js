'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');

test('browser startup loads slice scene dependencies before the slice module',()=>{
 const bootstrap=fs.readFileSync(path.join(root,'rpg_character_bootstrap.js'),'utf8');
 const read=src=>bootstrap.indexOf('"/'+src);
 assert.ok(read('rpg_relationships.js')>=0);
 assert.ok(read('rpg_akari_barb_event.js')>=0,'Akari/Barb event must be included');
 assert.ok(read('rpg_encounter_director.js')<read('rpg_akari_barb_event.js'));
 assert.ok(read('rpg_akari_barb_event.js')<read('rpg_slice_of_life.js'));
 assert.ok(read('rpg_slice_of_life.js')<read('rpg.js'));
 assert.match(bootstrap,/Missing RPG dependency/);
 assert.match(bootstrap,/scripts\.slice\(0,-1\)/);
});

test('slice module initializes in browser mode with the real optional fitting module',()=>{
 const context=vm.createContext({window:{}});
 for(const file of ['rpg_relationships.js','rpg_encounter_director.js','rpg_akari_barb_event.js','rpg_slice_of_life.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 }
 const slice=context.window.NeoRpgSliceOfLife;
 assert.ok(slice);
 assert.equal(typeof slice.byId,'function');
 assert.ok(slice.byId('akari_barb_swimsuit_fitting'));
 assert.equal(slice.validate().length,0);
});

test('RPG HTML loads diagnostics before the bootstrap with new cache version',()=>{
 const html=fs.readFileSync(path.join(root,'rpg.html'),'utf8');
 assert.ok(html.indexOf('rpg_error_diagnostics.js')<html.indexOf('rpg_character_bootstrap.js'));
 assert.match(html,/rpg_character_bootstrap\.js\?v=[^"']+/);
});
