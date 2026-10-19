'use strict';
/* Separate RPG-owned deck studio. Never touches Classic sandbox decks. */
(()=>{
 const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',Core=window.NeoRpgCollection;
 const catalog=new Map();
 let state=null,selected=null,filter='',kind='',sort='name',notice='';
 const nums=ids=>Core.rank(ids);
 const look=id=>catalog.get(id)||{id,name:id,supertype:'Unknown',types:[],subtypes:[],images:{}};
 function imageFor(id,large=false){
  const c=look(id),url=(large?c.images?.large||c.images?.small:c.images?.small)||'';
  return /^https:\/\//.test(url)?url:null;
 }
 function img(id,cls='card-art',large=false){
  const url=imageFor(id,large);
  if(!url){const el=document.createElement('span');el.className=cls+' art-fallback';el.textContent=look(id).name;return el;}
  const el=document.createElement('img');el.className=cls;el.src=url;el.alt=look(id).name+' Pokémon card';el.loading='lazy';el.onerror=()=>{
   const alt=document.createElement('span');alt.className=cls+' art-fallback';alt.textContent=look(id).name;el.replaceWith(alt);
  };return el;
 }
 function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;}
 const owned=()=>state.deckJourney.owned;
 const draft=()=>Core.draft(state);
 function stats(){
  const ids=draft(),classes={Pokémon:0,Trainer:0,Energy:0};
  for(const id of ids){const k=look(id).supertype;if(classes[k]!==undefined)classes[k]++;}
  return classes;
 }
 function persist(){localStorage.setItem(KEY,JSON.stringify(state));}
 function valid(){
  const result=Core.check(draft(),owned()),live=state.deckJourney.deck;
  return {...result,dirty:draft().join('|')!==live.join('|')};
 }
 function setStatus(message){notice=message;$('saveStatus').textContent=message;}
 function add(id,change){
  try{
   Core.edit(state,id,change);selected=id;persist();
   setStatus('Unsaved changes · Save to use this list in your next match.');
   render();
  }catch(e){setStatus(e.message);}
 }
 function inspect(id){
  selected=id;renderInspector();
  document.querySelectorAll('.collect-card.selected').forEach(x=>x.classList.remove('selected'));
  document.querySelectorAll('.collect-card[data-id]').forEach(x=>x.classList.toggle('selected',x.dataset.id===id));
 }
 function renderInspector(){
  const c=look(selected),box=$('selectedImage'),detail=$('selectedDescription');
  box.replaceChildren();detail.replaceChildren();
  if(!selected)return;
  box.append(img(selected,'card-art',true));
  detail.append(node('h3',c.name),node('p',c.supertype+' · '+(c.types||[]).join(' / ')+' · '+(c.subtypes||[]).join(', '),'meta'));
  if(c.hp)detail.append(node('p','HP '+c.hp));
  if(c.evolvesFrom)detail.append(node('p','Evolves from '+c.evolvesFrom));
  for(const attack of c.attacks||[]){
   const p=node('p',attack.name+' · '+(attack.damage||'')+' — '+(attack.text||''));detail.append(p);
  }
  detail.append(node('p','Owned: '+(owned()[selected]||0)+' · In deck: '+(nums(draft())[selected]||0)));
 }
 function renderBinder(){
  const ids=Object.keys(owned()).filter(id=>owned()[id]>0&&(!kind||look(id).supertype===kind)&&(!filter||look(id).name.toLowerCase().includes(filter)));
  const counts=nums(draft());
  ids.sort((a,b)=>sort==='unused'?(!!counts[a])-(!!counts[b])||look(a).name.localeCompare(look(b).name):sort==='owned'?(owned()[b]-owned()[a])||look(a).name.localeCompare(look(b).name):look(a).name.localeCompare(look(b).name));
  $('ownedCount').textContent=ids.length+' different cards';
  const root=$('collectionCards');root.replaceChildren();
  for(const id of ids){
   const c=look(id),tile=node('article',undefined,'collect-card'+(id===selected?' selected':''));
   tile.dataset.id=id;
   const photo=img(id),quantity=node('span',counts[id]||0+'/'+owned()[id],'card-qty');
   // Explicitly format as a number of owned versus decked copies.
   quantity.textContent=(counts[id]||0)+' / '+owned()[id];
   tile.append(photo,quantity,node('strong',c.name),node('small',(c.types||[]).join('/')||c.supertype));
   photo.addEventListener('click',()=>inspect(id));
   const buttons=node('div',undefined,'card-tools'),minus=node('button','−','remove'),plus=node('button','+','add');
   minus.type='button';plus.type='button';minus.title='Remove one '+c.name;plus.title='Add one '+c.name;
   minus.disabled=!counts[id];plus.disabled=draft().length>=60||(counts[id]||0)>=owned()[id]||(!Core.ENERGY.has(id)&&(counts[id]||0)>=4);
   minus.onclick=()=>add(id,-1);plus.onclick=()=>add(id,+1);buttons.append(minus,plus);tile.append(buttons);root.append(tile);
  }
  if(!ids.length)root.append(node('p','No owned cards match these filters. Try a different search.'));
 }
 function renderDeck(){
  const counts=nums(draft()),root=$('deckGroups');root.replaceChildren();
  const groups={Pokémon:[],Trainer:[],Energy:[]};
  for(const [id,n] of Object.entries(counts)){const k=look(id).supertype;if(groups[k])groups[k].push([id,n]);}
  for(const [type,entries] of Object.entries(groups)){
   entries.sort((a,b)=>look(a[0]).name.localeCompare(look(b[0]).name));
   const section=node('section',undefined,'deck-group'),head=node('h3');
   head.append(node('span',type),node('span',entries.reduce((sum,[id,n])=>sum+n,0)));
   section.append(head);
   for(const [id,n] of entries){
    const c=look(id),line=node('div',undefined,'deck-entry');
    line.append(img(id,'card-mini'));
    const text=node('div',undefined,'deck-entry-details');text.append(node('strong',n+'× '+c.name),node('small',(c.types||[]).join('/')||c.supertype));
    const remove=node('button','−');remove.title='Remove '+c.name;remove.onclick=()=>add(id,-1);
    line.append(text,remove);line.onclick=e=>{if(e.target!==remove)inspect(id)};section.append(line);
   }
   root.append(section);
  }
 }
 function render(){
  const draftCards=draft(),check=valid(),classification=stats();
  $('deckSize').textContent=draftCards.length+' / 60';
  $('collectionSize').textContent=Object.values(owned()).reduce((a,n)=>a+n,0);
  $('deckValidity').textContent=check.valid?'LEGAL DECK':'NEEDS EDITS';
  $('saveDeck').disabled=!check.valid||!check.dirty;
  $('discardDraft').disabled=!check.dirty;
  const progress=$('deckMetrics');progress.replaceChildren();
  for(const [group,count] of Object.entries(classification)){const chip=node('span',undefined,'metric');chip.append(node('b',count),node('span',group));progress.append(chip);}
  if(!check.valid){setStatus(check.errors[0]);}
  else if(check.dirty){if(!notice||notice.startsWith('The deck'))setStatus('Ready to save your updated 60-card deck.');}
  else setStatus('Saved deck is ready for your next duel.');
  renderBinder();renderDeck();renderInspector();
 }
 function showError(msg){$('studioError').hidden=false;$('studioError').textContent=msg;}
 async function boot(){
  try{
   state=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!state?.deckJourney?.starter)throw Error('Start a campaign and choose your starter deck from Neo Harbor first.');
   if(state.pendingDuel)throw Error('Finish your current duel before editing the deck. Your active duel uses a locked deck snapshot.');
   Core.hydrate(state);
   await (async()=>{const res=await fetch('/cards/base1.json');if(!res.ok)throw Error('Cannot load your historical card library.');const arr=await res.json();for(const c of arr)catalog.set(c.id,c)})();
   Core.draft(state);persist();
   $('deckStudio').hidden=false;
   $('deckProfile').textContent=Core.byId(state.deckJourney.starter).name+' · Day '+state.day;
   selected=draft()[0]||Object.keys(owned())[0]||null;
   $('cardSearch').addEventListener('input',e=>{filter=e.target.value.trim().toLowerCase();renderBinder();});
   $('kindFilter').addEventListener('change',e=>{kind=e.target.value;renderBinder();});
   $('sortFilter').addEventListener('change',e=>{sort=e.target.value;renderBinder();});
   $('saveDeck').onclick=()=>{try{Core.save(state);persist();setStatus('Deck saved! Changes will be used in your next match.');render();}
    catch(e){setStatus(e.message);}};
   $('discardDraft').onclick=()=>{Core.cancel(state);Core.draft(state);persist();setStatus('Edits discarded. Your saved deck is unchanged.');render();};
   render();
  }catch(e){showError(e.message);}
 }
 boot();
})();
