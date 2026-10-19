'use strict';
// Real Chromium end-to-end smoke for the campaign → authoritative CPU duel → campaign path.
// Run in CI after "npm install --no-save playwright" and "npx playwright install chromium".
const {chromium}=require('playwright');
const {server}=require('../server');
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const artifacts=path.join(__dirname,'..','artifacts','rpg-browser');
fs.mkdirSync(artifacts,{recursive:true});
const save=async(page,name)=>page.screenshot({path:path.join(artifacts,name),fullPage:true});
const readState=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('neoHarborRpgV1')||'{}'));
(async()=>{
 let browser;
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1400,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',err=>errors.push('RPG: '+err.message));
  await page.goto(origin+'/rpg.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#starterDialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#starterChoices button').count(),3);
  await page.locator('#starterChoices button').filter({hasText:'Tidal Circuit'}).click();
  assert.equal((await readState(page)).deckJourney.starter,'tidal_circuit');
  // This is a dedicated page, not the old two-select card-swap popup.
  await page.locator('#rpgPanelTabs button[data-panel="progress"]').click();
  await page.locator('#deckCollection .studio-open').click();
  await page.waitForURL(/rpg_deck_studio\.html/);
  await page.locator('#deckStudio').waitFor({state:'visible'});
  assert.equal(await page.locator('#rpgDeckBuilder .cb-tile').count()>10,true);
  assert.match(await page.locator('#cbTotal').textContent(),/60 \/ 60/);
  const removedCardId=await page.locator('#rpgDeckBuilder .cb-tile').first().getAttribute('data-id');
  await page.locator('#rpgDeckBuilder .cb-tile').first().locator('.cb-qty-btn').first().click();
  assert.match(await page.locator('#cbTotal').textContent(),/59 \/ 60/);
  assert.equal(await page.locator('#saveDeck').isDisabled(),true,'Illegal 59-card draft cannot save');
  await page.locator('#rpgDeckBuilder .cb-tile[data-id="'+removedCardId+'"] .cb-qty-btn').last().click();
  assert.match(await page.locator('#cbTotal').textContent(),/60 \/ 60/);
  await page.locator('#saveDeck').click();
  assert.equal((await readState(page)).deckJourney.deck.length,60);
  await save(page,'01-deck-studio.png');
  await page.locator('.back').click();
  await page.waitForURL(/rpg\.html/);
  await page.locator('#places .place').first().waitFor();
  assert.equal(await page.locator('#places .place').count(),7);
  await page.locator('#whereLabel').getByText(/YOU ARE HOME/).waitFor();
  await save(page,'01-home.png');

  await page.locator('#places .place').filter({hasText:'Pixel Palace'}).click();
  await page.locator('#quickNext').click();
  let state=await readState(page);
  assert.equal(state.day,1);assert.equal(state.slot,1);assert.equal(state.location,'arcade');

  {
   const dismiss=page.locator('#choices button').filter({hasText:'Continue'});
   if(await dismiss.isVisible())await dismiss.click();
   await page.locator('#rpgSceneCast .rpg-cast-member[data-npc="yuna"]').click();
  }
  await page.locator('#choices button').filter({hasText:'Challenge to a duel'}).click();
  await page.locator('#preDuelDialog').waitFor({state:'visible'});
  let staged=await readState(page);
  assert.equal(staged.pendingDuel?.preview?.phase,'ready','Preview must be first, not an already running match');
  assert.equal(await page.locator('#duel').isVisible(),false);
  assert.equal(await page.locator('#battle').getAttribute('src'),'about:blank');
  // Reloading DURING the scene must restore the same duel identity and dialogue.
  const stagedId=staged.pendingDuel.id;
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#preDuelDialog').waitFor({state:'visible'});
  assert.equal((await readState(page)).pendingDuel.id,stagedId);
  await page.locator('#preDuelNext').click();
  assert.equal((await readState(page)).pendingDuel.preview.index,1);
  assert.equal(await page.locator('#preDuelStart').isVisible(),true);
  await page.locator('#preDuelStart').click();
  const pending=(await readState(page)).pendingDuel;
  assert.equal(pending.preview.phase,'launched');
  assert.equal(pending.playerDeck,'custom');
  assert.equal(pending.deckCards.length,60);
  await page.locator('#duel iframe').waitFor();
  assert.ok(pending?.id,'NPC challenge creates a campaign duel');
  await page.waitForFunction(id=>!!sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id)),pending.id,{timeout:45000});
  const inner=page.frameLocator('#battle');
  await inner.locator('#phaseText').waitFor({timeout:45000});
  assert.equal(await inner.locator('#turnCoach').count(),1);
  await inner.locator('#handFan .hand-fan-card').first().waitFor({state:'visible'});
  const handGeometry=await inner.locator('#handFan .hand-fan-card').first().evaluate(card=>{
   const rect=card.getBoundingClientRect();
   return {top:rect.top,bottom:rect.bottom,height:rect.height,viewport:document.documentElement.clientHeight};
  });
  assert.ok(handGeometry.height>=65&&handGeometry.top>=0&&handGeometry.bottom<handGeometry.viewport-25,
   'CPU/RPG hand card must stay fully visible inside the iframe, not clipped by compact last row');
  await inner.locator('#handToggle').click();
  assert.equal(await inner.locator('#handFan').isVisible(),false);
  await inner.locator('#handToggle').click();
  assert.equal(await inner.locator('#handFan').isVisible(),true);
  await save(page,'02-campaign-duel.png');
  // A reload DURING the match must resume the same server-authoritative session.
  const tokenBefore=await page.evaluate(id=>sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id)),pending.id);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>!!sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id)),pending.id,{timeout:45000});
  assert.equal((await readState(page)).pendingDuel.id,pending.id);
  assert.equal(await page.evaluate(id=>sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id)),pending.id),tokenBefore,'Reload must restore the original match rather than create a new one');


  // The outcome is produced by the actual server-side TCG rules reducer.
  // Use the API to concede instead of injecting a fake postMessage or modifying game state.
  await page.evaluate(async id=>{
   const token=sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id));
   if(!token)throw Error('Missing match-specific session token');
   const headers={'X-Duel-Token':token,'Content-Type':'application/json'};
   const response=await fetch('/api/classic/state',{headers});
   if(!response.ok)throw Error('Could not load authoritative match');
   const state=await response.json();
   const done=await fetch('/api/classic/action',{method:'POST',headers,
    body:JSON.stringify({revision:state.revision,command:{type:'concede',payload:{}}})});
   if(!done.ok)throw Error('Concede rejected: '+await done.text());
   const result=await done.json();
   if(result.view.over!==true||result.winner!==1)throw Error('Authoritative match did not finish');
  },pending.id);

  // On reload, the iframe restores its existing session and notifies the parent once.
  const child=page.frame({url:/classic_live\.html/});
  assert.ok(child,'Embedded Classic duel frame exists');
  await page.evaluate(()=>{const frame=document.getElementById('battle');frame.src=frame.src;});
  await page.locator('#duelReceipt').waitFor({state:'visible',timeout:45000});
  state=await readState(page);
  assert.equal(state.pendingDuel,null);
  assert.equal(state.results.length,1);
  assert.equal(state.results[0].won,false);
  assert.equal(state.deckJourney.rewards,0,'losses cannot invent card rewards');
  assert.equal(state.points,1);
  assert.equal(state.credits,85);
  assert.equal(state.slot,2,'CPU match should consume one period');
  assert.equal(state.lastDuelReceipt.outcome,'Defeat');
  assert.match(await page.locator('#receiptDetails').innerText(),/\+5 credits/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal((await readState(page)).results.length,1,'Refresh must never duplicate result');
  // Rechallenge in the same evening, then complete another actual Classic session.
  {
   const dismiss=page.locator('#choices button').filter({hasText:'Continue'});
   if(await dismiss.isVisible())await dismiss.click();
   await page.locator('#rpgSceneCast .rpg-cast-member[data-npc="yuna"]').click();
  }
  await page.locator('#choices button').filter({hasText:'Challenge to a duel'}).click();
  await page.locator('#preDuelDialog').waitFor({state:'visible'});
  const secondStaged=(await readState(page)).pendingDuel;
  assert.equal(secondStaged.preview.phase,'ready');
  await page.locator('#preDuelSkip').click();
  const second=(await readState(page)).pendingDuel;
  assert.ok(second?.id&&second.id!==pending.id,'Consecutive duels need different identities');
  await page.waitForFunction(id=>!!sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id)),second.id,{timeout:45000});
  await page.evaluate(async id=>{
   const token=sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id));
   const headers={'X-Duel-Token':token,'Content-Type':'application/json'};
   const status=await (await fetch('/api/classic/state',{headers})).json();
   const response=await fetch('/api/classic/action',{method:'POST',headers,body:JSON.stringify({revision:status.revision,command:{type:'concede',payload:{}}})});
   if(!response.ok)throw Error('Second duel failed: '+await response.text());
  },second.id);
  await page.evaluate(()=>{const frame=document.getElementById('battle');frame.src=frame.src;});
  await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('neoHarborRpgV1')||'{}');return s.results?.length===2&&!s.pendingDuel;},null,{timeout:45000});
  state=await readState(page);
  assert.equal(state.points,2);assert.equal(state.credits,90);
  assert.equal(state.day,2);assert.equal(state.slot,0);
  assert.equal(state.results.length,2);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal((await readState(page)).results.length,2,'Reload cannot repeat the second match reward');
  await page.setViewportSize({width:390,height:844});
  await save(page,'03-reward-mobile.png');

  // Verify the standalone two duel screens expose the same interaction affordances.
  for(const mode of ['classic_live','online']){
   const duelPage=await browser.newPage({viewport:{width:1280,height:800}});
   duelPage.on('pageerror',err=>errors.push(mode+': '+err.message));
   await duelPage.goto(origin+'/'+mode+'.html',{waitUntil:'domcontentloaded'});
   for(const id of ['duel','turnCoach','handToggle','logToggle','decisionBox','myActive','enemyActive'])
    assert.equal(await duelPage.locator('#'+id).count(),1,mode+' is missing shared control '+id);
   await save(duelPage,'04-'+mode+'-lobby.png');
   await duelPage.close();
  }
  assert.deepEqual(errors,[],'Browser JavaScript exceptions');
  console.log('PASS Chromium RPG pre-duel cinematic: preview-first, scene reload, explicit Start, Skip, authoritative new campaign, travel, time, NPC, actual server duel concession, iframe return, rewards, refresh, mobile screenshot, CPU/online shared controls');
 }finally{
  if(browser)await browser.close();
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
