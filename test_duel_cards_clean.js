'use strict';
// Regression: all live duel modes share truly proportionate, unframed cards.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('duel_cards_clean.css','utf8');
assert.equal((css.match(/\\{/g)||[]).length,(css.match(/\\}/g)||[]).length,'Card CSS must have balanced braces');
for(const page of ['classic_live','online']){
 const html=fs.readFileSync(page+'.html','utf8');
 assert.match(html,/href="duel_cards_clean\\.css\\?v=89"/,page+' must load card corrections');
 assert.ok(html.indexOf('duel_match_v085.css')<html.indexOf('duel_cards_clean.css'),page+' clean cards must override the old sizing');
}
assert.match(css,/\\.poke \\.pokemon-face\\{[\\s\\S]*?aspect-ratio:245\\/342!important/);
assert.match(css,/\\.poke \\.pokemon-face\\{[\\s\\S]*?background:transparent!important/,'No blue Pokémon face wrapper');
assert.match(css,/\\.poke \\.pokemon-face>img\\{[\\s\\S]*?object-fit:contain!important/,'Never crop Pokémon art');
assert.match(css,/\\.energy-peeks\\.energy-card-stack,[\\s\\S]*?\\.pokemon-tools\\.tool-card-stack\\{[\\s\\S]*?width:100%!important;[\\s\\S]*?aspect-ratio:245\\/342!important/,'Both attachment sides match the face');
assert.match(css,/\\.energy-card-stack \\.energy-card-art,[\\s\\S]*?object-fit:contain!important/,'Never crop attached Energy or Trainer');
assert.match(css,/\\.pokemon-tool-card::after,[\\s\\S]*?display:none!important/,'No decorative Trainer stripe over the card');
console.log('PASS: shared duel cards fit natural physical proportions without blue framing or cropped attachments');
