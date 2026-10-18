'use strict';
// Seat-authorized multiplayer Cube drafting. No duel engine assumptions here;
// the same four-seat draft can feed human or CPU tournaments in future.
const crypto=require('node:crypto');
const Cube=require('./cube_draft');
const {cpuPick,buildCpuDeck,ENERGY_IDS}=require('./cube_strategy');
const {CATALOG}=require('./headless_duel');
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
 constructor({now=()=>Date.now(),ttlMs=6*60*60*1000,maxRooms=24}={}){
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
 create({name='Host',seed}={}){
  this.prune();
  if(this.rooms.size>=this.maxRooms)throw Error('Cube room limit reached');
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid Cube seed');
  let code;do{code=randomCode();}while(this.rooms.has(code));
  const token=makeToken();
  const room={code,seed:seed??crypto.randomBytes(4).readUInt32BE(0),
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
  room.draft=Cube.makeDraft({seed:room.seed,players:4,packs:4,cardsPerPack:15});
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
  return this.view(room,seat);
 }
 state(code,token){
  const {room,seat}=this.authenticated(code,token);
  return this.view(room,seat);
 }
 view(room,seat){
  const d=room.draft,me=room.seats[seat],base={
   code:room.code,seat,revision:room.revision,host:seat===0,
   status:!d?'lobby':d.done?'build':'draft',finished:!!d?.done,
   seats:room.seats.map((s,i)=>({seat:i,name:s.name,cpu:s.cpu,ready:s.ready,
    pickCount:d?d.picks[i].length:0,deckReady:!!s.deck})),
   humanCount:room.seats.filter(s=>!s.cpu).length,
   energyIds:ENERGY_IDS
  };
  if(!d)return base;
  const expected=d.round*d.cardsPerPack+d.pick,waiting=!d.done&&d.picks[seat].length>expected;
  // A suggestion is computed once per seat; repeated 2s room polls must not
  // rebuild an AI deck or leak the other seats' strategic card choices.
  let suggestion=null;
  if(d.done){
   room.suggestedDecks ||= new Map();
   if(!room.suggestedDecks.has(seat)){
    let candidate=null;
    try{candidate=buildCpuDeck(d.picks[seat]);}catch{}
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
 card(id){
  const c=CATALOG.get(id);
  return {id,name:c.name,supertype:c.supertype,types:c.types||[],
   subtypes:c.subtypes||[],images:c.images||{},evolvesFrom:c.evolvesFrom||null};
 }
}
module.exports={CubeRoomService};
