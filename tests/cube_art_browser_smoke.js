'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {server}=require('../server');
const {images}=require('../cube_card_images');
// Deterministic PNG so the browser test does not depend on third-party CDN uptime.
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==','base64');
const original=images.get;
images.get=async id=>({bytes:PNG,type:'image/png'});
(async()=>{
 let browser;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const base='http://127.0.0.1:'+server.address().port;
  const solo=await browser.newPage({viewport:{width:1350,height:950}});
  const roomHost=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const guest=await browser.newPage();
  const errors=[];
  for(const page of [solo,roomHost,guest])page.on('pageerror',e=>errors.push(e.message));
  await solo.goto(base+'/cube.html');
  await solo.locator('#start').click();
  await solo.locator('#pack button').first().waitFor();
  assert.equal(await solo.locator('#pack button').count(),15);
  await solo.waitForFunction(()=>{
   const imgs=[...document.querySelectorAll('#pack button img')].slice(0,4);
   return imgs.length===4&&imgs.every(img=>img.complete&&img.naturalWidth>0);
  },null,{timeout:20000});
  assert(await solo.locator('#pack img[src^="/api/cube-card-image/"]').count()>=4,
   'Solo pack art should be served from same origin');

  await roomHost.goto(base+'/cube_room.html');
  await guest.goto(base+'/cube_room.html');
  await roomHost.locator('#createRoom').click();
  await roomHost.locator('#room:not(.hidden)').waitFor();
  const code=/^Cube room ([A-Z2-9]{6})(?:\s|$)/.exec(await roomHost.locator('#roomTitle').innerText())?.[1];
  assert(code);
  await guest.locator('#roomCode').fill(code);
  await guest.locator('#joinRoom').click();
  await guest.locator('#room:not(.hidden)').waitFor();
  await roomHost.waitForFunction(()=>document.querySelector('#roster')?.textContent.includes('Player'),null,{timeout:20000});
  await roomHost.locator('#readyRoom').click();
  await guest.locator('#readyRoom').click();
  await roomHost.locator('#beginDraft:enabled').waitFor({timeout:20000});
  await roomHost.locator('#beginDraft').click();
  await roomHost.locator('#draftArea:not(.hidden)').waitFor();
  await guest.locator('#draftArea:not(.hidden)').waitFor({timeout:20000});
  await roomHost.waitForFunction(()=>{
   const imgs=[...document.querySelectorAll('#pack button img')].slice(0,2);
   return imgs.length===2&&imgs.every(img=>img.complete&&img.naturalWidth>0);
  },null,{timeout:20000});
  assert(await roomHost.locator('#pack img[src^="/api/cube-card-image/"]').count()>=2,
   'Mobile multiplayer pack must use same-origin card art');
  assert.deepEqual(errors,[]);
  console.log('PASS Cube artwork browser: solo and multiplayer card images visibly load from first-party endpoint');
 }finally{
  images.get=original;
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
