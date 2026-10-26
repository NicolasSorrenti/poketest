/* Non-destructive VN portrait framing: estimate the visible silhouette of
   transparent source art while preserving the original image bytes.
   A character keeps the same alignment when switching expressions. */
(function(root){
  'use strict';
  const profiles=new Map();
  const pending=new Set();
  const MAX_SCALE=1.23;
  function measure(img){
    const w=img.naturalWidth,h=img.naturalHeight;
    if(!w||!h||typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');
    canvas.width=96;canvas.height=Math.max(1,Math.round(96*h/w));
    if(canvas.height>240){canvas.height=240;canvas.width=Math.max(1,Math.round(240*w/h));}
    let data;
    try{const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);data=ctx.getImageData(0,0,canvas.width,canvas.height).data;}
    catch(_){return null;} // Cross-origin or tainted images: leave untouched.
    let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1,clear=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
      const a=data[(y*canvas.width+x)*4+3];
      if(a<24){clear++;continue;}
      if(x<minX)minX=x;if(x>maxX)maxX=x;
      if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
    if(maxY<0||clear/(canvas.width*canvas.height)<.025)return null;
    const visibleHeight=(maxY-minY+1)/canvas.height;
    // Only subtle corrections: no face crop, no distortion, no forced uniform heights.
    const scale=Math.min(MAX_SCALE,Math.max(1,0.87/visibleHeight));
    const bottomGap=(canvas.height-1-maxY)/canvas.height;
    return {scale, bottomGap};
  }
  function apply(node,profile){
    node.style.setProperty('--rpg-portrait-art-scale',String(profile.scale));
    node.style.setProperty('--rpg-portrait-art-lift',(-Math.min(7,profile.bottomGap*40)).toFixed(2)+'%');
    node.dataset.portraitFraming='normalized';
  }
  function attach(img,id){
    if(!img||!id)return;
    if(profiles.has(id)){apply(img,profiles.get(id));return;}
    const run=()=>{
      if(profiles.has(id)){apply(img,profiles.get(id));return;}
      const profile=measure(img);
      if(profile){profiles.set(id,profile);apply(img,profile);}
      pending.delete(id);
    };
    if(img.complete&&img.naturalWidth){run();return;}
    if(pending.has(id))return;
    pending.add(id);
    img.addEventListener('load',run,{once:true});
    img.addEventListener('error',()=>pending.delete(id),{once:true});
  }
  root.NeoRpgPortraitFraming={attach,measure,profiles};
})(typeof window!=='undefined'?window:globalThis);
