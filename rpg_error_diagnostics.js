'use strict';
// RPG error reporting: diagnostic data is deliberately allowlisted, never entire saves or URLs.
(function(root){
 const recent=[],seen=new Map();
 let provider=()=>({}),panel=null,reportText='';
 const clean=value=>String(value??'').replace(/(Bearer\s+)[^\s]+/gi,'$1[REDACTED]').replace(/([?&](?:token|key|code|access_token|refresh_token|apikey|password)=)[^\s&]+/gi,'$1[REDACTED]').slice(0,3000);
 function button(label,handler){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',handler);return b;}
 function ensurePanel(){
  if(panel)return panel;
  panel=document.createElement('dialog');panel.id='rpgErrorReport';
  panel.setAttribute('aria-label','RPG error report');
  panel.style.cssText='background:#181a2c;color:#f7f7ff;border:1px solid #e47b83;border-radius:14px;max-width:min(92vw,650px);width:650px;max-height:85dvh;overflow:auto;padding:20px;box-shadow:0 20px 60px #000a;z-index:2147483647';
  const title=document.createElement('h2');title.textContent='⚠ RPG error detected';title.style.margin='0 0 8px';
  const lead=document.createElement('p');lead.textContent='An unexpected error interrupted an RPG action. Your save has not been reset. Copy this report to share it when reporting the bug.';
  const preview=document.createElement('pre');preview.id='rpgErrorPreview';preview.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:45dvh;overflow:auto;background:#0c0e1b;padding:12px;border-radius:8px;font-size:12px';
  const actions=document.createElement('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end';
  const copy=button('Copy error report',async()=>{
   try{await navigator.clipboard.writeText(reportText);copy.textContent='Copied!';}
   catch{const ta=document.createElement('textarea');ta.value=reportText;ta.style.cssText='width:100%;min-height:130px';panel.append(ta);ta.focus();ta.select();copy.textContent='Select and copy below';}
  });
  const close=button('Close',()=>panel.close());
  copy.style.cssText=close.style.cssText='padding:10px 14px;border-radius:8px;border:1px solid #9295aa;background:#343852;color:white;cursor:pointer';
  actions.append(copy,close);panel.append(title,lead,preview,actions);
  document.body.append(panel);
  panel.addEventListener('cancel',()=>{});
  return panel;
 }
 function capture(error,context={}){
  try{
   const err=error instanceof Error?error:new Error(String(error||'Unknown RPG error'));
   const stack=clean(err.stack||'Unavailable').slice(0,5000);
   const cause=clean(err.message||'Unknown error');
   const summary=clean(context.action||context.source||'Unspecified action').slice(0,160);
   const key=summary+'|'+cause+'|'+stack.slice(0,200);
   const now=Date.now();
   if(now-(seen.get(key)||0)<2500)return;
   seen.set(key,now);if(seen.size>40)seen.clear();
   let state={};try{state=provider()||{};}catch{}
   const safeState={day:Number.isInteger(state.day)?state.day:null,period:typeof state.period==='string'?state.period:null,
    location:typeof state.location==='string'?state.location:null,
    selectedCharacter:typeof state.selectedCharacter==='string'?state.selectedCharacter:null,
    activeType:typeof state.activeType==='string'?state.activeType:null,
    eventId:typeof state.eventId==='string'?state.eventId:null,
    phase:typeof state.phase==='string'?state.phase:null};
   const report={type:'Neo Campus RPG error',time:new Date().toISOString(),errorName:clean(err.name),message:cause,
    source:clean(context.source||'runtime'),action:summary,filename:clean(context.filename||''),line:Number(context.line)||null,column:Number(context.column)||null,
    scene:safeState,stack,build:'20261026-rpg-error-diagnostics',browser:navigator.userAgent.slice(0,350)};
   reportText=JSON.stringify(report,null,2);
   recent.push(report);if(recent.length>8)recent.shift();
   const dialog=ensurePanel();dialog.querySelector('#rpgErrorPreview').textContent=reportText;
   if(!dialog.open){try{dialog.showModal();}catch{dialog.setAttribute('open','');}}
   console.error('Neo Campus RPG diagnostic',report);
  }catch(failure){console.error('RPG diagnostic popup failed',failure);}
 }
 root.NeoRpgErrorReport=Object.freeze({capture,setContextProvider(fn){if(typeof fn==='function')provider=fn;},getRecent:()=>recent.slice()});
 root.addEventListener('error',event=>{
  // Resource load failure: no JS Error object, but it can still break scene progression.
  if(event.target&&event.target!==root){
   const tag=event.target.tagName;
   if(tag==='SCRIPT'&&!event.target.hasAttribute('data-optional-script'))capture(new Error('Required RPG script could not load'),{source:'script-load',action:'load script',filename:event.target.src?.split('?')[0]||''});
   return;
  }
  capture(event.error||new Error(event.message||'Uncaught script error'),{source:'uncaught',action:'runtime',filename:event.filename,line:event.lineno,column:event.colno});
 },true);
 root.addEventListener('unhandledrejection',event=>capture(event.reason,{source:'unhandled-promise',action:'async RPG action'}));
})(window);
