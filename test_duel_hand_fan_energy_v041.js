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
assert.match(html,/energy-label">FIR/);
assert.match(html,/energy-label">WAT/);
assert.match(html,/energy-label">PSY/);
assert.match(html,/data-symbol="F"/);
assert.equal((html.match(/class="attached-energy/g)||[]).length,4,'Large attachments must use a bounded fan');
assert.match(html,/energy-overflow">\+2/);
assert.match(html,/Unusual &amp; &lt;Special&gt;/,'Tooltip must describe hidden cards safely');
const special=energyStack({energies:['double','custom']},id=>cards[id]);
assert.match(special,/energy-type-colorless/);
assert.match(special,/energy-type-special/);
assert.match(special,/energy-label">DCE/);
assert.match(special,/Unusual &amp; &lt;Special&gt;/);
assert.match(energyStack({energies:[...unit.energies,'fire','water']},id=>cards[id]),/energy-overflow">\+4/);
assert.equal(energyStack({energies:[]},id=>cards[id]),'');
for(const type of ['grass','fire','water','lightning','psychic','fighting','colorless','darkness','metal','rainbow','recycle','special'])
 assert.match(css,new RegExp('energy-type-'+type),'Energy must have a distinct readable color: '+type);
assert.match(css,/\.poke \.energy-card-stack\{[\s\S]*?--energy-peek:29px/,'Attached cards peek behind Pokémon on their left edge');
assert.match(css,/body\.duel-active \.hand-panel \.hand-fan,/,'Fan must always be displayed, not gated by hover');
assert.match(css,/overflow-x:auto;overflow-y:hidden/,'Long fan must scroll horizontally');
const shared=fs.readFileSync('duel_shared_components.js','utf8');
assert.match(shared,/const el=makeCard\(id,i,phase==='setup'\)/,'Shared fan must reuse the existing playable handCard callback');
assert.match(shared,/cards\.forEach\(\(id,i\)=>/,'Shared fan must render all hand cards');
assert.match(shared,/el\.classList\.remove\('handcard'\);el\.classList\.add\('hand-fan-card'\)/);
assert.match(shared,/root\.classList\.toggle\('hidden',!visible\|\|!cards\.length\)/);
assert.match(shared,/root\.append\(track\)/);
for(const file of ['online','classic_live']){
 const js=fs.readFileSync(file+'.js','utf8');
 const markup=fs.readFileSync(file+'.html','utf8');
 assert.match(markup,/id="handFan"[^>]*role="group"/);
 assert.doesNotMatch(markup,/id="handFan"[^>]*aria-hidden="true"/,'Interactive controls must be available to screen readers');
 assert.match(js,/shared\.renderHandFan\(/,'All clients use the common fan');
 assert.match(js,/makeCard:handCard/,'Clients preserve gameplay card click handlers');
}
console.log('PASS v0.41: permanent interactive hand, full-card coverage, type-colored mini Energy card fallback, mobile responsiveness and accessibility');
