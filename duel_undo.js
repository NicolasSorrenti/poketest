'use strict';
// Server-owned, bounded undo history. We never ship snapshots to clients.
// Only deterministic actions with no hidden-information reveal are reversible.
const {CATALOG}=require('./headless_duel');
const SAFE_ACTIONS=new Set(['bench','attach_energy','evolve','retreat','play_trainer']);
const SAFE_TRAINERS=new Set([
 'PlusPower','Defender','Potion','Full Heal','Berry','Gold Berry',
 'Focus Band','Counterattack Claws','EXP.ALL',"Brock's Protection",
 "Sabrina's ESP",'Balloon Berry','Magnifier'
]);
const MAX_UNDOS=16;
const equal=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const secretSignature=g=>g.players.map(p=>[p.active,...p.bench].filter(Boolean)
 .map(u=>[!!u.secretPlanFaceDown,u.secretPlanSerial??null,u.secretPlanCard??null]));
function canRecord(before,after,side,cmd){
 if(!SAFE_ACTIONS.has(cmd?.type)||before.phase!=='game'||after.phase!=='game'
   ||before.over||after.over||before.turn!==side||after.turn!==side
   ||before.turnSerial!==after.turnSerial||before.round!==after.round
   ||before.pendingDecision||after.pendingDecision||before.pendingAction||after.pendingAction)return false;
 // No undo once any RNG, coin toss, shuffle, draw, Prize or concealed
 // information change occurred. This includes indirectly triggered effects.
 if(before.rngState!==after.rngState||before.coinSeq!==after.coinSeq
   ||!equal(before.coinFlips,after.coinFlips))return false;
 if((after.events?.length||0)!==(before.events?.length||0)+1
   ||after.events.at(-1)?.side!==side)return false;
 if(!equal(secretSignature(before),secretSignature(after)))return false;
 for(let i=0;i<2;i++){
  const old=before.players[i],now=after.players[i];
  if(!equal(old.deck,now.deck)||!equal(old.prizes,now.prizes)
    ||!equal(old.prizeFaceUp,now.prizeFaceUp)
    ||!equal(old.privateLog,now.privateLog))return false;
  if(i!==side&&!equal(old.hand,now.hand))return false;
 }
 if(after.players[side].hand.length>before.players[side].hand.length)return false;
 if(cmd.type==='play_trainer'){
  const id=before.players[side].hand[cmd.payload?.handIndex];
  if(!SAFE_TRAINERS.has(CATALOG.get(id)?.name))return false;
 }
 return true;
}
function description(before,side,cmd){
 const player=before.players[side],id=player.hand[cmd.payload?.handIndex];
 const card=CATALOG.get(id);
 switch(cmd.type){
  case 'attach_energy':return 'Energy attachment';
  case 'bench':return 'Benching a Pokémon';
  case 'evolve':return 'Evolution';
  case 'play_trainer':return card?.name||'Trainer card';
  case 'retreat':return 'Retreat';
  default:return 'Last move';
 }
}
function record(history,before,after,side,cmd){
 if(!canRecord(before,after,side,cmd)){history.length=0;return;}
 history.push({before:structuredClone(before),side,label:description(before,side,cmd)});
 if(history.length>MAX_UNDOS)history.shift();
}
function available(history,current,side){
 const last=history.at(-1);
 return Boolean(last&&last.side===side&&current&&!current.over&&current.phase==='game'
  &&current.turn===side&&!current.pendingDecision&&!current.pendingAction);
}
function undo(history,current,side){
 if(!available(history,current,side))throw Error('Undo unavailable after a random action, hidden-information change, or turn change');
 const last=history.pop();
 const restored=structuredClone(last.before);
 // Logs of public actions remain monotonically numbered; clients observing
 // polling must see an undo event instead of replaying reused event IDs.
 restored.events=[...(current.events||[]),{side,type:'undo',visible:{label:last.label}}];
 restored.message=[`${current.players[side].name} undid ${last.label}.`,...(restored.message||[])].slice(0,120);
 if(current.matchFeed){
  restored.feedSeq=(current.feedSeq||0)+1;
  restored.matchFeed=[...current.matchFeed,{
   seq:restored.feedSeq,kind:'action',side,type:'undo',label:last.label
  }].slice(-150);
 }
 return restored;
}
module.exports={canRecord,record,available,undo};
