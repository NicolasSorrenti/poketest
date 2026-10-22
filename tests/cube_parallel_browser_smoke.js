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
  const origin='http://127.0.0.1:'+server.address().port;
  const players=[cubeRooms.create({name:'Alex',seed:576,preset:'foundations'})];
  for(const name of ['Blair','Casey','Drew'])players.push(cubeRooms.join({code:players[0].code,name}));
  const code=players[0].code;
  for(const p of players)cubeRooms.ready(code,p.token,true);
  cubeRooms.start(code,players[0].token);
  for(let i=0;i<60;i++){
   for(const p of players){
    const v=cubeRooms.state(code,p.token);
    const best=v.pack.find(x=>isBasicPokemon(CATALOG.get(x.id)))||v.pack[0];
    cubeRooms.pick(code,p.token,{id:best.id,round:v.round,pick:v.pick});
   }
  }
  for(const p of players){
   const v=cubeRooms.state(code,p.token);
   cubeRooms.submit(code,p.token,v.suggestedDeck);
  }
  const t=cubeRooms.state(code,players[0].token).tournament;
  assert.deepEqual(t.activeMatches.map(x=>x.id),[1,2],
   'Parallel fixture 1 and fixture 2 should both start');
  const page=await browser.newPage({viewport:{width:1200,height:850}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(data=>sessionStorage.setItem('neoCampusCubeRoomV1',JSON.stringify(data)),{
   code,token:players[0].token
  });
  await page.goto(origin+'/cube_room.html?room='+code);
  await page.locator('#rrFixtures .rr-match.active').first().waitFor({timeout:20000});
  assert.equal(await page.locator('#rrFixtures .rr-match.active').count(),2);
  assert.equal(await page.locator('#rrLiveFixtures .rr-match.active').count(),2);
  assert.equal(await page.locator('#rrHistorySection').isVisible(),false);
  assert.equal(await page.locator('#roomLobbyPanel').isVisible(),false);
  assert.equal(await page.locator('#draftArea').isVisible(),false);
  await page.locator('#cubeChatInput').fill('Watching the other table!');
  await page.locator('#cubeChatForm button').click();
  await page.waitForFunction(()=>document.querySelector('#cubeChatMessages')?.textContent.includes('Watching the other table!'));
  assert.equal((cubeRooms.state(code,players[1].token).chatMessages||[]).at(-1).text,'Watching the other table!');

  const game1=cubeRooms.room(code).tournament.active.get(1);
  const r1=online.findRoom(game1.code);
  r1.game.over=true;r1.game.winner=0;online.bump(r1);
  cubeRooms.state(code,players[0].token);
  await page.waitForFunction(()=>document.querySelector('#rrProgress')?.textContent.includes('1 of 6'));
  await page.locator('#rrFixtures .rr-match.active .watch-btn').waitFor({timeout:10000});
  assert.equal(await page.locator('#rrFixtures .rr-match.active').count(),1);
  assert.equal(await page.locator('#rrCompletedFixtures .rr-match').count(),1);
  assert((await page.locator('#rrRecent').innerText()).includes('Last result · Match 1'));
  await page.locator('.rr-match.active .watch-btn').click();
  await page.waitForURL(/online\.html\?cubeRoom=/,{timeout:10000});
  await page.waitForFunction(()=>sessionStorage.getItem('neoOnlineToken')&&
   document.querySelector('#phaseText')?.textContent.includes('Watching'),
   null,{timeout:15000});
  const credentials=await page.evaluate(()=>({
   token:sessionStorage.getItem('neoOnlineToken'),
   room:sessionStorage.getItem('neoOnlineRoom')
  }));
  assert.equal(online.session(credentials.room,credentials.token).side,null,'Watcher must not become a player');
  const game2=cubeRooms.room(code).tournament.active.get(2);
  assert.equal(credentials.room,game2.code);
  const r2=online.findRoom(game2.code);
  r2.game.over=true;r2.game.winner=1;online.bump(r2);
  await page.waitForURL(/cube_room\.html\?room=/,{timeout:16000});
  await page.waitForFunction(()=>document.querySelector('#rrProgress')?.textContent.includes('2 of 6'),
   null,{timeout:15000});
  assert.equal(await page.locator('#rrFixtures .rr-match.active').count(),2,
   'Next pairings should start simultaneously');
  assert.deepEqual(errors,[]);
  console.log('PASS Cube parallel browser: 4 players, 2 parallel matches, room chat, read-only spectating and automatic return');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
