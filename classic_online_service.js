'use strict';
// Invite-only, in-memory authority for two human players. No bot, no browser game state.
const crypto = require('node:crypto');
const {createGame,reduce} = require('./headless_duel');
const {publicView,publicActivity} = require('./duel_protocol');
const {ClassicLocalService,DECKS,deckOptions} = require('./classic_local_service');
const {countCards} = require('./core_rules');
const {validateCommand} = require('./duel_protocol');
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode=()=>Array.from(crypto.randomBytes(6),x=>ALPHABET[x%ALPHABET.length]).join('');
const makeToken=()=>crypto.randomBytes(32).toString('base64url');
const onlineDeckSource=new ClassicLocalService();
const standardName=(raw,fallback)=>{
 const name=String(raw||fallback).trim();
 if(name.length>28||name.length<1||/[\x00-\x1f<>]/.test(name))throw Error('Invalid player name');
 return name;
};
function selectDeck(id,customDeck){
 if(typeof id!=='string'||!Object.hasOwn(DECKS,id))throw Error('Unknown deck');
 if(id==='custom'){
  if(!Array.isArray(customDeck)||customDeck.length!==60||customDeck.some(x=>typeof x!=='string'||x.length>40))throw Error('Custom decks need exactly 60 card IDs');
  return [...customDeck];
 }
 if(customDeck!==undefined)throw Error('Unexpected custom deck');
 return onlineDeckSource.decklist(id);
}
class ClassicOnlineService {
 constructor({now=()=>Date.now(),ttlMs=6*3600000,maxRooms=32}={}){
  this.rooms=new Map();this.now=now;this.ttlMs=ttlMs;this.maxRooms=maxRooms;
 }
 prune(){for(const [code,room] of this.rooms)if(this.now()-room.updated>this.ttlMs)this.rooms.delete(code);}
 create({deck='blackout',customDeck,name='Player 1'}={}){
  this.prune();if(this.rooms.size>=this.maxRooms)throw Error('Room limit reached');
  const cards=selectDeck(deck,customDeck);const playerName=standardName(name,'Player 1');
  let code;do{code=makeCode();}while(this.rooms.has(code));
  const token=makeToken(),room={code,players:[{token,name:playerName,deck,cards,ready:false},null],game:null,revision:0,updated:this.now(),chat:[],chatSeq:0,lastChatAt:[0,0]};
  this.rooms.set(code,room);return {token,...this.response(room,0)};
 }
 join({code,deck='brushfire',customDeck,name='Player 2'}={}){
  const cards=selectDeck(deck,customDeck),playerName=standardName(name,'Player 2');
  const room=this.findRoom(code);if(room.players[1])throw Error('Room is full');if(room.game)throw Error('Game already started');
  const token=makeToken();room.players[1]={token,name:playerName,deck,cards,ready:false};
  room.revision++;room.updated=this.now();return {token,...this.response(room,1)};
 }
 findRoom(code){this.prune();if(typeof code!=='string'||!/^[A-HJ-NP-Z2-9]{6}$/.test(code.toUpperCase()))throw Error('Invalid room code');
  const room=this.rooms.get(code.toUpperCase());if(!room)throw Error('Room not found or expired');return room;
 }
 session(code,token){const room=this.findRoom(code);if(typeof token!=='string'||token.length<30)throw Error('Unauthorized');
  const side=room.players.findIndex(p=>p&&p.token===token);if(side<0)throw Error('Unauthorized');return {room,side};
 }
 response(room,side){const g=room.game;
  return {code:room.code,revision:room.revision,you:side,joined:!!room.players[1],started:!!g,
   players:room.players.map(p=>p?{name:p.name,deck:p.deck,ready:p.ready}:null),
   chatSeq:room.chatSeq,chatMessages:room.chat.map(m=>({...m})),
   ...(g?{view:publicView(g,side),activity:publicActivity(g),turnSerial:g.turnSerial,winner:g.winner,format:g.format,
    me:{energyUsed:!!g.players[side].energyUsed,retreated:!!g.players[side].retreated},
    setupConfirmed:!!g.setupReady[side],
    counts:g.players.map(countCards)}:{} )};
 }
 state(code,token){const {room,side}=this.session(code,token);room.updated=this.now();return this.response(room,side);}
 leave(code,token,{revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(room.game)throw Error('Cannot leave a started duel; finish or concede the match first');
  if(side===0)this.rooms.delete(room.code);
  else{room.players[1]=null;room.revision++;room.updated=this.now();}
  return {left:true};
 }
 // Only the authenticated seat can replace its own deck before a match starts.
 changeDeck(code,token,{deck,customDeck,revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(room.game)throw Error('Cannot change a deck after the duel has started');
  const cards=selectDeck(deck,customDeck); // Validate before changing any room state.
  const player=room.players[side];
  if(player.deck===deck&&cards.length===player.cards.length&&cards.every((id,i)=>id===player.cards[i]))return this.response(room,side);
  player.deck=deck;player.cards=cards;
  // Both players must re-confirm after either seat changes their deck.
  room.players.forEach(p=>{if(p)p.ready=false;});
  this.bump(room);
  return this.response(room,side);
 }
 ready(code,token,{ready,revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(room.game)throw Error('Game already started');if(typeof ready!=='boolean')throw Error('Invalid ready value');
  room.players[side].ready=ready;this.bump(room);return this.response(room,side);
 }
 start(code,token,{revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(side!==0)throw Error('Only the host can start the duel');
  if(room.game)throw Error('Duel already started');
  if(!room.players[1]||room.players.some(p=>!p.ready))throw Error('Both players must be ready');
  const format='online-preview';
  // Every selected card is validated by the actual authoritative reducer here.
  room.game=createGame({decks:room.players.map(p=>p.cards),names:room.players.map(p=>p.name),
   format,seed:crypto.randomBytes(4).readUInt32BE(0)});
  this.bump(room);return this.response(room,side);
 }
 action(code,token,{revision,command}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(!room.game)throw Error('Duel has not started');
  const raw=validateCommand(command);
  // reduce is pure and rejects an unauthorized action without modifying the room.
  const result=reduce(room.game,side,raw);if(!result.ok)throw Error(result.error||'Illegal action');
  room.game=result.game;this.bump(room);return this.response(room,side);
 }
 chatMessage(code,token,{text}={}){
  const {room,side}=this.session(code,token);
  if(typeof text!=='string')throw Error('Chat message must be text');
  const message=text.trim();
  if(!message||message.length>350||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(message))throw Error('Chat message must contain 1–350 printable characters');
  // A single rate limit shared by all calls from this seat; client-side bypasses are irrelevant.
  const time=this.now();
  if(time-room.lastChatAt[side]<850)throw Error('Please wait before sending another chat message');
  room.lastChatAt[side]=time;
  room.chatSeq++;
  room.chat.push({id:room.chatSeq,player:side,name:room.players[side].name,text:message,at:time});
  if(room.chat.length>80)room.chat.splice(0,room.chat.length-80);
  room.updated=time;
  // Chat must not change the game revision or invalidate a selected Energy target.
  return {chatSeq:room.chatSeq,chatMessages:room.chat.map(m=>({...m}))};
 }
 checkRevision(room,revision){if(!Number.isSafeInteger(revision)||revision!==room.revision)throw Error('Stale match revision — refresh the duel');}
 bump(room){room.revision++;room.updated=this.now();}
}
module.exports={ClassicOnlineService,selectDeck};
