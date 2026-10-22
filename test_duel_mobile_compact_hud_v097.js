'use strict';
// Mobile presentation regression: keep the battlefield tall and control hit targets intact.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('duel_mobile_polish.css','utf8');
const cut=css.split('/* v0.97 — mobile field-first HUD.')[1];
assert.ok(cut,'compact mobile HUD styles exist');
assert.match(cut,/@media \(max-width:780px\)/,'mobile-only presentation');
assert.match(cut,/#duel > \.stage > #turnCoach,[\s\S]*?#opponentActivityStatus\s*\{\s*display:none!important/,'repetitive banners are gone');
assert.match(cut,/#duel \.stage \.battleline #turnChip\s*\{\s*display:none!important/,'turn badge is hidden');
assert.match(cut,/\.territory > \.trainerbar\.player\s*\{[\s\S]*?position:absolute!important/,'old team rows become overlays');
assert.match(cut,/\.opponent-territory > \.trainerbar\s*\{\s*bottom:/,'opponent HUD follows their active');
assert.match(cut,/\.player-territory > \.trainerbar\.player\s*\{\s*top:/,'player HUD follows their active');
assert.match(cut,/\.trainerbar \.pile-button\s*\{[\s\S]*?pointer-events:auto!important/,'discard remains clickable');
assert.match(cut,/\.trainerbar \.trainerlabel strong\s*\{/,'opponent name stays visible in RPG/online');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'CSS braces balance');
for(const html of ['classic_live.html','online.html']){
  const content=fs.readFileSync(html,'utf8');
  assert.match(content,/duel_mobile_polish\.css\?v=3/,'refresh mobile CSS after deploy');
  assert.match(content,/id="fieldChoiceBar"/,'field-based choices stay accessible');
  assert.match(content,/id="oppDiscardBtn"/,'opponent discard button retained');
  assert.match(content,/id="myDiscardBtn"/,'player discard button retained');
  assert.ok(content.indexOf('duel_mobile_alignment.css')<content.indexOf('duel_mobile_polish.css'));
}
console.log('PASS mobile field-first HUD selectors and controls');
