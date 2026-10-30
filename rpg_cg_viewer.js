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
 viewer.innerHTML='<div class="cg-viewer-bar"><strong id="cgViewerTitle"></strong><span id="cgViewerPosition"></span><button type="button" id="cgViewerClose" aria-label="Close full screen">✕</button></div><div class="cg-viewer-stage"><button type="button" id="cgViewerPrev" aria-label="Previous memory">‹</button><div id="cgViewerCanvas"><img id="cgViewerImage" alt="" draggable="false"></div><button type="button" id="cgViewerNext" aria-label="Next memory">›</button></div><div class="cg-viewer-footer"><button type="button" id="cgViewerZoomOut" aria-label="Zoom out">−</button><button type="button" id="cgViewerReset">Fit</button><button type="button" id="cgViewerZoomIn" aria-label="Zoom in">＋</button><span>Swipe or use ← → to browse · Pinch or scroll to zoom</span></div>';
 document.body.append(viewer);
 const $=id=>document.getElementById(id),img=$('cgViewerImage'),canvas=$('cgViewerCanvas');
 let index=0,scale=1,tx=0,ty=0,drag=null,pinch=null;
 const items=()=>[...grid.querySelectorAll('.cg-tile.unlocked')];
 function reset(){scale=1;tx=0;ty=0;apply();}
 function apply(){img.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')';}
 function zoom(next){scale=Math.max(1,Math.min(5,next));if(scale===1){tx=0;ty=0;}apply();}
 function show(i){
  const tiles=items();if(!tiles.length)return;
  index=(i+tiles.length)%tiles.length;
  const tile=tiles[index];tile.click();
  const character=tile.dataset.character;
  if(character)window.NeoRpgDiscreetAvatars?.set?.(canvas,character,'neutral',character);
  const source=preview.querySelector('.cg-art-frame img');
  const title=tile.querySelector('strong')?.textContent||'Memory';
  $('cgViewerTitle').textContent=title;$('cgViewerPosition').textContent=(index+1)+' / '+tiles.length;
  $('cgViewerPrev').disabled=tiles.length<2;$('cgViewerNext').disabled=tiles.length<2;
  img.alt=title;img.removeAttribute('src');reset();
  if(source){
   const update=()=>{if(source.hidden||!source.currentSrc&&!source.src)return;img.src=source.currentSrc||source.src;};
   update();
   const observer=new MutationObserver(()=>{update();if(!source.hidden&&source.src)observer.disconnect();});
   observer.observe(source,{attributes:true,attributeFilter:['src','hidden']});
   setTimeout(()=>observer.disconnect(),10000);
  }
 }
 function open(i){show(i);if(!viewer.open)viewer.showModal();}
 preview.addEventListener('click',e=>{
  if(!e.target.closest('.cg-art-frame')||!preview.querySelector('.cg-art-frame img:not([hidden])'))return;
  const tiles=items(),title=preview.querySelector('h3')?.textContent;
  const found=tiles.findIndex(tile=>tile.querySelector('strong')?.textContent===title);
  open(Math.max(0,found));
 });
 $('cgViewerClose').onclick=()=>viewer.close();
 $('cgViewerPrev').onclick=()=>show(index-1);$('cgViewerNext').onclick=()=>show(index+1);
 $('cgViewerZoomIn').onclick=()=>zoom(scale+.5);$('cgViewerZoomOut').onclick=()=>zoom(scale-.5);$('cgViewerReset').onclick=reset;
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}if(e.key==='+'||e.key==='=')zoom(scale+.5);if(e.key==='-')zoom(scale-.5);});
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(scale+(e.deltaY<0?.25:-.25));},{passive:false});
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,tx,ty};});
 canvas.addEventListener('pointermove',e=>{if(!drag||scale===1)return;tx=drag.tx+e.clientX-drag.x;ty=drag.ty+e.clientY-drag.y;apply();});
 canvas.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(scale===1&&Math.abs(dx)>70)show(index+(dx<0?1:-1));drag=null;});
 canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('touchstart',e=>{if(e.touches.length===2)pinch={distance:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),scale};},{passive:true});
 canvas.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);zoom(pinch.scale*d/pinch.distance);}},{passive:false});
 canvas.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null;});
 viewer.addEventListener('close',()=>{img.removeAttribute('src');reset();});
})();
