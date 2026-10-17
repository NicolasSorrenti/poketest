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
  await page.locator('#places .place').first().waitFor();
  assert.equal(await page.locator('#places .place').count(),7);
  await page.locator('#whereLabel').getByText(/YOU ARE HOME/).waitFor();
  await save(page,'01-home.png');

  await page.locator('#places .place').filter({hasText:'Pixel Palace'}).click();
  await page.locator('#quickNext').click();
  let state=await readState(page);
  assert.equal(state.day,1);assert.equal(state.slot,1);assert.equal(state.location,'arcade');

  await page.locator('#people .person').filter({hasText:'Yuna Hoshino'}).click();
  await page.locator('#choices button').filter({hasText:'Challenge to a duel'}).click();
  await page.locator('#duel iframe').waitFor();
  const pending=(await readState(page)).pendingDuel;
  assert.ok(pending?.id,'NPC challenge creates a campaign duel');
  await page.waitForFunction(id=>!!sessionStorage.getItem('neoRpgDuelToken:'+encodeURIComponent(id)),pending.id,{timeout:45000});
  const inner=page.frameLocator('#battle');
  await inner.locator('#phaseText').waitFor({timeout:45000});
  assert.equal(await inner.locator('#turnCoach').count(),1);
  await save(page,'02-campaign-duel.png');

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
  assert.equal(state.points,1);
  assert.equal(state.credits,85);
  assert.equal(state.slot,2,'CPU match should consume one period');
  assert.equal(state.lastDuelReceipt.outcome,'Defeat');
  assert.match(await page.locator('#receiptDetails').innerText(),/\+5 credits/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal((await readState(page)).results.length,1,'Refresh must never duplicate result');
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
  console.log('PASS Chromium RPG: new campaign, travel, time, NPC, actual server duel concession, iframe return, rewards, refresh, mobile screenshot, CPU/online shared controls');
 }finally{
  if(browser)await browser.close();
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
