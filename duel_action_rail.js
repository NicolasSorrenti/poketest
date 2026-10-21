(function(root){
 'use strict';
 const DESKTOP_QUERY='(min-width: 781px)';

 function createController(doc,viewport){
  const panel=doc.getElementById('attackPanel');
  const field=doc.getElementById('fieldAttackDock');
  const rail=doc.getElementById('desktopAttackDock');
  if(!panel||!field||!rail)return null;

  // Keep the one live attack panel beside the Active Pokémon at every
  // breakpoint. The old desktop relocation left attacks stranded above the
  // command buttons on phones using a desktop-width viewport.
  const sync=()=>{
   if(panel.parentElement!==field)field.append(panel);
   doc.body.classList.remove('attacks-in-rail');
   rail.hidden=true;
  };
  sync();
  viewport.addEventListener?.('change',sync);
  return {sync,destroy:()=>viewport.removeEventListener?.('change',sync)};
 }

 function boot(doc=document,win=window){
  return createController(doc,win.matchMedia(DESKTOP_QUERY));
 }

 root.NeoDuelActionRail={DESKTOP_QUERY,createController,boot};
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot());
  else boot();
 }
})(typeof window!=='undefined'?window:globalThis);
