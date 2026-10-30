'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'rpg-overworld-integration.js'), 'utf8');
// Syntax test without executing browser-side code.
assert.doesNotThrow(() => new vm.Script(source, {filename: 'rpg-overworld-integration.js'}));
assert.match(source, /scenePeople\.classList\.toggle\('neo-ow-standard-portraits'/);
assert.match(source, /participants\.every\(person=>person\.id==='marina'\|\|person\.id==='laca'\)/);
assert.match(source, /person\.dataset\.npc=participant\.id/);
assert.match(source, /image\.naturalHeight>image\.naturalWidth\*1\.38/);
const ruleStart = source.indexOf("dialoguePortraitStandard.id='neoOverworldDialoguePortraitStandard'");
const ruleEnd = source.indexOf('document.head.append(dialoguePortraitStandard)', ruleStart);
assert.ok(ruleStart > 0 && ruleEnd > ruleStart, 'dialogue portrait style is registered');
const rules = source.slice(ruleStart, ruleEnd);
assert.match(rules, /#neoOverworldStoryDock #neoOverworldScenePeople\.neo-ow-standard-portraits/);
assert.match(rules, /height:var\(--neo-dialogue-portrait-size\)!important/);
assert.match(rules, /width:var\(--neo-dialogue-portrait-size\)!important/);
assert.match(rules, /object-fit:cover!important/);
assert.match(rules, /object-position:var\(--neo-dialogue-portrait-x,50%\) var\(--neo-dialogue-portrait-y,0%\)!important/);
assert.match(rules, /\.neo-ow-person\[data-npc="laca"\]\.neo-ow-tall-source/);
assert.match(rules, /@media\(max-width:650px\)/);
assert.match(rules, /:has\(\.neo-ow-person:nth-child\(2\)\)/);
assert.doesNotMatch(rules, /#rpgSceneCG\s*\{/);
assert.match(source, /if\(participant\.src\)image\.src=participant\.src/);
console.log('Standalone overworld dialogue portrait framing: PASS');
