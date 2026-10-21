'use strict';
const assert=require('node:assert/strict'),m=require('../duel_playmats.js');
assert.equal(m.catalog.length,23);
assert.equal(m.available().length,3);
assert.deepEqual(m.gifted({playmatGifts:{hana:true},milestoneRewards:{one:{npc:'reina',chapter:1},two:{npc:'jinx',chapter:2}}}),['hana','jinx']);
const ids=m.available(['hana']).map(x=>x.id);
assert.ok(ids.includes('npc-hana'));assert.equal(m.choose('npc-reina',ids),'aurora');
assert.match(m.svg('npc-hana'),/^url\("data:image\/svg\+xml,/);
const target={dataset:{},style:{setProperty:(k,v)=>{assert.equal(k,'--neo-playmat-image');assert.ok(v.includes('svg'));}}};
m.apply(target,'npc-hana');assert.equal(target.dataset.playmat,'npc-hana');

// The mobile view should use the regular battlefield background instead of
// showing a scaled desktop playmat; the desktop playmat remains available.
const fs=require('node:fs');
const css=fs.readFileSync(require('node:path').join(__dirname,'..','duel_playmats.css'),'utf8');
const mobile=css.match(/@media\s*\(max-width:\s*780px\)\s*\{[\s\S]*$/)?.[0];
assert.ok(mobile,'mobile playmat override exists');
assert.match(mobile,/\.territory\[data-playmat\]::before\s*\{[^}]*display:\s*none!important/);
assert.match(mobile,/body\.duel-active\s+#playmatSelect\s*\{[^}]*display:\s*none!important/);
assert.match(css,/\.territory\[data-playmat\]::before[^\n]*background-image:/);
const html=fs.readFileSync(require('node:path').join(__dirname,'..','classic_live.html'),'utf8');
assert.ok(html.includes('href="duel_playmats.css?v=2"'),'battle loads fresh stylesheet');

console.log('Playmat catalog and gift migration tests passed');
