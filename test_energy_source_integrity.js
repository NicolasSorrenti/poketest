'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {normalizeCard}=require('./tcgdex_adapter');
const names=new Set(['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy']);
let checked=0;
for(const file of fs.readdirSync(path.join(__dirname,'cards')).filter(x=>x.endsWith('.json'))){
 for(const card of require('./cards/'+file)){
  if(!names.has(card.name)||card.hp||card.attacks?.length||card.abilities?.length)continue;
  checked++;
  assert.equal(card.supertype,'Energy',`${card.id}: raw source must be Energy`);
  assert.ok(!card.subtypes?.includes('Basic'),`${card.id}: must not have Basic Pokémon subtype`);
 }
}
assert.equal(checked,30,'all 30 historic energy records checked');
for(const name of names){
 const normalized=normalizeCard({id:'test',name,category:'Pokemon',stage:'Basic',attacks:[],abilities:[]});
 assert.equal(normalized.supertype,'Energy',`${name}: malformed upstream category is corrected`);
 assert.ok(!normalized.subtypes.includes('Basic'));
}
const src=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8');
assert.ok(!src.includes("toast('Special Energy effects are not supported yet.')"),'no unconditional Special Energy attachment blocker');
console.log('PASS: 30 bundled Energy cards correctly classified, upstream import corrected, and Special Energy not blanket-blocked');
