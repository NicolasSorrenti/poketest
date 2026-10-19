'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {energyStack}=require('./duel_quick_ui');
const css=fs.readFileSync('online_hand_tray.css','utf8');
const cards={
 fire:{name:'Fire Energy'},
 water:{name:'Water Energy'},
 psychic:{name:'Psychic Energy'},
 rainbow:{name:'Rainbow Energy'},
 double:{name:'Double Colorless Energy'},
 custom:{name:'Unusual & <Special> Energy'}
};
const unit={energies:['fire','water','psychic','rainbow','double','custom']};
const html=energyStack(unit,id=>cards[id]);
assert.match(html,/energy-type-fire/);
assert.match(html,/energy-type-water/);
assert.match(html,/energy-type-psychic/);
assert.match(html,/energy-type-rainbow/);
assert.match(html,/energy-type-colorless/);
assert.match(html,/energy-type-special/);
assert.match(html,/energy-label">FIR</);
assert.match(html,/energy-label">WAT</);
assert.match(html,/energy-label">PSY</);
assert.match(html,/energy-label">DCE</);
assert.match(html,/Unusual &amp; &lt;Special&gt;/,'Energy labels must escape untrusted names');
assert.equal((html.match(/class="attached-energy/g)||[]).length,6);
assert.match(energyStack({energies:[...unit.energies,'fire','water']},id=>cards[id]),/energy-overflow">\+2/);
assert.equal(energyStack({energies:[]},id=>cards[id]),'');
for(const type of ['grass','fire','water','lightning','psychic','fighting','colorless','darkness','metal','rainbow','recycle','special'])
 assert.match(css,new RegExp('energy-type-'+type),'Energy must have a distinct readable color: '+type);
assert.match(css,/\.stage \.energy-peeks\{[\s\S]*?left:-11px/,'Attached Energy rail starts at the left edge');
assert.match(css,/body\.duel-active \.hand-panel \.hand-fan,/,'Fan must always be displayed, not gated by hover');
assert.match(css,/overflow-x:auto;overflow-y:hidden/,'Long fan must scroll horizontally');
for(const file of ['online','classic_live']){
 const js=fs.readFileSync(file+'.js','utf8');
 const markup=fs.readFileSync(file+'.html','utf8');
 assert.match(markup,/id="handFan"[^>]*role="group"/);
 assert.doesNotMatch(markup,/id="handFan"[^>]*aria-hidden="true"/,'Interactive controls must be available to screen readers');
 assert.match(js,/const el=handCard\(id,i,setup\)/,'Fan reuses standard gameplay click handler');
 assert.match(js,/cards\.forEach\(\(id,i\)=>/,'All hand cards must render, not just the first twelve');
 assert.match(js,/el\.classList\.remove\('handcard'\);el\.classList\.add\('hand-fan-card'\)/);
 assert.match(js,/root\.classList\.toggle\('hidden',!cards\.length\)/);
 assert.match(js,/root\.append\(track\)/);
}
console.log('PASS v0.41: permanent interactive hand, full-card coverage, type-colored left Energy rail, mobile responsiveness and accessibility');
