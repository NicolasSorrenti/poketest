'use strict';
const assert=require('node:assert/strict');
const {createCubeImageStore,images,sourceUrls}=require('./cube_card_images');
const {server}=require('./server');
const WEBP=Buffer.from('RIFFTESTWEBPVP8 '); // magic bytes sufficient for stream unit tests
const PNG=Buffer.from('89504e470d0a1a0a00000000','hex');

async function verifyStore(){
 const sources=sourceUrls('base1-1');
 assert.equal(sources[0],'https://assets.tcgdex.net/en/base/base1/1/low.webp');
 assert.equal(sources[1],'https://images.pokemontcg.io/base1/1.png');
 assert.deepEqual(sourceUrls('invalid'),[]);
 let calls=0;
 const primary=createCubeImageStore({capacity:1,fetcher:async(uri,options)=>{
  assert(uri.startsWith('https://assets.tcgdex.net/'));
  assert.equal(options.redirect,'error');
  calls++;
  return new Response(WEBP,{headers:{'content-type':'image/webp'}});
 }});
 const [first,dup]=await Promise.all([primary.get('base1-1'),primary.get('base1-1')]);
 assert.equal(calls,1,'Parallel calls must reuse a single upstream request');
 assert.equal(first.type,'image/webp');
 assert.deepEqual(first.bytes,dup.bytes);
 await primary.get('base1-1');assert.equal(calls,1,'Images must be cached');
 await primary.get('base1-2');assert.equal(calls,2);
 await primary.get('base1-1');assert.equal(calls,3,'Bounded image cache must evict older entries');
 await assert.rejects(primary.get('https://evil.example/secret'),/Unknown card image/);
 await assert.rejects(primary.get('base1-9999999'),/Unknown card image/);

 const attempts=[];
 const backup=createCubeImageStore({fetcher:async(uri)=>{
  attempts.push(uri);
  if(uri.includes('tcgdex.net'))return new Response('missing',{status:404});
  return new Response(PNG,{headers:{'content-type':'image/png'}});
 }});
 const art=await backup.get('neo1-1');
 assert.equal(art.type,'image/png');
 assert.deepEqual(art.bytes,PNG);
 assert.equal(attempts.length,2,'Retry image using fallback CDN after missing primary');

 const fakeHtml=createCubeImageStore({fetcher:async()=>new Response('<html>oops</html>',{headers:{'content-type':'text/html'}})});
 await assert.rejects(fakeHtml.get('base1-1'),/unavailable/);
}
async function verifyHTTP(){
 const original=images.get;
 images.get=async()=>({bytes:PNG,type:'image/png'});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  let r=await fetch(base+'/api/cube-card-image/base1-1');
  assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');
  assert.equal(r.headers.get('x-content-type-options'),'nosniff');
  assert(r.headers.get('cache-control').includes('max-age'));
  assert.deepEqual(Buffer.from(await r.arrayBuffer()),PNG);
  r=await fetch(base+'/api/cube-card-image/base1-1',{method:'HEAD'});
  assert.equal(r.status,200);
  r=await fetch(base+'/api/cube-card-image/not-a-card');
  assert.equal(r.status,404);
  r=await fetch(base+'/api/cube-card-image/base1-1',{method:'POST'});
  assert.equal(r.status,405);
  r=await fetch(base+'/api/cube-card-image/https%3A%2F%2Fevil.example');
  assert.equal(r.status,404);
 }finally{
  images.get=original;
  await new Promise(resolve=>server.close(resolve));
 }
}
(async()=>{await verifyStore();await verifyHTTP();console.log('PASS Cube artwork: approved CDNs, fallback, bounded cache, deduplication, HTTP image endpoint');})().catch(e=>{console.error(e);process.exitCode=1;});
