'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const F=require('./classic_format'),{CATALOG,createGame,roomAdapter}=require('./headless_duel');
const audit=require('./audit_classic');
assert.deepEqual(F.SETS,['base1','base2','base3','base5']);
assert.equal(audit.cards,311);assert.equal(audit.total,427);assert.ok(audit.ported>=402&&audit.ported<=427);assert.equal(audit.remaining,427-audit.ported);
const all=[...CATALOG.keys()];assert.equal(all.filter(F.isAllowed).length,311);
assert.equal(F.isAllowed('base5-83'),true);assert.equal(F.isAllowed('base4-1'),false);assert.equal(F.isAllowed('neo4-3'),false);
const basic='base1-44',energy='base1-99';
const deck=[...Array(4).fill(basic),...Array(56).fill(energy)];
assert.equal(F.validateDeck(deck,CATALOG).valid,true);
assert.equal(createGame({decks:[deck,deck],seed:3,format:'classic'}).format,'classic');
const room=roomAdapter();assert.equal(room.createGame({decks:[deck,deck]}).format,'classic');
for(const id of ['base4-99','gym1-1','neo1-1','basep-1']){
 const invalid=[...deck];invalid[4]=id;
 const result=F.validateDeck(invalid,CATALOG);
 assert.equal(result.valid,false,id);assert.ok(result.errors.some(e=>e.includes(id)),id);
 assert.throws(()=>createGame({decks:[invalid,deck],seed:3,format:'classic'}),/Not legal/);
 assert.throws(()=>room.createGame({decks:[invalid,deck]}),/Not legal/);
}
// The full historical archive is kept, but format boundaries fail closed.
assert.ok(CATALOG.size>311);
assert.throws(()=>createGame({decks:[deck,deck],format:'mystery'}),/Unknown duel format/);
assert.equal(F.validateDeck(deck.slice(0,3),CATALOG).valid,false);
assert.equal(F.validateDeck(Array(60).fill(energy),CATALOG).valid,false);
// Verify the actual browser-only UMD loading path (without Node require/module).
const browser={console};vm.createContext(browser);
vm.runInContext(fs.readFileSync(__dirname+'/core_rules.js','utf8'),browser);
vm.runInContext(fs.readFileSync(__dirname+'/classic_format.js','utf8'),browser);
browser.deck=deck;browser.lookup=CATALOG;
assert.equal(vm.runInContext('NeoClassicFormat.validateDeck(deck,lookup).valid',browser),true);
console.log('PASS Classic format: 311 legal records, 427 audited attacks, preserved archive, strict deck and room enforcement');
