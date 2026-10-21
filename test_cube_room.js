'use strict';
const assert=require('node:assert/strict');
const {CubeRoomService}=require('./cube_room_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon}=require('./core_rules');
const {validateBuild}=require('./cube_draft');

function selectedBasic(state){
 const basic=state.pack.find(c=>isBasicPokemon(CATALOG.get(c.id)));
 return basic||state.pack[0];
}
function assertPrivate(state){
 assert(!Object.hasOwn(state,'rounds'));
 assert(!Object.hasOwn(state,'picks'));
 assert(!Object.hasOwn(state,'tokens'));
 for(const seat of state.seats)assert(!Object.hasOwn(seat,'token'));
}
function fourHuman(){
 const srv=new CubeRoomService();
 const host=srv.create({name:'Alice',seed:541}),code=host.code;
 assert.equal(host.seat,0);
 assert.equal(host.status,'lobby');
 assert.throws(()=>srv.state(code,'bad-token'),/Unauthorized/);
 assert.throws(()=>srv.start(code,host.token),/two human/);
 const players=[host,srv.join({code,name:'Bob'}),srv.join({code,name:'Carol'}),srv.join({code,name:'Dan'})];
 assert.equal(players[3].seat,3);
 assert.throws(()=>srv.join({code,name:'Eve'}),/full/);
 assert.throws(()=>srv.start(code,players[1].token),/host/);
 assert.throws(()=>srv.start(code,host.token),/ready/);
 for(const p of players)srv.ready(code,p.token,true);
 let state=srv.start(code,host.token);
 assert.equal(state.status,'draft');
 assert.equal(state.seats.length,4);
 assert.equal(state.pack.length,15);
 assert.throws(()=>srv.join({code,name:'Intruder'}),/already started/);
 const a=srv.state(code,host.token),b=srv.state(code,players[1].token);
 assert.equal(a.seat,0);assert.equal(b.seat,1);
 assert.equal(b.drafted.length,0);
 assertPrivate(b);
 assert.throws(()=>srv.pick(code,players[1].token,{id:a.pack[0].id,round:99,pick:0}),/Stale/);
 let turns=0;
 while(turns<60){
  const current=players.map(p=>srv.state(code,p.token));
  for(let i=0;i<players.length;i++){
   const before=current[i];
   if(turns===0&&i===0){
    assert.throws(()=>srv.pick(code,players[0].token,{id:'unowned',round:0,pick:0}),/current pack/);
   }
   const card=selectedBasic(before);
   const after=srv.pick(code,players[i].token,{id:card.id,round:before.round,pick:before.pick});
   if(i===0&&turns===0){
    assert.equal(after.waiting,true);
    assert.equal(after.pack.length,15,'Reserved choice remains visible until pack passes');
    assert.equal(after.selectedId,card.id);
    assert.equal(srv.state(code,players[1].token).pack.length,15);
    const alternative=after.pack.find(x=>x.id!==card.id);
    if(alternative){
     const changed=srv.pick(code,players[0].token,{id:alternative.id,round:0,pick:0});
     assert.equal(changed.selectedId,alternative.id,'Seat may change its pending selection');
     assert.equal(changed.drafted.length,1);
     assert.equal(changed.pack.length,15);
    }
   }
  }
  turns++;
 }
 state=srv.state(code,players[0].token);
 assert.equal(state.finished,true);
 assert.equal(state.drafted.length,60);
 assert.equal(state.seats.every(s=>s.pickCount===60),true);
 assertPrivate(state);
 for(const p of players){
  const v=srv.state(code,p.token);
  assert.equal(v.drafted.length,60);
  assert.equal(v.status,'build');
  const maybe=v.suggestedDeck;
  if(maybe){
   assert.equal(validateBuild(v.drafted.map(c=>c.id),maybe).valid,true);
   const locked=srv.submit(code,p.token,maybe);
   assert.equal(locked.seats[p.seat].deckReady,true);
   assert.throws(()=>srv.submit(code,p.token,maybe),/already locked/);
  }
 }
 const after=srv.state(code,players[0].token);
 assert.equal(after.allDecksReady,true);
 const other=srv.state(code,players[1].token);
 assert(!Object.hasOwn(other,'opponentDecks'));
 assert.notDeepEqual(after.ownDeck,other.ownDeck);
 console.log('PASS Cube room: 4 humans, 60 simultaneous picks, privacy, build and reconnect');
}
function mixed(){
 const srv=new CubeRoomService();
 assert.throws(()=>srv.create({name:'Invalid',difficulty:0}),/difficulty/);
 assert.throws(()=>srv.create({name:'Invalid',difficulty:6}),/difficulty/);
 const host=srv.create({name:'Host',seed:475,difficulty:4});
 assert.equal(host.difficulty,4);
 const guest=srv.join({code:host.code,name:'Friend'});
 srv.ready(host.code,host.token,true);
 srv.ready(host.code,guest.token,true);
 let a=srv.start(host.code,host.token);
 assert.equal(a.seats.length,4);
 assert.equal(a.seats.filter(s=>s.cpu).length,2);
 assert.equal(a.difficulty,4);
 assert(a.pack.some(c=>c.id===a.recommendedId));
 assert.equal(a.seats[2].name,'Cube CPU A');
 for(let i=0;i<60;i++){
  const first=srv.state(host.code,host.token);
  const second=srv.state(host.code,guest.token);
  srv.pick(host.code,host.token,{id:selectedBasic(first).id,round:first.round,pick:first.pick});
  a=srv.pick(host.code,guest.token,{id:selectedBasic(second).id,round:second.round,pick:second.pick});
  assert.equal(a.seats[2].pickCount,i+1,'CPU must draft when both humans have picked');
  if(!a.finished)assert(a.pack.some(c=>c.id===a.recommendedId));
 }
 assert.equal(a.status,'build');
 assert.equal(a.seats.every(s=>s.pickCount===60),true);
 assert.throws(()=>srv.pick(host.code,guest.token,{id:'base1-1',round:3,pick:14}),/complete/);
 console.log('PASS Cube room: 2 humans + 2 CPUs, hidden packs and automated pass');
}
fourHuman();mixed();