'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {server}=require('../server');

// A new browser script can be present on disk yet blocked by server.js's
// allowlist. That previously prevented Classic's startup handlers from being
// registered, leaving deck selection and RPG duel launch nonfunctional.
test('every browser script required by the main game pages is served',async()=>{
 const pages=['classic_live.html','online.html','rpg.html','cube.html','cube_room.html'];
 const scriptsByPage=new Map();
 for(const page of pages){
  const html=fs.readFileSync(path.join(__dirname,'..',page),'utf8');
  const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
   .map(m=>m[1]).filter(src=>!/^https?:\/\//i.test(src));
  assert.ok(scripts.length>0,page+' should include browser scripts');
  scriptsByPage.set(page,scripts);
 }
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
 });
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const [page,scripts] of scriptsByPage){
   for(const src of scripts){
    const url=new URL(src,base+'/'+page);
    const response=await fetch(url);
    assert.equal(response.status,200,page+' requires '+src+' to be served');
    assert.match(response.headers.get('content-type')||'',/javascript/,
      page+' needs a JavaScript MIME type for '+src);
    await response.arrayBuffer();
   }
  }
  const internal=await fetch(base+'/server.js');
  assert.equal(internal.status,404,'internal server source must remain private');
 }finally{
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
 }
});
