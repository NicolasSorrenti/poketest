'use strict';
const assert=require('node:assert/strict');
const {server}=require('../server');
(async()=>{
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  for(const path of ['/rpg_match_reactions.js','/rpg_competitive_loop.js','/rpg_reactivity.js','/rpg_community.js','/rpg_consequences.js','/rpg_strategy.js','/rpg-assets/reactions/manifest.json']){
   const response=await fetch(origin+path);
   assert.equal(response.status,200,path+' must be served to the RPG duel iframe');
   assert.match(response.headers.get('content-type'),path.endsWith('.json')?/application\/json/:/text\/javascript/);
   const body=await response.text();
   assert.ok(body.length>100,path+' must have nonempty content');
  }
  // Prevent a UI with visible navigation buttons but missing JS click handlers.
  // Every RPG <script> must actually resolve on the same hosted server used by Render.
  const htmlResponse=await fetch(origin+'/rpg.html');
  assert.equal(htmlResponse.status,200);
  const html=await htmlResponse.text();
  const scripts=[...html.matchAll(/<script\s+src="(\/[A-Za-z0-9_.\/-]+\.js)"/g)].map(match=>match[1]);
  assert.ok(scripts.includes('/rpg_ui_motion.js'),'Map/Info controller must be included');
  assert.ok(scripts.includes('/rpg_tournament_presentation.js'),'Tournament visuals must be included');
  assert.ok(scripts.length>=30,'All campaign JS modules must be present');
  for(const src of scripts){
   const response=await fetch(origin+src);
   assert.equal(response.status,200,'Missing RPG browser script: '+src);
   assert.match(response.headers.get('content-type')||'',/text\/javascript/);
  }
  for(const path of ['/server.js','/package.json','/rpg-assets/reactions/README.md']){
   const response=await fetch(origin+path);
   assert.equal(response.status,404,path+' must not expose application internals');
  }
  console.log('PASS RPG HTTP assets: every HTML script loads (including Map/Info), private files denied');
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
})().catch(err=>{console.error(err);process.exitCode=1;});
