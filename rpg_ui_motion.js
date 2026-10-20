'use strict';
/* Neo Harbor scene-first navigation. UI state only: no RPG time, saves or rewards. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgInterface=api;
})(typeof window==='undefined'?null:window,function(){
 const VALID=['map','info'];
 function nextDrawer(current,requested){
  if(!VALID.includes(requested))return null;
  return current===requested?null:requested;
 }
 function createController({document:doc=typeof document==='undefined'?null:document}={}){
  let active=null,initialized=false;
  const get=id=>doc?.getElementById?.(id);
  const elements=()=>({
   map:get('rpgMapToggle'),info:get('rpgInfoToggle'),
   mapPanel:get('rpgMapPanel')||doc?.querySelector?.('.locations-panel'),
   infoPanel:get('rpgInfoPanel')||doc?.querySelector?.('.sidebar'),
   backdrop:get('rpgDrawerBackdrop')
  });
  function apply(next,{returnFocus=false}={}){
   if(!doc?.body)return;
   const previous=active;active=VALID.includes(next)?next:null;
   doc.body.dataset.rpgDrawer=active||'closed';
   doc.body.classList?.toggle?.('rpg-drawer-open',!!active);
   const {map,info,mapPanel,infoPanel,backdrop}=elements();
   map?.setAttribute('aria-expanded',String(active==='map'));
   info?.setAttribute('aria-expanded',String(active==='info'));
   map?.classList.toggle('active',active==='map');
   info?.classList.toggle('active',active==='info');
   mapPanel?.setAttribute('aria-hidden',String(active!=='map'));
   infoPanel?.setAttribute('aria-hidden',String(active!=='info'));
   if(mapPanel)mapPanel.inert=active!=='map';
   if(infoPanel)infoPanel.inert=active!=='info';
   if(backdrop)backdrop.hidden=!active;
   if(active&&active!==previous){
    const panel=active==='map'?mapPanel:infoPanel;
    panel?.querySelector?.('.rpg-drawer-close')?.focus?.({preventScroll:true});
   }
   if(returnFocus&&previous&&!active){
    const trigger=previous==='map'?map:info;
    trigger?.focus?.({preventScroll:true});
   }
  }
  function toggle(which){apply(nextDrawer(active,which));}
  function close(opts){if(active)apply(null,opts);}
  function onKey(event){
   if(!active)return;
   if(event.key==='Escape'){
    event.preventDefault?.();close({returnFocus:true});
   }else if(event.key==='Tab'){
    const {mapPanel,infoPanel}=elements();
    const panel=active==='map'?mapPanel:infoPanel;
    const focusable=[...(panel?.querySelectorAll?.('button:not(:disabled),select:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])')||[])]
     .filter(el=>!el.closest?.('[hidden]')&&!!el.getClientRects?.().length);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&doc.activeElement===first){event.preventDefault?.();last.focus?.();}
    else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault?.();first.focus?.();}
   }
  }
  function init(){
   if(initialized||!doc?.body)return false;
   const {map,info,mapPanel,infoPanel,backdrop}=elements();
   if(!map||!info||!mapPanel||!infoPanel||!backdrop)return false;
   initialized=true;
   map.addEventListener('click',()=>toggle('map'));
   info.addEventListener('click',()=>toggle('info'));
   backdrop.addEventListener('click',()=>close({returnFocus:true}));
   for(const panel of [mapPanel,infoPanel])panel.querySelector?.('.rpg-drawer-close')?.addEventListener('click',()=>close({returnFocus:true}));
   doc.addEventListener('keydown',onKey);
   // Existing action and location buttons remain authoritative.
   mapPanel.addEventListener('click',event=>{
    if(event.target?.closest?.('#places button'))close({returnFocus:true});
   });
   apply(null);
   return true;
  }
  return {init,toggle,close,onLocationChange:()=>close({returnFocus:true}),get active(){return active;}};
 }
 const controller=createController();
 const host=typeof window==='undefined'?null:window;
 // Navigation is a standalone UI dependency, not contingent on the RPG render()
 // pipeline completing successfully. The HTML loads this script after both panels.
 if(host?.document){
  if(host.document.readyState==='loading')
   host.document.addEventListener('DOMContentLoaded',()=>controller.init(),{once:true});
  else controller.init();
 }
 return {
  nextDrawer,createController,
  init:()=>controller.init(),
  toggle:which=>controller.toggle(which),
  close:()=>controller.close(),
  onLocationChange:()=>controller.onLocationChange()
 };
});