'use strict';
// Regression: both authoritative clients (RPG/CPU/Cube and online) use
// true portrait card geometry, not a wide blue slot that letterboxes images.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('duel_cards_clean.css','utf8');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Card CSS braces must balance');
for(const page of ['classic_live','online']){
 const html=fs.readFileSync(page+'.html','utf8');
 assert.match(html,/href="duel_cards_clean\.css\?v=90"/,page+' must load fresh corrected styles');
 assert.ok(html.indexOf('duel_match_v085.css')<html.indexOf('duel_cards_clean.css'),page+' correction must load after the match theme');
}
assert.match(css,/body\.duel-active #duel \.stage \.territory \.poke\{[\s\S]*?width:min\(100%,calc\(var\(--attachment-height\) \* 0\.716374\)\)!important/,'The WHOLE card slot must be portrait width, not just the image');
assert.match(css,/body\.duel-active #duel \.stage \.territory \.poke \.pokemon-face\{[\s\S]*?aspect-ratio:245\/342!important/,'Pokémon wrapper has the physical card aspect ratio');
assert.match(css,/\.poke \.pokemon-face\{[\s\S]*?background:transparent!important/,'No navy image-wrapper background');
assert.match(css,/\.poke \.pokemon-face>img\{[\s\S]*?object-fit:contain!important/,'Never crop Pokémon artwork');
assert.match(css,/\.energy-peeks\.energy-card-stack,[\s\S]*?\.pokemon-tools\.tool-card-stack\{[\s\S]*?width:100%!important;[\s\S]*?aspect-ratio:245\/342!important/,'Both attached-card stacks track Pokémon card geometry');
assert.match(css,/\.energy-card-stack \.energy-card-art,[\s\S]*?object-fit:contain!important/,'Attached Energy and Trainer art cannot be cropped');
assert.match(css,/\.pokemon-tool-card::after,[\s\S]*?display:none!important/,'No old decorative bars over Trainer or Energy art');
const server=fs.readFileSync('server.js','utf8');
assert.match(server,/\.css.*text\/css/,'Server must serve CSS as CSS');
assert.match(server,/html\|js\|css/,'Server must allow static CSS paths');
console.log('PASS: proportional Pokémon slots without navy letterboxes, responsive attachments, both battle modes and cache-busting');
