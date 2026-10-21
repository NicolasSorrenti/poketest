(function(root){
 'use strict';
 const DESKTOP_QUERY='(min-width: 781px)';

 function createController(doc,viewport){
  const panel=doc.getElementById('attackPanel');
  const field=doc.getElementById('fieldAttackDock');
  const rail=doc.getElementById('desktopAttackDock');
  if(!panel||!field||!rail)return null;

  const sync=()=>{
   const desktop=viewport.matches;
   const destination=desktop?rail:field;
   if(panel.parentElement!==destination)destination.append(panel);
   doc.body.classList.toggle('attacks-in-rail',desktop);
   rail.hidden=!desktop;
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
