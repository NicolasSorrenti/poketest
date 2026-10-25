'use strict';
const assert=require('node:assert/strict');
const {server}=require('../server');
(async()=>{
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  const documentResponse=await fetch(origin+'/rpg.html');
  assert.equal(documentResponse.status,200,'RPG entrypoint must load');
  const pageHtml=await documentResponse.text();

  // The RPG now bootstraps its ordered scripts dynamically, after loading the
  // authorized character roster. Do not assume every script is in rpg.html.
  const inlineScripts=[...pageHtml.matchAll(/<script\b[^>]*\bsrc="(\/[^"]+?\.js)(?:\?[^"]*)?"/g)].map(match=>match[1]);
  assert.ok(inlineScripts.includes('/rpg_character_bootstrap.js'),'The authenticated RPG bootstrap must be included');
  const bootstrapResponse=await fetch(origin+'/rpg_character_bootstrap.js');
  assert.equal(bootstrapResponse.status,200,'The RPG bootstrap must be publicly served');
  const bootstrap=await bootstrapResponse.text();
  const dynamicScripts=[...bootstrap.matchAll(/"((?:\/[A-Za-z0-9_.\/-]+\.js)(?:\?[^"]*)?)"/g)]
    .map(match=>match[1].split('?')[0]);
  assert.ok(dynamicScripts.length>=40,'The RPG must declare its campaign modules in the bootstrap');
  assert.ok(dynamicScripts.includes('/rpg_ui_motion.js'),'Map/Info controller must be bootstrapped');
  assert.ok(dynamicScripts.includes('/rpg_tournament_presentation.js'),'Tournament visuals must be bootstrapped');
  for(const src of new Set([...inlineScripts,...dynamicScripts])){
   const response=await fetch(origin+src,{method:'HEAD'});
   assert.equal(response.status,200,'Missing RPG browser script: '+src);
   assert.match(response.headers.get('content-type')||'',/text\/javascript/,
    src+' must be served with a JavaScript MIME type');
  }
  for(const path of ['/rpg_match_reactions.js','/rpg_competitive_loop.js','/rpg_reactivity.js','/rpg_dialogue_memory.js','/rpg_community.js','/rpg_consequences.js','/rpg_strategy.js','/rpg-assets/reactions/manifest.json']){
   const response=await fetch(origin+path);
   assert.equal(response.status,200,path+' must be served to the RPG duel iframe');
   assert.match(response.headers.get('content-type'),path.endsWith('.json')?/application\/json/:/text\/javascript/);
   const body=await response.text();
   assert.ok(body.length>100,path+' must have nonempty content');
  }

  // Barb's match art must be both registered and available to the browser.
  const reactionManifestResponse=await fetch(origin+'/rpg-assets/reactions/manifest.json');
  const reactionManifest=await reactionManifestResponse.json();
  assert.ok(reactionManifest.characters.barb,'Barb must be registered for RPG reactions');
  for(const url of new Set(Object.values(reactionManifest.characters.barb))){
   const response=await fetch(origin+url,{method:'HEAD'});
   assert.equal(response.status,200,'Barb match artwork missing: '+url);
   assert.match(response.headers.get('content-type')||'',/^image\//,'Barb reaction must be an image');
  }
  for(const path of ['/server.js','/package.json','/rpg-assets/reactions/README.md']){
   const response=await fetch(origin+path);
   assert.equal(response.status,404,path+' must not expose application internals');
  }
  console.log('PASS RPG HTTP assets: bootstrap scripts, Barb reactions and privacy checks');
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
})().catch(err=>{console.error(err);process.exitCode=1;});
