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
   mapPanel:doc?.querySelector?.('.locations-panel'),
   infoPanel:doc?.querySelector?.('.sidebar'),
   backdrop:get('rpgDrawerBackdrop')
  });
  function apply(next,{returnFocus=false}={}){
   if(!doc?.body)return;
   const previous=active;active=VALID.includes(next)?next:null;
   doc.body.dataset.rpgDrawer=active||'closed';
   const {map,info,mapPanel,infoPanel,backdrop}=elements();
   map?.setAttribute('aria-expanded',String(active==='map'));
   info?.setAttribute('aria-expanded',String(active==='info'));
   map?.classList.toggle('active',active==='map');
   info?.classList.toggle('active',active==='info');
   mapPanel?.setAttribute('aria-hidden',String(active!=='map'));
   infoPanel?.setAttribute('aria-hidden',String(active!=='info'));
   if(backdrop)backdrop.hidden=!active;
   if(returnFocus&&previous&&!active){
    const trigger=previous==='map'?map:info;
    trigger?.focus?.({preventScroll:true});
   }
  }
  function toggle(which){apply(nextDrawer(active,which));}
  function close(opts){if(active)apply(null,opts);}
  function onKey(event){
   if(event.key==='Escape'&&active){
    event.preventDefault?.();close({returnFocus:true});
   }
  }
  function init(){
   if(initialized||!doc?.body)return false;
   const {map,info,mapPanel,infoPanel,backdrop}=elements();
   if(!map||!info||!mapPanel||!infoPanel||!backdrop)return false;
   initialized=true;
   map.addEventListener('click',()=>toggle('map'));
   info.addEventListener('click',()=>toggle('info'));
   backdrop.addEventListener('click',()=>close());
   doc.addEventListener('keydown',onKey);
   // Existing action and location buttons remain authoritative.
   mapPanel.addEventListener('click',event=>{
    if(event.target?.closest?.('#places button'))close();
   });
   apply(null);
   return true;
  }
  return {init,toggle,close,onLocationChange:()=>close(),get active(){return active;}};
 }
 const controller=createController();
 return {
  nextDrawer,createController,
  init:()=>controller.init(),
  toggle:which=>controller.toggle(which),
  close:()=>controller.close(),
  onLocationChange:()=>controller.onLocationChange()
 };
});