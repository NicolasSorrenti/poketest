// Blocking, data-driven overworld close-ups. Never creates replacement artwork.
const NeoOutfitChime=(()=>{
 const focusUrl='/rpg-assets/outfit-chime-focus.json?v=20261028-outfit-framing-8';
 let focusPromise=null,visible=null,timer=null;
 const load=()=>focusPromise||(focusPromise=fetch(focusUrl,{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null));
 function addMotion(){
  if(document.getElementById('neoOutfitChimeMotion'))return;
  const style=document.createElement('style');style.id='neoOutfitChimeMotion';
  style.textContent='@keyframes neoOutfitChimeFade{from{opacity:0}to{opacity:1}}@keyframes neoOutfitChimePop{0%{opacity:0;transform:scale(.78) translateY(18px)}70%{opacity:1;transform:scale(1.035) translateY(-2px)}100%{opacity:1;transform:scale(1) translateY(0)}}@media(prefers-reduced-motion:reduce){.neo-outfit-chime,.neo-outfit-chime-panel{animation:none!important}}';
  document.head.append(style);
 }
 function cancel(){if(timer)clearTimeout(timer);timer=null;visible?.remove();visible=null;}
 async function display(portrait,focus,duration=3000){
  if(!portrait||typeof document==='undefined')return;
  cancel();
  addMotion();
  const left=Math.max(0,Math.min(.8,Number(focus?.left??0)));
  const right=Math.max(left+.12,Math.min(1,Number(focus?.right??1)));
  const top=Math.max(0,Math.min(.8,Number(focus?.top??.06)));
  const bottom=Math.max(top+.12,Math.min(1,Number(focus?.bottom??.51)));
  const cropWidth=right-left,cropHeight=bottom-top;
  const img=new Image();
  img.alt='';img.decoding='async';img.draggable=false;
  // Load before displaying; failures must not strand the game.
  const loaded=await new Promise(resolve=>{
   const watchdog=setTimeout(()=>resolve(false),2500);
   img.onload=()=>{clearTimeout(watchdog);resolve(true);};
   img.onerror=()=>{clearTimeout(watchdog);resolve(false);};
   img.src=portrait;
  });
  if(!loaded)return;
  const ratio=(img.naturalWidth*cropWidth)/(img.naturalHeight*cropHeight);
  const screen=document.createElement('div');
  screen.className='neo-outfit-chime';
  screen.setAttribute('aria-hidden','true');
  screen.style.cssText='position:fixed;inset:0;z-index:2147481000;display:grid;place-items:center;background:#060a1bd9;pointer-events:auto;animation:neoOutfitChimeFade .22s ease-out both;';
  const panel=document.createElement('div');
  panel.className='neo-outfit-chime-panel';panel.style.cssText='position:relative;overflow:hidden;border:2px solid #fad59dd9;border-radius:16px;background:#111;box-shadow:0 14px 55px #000c;animation:neoOutfitChimePop .52s cubic-bezier(.2,.8,.2,1) both;';
  panel.style.width='min(90vw,560px,'+(58*ratio)+'vh)';
  panel.style.aspectRatio=String(ratio);
  // Size and position the source in pixels relative to the measured crop window.
  // Percent heights use a different reference box than percent widths, so using
  // pixels here keeps normalized source bounds exact across mobile aspect ratios.
  img.style.cssText='position:absolute;max-width:none;';
  const badge=document.createElement('div');badge.textContent='✦ SPECIAL OUTFIT ✦';
  badge.style.cssText='position:absolute;z-index:1;top:12px;left:50%;transform:translateX(-50%);padding:9px 16px;border:1px solid #fad59d;border-radius:999px;background:#211727eF;color:#ffe2af;font:700 13px/1.2 system-ui,sans-serif;letter-spacing:.12em;white-space:nowrap;box-shadow:0 4px 18px #0009;';
  const viewport=document.createElement('div');viewport.style.cssText='position:absolute;inset:0;overflow:hidden;';
  viewport.append(img);panel.append(viewport,badge);screen.append(panel);document.body.append(screen);visible=screen;
  const viewportWidth=viewport.clientWidth;
  const renderedWidth=viewportWidth/cropWidth;
  const renderedHeight=renderedWidth*img.naturalHeight/img.naturalWidth;
  img.style.width=renderedWidth+'px';img.style.height=renderedHeight+'px';
  img.style.left=(-left*renderedWidth)+'px';img.style.top=(-top*renderedHeight)+'px';
  await new Promise(resolve=>{
   let done=false;
   const finish=()=>{if(done)return;done=true;clearTimeout(timer);timer=null;screen.remove();if(visible===screen)visible=null;resolve();};
   timer=setTimeout(finish,duration);
   // Chime blocks game input, but is not a trap if someone explicitly taps to skip.
   screen.addEventListener('click',finish,{once:true});
  });
 }
 async function onEntry({characters=[],firstMeetings=[],blocked=false,sceneId=null}={}){
  if(blocked||sceneId)return;
  // Never let optional crop metadata delay or suppress the actual reveal.
  const data=await Promise.race([load(),new Promise(resolve=>setTimeout(()=>resolve(null),350))]);
  // Preserve baseline for only actually encountered characters.
  const outfit=[];
  const isSpecialPortrait=portrait=>/\/(?:overworld-variants\/|portraits\/special-day-\d+\.(?:png|webp|jpe?g)|outfits\/[^/]+\/)/i.test(portrait);
  for(const {id,portrait} of characters){
   if(!id||!portrait||!portrait.includes('/'+id+'/'))continue;
   const name=portrait.split('/').pop().split('?')[0];
   const focus=data?.characters?.[id]?.variants?.[name];
   // Focus metadata controls framing only. A valid special outfit always gets a reveal.
   const barbBodiceFocus=id==='barb'&&isSpecialPortrait(portrait)?{top:.30,bottom:.63,left:.24,right:.78}:null;
   if(focus||barbBodiceFocus||isSpecialPortrait(portrait))outfit.push({id,portrait,focus:focus||barbBodiceFocus||{top:.06,bottom:.53}});
  }
  const outfitIds=new Set(outfit.map(item=>item.id));
  // Every place entry gets the special-look reveal, even when the same outfit
  // was already shown at another location or this is the character's first meeting.
  for(const item of outfit)await display(item.portrait,item.focus,3000);
  for(const item of firstMeetings){
   if(item?.portrait&&!outfitIds.has(item.id))await display(item.portrait,{top:.06,bottom:.53},3000);
  }
 }
 const api=Object.freeze({onEntry,cancel,firstMeeting:({portrait})=>display(portrait,{top:.06,bottom:.53},3000)});
 if(typeof window!=='undefined')window.NeoOutfitChime=api;
 return api;
})();
