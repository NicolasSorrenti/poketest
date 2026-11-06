'use strict';
/* Optional post-romance visits. Neither relationship ranks nor story chapters are changed. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgRomanceVisits=api;
})(typeof window!=='undefined'?window:null,function(){
 // Only women whose final parody CG is present in the live repository. Live has
 // her own event system; male characters can join when their routes/art are ready.
 const characters=Object.freeze([
  'barb','camila','daisy','elena','hana','iris','jicy','jinx','kaede',
  'laca','lyla','marina','reina','rina','shiori','sierra','yuna'
 ]);
 const known=new Set(characters);
 const cooldownDays=5;
 function chapterId(id,story){
  if(!known.has(id)||!Array.isArray(story?.events))return null;
  const prefix=id+'_route_';
  const routes=story.events.filter(e=>e.npc===id&&
   e.id.startsWith(prefix)&&/^\d+$/.test(e.id.slice(prefix.length)));
  if(!routes.length)return null;
  routes.sort((a,b)=>Number(b.id.slice(prefix.length))-Number(a.id.slice(prefix.length)));
  return routes[0].id;
 }
 function eligible(state,id,story){
  const final=chapterId(id,story);
  return !!final&&state?.routeOutcomes?.[id]==='romance'&&
   !!state?.storyDone?.[final]&&Number(state.day)>=1&&Number(state.day)<=90;
 }
 function record(state,id){
  if(!state.romanceVisits||typeof state.romanceVisits!=='object'||Array.isArray(state.romanceVisits))
   state.romanceVisits={};
  return state.romanceVisits[id]||null;
 }
 function nextDay(state,id){
  const last=Number(record(state,id)?.lastDay)||0;
  return last?last+cooldownDays:null;
 }
 function ready(state,id,story){
  if(!eligible(state,id,story))return false;
  const day=nextDay(state,id);
  return day===null||state.day>=day;
 }
 function pending(state,id,story){
  return state.romanceVisitPending===id&&ready(state,id,story);
 }
 function offerable(state,id,story){
  return ready(state,id,story)&&!state.romanceVisitShowing&&!pending(state,id,story);
 }
 function isFirst(state,id){return nextDay(state,id)===null;}
 function accept(state,id,story){
  if(!ready(state,id,story))return false;
  state.romanceVisitPending=id;
  return true;
 }
 function complete(state,id,story){
  if(!ready(state,id,story)||state.location!=='home')return false;
  const visits=state.romanceVisits||(state.romanceVisits={});
  const previous=visits[id]||{};
  visits[id]={lastDay:state.day,count:(Number(previous.count)||0)+1};
  if(state.romanceVisitPending===id)state.romanceVisitPending=null;
  return true;
 }
 function path(id){
  return known.has(id)?'/rpg-assets/characters/'+id+'/events/final/'+id+'_sneeze_parody.png':null;
 }
 function open({id,name,discreet=false,onFinish,onCancel}){
  const source=path(id),panApi=typeof window!=='undefined'?window.NeoRpgCGPan:null;
  if(!source||!panApi||!document.body||document.getElementById('neoRomanceVisitCG'))return false;
  const dialog=document.createElement('dialog');
  dialog.id='neoRomanceVisitCG';
  dialog.setAttribute('aria-label',name+' · private moment');
  dialog.style.cssText='border:1px solid #b890bc;border-radius:16px;background:#14121f;color:white;padding:0;width:min(94vw,890px);max-width:94vw;max-height:94dvh;overflow:hidden;box-shadow:0 20px 80px #000e';
  const head=document.createElement('div');
  head.style.cssText='padding:13px 16px;background:#292139;text-align:center;font:700 17px system-ui';
  head.textContent='♥ '+name+' · A quiet moment together';
  const viewport=document.createElement('div');
  viewport.style.cssText='position:relative;overflow:hidden;margin:auto;width:100%;height:min(55dvh,470px);max-width:100%;background:#10101c;isolation:isolate';
  const message=document.createElement('p');
  message.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;margin:0;padding:20px;color:#e1d5ed;font:14px system-ui';
  message.textContent=discreet?'Private moment · artwork hidden in Discreet Mode.':'Loading illustration…';
  const img=document.createElement('img');
  img.alt=name+' private moment illustration';
  img.draggable=false;
  img.hidden=true;
  img.style.cssText='position:absolute;top:0;left:0;width:100%;height:auto;max-width:none;max-height:none;pointer-events:none';
  viewport.append(img,message);
  const note=document.createElement('p');
  note.style.cssText='margin:0;padding:10px 12px;color:#c9badb;text-align:center;font:12px system-ui';
  note.textContent='Animated CG · looping vertical movement';
  const actions=document.createElement('div');
  actions.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:12px 16px 16px';
  const finish=document.createElement('button'),cancel=document.createElement('button');
  for(const button of [finish,cancel]){
   button.type='button';
   button.style.cssText='padding:10px 17px;border-radius:9px;border:1px solid #b38bb8;background:#45315a;color:#fff;font:600 14px system-ui;cursor:pointer';
  }
  finish.textContent='Finish visit';
  finish.disabled=!discreet;
  cancel.textContent='Leave for now';
  actions.append(finish,cancel);
  dialog.append(head,viewport,note,actions);
  document.body.append(dialog);
  let pan=null,closed=false;
  function close(done){
   if(closed)return;
   closed=true;
   pan?.dispose();pan=null;
   img.removeAttribute('src');
   if(dialog.open)dialog.close();
   dialog.remove();
   if(done)onFinish?.();else onCancel?.();
  }
  finish.onclick=()=>{if(!finish.disabled)close(true);};
  cancel.onclick=()=>close(false);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close(false);});
  dialog.showModal();
  if(!discreet){
   img.onload=()=>{
    if(closed)return;
    const width=Math.max(1,Math.min(window.innerWidth*.92,850,
      window.innerHeight*.72*2*img.naturalWidth/img.naturalHeight));
    viewport.style.width=width+'px';
    viewport.style.height=(width*img.naturalHeight/img.naturalWidth/2)+'px';
    pan=panApi.attach(viewport,img,panApi.defaults);
    img.hidden=false;
    message.hidden=true;
    finish.disabled=false;
   };
   img.onerror=()=>{
    if(closed)return;
    message.textContent='This CG could not load. Leave and try again; the visit will not be used.';
    finish.disabled=true;
   };
   img.src=source;
  }
  return true;
 }
 return Object.freeze({characters,cooldownDays,chapterId,eligible,ready,pending,offerable,
  isFirst,accept,complete,nextDay,path,open});
});
