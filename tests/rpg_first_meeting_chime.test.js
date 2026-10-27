'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('rpg.js','utf8');
const chime=fs.readFileSync('rpg_outfit_chime.js','utf8');
test('first meeting triggers a face-and-upper-body chime before met flag updates',()=>{
 const start=js.indexOf('function selectPerson(');
 const end=js.indexOf('function options(',start);
 const segment=js.slice(start,end);
 assert.match(segment,/if\(first&&typeof NeoOutfitChime/);
 assert.match(segment,/NeoOutfitChime\.firstMeeting/);
 assert.ok(segment.indexOf('NeoOutfitChime.firstMeeting')<segment.indexOf("state['met_'+id]=true"));
});
test('chime is visual only, expires, and does not mutate save data',()=>{
 assert.match(chime,/async function firstMeeting/);
 assert.match(chime,/timeout=setTimeout\(/);
 assert.match(chime,/3000/);
 assert.match(chime,/object-position:center 14%/);
 assert.doesNotMatch(chime,/overlay\.textContent\s*=/);
});
test('stage crop adjusts after new portrait image loads',()=>{
 assert.match(js,/image\.onload=\(\)=>\{\s*applyPersonaCStageCrop\(image,id\)/);
});
