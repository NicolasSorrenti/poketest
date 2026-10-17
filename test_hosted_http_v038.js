'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base=`http://127.0.0.1:${server.address().port}`;
 const request=async(path,body,token)=>{
  const r=await fetch(base+'/api/online/'+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'X-Duel-Token':token}:{})},body:JSON.stringify(body)});
  return {status:r.status,...(await r.json())};
 };
 try{
  assert.equal((await fetch(base+'/online_compact.css')).status,200);
  assert.equal((await fetch(base+'/server.js')).status,404);
  const create=await request('create',{code:'ABC123',deck:'brushfire',name:'Alice'});
  assert.equal(create.status,200);assert.equal(create.code,'ABC123');
  const join=await request('join',{code:create.code,deck:'blackout',name:'Bob'});
  assert.equal(join.status,200);assert.equal(join.you,1);
  const rename=await request('name',{code:create.code,revision:join.revision,name:'New Bob'},join.token);
  assert.equal(rename.players[1].name,'New Bob');
  const guest=await request('join',{code:create.code,deck:'blackout',name:'Viewer'});
  assert.equal(guest.status,200);assert.equal(guest.spectator,true);
  const forbidden=await request('name',{code:create.code,revision:rename.revision,name:'Cheater'},guest.token);
  assert.equal(forbidden.status,401);
  const chat=await request('chat',{code:create.code,text:'Hello from the audience'},guest.token);
  assert.equal(chat.status,200);assert.equal(chat.chatMessages.at(-1).name,'Viewer');
  console.log('PASS hosted v0.38 HTTP: Render-ready CSS, custom room code, guest rename, third-seat spectator auth and chat');
 }finally{await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
