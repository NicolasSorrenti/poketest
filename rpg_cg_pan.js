/* Reusable, resolution-independent vertical CG pan. No image assets are modified. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCGPan=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const defaults=Object.freeze({visibleHeightPercent:50,bottomHold:1000,moveUp:400,topHold:200,moveDown:400,easing:'ease-in-out'});
 function normalize(config){
  const source=config===true?{}:(config&&typeof config==='object'?config:{});
  const num=(key,min,max)=>Number.isFinite(Number(source[key]))?Math.max(min,Math.min(max,Number(source[key]))):defaults[key];
  return {visibleHeightPercent:num('visibleHeightPercent',20,100),bottomHold:num('bottomHold',0,10000),moveUp:num('moveUp',0,10000),topHold:num('topHold',0,10000),moveDown:num('moveDown',0,10000),easing:['linear','ease','ease-in','ease-out','ease-in-out'].includes(source.easing)?source.easing:defaults.easing};
 }
 function attach(frame,img,configuration){
  const cfg=normalize(configuration);
  let animation=null,active=true;
  const previous={width:img.style.width,height:img.style.height,maxWidth:img.style.maxWidth,maxHeight:img.style.maxHeight,objectFit:img.style.objectFit,top:img.style.top,left:img.style.left,transform:img.style.transform,transformOrigin:img.style.transformOrigin};
  const originalPosition=img.style.position;
  function stop(){if(animation){animation.cancel();animation=null;}}
  function layout(){
   if(!active)return;
   stop();
   const w=frame.clientWidth,h=frame.clientHeight;
   if(!w||!h||!img.naturalWidth||!img.naturalHeight)return;
   // Preserve image proportions, and never crop its horizontal edges.
   const imageHeight=w*img.naturalHeight/img.naturalWidth;
   const visibleFraction=cfg.visibleHeightPercent/100;
   // The desired half-image viewport is only possible when the frame aspect
   // ratio matches. If it doesn't, use the available frame without distortion.
   const visibleHeight=Math.min(h,Math.max(1,imageHeight*visibleFraction));
   const overflow=Math.max(0,imageHeight-visibleHeight);
   img.style.position='absolute';
   img.style.top='0';img.style.left='0';
   img.style.width='100%';img.style.height='auto';
   img.style.maxWidth='none';img.style.maxHeight='none';
   img.style.objectFit='fill';img.style.transformOrigin='top left';
   if(overflow<1||typeof img.animate!=='function'||(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)){
    img.style.transform='translateY('+Math.min(0,(h-imageHeight)/2)+'px)';
    return;
   }
   // Center the cropped viewport in the larger stage. Start at the bottom.
   const offset=Math.max(0,(h-visibleHeight)/2);
   const bottom=offset-overflow,top=offset;
   const duration=cfg.bottomHold+cfg.moveUp+cfg.topHold+cfg.moveDown;
   if(!duration){img.style.transform='translateY('+bottom+'px)';return;}
   const a=cfg.bottomHold/duration,b=(cfg.bottomHold+cfg.moveUp)/duration,c=(cfg.bottomHold+cfg.moveUp+cfg.topHold)/duration;
   img.style.transform='translateY('+bottom+'px)';
   animation=img.animate([
    {transform:'translateY('+bottom+'px)',offset:0,easing:'linear'},
    {transform:'translateY('+bottom+'px)',offset:a,easing:cfg.easing},
    {transform:'translateY('+top+'px)',offset:b,easing:'linear'},
    {transform:'translateY('+top+'px)',offset:c,easing:cfg.easing},
    {transform:'translateY('+bottom+'px)',offset:1}
   ],{duration,iterations:Infinity,fill:'both'});
  }
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(layout):null;
  observer?.observe(frame);
  img.addEventListener('load',layout);
  layout();
  return {refresh:layout,dispose(){
   if(!active)return;active=false;stop();observer?.disconnect();img.removeEventListener('load',layout);
   for(const [key,value] of Object.entries(previous))img.style[key]=value;
   img.style.position=originalPosition;
  }};
 }
 return Object.freeze({defaults,normalize,attach});
});
