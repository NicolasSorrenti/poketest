'use strict';
(()=>{
 const W=1280,H=640,MAX_FILE=20*1024*1024,MAX_PIXELS=40_000_000;
 const $=id=>document.getElementById(id);
 const mats=window.NeoDuelPlaymats;
 const canvas=$('matCanvas'),ctx=canvas.getContext('2d',{alpha:false});
 const input=$('sourceInput'),drop=$('dropZone'),slider=$('zoom'),status=$('status');
 const state={image:null,zoom:1,panX:0,panY:0,drag:null,busy:false};
 if(!mats||!ctx){status.textContent='Your browser cannot start the playmat editor.';return;}
 function say(message,tone=''){
  status.textContent=message;status.className='status'+(tone?' '+tone:'');
 }
 function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
 function geometry(){
  if(!state.image)return null;
  const cover=Math.max(W/state.image.naturalWidth,H/state.image.naturalHeight)*state.zoom;
  const w=state.image.naturalWidth*cover,h=state.image.naturalHeight*cover;
  state.panX=clamp(state.panX,-(w-W)/2,(w-W)/2);
  state.panY=clamp(state.panY,-(h-H)/2,(h-H)/2);
  return {x:(W-w)/2+state.panX,y:(H-h)/2+state.panY,w,h};
 }
 function draw(){
  ctx.clearRect(0,0,W,H);
  if(state.image){
   const g=geometry();
   ctx.drawImage(state.image,g.x,g.y,g.w,g.h);
  }else{
   const gradient=ctx.createLinearGradient(0,0,W,H);
   gradient.addColorStop(0,'#122840');gradient.addColorStop(.5,'#255268');gradient.addColorStop(1,'#132842');
   ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
   ctx.strokeStyle='#e2fcff16';ctx.lineWidth=3;
   for(let x=-W;x<W*2;x+=125){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+W*.35,H);ctx.stroke();}
   ctx.fillStyle='#d9f5f3a3';ctx.textAlign='center';ctx.font='bold 44px system-ui, sans-serif';ctx.fillText('YOUR ARTWORK HERE',W/2,H/2+13);
  }
  $('zoomOutput').textContent=Math.round(state.zoom*100)+'%';
 }
 function setZoom(next,point){
  if(!state.image)return;
  const old=geometry(),px=point?.x??W/2,py=point?.y??H/2;
  const ux=(px-old.x)/old.w,uy=(py-old.y)/old.h;
  state.zoom=clamp(next,1,3);
  const size=Math.max(W/state.image.naturalWidth,H/state.image.naturalHeight)*state.zoom;
  const w=state.image.naturalWidth*size,h=state.image.naturalHeight*size;
  state.panX=px-(W-w)/2-ux*w;
  state.panY=py-(H-h)/2-uy*h;
  slider.value=String(state.zoom);
  draw();
 }
 function cursorPoint(event){
  const rect=canvas.getBoundingClientRect();
  return {x:(event.clientX-rect.left)*W/rect.width,y:(event.clientY-rect.top)*H/rect.height};
 }
 function toggleReady(ready){
  for(const id of ['zoom','reset','finish','download'])$(id).disabled=!ready||state.busy;
 }
 async function loadFile(file){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return say('Choose a PNG, JPG or WebP image.','error');
  if(file.size>MAX_FILE)return say('The image must be under 20 MB.','error');
  const url=URL.createObjectURL(file),img=new Image();
  say('Opening image…');
  try{
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Image could not be decoded.'));img.src=url;});
   if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>MAX_PIXELS)throw Error('Image dimensions are too large (maximum 40 megapixels).');
   state.image=img;state.zoom=1;state.panX=0;state.panY=0;
   slider.value='1';toggleReady(true);draw();
   $('imageInfo').textContent=img.naturalWidth+' × '+img.naturalHeight+' · '+(file.size/1024/1024).toFixed(1)+' MB source';
   $('matName').value=(file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'My Custom Mat').slice(0,48);
   say('Image ready. Drag to move and zoom to frame your mat.');
  }catch(error){say(error.message||'Could not open this image.','error');}
  finally{URL.revokeObjectURL(url);input.value='';}
 }
 $('chooseBtn').addEventListener('click',event=>{event.stopPropagation();input.click();});
 drop.addEventListener('click',()=>input.click());
 drop.addEventListener('keydown',event=>{if(event.target!==drop)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();input.click();}});
 input.addEventListener('change',()=>loadFile(input.files?.[0]));
 for(const surface of [drop,$('canvasShell')]){
  surface.addEventListener('dragover',event=>{event.preventDefault();drop.classList.add('dragging');});
  surface.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
  surface.addEventListener('drop',event=>{
   event.preventDefault();drop.classList.remove('dragging');
   const file=[...(event.dataTransfer?.files||[])].find(f=>f.type.startsWith('image/'));
   if(file)loadFile(file);else say('Drop a PNG, JPG or WebP image.','error');
  });
 }
 canvas.addEventListener('pointerdown',event=>{
  if(!state.image||event.button!==0)return;
  event.preventDefault();canvas.setPointerCapture(event.pointerId);
  state.drag={id:event.pointerId,x:event.clientX,y:event.clientY,panX:state.panX,panY:state.panY};
  canvas.classList.add('grabbing');
 });
 canvas.addEventListener('pointermove',event=>{
  const drag=state.drag;if(!drag||drag.id!==event.pointerId)return;
  const rect=canvas.getBoundingClientRect();
  state.panX=drag.panX+(event.clientX-drag.x)*W/rect.width;
  state.panY=drag.panY+(event.clientY-drag.y)*H/rect.height;
  draw();
 });
 function stopDrag(event){if(state.drag?.id===event.pointerId){state.drag=null;canvas.classList.remove('grabbing');}}
 canvas.addEventListener('pointerup',stopDrag);
 canvas.addEventListener('pointercancel',stopDrag);
 canvas.addEventListener('lostpointercapture',()=>{state.drag=null;canvas.classList.remove('grabbing');});
 canvas.addEventListener('wheel',event=>{
  if(!state.image)return;
  event.preventDefault();
  setZoom(state.zoom+(event.deltaY<0?.075:-.075),cursorPoint(event));
 },{passive:false});
 canvas.addEventListener('keydown',event=>{
  if(!state.image)return;
  let handled=true;
  if(event.key==='ArrowLeft')state.panX-=event.shiftKey?10:28;
  else if(event.key==='ArrowRight')state.panX+=event.shiftKey?10:28;
  else if(event.key==='ArrowUp')state.panY-=event.shiftKey?10:28;
  else if(event.key==='ArrowDown')state.panY+=event.shiftKey?10:28;
  else if(event.key==='+'||event.key==='=')setZoom(state.zoom+.05);
  else if(event.key==='-')setZoom(state.zoom-.05);
  else handled=false;
  if(handled){event.preventDefault();draw();}
 });
 slider.addEventListener('input',()=>setZoom(Number(slider.value)));
 $('reset').addEventListener('click',()=>{state.panX=0;state.panY=0;state.zoom=1;slider.value='1';draw();});
 $('guides').addEventListener('change',()=>{$('guideLayer').hidden=!$('guides').checked;});
 function exportBlob(mime,quality){
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not export playmat.')),mime,quality));
 }
 $('download').addEventListener('click',async()=>{
  if(!state.image)return;
  try{
   const blob=await exportBlob('image/png');
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download=($('matName').value.trim()||'neo-campus-playmat').replace(/[^\w .-]/g,'').slice(0,48)+'.png';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
   say('PNG exported. You can import it into the studio on another device.','success');
  }catch(error){say(error.message,'error');}
 });
 async function selectSaved(id){
  if(!mats.custom().some(mat=>mat.id===id))return;
  localStorage.setItem('neoCampusPlaymat',id);
  localStorage.setItem(mats.IMPORT_KEY,id);
  say('Selected for your next RPG duel. Open RPG mode to play with it!','success');
  renderLibrary();
 }
 async function renderLibrary(){
  const entries=mats.custom(),library=$('library');library.replaceChildren();
  $('libraryCount').textContent=entries.length+' / 30 slots';
  if(!entries.length){
   const empty=document.createElement('p');empty.className='library-empty';
   empty.textContent='You haven’t made a custom mat yet. Your finished designs will appear here.';
   library.append(empty);return;
  }
  for(const mat of entries.slice().reverse()){
   const card=document.createElement('article');card.className='mat-card';
   const img=document.createElement('img');img.className='mat-thumb';img.alt='';img.loading='lazy';
   img.onerror=()=>{img.style.opacity='.3';};
   mats.imageUrl(mat.id).then(url=>{if(url&&card.isConnected)img.src=url;}).catch(()=>{img.style.opacity='.3';});
   const body=document.createElement('div');body.className='mat-card-body';
   const title=document.createElement('div');title.className='mat-name';title.title=mat.name;title.textContent=mat.name;
   const actions=document.createElement('div');actions.className='mat-card-actions';
   const use=document.createElement('button');use.type='button';
   const selected=localStorage.getItem('neoCampusPlaymat')===mat.id;
   use.textContent=selected?'✓ Selected':'Use in RPG';use.setAttribute('aria-label','Use '+mat.name+' in RPG');
   use.onclick=()=>selectSaved(mat.id);
   const del=document.createElement('button');del.type='button';del.textContent='Delete';del.setAttribute('aria-label','Delete '+mat.name);
   del.onclick=async()=>{
    if(!confirm('Delete "'+mat.name+'" from this browser?'))return;
    del.disabled=true;
    try{await mats.removeCustom(mat.id);say('Playmat removed.','success');renderLibrary();}
    catch(error){say('Could not delete mat: '+error.message,'error');del.disabled=false;}
   };
   actions.append(use,del);body.append(title,actions);card.append(img,body);library.append(card);
  }
 }
 $('finish').addEventListener('click',async()=>{
  if(!state.image||state.busy)return;
  state.busy=true;toggleReady(true);say('Saving your cropped mat into your browser…');
  try{
   let blob=await exportBlob('image/webp',.9);
   if(blob.type!=='image/webp')blob=await exportBlob('image/png');
   const result=await mats.saveCustom($('matName').value,blob);
   say('✓ "'+result.name+'" saved and selected! It will be available in your next RPG match.','success');
   await renderLibrary();
  }catch(error){say('Could not save: '+(error.message||error)+'. Check browser storage settings.','error');}
  finally{state.busy=false;toggleReady(true);}
 });
 window.addEventListener('storage',event=>{
  if([mats.IMPORT_KEY,'neoCampusCustomPlaymatsV1','neoCampusPlaymat'].includes(event.key))renderLibrary();
 });
 draw();renderLibrary();
})();