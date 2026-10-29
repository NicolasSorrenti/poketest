'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const map=fs.readFileSync(path.join(root,'overworld/prototype.js'),'utf8');
const mapCss=fs.readFileSync(path.join(root,'overworld/prototype.css'),'utf8');
const page=fs.readFileSync(path.join(root,'rpg-overworld.html'),'utf8');

test('closing overworld dialogue only hides its stage; the original RPG is restored only on explicit dismissal',()=>{
 const hide=ui.slice(ui.indexOf('function hideStory(){'),ui.indexOf('function queueStorySync(){'));
 const dismiss=ui.slice(ui.indexOf('function dismiss(){'),ui.indexOf("open.addEventListener('click'"));
 assert.match(hide,/storyDock\.hidden=true/);
 assert.doesNotMatch(hide,/stageHome\.insertBefore|stageHome\.append/);
 assert.match(dismiss,/stageHome\.insertBefore|stageHome\.append/);
});
test('the engine legacy cast and portrait do not duplicate the overworld VN art',()=>{
 assert.match(ui,/#neoOverworldStoryDock #rpgSceneCast/);
 assert.match(ui,/#neoOverworldStoryDock #portrait\{display:none!important\}/);
 assert.match(ui,/const portraitWindow=window\.NeoRpgSceneCast\?\.createSpeakerWindow\?\.\(\)/);
});
test('embedded location background stays visible but NPC sprites and edge portraits are hidden during a story',()=>{
 assert.match(ui,/neo-overworld-story-visibility/);
 assert.match(map,/event\.origin!==location\.origin/);
 assert.match(map,/event\.source!==window\.parent/);
 assert.match(map,/neo-overworld-story-visibility/);
 assert.match(mapCss,/neo-overworld-embedded\.neo-overworld-dialogue \.anchor/);
 assert.match(mapCss,/neo-overworld-embedded\.neo-overworld-dialogue \.edge/);
 assert.match(mapCss,/neo-overworld-embedded\.neo-overworld-dialogue #edges/);
 assert.doesNotMatch(mapCss,/neo-overworld-dialogue #mapArt/);
});
test('Activities opens above bottom navigation and blocks interaction behind it',()=>{
 assert.match(ui,/zIndex:'12'/);
 assert.match(ui,/zIndex:11/);
 assert.match(ui,/data-overworld-activity-backdrop/);
 assert.match(ui,/neo-ow-activity-open #neoOverworldBottom\{visibility:hidden!important/);
 assert.match(ui,/if\(overlay\.classList\.contains\('neo-ow-activity-open'\)\|\|!storyShield\.hidden\)return/);
 assert.match(ui,/backdrop\.onclick=closeActivities/);
});
test('both overworld entrypoints refresh their separately cached presentation files',()=>{
 assert.match(page,/rpg-overworld-integration\.js\?v=portrait-modal-zfix-20261029/);
 const proto=fs.readFileSync(path.join(root,'overworld-prototype.html'),'utf8');
 assert.match(proto,/prototype\.css\?v=story-map-layer-20261029/);
 assert.match(proto,/prototype\.js\?v=story-map-layer-20261029/);
});
