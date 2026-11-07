'use strict';
// Reusable portrait deformation with non-destructive viewport camera support.
// Independent of rhythm/gameplay/CG UI.
// Usage:
// const motion=NeoRpgSpriteDeformer.create(canvas,{preset:'daisyDance'});
// motion.render(elapsedMilliseconds,fever01);
// motion.configure({tempo:120,zones:[{x:.5,y:.55,rx:.15,ry:.1,...}]});
// motion.setSource('/rpg-assets/characters/name/portraits/primary.png');
// motion.dispose();
// Other modes can provide any portrait, crop, zone shapes and BPM.
(function(root){
 'use strict';
 if(root.NeoRpgSpriteDeformer?.version===5)return;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const val=(n,def)=>Number.isFinite(Number(n))?Number(n):def;
 const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
 const defaults=Object.freeze({
  width:210,height:280,fps:22,tempo:136,speed:.93,
  cropTop:0,cropHeight:.9,cameraMode:'crop',cameraFit:'cover',baseBounce:0,feverBounce:0,tilt:0,
  intensity:1,expansion:1,feverInflate:0,zones:[]
 });
 const presets=Object.freeze({
  daisyDance:Object.freeze({
   source:'/rpg-assets/characters/daisy/portraits/primary.png',
   width:210,height:280,fps:22,tempo:119,speed:.9,
   cameraMode:'viewport',cameraFit:'full-width',cropTop:.11,cropHeight:.78,
   baseBounce:0,feverBounce:5.1,tilt:0,
   feverInflate:1.2,intensity:.65,expansion:1,
   // Calibrated directly in Motion Lab. Coordinates stay relative to the
   // *visible camera window* even while the full portrait moves behind it.
   zones:[
    {x:.33,y:.675,rx:.19,ry:.175,inflateX:.18,inflateY:.095,inflatePhase:-.2,scaleX:0,scaleY:0,moveY:.027,phase:0},
    {x:.725,y:.695,rx:.195,ry:.17,inflateX:.175,inflateY:.11,inflatePhase:-3.14,scaleX:0,scaleY:0,moveY:.023,phase:-.04}
   ]
  })
 });
 function create(canvas,opts={}){
  const ctx=canvas?.getContext?.('2d',{alpha:true});
  if(!ctx)throw TypeError('NeoRpgSpriteDeformer.create requires a 2D canvas');
  const preset=typeof opts.preset==='string'?(presets[opts.preset]||{}):{};
  let config={...defaults,...preset,...opts,zones:(opts.zones??preset.zones??[]).map(z=>({...z}))};
  const image=new Image(),srcCanvas=document.createElement('canvas'),dstCanvas=document.createElement('canvas');
  const srcCtx=srcCanvas.getContext('2d',{willReadFrequently:true}),dstCtx=dstCanvas.getContext('2d');
  if(!srcCtx||!dstCtx)throw Error('2D canvas unavailable');
  let W=0,H=0,surfaceW=0,surfaceH=0,cameraX=0,cameraY=0,pixels=null,ready=false,disposed=false,last=-Infinity,imageSrc='';
  const size=()=>{
   W=Math.round(clamp(val(config.width,210),32,720));H=Math.round(clamp(val(config.height,280),32,1000));
   canvas.width=srcCanvas.width=dstCanvas.width=W;
   canvas.height=srcCanvas.height=dstCanvas.height=H;
   last=-Infinity;
  };
  // Keep the FULL source inside a virtual canvas for viewport mode. The
  // camera is only the final output window; bouncing reveals pixels that
  // would otherwise have been destroyed by an early crop.
  const snapshot=()=>{
   if(disposed||!image.naturalWidth)return;
   const top=clamp(val(config.cropTop,0),0,.89);
   const heightFraction=clamp(val(config.cropHeight,1),.08,1-top);
   const cameraMode=config.cameraMode==='viewport'?'viewport':'crop';
   if(cameraMode==='viewport'){
    // Cover intentionally zooms and can clip left/right. Full-width instead
    // fits the ENTIRE original sprite horizontally into the camera window.
    // Keep a full-height backing surface, so vertical bobbing may reveal the
    // original pixels outside the initial visible frame.
    const fullWidth=config.cameraFit==='full-width';
    const scale=fullWidth
      ? W/image.naturalWidth
      : Math.max(W/image.naturalWidth,H/(image.naturalHeight*heightFraction));
    const drawW=Math.max(1,Math.round(image.naturalWidth*scale));
    const drawH=Math.max(1,Math.round(image.naturalHeight*scale));
    surfaceW=Math.max(W,drawW);
    surfaceH=Math.max(H,drawH);
    cameraX=(surfaceW-W)/2;
    const visibleY=top*drawH;
    cameraY=clamp(visibleY,0,surfaceH-H);
    const drawX=(surfaceW-drawW)/2;
    srcCanvas.width=dstCanvas.width=surfaceW;
    srcCanvas.height=dstCanvas.height=surfaceH;
    srcCtx.clearRect(0,0,surfaceW,surfaceH);
    srcCtx.drawImage(image,drawX,0,drawW,drawH);
   }else{
    surfaceW=W;surfaceH=H;cameraX=0;cameraY=0;
    srcCanvas.width=dstCanvas.width=W;
    srcCanvas.height=dstCanvas.height=H;
    const sourceH=image.naturalHeight*heightFraction;
    const sourceW=Math.min(image.naturalWidth,sourceH*W/H);
    srcCtx.clearRect(0,0,W,H);
    if(config.fit==='contain'){
     // Keep existing Photo Session behavior unchanged.
     const ratio=Math.min(W/image.naturalWidth,H/sourceH);
     const dw=image.naturalWidth*ratio,dh=sourceH*ratio;
     srcCtx.drawImage(image,0,image.naturalHeight*top,image.naturalWidth,sourceH,
      (W-dw)/2,(H-dh)/2,dw,dh);
    }else{
     srcCtx.drawImage(image,(image.naturalWidth-sourceW)/2,image.naturalHeight*top,sourceW,sourceH,0,0,W,H);
    }
   }
   pixels=srcCtx.getImageData(0,0,surfaceW,surfaceH);
   ready=true;last=-Infinity;
   ctx.clearRect(0,0,W,H);
   ctx.drawImage(srcCanvas,-cameraX,-cameraY,surfaceW,surfaceH);
   config.onReady?.();
  };
  // Always draw the entire deformed sprite behind the fixed camera window.
  // canvas clipping hides pixels only at presentation, never in source data.
  const drawFrame=(layer,bounce,tilt)=>{
   ctx.clearRect(0,0,W,H);
   ctx.save();
   ctx.translate(W/2,H*.54+bounce);
   ctx.rotate(tilt);
   ctx.drawImage(layer,-cameraX-W/2,-cameraY-H*.54,surfaceW,surfaceH);
   ctx.restore();
  };
  image.onload=()=>{try{snapshot();}catch(err){ready=false;config.onError?.(err);}};
  image.onerror=()=>{ready=false;config.onError?.(new Error('Portrait failed to load: '+imageSrc));};
  size();
  function setSource(src){
   if(disposed)return;
   imageSrc=String(src||'');ready=false;pixels=null;last=-Infinity;ctx.clearRect(0,0,W,H);
   if(imageSrc)image.src=imageSrc;
  }
  function configure(update={}){
   if(disposed)return;
   const oldWidth=W,oldHeight=H,oldTop=config.cropTop,oldCrop=config.cropHeight,oldFit=config.fit,oldMode=config.cameraMode,oldCameraFit=config.cameraFit;
   config={...config,...update,zones:(update.zones??config.zones).map(z=>({...z}))};
   if(Math.round(val(config.width,210))!==W||Math.round(val(config.height,280))!==H)size();
   if(update.source!==undefined&&String(update.source)!==imageSrc)setSource(update.source);
   else if(ready&&(W!==oldWidth||H!==oldHeight||oldTop!==config.cropTop||oldCrop!==config.cropHeight||oldFit!==config.fit||oldMode!==config.cameraMode||oldCameraFit!==config.cameraFit))snapshot();
   last=-Infinity;
  }
  function render(ms=0,energy=0){
   if(disposed||!ready||!pixels)return false;
   ms=Math.max(0,val(ms,0));
   if(ms>=last&&ms-last<1000/clamp(val(config.fps,22),1,60))return true;
   last=ms;
   // Non-deforming modes (e.g. Photo Session) only need whole-sprite
   // movement. Render the cached image directly at canvas resolution:
   // avoid allocating/copying every pixel 22 times per second.
   if(!config.zones.length){
    const phase=ms*.001*clamp(val(config.tempo,136),1,400)/60*Math.PI*clamp(val(config.speed,.93),.01,5);
    const energy01=clamp(val(energy,0),0,1);
    const bounce=Math.sin(2*phase)*(val(config.baseBounce,0)+val(config.feverBounce,0)*energy01);
    const tilt=Math.sin(phase)*val(config.tilt,0);
    drawFrame(srcCanvas,bounce,tilt);
    return true;
   }
   const original=pixels.data;
   const output=new ImageData(new Uint8ClampedArray(original),surfaceW,surfaceH),buffer=output.data;
   const phase=ms*.001*clamp(val(config.tempo,136),1,400)/60*Math.PI*clamp(val(config.speed,.93),.01,5);
   const e=clamp(val(energy,0),0,1);
   const power=clamp(val(config.intensity,1)*val(config.expansion,1)*(1+e*clamp(val(config.feverInflate,0),0,3)),0,5);
   // Motion Lab coordinates describe the visible 210x280 viewport; map
   // them into virtual source-surface space without changing the JSON.
   const fx=W/surfaceW,fy=H/surfaceH;
   const mappedZones=config.zones.map(z=>({
    ...z,
    x:(cameraX+val(z.x,.5)*W)/surfaceW,
    y:(cameraY+val(z.y,.5)*H)/surfaceH,
    rx:clamp(val(z.rx,.15)*fx,.005,1),
    ry:clamp(val(z.ry,.12)*fy,.005,1),
    scaleX:val(z.scaleX,0)*fx,
    scaleY:val(z.scaleY,0)*fy,
    moveY:val(z.moveY,0)*fy
   }));
   const regions=mappedZones.map(z=>({
    x:z.x,y:z.y,rx:z.rx,ry:z.ry,
    scaleX:z.scaleX,scaleY:z.scaleY,moveY:z.moveY,phase:val(z.phase,0)
   }));
   // Expansion is a separate optional module; legacy motion remains compatible.
   const inflationEngine=root.NeoRpgSpriteInflate?.version===1?root.NeoRpgSpriteInflate:null;
   const expansions=inflationEngine?mappedZones.map(z=>inflationEngine.prepare(z,phase,power)):null;
   const displacement={dx:0,dy:0};
   if(power>0&&regions.length){
    let xmin=surfaceW,xmax=0,ymin=surfaceH,ymax=0;
    for(const z of regions){
     xmin=Math.min(xmin,Math.floor((z.x-z.rx)*surfaceW));
     xmax=Math.max(xmax,Math.ceil((z.x+z.rx)*surfaceW));
     ymin=Math.min(ymin,Math.floor((z.y-z.ry)*surfaceH));
     ymax=Math.max(ymax,Math.ceil((z.y+z.ry)*surfaceH));
    }
    xmin=clamp(xmin,0,surfaceW);xmax=clamp(xmax,0,surfaceW);
    ymin=clamp(ymin,0,surfaceH);ymax=clamp(ymax,0,surfaceH);
    const pulse=Math.sin(2*phase-.5);
    for(let y=ymin;y<ymax;y++){
     const ny=(y+.5)/surfaceH;
     for(let x=xmin;x<xmax;x++){
      const nx=(x+.5)/surfaceW;let dx=0,dy=0;
      for(const z of regions){
       const ux=(nx-z.x)/z.rx,uy=(ny-z.y)/z.ry,r2=ux*ux+uy*uy;
       if(r2>=1)continue;
       const edge=1-smooth((Math.sqrt(r2)-.45)/.55),w=edge*edge*power;
       dx+=w*z.scaleX*pulse*ux;
       dy+=w*(z.moveY*Math.sin(2*phase+z.phase)+z.scaleY*pulse*uy);
      }
      if(expansions){
       displacement.dx=0;displacement.dy=0;
       for(const exp of expansions)inflationEngine.apply(nx,ny,exp,displacement);
       dx+=displacement.dx;dy+=displacement.dy;
      }
      if(Math.abs(dx)+Math.abs(dy)<1e-6)continue;
      const sx=clamp((nx-dx)*surfaceW,0,surfaceW-1),sy=clamp((ny-dy)*surfaceH,0,surfaceH-1);
      const x0=Math.floor(sx),x1=Math.min(surfaceW-1,x0+1),y0=Math.floor(sy),y1=Math.min(surfaceH-1,y0+1);
      const tx=sx-x0,ty=sy-y0,index=(y*surfaceW+x)*4;
      const a=(y0*surfaceW+x0)*4,b=(y0*surfaceW+x1)*4,c=(y1*surfaceW+x0)*4,d=(y1*surfaceW+x1)*4;
      for(let k=0;k<4;k++)
       buffer[index+k]=(original[a+k]*(1-tx)+original[b+k]*tx)*(1-ty)
          +(original[c+k]*(1-tx)+original[d+k]*tx)*ty;
     }
    }
   }
   dstCtx.putImageData(output,0,0);
   const bounce=Math.sin(2*phase)*(val(config.baseBounce,0)+val(config.feverBounce,0)*e);
   const tilt=Math.sin(phase)*val(config.tilt,0);
   drawFrame(dstCanvas,bounce,tilt);
   return true;
  }
  function dispose(){
   disposed=true;ready=false;pixels=null;
   image.onload=null;image.onerror=null;image.removeAttribute('src');
  }
  if(config.source)setSource(config.source);
  return Object.freeze({render,configure,setSource,dispose,get ready(){return ready;},get source(){return imageSrc;}});
 }
 root.NeoRpgSpriteDeformer=Object.freeze({version:5,create,presets});
})(window);
