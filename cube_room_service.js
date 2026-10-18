'use strict';
// Seat-authorized multiplayer Cube drafting. No duel engine assumptions here;
// the same four-seat draft can feed human or CPU tournaments in future.
const crypto=require('node:crypto');
const Cube=require('./cube_draft');
const {getPreset}=require('./cube_presets');
const {cpuPick,buildCpuDeck,ENERGY_IDS}=require('./cube_strategy');
const {CATALOG}=require('./headless_duel');
const {makeSchedule,standings}=require('./cube_round_robin');
const {simulateCpuMatch}=require('./cube_bracket');
const LETTERS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode=()=>Array.from(crypto.randomBytes(6),x=>LETTERS[x%LETTERS.length]).join('');
const makeToken=()=>crypto.randomBytes(32).toString('base64url');
const normalizeCode=value=>{
 if(typeof value!=='string'||!/^([A-Z2-9]){6}$/i.test(value.trim()))throw Error('Invalid Cube room code');
 return value.trim().toUpperCase();
};
const normalizeName=(value,fallback)=>{
 const name=String(value??fallback).trim();
 if(!name||name.length>28||/[\x00-\x1f<>]/.test(name))throw Error('Invalid Cube player name');
 return name;
};
class CubeRoomService{
 constructor({now=()=>Date.now(),ttlMs=6*60*60*1000,maxRooms=24,classic=null,online=null,simulateCpu=simulateCpuMatch}={}){
  this.classic=classic;this.online=online;this.simulateCpu=simulateCpu;
  this.rooms=new Map();this.now=now;this.ttlMs=ttlMs;this.maxRooms=maxRooms;
 }
 prune(){for(const [code,room] of this.rooms)if(this.now()-room.updated>this.ttlMs)this.rooms.delete(code);}
 room(code){
  this.prune();
  const result=this.rooms.get(normalizeCode(code));
  if(!result)throw Error('Cube room not found or expired');
  return result;
 }
 authenticated(code,token){
  const room=this.room(code);
  if(typeof token!=='string'||token.length<30)throw Error('Unauthorized Cube seat');
  const seat=room.seats.findIndex(s=>s&&s.token===token&&!s.cpu);
  if(seat<0)throw Error('Unauthorized Cube seat');
  room.updated=this.now();
  return {room,seat};
 }
 create({name='Host',seed,preset='balanced'}={}){
  getPreset(preset);
  this.prune();
  if(this.rooms.size>=this.maxRooms)throw Error('Cube room limit reached');
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid Cube seed');
  let code;do{code=randomCode();}while(this.rooms.has(code));
  const token=makeToken();
  const room={code,preset,seed:seed??crypto.randomBytes(4).readUInt32BE(0),
   seats:[{name:normalizeName(name,'Host'),token,cpu:false,ready:false,deck:null}],
   draft:null,revision:0,updated:this.now()};
  this.rooms.set(code,room);
  return {token,...this.view(room,0)};
 }
 join({code,name='Player'}={}){
  const room=this.room(code);
  if(room.draft)throw Error('Cube draft has already started');
  if(room.seats.length>=4)throw Error('Cube room is full');
  const token=makeToken(),seat=room.seats.length;
  room.seats.push({name:normalizeName(name,'Player '+(seat+1)),token,cpu:false,ready:false,deck:null});
  room.revision++;room.updated=this.now();
  return {token,...this.view(room,seat)};
 }
 ready(code,token,ready){
  const {room,seat}=this.authenticated(code,token);
  if(room.draft)throw Error('Cube draft already started');
  if(typeof ready!=='boolean')throw Error('Ready must be boolean');
  room.seats[seat].ready=ready;room.revision++;
  return this.view(room,seat);
 }
 start(code,token){
  const {room,seat}=this.authenticated(code,token);
  if(seat!==0)throw Error('Only the Cube host can start');
  if(room.draft)throw Error('Cube draft already started');
  const humans=room.seats.length;
  if(humans<2)throw Error('At least two human players are required');
  if(!room.seats.every(s=>s.ready))throw Error('Every human player must be ready');
  const cpuNames=['Cube CPU A','Cube CPU B','Cube CPU C'];
  while(room.seats.length<4)room.seats.push({
   name:cpuNames[room.seats.length-humans],cpu:true,ready:true,token:null,deck:null
  });
  room.draft=Cube.makeDraft({seed:room.seed,players:4,packs:4,cardsPerPack:15,preset:room.preset});
  room.revision++;
  return this.view(room,seat);
 }
 // Each seat has an independent pick cursor. A global revision would wrongly
 // reject two players who choose simultaneously from different packs.
 pick(code,token,{id,round,pick}={}){
  const {room,seat}=this.authenticated(code,token),d=room.draft;
  if(!d)throw Error('Cube draft has not started');
  if(d.done)throw Error('Cube draft complete');
  if(!Number.isInteger(round)||!Number.isInteger(pick)||round!==d.round||pick!==d.pick)
   throw Error('Stale Cube pack cursor');
  if(typeof id!=='string'||id.length>40)throw Error('Invalid card ID');
  Cube.draftPick(d,seat,id);
  room.revision++;
  // A picked seat must not see the next passed pack until everyone has picked.
  if(room.seats.filter(s=>!s.cpu).every((s,i)=>d.picks[i].length===d.round*d.cardsPerPack+d.pick+1)){
   for(let i=0;i<d.players;i++)if(room.seats[i].cpu){
    Cube.draftPick(d,i,cpuPick(Cube.availableForSeat(d,i),d.picks[i]));
   }
  }
  return this.view(room,seat);
 }
 submit(code,token,deck){
  const {room,seat}=this.authenticated(code,token),d=room.draft;
  if(!d?.done)throw Error('Complete the Cube draft before submitting a deck');
  if(room.seats[seat].deck)throw Error('Cube deck already locked');
  const validation=Cube.validateBuild(d.picks[seat],deck);
  if(!validation.valid)throw Error(validation.reason);
  room.seats[seat].deck=[...deck];room.revision++;
  if(this.classic&&this.online)this.syncTournament(room);
  return this.view(room,seat);
 }
 state(code,token){
  const {room,seat}=this.authenticated(code,token);
  if(this.classic&&this.online)this.syncTournament(room);
  return this.view(room,seat);
 }
 view(room,seat){
  const d=room.draft,me=room.seats[seat],base={
   code:room.code,preset:room.preset,seat,revision:room.revision,host:seat===0,
   status:!d?'lobby':d.done?'build':'draft',finished:!!d?.done,
   seats:room.seats.map((s,i)=>({seat:i,name:s.name,cpu:s.cpu,ready:s.ready,
    pickCount:d?d.picks[i].length:0,deckReady:!!s.deck})),
   humanCount:room.seats.filter(s=>!s.cpu).length,
   energyIds:ENERGY_IDS
  };
  if(room.tournament){
   const t=room.tournament,current=t.current;
   const active=t.matches.find(x=>x.id===current?.id);
   const ownSide=current?.seats.indexOf(seat)??-1;
   const token=ownSide>=0&&current?.tokens?current.tokens[ownSide]:null;
   base.status=t.finished?'complete':'tournament';
   base.tournament={
    finished:t.finished,matchIndex:t.matches.filter(x=>x.status==='complete').length,
    totalMatches:t.matches.length,activeMatch:active?{id:active.id,seats:active.seats,
     names:active.seats.map(i=>room.seats[i].name),status:active.status}:null,
    matches:t.matches.map(m=>({id:m.id,seats:[...m.seats],
     names:m.seats.map(i=>room.seats[i].name),winner:m.winner,
     method:m.method,status:m.status,attempts:m.attempts})),
    standings:standings(t.matches,room.seats.map(x=>x.name)),
    yourMatch:token?{kind:current.kind,code:current.code||null,token,
      opponent:room.seats[current.seats[1-ownSide]].name}:null
   };
  }
  if(!d)return base;
  const expected=d.round*d.cardsPerPack+d.pick,waiting=!d.done&&d.picks[seat].length>expected;
  // A suggestion is computed once per seat; repeated 2s room polls must not
  // rebuild an AI deck or leak the other seats' strategic card choices.
  let suggestion=null;
  if(d.done){
   room.suggestedDecks ||= new Map();
   if(!room.suggestedDecks.has(seat)){
    let candidate=null;
    try{candidate=buildCpuDeck(d.picks[seat],{preset:room.preset});}catch{}
    room.suggestedDecks.set(seat,candidate);
   }
   suggestion=room.suggestedDecks.get(seat);
  }
  return {...base,round:d.round,pick:d.pick,packs:d.packs,cardsPerPack:d.cardsPerPack,waiting,
   pack:waiting?[]:Cube.availableForSeat(d,seat).map(id=>this.card(id)),
   drafted:d.picks[seat].map(id=>this.card(id)),
   suggestedDeck:suggestion,
   ownDeck:me.deck?[...me.deck]:null,
   allDecksReady:d.done&&room.seats.every(s=>s.cpu||s.deck)};
 }
 // All six pairings are sequential. Each participant plays every other seat
 // once; spectators/idle drafters never receive either opponent's credentials.
 syncTournament(room){
  if(!room.draft?.done||!room.seats.every(s=>s.cpu||s.deck))return;
  if(!this.classic||!this.online)return;
  if(!room.tournament){
   const decks=room.seats.map((s,i)=>s.cpu?
    buildCpuDeck(room.draft.picks[i],{preset:room.preset}):[...s.deck]);
   room.tournament={decks,matches:makeSchedule(),current:null,finished:false};
   room.revision++;
  }
  const t=room.tournament;
  if(t.finished)return;
  if(t.current){
   const fixture=t.matches.find(m=>m.id===t.current.id);
   let over=false,winner=null;
   if(t.current.kind==='online'){
    const onlineRoom=this.online.findRoom(t.current.code);
    this.online.checkPresence(onlineRoom);
    over=!!onlineRoom.game?.over;winner=onlineRoom.game?.winner;
   }else if(t.current.kind==='cpu'){
    const local=this.classic.session(t.current.tokens[0]);
    over=!!local.game.over;winner=local.game.winner;
   }
   if(!over)return;
   if(winner!==0&&winner!==1){
    fixture.attempts++;t.current=null;room.revision++;
   }else{
    fixture.status='complete';fixture.winner=fixture.seats[winner];
    // Local matches always play the human in side 0, even when the
    // human occupies the second draft seat in this pairing.
    if(t.current.kind==='cpu')fixture.winner=winner===0?t.current.humanSeat:t.current.cpuSeat;
    fixture.method='played';t.current=null;room.revision++;
   }
  }
  while(!t.finished&&!t.current){
   const next=t.matches.find(m=>m.status!=='complete');
   if(!next){t.finished=true;room.revision++;return;}
   const [a,b]=next.seats,sa=room.seats[a],sb=room.seats[b];
   if(sa.cpu&&sb.cpu){
    const outcome=this.simulateCpu(t.decks[a],t.decks[b],
     {seed:(room.seed+next.id*7349)>>>0,levelA:3,levelB:3});
    if(outcome.winner!==0&&outcome.winner!==1)throw Error('CPU fixture did not produce a winner');
    next.status='complete';next.winner=next.seats[outcome.winner];
    next.method=outcome.method||'played';room.revision++;continue;
   }
   if(!sa.cpu&&!sb.cpu){
    const match=this.online.createCubeMatch({decks:[t.decks[a],t.decks[b]],
     names:[sa.name,sb.name],seed:(room.seed+next.id*7349)>>>0});
    t.current={id:next.id,kind:'online',seats:[a,b],code:match.code,tokens:match.tokens};
   }else{
    const humanSeat=sa.cpu?b:a,cpuSeat=sa.cpu?a:b;
    const match=this.classic.createCube({humanDeck:t.decks[humanSeat],cpuDeck:t.decks[cpuSeat],
     name:room.seats[cpuSeat].name,difficulty:3,seed:(room.seed+next.id*7349)>>>0});
    const tokens=[null,null];tokens[next.seats.indexOf(humanSeat)]=match.token;
    t.current={id:next.id,kind:'cpu',seats:[a,b],humanSeat,cpuSeat,tokens};
   }
   next.status='active';room.revision++;
  }
 }
 card(id){
  const c=CATALOG.get(id);
  return {id,name:c.name,supertype:c.supertype,types:c.types||[],
   subtypes:c.subtypes||[],images:c.images||{},evolvesFrom:c.evolvesFrom||null,
   hp:c.hp||null,attacks:(c.attacks||[]).map(a=>({name:a.name,cost:a.cost||[],damage:a.damage||''}))};
 }
}
module.exports={CubeRoomService};
