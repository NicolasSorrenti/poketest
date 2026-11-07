'use strict';
// Subtle, opt-in VN idle breathing built on the shared sprite deformer.
// Portrait image remains authoritative for cropping, loading and discreet mode.
(function(root){
 const instances=new WeakMap();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function attach(person,img){
  const old=instances.get(person);
  if(old)old.dispose();
  if(!person?.isConnected||!img?.complete||!img.naturalWidth||!root.NeoRpgSpriteDeformer)return;
  if(reduced.matches)return;
  const src=img.currentSrc||img.src;
  if(!src||/^(?:data:|blob:)/i.test(src))return;
  // Only animate actual artwork. Discreet replacements must never be captured.
  if(img.classList.contains('rpg-safe-avatar'))return;
  const canvas=document.createElement('canvas');
  canvas.className='neo-ow-idle-canvas';
  canvas.hidden=true;
  canvas.setAttribute('aria-hidden','true');
  person.append(canvas);
  let active=true,shown=false,handle=0;
  const ratio=img.naturalWidth/img.naturalHeight;
  const h=clamp(Math.round(340/Math.max(.65,ratio)),260,540);
  const w=clamp(Math.round(h*ratio),160,540);
  // Regions relative to the original portrait, not to the dialog crop.
  // Avoid the head/face: gentle chest expansion and shoulders' vertical lift.
  const zones=[
   {x:.5,y:.37,rx:.31,ry:.19,inflateX:.006,inflateY:.008,moveY:-.002,phase:0},
   {x:.5,y:.54,rx:.39,ry:.19,inflateX:.002,inflateY:.002,moveY:.001,phase:.25}
  ];
  const motion=root.NeoRpgSpriteDeformer.create(canvas,{
   source:src,width:w,height:h,fps:18,tempo:60,speed:.57,
   cameraMode:'crop',cropTop:0,cropHeight:1,fit:'contain',
   baseBounce:0,feverBounce:0,tilt:0,intensity:.8,
   zones,
   onReady:()=>{
    if(!active||!person.isConnected)return;
    if(img.classList.contains('rpg-safe-avatar'))return;
    // Don't expose an unrendered canvas while the deformer prepares.
    motion.render(performance.now(),0);
    shown=true;canvas.hidden=false;person.classList.add('neo-ow-idle-active');
   },
   onError:()=>{canvas.hidden=true;person.classList.remove('neo-ow-idle-active');}
  });
  function dispose(){
   if(!active)return;
   active=false;cancelAnimationFrame(handle);
   motion.dispose();canvas.remove();person.classList.remove('neo-ow-idle-active');
   if(instances.get(person)?.dispose===dispose)instances.delete(person);
  }
  function tick(now){
   if(!active)return;
   if(!person.isConnected){dispose();return;}
   const discreet=img.classList.contains('rpg-safe-avatar')||
     img.hidden||getComputedStyle(img).display==='none';
   const visible=shown&&!discreet&&!document.hidden&&
     person.getClientRects().length>0&&
     !!person.closest('#neoOverworldStoryDock:not([hidden])')&&
     !person.closest('#scene:has(#rpgSceneCG:not([hidden]))');
   person.classList.toggle('neo-ow-idle-active',!!visible);
   canvas.hidden=!visible;
   if(visible)motion.render(now,0);
   handle=requestAnimationFrame(tick);
  }
  instances.set(person,{dispose});
  handle=requestAnimationFrame(tick);
 }
 root.NeoRpgDialogueIdle=Object.freeze({attach});
})(window);
