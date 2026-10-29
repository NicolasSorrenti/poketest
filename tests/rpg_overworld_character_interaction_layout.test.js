'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const html=fs.readFileSync(path.join(root,'rpg-overworld.html'),'utf8');
test('idle character view follows reference: portrait left, vertical action menu right, caption below',()=>{
 assert.match(ui,/neoOverworldInteractionCaption/);
 assert.match(ui,/grid-template-columns:minmax\(0,1\.25fr\) minmax\(190px,\.7fr\)/);
 assert.match(ui,/#scene\{[\s\S]*?grid-column:1!important;grid-row:1/);
 assert.match(ui,/#characterActions:not\(\[hidden\]\)\{[\s\S]*?grid-column:2!important;grid-row:1/);
 assert.match(ui,/flex-direction:column!important/);
 assert.match(ui,/#neoOverworldInteractionCaption\{[\s\S]*?grid-column:1!important;grid-row:2/);
});
test('character menu uses native action callbacks; back clears interaction only when unlocked',()=>{
 assert.match(ui,/idleBack\.onclick=\(\)=>\{/);
 assert.match(ui,/if\(bridge\(\)\?\.snapshot\(\)\?\.locked\)return/);
 assert.match(ui,/interactionFocus=null;bridge\(\)\?\.clearInteraction\?\.\(\)/);
 assert.match(ui,/if\(idleFocus\)idleName\.textContent=bridge\(\)\?\.portrait\?\.\(idleFocus\)\?\.name\|\|idleFocus/);
 assert.doesNotMatch(ui,/idleStage\?\.append\(actionTray/);
});
test('normal dialogue remains separate and mobile preserves side menu',()=>{
 assert.match(ui,/#neoOverworldOverlay\.neo-ow-idle-interaction #neoOverworldStoryDock #dialogue/);
 assert.match(ui,/@media\(max-width:650px\)/);
 assert.match(ui,/grid-template-columns:minmax\(0,1fr\) minmax\(145px,\.75fr\)/);
 assert.match(html,/rpg-overworld-integration\.js\?v=20261029-character-mockup-polish-2/);
});
