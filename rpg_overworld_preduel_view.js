'use strict';
// Overworld pre-duel presentation. Does not stage, launch, cancel or settle duels.
// A portrait stays visible until candidate CG artwork decodes successfully.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldPreDuel=api;
})(typeof window==='undefined'?null:window,function(){
 function render(doc,model,handlers){
  if(!doc||!model)return false;
  const get=id=>doc.getElementById(id);
  const modal=get('preDuelDialog'),art=get('preDuelArt');
  const context=get('preDuelContext'),opponent=get('preDuelOpponent'),
   deck=get('preDuelDeck'),speaker=get('preDuelSpeaker'),line=get('preDuelLine'),
   next=get('preDuelNext'),start=get('preDuelStart');
  if(!modal||!art||!context||!opponent||!deck||!speaker||!line||!next||!start)return false;
  modal.dataset.circuit=model.circuit||'friendly';
  context.textContent=model.stake;
  opponent.textContent=model.name;
  deck.textContent=model.deck;
  speaker.textContent=model.speaker;
  line.textContent=model.line;
  next.hidden=!model.canContinue;
  start.hidden=!!model.canContinue;
  const placeholder=doc.createElement('span');
  placeholder.className='preduel-placeholder';
  placeholder.textContent='✦ '+model.name+' · '+model.place;
  const face=handlers?.avatar?.(model.npc);
  art.replaceChildren(placeholder,...(face?[face]:[]));
  if(face)face.className+=' preduel-portrait';
  handlers?.discreet?.(art,model.npc,model.name);
  const isCurrent=()=>!!handlers?.isCurrent?.();
  const choices=Array.isArray(model.artwork)?model.artwork:[];
  const tryArtwork=index=>{
   if(index>=choices.length||!isCurrent())return;
   const choice=choices[index],photo=doc.createElement('img');
   photo.className='preduel-cg'+(choice.kind==='booster'?' preduel-booster-art':'');
   photo.alt=choice.alt||model.name+' before the duel';
   photo.decoding='async';
   photo.onload=async()=>{
    if(typeof photo.decode==='function'){
     try{await photo.decode();}
     catch{if(!photo.naturalWidth){tryArtwork(index+1);return;}}
    }
    if(!isCurrent())return;
    art.replaceChildren(photo);
    handlers?.discreet?.(art,model.npc,model.name);
   };
   photo.onerror=()=>{if(isCurrent())tryArtwork(index+1);};
   photo.src=choice.path;
  };
  tryArtwork(0);
  if(!modal.open)modal.showModal();
  return true;
 }
 return Object.freeze({render});
});
