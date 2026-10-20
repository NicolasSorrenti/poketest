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
 function model(receipt,{hasBooster=false}={}){
  if(!receipt||!Object.prototype.hasOwnProperty.call(KINDS,receipt.outcome))return null;
  const kind=KINDS[receipt.outcome];
  return Object.freeze({
   kind,title:TITLES[kind],subtitle:SUBTITLES[kind],
   opponent:String(receipt.name||'Rival'),
   credits:format(receipt.credits),points:format(receipt.points),trust:format(receipt.trust),
   hasBooster:!!hasBooster&&kind==='victory',
   action:hasBooster&&kind==='victory'?'CLAIM BOOSTER →':'CONTINUE ADVENTURE →'
  });
 }
 function createPresenter({document:doc=typeof document==='undefined'?null:document}={}){
  let pending=null;
  const byId=id=>doc?.getElementById?.(id);
  function show({receipt,hasBooster=false,avatar=null,onContinue=()=>{}}={}){
   const details=model(receipt,{hasBooster});
   const dialog=byId('victoryDialog');
   if(!details||!dialog||dialog.open)return false;
   const title=byId('victoryOutcome'),opponent=byId('victoryOpponent'),summary=byId('victorySubtitle'),
    stats=byId('victoryStats'),art=byId('victoryPortrait'),button=byId('victoryContinue');
   if(!title||!opponent||!summary||!stats||!art||!button)return false;
   dialog.dataset.outcome=details.kind;
   title.textContent=details.title;
   opponent.textContent='VS '+details.opponent.toUpperCase();
   summary.textContent=details.subtitle;
   stats.replaceChildren();
   for(const [label,value] of [['CIRCUIT POINTS',details.points],['CREDITS',details.credits],['TRUST',details.trust]]){
    const metric=doc.createElement('div');metric.className='victory-metric';
    const amount=doc.createElement('strong');amount.textContent=value;
    const name=doc.createElement('small');name.textContent=label;
    metric.append(amount,name);stats.append(metric);
   }
   art.replaceChildren();if(avatar)art.append(avatar);
   button.textContent=details.action;
   pending={done:false,onContinue};
   function finish(){
    const item=pending;
    if(!item||item.done)return;
    item.done=true;pending=null;
    if(dialog.open)dialog.close();
    item.onContinue();
   }
   button.onclick=finish;
   dialog.oncancel=event=>{event.preventDefault();finish();};
   dialog.showModal();
   button.focus?.({preventScroll:true});
   return true;
  }
  return {show,get active(){return !!pending;}};
 }
 const presenter=createPresenter();
 return {model,createPresenter,show:opts=>presenter.show(opts)};
});