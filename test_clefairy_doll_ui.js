'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const [html,script] of [['classic_live.html','classic_live.js'],['online.html','online.js']]){
 const page=fs.readFileSync(html,'utf8'),client=fs.readFileSync(script,'utf8');
 assert.ok(page.includes('id="pokemonActions"'),html+' renders the optional card actions rail');
 assert.match(client,/const ruleActions=\$\('pokemonActions'\)/,script+' refreshes the action rail from the current view');
 assert.match(client,/if\(!actionsDisabled\)[\s\S]*?card\(unit\.id\)\.name!==?'Clefairy Doll'/,script+' only offers actions during the player’s active turn');
 assert.match(client,/command\('discard_clefairy_doll',\{slot:index-1\}\)/,script+' sends the selected Active/Bench slot to the reducer');
}
console.log('PASS Clefairy Doll voluntary discard is exposed in Classic solo and online action bars');
