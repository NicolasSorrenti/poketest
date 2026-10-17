'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
const {ClassicLocalService}=require('./classic_local_service');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const root=`http://127.0.0.1:${server.address().port}`;
 const req=async(route,{token,body}={})=>{
  const r=await fetch(root+'/api/online/'+route,{method:body?'POST':'GET',headers:{...(token?{'X-Duel-Token':token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,data:await r.json()};
 };
 try{
  let r=await req('create',{body:{name:'Host',deck:'blackout'}});assert.equal(r.status,200);const code=r.data.code,hostToken=r.data.token;
  r=await req('join',{body:{code,name:'Guest',deck:'brushfire'}});assert.equal(r.status,200);const guestToken=r.data.token;
  assert.equal(r.data.you,1);assert.equal(r.data.players[1].deck,'brushfire');
  // The invitee may change their deck *after joining*, not just on the pre-join page.
  r=await req('deck',{token:guestToken,body:{code,revision:1,deck:'overgrowth'}});
  assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.players[1].deck,'overgrowth');
  let host=await req('state?code='+code,{token:hostToken});assert.equal(host.data.players[0].deck,'blackout');assert.equal(host.data.players[1].deck,'overgrowth');
  // A bad choice does not change the saved selection or revision.
  r=await req('deck',{token:guestToken,body:{code,revision:2,deck:'not_a_real_deck'}});assert.equal(r.status,400);
  r=await req('deck',{body:{code,revision:2,deck:'zap'}});assert.equal(r.status,401);
  r=await req('deck',{token:'not-the-real-token',body:{code,revision:2,deck:'zap'}});assert.equal(r.status,401);
  r=await req('deck',{token:guestToken,body:{code,revision:1,deck:'zap'}});assert.equal(r.status,409);
  host=await req('state?code='+code,{token:hostToken});assert.equal(host.data.revision,2);assert.equal(host.data.players[1].deck,'overgrowth');
  // Both players may change only their own deck and cannot change after starting.
  r=await req('deck',{token:hostToken,body:{code,revision:2,deck:'zap'}});
  assert.equal(r.status,200);assert.equal(r.data.players[0].deck,'zap');assert.equal(r.data.players[1].deck,'overgrowth');
  r=await req('ready',{token:hostToken,body:{code,revision:3,ready:true}});assert.equal(r.status,200);
  r=await req('ready',{token:guestToken,body:{code,revision:4,ready:true}});assert.equal(r.status,200);
  assert.deepEqual(r.data.players.map(p=>p.ready),[true,true]);
  // Changing the deck after both players clicked Ready clears both confirmations.
  r=await req('deck',{token:guestToken,body:{code,revision:5,deck:'power_reserve'}});assert.equal(r.status,200);
  assert.deepEqual(r.data.players.map(p=>p.ready),[false,false]);
  r=await req('start',{token:hostToken,body:{code,revision:6}});assert.equal(r.status,400);
  // A saved custom deck is also supported and cannot expose raw cards in the lobby.
  const customDeck=new ClassicLocalService().decklist('brushfire');assert.equal(customDeck.length,60);
  r=await req('deck',{token:guestToken,body:{code,revision:6,deck:'custom',customDeck}});assert.equal(r.status,200);
  assert.equal(r.data.players[1].deck,'custom');assert.equal(JSON.stringify(r.data.players).includes('base1-'),false);
  r=await req('deck',{token:guestToken,body:{code,revision:7,deck:'custom',customDeck:[]}});assert.equal(r.status,400);
  assert.equal((await req('state?code='+code,{token:guestToken})).data.revision,7);
  r=await req('ready',{token:hostToken,body:{code,revision:7,ready:true}});assert.equal(r.status,200);
  r=await req('ready',{token:guestToken,body:{code,revision:8,ready:true}});assert.equal(r.status,200);
  r=await req('start',{token:hostToken,body:{code,revision:9}});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.started,true);
  assert.deepEqual(r.data.counts,[60,60]);assert.equal(r.data.view.players[1].hand,undefined);
  const guestView=await req('state?code='+code,{token:guestToken});assert.equal(guestView.data.view.players[0].hand,undefined);
  r=await req('deck',{token:guestToken,body:{code,revision:10,deck:'zap'}});assert.equal(r.status,400);assert.match(r.data.error,/after the duel has started/i);
  // The HTML really exposes controls, and browser script wires the button to the new endpoint.
  const page=await (await fetch(root+'/online.html')).text();
  const js=await (await fetch(root+'/online.js')).text();
  for(const id of ['roomDeck','saveRoomDeck','roomDeckHint','myDeckStatus'])assert.ok(page.includes(`id="${id}"`),id);
  assert.match(js,/lobbyAction\('deck',/);
  assert.match(js,/lobbyDeckDraft/);
  console.log('PASS v0.37 online deck choice: guest chooses after invite, host independent, invalid/stale/rejected changes, ready reset, custom deck, privacy and start lock');
 }finally{await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
