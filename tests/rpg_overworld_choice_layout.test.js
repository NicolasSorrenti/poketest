'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const html=fs.readFileSync(path.join(root,'rpg-overworld.html'),'utf8');

test('native response prompt is reparented to the map layer and restored for classic RPG',()=>{
 assert.match(ui,/const nativePrompt=document\.getElementById\('playerChoicePrompt'\)/);
 assert.match(ui,/overlay\.append\(nativePrompt\)/);
 assert.match(ui,/function restoreChoicePanels\(\)/);
 assert.match(ui,/nativePromptHome\.insertBefore\(nativePrompt,nativePromptNext\)/);
 assert.match(ui,/restoreChoicePanels\(\);/);
 assert.match(engine,/promptRoot\.hidden=!isPlayerPrompt/);
 assert.match(engine,/const desiredParent=isPlayerPrompt\?promptPanel:\$\('dialogue'\)/);
});
test('regular multi-response choices float too, but ordinary Continue remains in the speech box',()=>{
 assert.match(ui,/const genericActive=!nativeActive&&count>1&&!idleFocus/);
 assert.match(ui,/genericChoiceInner\.append\(choiceList\)/);
 assert.match(ui,/if\(choiceList\?\.parentNode===genericChoiceInner\)document\.getElementById\('dialogue'\)\?\.append\(choiceList\)/);
 assert.match(ui,/if\(genericActive\)/);
});
test('hide and show never call a story or choice action',()=>{
 const start=ui.indexOf('function setChoicesCollapsed(collapsed)');
 const end=ui.indexOf('function syncChoicePresentation(idleFocus)',start);
 const code=ui.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(code,/choicesCollapsed=!!collapsed/);
 assert.match(code,/hideChoicesButton\.onclick=\(\)=>setChoicesCollapsed\(true\)/);
 assert.match(code,/showChoicesButton\.onclick=/);
 assert.doesNotMatch(code,/safeAct\(|\.click\(\)|bridge\(\)\.activity\(|bridge\(\)\.interact\(/);
 assert.match(ui,/overlay\.classList\.toggle\('neo-ow-choices-collapsed',choicesCollapsed\)/);
});
test('dialogue remains fixed while response sheet sits beside desktop single speaker or centered on mobile',()=>{
 assert.match(ui,/height:150px!important/);
 assert.match(ui,/height:176px!important/);
 assert.match(ui,/neo-ow-has-choices/);
 assert.match(ui,/@media\(min-width:1100px\)/);
 assert.match(ui,/right:2\.5vw!important/);
 assert.match(ui,/not\(\.neo-ow-two-speakers\)/);
 assert.match(ui,/@media\(max-width:700px\)/);
 assert.match(ui,/top:41%!important/);
 assert.match(ui,/neo-ow-paging #playerChoicePrompt/);
});
test('Escape hides choices and native events retain input state',()=>{
 assert.match(ui,/if\(overlay\.classList\.contains\('neo-ow-has-choices'\)/);
 assert.match(ui,/event\.preventDefault\(\);setChoicesCollapsed\(true\)/);
 assert.match(ui,/syncChoicePresentation\(idleFocus\)/);
 assert.match(ui,/attachChoicePanels\(\);refresh\(\);overlay\.hidden=false/);
 assert.match(html,/rpg-overworld-integration\.js\?v=20261029-portrait-flush-2/);
});
