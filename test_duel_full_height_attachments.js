'use strict';
// Render/layout regressions for shared CPU, RPG, Cube and online duel UI.
// Run with: node test_duel_full_height_attachments.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {energyStack}=require('./duel_quick_ui');
const css=fs.readFileSync('online_hand_tray.css','utf8');
const section=css.slice(css.lastIndexOf('/* v0.46 — Attached cards on BOTH sides:'));
assert.ok(section,'v0.46 attached-card rules missing');
assert.match(section,/--attachment-height:108px/,'Attachments should match the main card artwork');
assert.match(section,/\.energy-peeks\.energy-card-stack\{[\s\S]*?height:var\(--attachment-height\)/);
assert.match(section,/\.pokemon-tools\.tool-card-stack\{[\s\S]*?height:var\(--attachment-height\)/);
assert.match(section,/left:calc\(var\(--energy-position\) \* -1 \* var\(--attachment-overlap\)\)/);
assert.match(section,/right:calc\(var\(--tool-position\) \* -1 \* var\(--tool-overlap\)\)/);
assert.doesNotMatch(section,/\.attached-energy\.energy-card-mini::before/,'No letter or color overlay should cover attached Energy art');
assert.match(section,/\.poke \.pokemon-tools \.tool-card-art\{/);
assert.match(section,/@media\(max-width:780px\)/);
assert.match(section,/@media\(max-width:435px\)/);
assert.match(section,/\.bench-zone \.poke\{[\s\S]*?overflow:visible/);

const cards={
 fire:{name:'Fire Energy',images:{small:'https://cards.example/fire.png'}},
 water:{name:'Water Energy'},plus:{name:'PlusPower',images:{small:'https://cards.example/plus.png'}},
 defender:{name:'Defender'},unsafe:{name:'<script> & Test'},
};
const lookup=id=>cards[id];
const view=energyStack({energies:['fire','water','fire','water','fire'],attachedTrainers:[{id:'plus'},{id:'defender'},{id:'plus'},{id:'unsafe'}]},lookup);
assert.equal((view.match(/class="attached-energy/g)||[]).length,4);
assert.equal((view.match(/class="pokemon-tool-card"/g)||[]).length,3);
assert.match(view,/energy-overflow">\+1/);
assert.match(view,/tool-overflow" aria-label="1 more attached Trainers">\+1/);
assert.doesNotMatch(view,/data-symbol=/,'No redundant letter overlay on attached card art');
assert.match(view,/class="tool-card-art"/);
assert.match(view,/PlusPower, Defender, PlusPower, &lt;script&gt; &amp; Test/);
assert.doesNotMatch(view,/<script>/);
assert.equal(energyStack({energies:[]},lookup),'');
assert.match(energyStack({energies:[],attachedTrainers:[{id:'defender'}]},lookup),/pokemon-tools tool-card-stack/);
console.log('PASS: bounded full-height Energy and Trainer attachments, responsive layout and safe card names');
