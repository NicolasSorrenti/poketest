'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');

const root=path.join(__dirname,'..');
const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const standalone=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const master='/rpg-assets/characters/camila/overworld/standing-front.png';

test('Camila dialogue full-body master is present and syntax-valid',()=>{
  assert.doesNotThrow(()=>new vm.Script(rpg));
  assert.doesNotThrow(()=>new vm.Script(standalone));
  assert.match(rpg,/const CAMILA_DIALOGUE_MASTER='\/rpg-assets\/characters\/camila\/overworld\/standing-front\.png'/);
  assert.ok(fs.existsSync(path.join(root,master.slice(1))),'existing original master file must not be moved');
});

test('Camila master overrides only stage dialogue sources, with expression fallback',()=>{
  const stage=rpg.slice(rpg.indexOf('function stagePortraitPaths('),rpg.indexOf('function scenePortraitSource('));
  assert.match(stage,/id==='camila'\?\[CAMILA_DIALOGUE_MASTER,/);
  assert.match(stage,/\.\.\.normal\.filter\(path=>path!==CAMILA_DIALOGUE_MASTER\)/);
  const portraitPaths=rpg.slice(rpg.indexOf('function portraitPaths('),rpg.indexOf('const PERSONA_C_CROPS='));
  assert.doesNotMatch(portraitPaths,/\[CAMILA_DIALOGUE_MASTER/,'other scene/avatar sources must stay intact');
  assert.match(rpg,/id==='camila'\?\{srcs:stagePortraitPaths\(id,'neutral',null\)\}/);
});

test('The portrait crop applies only to the approved Camila full-body file',()=>{
  assert.match(rpg,/const camilaMaster=id==='camila'&&src\.includes\(CAMILA_DIALOGUE_MASTER\)/);
  assert.match(rpg,/const crop=camilaMaster\?\[\.05,0,\.90,\.46\]:alternate\?/);
  assert.match(standalone,/participant\.id==='camila'&&image\.currentSrc\.includes\('\/rpg-assets\/characters\/camila\/overworld\/standing-front\.png'\)/);
  assert.match(standalone,/person\.classList\.remove\('neo-ow-dialogue-front-master'\)/);
  const styles=standalone.slice(standalone.indexOf("camilaDialogueFrame.id='neoOverworldCamilaDialogueFrame'"));
  assert.match(styles,/neo-ow-dialogue-front-master img/);
  assert.match(styles,/object-fit:cover!important;object-position:center top!important/);
  assert.match(styles,/@media\(max-width:650px\)/);
});
