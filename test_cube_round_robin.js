'use strict';
const assert=require('node:assert/strict');
const {CubeRoomService}=require('./cube_room_service');
const {ClassicLocalService}=require('./classic_local_service');
const {ClassicOnlineService}=require('./classic_online_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon}=require('./core_rules');

function run(humans){
 const classic=new ClassicLocalService({maxSessions:20});
 const online=new ClassicOnlineService({maxRooms:20});
 let cpuCalls=0;
 const rooms=new CubeRoomService({classic,online,simulateCpu:()=>{
  cpuCalls++;return {winner:cpuCalls%2,method:'played',actions:32};
 }});
 const players=[rooms.create({name:'Player 1',seed:145,preset:'balanced'})];
 const code=players[0].code;
 for(let i=1;i<humans;i++)players.push(rooms.join({code,name:'Player '+(i+1)}));
 for(const p of players)rooms.ready(code,p.token,true);
 rooms.start(code,players[0].token);
 for(let pick=0;pick<60;pick++){
  for(const p of players){
   const v=rooms.state(code,p.token);
   const choose=v.pack.find(c=>isBasicPokemon(CATALOG.get(c.id)))||v.pack[0];
   rooms.pick(code,p.token,{id:choose.id,round:v.round,pick:v.pick});
  }
 }
 for(let i=0;i<players.length;i++){
  const p=players[i],view=rooms.state(code,p.token);
  assert.equal(view.finished,true);assert.equal(view.suggestedDeck.length,40);
  rooms.submit(code,p.token,view.suggestedDeck);
 }
 let current=rooms.state(code,players[0].token);
 assert.equal(current.status,'tournament');
 assert.equal(current.tournament.totalMatches,6);
 assert.equal(current.tournament.matches.length,6);
 let loops=0;
 while(!current.tournament.finished){
  loops++;assert(loops<10,'Six fixtures should terminate');
  const active=current.tournament.activeMatch;
  assert(active,'Unfinished tournament has active match');
  const [a,b]=active.seats;
  const before=rooms.state(code,players[0].token);
  assert.equal(before.tournament.activeMatch.id,active.id,'Repeated polling must not duplicate fixture');
  const room=rooms.room(code),internal=room.tournament.current;
  assert(internal);
  for(const p of players){
   const v=rooms.state(code,p.token);
   const participates=[a,b].includes(v.seat);
   assert.equal(!!v.tournament.yourMatch,participates,'Credentials must remain seat-private');
   if(participates){
    assert.equal(typeof v.tournament.yourMatch.token,'string');
    assert(v.tournament.yourMatch.token.length>24);
   }
   assert(!Object.hasOwn(v.tournament,'tokens'));
   assert(!Object.hasOwn(v.tournament.activeMatch,'tokens'));
  }
  if(internal.kind==='online'){
   const g=online.findRoom(internal.code).game;
   assert.equal(g.deckSize,40);assert.equal(g.prizeCount,4);
   assert.equal(g.format,'online-preview');
   // Check credentials before the match ends: a state poll after a KO
   // legitimately advances the bracket and revokes old match links.
   const assigned=rooms.state(code,players[a].token).tournament.yourMatch;
   const other=rooms.state(code,players[b].token).tournament.yourMatch;
   assert.equal(online.session(internal.code,assigned.token).side,0);
   assert.equal(online.session(internal.code,other.token).side,1);
   g.over=true;g.winner=active.id%2;
  }else{
   assert.equal(internal.kind,'cpu');
   const humanSeat=internal.humanSeat;
   const token=rooms.state(code,players[humanSeat].token).tournament.yourMatch.token;
   const g=classic.session(token).game;
   assert.equal(g.deckSize,40);assert.equal(g.prizeCount,4);
   g.over=true;g.winner=active.id%2;
   const cpu=active.seats.find(s=>s!==humanSeat);
   assert.equal(internal.cpuSeat,cpu);
  }
  current=rooms.state(code,players[0].token);
 }
 const t=current.tournament;
 assert.equal(t.matchIndex,6);
 assert.equal(t.matches.filter(m=>m.status==='complete').length,6);
 assert.equal(new Set(t.matches.map(m=>m.seats.join(','))).size,6);
 assert.equal(t.standings.length,4);
 for(const row of t.standings)assert.equal(row.played,3,'Every seat must play each opponent once');
 assert.equal(t.standings.reduce((x,r)=>x+r.wins,0),6);
 assert.equal(t.standings.reduce((x,r)=>x+r.losses,0),6);
 assert.deepEqual(t.standings.map(x=>x.points),[...t.standings.map(x=>x.points)].sort((a,b)=>b-a));
 assert.equal(cpuCalls,humans===4?0:humans===3?0:1);
 assert.equal(current.tournament.activeMatch,null);
 const snapshot=rooms.state(code,players[0].token);
 assert.deepEqual(snapshot.tournament.matches,t.matches,'Complete fixture is idempotent');
 console.log('PASS '+humans+' humans, '+(4-humans)+' CPUs: 6 authoritative 40/4 fixtures, private tokens and final standings');
}
run(4);run(3);run(2);
