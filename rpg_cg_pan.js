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
  let animation=null,active=true,tempoFrame=null,geometry=null;
  function stopTempo(){
   if(tempoFrame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(tempoFrame);
   tempoFrame=null;
  }
  function keyframes(config,bottom,top){
   const duration=config.bottomHold+config.moveUp+config.topHold+config.moveDown;
   const a=config.bottomHold/duration,b=(config.bottomHold+config.moveUp)/duration;
   const c=(config.bottomHold+config.moveUp+config.topHold)/duration;
   return [
    {transform:'translateY('+bottom+'px)',offset:0,easing:'linear'},
    {transform:'translateY('+bottom+'px)',offset:a,easing:config.easing},
    {transform:'translateY('+top+'px)',offset:b,easing:'linear'},
    {transform:'translateY('+top+'px)',offset:c,easing:config.easing},
    {transform:'translateY('+bottom+'px)',offset:1}
   ];
  }
  const previous={width:img.style.width,height:img.style.height,maxWidth:img.style.maxWidth,maxHeight:img.style.maxHeight,objectFit:img.style.objectFit,top:img.style.top,left:img.style.left,transform:img.style.transform,transformOrigin:img.style.transformOrigin};
  const originalPosition=img.style.position;
  function stop(){stopTempo();geometry=null;if(animation){animation.cancel();animation=null;}}
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
   img.style.transform='translateY('+bottom+'px)';
   geometry={bottom,top};
   animation=img.animate(keyframes(cfg,bottom,top),{duration,iterations:Infinity,fill:'both'});
  }
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(layout):null;
  observer?.observe(frame);
  img.addEventListener('load',layout);
  layout();
  // Retiming an existing native animation preserves its cycle phase, so
  // subtitle-driven tempo changes never snap the image back to the bottom.
  // The four hold/move values reach their exact target timings after the glide.
  function smoothUpdateConfig(next,transitionMs=600){
   const target=normalize(next);
   if(!active)return;
   stopTempo();
   const effect=animation?.effect;
   if(!animation||!geometry||typeof requestAnimationFrame!=='function'||
      typeof effect?.setKeyframes!=='function'||typeof effect?.updateTiming!=='function'){
    cfg=target;layout();return;
   }
   const from=cfg;
   const numeric=['bottomHold','moveUp','topHold','moveDown'];
   const start=performance.now();
   const period=Math.max(0,Number(transitionMs)||0);
   const animateTempo=now=>{
    if(!active||!animation||!geometry){tempoFrame=null;return;}
    const progress=period?Math.min(1,Math.max(0,(now-start)/period)):1;
    const mix=progress*progress*(3-2*progress);
    const current={...target};
    for(const key of numeric)current[key]=from[key]+(target[key]-from[key])*mix;
    const previousDuration=cfg.bottomHold+cfg.moveUp+cfg.topHold+cfg.moveDown;
    const nextDuration=current.bottomHold+current.moveUp+current.topHold+current.moveDown;
    if(previousDuration<=0||nextDuration<=0){cfg=target;layout();return;}
    // Keep the current position within the active animation iteration.
    // Changing keyframe offsets gradually also blends the relative hold times.
    const elapsed=Number(animation.currentTime)||0;
    const phase=((elapsed%previousDuration)+previousDuration)%previousDuration/previousDuration;
    try{
     animation.effect.setKeyframes(keyframes(current,geometry.bottom,geometry.top));
     animation.effect.updateTiming({duration:nextDuration});
     animation.currentTime=phase*nextDuration;
    }catch(error){
     cfg=target;layout();return;
    }
    cfg=current;
    if(progress<1)tempoFrame=requestAnimationFrame(animateTempo);
    else{cfg=target;tempoFrame=null;}
   };
   tempoFrame=requestAnimationFrame(animateTempo);
  }
  return {refresh:layout,updateConfig(next){cfg=normalize(next);layout();},
   smoothUpdateConfig,dispose(){
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
    // Read the user's edit BEFORE changing Auto mode. Previously stopAuto()
    // redrew every input first, silently restoring the previous value.
    const raw=input.value.trim();
    const n=raw===''?NaN:Number(raw);
    const next=Number.isFinite(n)?Math.max(0,Math.min(10000,n*1000)):values[key];
    stopAuto();
    values[key]=next;
    input.value=(next/1000).toFixed(2);
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
   for(const [key] of keys){
    // Never replace text in a focused number input during a status update.
    if(document.activeElement!==inputs[key])inputs[key].value=(values[key]/1000).toFixed(2);
   }
   drawStatus();
  }
  function drawStatus(){
   autoCheck.checked=auto;
   status.textContent=auto?['Stage 1 · Original speed','Stage 2 · 25% faster','Stage 3 · Another 25% faster (held)'][stage]:'Manual timing';
  }
  function clearTimers(){for(const t of timers)clearTimeout(t);timers=[];}
  function stopAuto(){clearTimers();auto=false;stage=0;drawStatus();}
  autoCheck.addEventListener('change',()=>{
   clearTimers();auto=autoCheck.checked;stage=0;
   if(auto){
    Object.assign(values,base);draw();changed();
    // Advance at absolute 3 and 6 seconds. Stage three stays indefinitely.
    for(const n of [1,2]){
     timers.push(setTimeout(()=>{
      if(!auto)return;
      stage=n;
      for(const [key] of keys)values[key]=base[key]/(1.25**stage);
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
