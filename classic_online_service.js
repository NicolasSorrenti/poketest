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
const validCode=code=>typeof code==='string'&&/^[A-Z0-9]{6}$/.test(code.toUpperCase());
const DISCONNECT_MS=60000;
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
 prune(){for(const [code,room] of this.rooms){if(this.now()-room.updated>this.ttlMs){this.rooms.delete(code);continue;}for(const [token,viewer] of room.spectators)if(this.now()-viewer.lastSeen>15*60000)room.spectators.delete(token);}}
 create({deck='blackout',customDeck,name='Player 1',code:requestedCode}={}){
  this.prune();if(this.rooms.size>=this.maxRooms)throw Error('Room limit reached');
  const cards=selectDeck(deck,customDeck);const playerName=standardName(name,'Player 1');
  let code;if(requestedCode){if(!validCode(requestedCode))throw Error('Room codes must be six letters or digits');code=requestedCode.toUpperCase();if(this.rooms.has(code))throw Error('That room code is already in use');}else{do{code=makeCode();}while(this.rooms.has(code));}
  const token=makeToken(),room={code,players:[{token,name:playerName,deck,cards,ready:false,lastSeen:this.now()},null],spectators:new Map(),game:null,revision:0,updated:this.now(),chat:[],chatSeq:0,lastChatAt:[0,0]};
  this.rooms.set(code,room);return {token,...this.response(room,0)};
 }
 // A Cube match is created by the trusted draft authority, never by a
 // browser-provided 40-card deck. Both players receive separate room tokens.
 createCubeMatch({decks,names,seed}={}){
  this.prune();if(this.rooms.size>=this.maxRooms)throw Error('Online room limit reached');
  if(!Array.isArray(decks)||decks.length!==2||!Array.isArray(names)||names.length!==2)
   throw Error('Invalid Cube matchup');
  const cleanNames=names.map((n,i)=>standardName(n,'Cube Player '+(i+1)));
  const game=createGame({decks:decks.map(d=>[...d]),names:cleanNames,
   format:'online-preview',deckSize:40,prizeCount:4,
   seed:seed??crypto.randomBytes(4).readUInt32BE(0)});
  let code;do{code=makeCode();}while(this.rooms.has(code));
  const tokens=[makeToken(),makeToken()];
  const room={code,players:tokens.map((token,i)=>({token,name:cleanNames[i],deck:'cube',
   cards:[...decks[i]],ready:true,lastSeen:this.now()})),spectators:new Map(),
   game,revision:0,updated:this.now(),chat:[],chatSeq:0,lastChatAt:[0,0],cube:true};
  this.rooms.set(code,room);
  return {code,tokens};
 }
 join({code,deck='brushfire',customDeck,name='Player 2'}={}){
  const cards=selectDeck(deck,customDeck),playerName=standardName(name,'Player 2');
  const room=this.findRoom(code);if(room.players[1]||room.game)return this.watch({code,name:playerName});
  const token=makeToken();room.players[1]={token,name:playerName,deck,cards,ready:false,lastSeen:this.now()};
  room.revision++;room.updated=this.now();return {token,...this.response(room,1)};
 }
 watch({code,name='Spectator'}={}){
  const room=this.findRoom(code),watcherName=standardName(name,'Spectator');
  if(room.spectators.size>=40)throw Error('Spectator limit reached');
  const token=makeToken();room.spectators.set(token,{token,name:watcherName,lastSeen:this.now(),lastChatAt:0});
  return {token,...this.response(room,null)};
 }
 // The countdown is authoritative on the server, not calculated by either browser.
 checkPresence(room){
  if(!room.game||room.game.over||room.game.phase!=='game')return;
  const stale=room.players.map((p,i)=>this.now()-p.lastSeen>=DISCONNECT_MS?i:null).filter(x=>x!==null);
  if(stale.length!==1)return;
  const loser=stale[0],winner=1-loser;
  room.game.over=true;room.game.winner=winner;room.game.pendingDecision=null;room.game.pendingAction=null;
  const outcome=`${room.players[loser].name} disconnected for 60 seconds. ${room.players[winner].name} wins by forfeit.`;
  room.game.message.unshift(outcome);(room.game.matchFeed ||= []).push({seq:(room.game.feedSeq=(room.game.feedSeq||0)+1),kind:'message',text:outcome});
  this.bump(room);
 }
 findRoom(code){this.prune();if(!validCode(code))throw Error('Invalid room code');
  const room=this.rooms.get(code.toUpperCase());if(!room)throw Error('Room not found or expired');return room;
 }
 session(code,token){const room=this.findRoom(code);if(typeof token!=='string'||token.length<30)throw Error('Unauthorized');
  const side=room.players.findIndex(p=>p&&p.token===token);if(side>=0)return {room,side};if(room.spectators.has(token))return {room,side:null};throw Error('Unauthorized');
 }
 response(room,side){const g=room.game;
  return {spectator:side===null,spectatorCount:[...room.spectators.values()].filter(v=>this.now()-v.lastSeen<10000).length,presence:room.players.map(p=>p?{connected:this.now()-p.lastSeen<6000,secondsUntilForfeit:Math.max(0,Math.ceil((DISCONNECT_MS-(this.now()-p.lastSeen))/1000))}:null),code:room.code,revision:room.revision,you:side,joined:!!room.players[1],started:!!g,
   players:room.players.map(p=>p?{name:p.name,deck:p.deck,ready:p.ready}:null),
   chatSeq:room.chatSeq,chatMessages:room.chat.map(m=>({...m})),
   ...(g?{view:publicView(g,side),activity:publicActivity(g),feed:[...(g.matchFeed||[]).slice(-90)],turnSerial:g.turnSerial,winner:g.winner,format:g.format,
    me:side===null?{energyUsed:false,retreated:false,stadiumUsed:false}:{energyUsed:!!g.players[side].energyUsed,retreated:!!g.players[side].retreated,stadiumUsed:g.players[side].stadiumUsedTurn===g.turnSerial},
    setupConfirmed:side!==null&&!!g.setupReady[side],
    counts:g.players.map(countCards)}:{} )};
 }
 state(code,token){const {room,side}=this.session(code,token);this.checkPresence(room);if(side===null)room.spectators.get(token).lastSeen=this.now();else room.players[side].lastSeen=this.now();room.updated=this.now();return this.response(room,side);}
 leave(code,token,{revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(side===null){room.spectators.delete(token);return {left:true};}
  if(room.game)throw Error('Cannot leave a started duel; finish or concede the match first');
  if(side===0)this.rooms.delete(room.code);
  else{room.players[1]=null;room.revision++;room.updated=this.now();}
  return {left:true};
 }
 // Only the authenticated seat can replace its own deck before a match starts.
 changeDeck(code,token,{deck,customDeck,revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);if(side===null)throw Error('Unauthorized spectator action');
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
 changeName(code,token,{name,revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);
  if(side===null)throw Error('Unauthorized spectator action');
  if(room.game)throw Error('Cannot change a name after the duel has started');
  const renamed=standardName(name,room.players[side].name);
  if(renamed===room.players[side].name)return this.response(room,side);
  room.players[side].name=renamed;
  room.players.forEach(p=>{if(p)p.ready=false;});this.bump(room);
  return this.response(room,side);
 }
 ready(code,token,{ready,revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);if(side===null)throw Error('Unauthorized spectator action');
  if(room.game)throw Error('Game already started');if(typeof ready!=='boolean')throw Error('Invalid ready value');
  room.players[side].ready=ready;this.bump(room);return this.response(room,side);
 }
 start(code,token,{revision}={}){
  const {room,side}=this.session(code,token);this.checkRevision(room,revision);if(side===null)throw Error('Unauthorized spectator action');
  if(side!==0)throw Error('Only the host can start the duel');
  if(room.game)throw Error('Duel already started');
  if(!room.players[1]||room.players.some(p=>!p.ready))throw Error('Both players must be ready');
  room.players.forEach(p=>p.lastSeen=this.now());
  const format='online-preview';
  // Every selected card is validated by the actual authoritative reducer here.
  room.game=createGame({decks:room.players.map(p=>p.cards),names:room.players.map(p=>p.name),
   format,seed:crypto.randomBytes(4).readUInt32BE(0)});
  this.bump(room);return this.response(room,side);
 }
 action(code,token,{revision,command}={}){
  const {room,side}=this.session(code,token);this.checkPresence(room);this.checkRevision(room,revision);if(side===null)throw Error('Unauthorized spectator action');
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
  const sender=side===null?room.spectators.get(token):room.players[side];
  const previous=side===null?sender.lastChatAt:room.lastChatAt[side];
  if(time-previous<850)throw Error('Please wait before sending another chat message');
  if(side===null)sender.lastChatAt=time;else room.lastChatAt[side]=time;
  room.chatSeq++;
  room.chat.push({id:room.chatSeq,player:side,name:sender.name,text:message,at:time});
  if(room.chat.length>80)room.chat.splice(0,room.chat.length-80);
  room.updated=time;
  // Chat must not change the game revision or invalidate a selected Energy target.
  return {chatSeq:room.chatSeq,chatMessages:room.chat.map(m=>({...m}))};
 }
 checkRevision(room,revision){if(!Number.isSafeInteger(revision)||revision!==room.revision)throw Error('Stale match revision — refresh the duel');}
 bump(room){room.revision++;room.updated=this.now();}
}
module.exports={ClassicOnlineService,selectDeck};
