'use strict';
// Render-only character gallery. Unlock policy, catalogue selection and viewed
// state remain in the authoritative RPG collection/CG controller.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldGallery=api;
})(typeof window==='undefined'?null:window,function(){
 function element(doc,tag,className,text){
  const item=doc.createElement(tag);
  if(className)item.className=className;
  if(text!==undefined)item.textContent=String(text);
  return item;
 }
 function populateCharacters(select,characters,doc=select?.ownerDocument){
  if(!select||!doc)return false;
  const old=select.value;
  const options=[element(doc,'option',null,'All characters')];
  options[0].value='';
  for(const character of characters||[]){
   const option=element(doc,'option',null,character.name);
   option.value=character.id;options.push(option);
  }
  select.replaceChildren(...options);
  select.value=(characters||[]).some(c=>c.id===old)?old:'';
  return true;
 }
 function render(doc,model,handlers){
  if(!doc||!model)return false;
  const get=id=>doc.getElementById(id);
  const root=get('galleryGrid'),progress=get('galleryProgress'),select=get('galleryCharacter'),
   characterPage=get('galleryCharacterPage'),albumPage=get('galleryAlbumPage'),
   galleryCount=get('galleryCount');
  if(!root||!progress||!select||!characterPage||!albumPage||!galleryCount)return false;
  root.replaceChildren();progress.replaceChildren();characterPage.replaceChildren();
  const hasPage=!!model.page;
  characterPage.hidden=hasPage;albumPage.hidden=!hasPage;
  if(!hasPage){
   galleryCount.textContent='Choose a character to explore their memories.';
   for(const character of model.characters||[]){
    const button=element(doc,'button','cg-character-card');
    button.type='button';
    const avatar=element(doc,'div','cg-character-avatar');
    const image=handlers?.avatar?.(character.id);
    if(image){image.alt=character.name;image.loading='lazy';avatar.append(image);}
    else avatar.append(element(doc,'span','avatar-fallback',character.name));
    button.append(avatar,element(doc,'strong',null,character.name),
     element(doc,'small',null,character.earned+' / '+character.total+' memories unlocked'));
    button.onclick=()=>handlers?.chooseCharacter?.(character.id);
    characterPage.append(button);
   }
   return true;
  }
  select.value=model.page;
  const title=get('galleryCharacterTitle');
  if(title)title.textContent=model.title||model.page;
  const all=model.all||[],visible=model.visible||[];
  const earned=all.filter(x=>x.unlocked).length;
  galleryCount.textContent=earned+' / '+all.length+' unlocked · '+visible.length+' shown';
  if(!visible.length)
   root.append(element(doc,'p','cg-gallery-empty',all.length?
    'No artwork matches this filter. Try turning off “Only new”.':
    'No artwork cataloged in this category yet.'));
  for(const cat of model.categories||[]){
   const button=element(doc,'button','cg-category-tab'+(model.type===cat.id?' selected':''),cat.label);
   button.type='button';
   button.setAttribute('aria-pressed',String(model.type===cat.id));
   button.onclick=()=>handlers?.chooseCategory?.(cat.id);
   progress.append(button);
  }
  for(const entry of visible){
   const tile=element(doc,'button','cg-tile'+(entry.unlocked?' unlocked':' locked'));
   tile.type='button';tile.dataset.character=entry.character||'';
   tile.disabled=!entry.unlocked;
   const thumb=element(doc,'div','cg-thumb');
   if(entry.character)handlers?.discreetAvatar?.(thumb,entry.character);
   if(entry.unlocked){
    const img=element(doc,'img');
    img.alt='';img.hidden=true;thumb.append(img);
    if(entry.type){
     img.onload=()=>{img.hidden=false;};
     img.onerror=()=>{img.hidden=true;thumb.textContent='Artwork unavailable';};
     img.src=entry.path;
    }else handlers?.loadCG?.(img,entry,kind=>{
     img.classList.toggle('is-fallback',kind!=='event');
    },()=>{thumb.textContent='Artwork unavailable';});
   }else thumb.append(element(doc,'span',null,'🔒'));
   tile.append(thumb,
    element(doc,'strong',null,entry.unlocked?entry.title:'???'),
    element(doc,'small',null,entry.unlocked?
     (entry.viewed?'Viewed':'New · tap to view'):'Locked · discover in the story'));
   tile.onclick=()=>{if(entry.unlocked)handlers?.open?.(entry);};
   root.append(tile);
  }
  return true;
 }
 return Object.freeze({populateCharacters,render});
});
