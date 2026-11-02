'use strict';
// Shared bounded touch/mouse image viewer for RPG portraits and photo messages.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgImagePanzoom=api;
})(typeof window!=='undefined'?window:null,function(){
 const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
 function limits(w,h,nw,nh,zoom=1){
  const fit=Math.min(w/nw,h/nh);
  const width=nw*fit*zoom,height=nh*fit*zoom;
  return {width,height,maxX:Math.max(0,(width-w)/2),maxY:Math.max(0,(height-h)/2)};
 }
 function mount(view,img,{focus=null,maxZoom=6,controls=true}={}){
  if(!view||!img||!img.naturalWidth||!img.naturalHeight)throw Error('Image must be loaded before mounting pan/zoom.');
  const points=new Map(),max=Math.max(1,Number(maxZoom)||6);
  let w=0,h=0,zoom=1,x=0,y=0,initialized=false,destroyed=false,tools=null;
  view.style.position='relative';view.style.overflow='hidden';
  view.style.touchAction='none';view.style.userSelect='none';view.style.cursor='grab';
  img.draggable=false;Object.assign(img.style,{position:'absolute',display:'block',maxWidth:'none',maxHeight:'none',margin:'0',objectFit:'fill',pointerEvents:'none',userSelect:'none',transform:'none'});
  function paint(){
   if(!w||!h||destroyed)return;
   const d=limits(w,h,img.naturalWidth,img.naturalHeight,zoom);
   x=clamp(x,-d.maxX,d.maxX);y=clamp(y,-d.maxY,d.maxY);
   Object.assign(img.style,{width:d.width+'px',height:d.height+'px',left:((w-d.width)/2+x)+'px',top:((h-d.height)/2+y)+'px'});
   if(tools){tools.minus.disabled=zoom<=1.001;tools.plus.disabled=zoom>=max-.001;}
  }
  function resize(){
   const nw=view.clientWidth,nh=view.clientHeight;if(!nw||!nh)return;
   let center=null;
   if(initialized){
    const d=limits(w,h,img.naturalWidth,img.naturalHeight,zoom);
    center={u:(w/2-(w-d.width)/2-x)/d.width,v:(h/2-(h-d.height)/2-y)/d.height};
   }
   w=nw;h=nh;
   if(!initialized){
    if(focus){
     const l=clamp(Number(focus.left??0),0,.98),r=clamp(Number(focus.right??1),l+.01,1);
     const t=clamp(Number(focus.top??0),0,.98),b=clamp(Number(focus.bottom??1),t+.01,1);
     const fit=Math.min(w/img.naturalWidth,h/img.naturalHeight);
     zoom=clamp(Math.min(w/(img.naturalWidth*fit*(r-l)),h/(img.naturalHeight*fit*(b-t))),1,max);
     const d=limits(w,h,img.naturalWidth,img.naturalHeight,zoom);
     x=(.5-(l+r)/2)*d.width;y=(.5-(t+b)/2)*d.height;
    }
    initialized=true;
   }else if(center){
    const d=limits(w,h,img.naturalWidth,img.naturalHeight,zoom);
    x=(.5-center.u)*d.width;y=(.5-center.v)*d.height;
   }
   paint();
  }
  function zoomTo(next,anchorX=w/2,anchorY=h/2){
   if(!initialized)return;
   const d=limits(w,h,img.naturalWidth,img.naturalHeight,zoom);
   const u=(anchorX-(w-d.width)/2-x)/d.width,v=(anchorY-(h-d.height)/2-y)/d.height;
   zoom=clamp(next,1,max);
   const newer=limits(w,h,img.naturalWidth,img.naturalHeight,zoom);
   x=anchorX-(w-newer.width)/2-u*newer.width;
   y=anchorY-(h-newer.height)/2-v*newer.height;
   paint();
  }
  const local=e=>{const box=view.getBoundingClientRect();return {x:e.clientX-box.left,y:e.clientY-box.top};};
  const pinch=()=>{const a=[...points.values()];if(a.length<2)return null;return {x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};};
  function down(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('button'))return;e.preventDefault();view.setPointerCapture?.(e.pointerId);points.set(e.pointerId,local(e));view.style.cursor='grabbing';}
  function move(e){
   if(!points.has(e.pointerId))return;e.preventDefault();
   const before=pinch(),previous=points.get(e.pointerId),now=local(e);
   points.set(e.pointerId,now);const after=pinch();
   if(before&&after&&before.d>0){
    zoomTo(zoom*after.d/before.d,before.x,before.y);x+=after.x-before.x;y+=after.y-before.y;
   }else if(points.size===1){x+=now.x-previous.x;y+=now.y-previous.y;}
   paint();
  }
  function up(e){points.delete(e.pointerId);if(!points.size)view.style.cursor='grab';}
  function wheel(e){e.preventDefault();const a=local(e);zoomTo(zoom*Math.exp(-e.deltaY*.002),a.x,a.y);}
  function key(e){
   if(e.target.closest('button'))return;
   if(['+','='].includes(e.key)){e.preventDefault();zoomTo(zoom*1.25);}
   else if(e.key==='-'){e.preventDefault();zoomTo(zoom/1.25);}
   else if(e.key==='0'){e.preventDefault();zoomTo(1);}
   else if(e.key.startsWith('Arrow')){
    e.preventDefault();x+=e.key==='ArrowLeft'?32:e.key==='ArrowRight'?-32:0;
    y+=e.key==='ArrowUp'?32:e.key==='ArrowDown'?-32:0;paint();
   }
  }
  if(controls){
   tools=view.ownerDocument.createElement('div');tools.style.cssText='position:absolute;right:8px;bottom:8px;z-index:3;display:flex;gap:5px;padding:5px;border-radius:11px;background:#171321df;border:1px solid #b998c2;touch-action:manipulation';
   for(const [name,label,action] of [['−','Zoom out',()=>zoomTo(zoom/1.3)],['+','Zoom in',()=>zoomTo(zoom*1.3)],['Fit','Fit entire image',()=>zoomTo(1)]]){
    const b=view.ownerDocument.createElement('button');b.type='button';b.textContent=name;b.title=label;b.setAttribute('aria-label',label);
    b.style.cssText='min-height:35px;min-width:35px;border:1px solid #aa87c1;border-radius:7px;background:#372a48;color:#fff;font:700 14px system-ui;cursor:pointer;padding:5px 9px';
    b.addEventListener('click',e=>{e.stopPropagation();action();});tools.append(b);
    if(name==='−')tools.minus=b;if(name==='+')tools.plus=b;
   }
   view.append(tools);
  }
  if(!view.hasAttribute('tabindex'))view.tabIndex=0;
  const handlers=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['keydown',key]];
  for(const [name,fn] of handlers)view.addEventListener(name,fn);
  view.addEventListener('wheel',wheel,{passive:false});
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
  observer?.observe(view);resize();
  return {zoomTo,fit:()=>zoomTo(1),destroy(){
   if(destroyed)return;destroyed=true;observer?.disconnect();points.clear();
   for(const [name,fn] of handlers)view.removeEventListener(name,fn);
   view.removeEventListener('wheel',wheel);tools?.remove();
  }};
 }
 return Object.freeze({mount,limits});
});
