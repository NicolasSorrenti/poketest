'use strict';
// Synthetic battlefield geometry smoke. Uses actual HTML, shared render helper,
// stylesheets and Chromium without creating or mutating a real match.
// node tests/duel_responsive_browser_smoke.js
const {chromium}=require('playwright');
const {server}=require('../server');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'..','artifacts','rpg-browser');
fs.mkdirSync(out,{recursive:true});

(async()=>{
 let browser;
 await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',e=>e?reject(e):resolve()));
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const url='http://127.0.0.1:'+server.address().port;
  for(const spec of [
   {name:'desktop',width:1440,height:900,mobile:false},
   {name:'compact-desktop',width:900,height:740,mobile:false},
   {name:'phone',width:390,height:844,mobile:true},
   {name:'small-phone',width:320,height:640,mobile:true},
   {name:'breakpoint-mobile',width:780,height:740,mobile:true},
   {name:'breakpoint-desktop',width:781,height:740,mobile:false},
   {name:'cpu-desktop',page:'classic_live.html',width:1440,height:900,mobile:false},
   {name:'cpu-phone',page:'classic_live.html',width:390,height:844,mobile:true}
  ]){
   const page=await browser.newPage({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'/'+(spec.page||'online.html'),{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof window.NeoDuelUI?.energyStack==='function');
   const geometry=await page.evaluate(()=>{
    document.body.classList.add('duel-active');
    document.getElementById('lobby').classList.add('hidden');
    document.getElementById('duel').classList.remove('hidden');
    const getCard=id=>({
     name:id==='fire'?'Fire Energy':id==='grass'?'Grass Energy':
      id==='water'?'Water Energy':id==='defender'?'Defender':'PlusPower'
    });
    function pokemon(name){
     const node=document.createElement('button');
     node.type='button';node.className='poke';
     node.innerHTML=window.NeoDuelUI.energyStack({
      energies:['fire','grass','water','fire','grass','water'],
      attachedTrainers:[{id:'defender'},{id:'plus'},{id:'defender'},{id:'plus'}]
     },getCard)+'<span class="pokemon-face"><img src="neo_card_back.svg" alt=""></span>'+
       '<strong>'+name+'</strong><span class="hp-count">60 / 60 HP</span>';
     return node;
    }
    for(const id of ['myBench','enemyBench']){
     const el=document.getElementById(id);el.replaceChildren();
     for(let i=0;i<5;i++)el.append(pokemon('Pokémon '+(i+1)));
    }
    for(const id of ['myActive','enemyActive']){
     const el=document.getElementById(id);el.replaceChildren(pokemon('Charmeleon'));
    }
    const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    const active=document.querySelector('#myActive .poke');
    const face=box(active.querySelector('.pokemon-face'));
    const energy=box(active.querySelector('.attached-energy'));
    const tool=box(active.querySelector('.pokemon-tool-card'));
    const bench=document.querySelector('#myBench');
    const cards=[...bench.querySelectorAll(':scope > .poke')].map(box);
    const actions=[...document.querySelectorAll('.turn-actions-panel .turn-actions button')].map(box);
    const desktopSheet=[...document.styleSheets].find(s=>s.href?.includes('duel_desktop.css'));
    const mobileSheet=[...document.styleSheets].find(s=>s.href?.includes('duel_mobile.css'));
    return {
     face,energy,tool,cards,actions,
     benchDisplay:getComputedStyle(bench).display,
     benchCols:getComputedStyle(bench).gridTemplateColumns,
     actionDisplay:getComputedStyle(document.querySelector('.turn-actions-panel .turn-actions')).display,
     desktopSheet:!!desktopSheet,mobileSheet:!!mobileSheet,
     gridEnabled:matchMedia('(max-width: 780px)').matches,
     energyCount:active.querySelectorAll('.attached-energy').length,
     toolCount:active.querySelectorAll('.pokemon-tool-card').length,
     energyOverflow:!!active.querySelector('.energy-overflow'),
     toolOverflow:!!active.querySelector('.tool-overflow')
    };
   });
   assert.equal(geometry.desktopSheet,true);
   assert.equal(geometry.mobileSheet,true);
   assert.equal(geometry.gridEnabled,spec.mobile);
   assert.equal(geometry.energyCount,4);
   assert.equal(geometry.toolCount,3);
   assert.equal(geometry.energyOverflow,true);
   assert.equal(geometry.toolOverflow,true);
   assert.ok(geometry.energy.x<geometry.face.x,'Energy must peek left of Pokémon');
   assert.ok(geometry.tool.right>geometry.face.right,'Trainer must peek right of Pokémon');
   assert.ok(Math.abs(geometry.energy.height-geometry.face.height)<4,'Energy should match Pokémon art height');
   assert.ok(Math.abs(geometry.tool.height-geometry.face.height)<4,'Trainer should match Pokémon art height');
   assert.equal(geometry.cards.length,5);
   for(let i=1;i<5;i++)
    assert.ok(geometry.cards[i].x>=geometry.cards[i-1].right-2,
     'Bench slots must not overlap at '+spec.width+'px');
   if(spec.mobile){
    assert.equal(geometry.benchDisplay,'grid','Mobile Bench must be a 5-slot grid');
    assert.equal(geometry.actionDisplay,'grid','Touch commands must use a separate 2-row grid');
    assert.ok(geometry.actions.every(a=>a.height>=38),'Touch actions must not shrink below 38px');
   }else assert.equal(geometry.benchDisplay,'flex','Desktop Bench should use the wider fan');
   await page.screenshot({path:path.join(out,'duel-layout-'+spec.name+'.png'),fullPage:true});
   assert.deepEqual(errors,[],spec.name+' has JavaScript errors');
   console.log('PASS duel responsive '+spec.name+' '+spec.width+'x'+spec.height);
   await page.close();
  }
  // Real duel controllers must rebuild the hand after the user closes it.
  // A synthetic DOM-only toggle would miss the previous stateful bug.
  const reopen=async (page,label)=>{
   await page.locator('#duel:not(.hidden)').waitFor({timeout:25000});
   const fan=page.locator('#handFan'),cards=page.locator('#handFan .hand-fan-card');
   await cards.first().waitFor({state:'visible',timeout:25000});
   const original=await cards.count();assert.ok(original>0,label+' needs actual cards');
   await page.locator('#handToggle').click();
   assert.equal(await fan.isVisible(),false,label+' closing should hide the hand');
   assert.equal(await page.locator('#handToggle').getAttribute('aria-expanded'),'false');
   await page.locator('#handToggle').click();
   await cards.first().waitFor({state:'visible',timeout:6000});
   assert.equal(await cards.count(),original,label+' reopening must rebuild every card');
   assert.equal(await page.locator('#handToggle').getAttribute('aria-expanded'),'true');
   console.log('PASS mobile hand close/reopen '+label);
  };
  const cpu=await browser.newPage({viewport:{width:390,height:844}});
  await cpu.goto(url+'/classic_live.html',{waitUntil:'domcontentloaded'});
  await cpu.locator('#newDuel').click();
  await reopen(cpu,'CPU / RPG');
  await cpu.close();

  const host=await browser.newPage({viewport:{width:390,height:844}});
  const guest=await browser.newPage({viewport:{width:390,height:844}});
  await Promise.all([host.goto(url+'/online.html'),guest.goto(url+'/online.html')]);
  await host.locator('#nickname').fill('MobileHost');
  await host.locator('#createRoom').click();
  await host.locator('#roomCode').waitFor({state:'visible',timeout:25000});
  const room=(await host.locator('#roomCode').innerText()).trim();
  await guest.locator('#nickname').fill('MobileGuest');
  await guest.locator('#joinCode').fill(room);
  await guest.locator('#joinRoom').click();
  await guest.locator('#roomCode').waitFor({state:'visible',timeout:25000});
  await host.locator('#readyBtn').click();
  await guest.locator('#readyBtn').click();
  await host.locator('#startMatch:enabled').waitFor({state:'visible',timeout:25000});
  await host.locator('#startMatch').click();
  await reopen(host,'online');
  await host.close();await guest.close();
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
