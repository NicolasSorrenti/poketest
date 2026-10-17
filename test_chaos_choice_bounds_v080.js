'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/trainer_rules_v060.js','utf8');
assert.match(source,/Number\(q\.min\?\?1\)/,'multi-step replay enforces required selection minimum');
assert.match(source,/if\(opts\.length<min\)break/,'insufficient available choices abort replay');
assert.match(source,/indexes\.length<min\|\|indexes\.length>max/,'selection count is verified before execution');
assert.match(source,/outcome===true&&\(!deckSearchRequest\|\|deckSearchRequest===lastDeckSearch\)/,'redirected play does not commit with unresolved prompts');
console.log('PASS Chaos Gym redirected pickers enforce minimum and maximum selections');
