// Neo Campus RPG: data-driven outfit-change close-up. No image duplication.
const HanaOutfitChime=(()=>{
 const focusUrl='/rpg-assets/characters/hana/overworld-variants/chime-focus.json';
 let focusPromise=null,lastSeen=null,session=0,visible=null;
 const getData=()=>focusPromise||(focusPromise=fetch(focusUrl).then(r=>{if(!r.ok)throw Error('focus map unavailable');return r.json()}).catch(()=>null));
 const remove=()=>{if(visible){visible.remove();visible=null;}};
 async function onEntry({location,portrait,present,blocked,sceneId}){
  const ticket=++session;
  remove();
  if(!present||blocked||sceneId||!portrait)return;
  // The first time you see Hana cannot be an outfit change.
  const changed=lastSeen!==null&&lastSeen!==portrait;
  lastSeen=portrait;
  if(!changed)return;
  const data=await getData();
  if(ticket!==session||document.hidden||!data)return;
  const name=portrait.split('/').pop();
  const crop=data.variants?.[name]||{top:.29,bottom:.64};
  const top=Math.max(0,Math.min(.8,Number(crop.top)||.29));
  const bottom=Math.max(top+.1,Math.min(1,Number(crop.bottom)||.64));
  const cover=document.createElement('div');
  cover.className='neo-outfit-chime';
  cover.setAttribute('aria-hidden','true');
  cover.style.cssText='position:fixed;inset:0;z-index:10050;pointer-events:none;display:grid;place-items:center;background:rgba(5,9,24,.35);animation:neoOutfitChimeIn .25s ease-out both;';
  const frame=document.createElement('div');
  frame.style.cssText='position:relative;width:min(90vw,640px);max-height:55vh;overflow:hidden;border:2px solid rgba(250,213,157,.85);border-radius:16px;box-shadow:0 8px 55px rgba(0,0,0,.68);background:#111;aspect-ratio:'+(.5/(bottom-top))+';';
  const img=document.createElement('img');
  img.alt='';img.src=portrait;img.draggable=false;
  img.style.cssText='display:block;position:absolute;inset:0 auto auto 0;width:100%;height:auto;max-width:none;transform:translateY(-'+(top*100)+'%);';
  img.onerror=()=>{if(visible===cover)remove();};
  frame.append(img);cover.append(frame);document.body.append(cover);visible=cover;
  const reduce=matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if(!reduce&&!document.getElementById('neo-outfit-chime-style')){
   const style=document.createElement('style');style.id='neo-outfit-chime-style';
   style.textContent='@keyframes neoOutfitChimeIn{from{opacity:0;transform:scale(1.025)}to{opacity:1;transform:scale(1)}}';
   document.head.append(style);
  }
  setTimeout(()=>{if(visible===cover)remove();},Math.min(10000,Math.max(500,data.durationMs||3000)));
 }
 return {onEntry,cancel:()=>{session++;remove();}};
})();
