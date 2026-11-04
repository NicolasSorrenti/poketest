'use strict';
// Booster reward presentation only. Awarding, inventory, pending packs and time
// transitions remain in the RPG controller.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldPack=api;
})(typeof window==='undefined'?null:window,function(){
 function render(doc,model,handlers){
  if(!doc||!model)return false;
  const get=id=>doc.getElementById(id);
  const modal=get('packDialog'),portrait=get('packGiver'),cards=get('packCards'),
   eyebrow=get('packEyebrow'),title=get('packTitle'),
   description=get('packDescription'),continueButton=get('packContinue'),
   revealAllButton=get('packRevealAll');
  if(!modal||!portrait||!cards||!eyebrow||!title||!description||!continueButton||!revealAllButton)
   return false;
  eyebrow.textContent=model.eyebrow;
  title.textContent=model.title;
  description.textContent=model.description;
  continueButton.textContent=model.continueLabel;
  portrait.replaceChildren();
  const isCurrent=()=>!!handlers?.isCurrent?.();
  const avatar=id=>{
   if(!isCurrent())return;
   const face=handlers?.avatar?.(id);
   if(face)portrait.replaceChildren(face);
   handlers?.discreet?.(portrait,id);
  };
  if(model.giver){
   avatar(model.giver);
   const paths=Array.isArray(model.artworks)?model.artworks:[];
   const tryArt=index=>{
    if(!isCurrent()||index>=paths.length)return;
    const photo=doc.createElement('img');
    photo.alt=model.giverName+' presenting a booster';
    photo.className='pack-giver-art';photo.decoding='async';
    photo.onload=async()=>{
     if(typeof photo.decode==='function'){
      try{await photo.decode();}
      catch{if(!photo.naturalWidth){tryArt(index+1);return;}}
     }
     if(!isCurrent())return;
     portrait.replaceChildren(photo);
     handlers?.discreet?.(portrait,model.giver);
    };
    photo.onerror=()=>{if(isCurrent())tryArt(index+1);};
    photo.src=paths[index];
   };
   tryArt(0);
  }else if(model.fromShop){
   const shopArt=doc.createElement('img');
   shopArt.className='pack-giver-art';
   shopArt.alt='The Lucky Draw shopkeeper handing you a booster pack';
   shopArt.onerror=()=>avatar('hana');
   shopArt.src='/rpg-assets/shop/shopkeeper-booster.webp';
   portrait.append(shopArt);
  }
  const reveal=handlers?.renderCards?.(cards,model.cards,handlers.onFlip);
  if(!reveal||typeof reveal.revealAll!=='function')return false;
  revealAllButton.type='button';continueButton.type='button';
  revealAllButton.onclick=()=>{
   if(!isCurrent())return;
   reveal.revealAll();handlers?.onFlip?.();
  };
  continueButton.onclick=()=>{if(isCurrent())handlers?.onContinue?.();};
  modal.oncancel=event=>event.preventDefault();
  if(!modal.open)modal.showModal();
  return true;
 }
 return Object.freeze({render});
});
