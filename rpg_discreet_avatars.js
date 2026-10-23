'use strict';
/* Local, face-only anime portraits for Discreet Mode.
 * Draw only a tightly cropped headshot, never a full character illustration.
 * This is presentation-only: no network avatar service or campaign save writes. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgDiscreetAvatars=api;
})(typeof window==='undefined'?null:window,function(win){
 const AVATAR_IDS=new Set([
  'akari','alma','camila','elio','hana','iris','jun','kaede','marina',
  'nereo','reina','shiori','sol','teo','yuna'
 ]);
 // The remaining main characters have character-specific portrait crops.
 const OTHER_PORTRAITS={
  jinx:'characters/jinx/neutral.webp',
  luna:'characters/luna/expression-faces/neutral.webp',
  rina:'characters/rina/expression-faces/neutral.webp',
  elena:'characters/elena/expression-faces/neutral.webp',
  sierra:'characters/sierra/expression-faces/neutral.webp'
 };
 // Source head positions vary. All rectangles are contained within the face/hair area.
 // Values are [crop width as a fraction of image width, top as a fraction of width,
 //           horizontal offset as a fraction of image width].
 const FACE_CROPS={
  jinx:[0.66,0.12,0],luna:[0.72,0.11,0.02],rina:[0.73,0.20,0],
  elena:[0.70,0.22,0],sierra:[0.72,0.25,0]
 };
 const PALETTES={
  yuna:['#1e345e','#5dbcea'],camila:['#4b3048','#b988a3'],reina:['#4b2936','#e07882'],
  rina:['#562e57','#efa6c6'],sol:['#65453a','#f3ad8c'],jinx:['#482c4e','#fa73b1'],
  luna:['#282849','#8f86c7'],elena:['#303b51','#94b4d0'],sierra:['#425b55','#8ad8bd'],
  hana:['#624151','#f6a5bc'],kaede:['#35354d','#b9a6e6'],marina:['#28465a','#90cfde']
 };
 const cache=new Map();
 const EMOTIONS=new Set([
  'neutral','happy','surprised','vulnerable','sad','irritated','angry',
  'determined','confident','nervous','worried','smile','attack','hurt',
  'weakness_hit','ko_taken','victory'
 ]);
 function emotion(value){
  const key=String(value||'neutral').toLowerCase().replace(/[\s-]+/g,'_');
  return EMOTIONS.has(key)?key:'neutral';
 }
 function validId(value){
  // Character IDs are local asset folder names, never arbitrary paths/URLs.
  const id=String(value||'').toLowerCase();
  return /^[a-z][a-z0-9_]{0,39}$/.test(id)?id:'';
 }
 function url(id){
  const key=validId(id);
  if(!key)return '';
  if(OTHER_PORTRAITS[key])return '/rpg-assets/'+OTHER_PORTRAITS[key];
  return '/rpg-assets/'+(AVATAR_IDS.has(key)
   ?'ui/avatars/'+key+'.webp'
   :'characters/'+key+'/expression-faces/neutral.webp');
 }
 function cropBox(id,width,height){
  const key=validId(id);
  const [fraction,topFraction,xOffset]=FACE_CROPS[key]||[0.61,0.015,0];
  // A square head crop: upper face/hair/neck only, excluding costumes and body.
  const size=Math.min(width*fraction,height);
  const sx=Math.max(0,Math.min(width-size,(width-size)/2+width*xOffset));
  const sy=Math.max(0,Math.min(height-size,width*topFraction));
  return {sx,sy,size};
 }
 function initials(name){
  return String(name||'NPC').trim().split(/\s+/).map(p=>p[0]||'').join('').slice(0,2).toUpperCase();
 }
 const isActive=()=>win?.document?.documentElement?.dataset?.rpgDiscreet==='on';
 function loadPortrait(id){
  if(cache.has(id))return cache.get(id);
  const src=url(id);
  if(!src||!win?.Image||!win?.document?.createElement)return Promise.resolve(null);
  const promise=new Promise(resolve=>{
   const source=new win.Image();
   source.onload=()=>{
    try{
     const canvas=win.document.createElement('canvas');
     canvas.width=288;canvas.height=288;
     const ctx=canvas.getContext('2d');
     if(!ctx){resolve(null);return;}
     const [dark,light]=PALETTES[id]||['#23394b','#87aebe'];
     const shade=ctx.createLinearGradient(0,0,288,288);
     shade.addColorStop(0,dark);shade.addColorStop(1,light);
     ctx.fillStyle=shade;ctx.fillRect(0,0,288,288);
     // Cover the whole square with just the head crop; never render a full body.
     const {sx,sy,size}=cropBox(id,source.naturalWidth,source.naturalHeight);
     if(!size){resolve(null);return;}
     ctx.drawImage(source,sx,sy,size,size,0,0,288,288);
     resolve(canvas.toDataURL('image/webp',0.92));
    }catch{resolve(null);}
   };
   source.onerror=()=>resolve(null);
   source.src=src;
  });
  cache.set(id,promise);
  return promise;
 }
 function render(node){
  if(!node||!isActive())return;
  const id=validId(node.dataset?.rpgSafeId);
  if(!id)return;
  let img=Array.from(node.children||[]).find(e=>e.classList?.contains('rpg-safe-avatar'));
  if(!img){
   img=win.document.createElement('img');
   img.className='rpg-safe-avatar';
   img.alt='';
   img.decoding='async';
   img.hidden=true;
   img.onerror=()=>{img.hidden=true;};
   node.append(img);
  }
  // Reuse the same portrait for every emotion to keep character identity stable.
  if(img.dataset.safeSrc===id)return;
  img.dataset.safeSrc=id;
  img.hidden=true;
  loadPortrait(id).then(data=>{
   if(img.dataset.safeSrc!==id||node.dataset?.rpgSafeId!==id)return;
   if(data){img.src=data;img.hidden=false;}
   else img.hidden=true; // Monogram fallback; never leak the original full art.
  });
 }
 function set(node,id,mood='neutral',name=''){
  if(!node||!validId(id))return;
  node.dataset.rpgSafeId=validId(id);
  node.dataset.rpgSafeEmotion=emotion(mood);
  node.dataset.rpgSafeInitials=initials(name||id);
  render(node);
 }
 function refresh(){
  if(!isActive())return;
  for(const node of win.document.querySelectorAll('[data-rpg-safe-id]'))render(node);
 }
 return {url,emotion,set,refresh,initials,cropBox};
});
