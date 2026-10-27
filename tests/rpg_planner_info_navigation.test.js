'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('rpg.js','utf8');
const start=source.indexOf('function openPlannerSuggestion(');
const end=source.indexOf('\nfunction renderPlanner(',start);
test("What's Next navigation never opens Info drawer",()=>{
 assert.ok(start>=0&&end>start);
 const fn=source.slice(start,end);
 assert.match(fn,/travelTo\(pick\.place,\{intro:false\}\)/);
 assert.doesNotMatch(fn,/NeoRpgInterface\?\.toggle\?\.\('info'\)/);
 assert.match(fn,/actionHiddenInInfo/);
 assert.match(fn,/info\.getAttribute\('aria-hidden'\)==='true'/);
});
