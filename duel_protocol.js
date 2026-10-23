'use strict';
const {decisionForViewer}=require('./decision_core');
const CLASSIC_POWERS=require('./classic_power_core');
// Transport-agnostic definitions: the same command is used for local, CPU, and online play.
const ACTIONS=Object.freeze(['setup_select','setup_undo','setup_confirm','setup_bonus_draw','setup_bonus_done','bench','evolve','attach_energy','play_trainer','use_stadium','attack','retreat','use_power','reveal_secret','choose','cancel_choice','end_turn','concede','undo']);
const KNOWN=new Set(ACTIONS);
function validateCommand(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Command must be an object');
 const {type,payload={},requestId}=input;
 if(!KNOWN.has(type))throw Error('Unknown command type');
 if(payload===null||typeof payload!=='object'||Array.isArray(payload))throw Error('Invalid command payload');
 if(requestId!==undefined&&(typeof requestId!=='string'||requestId.length>100||requestId.length===0))throw Error('Invalid requestId');
 return Object.freeze({type,payload:Object.freeze({...payload}),...(requestId===undefined?{}:{requestId})});
}
// Never serialize the authoritative game object directly to a client.
function maskSecret(u,own){if(!u)return null;const copy=structuredClone(u);if(copy.secretPlanFaceDown){if(own)copy.secretPlanCard=copy.id;copy.id='gym2-107';copy.under=[];}return copy;}
function projectPlayer(player,own,hideField=false){
 if(!player)return null;
 const base={name:player.name,active:hideField?null:maskSecret(player.active,own),bench:hideField?[]:(player.bench||[]).map(u=>maskSecret(u,own)),handCount:(player.hand||[]).length,deckCount:(player.deck||[]).length,prizeCount:(player.prizes||[]).length,discard:[...(player.discard||[])]};
 if(own){base.hand=[...(player.hand||[])];base.prizesCount=(player.prizes||[]).length;}
 return base;
}
// Some older effects still send an indexed option without artwork metadata.
// Resolve only indexes into the choosing player's known card zones, never a
// catalog search by name: different printings can share the same name.
function choicePrinting(game,viewer,option,catalog){
 const match=/^(n|hand|deck|card|discard):(\d+)$/.exec(option.id);
 if(!match)return null;
 const zone={n:'hand',hand:'hand',deck:'deck',card:'deck',discard:'discard'}[match[1]];
 const id=game.players[viewer]?.[zone]?.[Number(match[2])];
 const name=catalog.get(id)?.name;
 const label=String(option.label||'');
 if(!name||!(label===name||label.startsWith(name+' (')||
   label.endsWith(': '+name)||label.includes(': '+name+' (')))return null;
 return id;
}
function publicView(game,viewer){
 if(!game||!Array.isArray(game.players)||game.players.length!==2)throw Error('Invalid game');
 if(viewer!==0&&viewer!==1&&viewer!==null)throw Error('Invalid viewer');
 const publicPlayers=game.players.map((p,i)=>projectPlayer(p,viewer===i,game.phase==='setup'&&viewer!==i));
 // Psylink copies attacks of the owner's Psychic Pokémon in play. The copied
 // attacks are all public and are exposed only to the owning Active action UI.
 if(viewer!==null&&game.phase==='game'){
  const p=game.players[viewer],a=p.active;
  if(a&&a.id==='gym2-16'&&CLASSIC_POWERS.enabled(game,a,'Psylink')){
   const C=require('./headless_duel').CATALOG;
   publicPlayers[viewer].active.effectiveAttacks=[...(C.get(a.id).attacks||[]),...[p.active,...p.bench].filter(u=>u&&u!==a&&!u.secretPlanFaceDown&&C.get(u.id)?.types?.includes('Psychic')).flatMap(u=>C.get(u.id).attacks||[])];
  }
 }

 if(['classic','theme-expanded','gym-theme','gym-expanded','neo-theme','online-preview'].includes(game.format)&&game.phase==='game'){
  if(game.prizesFaceUp)for(let i=0;i<2;i++)publicPlayers[i].prizes=[...game.players[i].prizes];
  for(let i=0;i<2;i++)publicPlayers[i].revealedPrizes=game.players[i].prizes.flatMap((id,idx)=>
   game.prizesFaceUp||game.players[i].prizeFaceUp?.[idx]?[{index:idx,id}]:[]);
  if(viewer!==null){
   const own=game.players[viewer],opp=game.players[1-viewer];
   if([own.active,...own.bench].filter(Boolean).some(u=>CLASSIC_POWERS.enabled(game,u,'Clairvoyance')))
    publicPlayers[1-viewer].hand=[...opp.hand];
   publicPlayers[viewer].privateMessages=[...(own.privateLog||[]).slice(-15)];
  }
 }
 const projectedDecision=decisionForViewer(game.pendingDecision,viewer);
 if(projectedDecision&&viewer!==null&&projectedDecision.actor===viewer){
  const catalog=require('./headless_duel').CATALOG;
  for(const option of projectedDecision.options||[]){
   if(typeof option.cardId==='string'&&catalog.has(option.cardId))continue;
   // Never substitute a same-named card from a different expansion.
   delete option.cardId;
   const id=choicePrinting(game,viewer,option,catalog);
   if(id)option.cardId=id;
  }
  projectedDecision.cancelable=require('./classic_trainer_core').canCancel(game,viewer);
 }
 // Only the acting player may inspect their own complete deck during an
 // authorized deck search. Ineligible entries are display-only, never valid IDs.
 if(projectedDecision&&viewer!==null&&projectedDecision.actor===viewer&&
    projectedDecision.options?.some(o=>/^deck:\d+$/.test(o.id))&&
    /^(find|search|recover|basic|energy|deck-search|card-search)$/i.test(projectedDecision.kind||'')){
  const eligible=new Set(projectedDecision.options.map(o=>o.id));
  const C=require('./headless_duel').CATALOG;
  projectedDecision.displayDeck=game.players[viewer].deck.map((id,index)=>({
   id:'deck:'+index,cardId:id,label:C.get(id)?.name||'Unknown card',
   eligible:eligible.has('deck:'+index)
  }));
 }
 return {phase:game.phase,turn:game.turn,round:game.round,over:!!game.over,mulligans:game.players.map(p=>p.mulligans||0),mulliganBonus:game.mulliganBonus?{...game.mulliganBonus}:null,stadium:game.stadium?{id:game.stadium.id,owner:game.stadium.owner}:null,players:publicPlayers,messages:[...(game.message||[]).slice(0,20)],pendingDecision:projectedDecision,coinFlips:[...(game.coinFlips||[]).slice(-40)]};
}
// Exact ordered public actions, with opaque sequence numbers for polling clients.
// In particular, never serialize the authoritative event payload: a choice can
// contain private deck/hand indices and an opponent must not learn those.
function publicActivity(game,limit=24){
 const events=game?.events||[];
 return events.slice(-limit).map((e,i)=>({
  seq:events.length-Math.min(limit,events.length)+i+1,
  side:e.side,type:e.type,
  ...(typeof e.visible?.cardId==='string'?{cardId:e.visible.cardId}:{}),
  ...(typeof e.visible?.label==='string'?{label:e.visible.label}:{})
 }));
}
module.exports={ACTIONS,validateCommand,publicView,publicActivity};
