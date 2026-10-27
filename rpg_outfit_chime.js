// Reuse the current portrait; outfits only, no dialogue text or extra artwork.
const NeoOutfitChime=(()=>{
 const focusUrl='/rpg-assets/outfit-chime-focus.json';
 let focusPromise=null,sequence=0,visible=null,timeout=null;
 const lastSeen=new Map();
 const load=()=>focusPromise||(focusPromise=fetch(focusUrl).then(r=>{if(!r.ok)throw Error('outfit focus unavailable');return r.json()}).catch(()=>null));
 function cancel(){++sequence;if(timeout)clearTimeout(timeout);if(visible)visible.remove();visible=null;}
 async function onEntry({characters=[],blocked=false,sceneId=null}={}){
  cancel();if(blocked||sceneId||!characters.length)return;
  const changes=[];
  for(const {id,portrait} of characters){
   if(!id||!portrait)continue;
   const previous=lastSeen.get(id);
   lastSeen.set(id,portrait);
   // Initial encounter is not a change; no chime for unchanged portrait.
   if(previous&&previous!==portrait)changes.push({id,portrait});
  }
  if(!changes.length)return;
  const ticket=sequence,data=await load();
  if(!data||ticket!==sequence||document.hidden)return;
  // Only explicitly approved outfit variants should chime, not facial expressions.
  const matching=changes.find(({id,portrait})=>data.characters?.[id]?.variants?.[portrait.split('/').pop()]&&portrait.includes('/'+id+'/'));
  if(!matching)return;
  const {id,portrait}=matching,focus=data.characters[id].variants[portrait.split('/').pop()];
  const top=Math.max(0,Math.min(.85,Number(focus.top)||.3));
  const bottom=Math.max(top+.1,Math.min(1,Number(focus.bottom)||.7));
  const overlay=document.createElement('div');
  overlay.className='neo-outfit-chime';
  overlay.setAttribute('aria-hidden','true');
  overlay.style.cssText='position:fixed;inset:0;z-index:10050;pointer-events:none;display:grid;place-items:center;background:rgba(5,9,24,.35)';
  const frame=document.createElement('div');
  frame.style.cssText='position:relative;width:min(88vw,550px);height:min(54vh,460px);overflow:hidden;border:2px solid rgba(250,213,157,.85);border-radius:15px;background:#141724;box-shadow:0 8px 55px #000a;';
  const img=new Image();img.alt='';img.draggable=false;
  img.style.cssText='position:absolute;max-width:none;width:100%;height:'+(100/(bottom-top))+'%;object-fit:fill;left:0;top:'+(-100*top/(bottom-top))+'%;';
  img.onerror=()=>{if(visible===overlay)cancel();};
  img.src=portrait;frame.append(img);overlay.append(frame);
  document.body.append(overlay);visible=overlay;
  timeout=setTimeout(()=>{if(visible===overlay)cancel();},Math.max(500,Number(data.durationMs)||3000));
 }
 return {onEntry,cancel};
})();
