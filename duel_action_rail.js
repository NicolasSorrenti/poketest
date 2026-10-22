(function(root){
 'use strict';
 const DESKTOP_QUERY='(min-width: 781px)';

 function createController(doc,viewport){
  const panel=doc.getElementById('attackPanel');
  const field=doc.getElementById('fieldAttackDock');
  const mobile=doc.getElementById('mobileAttackDock');
  const rail=doc.getElementById('desktopAttackDock');
  if(!panel||!field||!mobile||!rail)return null;

  // One authoritative set of live buttons, moved without duplicating handlers.
  // Desktop: beside Active. Mobile: its own strip above the turn actions.
  const sync=()=>{
   const destination=viewport.matches?field:mobile;
   if(panel.parentElement!==destination)destination.append(panel);
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
