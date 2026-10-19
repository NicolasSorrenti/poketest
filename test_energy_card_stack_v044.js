'use strict';
// The attachment presentation is shared by CPU, RPG, multiplayer and Cube.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {energyStack}=require('./duel_quick_ui');
const {CATALOG}=require('./headless_duel');
const base='https://assets.tcgdex.net/en/base/base1/';
const water={name:'Water Energy',images:{small:base+'102/low.webp'}};
const fire={name:'Fire Energy',images:{small:base+'98/low.webp'}};
const hidden={name:'Odd & <Energy>',images:{small:'javascript:alert(1)'}};
const lookup=id=>({w:water,f:fire,odd:hidden})[id];
const art=energyStack({energies:['w','f','odd']},lookup);
assert.match(art,/class="energy-peeks energy-card-stack"/);
assert.match(art,/class="attached-energy energy-card-mini energy-type-water"/);
assert.match(art,/class="attached-energy energy-card-mini energy-type-fire"/);
assert.equal((art.match(/class="energy-card-art"/g)||[]).length,2,'Actual Energy artwork must be rendered');
assert.match(art,/src="https:\/\/assets.tcgdex.net\/en\/base\/base1\/102\/low.webp"/);
assert.match(art,/style="--energy-position:0"/);
assert.match(art,/style="--energy-position:1"/);
assert.match(art,/energy-card-fallback/,'Cards without art keep a colored text fallback');
assert.doesNotMatch(art,/javascript:alert/,'Image source must reject non-HTTPS URLs');
assert.match(art,/Odd &amp; &lt;Energy&gt;/,'Names must be escaped safely');
assert.equal(energyStack({energies:[]},lookup),'');
assert.match(energyStack({energies:['w','w','w','w','w','w','f']},lookup),/energy-overflow">\+1/);
assert.equal((energyStack({energies:['w','w','w','w','w','w','f']},lookup).match(/energy-card-mini/g)||[]).length,6);
const catalogEnergy=[...CATALOG.values()].find(c=>c.supertype==='Energy'&&/^https:\/\//.test(c.images?.small||''));
assert.ok(catalogEnergy,'Expected historical Energy card images in the catalog');
assert.match(energyStack({energies:[catalogEnergy.id]},id=>CATALOG.get(id)),/energy-card-art/);

const css=fs.readFileSync('online_hand_tray.css','utf8');
assert.match(css,/Physical TCG attachments/);
assert.match(css,/\.poke \.energy-card-stack\{[\s\S]*?left:calc\(-1 \* var\(--energy-peek\)\)/);
assert.match(css,/\.poke \.pokemon-face\{[\s\S]*?z-index:2/,'Pokémon artwork sits above Energy cards');
assert.match(css,/\.poke \.energy-card-stack\{[\s\S]*?z-index:1/,'Energy cards sit behind Pokémon');
assert.match(css,/\.energy-card-stack \.energy-card-mini\{/);
assert.match(css,/--energy-peek:19px/,'Mobile attachments preserve left peek');
assert.match(css,/\.bench-zone \.poke \.energy-card-stack\{/,'Compact bench attachments');
for(const page of ['online','classic_live']){
 const html=fs.readFileSync(page+'.html','utf8'),js=fs.readFileSync(page+'.js','utf8');
 assert.match(html,/href="online_hand_tray\.css"/,page+' must load shared Energy layout');
 assert.match(html,/src="duel_quick_ui\.js"/,page+' must load shared renderer');
 assert.match(js,/quick\.energyStack\(/,page+' must render same Energy art');
}
const rpg=fs.readFileSync('rpg.js','utf8');
const cube=fs.readFileSync('cube_room_client.js','utf8');
assert.match(rpg,/classic_live\.html\?rpg=1/,'RPG duels reuse CPU presentation');
assert.match(cube,/online\.html/,'Cube multiplayer uses the online duel presentation');
assert.match(cube,/classic_live\.html/,'Cube CPU matches reuse CPU duel presentation');
console.log('PASS v0.44 actual Energy art tucked beneath Pokémon, mobile/bench, overflow, safety and duel-mode parity');
