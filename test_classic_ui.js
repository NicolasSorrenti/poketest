'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const CLASSIC=require('./classic_format');
const CORE=require('./core_rules');
const {CATALOG}=require('./headless_duel');
const AUTH=require('./authentic_decks');
// Real browser Engine code, minus the DOM initialization event listeners.
const source=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const element=()=>({className:'',innerHTML:'',textContent:'',classList:{add(){},remove(){}},style:{}});
const dom=new Map();
const ctx={console,Math,setTimeout(){},clearTimeout(){},window:{NeoCoreRules:CORE,NeoClassicFormat:CLASSIC,AuthenticDecks:AUTH},document:{getElementById(id){if(!dom.has(id))dom.set(id,element());return dom.get(id)},querySelector(){return null},querySelectorAll(){return []}}};
vm.createContext(ctx);vm.runInContext(source,ctx);
ctx.archive=[...CATALOG.values()];
vm.runInContext('cards=archive;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};',ctx);
const themeNames=vm.runInContext('HISTORIC_THEMES.map(t=>t.key)',ctx);
assert.equal(themeNames.length,10);
const allNames=['water','fire','grass',...themeNames];
let tests=0;
for(const theme of allNames){
 // Reuse the same functions used by clicking New Duel in the UI.
 const outcome=vm.runInContext(`(()=>{const entry=HISTORIC_THEMES.find(t=>t.key===${JSON.stringify(theme)});return entry?(window.AuthenticDecks?.list(entry.key)||reconstructedDeck(entry)):makeDeck(${JSON.stringify(theme)});})()`,ctx);
 assert.ok(outcome,`No generated deck for ${theme}`);
 const v=CLASSIC.validateDeck(outcome,CATALOG);assert.deepEqual(v.errors,[],`${theme}: ${v.errors.join(', ')}`);
 ctx.deck=outcome;
 vm.runInContext('engine.start(deck,deck);',ctx);
 assert.equal(vm.runInContext('engine.phase',ctx),'setup');
 tests++;
}
const illegal=[...CLASSIC.validateDeck(allNames.map(()=> 'gym1-1'),CATALOG).errors];assert.ok(illegal.some(x=>/Not legal/.test(x)));
console.log(`PASS Classic browser Engine: ${tests} theme/prototype decks are legal and start a local duel; no later-set cards leak`);
