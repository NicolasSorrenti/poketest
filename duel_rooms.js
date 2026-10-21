'use strict';
const crypto=require('node:crypto');
const {validateCommand,publicView}=require('./duel_protocol');
const {validateAnswer}=require('./decision_core');
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function inviteCode(){return Array.from(crypto.randomBytes(6),b=>ALPHABET[b%ALPHABET.length]).join('');}
function token(){return crypto.randomBytes(24).toString('base64url');}
// Room coordinator deliberately delegates ALL game rules to the supplied authoritative adapter.
class RoomCoordinator {
 constructor({createGame,applyCommand,now=()=>Date.now(),ttlMs=3600000}={}){
  if(typeof createGame!=='function'||typeof applyCommand!=='function')throw Error('An authoritative game adapter is required');
  this.createGame=createGame;this.applyCommand=applyCommand;this.now=now;this.ttlMs=ttlMs;this.rooms=new Map();
 }
 prune(){for(const [code,r] of this.rooms)if(this.now()-r.updatedAt>this.ttlMs)this.rooms.delete(code);}
 create(){this.prune();let code;do{code=inviteCode()}while(this.rooms.has(code));const hostToken=token();const t=this.now();this.rooms.set(code,{code,tokens:[hostToken,null],game:null,revision:0,updatedAt:t});return {code,player:0,token:hostToken};}
 join(code){this.prune();const r=this.rooms.get(String(code).toUpperCase());if(!r)throw Error('Room not found');if(r.tokens[1])throw Error('Room is full');const guestToken=token();r.tokens[1]=guestToken;r.updatedAt=this.now();return {code:r.code,player:1,token:guestToken};}
 authorize(code,playerToken){this.prune();const r=this.rooms.get(String(code).toUpperCase());if(!r)throw Error('Room not found');const side=r.tokens.indexOf(playerToken);if(side<0)throw Error('Unauthorized');return {r,side};}
 start(code,hostToken,setup){const {r,side}=this.authorize(code,hostToken);if(side!==0)throw Error('Only host can start');if(!r.tokens[1])throw Error('Waiting for opponent');if(r.game)throw Error('Game already started');r.game=this.createGame(setup);r.revision++;r.updatedAt=this.now();return {revision:r.revision,view:publicView(r.game,0)};}
 view(code,playerToken){const {r,side}=this.authorize(code,playerToken);return {revision:r.revision,ready:!!r.game,joined:!!r.tokens[1],view:r.game?publicView(r.game,side):null};}
 dispatch(code,playerToken,rawCommand,expectedRevision){const {r,side}=this.authorize(code,playerToken);if(!r.game)throw Error('Game has not started');if(expectedRevision!==r.revision)throw Error('Stale game revision');const command=validateCommand(rawCommand);
  // Pending choices may belong to the non-active player. Adapter must determine entitlement.
  if(r.game.pendingDecision){
   if(!['choose','cancel_choice'].includes(command.type))throw Error('A decision must be resolved first');
   if(command.type==='choose')validateAnswer(r.game.pendingDecision,side,command.payload);
  }else{
   if(command.type==='choose')throw Error('No pending decision');
   const setupAction=r.game.phase==='setup'&&['setup_select','setup_undo','setup_confirm','concede'].includes(command.type);
   if(!setupAction&&side!==r.game.turn)throw Error('Not your turn');
  }
  const result=this.applyCommand(r.game,side,command);
  if(!result||result.ok!==true)throw Error(result?.error||'Illegal action');
  r.revision++;r.updatedAt=this.now();return {revision:r.revision,view:publicView(r.game,side)};
 }
}
module.exports={RoomCoordinator};
