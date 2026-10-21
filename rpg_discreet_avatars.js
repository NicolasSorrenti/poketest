'use strict';
/* SFW illustrated RPG avatars via DiceBear Lorelei. Visual only, no campaign writes. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgDiscreetAvatars=api;
})(typeof window==='undefined'?null:window,function(win){
 const STYLE='https://api.dicebear.com/10.x/lorelei/svg';
 const EMOTIONS={
  neutral:{mouthVariant:'happy02',eyesVariant:'variant01'},
  happy:{mouthVariant:'happy08',eyesVariant:'variant05'},
  surprised:{mouthVariant:'happy18',eyesVariant:'variant12'},
  vulnerable:{mouthVariant:'sad04',eyesVariant:'variant19'},
  sad:{mouthVariant:'sad04',eyesVariant:'variant19'},
  irritated:{mouthVariant:'sad07',eyesVariant:'variant07'},
  angry:{mouthVariant:'sad07',eyesVariant:'variant07'},
  determined:{mouthVariant:'happy03',eyesVariant:'variant09'},
  confident:{mouthVariant:'happy03',eyesVariant:'variant09'},
  nervous:{mouthVariant:'sad02',eyesVariant:'variant11'},
  worried:{mouthVariant:'sad02',eyesVariant:'variant11'},
  smile:{mouthVariant:'happy08',eyesVariant:'variant05'},
  attack:{mouthVariant:'happy03',eyesVariant:'variant09'},
  hurt:{mouthVariant:'sad04',eyesVariant:'variant19'},
  weakness_hit:{mouthVariant:'sad04',eyesVariant:'variant19'},
  ko_taken:{mouthVariant:'sad04',eyesVariant:'variant19'},
  victory:{mouthVariant:'happy08',eyesVariant:'variant05'}
 };
 function emotion(value){
  const key=String(value||'neutral').toLowerCase().replace(/[\s-]+/g,'_');
  return EMOTIONS[key]?key:'neutral';
 }
 function url(id,mood='neutral'){
  const picked=EMOTIONS[emotion(mood)];
  // Fixed seed + keyed feature selection keep hairstyle and accessories stable.
  const seed=encodeURIComponent('neo-harbor-discreet-'+String(id||'trainer'));
  return STYLE+'?seed='+seed+'&size=512&mouthVariant='+picked.mouthVariant+
   '&eyesVariant='+picked.eyesVariant+'&backgroundColor=dee9f2';
 }
 function initials(name){
  return String(name||'NPC').trim().split(/\s+/).map(p=>p[0]||'').join('').slice(0,2).toUpperCase();
 }
 const isActive=()=>win?.document?.documentElement?.dataset?.rpgDiscreet==='on';
 function render(node){
  if(!node||!isActive())return;
  const id=node.dataset?.rpgSafeId;
  if(!id)return;
  const expected=url(id,node.dataset.rpgSafeEmotion);
  let image=Array.from(node.children||[]).find(e=>e.classList?.contains('rpg-safe-avatar'));
  if(!image){
   image=win.document.createElement('img');
   image.className='rpg-safe-avatar';
   image.alt='';
   image.loading='lazy';
   image.decoding='async';
   image.onerror=()=>{image.hidden=true;};
   image.onload=()=>{image.hidden=false;};
   node.append(image);
  }
  if(image.dataset.safeSrc!==expected){
   image.dataset.safeSrc=expected;
   image.hidden=false;
   image.src=expected;
  }
 }
 function set(node,id,mood='neutral',name=''){
  if(!node||!id)return;
  node.dataset.rpgSafeId=String(id);
  node.dataset.rpgSafeEmotion=emotion(mood);
  node.dataset.rpgSafeInitials=initials(name||id);
  render(node);
 }
 function refresh(){
  if(!isActive())return;
  for(const node of win.document.querySelectorAll('[data-rpg-safe-id]'))render(node);
 }
 return {url,emotion,set,refresh,initials};
});
