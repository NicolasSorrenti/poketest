'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('duel_mobile_popup.css','utf8');
assert.match(css,/@media \(max-width:780px\)/);
assert.match(css,/grid-template-rows:auto auto minmax\(0,1fr\) clamp\(145px,20dvh,178px\)/);
assert.match(css,/grid-template-columns:minmax\(0,1\.05fr\)[\s\S]+?grid-template-rows:minmax\(0,1fr\)/);
assert.match(css,/attack-popup-open #mobileAttackDock/);
assert.match(css,/\.attack-effect,[\s\S]+?display:block!important/);
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'balanced CSS');
for(const file of ['classic_live.html','online.html']){
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/duel_mobile_popup\.css\?v=1/);
 assert.match(html,/id="mobileAttacksToggle"/);
 assert.match(html,/aria-modal="true"/);
}
const classic=fs.readFileSync('classic_live.js','utf8');
assert.doesNotMatch(classic,/if\(cloudSyncWarning\)fail\(/);
assert.match(classic,/mobileAttacksToggle/);
assert.match(fs.readFileSync('online.js','utf8'),/mobileAttacksToggle/);
console.log('PASS one-row mobile buttons, attack popup and silent cloud fallback');
