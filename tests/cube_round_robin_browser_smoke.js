'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {CATALOG}=require('../headless_duel');
const {isBasicPokemon}=require('../core_rules');
const {server,cubeRooms,online}=require('../server');
(async()=>{
 let browser;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const base='http://127.0.0.1:'+server.address().port;
  const host=cubeRooms.create({name:'Alice',seed:475});
  const guest=cubeRooms.join({code:host.code,name:'Bob'});
  cubeRooms.ready(host.code,host.token,true);
  cubeRooms.ready(host.code,guest.token,true);
  cubeRooms.start(host.code,host.token);
  for(let i=0;i<60;i++){
   for(const p of [host,guest]){
    const view=cubeRooms.state(host.code,p.token);
    const chosen=view.pack.find(c=>isBasicPokemon(CATALOG.get(c.id)))||view.pack[0];
    cubeRooms.pick(host.code,p.token,{id:chosen.id,round:view.round,pick:view.pick});
   }
  }
  for(const p of [host,guest]){
   const view=cubeRooms.state(host.code,p.token);
   cubeRooms.submit(host.code,p.token,view.suggestedDeck);
  }
  const contexts=await Promise.all([browser.newContext({viewport:{width:1280,height:850}}),
   browser.newContext({viewport:{width:390,height:845},isMobile:true,hasTouch:true})]);
  const pages=[];
  const errors=[];
  for(let i=0;i<2;i++){
   const context=contexts[i],p=[host,guest][i];
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/cube_room.html?room='+host.code);
   await page.evaluate(({code,token})=>sessionStorage.setItem('neoCampusCubeRoomV1',JSON.stringify({code,token})),
    {code:host.code,token:p.token});
   await page.reload();
   await page.locator('#roundRobinArea:not(.hidden)').waitFor({timeout:20000});
   assert.equal(await page.locator('#rrFixtures .rr-match').count(),6);
   await page.locator('#rrActive a').waitFor({timeout:10000});
   assert((await page.locator('#rrActive').innerText()).includes('Alice vs Bob'));
   pages.push(page);
  }
  await Promise.all(pages.map(page=>page.locator('#rrActive a').click()));
  for(let i=0;i<2;i++){
   const page=pages[i];
   await page.waitForURL(/online\.html\?cubeRoom=/,{timeout:12000});
   await page.waitForFunction(()=>sessionStorage.getItem('neoOnlineRoom')&&sessionStorage.getItem('neoOnlineToken'),
    null,{timeout:8000});
   assert(await page.locator('a[aria-label="Return to your Cube championship standings"]').isVisible());
  }
  const r=cubeRooms.room(host.code).tournament.current;
  assert.equal(r.kind,'online');
  assert.equal(online.session(r.code,r.tokens[0]).side,0);
  assert.equal(online.session(r.code,r.tokens[1]).side,1);
  const game=online.findRoom(r.code).game;
  assert.equal(game.deckSize,40);assert.equal(game.prizeCount,4);
  game.over=true;game.winner=0;
  await Promise.all(pages.map(p=>p.locator('a[aria-label="Return to your Cube championship standings"]').click()));
  for(const page of pages){
   await page.locator('#roundRobinArea:not(.hidden)').waitFor({timeout:20000});
   await page.waitForFunction(()=>document.querySelector('#rrProgress')?.textContent?.includes('2 of 6'),
    null,{timeout:15000});
   assert((await page.locator('#rrStandings').innerText()).includes('Alice'));
   assert((await page.locator('#rrStandings').innerText()).includes('Bob'));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS Cube round-robin browser: two live clients, secure PvP navigation, 40/4 game, return and standings');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
