'use strict';
/* CG Memories viewer: presentation only; existing RPG unlock/save logic remains authoritative. */
(function(){
 const dialog=document.getElementById('galleryDialog');
 const preview=document.getElementById('galleryPreview');
 const grid=document.getElementById('galleryGrid');
 if(!dialog||!preview||!grid)return;
 const viewer=document.createElement('dialog');
 viewer.id='cgFullscreenViewer';viewer.className='cg-fullscreen-viewer';
 viewer.setAttribute('aria-label','Full screen CG memory');
 viewer.innerHTML='<div class="cg-viewer-bar"><strong id="cgViewerTitle"></strong><span id="cgViewerPosition"></span><button type="button" id="cgViewerClose" aria-label="Close full screen">✕</button></div><div class="cg-viewer-stage"><button type="button" id="cgViewerPrev" aria-label="Previous memory">‹</button><div id="cgViewerCanvas"><img id="cgViewerImage" alt="" draggable="false"></div><button type="button" id="cgViewerNext" aria-label="Next memory">›</button></div><div class="cg-viewer-footer"><button type="button" id="cgViewerZoomOut" aria-label="Zoom out">−</button><button type="button" id="cgViewerReset">Fit</button><button type="button" id="cgViewerPan" aria-pressed="false" title="Toggle automatic vertical pan">▶ Pan</button><button type="button" id="cgViewerZoomIn" aria-label="Zoom in">＋</button><span>Swipe or use ← → to browse · Pinch or scroll to zoom</span></div>';
 const controlsHost=document.createElement('div');
 controlsHost.id='cgViewerTimingControls';controlsHost.hidden=true;
 viewer.querySelector('.cg-viewer-footer').before(controlsHost);
 document.body.append(viewer);
 const $=id=>document.getElementById(id),img=$('cgViewerImage'),canvas=$('cgViewerCanvas');
 let index=0,scale=1,tx=0,ty=0,drag=null,pinch=null,pan=null,panFrame=null,panResize=null,pendingAutoPan=false,panControls=null;
 const items=()=>[...grid.querySelectorAll('.cg-tile.unlocked')];
 function stopPan(){
  pendingAutoPan=false;panControls?.dispose();panControls=null;
  controlsHost.hidden=true;viewer.classList.remove('cg-pan-controls-visible');
  pan?.dispose();pan=null;panResize?.disconnect();panResize=null;
  if(panFrame){canvas.append(img);panFrame.remove();panFrame=null;}
  $('cgViewerPan').setAttribute('aria-pressed','false');$('cgViewerPan').textContent='▶ Pan';
 }
 function startPan(){
  if(!window.NeoRpgCGPan||!img.complete||!img.naturalWidth||!viewer.open)return;
  stopPan();scale=1;tx=0;ty=0;apply();
  panFrame=document.createElement('div');
  panFrame.style.cssText='position:relative;overflow:hidden;flex:none;max-width:100%;background:#070a12';
  canvas.append(panFrame);panFrame.append(img);
  const resize=()=>{
   if(!panFrame||!img.naturalWidth)return;
   const width=Math.min(canvas.clientWidth,canvas.clientHeight*2*img.naturalWidth/img.naturalHeight);
   if(width<=0)return;
   panFrame.style.width=width+'px';
   panFrame.style.height=(width*img.naturalHeight/img.naturalWidth/2)+'px';
   pan?.refresh();
  };
  resize();
  panControls=window.NeoRpgCGPan.createControls(controlsHost,config=>{
   if(!panFrame)return;
   pan?.updateConfig(config);
  });
  controlsHost.hidden=false;viewer.classList.add('cg-pan-controls-visible');
  pan=window.NeoRpgCGPan.attach(panFrame,img,panControls.getConfig());
  if(typeof ResizeObserver==='function'){panResize=new ResizeObserver(resize);panResize.observe(canvas);}
  $('cgViewerPan').setAttribute('aria-pressed','true');$('cgViewerPan').textContent='■ Stop pan';
 }
 function reset(){stopPan();scale=1;tx=0;ty=0;apply();}
 function apply(){img.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')';}
 function zoom(next){stopPan();scale=Math.max(1,Math.min(5,next));if(scale===1){tx=0;ty=0;}apply();}
 function show(i,animated=false){
  stopPan();pendingAutoPan=animated;
  const tiles=items();if(!tiles.length)return;
  index=(i+tiles.length)%tiles.length;
  const tile=tiles[index];tile.click();
  const character=tile.dataset.character;
  if(character)window.NeoRpgDiscreetAvatars?.set?.(canvas,character,'neutral',character);
  const source=preview.querySelector('.cg-art-frame img');
  const title=tile.querySelector('strong')?.textContent||'Memory';
  $('cgViewerTitle').textContent=title;$('cgViewerPosition').textContent=(index+1)+' / '+tiles.length;
  $('cgViewerPrev').disabled=tiles.length<2;$('cgViewerNext').disabled=tiles.length<2;
  img.alt=title;img.removeAttribute('src');reset();pendingAutoPan=animated;
  if(source){
   const update=()=>{if(source.hidden||!source.currentSrc&&!source.src)return;const next=source.currentSrc||source.src;if(img.src!==next)img.src=next;};
   update();
   const observer=new MutationObserver(()=>{update();if(!source.hidden&&source.src)observer.disconnect();});
   observer.observe(source,{attributes:true,attributeFilter:['src','hidden']});
   setTimeout(()=>observer.disconnect(),10000);
  }
 }
 function open(i,animated=false){show(i,animated);if(!viewer.open)viewer.showModal();if(animated&&img.complete&&img.naturalWidth)startPan();}
 img.addEventListener('load',()=>{if(pendingAutoPan&&viewer.open)startPan();});
 const animatedToggle=$('galleryOpenAnimated');
 if(animatedToggle){
  animatedToggle.addEventListener('change',()=>{animatedToggle.setAttribute('aria-checked',String(animatedToggle.checked));});
 }
 function galleryAnimated(){return !!animatedToggle?.checked;}
 preview.addEventListener('click',e=>{
  if(!e.target.closest('.cg-art-frame')||!preview.querySelector('.cg-art-frame img:not([hidden])'))return;
  const tiles=items(),title=preview.querySelector('h3')?.textContent;
  const found=tiles.findIndex(tile=>tile.querySelector('strong')?.textContent===title);
  open(Math.max(0,found),galleryAnimated());
 });
 $('cgViewerClose').onclick=()=>viewer.close();
 $('cgViewerPan').onclick=()=>{if(pan){reset();return;}startPan();};
 $('cgViewerPrev').onclick=()=>show(index-1);$('cgViewerNext').onclick=()=>show(index+1);
 $('cgViewerZoomIn').onclick=()=>zoom(scale+.5);$('cgViewerZoomOut').onclick=()=>zoom(scale-.5);$('cgViewerReset').onclick=reset;
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}if(e.key==='+'||e.key==='=')zoom(scale+.5);if(e.key==='-')zoom(scale-.5);});
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(scale+(e.deltaY<0?.25:-.25));},{passive:false});
 canvas.addEventListener('pointerdown',e=>{if(pan)stopPan();canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,tx,ty};});
 canvas.addEventListener('pointermove',e=>{if(!drag||scale===1)return;tx=drag.tx+e.clientX-drag.x;ty=drag.ty+e.clientY-drag.y;apply();});
 canvas.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(scale===1&&Math.abs(dx)>70)show(index+(dx<0?1:-1));drag=null;});
 canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('touchstart',e=>{if(e.touches.length===2)pinch={distance:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),scale};},{passive:true});
 canvas.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);zoom(pinch.scale*d/pinch.distance);}},{passive:false});
 canvas.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null;});
 viewer.addEventListener('close',()=>{stopPan();img.removeAttribute('src');reset();});
})();
