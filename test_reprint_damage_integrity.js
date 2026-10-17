'use strict';
const assert=require('node:assert/strict');
const {normalizeBase2Reprints}=require('./reprint_attack_normalizer');
const cards=require('./cards/base4.json');
const {list,entries}=require('./retail_theme_decks');
const {compile}=require('./attack_effects_core');
const {CATALOG}=require('./headless_duel');
const result=normalizeBase2Reprints(cards);
assert.equal(result.corrected,0,'Reprint damage catalog must already be normalized');
for(const e of entries.filter(x=>x.set==='Base Set 2')){
 const ids=[...new Set(list(e.id))];
 for(const id of ids){const c=CATALOG.get(id);for(const a of c.attacks||[])assert.ok(compile(a),`${e.name}: ${c.name} ${a.name} is not executable`);}
}
assert.equal(cards.find(c=>c.id==='base4-82').attacks[0].damage,'10x');
assert.equal(cards.find(c=>c.id==='base4-19').attacks[1].damage,'10+');
assert.equal(cards.find(c=>c.id==='base4-49').attacks[0].damage,'50-');
console.log('PASS Base Set 2 normalized reprints: all four retail themes have executable attack programs, corrected damage signs retained');
