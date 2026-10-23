'use strict';
// Exercise the actual shipped HTTP entrypoint and scripts; no mock file reads.
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const net = require('node:net');
const server = net.createServer();
server.listen(0,'127.0.0.1', async () => {
 const port = server.address().port;
 server.close();
 const child=spawn(process.execPath,['server.js'],{cwd:__dirname,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 const url=`http://127.0.0.1:${port}`;
 try {
  let running=false;
  for(let i=0;i<80;i++){
   if(child.exitCode!==null)throw Error('Server exited unexpectedly');
   try {const r=await fetch(url+'/');if(r.ok){running=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,50));
  }
  assert.ok(running,'Server did not start');
  const launcher=await (await fetch(url+'/')).text();
  assert.match(launcher,/data-mode="cube"/,'Home must offer Cube');
  assert.match(launcher,/data-mode="single"/,'Home must offer Single Match');
  assert.match(launcher,/id="soloLink"/);
  assert.match(launcher,/id="multiLink"/);
  const html=await (await fetch(url+'/index.html')).text();
  assert.match(html,/id="newGame"/);
  assert.match(html,/id="hand"/);
  assert.match(html,/id="confirmSetup"/);
  for(const filename of ['engine.js','trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js','trainer_rules_v062.js','trainer_rules_v063.js','trainer_rules_v064.js','cards/base1.json','cards/neo4.json']){
   const response=await fetch(url+'/'+filename);
   assert.equal(response.status,200,filename+' must be served');
   const data=await response.text();
   assert.ok(data.length>100,filename+' must not be empty');
   if(filename.endsWith('.json'))assert.ok(Array.isArray(JSON.parse(data)));
   if(filename.endsWith('.js'))assert.match(response.headers.get('content-type'),/javascript/);
  }
  // A missing allowlist entry causes the Status UI controller to 404.
  const rpgResponse=await fetch(url+'/rpg.html');
  assert.equal(rpgResponse.status,200,'RPG page must load');
  const rpgHtml=await rpgResponse.text();
  assert.match(rpgHtml,/id="statusBtn"/);
  assert.match(rpgHtml,/src="\/rpg_character_bootstrap\.js"/);
  const bootstrapResponse=await fetch(url+'/rpg_character_bootstrap.js');
  assert.equal(bootstrapResponse.status,200,'RPG bootstrap must be served');
  const bootstrap=await bootstrapResponse.text();
  // Static source checks cannot spot missing HTTP allowlist entries. Verify
  // every script requested by the dynamically loaded RPG browser bootstrap.
  const bootstrapScripts=[...bootstrap.matchAll(/"(\/[^"?]+\.js)(?:\?[^"]*)?"/g)].map(match=>match[1]);
  assert.ok(bootstrapScripts.length>=30,'RPG browser dependency list must be present');
  assert.ok(bootstrapScripts.includes('/rpg_slice_of_life.js'),'Daily encounters must load');
  assert.ok(bootstrapScripts.includes('/rpg.js'),'RPG entrypoint must load');
  for(const filename of bootstrapScripts){
   const response=await fetch(url+filename);
   assert.equal(response.status,200,filename+' must be served (RPG browser bootstrap dependency)');
   assert.match(response.headers.get('content-type')||'',/javascript/,filename+' must have JS MIME');
   assert.ok((await response.text()).length>100,filename+' must contain the implementation');
  }
  const statusCss=await fetch(url+'/rpg_status.css');
  assert.equal(statusCss.status,200,'RPG status CSS must be served');
  assert.match(statusCss.headers.get('content-type')||'',/text\/css/);
  const roster=await fetch(url+'/api/rpg/character-packs');
  assert.equal(roster.status,200,'RPG character pack bootstrap API must respond');
  assert.ok(Array.isArray((await roster.json()).packs));
  assert.equal((await fetch(url+'/test_rpg_status.js')).status,404,'RPG test code must remain private');
  for(const filename of ['cards/does-not-exist.json','not-a-real-file']){
   assert.equal((await fetch(url+'/'+filename)).status,404);
  }
  assert.equal((await fetch(url+'/..%2F..%2Fetc%2Fpasswd')).status,403);
  console.log('PASS HTTP integration: game launcher, legacy archive, Trainer scripts, historical sets, 404 and traversal rejection');
 }catch(error){console.error(error);process.exitCode=1;}
 finally{child.kill('SIGTERM');}
});
