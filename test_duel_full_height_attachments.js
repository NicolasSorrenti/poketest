'use strict';
// Structural regression test for full-height battlefield attachment CSS.
// Run with: node test_duel_full_height_attachments.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('online_hand_tray.css','utf8');
const section=css.slice(css.lastIndexOf('/* v0.45 — Full-height physical card attachments.'));
assert.ok(section,'Full-height attachment layout missing');
assert.match(section,/--attachment-height:calc\(100% - 7px\)/);
assert.match(section,/\.energy-peeks\.energy-card-stack[\s\S]*?height:var\(--attachment-height\)/);
assert.match(section,/\.energy-card-stack \.attached-energy\.energy-card-mini[\s\S]*?height:100%/);
assert.match(section,/left:calc\(var\(--energy-position\) \* -1 \* var\(--attachment-overlap\)\)/);
assert.match(section,/\.pokemon-face\{[\s\S]*?z-index:4/);
assert.match(section,/@media\(max-width:780px\)/);
console.log('PASS: full-height, horizontally offset Energy cards render behind Pokemon on desktop and mobile');
