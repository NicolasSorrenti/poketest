'use strict';
// Neo Campus Dance Pose Controller v2.
// Preload existing expression / overworld artwork and transition on musical
// bars. Every pose uses the same dialogue-style upper-body camera and its OWN
// regional motion mask; no waist-level full-body jump between illustrations.
// Never owns gameplay, affinity, scoring, RPG time or saves.
(function(root){
 'use strict';
 if(root.NeoRpgDancePoseController?.version===5)return;
 const DAISY_POSES=Object.freeze([
  {id:'primary',type:'base'},
  {id:'happy',src:'/rpg-assets/characters/daisy/expressionsv2/happy.png'},
  {id:'walking',src:'/rpg-assets/characters/daisy/overworld/walking.png',framing:'overworld',cropTop:.04},
  {id:'kneeling',src:'/rpg-assets/characters/daisy/overworld/kneeing.png',framing:'crouching',cropTop:0},
  {id:'determined',src:'/rpg-assets/characters/daisy/expressionsv2/determined.png'},
  {id:'victory',src:'/rpg-assets/characters/daisy/expressionsv2/battle-victory.png'},
  {id:'surprised',src:'/rpg-assets/characters/daisy/expressionsv2/surprised.png',reactionOnly:true}
 ]);
 const RINA_POSES=Object.freeze([
  {id:'primary',type:'base'},
  {id:'happy',src:'/rpg-assets/characters/rina/expressionsv2/happy.png'},
  {id:'idol',src:'/rpg-assets/characters/rina/overworld/alternate-idol-pose.png',framing:'overworld',cropTop:0},
  {id:'determined',src:'/rpg-assets/characters/rina/expressionsv2/determined.png'},
  {id:'reaching',src:'/rpg-assets/characters/rina/overworld/reaching-idol.png',framing:'overworld',cropTop:0},
  {id:'victory',src:'/rpg-assets/characters/rina/expressionsv2/battle-victory.png'},
  {id:'surprised',src:'/rpg-assets/characters/rina/expressionsv2/surprised.png',reactionOnly:true}
 ]);
 const RINA_REGIONS=Object.freeze({
  happy:{left:[.34,.67,.145,.115],right:[.67,.67,.145,.115]},
  idol:{left:[.36,.59,.13,.10],right:[.64,.59,.13,.10]},
  determined:{left:[.34,.67,.145,.12],right:[.67,.67,.145,.12]},
  reaching:{left:[.36,.59,.12,.10],right:[.64,.59,.12,.10]},
  victory:{left:[.34,.67,.14,.11],right:[.67,.67,.14,.11]},
  surprised:{left:[.34,.67,.14,.115],right:[.67,.67,.14,.115]}
 });
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 // Tunable pose-local bust regions. These are intentionally gentler than the
 // calibrated primary portrait; other artwork has distinct anatomy and poses.
 // The regions use coordinates IN THE VISIBLE DIALOGUE WINDOW, not full art.
 const DAISY_REGIONS=Object.freeze({
  happy:{left:[.32,.70,.165,.135],right:[.71,.71,.165,.132]},
  walking:{left:[.35,.58,.145,.12],right:[.70,.58,.145,.12]},
  kneeling:{left:[.47,.52,.11,.09],right:[.64,.52,.11,.09]},
  determined:{left:[.33,.70,.16,.135],right:[.70,.70,.16,.135]},
  victory:{left:[.33,.70,.15,.13],right:[.71,.70,.15,.13]},
  surprised:{left:[.34,.70,.16,.13],right:[.70,.70,.16,.13]}
 });
 function motionZones(entry,characterId){
  const regions=characterId==='rina'?RINA_REGIONS:DAISY_REGIONS;
  const pair=entry.zones||regions[entry.id]||regions.happy;
  if(!pair)return [];
  const toZone=(p,side)=>({
   x:p[0],y:p[1],rx:p[2],ry:p[3],
   inflateX:characterId==='rina'?.095:.13,inflateY:characterId==='rina'?.05:.075,inflatePhase:side===0?-.2:-3.14,
   scaleX:0,scaleY:0,moveY:.014,phase:side===0?0:-.04
  });
  return [toZone(pair.left,0),toZone(pair.right,1)];
 }
 function make(target,options={}){
  if(!target?.appendChild)throw new TypeError('Dance pose controller needs an actor container');
  const canvas=options.baseCanvas||target.querySelector('canvas');
  if(!canvas)throw new TypeError('Dance pose controller needs the primary sprite canvas');
  const engine=root.NeoRpgSpriteDeformer;
  const bpm=Math.max(40,Number(options.bpm)||136);
  const beatsPerBar=Math.max(2,Math.round(Number(options.beatsPerBar)||4));
  const barTime=60000/bpm*beatsPerBar;
  const leadMs=Math.max(0,Number(options.leadMs)||0);
  const transitionMs=clamp(Number(options.transitionMs)||280,120,650);
  const characterId=String(options.characterId||'').toLowerCase();
  const poses=Array.isArray(options.poses)?options.poses:
   characterId==='daisy'?DAISY_POSES:characterId==='rina'?RINA_POSES:[{id:'primary',type:'base'}];
  const entries=poses.map((item,i)=>({
   ...item,index:i,loaded:item.type==='base',failed:false,frame:null,motion:null
  }));
  const base=entries.find(p=>p.type==='base')||{id:'primary',type:'base',loaded:true};
  const readyMap=new Map([[base.id,base]]);
  const animationPreset=options.motionConfig||{};
  let current=base,outgoing=null,transitionUntil=0,disposed=false;
  let reactionUntil=-1,reactionId=null,totalReady=0;

  const baseTransition=canvas.style.transition,baseOpacity=canvas.style.opacity;
  canvas.style.transition='opacity '+transitionMs+'ms ease-in-out';
  canvas.style.opacity='1';
  canvas.style.willChange='opacity';
  // Expressions use the dialogue bust; overworld/crouching poses preserve
  // their body silhouette and do not collapse into a head close-up.
  function preload(entry){
   if(disposed||!engine||!entry.src||entry.type==='base')return;
   const layer=document.createElement('div');
   layer.className='nc-dance-pose-frame';
   layer.style.cssText='position:absolute;inset:0;overflow:hidden;opacity:0;pointer-events:none;transition:opacity '+transitionMs+'ms ease-in-out;will-change:opacity;';
   const poseCanvas=document.createElement('canvas');
   poseCanvas.className='nc-pose-motion-canvas';
   poseCanvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;object-fit:contain;object-position:center center;';
   layer.append(poseCanvas);
   target.append(layer);
   entry.frame=layer;
   try{
    entry.motion=engine.create(poseCanvas,{
     source:entry.src,
     width:210,height:280,
     cameraMode:'viewport',
     cameraFit:entry.cameraFit||(entry.framing==='overworld'||entry.framing==='crouching'?'full-width':'dialogue-bust'),
     cropTop:Number.isFinite(Number(entry.cropTop))?Number(entry.cropTop):0,
     cropHeight:Number.isFinite(Number(entry.cropHeight))?Number(entry.cropHeight):1,
     dialogueBustScale:Number(entry.dialogueBustScale)||2.78,
     tempo:Number(animationPreset.tempo)||119,
     speed:Number(animationPreset.speed)||.9,
     fps:Math.min(24,Number(animationPreset.fps)||22),
     baseBounce:0,
     feverBounce:Number.isFinite(Number(animationPreset.feverBounce))?Number(animationPreset.feverBounce):5.1,
     tilt:0,
     intensity:Math.min(.58,Number(animationPreset.intensity)||.65),
     feverInflate:Number.isFinite(Number(animationPreset.feverInflate))?Number(animationPreset.feverInflate):1.2,
     zones:motionZones(entry,characterId),
     onReady:()=>{
      if(disposed)return;
      entry.loaded=true;readyMap.set(entry.id,entry);totalReady++;
     },
     onError:()=>{
      if(disposed)return;
      entry.failed=true;entry.loaded=false;readyMap.delete(entry.id);
     }
    });
   }catch(err){
    entry.failed=true;layer.remove();entry.frame=null;
    console.warn('Dance pose unavailable, keeping primary illustration',entry.id,err);
   }
  }
  for(const entry of entries)preload(entry);
  function opacity(pose,value){
   if(pose===base)canvas.style.opacity=String(value);
   else if(pose?.frame)pose.frame.style.opacity=String(value);
  }
  function activate(entry){
   if(disposed||!entry?.loaded||current===entry)return;
   outgoing=current;
   current=entry;
   transitionUntil=performance.now()+transitionMs;
   opacity(outgoing,0);
   opacity(entry,1);
   for(const pose of entries)if(pose!==current&&pose!==outgoing)opacity(pose,0);
  }
  function poseAt(timeMs,combo,fever){
   const musicTime=timeMs-leadMs;
   if(musicTime<0)return base;
   if(reactionId&&timeMs<reactionUntil){
    const reaction=readyMap.get(reactionId);
    if(reaction)return reaction;
   }
   const highFever=fever>=.7;
   // One transition every 8 beats, or 4 beats during high Fever.
   const bar=Math.floor(musicTime/(barTime*(highFever?1:2)));
   const sequence=characterId==='rina'
     ? ['primary','happy','idol','determined','reaching','victory','happy','idol','determined']
     : ['primary','happy','walking','determined','happy','victory','kneeling','walking','determined'];
   let wanted=sequence[(bar+Math.floor(bar/5))%sequence.length];
   if(combo>=12&&bar%4===3)wanted='victory';
   return readyMap.get(wanted)|| (current.loaded?current:base);
  }
  function render(elapsed=0,metrics={}){
   if(disposed)return;
   const timeMs=Math.max(0,Number(elapsed)||0);
   const combo=Number(metrics.combo)||0,fever=clamp(Number(metrics.fever)||0,0,1);
   activate(poseAt(timeMs,combo,fever));
   const transitioning=performance.now()<transitionUntil;
   // Render active artwork, plus the outgoing pose during the crossfade.
   // Inactive canvases keep their cached frame, saving mobile CPU.
   for(const entry of entries){
    if(!entry.motion||!entry.loaded)continue;
    if(entry===current||(transitioning&&entry===outgoing))
     entry.motion.render(timeMs,fever);
   }
   if(!transitioning)outgoing=null;
  }
  function react(kind,elapsed){
   if(disposed)return;
   if(kind==='miss')reactionId='surprised';
   else if(kind==='perfect')reactionId='victory';
   else return;
   reactionUntil=Math.max(0,Number(elapsed)||0)+barTime*.65;
  }
  function reset(){
   if(disposed)return;
   reactionId=null;reactionUntil=-1;outgoing=null;transitionUntil=0;
   current=base;opacity(base,1);
   for(const pose of entries)if(pose!==base)opacity(pose,0);
  }
  function dispose(){
   if(disposed)return;
   disposed=true;
   for(const entry of entries){
    entry.motion?.dispose();
    entry.frame?.remove();
    entry.frame=null;
   }
   readyMap.clear();
   canvas.style.transition=baseTransition;
   canvas.style.opacity=baseOpacity;
   canvas.style.willChange='';
  }
  return Object.freeze({
   render,react,reset,dispose,resize:()=>{},
   get pose(){return current.id;},
   get needsBaseRender(){return current===base||outgoing===base&&performance.now()<transitionUntil;},
   get loadedCount(){return totalReady;},
   get available(){return [...readyMap.keys()];}
  });
 }
 root.NeoRpgDancePoseController=Object.freeze({
  version:5,create:make,presets:Object.freeze({daisy:DAISY_POSES,rina:RINA_POSES})
 });
})(window);
