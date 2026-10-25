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
const {SKILLS}=require('./cpu_policy');
const MAX_CPU_LEVEL=Math.max(...Object.keys(SKILLS).map(Number));
const LETTERS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode=()=>Array.from(crypto.randomBytes(6),x=>LETTERS[x%LETTERS.length]).join('');
const makeToken=()=>crypto.randomBytes(32).toString('base64url');
const validateDifficulty=value=>{
 if(!Number.isInteger(value)||value<1||value>MAX_CPU_LEVEL)throw Error('CPU difficulty must be 1–'+MAX_CPU_LEVEL);
 return value;
};
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
 create({name='Host',seed,preset='balanced',difficulty=3}={}){
  getPreset(preset);validateDifficulty(difficulty);
  this.prune();
  if(this.rooms.size>=this.maxRooms)throw Error('Cube room limit reached');
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid Cube seed');
  let code;do{code=randomCode();}while(this.rooms.has(code));
  const token=makeToken();
  const room={code,preset,difficulty,seed:seed??crypto.randomBytes(4).readUInt32BE(0),
   seats:[{name:normalizeName(name,'Host'),token,cpu:false,ready:false,deck:null}],
   draft:null,revision:0,updated:this.now(),chat:[],chatSeq:0,lastChatAt:[]};
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
  const cursor=d.round*d.cardsPerPack+d.pick;
  if(d.picks[seat].length===cursor+1){
   // The pack has not passed yet. Restore the previous copy and exchange
   // just this seat's reserved pick; never change another player's pack.
   const old=d.picks[seat][cursor],pack=d.available[seat];
   if(id!==old){
    const at=pack.indexOf(id);
    if(at<0)throw Error('Card not in current pack');
    pack.splice(at,1);pack.push(old);d.picks[seat][cursor]=id;
    room.revision++;
   }
  }else{
   Cube.draftPick(d,seat,id);
   room.revision++;
  }
  // Once the final human selects, CPU drafters commit their own choices.
  // Only then do packs pass; an earlier human pick is never prematurely final.
  const humans=room.seats.map((s,i)=>s.cpu?null:i).filter(x=>x!==null);
  if(humans.every(i=>d.picks[i].length===cursor+1)){
   for(let i=0;i<d.players;i++)if(room.seats[i].cpu){
    Cube.draftPick(d,i,cpuPick(Cube.availableForSeat(d,i),d.picks[i],{preset:room.preset}));
   }
  }
  return this.view(room,seat);
 }
 chatMessage(code,token,{text}={}){
  const {room,seat}=this.authenticated(code,token);
  if(typeof text!=='string'||!text.trim()||text.length>280||
   [...text].some(ch=>ch.charCodeAt(0)<32&&ch.charCodeAt(0)!==10&&ch.charCodeAt(0)!==9))
   throw Error('Chat message must contain 1–280 printable characters');
  if(this.now()-(room.lastChatAt[seat]??-Infinity)<750)throw Error('Please wait before sending another message');
  room.lastChatAt[seat]=this.now();
  room.chatSeq++;
  room.chat.push({seq:room.chatSeq,seat,name:room.seats[seat].name,text:text.trim(),at:this.now()});
  if(room.chat.length>100)room.chat.splice(0,room.chat.length-100);
  room.revision++;
  return this.view(room,seat);
 }
 watch(code,token,{matchId}={}){
  const {room,seat}=this.authenticated(code,token);
  if(!Number.isInteger(matchId)||!room.tournament)throw Error('Unknown Cube match');
  const m=room.tournament.matches.find(x=>x.id===matchId);
  const active=room.tournament.active.get(matchId);
  if(!m||m.status!=='active'||!active||active.kind!=='online')
   throw Error('This match cannot be spectated');
  if(m.seats.includes(seat))throw Error('Use your match link to play instead');
  const spectator=this.online.watch({code:active.code,name:room.seats[seat].name});
  return {code:active.code,token:spectator.token,matchId};
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
   code:room.code,preset:room.preset,difficulty:room.difficulty??3,seat,revision:room.revision,host:seat===0,
   status:!d?'lobby':d.done?'build':'draft',finished:!!d?.done,
   seats:room.seats.map((s,i)=>({seat:i,name:s.name,cpu:s.cpu,ready:s.ready,
    pickCount:d?d.picks[i].length:0,deckReady:!!s.deck})),
   humanCount:room.seats.filter(s=>!s.cpu).length,
   energyIds:ENERGY_IDS,chatSeq:room.chatSeq||0,chatMessages:(room.chat||[]).slice(-60)
  };
  if(room.tournament){
   const t=room.tournament,active=[...t.active.values()];
   const mine=active.find(m=>m.seats.includes(seat));
   const ownSide=mine?.seats.indexOf(seat)??-1;
   const ownToken=ownSide>=0?mine.tokens[ownSide]:null;
   base.status=t.finished?'complete':'tournament';
   base.tournament={
    finished:t.finished,matchIndex:t.matches.filter(x=>x.status==='complete').length,
    totalMatches:t.matches.length,
    activeMatch:active.length?{id:active[0].id,seats:[...active[0].seats],
     names:active[0].seats.map(i=>room.seats[i].name),status:'active'}:null,
    activeMatches:active.map(m=>({id:m.id,seats:[...m.seats],
     names:m.seats.map(i=>room.seats[i].name),kind:m.kind,status:'active'})),
    matches:t.matches.map(m=>({id:m.id,seats:[...m.seats],
     names:m.seats.map(i=>room.seats[i].name),winner:m.winner,
     method:m.method,status:m.status,attempts:m.attempts,
     spectatable:m.status==='active'&&t.active.get(m.id)?.kind==='online'&&!m.seats.includes(seat)})),
    standings:standings(t.matches,room.seats.map(x=>x.name)),
    yourMatch:ownToken?{id:mine.id,kind:mine.kind,code:mine.code||null,token:ownToken,
     opponent:room.seats[mine.seats[1-ownSide]].name}:null
   };
  }
  if(!d)return base;
  const expected=d.round*d.cardsPerPack+d.pick,waiting=!d.done&&d.picks[seat].length>expected;
  const selectedId=waiting?d.picks[seat][expected]:null;
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
  const offered=waiting?[...d.available[seat],selectedId]:Cube.availableForSeat(d,seat);
  const past=waiting?d.picks[seat].slice(0,-1):d.picks[seat];
  const recommendedId=!d.done&&offered.length?cpuPick(offered,past,{preset:room.preset}):null;
  return {...base,round:d.round,pick:d.pick,packs:d.packs,cardsPerPack:d.cardsPerPack,waiting,recommendedId,
    cubePool:d.rounds.flat(2).map(id=>{const c=CATALOG.get(id);return {id,name:c.name,supertype:c.supertype,types:c.types||[],subtypes:c.subtypes||[],evolvesFrom:c.evolvesFrom||null};}),
   // While waiting, return the ORIGINAL pack including this seat's reserved
   // copy. Only the owner can see or change that provisional selection.
   selectedId,
   pack:offered.map(id=>this.card(id)),
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
   room.tournament={decks,matches:makeSchedule(),active:new Map(),finished:false};
   room.revision++;
  }
  const t=room.tournament;
  if(t.finished)return;
  // Independently reconcile every running fixture. Result recording never
  // trusts client-supplied winner IDs, and a poll cannot double-record it.
  for(const [id,current] of [...t.active]){
   const fixture=t.matches.find(m=>m.id===id);
   let over=false,winner=null;
   if(current.kind==='online'){
    const live=this.online.findRoom(current.code);
    this.online.checkPresence(live);
    over=!!live.game?.over;winner=live.game?.winner;
   }else{
    const local=this.classic.session(current.tokens[current.seats.indexOf(current.humanSeat)]);
    over=!!local.game.over;winner=local.game.winner;
   }
   if(!over)continue;
   t.active.delete(id);
   if(winner!==0&&winner!==1){
    // Draws need another real duel, not a coin flip.
    fixture.attempts++;fixture.status='pending';
   }else{
    fixture.status='complete';
    fixture.winner=current.kind==='cpu'?
     (winner===0?current.humanSeat:current.cpuSeat):fixture.seats[winner];
    fixture.method='played';
   }
   room.revision++;
  }
  // Schedule as many disjoint pairings as possible. A player must not be
  // enrolled in two live games, but a different pair may play concurrently.
  let changed=true;
  while(changed){
   changed=false;
   const busy=new Set([...t.active.values()].flatMap(m=>m.seats));
   for(const next of t.matches){
    if(next.status!=='pending'||next.seats.some(seat=>busy.has(seat)))continue;
    const [a,b]=next.seats,sa=room.seats[a],sb=room.seats[b];
    if(sa.cpu&&sb.cpu){
     const outcome=this.simulateCpu(t.decks[a],t.decks[b],
      {seed:(room.seed+next.id*7349+next.attempts)>>>0,levelA:room.difficulty??3,levelB:room.difficulty??3});
     if(outcome.winner!==0&&outcome.winner!==1)throw Error('CPU fixture did not produce a winner');
     next.status='complete';next.winner=next.seats[outcome.winner];
     next.method=outcome.method||'played';room.revision++;changed=true;break;
    }
    let current;
    if(!sa.cpu&&!sb.cpu){
     const match=this.online.createCubeMatch({decks:[t.decks[a],t.decks[b]],
      names:[sa.name,sb.name],seed:(room.seed+next.id*7349+next.attempts)>>>0});
     current={id:next.id,kind:'online',seats:[a,b],code:match.code,tokens:match.tokens};
    }else{
     const humanSeat=sa.cpu?b:a,cpuSeat=sa.cpu?a:b;
     const match=this.classic.createCube({humanDeck:t.decks[humanSeat],cpuDeck:t.decks[cpuSeat],
      name:room.seats[cpuSeat].name,difficulty:room.difficulty??3,
      seed:(room.seed+next.id*7349+next.attempts)>>>0});
     const tokens=[null,null];tokens[next.seats.indexOf(humanSeat)]=match.token;
     current={id:next.id,kind:'cpu',seats:[a,b],humanSeat,cpuSeat,tokens};
    }
    t.active.set(next.id,current);
    next.status='active';room.revision++;changed=true;break;
   }
  }
  if(t.matches.every(m=>m.status==='complete')){t.finished=true;room.revision++;}
 }

 card(id){
  const c=CATALOG.get(id);
  return {id,name:c.name,supertype:c.supertype,types:c.types||[],
   subtypes:c.subtypes||[],images:c.images||{},evolvesFrom:c.evolvesFrom||null,
   hp:c.hp||null,attacks:(c.attacks||[]).map(a=>({name:a.name,cost:a.cost||[],damage:a.damage||''}))};
 }
}
module.exports={CubeRoomService};
