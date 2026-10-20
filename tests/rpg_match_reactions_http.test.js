'use strict';
const assert=require('node:assert/strict');
const {server}=require('../server');
(async()=>{
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  for(const path of ['/rpg_match_reactions.js','/rpg_competitive_loop.js','/rpg_reactivity.js','/rpg-assets/reactions/manifest.json']){
   const response=await fetch(origin+path);
   assert.equal(response.status,200,path+' must be served to the RPG duel iframe');
   assert.match(response.headers.get('content-type'),path.endsWith('.json')?/application\/json/:/text\/javascript/);
   const body=await response.text();
   assert.ok(body.length>100,path+' must have nonempty content');
  }
  for(const path of ['/server.js','/package.json','/rpg-assets/reactions/README.md']){
   const response=await fetch(origin+path);
   assert.equal(response.status,404,path+' must not expose application internals');
  }
  console.log('PASS RPG NPC cut-in assets: public JS/JSON available, private files denied');
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
})().catch(err=>{console.error(err);process.exitCode=1;});
