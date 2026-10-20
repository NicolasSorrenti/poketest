'use strict';
// Distinct responsive duel compositions share a single authoritative battlefield.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const desktop=fs.readFileSync('duel_desktop.css','utf8');
const mobile=fs.readFileSync('duel_mobile.css','utf8');
const shared=fs.readFileSync('online_hand_tray.css','utf8');
for(const file of ['online.html','classic_live.html']){
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/href="duel_desktop\.css" media="\(min-width: 781px\)"/,file+' must load desktop presentation');
 assert.match(html,/href="duel_mobile\.css" media="\(max-width: 780px\)"/,file+' must load touch presentation');
 assert.ok(html.indexOf('online_hand_tray.css')<html.indexOf('duel_desktop.css'),file+' responsive overrides must load last');
}
for(const [file,css] of [['desktop',desktop],['mobile',mobile]]){
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,file+' rules must have balanced braces');
 assert.match(css,/body\.duel-active/,file+' should affect active duels only');
 assert.doesNotMatch(css,/\.poke\s*\{[^}]*pointer-events\s*:\s*none/,file+' cannot disable Pokémon target clicks');
}
assert.match(desktop,/@media \(min-width:781px\)/);
assert.match(desktop,/\.active-with-attacks\{[\s\S]*?grid-template-columns:/,'desktop has spacious attacks alongside Active');
assert.match(desktop,/\.bench-zone \.pokemon-strip\{[\s\S]*?display:flex/,'desktop Bench remains full-size');
assert.match(desktop,/\.poke \.pokemon-face\{[\s\S]*?height:var\(--attachment-height\)!important/,'desktop attachments match card height');
assert.match(mobile,/@media \(max-width:780px\)/);
assert.match(mobile,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/,'mobile Bench has 5 accessible slots');
assert.match(mobile,/\.active-with-attacks\{[\s\S]*?display:grid!important/,'mobile Active and attacks have distinct columns');
assert.match(mobile,/\.turn-actions\{[\s\S]*?grid-template-rows:repeat\(2,minmax\(40px,1fr\)\)/,'touch actions have two rows');
assert.match(mobile,/#endBtn\{[\s\S]*?grid-column:1 \/ 3/,'End Turn is a prominent touch target');
assert.match(mobile,/@media \(max-width:435px\)/,'narrow phone adjustments');
assert.match(mobile,/\.bench-zone \.poke\{[\s\S]*?overflow:visible!important/,'attachments cannot be cut off by old Bench rule');
assert.match(shared,/\.pokemon-tools\.tool-card-stack/,'both layouts retain Trainer extensions');
console.log('PASS desktop/mobile duel CSS separation, full-height attachments and touch controls');
