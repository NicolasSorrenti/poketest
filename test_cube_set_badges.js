'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {CHRONOLOGY,preferredPrintings}=require('./cube_printings');
const {eligibleIds}=require('./cube_draft');
const {PRESETS,listPresetSummaries}=require('./cube_presets');
const formats=listPresetSummaries();
assert.equal(formats.length,PRESETS.length);
assert.deepEqual(formats.map(p=>p.id),PRESETS.map(p=>p.id));
const all=eligibleIds();
for(const p of formats){
 assert(p.sets.length>0,p.id+' must display at least one expansion');
 const eligible=preferredPrintings(all.filter(id=>p.id!=='foundations'||/^base[123]-/.test(id)),{preset:p.id});
 const expected=CHRONOLOGY.filter(set=>eligible.some(id=>id.startsWith(set+'-')));
 assert.deepEqual(p.sets,expected,p.id+' badges must match the real card candidates');
}
assert.deepEqual(formats.find(p=>p.id==='foundations').sets,['base1','base2','base3']);
for(const page of ['cube.html','cube_room.html']){
 const html=fs.readFileSync(require('node:path').join(__dirname,page),'utf8');
 assert(html.includes('/cube_set_badges.js'),page+' must load shared badges');
 assert(html.includes('cubePresetSets')||html.includes('presetSets'),page+' must show the badges');
}
console.log('PASS Cube preset expansion badges follow real eligible printings and load on both selectors');
