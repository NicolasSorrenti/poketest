/* In-scene CG presentation for Neo Harbor RPG.
 * Pure selection logic and a cancellable image presenter. Gallery unlocks stay in RPG state.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCGScene=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';

 function select(state,catalog,sliceModule,dialogue){
  if(!state||!Array.isArray(catalog))return null;
  const find=id=>catalog.find(entry=>entry.id===id)||null;
  if(state.activeSliceOfLife){
   const active=state.activeSliceOfLife,moment=sliceModule?.byId?.(active.id);
   if(!moment)return null;
   const sequence=moment.cgSequence?.length?moment.cgSequence:[moment.id];
   // The approved two-CG fitting changes at step 4, not at the end of the event.
   // Future multi-CG events can supply exact switch steps in cgSwitchSteps.
   const steps=moment.cgSwitchSteps||[0,4];
   let index=0;
   for(let i=1;i<sequence.length;i++)if(Number.isInteger(steps[i])&&active.step>=steps[i])index=i;
   const entry=find(sequence[index]);
   return entry?{entry,preview:!!moment.choices}:null;
  }
  if(state.activeStory){
   const active=state.activeStory,entry=catalog.find(x=>x.trigger==='story_milestone'&&x.sceneId===active.id);
   if(!entry)return null;
   // A route can open with a different approved CG, switching precisely on a
   // dialogue line. The final CG remains the one unlocked in the gallery.
   if(entry.openingPath&&Number.isInteger(entry.switchAtLine)&&active.phase==='lines'&&active.index<entry.switchAtLine)
    return {entry:{...entry,id:entry.id+'_opening',path:entry.openingPath,thumb:entry.openingPath},preview:true};
   return {entry,preview:true};
  }
  if(state.activeSituation){
   const entry=catalog.find(x=>x.trigger==='situation'&&x.situationId===state.activeSituation.id);
   return entry?{entry,preview:true}:null;
  }
  if(state.sceneCgId&&(dialogue?.line||dialogue?.choices?.length)){
   const entry=find(state.sceneCgId);
   return entry?{entry,preview:false}:null;
  }
  return null;
 }

 function create(stage,image,doc){
  let requestedId=null,visibleId=null,serial=0,pan=null,focusCleanup=null;
  function releaseFocus(){
   focusCleanup?.();focusCleanup=null;
  }
  function resetFocus(){
   releaseFocus();
   if(!image?.style)return;
   image.style.transition='transform 650ms ease-in-out,opacity 220ms ease';
   image.style.transform='none';
   image.style.transformOrigin='center center';
  }
  function attachFocus(crop){
   releaseFocus();
   if(!image?.style)return;
   if(!crop){resetFocus();return;}
   const {x,y,width,height}=crop;
   if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0)return;
   let disposed=false;
   function layout(){
    if(disposed)return;
    const w=stage.clientWidth,h=stage.clientHeight;
    const iw=image.naturalWidth,ih=image.naturalHeight;
    if(!w||!h||!iw||!ih)return;
    // object-fit:contain paints the original full CG at fitScale.
    // Uniformly magnify that same bitmap and center the specified source crop.
    const fitScale=Math.min(w/iw,h/ih);
    const zoom=Math.max(w/width,h/height)/fitScale;
    const dx=(iw/2-(x+width/2))*fitScale*zoom;
    const dy=(ih/2-(y+height/2))*fitScale*zoom;
    image.style.transition='transform 650ms ease-in-out,opacity 220ms ease';
    image.style.transformOrigin='center center';
    image.style.transform='translate('+dx+'px,'+dy+'px) scale('+zoom+')';
   }
   if(typeof window!=='undefined')window.addEventListener('resize',layout);
   layout();
   focusCleanup=()=>{
    disposed=true;
    if(typeof window!=='undefined')window.removeEventListener('resize',layout);
   };
  }
  const stopPan=()=>{pan?.dispose();pan=null;};
  if(image?.style)image.style.transition='opacity 220ms ease';
  const seen=new Set();
  function clear(){
   if(requestedId===null&&!visibleId)return;
   ++serial;requestedId=null;visibleId=null;stopPan();resetFocus();
   stage.classList.remove('has-story-cg');
   delete stage.dataset.rpgSafeId;
   stage.querySelector?.('.rpg-safe-avatar')?.remove();
   image.hidden=true;if(image?.style)image.style.opacity='1';
   image.removeAttribute?.('src');
  }
  function show(entry,candidates,onShown,onMissing){
   if(!entry){clear();return;}
   if(requestedId===entry.id)return;
   const paths=(candidates||[]).filter(item=>item.kind==='event'&&typeof item.path==='string');
   if(!paths.length){clear();onMissing?.();return;}
   // A focus change on the same CG must not reload or downsample the bitmap.
   const sameImage=visibleId&&image.complete&&image.naturalWidth&&paths.some(p=>{
    try{return new URL(p.path,doc.baseURI).href===image.src;}catch{return p.path===image.src;}
   });
   if(sameImage){
    stopPan();requestedId=entry.id;++serial;
    attachFocus(entry.cgFocus||null);
    visibleId=entry.id;
    onShown?.(entry);
    return;
   }
   stopPan();resetFocus();requestedId=entry.id;
   const token=++serial;
   const attempt=index=>{
    if(token!==serial)return;
    if(index===paths.length){clear();onMissing?.();return;}
    const loader=doc.createElement('img');
    loader.decoding='async';
    loader.onload=async()=>{
     if(token!==serial)return;
     // The network 'load' event may fire before a large CG is decoded.
     // Keep the previous image on screen until the new bitmap is paint-ready.
     if(typeof loader.decode==='function'){
      try{await loader.decode();}
      catch{if(!loader.naturalWidth){attempt(index+1);return;}}
     }
     if(token!==serial)return; // Rapid dialogue/CG changes cancel stale loads.
     image.src=paths[index].path;
     image.alt=entry.title||'Story illustration';
     image.hidden=false;
     stage.classList.add('has-story-cg');
     if(image?.style)image.style.opacity='1';
     visibleId=entry.id;
     if(entry.cgFocus)attachFocus(entry.cgFocus);
     if(entry.cgPan&&typeof window!=='undefined'&&window.NeoRpgCGPan&&!window.NeoRpgDiscreet?.enabled){
      pan=window.NeoRpgCGPan.attach(stage,image,entry.cgPan);
     }
     if(entry.character&&typeof window!=='undefined')window.NeoRpgDiscreetAvatars?.set?.(stage,entry.character,'neutral',entry.character);
     else{
      // CG-only scenes (notably Live's) must not inherit an earlier
      // character's avatar, even when the scene image is fully loaded.
      delete stage.dataset.rpgSafeId;
      stage.querySelector?.('.rpg-safe-avatar')?.remove();
     }
     seen.add(entry.id);
     onShown?.(entry);
    };
    loader.onerror=()=>attempt(index+1);
    loader.src=paths[index].path;
   };
   attempt(0);
  }
  return {show,clear,get visibleId(){return visibleId;},hasShown:id=>seen.has(id)};
 }
 return Object.freeze({select,create});
});
