// Blocking, data-driven overworld close-ups. Never creates replacement artwork.
const NeoOutfitChime=(()=>{
 const focusUrl='/rpg-assets/outfit-chime-focus.json';
 let focusPromise=null,visible=null,timer=null;
 const load=()=>focusPromise||(focusPromise=fetch(focusUrl).then(r=>r.ok?r.json():null).catch(()=>null));
 function cancel(){if(timer)clearTimeout(timer);timer=null;visible?.remove();visible=null;}
 async function display(portrait,focus,duration=3000){
  if(!portrait||typeof document==='undefined')return;
  cancel();
  const top=Math.max(0,Math.min(.8,Number(focus?.top??.06)));
  const bottom=Math.max(top+.12,Math.min(1,Number(focus?.bottom??.51)));
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
  const ratio=img.naturalWidth/(img.naturalHeight*(bottom-top));
  const screen=document.createElement('div');
  screen.className='neo-outfit-chime';
  screen.setAttribute('aria-hidden','true');
  screen.style.cssText='position:fixed;inset:0;z-index:10050;display:grid;place-items:center;background:#060a1bd9;pointer-events:auto;';
  const panel=document.createElement('div');
  panel.style.cssText='position:relative;overflow:hidden;border:2px solid #fad59dd9;border-radius:16px;background:#111;box-shadow:0 14px 55px #000c;';
  panel.style.width='min(90vw,560px,'+(58*ratio)+'vh)';
  panel.style.aspectRatio=String(ratio);
  img.style.cssText='position:absolute;max-width:none;left:0;width:100%;height:auto;top:'+(-top/(bottom-top)*100)+'%;';
  panel.append(img);screen.append(panel);document.body.append(screen);visible=screen;
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
  const data=await load();
  // Preserve baseline for only actually encountered characters.
  const outfit=[];
  const isSpecialPortrait=portrait=>/\\/(?:overworld-variants|portraits\\/special-day-\\d+|outfits\\/[^/]+)\\//.test(portrait);
  for(const {id,portrait} of characters){
   if(!id||!portrait||!portrait.includes('/'+id+'/'))continue;
   const name=portrait.split('/').pop().split('?')[0];
   const focus=data?.characters?.[id]?.variants?.[name];
   // Focus metadata controls framing only. A valid special outfit always gets a reveal.
   if(focus||isSpecialPortrait(portrait))outfit.push({id,portrait,focus:focus||{top:.06,bottom:.53}});
  }
  const outfitIds=new Set(outfit.map(item=>item.id));
  // Every place entry gets the special-look reveal, even when the same outfit
  // was already shown at another location or this is the character's first meeting.
  for(const item of outfit)await display(item.portrait,item.focus,3000);
  for(const item of firstMeetings){
   if(item?.portrait&&!outfitIds.has(item.id))await display(item.portrait,{top:.06,bottom:.53},3000);
  }
 }
 return {onEntry,cancel,firstMeeting:({portrait})=>display(portrait,{top:.06,bottom:.53},3000)};
})();
