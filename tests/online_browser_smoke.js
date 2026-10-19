'use strict';
// Two genuine browsers connected through the hosted Classic multiplayer API.
// Integration tests the real lobby, simultaneous views, chat, and match completion.
const {chromium}=require('playwright');
const {server}=require('../server');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const artifacts=path.join(__dirname,'..','artifacts','rpg-browser');
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 let browser;
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const base='http://127.0.0.1:'+server.address().port;
  const host=await browser.newPage({viewport:{width:1380,height:900}});
  const guest=await browser.newPage({viewport:{width:1380,height:900}});
  const errors=[];
  host.on('pageerror',err=>errors.push('host: '+err.message));
  guest.on('pageerror',err=>errors.push('guest: '+err.message));
  await Promise.all([host.goto(base+'/online.html'),guest.goto(base+'/online.html')]);
  await host.locator('#nickname').fill('BrowserHost');
  await host.locator('#createRoom').click();
  await host.locator('#roomCode').waitFor({state:'visible',timeout:25000});
  const code=(await host.locator('#roomCode').innerText()).trim();
  assert.match(code,/^[A-Z0-9]{6}$/);
  await guest.locator('#nickname').fill('BrowserGuest');
  await guest.locator('#joinCode').fill(code);
  await guest.locator('#joinRoom').click();
  await guest.locator('#roomCode').waitFor({state:'visible',timeout:25000});
  assert.equal((await guest.locator('#roomCode').innerText()).trim(),code);
  await host.waitForFunction(()=>document.querySelector('#lobbyPlayers')?.textContent.includes('BrowserGuest'),null,{timeout:25000});
  await host.locator('#readyBtn').click();
  await guest.locator('#readyBtn').click();
  await host.locator('#startMatch:enabled').waitFor({state:'visible',timeout:25000});
  await host.locator('#startMatch').click();
  await Promise.all([host.locator('#duel:not(.hidden)').waitFor({timeout:25000}),guest.locator('#duel:not(.hidden)').waitFor({timeout:25000})]);

  for(const page of [host,guest]){
   for(const id of ['handToggle','logToggle','turnCoach','decisionBox','myActive','enemyActive','prizeRail','handTray','attacks','endBtn']){
    assert.equal(await page.locator('#'+id).count(),1,'Missing shared duel interaction '+id);
   }
   assert.equal(await page.locator('.arena-layout').count(),1);
   assert.equal(await page.locator('#handFan').isVisible(),true,'Permanent hand fan must be visible without hover');
   const handCards=page.locator('#handFan .hand-fan-card');
   assert.ok(await handCards.count()>0,'Opening hand must have playable fan cards');
   const listCount=await page.locator('#hand .handcard').count();
   assert.equal(await handCards.count(),listCount,'Every hand card must be accessible in the fan');
   const handRect=await page.locator('#handFan').boundingBox();
   const fieldRect=await page.locator('.stage').boundingBox();
   const cardRect=await handCards.first().boundingBox();
   const bounds=page.viewportSize();
   assert.ok(handRect&&fieldRect&&cardRect,'Hand and battlefield need measurable geometry');
   assert.ok(handRect.x<=24&&handRect.y<fieldRect.y+fieldRect.height,
    'Floating hand must be anchored on the lower-left over battlefield space');
   assert.ok(cardRect.y>=0&&cardRect.y+cardRect.height<bounds.height-36,
    'Entire clickable card must be above the lower edge, never cropped by the old 54px row');
   assert.ok(cardRect.height>=85,'Card needs enough visual area to be recognizable');
   const panel=page.locator('#handPanel');
   assert.ok((await panel.boundingBox()).width<8,'Old boxed hand panel must not consume width');
   await page.locator('#handToggle').click();
   assert.equal(await page.locator('#handFan').isVisible(),false,'Hand toggle hides cards');
   await page.locator('#handToggle').click();
   assert.equal(await page.locator('#handFan').isVisible(),true,'Hand toggle restores cards');
   assert.equal(await page.locator('#handFan .hand-fan-card').count(),listCount);
   const basic=handCards.filter({hasText:'Basic Pokémon'}).first();
   assert.equal(await basic.count(),1,'A Basic Pokémon must be clickable from the fan');
   const handBefore=await handCards.count();
   await basic.click();
   const activeAppeared=await page.locator('#myActive .poke').waitFor({state:'visible',timeout:6000}).then(()=>true,()=>false);
   if(!activeAppeared){
    const debug=await page.evaluate(async()=>{
     const token=sessionStorage.getItem('neoOnlineToken'),code=sessionStorage.getItem('neoOnlineRoom');
     const headers={'X-Duel-Token':token};
     const res=await fetch('/api/online/state?code='+encodeURIComponent(code),{headers});
     const state=await res.json();
     return {error:document.querySelector('#error')?.textContent,
      html:document.querySelector('#myActive')?.innerHTML?.slice(0,200),
      hand:document.querySelector('#handFan')?.textContent?.slice(0,250),
      phase:state.view?.phase,
      active:state.view?.players?.[state.you]?.active,
      revision:state.revision};
    });
    throw Error('Fan Basic selection did not produce a visible Active Pokémon: '+JSON.stringify(debug));
   }
   assert.equal(await page.locator('#handFan .hand-fan-card').count(),handBefore-1,
    'Playing a card from fan updates the authoritative hand');
  }
  await host.screenshot({path:path.join(artifacts,'05-online-host-duel.png'),fullPage:true});
  await guest.screenshot({path:path.join(artifacts,'06-online-guest-duel.png'),fullPage:true});

  await guest.locator('#chatToggle').click();
  await guest.locator('#chatText').fill('Real-browser multiplayer smoke message');
  await guest.locator('#chatForm button[type="submit"]').click();
  await host.locator('#chatToggle').click();
  await host.locator('#chatMessages').getByText('Real-browser multiplayer smoke message').waitFor({timeout:25000});

  // End through the authoritative online reducer, then confirm BOTH UIs see the final result.
  await host.evaluate(async()=>{
   const token=sessionStorage.getItem('neoOnlineToken'),code=sessionStorage.getItem('neoOnlineRoom');
   if(!token||!code)throw Error('Missing room token or code');
   const headers={'X-Duel-Token':token,'Content-Type':'application/json'};
   const r=await fetch('/api/online/state?code='+encodeURIComponent(code),{headers});
   if(!r.ok)throw Error('Could not fetch online room');
   const state=await r.json();
   const done=await fetch('/api/online/action',{method:'POST',headers,body:JSON.stringify({code,revision:state.revision,command:{type:'concede',payload:{}}})});
   if(!done.ok)throw Error('Online concession failed: '+await done.text());
   const result=await done.json();
   if(!result.view.over||result.winner!==1)throw Error('Online match did not finish');
  });
  await Promise.all([host.locator('#phaseText').getByText(/DUEL COMPLETE/).waitFor({timeout:25000}),guest.locator('#phaseText').getByText(/DUEL COMPLETE/).waitFor({timeout:25000})]);
  const hostPhase=await host.locator('#decisionText').innerText(),guestPhase=await guest.locator('#decisionText').innerText();
  assert.match(hostPhase,/won|draw/i);
  assert.match(guestPhase,/won|draw/i);
  assert.deepEqual(errors,[],'No browser JavaScript errors');
  console.log('PASS Chromium multiplayer: host+guest joined, ready, shared battlefield, live chat and authoritative concession propagated to both clients');
 }finally{
  if(browser)await browser.close();
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
