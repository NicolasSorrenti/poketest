'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const page=await fetch(base+'/cube_room.html');
  assert.equal(page.status,200);
  const html=await page.text();
  for(const id of ['createRoom','joinRoom','roomCode','roster','pack','buildChoices','lockDeck'])
   assert(html.includes('id="'+id+'"'),'Missing multiplayer interface '+id);
  assert.equal((await fetch(base+'/cube_room_client.js')).status,200);
  assert.equal((await fetch(base+'/cube_room_service.js')).status,404,'Server room state must not be public');
  const req=async(path,payload,{code,token,origin}={})=>{
   const res=await fetch(base+'/api/cube-room/'+path,{
    method:payload===undefined?'GET':'POST',
    headers:{...(payload===undefined?{}:{'Content-Type':'application/json'}),
      ...(code?{'X-Cube-Room-Code':code}:{}),...(token?{'X-Cube-Room-Token':token}:{}),
      ...(origin?{Origin:origin}:{})},
    ...(payload===undefined?{}:{body:JSON.stringify(payload)})
   });
   return {status:res.status,body:await res.json()};
  };
  assert.equal((await req('state')).status,401);
  assert.equal((await req('create',{name:'Eve'},{origin:'https://evil.example'})).status,403);
  const h=await req('create',{name:'Player A',seed:911,preset:'rocket'});
  assert.equal(h.status,200);
  const host=h.body,room=h.body.code;
  assert.equal(host.preset,'rocket');
  const b=await req('join',{code:room,name:'Player B'});
  assert.equal(b.status,200);
  const guest=b.body;
  assert.notEqual(host.token,guest.token);
  assert.equal((await req('state',undefined,{code:room,token:'f'.repeat(43)})).status,401);
  assert.equal((await req('start',{}, {code:room,token:guest.token})).status,400);
  assert.equal((await req('ready',{ready:true},{code:room,token:host.token})).status,200);
  assert.equal((await req('ready',{ready:true},{code:room,token:guest.token})).status,200);
  const started=await req('start',{}, {code:room,token:host.token});
  assert.equal(started.status,200);
  assert.equal(started.body.pack.length,15);
  assert.equal(started.body.seats.length,4);
  const other=await req('state',undefined,{code:room,token:guest.token});
  assert.equal(other.body.drafted.length,0);
  assert.equal(other.body.preset,'rocket');
  assert(!('picks' in other.body));
  assert(!('token' in other.body.seats[0]));
  const first=started.body.pack[0].id;
  const result=await req('pick',{id:first,round:0,pick:0},{code:room,token:host.token});
  assert.equal(result.status,200,'Host pick failed: '+result.body.error);
  assert.equal(result.body.waiting,true);
  assert.equal(result.body.pack.length,0);
  const repeated=await req('pick',{id:first,round:0,pick:0},{code:room,token:host.token});
  assert.equal(repeated.status,400,'Duplicate pick must be rejected');
  const fromGuest=await req('state',undefined,{code:room,token:guest.token});
  assert.equal(fromGuest.body.pack.length,15,'Guest still has private pack');
  const guestPick=await req('pick',{id:fromGuest.body.pack[0].id,round:0,pick:0},{code:room,token:guest.token});
  assert.equal(guestPick.status,200);
  assert.equal(guestPick.body.seats[2].pickCount,1);
  assert.equal(guestPick.body.seats[3].pickCount,1);
  assert.equal(guestPick.body.pick,1);
  assert.equal(guestPick.body.pack.length,14);
  assert.equal((await req('submit',{deck:[]},{code:room,token:guest.token})).status,400);
  console.log('PASS Cube multiplayer HTTP: invite, auth, private packs, concurrent picks and CPU seats');
 }finally{await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
