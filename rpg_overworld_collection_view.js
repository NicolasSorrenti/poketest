'use strict';
// Overworld-owned collection UI. Does not mutate cards, currency, decks or saves.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldCollection=api;
})(typeof window==='undefined'?null:window,function(){
 function node(doc,tag,className,text){
  const element=doc.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=String(text);
  return element;
 }
 function renderStarters(root,starters,onChoose){
  if(!root)return false;
  const doc=root.ownerDocument||document,children=[];
  for(const starter of starters||[]){
   const button=node(doc,'button','starter-choice');button.type='button';
   button.append(node(doc,'strong',null,starter.label),
    node(doc,'small',null,starter.description));
   button.onclick=()=>onChoose?.(starter.id);
   children.push(button);
  }
  root.replaceChildren(...children);
  return true;
 }
 function renderShop(doc,model,onBuy){
  if(!doc||!model)return false;
  const root=doc.getElementById('boosterShopGrid');
  const balance=doc.getElementById('boosterShopBalance');
  const status=doc.getElementById('boosterShopStatus');
  if(!root||!balance||!status)return false;
  balance.textContent=model.balance;
  status.textContent=model.status;
  const offers=[];
  for(const offer of model.offers||[]){
   const box=node(doc,'article','booster-offer'+(offer.unlocked?'':' is-locked'));
   const eyebrow=node(doc,'small','booster-offer-edition',
    offer.unlocked?'THEMED BOOSTER · AVAILABLE':'THEMED BOOSTER · LOCKED');
   const title=node(doc,'h3',null,offer.name),desc=node(doc,'p',null,offer.description);
   const sources=node(doc,'small','booster-offer-edition',offer.sourcesLabel);
   const progress=node(doc,'div','booster-collection-progress');
   const track=node(doc,'div','booster-collection-track');
   const fill=node(doc,'span');fill.style.width=offer.completion+'%';
   track.append(fill);progress.append(track,
    node(doc,'small',null,offer.owned+' / '+offer.total+' possible cards discovered · '+offer.completion+'%'));
   if(offer.targetCount){
    progress.append(node(doc,'small','booster-offer-targets',
     '✦ '+offer.targetCount+' missing tracked card'+(offer.targetCount===1?'':'s')+
     ' could appear here · no card guaranteed'));
   }
   const reason=node(doc,'p','booster-offer-unlock',offer.reason);
   const buy=node(doc,'button','booster-offer-buy',offer.buyLabel);
   buy.type='button';buy.disabled=!!offer.disabled;
   buy.onclick=()=>{if(!buy.disabled)onBuy?.(offer.id,false);};
   box.append(eyebrow,title,desc,sources,progress,reason,buy);
   offers.push(box);
  }
  for(const offer of model.vouchers||[]){
   const box=node(doc,'article','booster-offer');
   const eyebrow=node(doc,'small','booster-offer-edition','EARNED EXPANSION VOUCHER');
   const title=node(doc,'h3',null,offer.name+' · '+offer.vouchers+' free');
   const desc=node(doc,'p',null,'A ten-card reward from '+offer.name+' (original expansion printings).');
   const buy=node(doc,'button','booster-offer-buy','Redeem gift voucher · free');
   buy.type='button';buy.disabled=!!offer.disabled;
   buy.onclick=()=>{if(!buy.disabled)onBuy?.(offer.set,true);};
   box.append(eyebrow,title,desc,buy);offers.push(box);
  }
  root.replaceChildren(...offers);
  return true;
 }
 function renderDeck(doc,model){
  if(!doc||!model)return false;
  const remove=doc.getElementById('deckRemove'),add=doc.getElementById('deckAdd');
  const stats=doc.getElementById('deckEditStats'),error=doc.getElementById('deckEditError');
  const list=doc.getElementById('deckList');
  if(!remove||!add||!stats||!error||!list)return false;
  const priorRemove=remove.value,priorAdd=add.value;
  const fill=(select,choices)=>{
   const options=[];
   for(const item of choices||[]){
    const option=node(doc,'option',null,item.label);option.value=item.id;options.push(option);
   }
   select.replaceChildren(...options);
  };
  fill(remove,model.remove);fill(add,model.add);
  if((model.remove||[]).some(item=>item.id===priorRemove))remove.value=priorRemove;
  if((model.add||[]).some(item=>item.id===priorAdd))add.value=priorAdd;
  stats.textContent=model.stats;error.textContent=model.message;
  const counts=(model.deck||[]).map(item=>node(doc,'span',null,item.count+'× '+item.label));
  list.replaceChildren(...counts);
  return true;
 }
 function renderPackCards(root,cards,onFlip){
  if(!root)return null;
  const doc=root.ownerDocument||document;
  const reveals=[],buttons=[];
  const list=Array.isArray(cards)?cards:[];
  for(const [index,card] of list.entries()){
   const button=node(doc,'button','pack-card');
   button.type='button';button.title='Reveal card '+(index+1);
   button.style.setProperty('--card-position',String(index));
   button.append(node(doc,'span','pack-card-back','✦'));
   let revealed=false;
   const reveal=(silent=false)=>{
    if(revealed)return false;
    revealed=true;
    if(!silent)onFlip?.();
    button.className+=' revealed';
    const row=node(doc,'span','pack-card-number','CARD '+(index+1)+' / '+list.length);
    const detail=node(doc,'strong',null,card.label);
    const parts=[row];
    if(card.image){
     const img=node(doc,'img');img.alt=card.name;img.loading='lazy';
     img.onerror=()=>img.replaceWith(doc.createTextNode('✦'));
     img.src=card.image;parts.push(img);
    }else parts.push(node(doc,'span','pack-card-placeholder','✦'));
    parts.push(detail);button.replaceChildren(...parts);
    return true;
   };
   // The click callback receives a PointerEvent, never a 'silent' boolean.
   button.onclick=()=>reveal(false);
   reveals.push(reveal);buttons.push(button);
  }
  root.replaceChildren(...buttons);
  return {
   revealAll:()=>{let any=false;for(const reveal of reveals)if(reveal(true))any=true;return any;},
   count:list.length
  };
 }
 return Object.freeze({renderStarters,renderShop,renderDeck,renderPackCards});
});
