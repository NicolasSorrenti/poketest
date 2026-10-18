'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {server,cube,cubeRooms}=require('../server');
const {images}=require('../cube_card_images');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==','base64');
const previous=images.get;
images.get=async()=>({bytes:PNG,type:'image/png'});
const dir=path.join(__dirname,'..','artifacts','rpg-browser');
fs.mkdirSync(dir,{recursive:true});
const best=cards=>cards.find(c=>(c.subtypes||[]).includes('Basic'))||cards[0];
(async()=>{
 let browser;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const origin='http://127.0.0.1:'+server.address().port,errors=[];
  const soloDraft=cube.create({seed:474}),soloToken=soloDraft.token;
  let soloState=soloDraft;
  while(!soloState.done){
   soloState=cube.pick(soloToken,best(soloState.pack).id,soloState.revision);
  }
  const solo=await browser.newPage({viewport:{width:1536,height:1000}});
  solo.on('pageerror',e=>errors.push('solo: '+e.message));
  await solo.addInitScript(t=>sessionStorage.setItem('neoCubeDraftToken',t),soloToken);
  await solo.goto(origin+'/cube.html');
  await solo.locator('#soloDeckBuilder .cb-tile').first().waitFor({timeout:25000});
  assert.equal(await solo.locator('#cbTotal').innerText(),'40 / 40 cards');
  assert.equal(await solo.locator('body.cube-deck-mode').count(),1,'Solo deck building must enter focused mode');
  assert.equal(await solo.locator('header').isVisible(),false,'Draft header must be hidden');
  assert.equal(await solo.locator('.layout').isVisible(),false,'The draft pack and pick list must be hidden');
  assert.equal(await solo.locator('#presetSelect').isVisible(),false,'Preset selection must not distract');
  assert.equal(await solo.locator('#builder').isVisible(),true);
  assert.equal(await solo.locator('#restartBuilder').isVisible(),true);
  const soloLayout=await solo.evaluate(()=>({
   width:document.querySelector('#builder').getBoundingClientRect().width,
   viewport:window.innerWidth
  }));
  assert(soloLayout.width>=soloLayout.viewport*.9,'Builder should use nearly the entire desktop width');
  assert(await solo.locator('#soloDeckBuilder .cb-tile').count()>=20,'Drafted pool must show card tiles');
  assert(await solo.locator('#soloDeckBuilder .cb-tile img').count()>=20,'Pool tiles need real art');
  assert(await solo.locator('#soloDeckBuilder .cb-preview img').count()===1,'Large preview must show art');
  assert.equal(await solo.locator('#playCube').isEnabled(),true,'Suggested deck must remain legal');
  const sections=await solo.locator('#soloDeckBuilder .cb-deck-group h4').allInnerTexts();
  assert(sections.some(s=>s.includes('Pokémon'))&&sections.some(s=>s.includes('Energy')),'Deck grouped by category');
  const firstRemove=solo.locator('#soloDeckBuilder .cb-deck-row .cb-qty-btn').first();
  await firstRemove.click();
  assert.equal(await solo.locator('#cbTotal').innerText(),'39 / 40 cards');
  assert.equal(await solo.locator('#playCube').isEnabled(),false,'Cannot launch an incomplete deck');
  await solo.locator('#soloDeckBuilder .cb-tile .cb-qty-btn[aria-label^="Add "]:not(:disabled)').first().click();
  assert.equal(await solo.locator('#cbTotal').innerText(),'40 / 40 cards');
  const trainerTab=solo.locator('#soloDeckBuilder .cb-tab').filter({hasText:'Trainers'});
  await trainerTab.click();
  assert(await solo.locator('#soloDeckBuilder .cb-category').count()===1);
  assert((await solo.locator('#soloDeckBuilder .cb-category h3').innerText()).includes('Trainers'));
  const trainerName=await solo.locator('#soloDeckBuilder .cb-tile .cb-name').first().innerText();
  await solo.locator('#cbSearch').fill(trainerName);
  assert(await solo.locator('#soloDeckBuilder .cb-tile').count()>0,'Search should find drafted trainer');
  assert((await solo.locator('#soloDeckBuilder .cb-tile').first().innerText()).includes(trainerName));
  await solo.locator('#cbSearch').fill('');
  await solo.locator('#cbSort').selectOption('count');
  await solo.locator('#soloDeckBuilder .cb-tile').first().focus();
  assert(await solo.locator('#cbPreview h3').count()===1,'Keyboard navigation should update preview');
  await solo.screenshot({path:path.join(dir,'cube-deck-builder-desktop.png'),fullPage:true});

  const host=cubeRooms.create({seed:475,name:'Host'});
  const guest=cubeRooms.join({code:host.code,name:'Friend'});
  cubeRooms.ready(host.code,host.token,true);
  cubeRooms.ready(host.code,guest.token,true);
  cubeRooms.start(host.code,host.token);
  for(let i=0;i<60;i++){
   const a=cubeRooms.state(host.code,host.token);
   const b=cubeRooms.state(host.code,guest.token);
   cubeRooms.pick(host.code,host.token,{id:best(a.pack).id,round:a.round,pick:a.pick});
   cubeRooms.pick(host.code,guest.token,{id:best(b.pack).id,round:b.round,pick:b.pick});
  }
  const state=cubeRooms.state(host.code,host.token);
  assert(state.suggestedDeck?.length===40,'Multiplayer seat must have a legal suggested deck');
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('multiplayer: '+e.message));
  await mobile.addInitScript(data=>sessionStorage.setItem('neoCampusCubeRoomV1',JSON.stringify(data)),{
   code:host.code,token:host.token
  });
  await mobile.goto(origin+'/cube_room.html');
  await mobile.locator('#roomDeckBuilder .cb-tile').first().waitFor({timeout:25000});
  assert.equal(await mobile.locator('#cbTotal').innerText(),'40 / 40 cards');
  assert.equal(await mobile.locator('body.cube-deck-mode').count(),1,'Multiplayer builder must enter focused mode');
  assert.equal(await mobile.locator('header').isVisible(),false,'Multiplayer site header should be hidden');
  assert.equal(await mobile.locator('#room > .panel').isVisible(),false,'Lobby controls must be hidden while building');
  assert.equal(await mobile.locator('#draftArea').isVisible(),false);
  assert.equal(await mobile.locator('#deckArea').isVisible(),true);
  assert((await mobile.locator('#cubeRoomBuildContext').innerText()).includes(host.code));
  const mobileLayout=await mobile.evaluate(()=>({
   width:document.querySelector('#deckArea').getBoundingClientRect().width,
   viewport:window.innerWidth
  }));
  assert(mobileLayout.width>=mobileLayout.viewport*.9,'Builder should use entire mobile width');
  assert(await mobile.locator('#roomDeckBuilder .cb-deck-row img').count()>3,'Selected deck must show thumbnails');
  assert(await mobile.locator('#roomDeckBuilder .cb-preview img').count()===1);
  assert.equal(await mobile.locator('#lockDeck').isEnabled(),true);
  await mobile.screenshot({path:path.join(dir,'cube-deck-builder-mobile.png'),fullPage:true});
  await mobile.locator('#lockDeck').click();
  await mobile.waitForFunction(()=>document.getElementById('lockDeck')?.disabled===true,null,{timeout:15000});
  assert((await mobile.locator('#buildStatus').innerText()).includes('locked'));
  assert.equal(await mobile.locator('#roomDeckBuilder .cb-qty-btn:enabled').count(),0,
   'Locked multiplayer deck must be immutable');
  assert.equal(await mobile.locator('body.cube-deck-mode').count(),1,'Stay in full-screen builder while waiting for others');
  const guestDeck=cubeRooms.state(host.code,guest.token).suggestedDeck;
  cubeRooms.submit(host.code,guest.token,guestDeck);
  await mobile.locator('#roundRobinArea:not(.hidden)').waitFor({timeout:25000});
  assert.equal(await mobile.locator('body.cube-deck-mode').count(),0,'Restore normal UI when the tournament starts');
  assert.equal(await mobile.locator('header').isVisible(),true);
  assert.equal(await mobile.locator('#room > .panel').isVisible(),true);
  assert.equal(await mobile.locator('#deckArea').isVisible(),false);
  assert.deepEqual(errors,[]);
  console.log('PASS Cube deck builder browser: full-screen solo/mobile builds, hidden clutter, locked waiting, return to tournament');
 }finally{
  images.get=previous;
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
