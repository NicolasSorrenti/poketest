'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const bootstrap=fs.readFileSync(path.join(__dirname,'..','rpg_character_bootstrap.js'),'utf8');

// Run the REAL bootstrap loader in an isolated fake browser to cover the
// intermittent failures seen on mobile during Render service transitions.
function loaderFor(fail){
 const codeStart=bootstrap.indexOf('  const wait=ms=>');
 const codeEnd=bootstrap.indexOf('  // Each module may depend on globals',codeStart);
 assert.ok(codeStart>=0&&codeEnd>codeStart,'bootstrap script retry loader exists');
 const requests=[];
 let removed=0;
 const document={
  createElement(type){
   assert.equal(type,'script');
   return {dataset:{},remove(){removed++;}};
  },
  body:{appendChild(script){
   requests.push(script.src);
   const shouldFail=fail(requests.length,script.src);
   queueMicrotask(()=>shouldFail?script.onerror():script.onload());
  }}
 };
 const waitImmediately=cb=>queueMicrotask(cb);
 const loadScript=new Function('document','console','setTimeout',
  bootstrap.slice(codeStart,codeEnd)+'return loadScript;'
 )(document,{warn(){}},waitImmediately);
 return {loadScript,requests,get removed(){return removed;}};
}
test('recovers a required RPG module after one transient HTTP/network failure',async()=>{
 const ctx=loaderFor(attempt=>attempt===1);
 await ctx.loadScript('/rpg_community.js');
 assert.equal(ctx.requests.length,2);
 assert.equal(ctx.requests[0],'/rpg_community.js');
 assert.match(ctx.requests[1],/^\/rpg_community\.js\?retry=2-/);
 assert.equal(ctx.removed,1);
});
test('exhausted required module retries show a useful failure',async()=>{
 const ctx=loaderFor(()=>true);
 await assert.rejects(ctx.loadScript('/rpg_community.js'),/RPG script failed after 4 attempts: \/rpg_community\.js/);
 assert.equal(ctx.requests.length,4);
 assert.equal(ctx.removed,4);
});
test('optional art inventory retries only twice and retains existing query params',async()=>{
 const ctx=loaderFor(()=>true);
 await assert.rejects(ctx.loadScript('/rpg_art_manifest.js?v=test',true),/failed after 2 attempts/);
 assert.equal(ctx.requests.length,2);
 assert.match(ctx.requests[1],/^\/rpg_art_manifest\.js\?v=test&retry=2-/);
});
test('both RPG entrypoints load the refreshed bootstrap and do not change game state on retry',()=>{
 for(const page of ['rpg.html','rpg-overworld.html']){
  const html=fs.readFileSync(path.join(__dirname,'..',page),'utf8');
  assert.match(html,/rpg_character_bootstrap\.js\?v=20261029-script-retry-1/);
 }
 assert.ok(bootstrap.includes('button.onclick=()=>location.reload()'));
 assert.ok(!bootstrap.includes('localStorage.clear()'));
});
