/* Reusable, resolution-independent vertical CG pan. No image assets are modified. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCGPan=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const defaults=Object.freeze({visibleHeightPercent:50,bottomHold:200,moveUp:200,topHold:200,moveDown:200,easing:'ease-in-out'});
 function normalize(config){
  const source=config===true?{}:(config&&typeof config==='object'?config:{});
  const num=(key,min,max)=>Number.isFinite(Number(source[key]))?Math.max(min,Math.min(max,Number(source[key]))):defaults[key];
  return {visibleHeightPercent:num('visibleHeightPercent',20,100),bottomHold:num('bottomHold',0,10000),moveUp:num('moveUp',0,10000),topHold:num('topHold',0,10000),moveDown:num('moveDown',0,10000),easing:['linear','ease','ease-in','ease-out','ease-in-out'].includes(source.easing)?source.easing:defaults.easing};
 }
 function attach(frame,img,configuration){
  let cfg=normalize(configuration);
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
   if(imageHeight<=h){
    img.style.transform='';
    img.style.position=originalPosition;
    img.style.width=previous.width;img.style.height=previous.height;
    img.style.maxWidth=previous.maxWidth;img.style.maxHeight=previous.maxHeight;
    return;
   }
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
   if(overflow<1||typeof img.animate!=='function'||(typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)){
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
  return {refresh:layout,updateConfig(next){cfg=normalize(next);layout();},dispose(){
   if(!active)return;active=false;stop();observer?.disconnect();img.removeEventListener('load',layout);
   for(const [key,value] of Object.entries(previous))img.style[key]=value;
   img.style.position=originalPosition;
  }};
 }
 function createControls(container,onChange){
  const keys=[['bottomHold','Bottom hold'],['moveUp','Move up'],['topHold','Top hold'],['moveDown','Move down']];
  const base={...defaults}, values={...base};
  let auto=false,stage=0,timers=[];
  const panel=document.createElement('div');
  panel.className='cg-pan-settings';
  const fields=document.createElement('div');
  fields.className='cg-pan-fields';
  const inputs={};
  for(const [key,title] of keys){
   const label=document.createElement('label');
   label.textContent=title+' (s)';
   const input=document.createElement('input');
   input.type='number';input.min='0';input.max='10';input.step='0.05';
   input.value=(values[key]/1000).toFixed(2);
   input.setAttribute('aria-label',title+' in seconds');
   inputs[key]=input;label.append(input);fields.append(label);
   input.addEventListener('change',()=>{
    stopAuto();
    const n=Number(input.value);
    values[key]=Number.isFinite(n)?Math.max(0,Math.min(10000,n*1000)):base[key];
    input.value=(values[key]/1000).toFixed(2);
    changed();
   });
  }
  const extra=document.createElement('div');
  extra.className='cg-pan-auto-row';
  const autoLabel=document.createElement('label');
  const autoCheck=document.createElement('input');
  autoCheck.type='checkbox';autoCheck.setAttribute('aria-label','Auto speed progression');
  autoLabel.append(autoCheck,document.createTextNode(' Auto mode'));
  const status=document.createElement('span');
  status.setAttribute('role','status');
  const reset=document.createElement('button');
  reset.type='button';reset.textContent='Reset timings';
  reset.onclick=()=>{
   stopAuto();Object.assign(values,base);draw();changed();
  };
  extra.append(autoLabel,status,reset);
  panel.append(fields,extra);
  container.append(panel);
  function changed(){onChange({...values});}
  function draw(){
   for(const [key] of keys)inputs[key].value=(values[key]/1000).toFixed(2);
   autoCheck.checked=auto;
   status.textContent=auto?['Stage 1 · Original speed','Stage 2 · 25% faster','Stage 3 · 50% faster (held)'][stage]:'Manual timing';
  }
  function clearTimers(){for(const t of timers)clearTimeout(t);timers=[];}
  function stopAuto(){clearTimers();auto=false;stage=0;draw();}
  autoCheck.addEventListener('change',()=>{
   clearTimers();auto=autoCheck.checked;stage=0;
   if(auto){
    Object.assign(values,base);draw();changed();
    // Advance at absolute 3 and 6 seconds. Stage three stays indefinitely.
    for(const n of [1,2]){
     timers.push(setTimeout(()=>{
      if(!auto)return;
      stage=n;
      for(const [key] of keys)values[key]=base[key]*(1-0.25*stage);
      draw();changed();
     },3000*n));
    }
   }else draw();
  });
  draw();
  return {getConfig:()=>({...values}),dispose(){clearTimers();panel.remove();},element:panel};
 }
 return Object.freeze({defaults,normalize,attach,createControls});
});
