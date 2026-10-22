'use strict';
// Visual only: playmats are deliberately independent of rules and online state.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoDuelPlaymats=api;})(typeof window==='undefined'?null:window,function(){
 const defaults=[{id:'aurora',name:'Neo Campus · Aurora',colors:['#112c45','#116480','#6ae0ca'],symbol:'✦'},{id:'arcade',name:'Neon Arcade',colors:['#261339','#713580','#ed9ee7'],symbol:'◇'},{id:'heritage',name:'Classic Tournament',colors:['#173527','#56784d','#ecd9a4'],symbol:'★'}];
 const themes={
 hana:['Hana','#253e60','#598aab','#c0ebf9','✦'],reina:['Reina','#461f38','#a24466','#ffdaad','♛'],shiori:['Shiori','#20324b','#5678a8','#c2d7fa','◆'],yuna:['Yuna','#441d59','#a24aaa','#ffdc81','★'],
 akari:['Akari','#143946','#47848e','#b7ebe4','⌁'],camila:['Camila','#24382c','#648348','#e0d391','✣'],marina:['Marina','#183c58','#398aad','#a7eafa','≈'],kaede:['Kaede','#34213d','#8a517d','#ecc0df','✶'],
 jun:['Jun','#1d3543','#528c94','#cfeced','◆'],teo:['Teo','#323254','#8b6fbb','#f8e0b0','✦'],iris:['Iris','#2a2c4b','#796ab0','#ddcfff','✧'],jinx:['Jinx','#1b2d63','#5868d4','#f2b0f2','⚡'],
 luna:['Luna','#14334f','#3f82b5','#a1dcff','☾'],sol:['Sol','#523027','#b26942','#fce19a','☀'],elena:['Elena','#2a2d47','#7e819f','#e2dbe6','◇'],rina:['Rina','#1c3b2d','#478865','#b6e7ac','❀'],
 sierra:['Sierra','#362444','#885a99','#e4b5eb','✦'],elio:['Elio','#2e3551','#697cb3','#f0d6ad','★'],alma:['Alma','#313144','#78718c','#dbcae6','✿'],nereo:['Nereo','#183d55','#3787a4','#a6e5ee','≈']
 };
 const catalog=[...defaults,...Object.entries(themes).map(([id,v])=>({id:'npc-'+id,name:v[0]+' · Signature Mat',colors:v.slice(1,4),symbol:v[4]}))];
 const lookup=new Map(catalog.map(m=>[m.id,m]));
 function gifted(state){const owned=new Set();for(const [id,value] of Object.entries(state?.playmatGifts||{}))if(value&&themes[id])owned.add(id);for(const r of Object.values(state?.milestoneRewards||{}))if(r?.chapter>=2&&themes[r?.npc])owned.add(r.npc);return [...owned].sort();}
 function available(ids=[]){return [...defaults,...[...new Set(ids)].filter(id=>themes[id]).map(id=>lookup.get('npc-'+id)),...custom()];}
 function choose(id,ids){return ids.includes(id)?id:defaults[0].id;}
 function svg(id){
  const m=lookup.get(id)||defaults[0],c=m.colors,label=m.name.replace(/[&<>"']/g,'');
  const art=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${c[0]}"/><stop offset=".56" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient><radialGradient id="a"><stop stop-color="${c[2]}" stop-opacity=".42"/><stop offset="1" stop-color="${c[2]}" stop-opacity="0"/></radialGradient><pattern id="p" width="76" height="76" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)"><path d="M0 0V76 M15 0V76" stroke="${c[2]}" stroke-opacity=".1" stroke-width="2"/></pattern></defs><rect width="1280" height="640" fill="url(#g)"/><rect width="1280" height="640" fill="url(#p)"/><circle cx="870" cy="326" r="390" fill="url(#a)"/><circle cx="870" cy="326" r="250" fill="none" stroke="${c[2]}" stroke-opacity=".24" stroke-width="5"/><circle cx="870" cy="326" r="194" fill="none" stroke="${c[2]}" stroke-opacity=".19" stroke-width="3"/><path d="M-100 520L520-80 M670 730L1380-20" stroke="${c[2]}" stroke-width="42" stroke-opacity=".08"/><rect x="24" y="24" width="1232" height="592" fill="none" stroke="${c[2]}" stroke-opacity=".45" stroke-width="4"/><text x="870" y="423" text-anchor="middle" fill="${c[2]}" fill-opacity=".22" font-size="270" font-family="Arial,sans-serif" font-weight="900">${m.symbol}</text><text x="85" y="480" fill="white" fill-opacity=".2" font-size="70" font-family="Arial,sans-serif" font-weight="900">NEO CAMPUS</text><text x="89" y="523" fill="${c[2]}" fill-opacity=".73" font-size="22" letter-spacing="5" font-family="Arial,sans-serif">${label.toUpperCase()}</text></svg>`;
  return 'url("data:image/svg+xml,'+encodeURIComponent(art)+'")';
 }

 // Render's filesystem is ephemeral. User-created mats live in browser IndexedDB
 // with a small, synchronous localStorage catalog for the existing RPG selector.
 const META_KEY='neoCampusCustomPlaymatsV1';
 const IMPORT_KEY='neoCampusPlaymatImportSelection';
 const DB_NAME='neoCampusPlaymatImagesV1',STORE='images';
 const imageUrls=new Map();
 function custom(){
  if(typeof localStorage==='undefined')return [];
  try{
   const parsed=JSON.parse(localStorage.getItem(META_KEY)||'[]');
   if(!Array.isArray(parsed))return [];
   return parsed.filter(m=>m&&typeof m.id==='string'&&/^custom-[a-z0-9-]+$/.test(m.id)&&typeof m.name==='string'&&m.name.length<=60)
    .slice(0,30).map(m=>({id:m.id,name:m.name,custom:true}));
  }catch{return [];}
 }
 function dbOpen(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined')return reject(Error('Browser image storage is unavailable.'));
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};
   request.onerror=()=>reject(request.error||Error('Cannot open image storage.'));
   request.onsuccess=()=>resolve(request.result);
  });
 }
 async function transact(type,key,value){
  const db=await dbOpen();
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,type==='get'?'readonly':'readwrite');
   const store=tx.objectStore(STORE);
   const request=type==='get'?store.get(key):type==='put'?store.put(value,key):store.delete(key);
   let result;
   request.onsuccess=()=>{result=request.result;};
   tx.oncomplete=()=>{db.close();resolve(result);};
   tx.onerror=()=>{db.close();reject(tx.error||Error('Cannot access mat storage.'));};
   tx.onabort=()=>{db.close();reject(tx.error||Error('Mat storage interrupted.'));};
  });
 }
 async function imageUrl(id){
  if(!custom().some(m=>m.id===id))return null;
  if(!imageUrls.has(id)){
   const pending=transact('get',id).then(blob=>{
    if(!(blob instanceof Blob))return null;
    return URL.createObjectURL(blob);
   }).catch(error=>{imageUrls.delete(id);throw error;});
   imageUrls.set(id,pending);
  }
  return imageUrls.get(id);
 }
 async function saveCustom(name,blob){
  if(typeof localStorage==='undefined')throw Error('Local browser storage is unavailable.');
  if(!(blob instanceof Blob)||!['image/webp','image/png'].includes(blob.type)||!blob.size||blob.size>10*1024*1024)throw Error('Invalid or oversized playmat image.');
  if(custom().length>=30)throw Error('Maximum 30 custom mats. Delete an old one first.');
  const title=String(name||'My Playmat').trim().slice(0,48)||'My Playmat';
  const id='custom-'+(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  await transact('put',id,blob);
  const entry={id,name:title,custom:true};
  try{
   localStorage.setItem(META_KEY,JSON.stringify([...custom(),entry]));
   localStorage.setItem('neoCampusPlaymat',id);
   localStorage.setItem(IMPORT_KEY,id);
  }catch(error){
   await transact('delete',id).catch(()=>{});
   throw error;
  }
  return entry;
 }
 async function removeCustom(id){
  if(!custom().some(m=>m.id===id))return false;
  await transact('delete',id);
  const existing=imageUrls.get(id);
  if(existing)existing.then(url=>{if(url)URL.revokeObjectURL(url);}).catch(()=>{});
  imageUrls.delete(id);
  localStorage.setItem(META_KEY,JSON.stringify(custom().filter(m=>m.id!==id)));
  for(const key of ['neoCampusPlaymat',IMPORT_KEY])if(localStorage.getItem(key)===id)localStorage.removeItem(key);
  return true;
 }

 function apply(side,id){
  if(!side)return;
  const entry=custom().find(m=>m.id===id);
  const selected=entry?id:lookup.has(id)?id:'aurora';
  side.dataset.playmat=selected;
  if(!entry){
   side.style.setProperty('--neo-playmat-image','url("/rpg-assets/ui/playmats/'+selected+'.webp"),'+svg(selected));
   return;
  }
  side.style.setProperty('--neo-playmat-image',svg('aurora'));
  imageUrl(selected).then(url=>{
   if(side.dataset.playmat===selected&&url)side.style.setProperty('--neo-playmat-image','url("'+url+'")');
  }).catch(()=>{});
 }
 return {defaults,themes,catalog,gifted,available,choose,svg,apply,custom,saveCustom,removeCustom,imageUrl,IMPORT_KEY};
});
