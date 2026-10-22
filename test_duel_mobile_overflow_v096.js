'use strict';
/* Regression guard for mobile card overflow. Run: node test_duel_mobile_overflow_v096.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('duel_mobile_polish.css','utf8');
assert.match(css,/v0\.96 — Mobile overflow regression/);
assert.match(css,/\.hand-fan-card\s*\{[\s\S]*?flex:0 0 clamp\(64px,19vw,82px\)!important;/);
assert.match(css,/\.hand-fan-card\s*\{[\s\S]*?height:auto!important;/);
assert.match(css,/\.hand-fan-card\s*\{[\s\S]*?aspect-ratio:245 \/ 342!important;/);
assert.match(css,/\.hand-fan:not\(\.hidden\)\s*\{[\s\S]*?overflow-x:auto!important;/);
assert.match(css,/grid-template-rows:auto auto minmax\(0,1fr\) clamp\(228px,29dvh,272px\)!important/);
assert.match(css,/\.turn-actions-panel:not\(:has\(#mobileAttackDock button\.attack-action\)\)/);
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
for(const html of ['classic_live.html','online.html']){
  const page=fs.readFileSync(html,'utf8');
  assert.match(page,/duel_mobile_polish\.css\?v=2/);
  assert.ok(page.indexOf('duel_mobile_alignment.css')<page.indexOf('duel_mobile_polish.css'));
}
console.log('PASS: mobile hand proportions, scrolling, action layout and cache bust');
