'use strict';
// Run with Playwright installed. Optionally set RPG_BROWSER_EXECUTABLE to a local Chromium binary.
// The roster fixture grants test-only access to Barb; production account authorization is unchanged.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {server}=require('../server'),REGISTRY=require('../rpg_character_packs.generated');
const source=fs.readFileSync(path.join(__dirname,'../rpg.js'),'utf8');
const instrumentation=`
window.__barbTest={
 seed(id){
  const e=SLICE.byId(id),pack=window.NeoRpgCharacterPacks.byId('barb');
  let day=21;while(day<=90&&pack.schedule[(day-1)%7][e.slot]!==e.place)day++;
  Object.assign(state,{day,slot:e.slot,location:e.place,met_barb:true,selected:'barb',
   activeStory:null,activeEncounter:null,activeArc:null,activeSideQuest:null,activeSituation:null,
   pendingDuel:null,activeSliceOfLife:null,sliceOfLifeLastDay:0,sliceOfLifeHistory:[],cgUnlocked:{},cgViewed:{},
   storyDone:{},storyMissed:Object.fromEntries(STORY.events.map(x=>[x.id,true])),
   sliceOfLifeDone:Object.fromEntries(SLICE.scenes.filter(x=>x.npc==='barb'&&x.id!==id).map(x=>[x.id,{day:6,slot:x.slot,choice:1}])),
   relationships:{...state.relationships,barb:{affection:5,trust:5,respect:2,attraction:2,duels:0}},
   bonds:{...state.bonds,barb:{affection:5,trust:5,duels:0}},
   mandatoryEventState:{seen:Object.fromEntries(MANDATORY_EVENTS.map(x=>[x.id,true])),pending:[],active:null}
  });
  scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;
  return beginSliceOfLife('entry','barb');
 },state:()=>state
};
`;
const read=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('neoHarborRpgV1')));
(async()=>{
 let browser;
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.RPG_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/rpg/character-packs',route=>route.fulfill({json:{packs:REGISTRY.packs}}));
  await page.route(/\/rpg\.js(?:\?|$)/,route=>route.fulfill({contentType:'text/javascript',body:source.replace(/\}\)\(\);\s*$/,instrumentation+'})();')}));
  await page.goto(origin+'/rpg.html',{waitUntil:'domcontentloaded'});
  await page.locator('#starterChoices button').first().click();
  await page.waitForFunction(()=>!!window.__barbTest);
  const scenes=REGISTRY.byId('barb').events.filter(e=>e.encounterType==='slice');
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   for(const e of scenes){
    assert.equal(await page.evaluate(id=>window.__barbTest.seed(id),e.id),true,e.id+' can begin');
    const img=page.locator('#rpgSceneCG');
    await img.waitFor({state:'visible'});
    assert.equal(await page.locator('#scene').evaluate(el=>el.classList.contains('has-story-cg')),true,'Event CG is the scene background');
    await img.evaluate(el=>el.decode());
    assert.equal(await img.getAttribute('src'),'/rpg-assets/characters/barb/events/'+e.id+'.webp');
    const dimensions=await img.evaluate(el=>({w:el.naturalWidth,h:el.naturalHeight,fit:getComputedStyle(el).objectFit}));
    assert.deepEqual(dimensions,{w:1672,h:941,fit:'contain'});
    const box=await img.boundingBox();
    assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,'In-scene CG fits '+JSON.stringify(viewport));
    assert.equal((await read(page)).cgUnlocked[e.id],undefined,'preview must not unlock unfinished dialogue');
    for(let i=0;i<8;i++)await page.locator('#choices button').first().click();
    assert.equal(await page.locator('#choices button').count(),3);
    // Reload at the choice prompt, then commit an actual on-screen choice.
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__barbTest);
    await page.locator('#choices button').nth(1).click();
    assert.equal((await read(page)).activeSliceOfLife.choice,1);
    assert.equal(await page.locator('#line').textContent(),e.choices[1].reply);
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__barbTest);
    await page.locator('#choices button').first().click();
    const done=await read(page);
    assert.equal(done.activeSliceOfLife,null);assert.equal(done.sliceOfLifeDone[e.id].choice,1);
    assert.ok(done.cgUnlocked[e.id]);
    for(const [metric,base] of Object.entries({affection:5,trust:5,respect:2,attraction:2,duels:0}))
     assert.equal(done.relationships.barb[metric],base+(e.choices[1].delta[metric]||0),e.id+' '+metric);
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__barbTest);
    await page.locator('#rpgMoreMenu > summary').click();await page.locator('#galleryBtn').click();
    await page.locator('#galleryCharacter').selectOption('barb');
    const tile=page.locator('#galleryGrid button').filter({hasText:e.title});
    assert.equal(await tile.count(),1);await tile.click();
    const gallery=page.locator('#galleryPreview img');await gallery.evaluate(el=>el.decode());
    assert.equal(await gallery.getAttribute('src'),'/rpg-assets/characters/barb/events/'+e.id+'.webp');
    assert.equal(await gallery.evaluate(el=>getComputedStyle(el).objectFit),'contain');
    await page.locator('#galleryClose').click();
    console.log('PASS: '+e.id+' at '+viewport.width+'px');
   }
   console.log('PASS: all '+scenes.length+' Barb CGs as scene backgrounds, actual choice controls, mid-dialogue reloads and saved gallery at '+viewport.width+'×'+viewport.height);
  }
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
