'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

for(const [html,script] of [['classic_live.html','classic_live.js'],['online.html','online.js']]){
 test(html+' covers deck selection until duel startup finishes',()=>{
  const h=read(html),js=read(script);
  assert.match(h,/<body class="duel-booting">/);
  assert.ok(h.indexOf('id="duelLoading"')<h.indexOf('id="lobby"'),'loader exists before lobby is painted');
  for(const id of ['duelLoading','duelLoadingTitle','duelLoadingText','duelLoadingRetry','duelLoadingBack'])
   assert.match(h,new RegExp('id="'+id+'"'));
  assert.match(js,/function settleBoot\(error\)/);
  assert.match(js,/render\(\);\s*settleBoot\(\)/);
  assert.match(js,/catch\(e\).*?settleBoot\(e\)/);
 });
}
test('RPG cloud startup hides the device cache until checking the signed-in account',()=>{
 const html=read('rpg.html'),css=read('rpg_cloud_save.css'),js=read('rpg_cloud_save.js');
 assert.match(html,/neoRpgCloudSessionV1/);
 assert.match(html,/id="rpgCloudBoot"/);
 assert.match(css,/rpg-cloud-loading #rpgCloudBoot/);
 assert.match(js,/try\{await connect\(\);\}finally\{/);
 assert.doesNotMatch(js,/cloudUseLocal|cloudUseCloud|cloudChoices/);
});
