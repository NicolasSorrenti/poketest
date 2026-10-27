'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

const source=fs.readFileSync('rpg.js','utf8');
const manifest=JSON.parse(fs.readFileSync('rpg-assets/characters/hana/overworld-variants/variants.json','utf8'));
const start=source.indexOf('let hanaEncounterSerial=');
const end=source.indexOf('\nfunction portraitPaths(',start);
const selectionSource=source.slice(start,end);
const primary='/rpg-assets/characters/hana/portraits/primary.png';
const files=manifest.variants.map(item=>item.path);
function makeChooser(random){
 const scope={state:{day:4,slot:1,location:'shop'},cast:{hana:{portrait:primary}},Math:Object.assign(Object.create(Math),{random})};
 return vm.runInNewContext(selectionSource+';({choose:key=>{hanaEncounterKey=key;return hanaOverworldPortrait(null)}})',scope);
}

test('manifest contains eight readable, correctly proportioned portrait assets',()=>{
 assert.equal(manifest.character,'hana');assert.equal(files.length,8);
 for(const item of manifest.variants){
  assert.equal(item.width,512);assert.equal(item.height,1024);
  assert.ok(fs.existsSync('.'+item.path),item.path);
  assert.ok(fs.statSync('.'+item.path).size>1000,item.path);
 }
});

test('ordinary Hana encounters select evenly among all variants and the original portrait',()=>{
 let seed=17;const selector=makeChooser(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;});
 const selected=[];
 for(let i=0;i<100;i++)selected.push(selector.choose('encounter:'+i));
 assert.deepEqual(new Set(selected),new Set([primary,...files]));
 for(let i=1;i<selected.length;i++)assert.notEqual(selected[i],selected[i-1]);
});

test('selection remains stable during a dialogue and advances for a later encounter',()=>{
 let seed=0;const selector=makeChooser(()=>((seed++%10)+.25)/10);
 const first=selector.choose('talk:1');
 for(let line=0;line<12;line++)assert.equal(selector.choose('talk:1'),first);
 assert.notEqual(selector.choose('talk:2'),first);
});

test('authored scene costumes and non-Hana portrait routing remain on existing routes',()=>{
 assert.match(source,/if\(id==='hana'&&!sceneId\)/);
 assert.match(source,/if\(sceneId\)return null/);
 assert.match(source,/id==='hana'&&normal\.some\(path=>path\.includes\('\/overworld-variants\/'\)\)\)return normal/);
 assert.match(source,/function selectPerson\(id,\{skipInvitation=false\}=\{\}\)[\s\S]{0,500}if\(id==='hana'\)hanaEncounterKey=/);
 assert.match(source,/if\(id==='elio'\)return normal/);
 assert.match(source,/if\(id==='laca'\)[\s\S]{0,800}lifeguard/);
});

test('missing variant falls back to Hana primary portrait',()=>{
 assert.match(source,/return \[\.\.\.new Set\(\[hanaOverworldPortrait\(sceneId\),fallback\]\.filter\(Boolean\)\)\]/);
 assert.match(source,/const paths=stagePortraitPaths\(id,expression,context\.sceneId\)/);
 assert.match(source,/const path=scenePortraitSource\(id,expression,context\.sceneId\)/);
 assert.match(source,/failedScenePortraits\.add\(failed\)/);
});
