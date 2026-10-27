'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const rpg=fs.readFileSync('rpg.js','utf8');
const chime=fs.readFileSync('rpg_outfit_chime.js','utf8');
const html=fs.readFileSync('rpg.html','utf8');
test('travel transition defers rendering until sequential arrival chimes complete',()=>{
 const render=rpg.slice(rpg.indexOf('function render(){'),rpg.indexOf('window.NeoRpgAudio?.setScene',rpg.indexOf('function render(){')));
 assert.match(render,/onDismiss:\(\)=>\{void finishOverworldArrival\(destination\);\}/);
 assert.match(render,/if\(transition\)return/);
 const flow=rpg.slice(rpg.indexOf('async function finishOverworldArrival('),rpg.indexOf('function render(){'));
 assert.ok(flow.indexOf('await NeoOutfitChime.onEntry')<flow.indexOf("beginSliceOfLife('entry'"));
 assert.ok(flow.indexOf('await NeoOutfitChime.onEntry')<flow.indexOf('render();'));
});
test('introduction once per saved character and mark after chime',()=>{
 assert.match(rpg,/state\.overworldIntroductions\[id\]=true/);
 assert.match(rpg,/!state\.overworldIntroductions\?\.\[id\]/);
});
test('chime sequence awaits each display and supports failed images',()=>{
 assert.match(chime,/await display\(item\.portrait/);
 assert.match(chime,/img\.onerror=/);
 assert.match(chime,/watchdog=setTimeout/);
 assert.match(html,/rpg_outfit_chime\.js\?v=20261027-arrival-2/);
});
