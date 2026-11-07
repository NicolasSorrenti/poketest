'use strict';
// Neo Campus Dance Pose Controller.
// Reusable presentation module: no RPG clocks, rewards, notes or relationship changes.
// Cross-fades preloaded expression / overworld poses on musical bars while preserving
// the original high-resolution art and a separate motion-deformed primary portrait.
(function(root){
 'use strict';
 if(root.NeoRpgDancePoseController?.version===1)return;
 const DAISY_POSES=Object.freeze([
  {id:'primary',type:'base'},
  {id:'happy',src:'/rpg-assets/characters/daisy/expressionsv2/happy.png'},
  {id:'walking',src:'/rpg-assets/characters/daisy/overworld/walking.png'},
  {id:'determined',src:'/rpg-assets/characters/daisy/expressionsv2/determined.png'},
  {id:'victory',src:'/rpg-assets/characters/daisy/expressionsv2/battle-victory.png'},
  {id:'surprised',src:'/rpg-assets/characters/daisy/expressionsv2/surprised.png',reactionOnly:true}
 ]);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function make(target,options={}){
  if(!target||typeof target.appendChild!=='function')throw new TypeError('Dance pose controller needs an actor container');
  const canvas=options.baseCanvas||target.querySelector('canvas');
  if(!canvas)throw new TypeError('Dance pose controller needs the primary sprite canvas');
  const fps=Number(options.bpm)||136;
  const beatsPerBar=Math.max(2,Math.round(Number(options.beatsPerBar)||4));
  const barTime=60000/fps*beatsPerBar;
  const transitionMs=clamp(Number(options.transitionMs)||260,120,650);
  const defaultPoses=options.characterId==='daisy'||!options.poses?DAISY_POSES:options.poses;
  const entries=(defaultPoses||[]).map((item,i)=>({...item,index:i,loaded:item.type==='base',failed:false,image:null,frame:null,bounds:null})); 
  const base=entries.find(p=>p.type==='base')||{id:'primary',type:'base',loaded:true};
  let current=base,disposed=false,paused=false,lastMeasureW=0,lastMeasureH=0,reactionUntil=-1,reactionId=null;
  let totalReady=0;
  const readyMap=new Map([[base.id,base]]);
  canvas.style.transition='opacity '+transitionMs+'ms ease-in-out';
  canvas.style.opacity='1';
  canvas.style.willChange='opacity';
  const offscreen=document.createElement('canvas');
  const sampler=offscreen.getContext('2d',{willReadFrequently:true});
  // Sample a small alpha mask once; render the original full-resolution image.
  function contentBounds(img){
   if(!sampler)return {left:0,top:0,right:1,bottom:1};
   const k=Math.min(1,240/Math.max(img.naturalWidth,img.naturalHeight));
   const w=Math.max(1,Math.ceil(img.naturalWidth*k)),h=Math.max(1,Math.ceil(img.naturalHeight*k));
   offscreen.width=w;offscreen.height=h;
   sampler.clearRect(0,0,w,h);
   sampler.drawImage(img,0,0,w,h);
   let data;
   try{data=sampler.getImageData(0,0,w,h).data;}catch(_){return null;}
   let minx=w,miny=h,maxx=-1,maxy=-1,count=0;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const alpha=data[(y*w+x)*4+3];
    if(alpha<=28)continue;
    count++;
    if(x<minx)minx=x;if(x>maxx)maxx=x;
    if(y<miny)miny=y;if(y>maxy)maxy=y;
   }
   if(count===0)return null;
   // Solid-rectangle CG/backgrounds do not belong on the dance sprite layer.
   if(count/(w*h)>.975)return null;
   return {left:minx/w,top:miny/h,right:(maxx+1)/w,bottom:(maxy+1)/h};
  }
  function position(entry,w,h){
   if(!entry.image||!entry.bounds)return;
   const b=entry.bounds,img=entry.image;
   const bboxW=(b.right-b.left)*img.naturalWidth;
   const bboxH=(b.bottom-b.top)*img.naturalHeight;
   if(bboxW<=0||bboxH<=0)return;
   const scale=Math.min(w*.95/bboxW,h*.95/bboxH);
   const drawW=img.naturalWidth*scale,drawH=img.naturalHeight*scale;
   // Anchor the visible figure by its bottom center. Transparent image margins
   // remain off-stage and the entire visible silhouette stays in frame.
   const left=w/2-((b.left+b.right)/2)*drawW;
   const top=h*.98-b.bottom*drawH;
   img.style.width=drawW+'px';img.style.height=drawH+'px';
   img.style.left=left+'px';img.style.top=top+'px';
  }
  function resize(){
   if(disposed)return;
   const w=target.clientWidth,h=target.clientHeight;
   if(w<1||h<1)return;
   if(Math.abs(w-lastMeasureW)<1&&Math.abs(h-lastMeasureH)<1)return;
   lastMeasureW=w;lastMeasureH=h;
   for(const entry of entries)if(entry.loaded&&entry.type!=='base')position(entry,w,h);
  }
  function activate(entry){
   if(disposed||!entry?.loaded||entry===current)return;
   current=entry;
   canvas.style.opacity=entry.type==='base'?'1':'0';
   for(const pose of entries){
    if(!pose.frame)continue;
    pose.frame.style.opacity=pose===entry?'1':'0';
   }
  }
  function onImageReady(entry,img){
   if(disposed)return;
   entry.bounds=contentBounds(img);
   if(!entry.bounds){entry.failed=true;return;}
   const layer=document.createElement('div');
   layer.className='nc-dance-pose-frame';
   layer.style.cssText='position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity '+transitionMs+'ms ease-in-out;will-change:opacity;transform-origin:50% 80%;';
   img.style.cssText='position:absolute;max-width:none;max-height:none;display:block;object-fit:fill;pointer-events:none;filter:drop-shadow(0 0 12px #f45fca70);';
   img.draggable=false;
   layer.appendChild(img);target.appendChild(layer);
   entry.frame=layer;entry.loaded=true;readyMap.set(entry.id,entry);totalReady++;
   lastMeasureW=0;lastMeasureH=0;resize();
  }
  // Progressive asynchronous preload; never block the rhythm game.
  function queueImages(){
   const loading=entries.filter(p=>p.src&&p.type!=='base');
   for(const entry of loading){
    if(disposed)break;
    const image=new Image();
    entry.image=image;
    image.decoding='async';
    image.onload=()=>onImageReady(entry,image);
    image.onerror=()=>{entry.failed=true;};
    image.src=entry.src;
   }
  }
  queueImages();
  function poseAt(timeMs,combo,fever){
   if(timeMs<0)return base;
   if(reactionUntil>=timeMs&&reactionId){
    const reaction=readyMap.get(reactionId);
    if(reaction)return reaction;
   }
   const upbeat=fever>=.7;
   // Every 8 beats normally; every 4 beats at high Fever.
   const bar=Math.floor(timeMs/(barTime*(upbeat?1:2)));
   const sequence=['primary','happy','walking','determined','happy','victory','walking','determined'];
   let wanted=sequence[(bar+Math.floor(bar/5))%sequence.length];
   if(combo>=12&&bar%4===3)wanted='victory';
   const match=readyMap.get(wanted);
   if(match)return match;
   // Prefer a stable, already-loaded pose to a blank frame.
   return current.loaded?current:base;
  }
  function render(elapsed=0,metrics={}){
   if(disposed)return;
   resize();
   if(paused)return;
   const combo=Number(metrics.combo)||0,fever=clamp(Number(metrics.fever)||0,0,1);
   const timeMs=Math.max(0,Number(elapsed)||0);
   const wanted=poseAt(timeMs,combo,fever);
   activate(wanted);
   // Modest whole-body sway on alternate full-resolution images; no chest
   // deformation coordinates from the primary pose are reused here.
   const wobble=Math.sin(timeMs/60000*fps*Math.PI*2)*(.8+1.9*fever);
   const tilt=Math.sin(timeMs/60000*fps*Math.PI)*(.15+.3*fever);
   for(const entry of entries)if(entry.frame&&entry.frame.style.opacity==='1'){
    entry.frame.style.transform='translate3d(0,'+wobble.toFixed(2)+'px,0) rotate('+tilt.toFixed(3)+'deg)';
   }
  }
  function react(kind,elapsed){
   if(disposed)return;
   if(kind==='miss'){
    reactionId='surprised';
    reactionUntil=Math.max(0,Number(elapsed)||0)+barTime*.55;
   }else if(kind==='perfect'){
    // A short Victory pose only for a full-combo milestone.
    reactionId='victory';
    reactionUntil=Math.max(0,Number(elapsed)||0)+barTime*.65;
   }
  }
  function reset(){
   if(disposed)return;
   reactionUntil=-1;reactionId=null;
   activate(base);
  }
  function dispose(){
   if(disposed)return;disposed=true;
   canvas.style.opacity='1';canvas.style.transition='';canvas.style.willChange='';
   for(const entry of entries){
    if(entry.image){entry.image.onload=null;entry.image.onerror=null;}
    entry.frame?.remove();
    entry.frame=null;
   }
   readyMap.clear();
  }
  return Object.freeze({render,react,reset,dispose,resize,
   get pose(){return current.id;},
   get loadedCount(){return totalReady;},
   get available(){return [...readyMap.keys()];}
  });
 }
 root.NeoRpgDancePoseController=Object.freeze({
  version:1,create:make,presets:Object.freeze({daisy:DAISY_POSES})
 });
})(window);
