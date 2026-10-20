'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('online_hand_tray.css','utf8');
const cpuCss=fs.readFileSync('cpu_parity.css','utf8');
assert.match(cpuCss,/body\.cpu-match\.duel-active #duel:not\(\.hidden\).*54px/,'Original CPU row-height regression remains covered');
assert.match(css,/hand floats over EMPTY left field space/);
assert.match(css,/grid-template-rows:auto auto minmax\(0,1fr\) 54px!important/,'Hand no longer reserves a large last row');
assert.match(css,/\.below \.hand-panel\{[\s\S]*?width:0!important/,'The big framed hand panel must no longer consume space');
assert.match(css,/\.hand-panel \.hand-fan,[\s\S]*?position:fixed!important/,'Fan is viewport-positioned rather than clipped by CPU footer');
assert.match(css,/bottom:57px!important/,'Fan is above bottom toolbar');
assert.match(css,/left:12px!important/,'Hand floats on left');
assert.match(css,/#handTray\{display:none!important/,'Legacy boxed drawer no longer opens over play');
assert.match(css,/\.hand-fan-card\.hand-inactive/,'Other cards visually recede during target selection');
const shared=fs.readFileSync('duel_shared_components.js','utf8');
assert.match(shared,/const el=makeCard\(id,i,phase==='setup'\)/);
assert.match(shared,/if\(targetMode&&selectedHand!==null&&selectedHand!==i\)el\.classList\.add\('hand-inactive'\)/);
assert.match(shared,/root\.scrollLeft=oldScroll/,'Shared fan preserves scrolling');
for(const file of ['online','classic_live']){
 const html=fs.readFileSync(file+'.html','utf8'),js=fs.readFileSync(file+'.js','utf8');
 for(const id of ['handFan','handToggle','handVisibilityText','handVisibilityIcon'])
  assert.match(html,new RegExp('id="'+id+'"'),file+' must provide '+id);
 assert.match(html,/aria-controls="handFan"/);
 assert.match(html,/aria-label="Hide hand"/);
 assert.match(js,/function setHandVisible\(visible\)/);
 assert.match(js,/\$\('handToggle'\)\.addEventListener\('click',\(\)=>setHandVisible\(!handVisible\)\)/);
 assert.match(js,/renderHandFan\(you\.hand\)/);
 assert.match(js,/shared\.renderHandFan\(/,'Fan rendering comes from shared component');
 assert.match(js,/makeCard:handCard/,'Shared fan keeps original playable-card handler');
 assert.doesNotMatch(js,/setHandOpen\(/,'Old modal hand controls must not re-open drawer');
}
console.log('PASS floating hand: no boxed footer, viewport-safe card rail, hide/show, selection, scroll preservation');
