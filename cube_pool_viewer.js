'use strict';
/* Read-only snapshot of the exact generated Cube, shared by solo and room drafts. */
(()=>{
 const style=document.createElement('style');
 style.textContent='.cube-pool-open{margin:9px 0 15px;padding:10px 14px;background:#263d69;color:#fff;border:1px solid #8da9df;border-radius:10px;cursor:pointer}.cube-pool-dialog{color:#eef4ff;background:#121f3a;border:1px solid #7b98cd;border-radius:16px;width:min(950px,94vw);max-height:88vh;padding:0;box-shadow:0 24px 80px #000b}.cube-pool-dialog::backdrop{background:#020714c9}.cube-pool-body{padding:18px 22px}.cube-pool-header{display:flex;justify-content:space-between;align-items:center;gap:12px}.cube-pool-header h2{margin:0}.cube-pool-close{background:#31476e;color:white;border:1px solid #8ca4d2;border-radius:9px;padding:9px 15px;cursor:pointer}.cube-pool-tools{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.cube-pool-tools input,.cube-pool-tools select{background:#0a1530;border:1px solid #607ba9;color:white;border-radius:8px;padding:10px;min-width:0}.cube-pool-tools input{flex:1;min-width:145px}.cube-pool-list{max-height:54vh;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}.cube-pool-card{display:flex;gap:9px;align-items:center;background:#1d2d50;border:1px solid #354e7a;border-radius:9px;padding:8px}.cube-pool-card img{width:48px;height:67px;object-fit:contain}.cube-pool-card span{min-width:0;overflow-wrap:anywhere}.cube-pool-card small{display:block;color:#bacbe9}.cube-pool-count{font-size:13px;color:#bed2f1;margin-bottom:10px}@media(max-width:520px){.cube-pool-list{grid-template-columns:1fr}.cube-pool-body{padding:13px}}';
 document.head.append(style);
 const trigger=document.createElement('button');trigger.type='button';trigger.className='cube-pool-open';trigger.textContent='Browse Cube card list';trigger.hidden=true;
 const dialog=document.createElement('dialog');dialog.className='cube-pool-dialog';
 dialog.innerHTML='<div class="cube-pool-body"><div class="cube-pool-header"><h2>Cube card list</h2><button class="cube-pool-close" type="button">Close</button></div><p>Every card in this generated Cube, including duplicates. This does not reveal other players\' picks.</p><div class="cube-pool-tools"><input type="search" placeholder="Search card name…" aria-label="Search Cube cards"><select aria-label="Filter card type"><option value="all">All cards</option><option value="Pokémon">Pokémon</option><option value="Trainer">Trainers</option></select></div><div class="cube-pool-count" aria-live="polite"></div><div class="cube-pool-list"></div></div>';
 const slot=document.getElementById('draftStatus')||document.getElementById('progress')||document.getElementById('roomProgress')||document.querySelector('header');
 slot.insertAdjacentElement('afterend',trigger);document.body.append(dialog);
 const search=dialog.querySelector('input'),filter=dialog.querySelector('select'),list=dialog.querySelector('.cube-pool-list'),count=dialog.querySelector('.cube-pool-count');
 let cards=[],fingerprint='';
 function render(){
  const term=search.value.trim().toLowerCase(),kind=filter.value;
  const grouped=new Map();
  for(const card of cards){
   if(kind!=='all'&&card.supertype!==kind)continue;
   if(term&&!card.name.toLowerCase().includes(term))continue;
   const key=card.id,entry=grouped.get(key);
   if(entry)entry.quantity++;else grouped.set(key,{...card,quantity:1});
  }
  const rows=[...grouped.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
  list.replaceChildren();
  for(const card of rows){
   const row=document.createElement('div');row.className='cube-pool-card';
   const img=document.createElement('img');img.loading='lazy';img.alt='';img.src='/api/cube-card-image/'+encodeURIComponent(card.id);
   img.onerror=()=>img.remove();
   const info=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');
   name.textContent=card.name+(card.quantity>1?' ×'+card.quantity:'');
   meta.textContent=card.supertype+' · '+(card.types||[]).join(', ');
   info.append(name,meta);row.append(img,info);list.append(row);
  }
  count.textContent=cards.length+' total cards · '+rows.reduce((n,c)=>n+c.quantity,0)+' matching copies · '+rows.length+' different printings';
 }
 trigger.addEventListener('click',()=>{render();dialog.showModal();search.focus();});
 dialog.querySelector('.cube-pool-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 search.addEventListener('input',render);filter.addEventListener('change',render);
 window.CubePoolViewer={update(pool){trigger.hidden=!Array.isArray(pool);if(!Array.isArray(pool)){cards=[];dialog.close();return;}if(pool!==cards){cards=pool;fingerprint='';if(dialog.open)render();}}};
})();