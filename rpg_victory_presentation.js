'use strict';
/* Neo Harbor post-duel celebration: presentation only. Settlement and boosters
 * remain owned by the duel bridge and collection systems, respectively. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgVictoryPresentation=api;
})(typeof window==='undefined'?null:window,function(){
 const KINDS={Victory:'victory',Defeat:'defeat',Draw:'draw'};
 const TITLES={victory:'VICTORY!',defeat:'DUEL COMPLETE',draw:'DRAW GAME'};
 const SUBTITLES={
  victory:'ONE STEP CLOSER TO THE CHAMPIONSHIP',
  defeat:'EVERY MATCH MAKES A STRONGER TRAINER',
  draw:'AN UNFINISHED RIVALRY'
 };
 const format=(value)=>'+'+Math.max(0,Number.isFinite(Number(value))?Math.trunc(Number(value)):0);
 // A dedicated result illustration can be installed per NPC without changing
 // game code. Until then, use that same NPC's existing attack cut-in.
 const resultArtSources=npcId=>{
  if(typeof npcId!=='string'||!/^[a-z0-9_-]+$/.test(npcId))return [];
  const prefix='/rpg-assets/characters/'+npcId+'/events/battle-result';
  return [prefix+'.webp',prefix+'.png','/rpg-assets/reactions/'+npcId+'/attack.png'];
 };
 function model(receipt,{hasBooster=false,presentation=null}={}){
  if(!receipt||!Object.prototype.hasOwnProperty.call(KINDS,receipt.outcome))return null;
  const kind=KINDS[receipt.outcome];
  // Tournament labels are cosmetic and require a genuine victory receipt.
  const event=kind==='victory'&&presentation&&['round','champion'].includes(presentation.kind)?presentation:null;
  return Object.freeze({
   kind,title:event?.title||TITLES[kind],subtitle:event?.subtitle||SUBTITLES[kind],
   competition:event?.kind||null,competitionTitle:event?.event||'',
   opponent:String(receipt.name||'Rival'),
   credits:format(receipt.credits),points:format(receipt.points),trust:format(receipt.trust),
   hasBooster:!!hasBooster&&kind==='victory',
   action:hasBooster&&kind==='victory'?'CLAIM BOOSTER →':'CONTINUE ADVENTURE →'
  });
 }
 function createPresenter({document:doc=typeof document==='undefined'?null:document}={}){
  let pending=null,portraitRequest=0;
  const byId=id=>doc?.getElementById?.(id);
  function show({receipt,hasBooster=false,avatar=null,npcId=null,presentation=null,onContinue=()=>{}}={}){
   const details=model(receipt,{hasBooster,presentation});
   const dialog=byId('victoryDialog');
   if(!details||!dialog||dialog.open)return false;
   const title=byId('victoryOutcome'),opponent=byId('victoryOpponent'),summary=byId('victorySubtitle'),
    stats=byId('victoryStats'),art=byId('victoryPortrait'),button=byId('victoryContinue');
   if(!title||!opponent||!summary||!stats||!art||!button)return false;
   dialog.dataset.outcome=details.kind;
   dialog.dataset.competition=details.competition||'none';
   title.textContent=details.title;
   opponent.textContent='VS '+details.opponent.toUpperCase();
   summary.textContent=details.subtitle;
   // Reuse the existing outcome surface; no second modal or reward transaction.
   const previous=dialog.querySelector?.('.victory-competition');
   previous?.remove();
   if(details.competitionTitle){
    const caption=doc.createElement('div');caption.className='victory-competition';
    caption.textContent=details.competitionTitle;
    summary.after?.(caption);
   }
   stats.replaceChildren();
   for(const [label,value] of [['CIRCUIT POINTS',details.points],['CREDITS',details.credits],['TRUST',details.trust]]){
    const metric=doc.createElement('div');metric.className='victory-metric';
    const amount=doc.createElement('strong');amount.textContent=value;
    const name=doc.createElement('small');name.textContent=label;
    metric.append(amount,name);stats.append(metric);
   }
   // Keep the existing NPC avatar only while artwork loads or as the very
   // last fallback. No other NPC's art may appear during a failed request.
   const request=++portraitRequest;
   art.replaceChildren();if(avatar)art.append(avatar);
   if(npcId)win?.NeoRpgDiscreetAvatars?.set?.(art,npcId,details.kind==='victory'?'happy':'vulnerable',details.opponent);
   const sources=resultArtSources(npcId);
   if(sources.length){
    const img=doc.createElement('img');
    img.alt=details.opponent+' after the duel';
    img.loading='eager';
    img.className='victory-result-art';
    let index=0;
    img.onload=()=>{
     if(request===portraitRequest&&dialog.open){art.replaceChildren(img);if(npcId)win?.NeoRpgDiscreetAvatars?.set?.(art,npcId,details.kind==='victory'?'happy':'vulnerable',details.opponent);}
    };
    img.onerror=()=>{
     if(request!==portraitRequest)return;
     if(index<sources.length)img.src=sources[index++];
     // If the cut-in is also missing, retain the regular avatar/initials.
    };
    img.src=sources[index++];
   }
   button.textContent=details.action;
   pending={done:false,onContinue};
   function finish(){
    const item=pending;
    if(!item||item.done)return;
    item.done=true;pending=null;portraitRequest++;
    if(dialog.open)dialog.close();
    item.onContinue();
   }
   button.onclick=finish;
   dialog.oncancel=event=>{event.preventDefault();finish();};
   dialog.showModal();
   if(typeof window!=='undefined')window.NeoRpgAudio?.play?.(details.competition==='champion'?'champion':details.kind==='victory'?'victory':'result');
   button.focus?.({preventScroll:true});
   return true;
  }
  return {show,get active(){return !!pending;}};
 }
 const presenter=createPresenter();
 return {model,createPresenter,resultArtSources,show:opts=>presenter.show(opts)};
});