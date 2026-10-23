(function(root){
 'use strict';
 const DESKTOP_QUERY='(min-width: 781px)';

 function createController(doc,viewport){
  const panel=doc.getElementById('attackPanel');
  const field=doc.getElementById('fieldAttackDock');
  const mobile=doc.getElementById('mobileAttackDock');
  const surface=doc.getElementById('mobileAttackSurface');
  const rail=doc.getElementById('desktopAttackDock');
  const trigger=doc.getElementById('mobileAttacksToggle');
  const closeButton=doc.getElementById('closeAttacks');
  if(!panel||!field||!mobile||!surface||!rail||!trigger||!closeButton)return null;

  let open=false;
  function setOpen(value){
   const next=!!value&&!viewport.matches;
   const wasOpen=open;
   open=next;
   doc.body.classList.toggle('attack-popup-open',open);
   mobile.setAttribute('aria-hidden',String(!open));
   trigger.setAttribute('aria-expanded',String(open));
   if(open&&!wasOpen)closeButton.focus?.();
   if(!open&&wasOpen&&mobile.contains?.(doc.activeElement))trigger.focus?.();
  }

  // Relocate the same authoritative attack buttons; never clone handlers.
  // Desktop keeps them beside the Active, mobile opens a real modal selector.
  const sync=()=>{
   const destination=viewport.matches?field:surface;
   if(panel.parentElement!==destination)destination.append(panel);
   doc.body.classList.remove('attacks-in-rail');
   rail.hidden=true;
   if(viewport.matches)setOpen(false);
  };
  const toggle=()=>{if(!trigger.disabled)setOpen(!open);};
  const close=()=>setOpen(false);
  const onMobileClick=event=>{
   if(event.target===mobile||event.target?.closest?.('.attack-action:not(:disabled)'))close();
  };
  const onKeydown=event=>{
   if(!open)return;
   if(event.key==='Escape'){event.preventDefault?.();close();return;}
   // Keep keyboard navigation in the open modal.
   if(event.key!=='Tab')return;
   const buttons=[...mobile.querySelectorAll('button:not(:disabled)')];
   if(!buttons.length)return;
   const first=buttons[0],last=buttons[buttons.length-1];
   if(event.shiftKey&&doc.activeElement===first){event.preventDefault?.();last.focus?.();}
   else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault?.();first.focus?.();}
  };
  trigger.addEventListener('click',toggle);
  closeButton.addEventListener('click',close);
  mobile.addEventListener('click',onMobileClick);
  doc.addEventListener('keydown',onKeydown);
  sync();
  viewport.addEventListener?.('change',sync);
  return {
   sync,setOpen,
   destroy:()=>{
    setOpen(false);
    viewport.removeEventListener?.('change',sync);
    trigger.removeEventListener?.('click',toggle);
    closeButton.removeEventListener?.('click',close);
    mobile.removeEventListener?.('click',onMobileClick);
    doc.removeEventListener?.('keydown',onKeydown);
   }
  };
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
