'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('rpg.js','utf8');
const manifest=JSON.parse(fs.readFileSync('rpg-assets/characters/hana/overworld-variants/variants.json','utf8'));
const files=manifest.variants.map(item=>item.path);
const start=source.indexOf('const DAILY_STAGE_ALTERNATES=');
const end=source.indexOf('function scenePortraitSource(',start);
const segment=source.slice(start,end);
function simulation(random,day=1){
 const state={day,specialLookDays:{}};
 const scope={state,HANA_OVERWORLD_VARIANTS:files,Math:Object.assign(Object.create(Math),{random}),persist:()=>{}};
 const api=vm.runInNewContext(segment+';({dailyStagePortrait,markSpecialLookSeen,specialLookRecord})',scope);
 return {state,...api};
}
test('eight supplied Hana files exist',()=>{
 assert.equal(files.length,8);
 for(const item of manifest.variants){assert.ok(fs.existsSync('.'+item.path));assert.equal(item.width,512);assert.equal(item.height,1024);}
});
test('day 1 starts at ten percent and locks selected outfit for the entire day',()=>{
 const m=simulation(()=>0,1);const portrait=m.dailyStagePortrait('hana',1);
 assert.equal(m.specialLookRecord('hana').chance,.10);
 for(let n=0;n<20;n++)assert.equal(m.dailyStagePortrait('hana',1),portrait);
 assert.ok(files.includes(portrait));
});
test('unseen special outfits gain five percentage points on following days',()=>{
 const m=simulation(()=>0.999,1);
 assert.equal(m.dailyStagePortrait('hana',1),null);
 m.state.day=2;assert.equal(m.dailyStagePortrait('hana',2),null);
 assert.ok(Math.abs(m.specialLookRecord('hana').chance-.15)<1e-9);
 m.state.day=3;m.dailyStagePortrait('hana',3);
 assert.ok(Math.abs(m.specialLookRecord('hana').chance-.20)<1e-9);
});
test('seeing the special outfit resets pity for the next day',()=>{
 const m=simulation(()=>0,1);m.dailyStagePortrait('hana',1);m.markSpecialLookSeen('hana');
 assert.equal(m.state.specialLookDays.hana.seen,true);
 m.state.day=2;m.dailyStagePortrait('hana',2);
 assert.equal(m.state.specialLookDays.hana.chance,.10);
});
test('rolled but unseen special outfit does not reset pity',()=>{
 let values=[0,0,0.99];const m=simulation(()=>values.shift()??0.99,1);
 m.dailyStagePortrait('hana',1);assert.equal(m.state.specialLookDays.hana.seen,false);
 m.state.day=2;m.dailyStagePortrait('hana',2);
 assert.ok(Math.abs(m.specialLookRecord('hana').chance-.15)<1e-9);
});
test('special outfit precedes expressions and normal stage paths',()=>{
 assert.match(source,/return alternate\?\[alternate,\.\.\.normal\.filter/);
 assert.match(source,/stagePortraitPaths\(id,expression,sceneId\)/);
 assert.match(source,/markSpecialLookSeen\(id\)/);
});
