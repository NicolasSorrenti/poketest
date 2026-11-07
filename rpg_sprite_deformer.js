'use strict';
// Reusable cropped-portrait deformation. Independent of rhythm/gameplay/CG UI.
// Usage:
// const motion=NeoRpgSpriteDeformer.create(canvas,{preset:'daisyDance'});
// motion.render(elapsedMilliseconds,fever01);
// motion.configure({tempo:120,zones:[{x:.5,y:.55,rx:.15,ry:.1,...}]});
// motion.setSource('/rpg-assets/characters/name/portraits/primary.png');
// motion.dispose();
// Other modes can provide any portrait, crop, zone shapes and BPM.
(function(root){
 'use strict';
 if(root.NeoRpgSpriteDeformer?.version===2)return;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const val=(n,def)=>Number.isFinite(Number(n))?Number(n):def;
 const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
 const defaults=Object.freeze({
  width:210,height:280,fps:22,tempo:136,speed:.93,
  cropTop:0,cropHeight:.9,baseBounce:0,feverBounce:0,tilt:0,
  intensity:1,expansion:1,zones:[]
 });
 const presets=Object.freeze({
  daisyDance:Object.freeze({
   source:'/rpg-assets/characters/daisy/portraits/primary.png',
   width:210,height:280,fps:22,tempo:136,speed:.93,cropTop:0,cropHeight:.9,
   baseBounce:0.4,feverBounce:1.2,tilt:.002,
   // Mid-torso zones. Normalized to the cropped portrait, not full source.
   // Separately adjustable regions; excludes head, neck and waist.
   zones:[
    // Each zone independently expands/contracts on the beat; no neck movement.
    {x:.385,y:.580,rx:.148,ry:.108,inflateX:.18,inflateY:.15,inflatePhase:-.20,scaleX:0,scaleY:0,moveY:0,phase:0},
    {x:.620,y:.580,rx:.148,ry:.108,inflateX:.18,inflateY:.15,inflatePhase:-.20,scaleX:0,scaleY:0,moveY:0,phase:0}
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
  let W=0,H=0,pixels=null,ready=false,disposed=false,last=-Infinity,imageSrc='';
  const size=()=>{
   W=Math.round(clamp(val(config.width,210),32,720));H=Math.round(clamp(val(config.height,280),32,1000));
   canvas.width=srcCanvas.width=dstCanvas.width=W;
   canvas.height=srcCanvas.height=dstCanvas.height=H;
   last=-Infinity;
  };
  const snapshot=()=>{
   if(disposed||!image.naturalWidth)return;
   const top=clamp(val(config.cropTop,0),0,.89);
   const heightFraction=clamp(val(config.cropHeight,1),.08,1-top);
   const sourceH=image.naturalHeight*heightFraction;
   const sourceW=Math.min(image.naturalWidth,sourceH*W/H);
   srcCtx.clearRect(0,0,W,H);
   if(config.fit==='contain'){
    // Photo Session needs the entire original pose. Letterbox transparently;
    // preserve the existing crop/cover behavior for the Daisy dance preset.
    const ratio=Math.min(W/image.naturalWidth,H/sourceH);
    const dw=image.naturalWidth*ratio,dh=sourceH*ratio;
    srcCtx.drawImage(image,0,image.naturalHeight*top,image.naturalWidth,sourceH,
     (W-dw)/2,(H-dh)/2,dw,dh);
   }else{
    srcCtx.drawImage(image,(image.naturalWidth-sourceW)/2,image.naturalHeight*top,sourceW,sourceH,0,0,W,H);
   }
   pixels=srcCtx.getImageData(0,0,W,H);
   ready=true;last=-Infinity;
   ctx.clearRect(0,0,W,H);ctx.drawImage(srcCanvas,0,0);
   config.onReady?.();
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
   const oldWidth=W,oldHeight=H,oldTop=config.cropTop,oldCrop=config.cropHeight,oldFit=config.fit;
   config={...config,...update,zones:(update.zones??config.zones).map(z=>({...z}))};
   if(Math.round(val(config.width,210))!==W||Math.round(val(config.height,280))!==H)size();
   if(update.source!==undefined&&String(update.source)!==imageSrc)setSource(update.source);
   else if(ready&&(W!==oldWidth||H!==oldHeight||oldTop!==config.cropTop||oldCrop!==config.cropHeight||oldFit!==config.fit))snapshot();
   last=-Infinity;
  }
  function render(ms=0,energy=0){
   if(disposed||!ready||!pixels)return false;
   ms=Math.max(0,val(ms,0));
   if(ms>=last&&ms-last<1000/clamp(val(config.fps,22),1,60))return true;
   last=ms;
   const original=pixels.data;
   const output=new ImageData(new Uint8ClampedArray(original),W,H),buffer=output.data;
   const phase=ms*.001*clamp(val(config.tempo,136),1,400)/60*Math.PI*clamp(val(config.speed,.93),.01,5);
   const power=clamp(val(config.intensity,1)*val(config.expansion,1),0,5);
   const regions=config.zones.map(z=>({
    x:val(z.x,.5),y:val(z.y,.5),rx:clamp(val(z.rx,.15),.005,1),
    ry:clamp(val(z.ry,.12),.005,1),scaleX:val(z.scaleX,0),
    scaleY:val(z.scaleY,0),moveY:val(z.moveY,0),phase:val(z.phase,0)
   }));
   // Expansion is a separate optional module; legacy motion remains compatible.
   const inflationEngine=root.NeoRpgSpriteInflate?.version===1?root.NeoRpgSpriteInflate:null;
   const expansions=inflationEngine?config.zones.map(z=>inflationEngine.prepare(z,phase,power)):null;
   const displacement={dx:0,dy:0};
   if(power>0&&regions.length){
    let xmin=W,xmax=0,ymin=H,ymax=0;
    for(const z of regions){
     xmin=Math.min(xmin,Math.floor((z.x-z.rx)*W));
     xmax=Math.max(xmax,Math.ceil((z.x+z.rx)*W));
     ymin=Math.min(ymin,Math.floor((z.y-z.ry)*H));
     ymax=Math.max(ymax,Math.ceil((z.y+z.ry)*H));
    }
    xmin=clamp(xmin,0,W);xmax=clamp(xmax,0,W);
    ymin=clamp(ymin,0,H);ymax=clamp(ymax,0,H);
    const pulse=Math.sin(2*phase-.5);
    for(let y=ymin;y<ymax;y++){
     const ny=(y+.5)/H;
     for(let x=xmin;x<xmax;x++){
      const nx=(x+.5)/W;let dx=0,dy=0;
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
      const sx=clamp((nx-dx)*W,0,W-1),sy=clamp((ny-dy)*H,0,H-1);
      const x0=Math.floor(sx),x1=Math.min(W-1,x0+1),y0=Math.floor(sy),y1=Math.min(H-1,y0+1);
      const tx=sx-x0,ty=sy-y0,index=(y*W+x)*4;
      const a=(y0*W+x0)*4,b=(y0*W+x1)*4,c=(y1*W+x0)*4,d=(y1*W+x1)*4;
      for(let k=0;k<4;k++)
       buffer[index+k]=(original[a+k]*(1-tx)+original[b+k]*tx)*(1-ty)
          +(original[c+k]*(1-tx)+original[d+k]*tx)*ty;
     }
    }
   }
   dstCtx.putImageData(output,0,0);
   const e=clamp(val(energy,0),0,1);
   const bounce=Math.sin(2*phase)*(val(config.baseBounce,0)+val(config.feverBounce,0)*e);
   const tilt=Math.sin(phase)*val(config.tilt,0);
   ctx.clearRect(0,0,W,H);
   ctx.save();ctx.translate(W/2,H*.54+bounce);ctx.rotate(tilt);
   ctx.drawImage(dstCanvas,-W/2,-H*.54,W,H);ctx.restore();
   return true;
  }
  function dispose(){
   disposed=true;ready=false;pixels=null;
   image.onload=null;image.onerror=null;image.removeAttribute('src');
  }
  if(config.source)setSource(config.source);
  return Object.freeze({render,configure,setSource,dispose,get ready(){return ready;},get source(){return imageSrc;}});
 }
 root.NeoRpgSpriteDeformer=Object.freeze({version:2,create,presets});
})(window);
