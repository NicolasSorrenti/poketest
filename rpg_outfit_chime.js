// Blocking, data-driven overworld close-ups. Never creates replacement artwork.
const NeoOutfitChime=(()=>{
 const focusUrl='/rpg-assets/outfit-chime-focus.json?v=20261028-akari-day5-tight-crop-2';
 let focusPromise=null,visible=null,timer=null;
 const load=()=>focusPromise||(focusPromise=new Promise(resolve=>{const timeout=setTimeout(()=>resolve(null),1500);fetch(focusUrl,{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null).then(data=>{clearTimeout(timeout);resolve(data);});}));
 load();
 function firstMeetingFocus(id){return id==='hana'?{top:.31,bottom:.53,left:.20,right:.90}:{top:.06,bottom:.53};}
 function addMotion(){
  if(document.getElementById('neoOutfitChimeMotion'))return;
  const style=document.createElement('style');style.id='neoOutfitChimeMotion';
  style.textContent='@keyframes neoOutfitChimeFade{from{opacity:0}to{opacity:1}}@keyframes neoOutfitChimeEnter{from{opacity:0;transform:translateX(110%) skewX(-9deg)}to{opacity:1;transform:translateX(0) skewX(0)}}@keyframes neoOutfitChimeExit{from{opacity:1;transform:translateX(0) skewX(0)}to{opacity:0;transform:translateX(110%) skewX(-9deg)}}@media(max-width:620px){.neo-outfit-chime-group{flex-direction:column!important;gap:10px!important;max-height:94dvh}.neo-outfit-chime-card{max-height:39dvh}}@media(prefers-reduced-motion:reduce){.neo-outfit-chime,.neo-outfit-chime-panel{animation:none!important}}';
  document.head.append(style);
 }
 function cancel(){if(timer)clearTimeout(timer);timer=null;visible?.remove();visible=null;}
 function cropBounds(focus,img){
  const left=Math.max(0,Math.min(.8,Number(focus?.left??0)));
  const right=Math.max(left+.12,Math.min(1,Number(focus?.right??1)));
  const top=Math.max(0,Math.min(.8,Number(focus?.top??.06)));
  const bottom=Math.max(top+.12,Math.min(1,Number(focus?.bottom??.51)));
  const cropWidth=right-left,cropHeight=bottom-top;
  return {left,right,top,bottom,cropWidth,cropHeight,ratio:(img.naturalWidth*cropWidth)/(img.naturalHeight*cropHeight)};
 }
 function fitCropWindow(panel,viewport,crop){
  panel.style.boxSizing='border-box';
  const borderY=(parseFloat(getComputedStyle(panel).borderTopWidth)||0)+(parseFloat(getComputedStyle(panel).borderBottomWidth)||0);
  panel.style.height=(viewport.clientWidth/crop.ratio+borderY)+'px';
 }
 function positionCropImage(img,viewport,crop){
  const viewportWidth=viewport.clientWidth;
  const viewportHeight=viewport.clientHeight;
  const renderedWidth=viewportWidth/crop.cropWidth;
  const renderedHeight=renderedWidth*img.naturalHeight/img.naturalWidth;
  img.style.width=renderedWidth+'px';img.style.height=renderedHeight+'px';
  img.style.left=(-crop.left*renderedWidth)+'px';img.style.top=(-crop.top*renderedHeight)+'px';
  return {viewportWidth,viewportHeight,renderedWidth,renderedHeight,mappedWidth:renderedWidth*crop.cropWidth,mappedHeight:renderedHeight*crop.cropHeight};
 }
 function loadPortrait(portrait){
  return new Promise(resolve=>{
   const img=new Image();img.alt='';img.decoding='async';img.draggable=false;
   const watchdog=setTimeout(()=>resolve(null),5000);
   img.onload=()=>{clearTimeout(watchdog);resolve(img);};
   img.onerror=()=>{clearTimeout(watchdog);resolve(null);};
   img.src=portrait;
  });
 }
 async function renderPreview({container,portrait,focus}={}){
  if(!container||!portrait)throw Error('Preview needs a container and portrait URL');
  const img=await loadPortrait(portrait);
  if(!img)throw Error('Portrait failed to load: '+portrait);
  const crop=cropBounds(focus,img),panel=document.createElement('div');
  panel.className='neo-outfit-chime-panel';
  panel.style.cssText='position:relative;overflow:hidden;border:2px solid #fad59dd9;border-radius:16px;background:#fff;box-shadow:0 14px 35px #0006;width:100%;aspect-ratio:'+crop.ratio+';';
  img.style.cssText='position:absolute;max-width:none;';
  const viewport=document.createElement('div');viewport.style.cssText='position:absolute;inset:0;overflow:hidden;';
  viewport.append(img);
  panel.append(viewport);
  container.replaceChildren(panel);
  fitCropWindow(panel,viewport,crop);
  const metrics=positionCropImage(img,viewport,crop);
  return {image:img,crop,metrics,panel,viewport};
 }
 function slideOutAfter(screen,movingNode,duration){
  return new Promise(resolve=>{
   let done=false;
   const finish=()=>{if(done)return;done=true;clearTimeout(timer);timer=null;screen.remove();if(visible===screen)visible=null;resolve();};
   const leave=()=>{
    if(done)return;
    movingNode.style.animation='neoOutfitChimeExit .44s cubic-bezier(.65,.03,.23,.97) both';
    timer=setTimeout(finish,440);
   };
   timer=setTimeout(leave,duration+440);
   screen.addEventListener('click',finish,{once:true});
  });
 }
 async function displayTogether(items,duration=1500){
  cancel();
  addMotion();
  const loaded=(await Promise.all(items.slice(0,2).map(async item=>{
   const img=await loadPortrait(item.portrait);
   return img?{...item,img}:null;
  }))).filter(Boolean);
  if(!loaded.length)return;
  const screen=document.createElement('div');
  screen.className='neo-outfit-chime';
  screen.setAttribute('aria-hidden','true');
  screen.style.cssText='position:fixed;inset:0;z-index:2147481000;display:grid;place-items:center;background:#060a1bd9;pointer-events:auto;animation:neoOutfitChimeFade .22s ease-out both;';
  const group=document.createElement('div');
  group.className='neo-outfit-chime-panel neo-outfit-chime-group';
  group.style.cssText='display:flex;flex-direction:row;justify-content:center;align-items:center;gap:14px;width:min(94vw,960px);max-height:92vh;animation:neoOutfitChimeEnter .44s cubic-bezier(.65,.03,.23,.97) both;';
  for(const item of loaded){
   const crop=cropBounds(item.focus,item.img);
   const card=document.createElement('div');
   card.className='neo-outfit-chime-card';
   card.style.cssText='position:relative;box-sizing:border-box;flex:0 1 auto;overflow:hidden;border:2px solid #fad59dd9;border-radius:16px;background:#111;box-shadow:0 14px 55px #000c;aspect-ratio:'+crop.ratio+';';
   const mobile=matchMedia('(max-width:620px)').matches;
   const maxWidth=mobile?window.innerWidth*.9:Math.min(window.innerWidth*.44,560);
   card.style.width=Math.min(maxWidth,window.innerHeight*(mobile?.37:.42)*crop.ratio)+'px';
   const img=item.img;
   img.style.cssText='position:absolute;max-width:none;';
   const viewport=document.createElement('div');
   viewport.style.cssText='position:absolute;inset:0;overflow:hidden;';
   viewport.append(img);
   card.append(viewport);
   group.append(card);
   fitCropWindow(card,viewport,crop);
   positionCropImage(img,viewport,crop);
  }
  screen.append(group);
  document.body.append(screen);
  visible=screen;
  await slideOutAfter(screen,group,duration);
 }
 async function display(portrait,focus,duration=1500){
  if(Array.isArray(portrait)){
   const items=portrait.map(item=>typeof item==='string'?{portrait:item,focus:null}:item).filter(item=>item?.portrait).slice(0,2);
   if(items.length>1)return displayTogether(items,duration);
   if(items.length===1){portrait=items[0].portrait;focus=items[0].focus??focus;}
  }
  if(!portrait||typeof document==='undefined')return;
  cancel();
  addMotion();
  const img=await loadPortrait(portrait);
  if(!img)return;
  const crop=cropBounds(focus,img);
  const screen=document.createElement('div');
  screen.className='neo-outfit-chime';
  screen.setAttribute('aria-hidden','true');
  screen.style.cssText='position:fixed;inset:0;z-index:2147481000;display:grid;place-items:center;background:#060a1bd9;pointer-events:auto;animation:neoOutfitChimeFade .22s ease-out both;';
  const panel=document.createElement('div');
  panel.className='neo-outfit-chime-panel';panel.style.cssText='position:relative;overflow:hidden;border:2px solid #fad59dd9;border-radius:16px;background:#111;box-shadow:0 14px 55px #000c;animation:neoOutfitChimeEnter .44s cubic-bezier(.65,.03,.23,.97) both;';
  panel.style.width='min(90vw,560px,'+(58*crop.ratio)+'vh)';
  panel.style.aspectRatio=String(crop.ratio);
  // Size and position the source in pixels relative to the measured crop window.
  // Percent heights use a different reference box than percent widths, so using
  // pixels here keeps normalized source bounds exact across mobile aspect ratios.
  img.style.cssText='position:absolute;max-width:none;';
  const viewport=document.createElement('div');viewport.style.cssText='position:absolute;inset:0;overflow:hidden;';
  viewport.append(img);panel.append(viewport);screen.append(panel);document.body.append(screen);visible=screen;
  fitCropWindow(panel,viewport,crop);
  positionCropImage(img,viewport,crop);
  await slideOutAfter(screen,panel,duration);
 }
 async function onEntry({characters=[],firstMeetings=[],blocked=false,sceneId=null}={}){
  if(blocked||sceneId)return;
  // Never let optional crop metadata delay or suppress the actual reveal.
  const data=await load();
  const durationMs=Math.max(0,Number(data?.durationMs)||1500);
  // Preserve baseline for only actually encountered characters.
  const outfit=[];
  const isSpecialPortrait=portrait=>/\/(?:overworld-variants\/|portraits\/special-day-\d+\.(?:png|webp|jpe?g)|outfits\/[^/]+\/)/i.test(portrait);
  for(const {id,portrait} of characters){
   if(!id||!portrait||!portrait.includes('/'+id+'/'))continue;
   const name=portrait.split('/').pop().split('?')[0];
   const characterData=data?.characters?.[id]||{};
   const hanaFallback=/^(?:0[1-3]|0[6-8])_.*\.png$/i.test(name)?{top:.31,bottom:.52,left:.14,right:.86}:/^0[45]_.*\.png$/i.test(name)?{top:.49,bottom:.74,left:.14,right:.86}:null;
   const focus=characterData.variants?.[name]||(id==='hana'?hanaFallback:null);
   const isOutfit=isSpecialPortrait(portrait);
   // Laca's casual and lifeguard looks are everyday outfits, not special-look reveals.
   if(id==='laca'&&/\/outfits\/(?:casual|lifeguard)\//i.test(portrait))continue;
   const pairNames=characterData.chimePairs?.[name];
   const pairConfigured=Array.isArray(pairNames)&&pairNames.length>1;
   if(!focus&&!isOutfit&&!pairConfigured)continue;
   const pairFiles=pairConfigured?pairNames.slice(0,2):[name];
   const images=pairFiles.map(file=>{
    const source=String(file);
    const pairPortrait=/^(?:https?:)?\/\//i.test(source)||source.startsWith('/')?source:portrait.slice(0,portrait.lastIndexOf('/')+1)+source;
    const pairName=pairPortrait.split('/').pop().split('?')[0];
    const pairFocus=characterData.variants?.[pairName]||(id==='hana'&&(/^(?:0[1-3]|0[6-8])_.*\.png$/i.test(pairName)?{top:.31,bottom:.52,left:.14,right:.86}:/^0[45]_.*\.png$/i.test(pairName)?{top:.49,bottom:.74,left:.14,right:.86}:null));
    const barbBodiceFocus=id==='barb'&&isSpecialPortrait(pairPortrait)?{top:.20,bottom:.38,left:.24,right:.78}:null;
    return {portrait:pairPortrait,focus:pairFocus||barbBodiceFocus||{top:.06,bottom:.53}};
   });
   outfit.push({id,images});
  }
  const outfitIds=new Set(outfit.map(item=>item.id));
  // Every place entry gets the special-look reveal, even when the same outfit
  // was already shown at another location or this is the character's first meeting.
  for(const item of outfit)await display(item.images.length>1?item.images:item.images[0].portrait,item.images[0].focus,durationMs);
  for(const item of firstMeetings){
   if(item?.portrait&&!outfitIds.has(item.id))await display(item.portrait,firstMeetingFocus(item.id),durationMs);
  }
 }
 const api=Object.freeze({onEntry,cancel,renderPreview,displayTogether,firstMeeting:({portrait,id})=>display(portrait,firstMeetingFocus(id),1500)});
 if(typeof window!=='undefined')window.NeoOutfitChime=api;
 return api;
})();
