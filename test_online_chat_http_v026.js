'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/api/online/';
 const req=async(route,body,token,method=body?'POST':'GET')=>{
  const r=await fetch(base+route,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{'X-Duel-Token':token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,body:await r.json()};
 };
 try{
  const host=(await req('create',{deck:'brushfire',name:'Host'})).body;
  const guest=(await req('join',{code:host.code,deck:'blackout',name:'Guest'})).body;
  let state=(await req('state?code='+host.code,null,host.token)).body;
  assert.equal(state.revision,1);assert.deepEqual(state.chatMessages,[]);
  let r=await req('chat',{code:host.code,text:'Hello <b>Guest</b>'},host.token);
  assert.equal(r.status,200);assert.equal(r.body.chatMessages[0].text,'Hello <b>Guest</b>');
  assert.equal((await req('state?code='+host.code,null,guest.token)).body.chatMessages[0].name,'Host');
  assert.equal((await req('state?code='+host.code,null,host.token)).body.revision,1,'Chat must not invalidate an action revision');
  r=await req('chat',{code:host.code,text:'other message'},host.token);assert.equal(r.status,400,'Rate-limited chat');
  r=await req('chat',{code:host.code,text:'Hello from Guest'},guest.token);assert.equal(r.status,200);
  r=await req('chat',{code:host.code,text:'unauthorized'},'wrong-token');assert.equal(r.status,401);
  r=await req('chat',{code:host.code,text:'a'.repeat(351)},guest.token);assert.equal(r.status,400);
  r=await req('chat',{code:host.code,text:'ok'},undefined);assert.equal(r.status,401);
  const stranger=(await req('create',{deck:'blackout',name:'Other Room'})).body;
  assert.equal((await req('state?code='+stranger.code,null,stranger.token)).body.chatMessages.length,0);
  assert.equal((await req('state?code='+host.code,null,stranger.token)).status,401);
  console.log('PASS v0.26 HTTP: two-user chat, separate rooms, no stale revisions, XSS-safe payload transport, authentication, spam controls');
 }finally{await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
