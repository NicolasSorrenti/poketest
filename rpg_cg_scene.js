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
   const entry=catalog.find(x=>x.trigger==='story_milestone'&&x.sceneId===state.activeStory.id);
   return entry?{entry,preview:true}:null;
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
  let requestedId=null,visibleId=null,serial=0;
  if(image?.style)image.style.transition='opacity 220ms ease';
  const seen=new Set();
  function clear(){
   if(requestedId===null&&!visibleId)return;
   ++serial;requestedId=null;visibleId=null;
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
   requestedId=entry.id;
   const token=++serial;
   const attempt=index=>{
    if(token!==serial)return;
    if(index===paths.length){clear();onMissing?.();return;}
    const loader=doc.createElement('img');
    loader.onload=()=>{
     if(token!==serial)return;
     const changing=!!visibleId;
     if(changing){if(image?.style)image.style.opacity='0';image.src=paths[index].path;image.alt=entry.title||'Story illustration';image.hidden=false;stage.classList.add('has-story-cg');setTimeout(()=>{if(token===serial&&image?.style)image.style.opacity='1';},0);}else{image.src=paths[index].path;image.alt=entry.title||'Story illustration';
     image.hidden=false;
     stage.classList.add('has-story-cg');if(image?.style)image.style.opacity='1';}
     visibleId=entry.id;
     if(entry.character&&typeof window!=='undefined')window.NeoRpgDiscreetAvatars?.set?.(stage,entry.character,'neutral',entry.character);
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
