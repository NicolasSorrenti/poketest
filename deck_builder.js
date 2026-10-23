'use strict';
(()=>{
 const $=id=>document.getElementById(id),KEY='neoCampusCustomGymDeck';
 let catalog=[],deck=[],presets=[];const lookup=new Map();
 const names={base1:'Base Set',base2:'Jungle',base3:'Fossil',base4:'Base Set 2',base5:'Team Rocket',gym1:'Gym Heroes',gym2:'Gym Challenge',neo1:'Neo Genesis',neo2:'Neo Discovery',neo3:'Neo Revelation',neo4:'Neo Destiny'};
 async function loadJSON(url){const r=await fetch(url);const data=await r.json();if(!r.ok)throw Error(data.error||'Cannot load '+url);return data;}
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function apply(id,delta){try{deck=NeoDeckBuilder.change(deck,id,delta,catalog);render();}catch(e){$('validation').textContent=e.message;$('validation').classList.add('error');}}
 function renderGallery(){const q=$('search').value.trim().toLowerCase(),set=$('set').value,type=$('kind').value,ready=$('readyOnly').checked;
  let cards=catalog.filter(c=>(!q||c.name.toLowerCase().includes(q))&&(!set||c.set===set)&&(!type||c.supertype===type)&&(!ready||c.supported));
  $('catalogCount').textContent=`${cards.length} of ${catalog.length} cards`;const target=$('gallery');target.replaceChildren();
  // Bound DOM work: search and filters still expose the entire card pool.
  for(const c of cards.slice(0,120)){
   const root=make('div',undefined,'card');if(c.images?.small){const img=make('img');img.loading='lazy';img.src=c.images.small;img.alt='';root.append(img);}
   root.append(make('strong',c.name),make('small',`${names[c.set]||c.set} · ${c.supertype} · ${c.id}`));
   if(!c.supported)root.append(make('small','⚠ Some effects not yet executable','warn'));
   const count=deck.filter(id=>lookup.get(id)?.name===c.name).length;
   const add=make('button',`+ Add (${deck.filter(id=>id===c.id).length})`);add.disabled=deck.length>=60||(!NeoDeckBuilder.isBasicEnergy(c)&&count>=4);add.addEventListener('click',()=>apply(c.id,1));root.append(add);target.append(root);
  }
  if(cards.length>120)target.append(make('p',`Showing first 120 matches. Refine your search to see more.`));
 }
 function renderDeck(){const stats=NeoDeckBuilder.verify(deck,catalog);$('total').textContent=`${stats.total} / 60`;
  const validation=$('validation');validation.classList.toggle('error',!stats.valid);
  validation.textContent=stats.valid?`✓ Legal deck · ${stats.basic} Basic Pokémon · ${stats.unsupported} cards with incomplete effect support`:
   [...stats.errors,`${stats.basic} Basic Pokémon · ${stats.unsupported} cards with incomplete effects`].join(' · ');
  $('save').disabled=!stats.valid;
  const grouped=new Map();for(const id of deck)grouped.set(id,(grouped.get(id)||0)+1);
  $('deckCards').replaceChildren();for(const [id,count]of [...grouped].sort((a,b)=>(lookup.get(a[0])?.name||a[0]).localeCompare(lookup.get(b[0])?.name||b[0]))){
   const c=lookup.get(id),item=make('div',undefined,'deck-item'),name=make('div');name.append(make('strong',c?.name||id),make('small',`${names[c?.set]||id.split('-')[0]} · ${id}${c&&!c.supported?' · ⚠':''}`));
   const ct=make('div',undefined,'deck-controls'),minus=make('button','−'),plus=make('button','+');minus.addEventListener('click',()=>apply(id,-1));plus.addEventListener('click',()=>apply(id,1));plus.disabled=deck.length>=60||!!(c&&!NeoDeckBuilder.isBasicEnergy(c)&&deck.filter(key=>lookup.get(key)?.name===c.name).length>=4);ct.append(minus,make('span',count),plus);item.append(name,ct);$('deckCards').append(item);
  }
 }
 function render(){renderGallery();renderDeck();}
 async function init(){try{
  const [pool,rows]=await Promise.all([loadJSON('/api/classic/card-pool'),loadJSON('/api/classic/decks')]);
  catalog=pool.cards;for(const c of catalog)lookup.set(c.id,c);presets=rows.decks.filter(x=>x.id!=='custom');
  for(const d of presets){const o=make('option',d.name);o.value=d.id;$('starter').append(o);}
  try{const stored=JSON.parse(localStorage.getItem(KEY)||'[]');deck=Array.isArray(stored)&&stored.every(id=>typeof id==='string')?stored:[];}catch{deck=[];}
  render();
 }catch(e){$('validation').textContent=e.message;$('validation').classList.add('error');}}
 for(const id of ['search','set','kind','readyOnly'])$(id).addEventListener(id==='search'?'input':'change',renderGallery);
 $('load').addEventListener('click',async()=>{const id=$('starter').value;if(!id)return;try{deck=(await loadJSON('/api/classic/decklist?id='+encodeURIComponent(id))).cards;render();}catch(e){$('validation').textContent=e.message;}});
 $('clear').addEventListener('click',()=>{deck=[];render();});
 $('save').addEventListener('click',()=>{const v=NeoDeckBuilder.verify(deck,catalog);if(!v.valid)return;localStorage.setItem(KEY,JSON.stringify(deck));window.location.href='/classic_live.html';});
 init();
})();
