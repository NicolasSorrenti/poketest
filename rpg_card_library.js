'use strict';
(()=>{
 const $=id=>document.getElementById(id),Core=window.NeoRpgCollection,Index=window.NeoRpgPackIndex;
 const PAGE=48;
 let records=[],filtered=[],limit=PAGE,sourceIndex;
 const esc={holo:'Holo Rare',rare:'Rare',secret:'Secret / Shining',uncommon:'Uncommon',common:'Common',energy:'Basic Energy'};
 const params=new URLSearchParams(location.search);
 if(params.get('from')==='studio')$('libraryBack').href='/rpg_deck_studio.html';
 function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
 function addOptions(select,entries){
  for(const [id,name] of entries){const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option);}
 }
 const displaySource=p=>p.name+(p.available?' · Now':' · Later');
 function addChip(root,p){const badge=el('span','source '+(p.available?'available':'future'),displaySource(p));badge.title=p.available?'This printing can appear now; no drop is guaranteed.':'This pack/printing is not available yet in your campaign.';root.append(badge);}
 function cardNode(card){
  const article=el('article','library-card');
  const art=el('div','card-art');
  const image=el('img');image.loading='lazy';image.alt=card.name+' · '+card.printSet;
  if(card.images?.small){
   image.src=card.images.small;
   image.onerror=()=>{art.replaceChildren(el('div','fallback','✦'));};
   art.append(image);
  }else art.append(el('div','fallback','✦'));
  const info=el('div','card-info');
  info.append(el('h3','',card.name));
  info.append(el('p','card-meta',card.printSet+' · '+card.id+' · '+(card.supertype||'Card')));
  const tags=el('div','card-tags');
  tags.append(el('span','pill',esc[card.rarity]||card.rarity));
  tags.append(el('span','pill'+(card.owned?' owned':''),'Owned: '+card.owned));
  info.append(tags);
  info.append(el('h4','','POSSIBLE PACKS · '+card.sources.length));
  if(!card.sources.length)info.append(el('p','empty-sources','Not obtainable from current RPG boosters.'));
  else{
   const active=card.sources.filter(s=>s.available);
   const future=card.sources.filter(s=>!s.available);
   const ordered=[...active,...future];
   const top=el('div','pack-sources');
   for(const source of ordered.slice(0,4))addChip(top,source);
   info.append(top);
   if(ordered.length>4){
    const details=el('details','extra-sources');
    details.append(el('summary','','Show '+(ordered.length-4)+' more pack sources'));
    const more=el('div','pack-sources');
    for(const source of ordered.slice(4))addChip(more,source);
    details.append(more);info.append(details);
   }
  }
  article.append(art,info);return article;
 }
 function matches(card){
  const query=$('librarySearch').value.trim().toLocaleLowerCase();
  if(query&&!((card.name+' '+card.id+' '+card.printSet).toLocaleLowerCase().includes(query)))return false;
  if($('librarySet').value&&!card.id.startsWith($('librarySet').value+'-'))return false;
  if($('libraryRarity').value!==''&&card.rarity!==$('libraryRarity').value)return false;
  if($('libraryOwned').value==='owned'&&!card.owned)return false;
  if($('libraryOwned').value==='missing'&&card.owned)return false;
  if($('libraryPack').value&&!card.sources.some(s=>s.id===$('libraryPack').value))return false;
  const availability=$('libraryAvailable').value;
  if(availability==='now'&&!card.sources.some(s=>s.available))return false;
  if(availability==='later'&&(card.sources.some(s=>s.available)||!card.sources.length))return false;
  return true;
 }
 function render(reset=true){
  if(reset){limit=PAGE;filtered=records.filter(matches);}
  const root=$('libraryResults'),fragment=document.createDocumentFragment();
  for(const card of filtered.slice(0,limit))fragment.append(cardNode(card));
  root.replaceChildren(fragment);
  if(!filtered.length)root.append(el('p','empty','No cards match these filters. Try a different name, set or pack.'));
  $('libraryCount').textContent=filtered.length.toLocaleString()+' printings found'+(filtered.length?' · showing '+Math.min(limit,filtered.length):'');
  $('libraryMore').hidden=limit>=filtered.length;
 }
 $('libraryMore').onclick=()=>{limit+=PAGE;render(false);};
 for(const id of ['librarySearch','librarySet','libraryRarity','libraryOwned','libraryPack','libraryAvailable']){
  $(id).addEventListener(id==='librarySearch'?'input':'change',()=>render(true));
 }
 async function boot(){
  try{
   let state;
   try{state=JSON.parse(localStorage.getItem('neoHarborRpgV1')||'null');}catch{}
   state=state&&typeof state==='object'&&!Array.isArray(state)?state:{day:1,deckJourney:{owned:{}}};
   sourceIndex=Index.create(Core,state);
   addOptions($('librarySet'),Object.entries(Core.SETS).map(([set,info])=>[set,info.name]));
   addOptions($('libraryPack'),sourceIndex.packs.map(pack=>[pack.id,pack.name]));
   const results=await Promise.all(Object.keys(Core.SETS).map(async set=>{
    const response=await fetch('/cards/'+set+'.json');
    if(!response.ok)throw Error('Could not load '+Core.SETS[set].name+' ('+response.status+').');
    return response.json();
   }));
   records=results.flat().filter(card=>card?.id&&Core.canOwn(card.id)).map(card=>sourceIndex.record(card));
   records.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
   const discovered=records.filter(c=>c.owned>0).length;
   $('libraryProgress').textContent=discovered+' / '+records.length+' printings owned · Day '+sourceIndex.status.day+
    (sourceIndex.status.starter?'':' · no active RPG collection');
   render();
  }catch(error){
   $('libraryCount').textContent='Card library unavailable';
   $('libraryError').hidden=false;
   $('libraryError').textContent=error?.message||'Could not load card library. Please try again.';
  }
 }
 boot();
})();
