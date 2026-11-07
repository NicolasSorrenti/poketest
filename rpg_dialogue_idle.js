'use strict';
// Native-resolution VN idle breathing. Never replace or downsample the source
// <img>: browser draws the original pixels with the existing RPG crop.
// A feathered, locally transformed duplicate supplies extremely subtle motion.
(function(root){
 const instances=new WeakMap();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function attach(person,img){
  instances.get(person)?.dispose();
  if(!person?.isConnected||!img?.complete||!img.naturalWidth||reduced.matches)return;
  if(img.hidden||img.classList.contains('rpg-safe-avatar'))return;
  const source=img.currentSrc||img.src;
  if(!source||/^(?:data:|blob:)/i.test(source))return;
  const layer=document.createElement('div');
  layer.className='neo-ow-idle-layer';
  layer.setAttribute('aria-hidden','true');
  layer.hidden=true;
  const copy=document.createElement('img');
  copy.alt='';
  copy.setAttribute('aria-hidden','true');
  copy.draggable=false;
  copy.decoding='async';
  copy.src=source;
  layer.append(copy);
  person.append(layer);
  let disposed=false;
  let watcher=null;
  const update=()=>{
   if(disposed)return;
   if(!person.isConnected){dispose();return;}
   const safe=document.documentElement.getAttribute('data-rpg-discreet')==='on'||
    img.hidden||img.classList.contains('rpg-safe-avatar');
   layer.hidden=safe||!copy.complete||!copy.naturalWidth||reduced.matches;
  };
  const dispose=()=>{
   if(disposed)return;
   disposed=true;
   watcher?.disconnect();
   copy.removeEventListener('load',update);
   layer.remove();
   if(instances.get(person)?.dispose===dispose)instances.delete(person);
  };
  copy.addEventListener('load',update);
  copy.addEventListener('error',()=>{layer.hidden=true;});
  // Only watch accessibility/discreet toggles; no JS animation loop.
  watcher=new MutationObserver(update);
  watcher.observe(document.documentElement,{attributes:true,attributeFilter:['data-rpg-discreet']});
  watcher.observe(img,{attributes:true,attributeFilter:['class','hidden']});
  instances.set(person,{dispose});
  update();
 }
 root.NeoRpgDialogueIdle=Object.freeze({attach});
})(window);
