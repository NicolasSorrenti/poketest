'use strict';
const assert=require('node:assert/strict');
const {CubeRoomService}=require('./cube_room_service');
const {ClassicLocalService}=require('./classic_local_service');
const {ClassicOnlineService}=require('./classic_online_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon}=require('./core_rules');

function run(humans){
 let clock=100000;
 const classic=new ClassicLocalService({maxSessions:20});
 const online=new ClassicOnlineService({maxRooms:20,now:()=>clock});
 let cpuCalls=0,cpuLevels=[];
 const rooms=new CubeRoomService({classic,online,now:()=>clock,simulateCpu:(a,b,opts)=>{
  cpuCalls++;cpuLevels.push([opts.levelA,opts.levelB]);return {winner:cpuCalls%2,method:'played',actions:32};
 }});
 const players=[rooms.create({name:'Player 1',seed:145,preset:'balanced',difficulty:5})];
 assert.equal(players[0].difficulty,5);
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
 for(const p of players){
  const view=rooms.state(code,p.token);
  assert.equal(view.finished,true);
  assert.equal(view.suggestedDeck.length,40);
  rooms.submit(code,p.token,view.suggestedDeck);
 }
 const first=rooms.state(code,players[0].token);
 assert.equal(first.status,'tournament');
 assert.equal(first.tournament.totalMatches,6);
 assert.equal(first.tournament.matches.length,6);
 if(humans===4){
  assert.deepEqual(first.tournament.activeMatches.map(m=>m.id),[1,2],
   'Two disjoint human games should begin in parallel');
  const view=rooms.state(code,players[0].token);
  assert.equal(view.tournament.matches.find(m=>m.id===2).spectatable,true);
  assert.throws(()=>rooms.watch(code,players[0].token,{matchId:1}),/Use your match link/);
  const spectator=rooms.watch(code,players[0].token,{matchId:2});
  assert.equal(online.session(spectator.code,spectator.token).side,null);
  assert.notEqual(spectator.token,view.tournament.yourMatch.token);
  assert.throws(()=>rooms.watch(code,'bogus',{matchId:2}),/Unauthorized/);
 }
 const posted=rooms.chatMessage(code,players[0].token,{text:'Nice draft!'});
 assert(posted.chatMessages.some(x=>x.name==='Player 1'&&x.text==='Nice draft!'));
 assert.throws(()=>rooms.chatMessage(code,players[0].token,{text:'spam'}),/wait/i);
 clock+=1000;
 assert.throws(()=>rooms.chatMessage(code,players[0].token,{text:'x'.repeat(281)}),/280/);
 assert.throws(()=>rooms.chatMessage(code,players[0].token,{text:'\u0000'}),/printable/);
 let loops=0,alreadyComplete=new Set();
 while(true){
  const current=rooms.state(code,players[0].token);
  if(current.tournament.finished)break;
  loops++;assert(loops<15,'Six pairings must finish without deadlock');
  const fixtures=current.tournament.activeMatches;
  assert(fixtures.length>=1&&fixtures.length<=2,'At most two live matches');
  assert.equal(new Set(fixtures.flatMap(m=>m.seats)).size,fixtures.length*2,
   'No human can be assigned to overlapping matches');
  for(const p of players){
   const v=rooms.state(code,p.token);
   const expected=fixtures.find(m=>m.seats.includes(v.seat));
   assert.equal(!!v.tournament.yourMatch,!!expected,'Private credentials for active seats only');
   if(expected){
    assert.equal(v.tournament.yourMatch.id,expected.id);
    assert.equal(typeof v.tournament.yourMatch.token,'string');
    assert(v.tournament.yourMatch.token.length>24);
   }
   assert(!Object.hasOwn(v.tournament,'tokens'));
  }
  // Conclude all active games without polling between them to prove truly
  // concurrent matching (and avoid artificially serializing the schedule).
  const internal=rooms.room(code).tournament.active;
  for(const m of fixtures){
   const session=internal.get(m.id);
   assert(session,'Active fixture has a stored authoritative duel session');
   if(session.kind==='online'){
    const game=online.findRoom(session.code).game;
    assert.equal(game.deckSize,40);
    assert.equal(game.prizeCount,4);
    assert.equal(game.format,'online-preview');
    game.over=true;game.winner=m.id%2;
   }else{
    const token=session.tokens[session.seats.indexOf(session.humanSeat)];
    assert.equal(classic.session(token).cpuConfig.level,5,'Host CPU difficulty must reach matches');
     const game=classic.session(token).game;
    assert.equal(game.deckSize,40);assert.equal(game.prizeCount,4);
    game.over=true;game.winner=m.id%2;
   }
  }
  const after=rooms.state(code,players[0].token);
  assert(after.tournament.matchIndex>=current.tournament.matchIndex+fixtures.length);
  for(const m of after.tournament.matches.filter(m=>m.status==='complete')){
   assert(!alreadyComplete.has(m.id)||current.tournament.matches.find(x=>x.id===m.id).status==='complete');
   alreadyComplete.add(m.id);
  }
 }
 const t=rooms.state(code,players[0].token).tournament;
 assert.equal(t.matchIndex,6);
 assert.equal(t.matches.filter(m=>m.status==='complete').length,6);
 assert.equal(new Set(t.matches.map(m=>m.seats.join(','))).size,6);
 assert.equal(t.standings.length,4);
 for(const row of t.standings)assert.equal(row.played,3,'Every seat plays every opponent once');
 assert.equal(t.standings.reduce((x,r)=>x+r.wins,0),6);
 assert.equal(t.standings.reduce((x,r)=>x+r.losses,0),6);
 assert.equal(cpuCalls,humans===4?0:humans===3?0:1);
  assert(cpuLevels.every(x=>x[0]===5&&x[1]===5),'CPU-only fixtures respect difficulty');
 assert.deepEqual(t.activeMatches,[]);
 assert.deepEqual(rooms.state(code,players[0].token).tournament.matches,t.matches,
  'State polling must be idempotent after tournament completion');
 console.log('PASS '+humans+' humans: parallel 40/4 fixtures, private tokens, spectating, chat, final standings');
}
run(4);run(3);run(2);
