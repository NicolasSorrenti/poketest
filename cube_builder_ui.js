'use strict';
// Shared Cube deck-builder renderer. Rules are still enforced by the server.
(()=>{
 const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
 const GROUPS=['Pokémon','Trainer','Energy'];
 const dexNumber=c=>{const raw=c.nationalPokedexNumbers?.[0]??c.nationalPokedexNumber??c.pokedexNumber??c.dexNumber;const n=Number(raw);return Number.isInteger(n)&&n>0?n:Number.MAX_SAFE_INTEGER;};
 const dexSort=(a,b)=>dexNumber(a)-dexNumber(b)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id);
 const ICON={'Pokémon':'◉',Trainer:'▤',Energy:'⚡'};
 const LABEL={'Pokémon':'Pokémon',Trainer:'Trainers',Energy:'Basic Energy'};
 const node=(tag,cls,text)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;
  if(text!==undefined)n.textContent=String(text);return n;
 };
 function cardArt(card,cls){
  const n=node('img','cb-art '+cls);n.alt=card.name;n.loading='lazy';n.decoding='async';
  const src=['/api/cube-card-image/'+encodeURIComponent(card.id)];
  const upstream=card.images?.small;
  if(typeof upstream==='string'&&/^https:\/\/assets\.tcgdex\.net\/en\//.test(upstream))src.push(upstream);
  const match=/^((?:base[1-5]|basep|gym[12]|neo[1-4]))-(\d+)$/.exec(card.id);
  if(match)src.push('https://images.pokemontcg.io/'+match[1]+'/'+Number(match[2])+'.png');
  let i=0;n.addEventListener('error',()=>{
   if(++i<src.length){n.src=src[i];return;}
   const fallback=node('div','cb-art-fallback '+cls,card.name);
   n.replaceWith(fallback);
  });
  n.src=src[0];return n;
 }
 function create({root,actionElement,onChange,config={}}){
  const targetSize=Number.isInteger(config.targetSize)&&config.targetSize>0?config.targetSize:40;
  const unlimitedIds=new Set(config.unlimitedIds||[]);
  const nameLimit=config.nameLimit!==false;
  if(!root||typeof onChange!=='function')throw Error('Missing Cube builder root/callback');
  root.classList.add('cube-builder-ui');
  root.innerHTML=[
   '<div class="cb-header"><div><div class="cb-eyebrow">NEO CAMPUS · LIMITED</div><h2>Build your 40-card deck</h2><p>Choose from your drafted cards, plus unlimited Basic Energy.</p></div>',
   '<div class="cb-progress"><strong id="cbTotal">0 / 40 cards</strong><div class="cb-track"><div id="cbFill"></div></div><small id="cbValidation" aria-live="polite"></small></div></div>',
   '<div class="cb-workspace"><section class="cb-library"><div class="cb-toolbar"><div id="cbTabs" class="cb-tabs"></div>',
   '<div class="cb-search"><input id="cbSearch" type="search" aria-label="Search drafted cards" placeholder="Search cards">',
   '<select id="cbSort" aria-label="Sort cards"><option value="dex">Pokédex number</option><option value="name">Name A–Z</option><option value="count">Most drafted</option><option value="type">Type</option></select></div></div>',
   '<div id="cbPool"></div></section><aside class="cb-preview"><div class="cb-caption">CARD PREVIEW</div><div id="cbPreview"></div></aside>',
   '<aside class="cb-selected"><div class="cb-selected-title"><h3>Selected deck</h3><div class="cb-selected-actions"><button id="cbRestore" type="button" hidden>Restore suggestion</button><button id="cbClear" type="button">Clear deck</button></div></div>',
   '<div class="cb-summary"><strong id="cbDeckTotal">0 / 40 cards</strong><div id="cbBreakdown"></div></div>',
   '<div id="cbDeckList"></div><div id="cbActionSlot"></div></aside></div>'
  ].join('');
  const $=id=>root.querySelector('#'+id);
  if(config.eyebrow)root.querySelector('.cb-eyebrow').textContent=config.eyebrow;
  if(config.heading)root.querySelector('.cb-header h2').textContent=config.heading;
  if(config.description)root.querySelector('.cb-header p').textContent=config.description;
  if(config.collectionLabel)$('cbSearch').placeholder='Search '+config.collectionLabel;
  if(config.canClear===false)$('cbClear').hidden=true;
  if(actionElement)$('cbActionSlot').append(actionElement);
  let filter='all',query='',sort='dex',selectedId=null,deck=[],locked=false,cards=[],limits=new Map(),index=new Map(),suggestedDeck=null;
  const amount=id=>deck.filter(x=>x===id).length;
  const basic=id=>{const c=index.get(id);return c?.supertype==='Pokémon'&&(c.subtypes||[]).some(x=>x==='Basic'||x==='Baby');};
  const group=c=>GROUPS.includes(c?.supertype)?c.supertype:'Trainer';
  const sameName=name=>deck.filter(id=>index.get(id)?.name===name).length;
  const canAdd=c=>!locked&&deck.length<targetSize&&amount(c.id)<(limits.get(c.id)||0)&&
   (unlimitedIds.has(c.id)||(!nameLimit?amount(c.id)<4:sameName(c.name)<4));
  const canRemove=c=>!locked&&amount(c.id)>0;
  function change(c,by){
   if((by>0&&!canAdd(c))||(by<0&&!canRemove(c)))return;
   const next=[...deck];
   if(by>0)next.push(c.id);else next.splice(next.lastIndexOf(c.id),1);
   deck=next;onChange([...next]);render();
  }
  function quantities(c,compact=false){
   const wrap=node('div','cb-qty'+(compact?' compact':''));
   const minus=node('button','cb-qty-btn','−');minus.type='button';
   minus.disabled=!canRemove(c);minus.setAttribute('aria-label','Remove '+c.name);
   minus.addEventListener('click',event=>{event.stopPropagation();change(c,-1);});
   const count=node('span','cb-qty-text',compact?amount(c.id):amount(c.id)+' / '+limits.get(c.id));
   const plus=node('button','cb-qty-btn','+');plus.type='button';
   plus.disabled=!canAdd(c);plus.setAttribute('aria-label','Add '+c.name);
   plus.addEventListener('click',event=>{event.stopPropagation();change(c,1);});
   wrap.append(minus,count,plus);return wrap;
  }
  function select(c){
   selectedId=c.id;
   root.querySelectorAll('.cb-tile').forEach(n=>n.classList.toggle('active',n.dataset.id===c.id));
   showPreview();
  }
  function showPreview(){
   const panel=$('cbPreview');panel.replaceChildren();
   const c=index.get(selectedId)||cards[0];
   if(!c){panel.append(node('p','cb-empty','Select a card to inspect it.'));return;}
   panel.append(cardArt(c,'cb-large'));
   const title=node('div','cb-preview-title');
   title.append(node('h3','',c.name),node('strong','',c.hp?'HP '+c.hp:group(c)));
   panel.append(title);
   panel.append(node('p','cb-preview-tag',[(c.subtypes||[]).join(', '),(c.types||[]).join(', ')].filter(Boolean).join(' · ')||group(c)));
   if(c.evolvesFrom)panel.append(node('p','cb-muted','Evolves from '+c.evolvesFrom));
   for(const a of (c.attacks||[]).slice(0,2)){
    const line=node('div','cb-attack');
    line.append(node('strong','',a.name),node('span','',Array.isArray(a.cost)?a.cost.join(' · '):''));
    if(a.damage)line.append(node('b','',a.damage));
    panel.append(line);
   }
   panel.append(node('p','cb-muted',config.collectionLabel?
    'Owned: '+limits.get(c.id)+' · In deck: '+amount(c.id):
    group(c)==='Energy'?'Add unlimited Basic Energy to your deck.':
    'Drafted: '+limits.get(c.id)+' · In deck: '+amount(c.id)));
   if(!locked){
    const add=node('button','cb-preview-add','+ Add '+c.name);
    add.type='button';add.disabled=!canAdd(c);add.addEventListener('click',()=>change(c,1));
    panel.append(add);
   }
  }
  function showPool(){
   const tabs=$('cbTabs');tabs.replaceChildren();
   for(const [key,title] of [['all','All cards'],['Pokémon','Pokémon'],['Trainer','Trainers'],['Energy','Energy']]){
    const total=cards.filter(c=>key==='all'||group(c)===key).reduce((n,c)=>n+limits.get(c.id),0);
    const button=node('button','cb-tab'+(filter===key?' active':''),title+' ('+total+')');
    button.type='button';button.setAttribute('aria-pressed',String(filter===key));
    button.onclick=()=>{filter=key;showPool();};
    tabs.append(button);
   }
   const pool=$('cbPool');pool.replaceChildren();
   for(const kind of GROUPS){
    if(filter!=='all'&&filter!==kind)continue;
    let available=cards.filter(c=>group(c)===kind&&c.name.toLowerCase().includes(query.toLowerCase()));
    if(sort==='dex'&&kind==='Pokémon')available.sort(dexSort);
    if(sort==='dex'&&kind!=='Pokémon')available.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
    if(sort==='name')available.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
    if(sort==='count')available.sort((a,b)=>limits.get(b.id)-limits.get(a.id)||a.name.localeCompare(b.name));
    if(sort==='type')available.sort((a,b)=>(a.types?.[0]||'').localeCompare(b.types?.[0]||'')||a.name.localeCompare(b.name));
    if(!available.length)continue;
    const section=node('section','cb-category');
    const title=node('h3','',ICON[kind]+' '+LABEL[kind]);
    title.append(node('span','cb-pill',available.reduce((n,c)=>n+limits.get(c.id),0)));section.append(title);
    const grid=node('div','cb-grid');
    for(const c of available){
     const tile=node('div','cb-tile'+(selectedId===c.id?' active':''));tile.dataset.id=c.id;
     tile.tabIndex=0;tile.setAttribute('aria-label',c.name);
     tile.append(cardArt(c,'cb-thumb'),node('div','cb-name',c.name),quantities(c));
     tile.addEventListener('mouseenter',()=>select(c));
     tile.addEventListener('focusin',()=>select(c));
     tile.addEventListener('click',()=>select(c));grid.append(tile);
    }
    section.append(grid);pool.append(section);
   }
   if(!pool.children.length)pool.append(node('p','cb-empty','No cards match your search.'));
  }
  function showDeck(){
   $('cbTotal').textContent=deck.length+' / '+targetSize+' cards';
   $('cbDeckTotal').textContent=deck.length+' / '+targetSize+' cards';
   $('cbFill').style.width=Math.min(100,deck.length/targetSize*100)+'%';
   const basics=deck.filter(basic).length;
   const validation=typeof config.validate==='function'?config.validate(deck):null;
   const ready=validation?validation.valid:deck.length===targetSize&&basics>0;
   $('cbValidation').textContent=locked?'Deck locked':validation?
    ready?'✓ Legal deck — ready to save':validation.errors?.[0]||'Deck needs attention':
    ready?'✓ Ready to play':deck.length===targetSize?'Add at least one Basic Pokémon':
    (targetSize-deck.length)+' more cards · '+basics+' Basic Pokémon';
   $('cbValidation').classList.toggle('ready',ready);
   const chosen=GROUPS.map(g=>[g,cards.filter(c=>group(c)===g&&amount(c.id))]);
   const breakdown=$('cbBreakdown');breakdown.replaceChildren();
   const list=$('cbDeckList');list.replaceChildren();
   for(const [kind,items] of chosen){
    const total=items.reduce((n,c)=>n+amount(c.id),0);
    const stat=node('div','cb-stat');
    stat.append(node('strong','',ICON[kind]+' '+total),node('small','',LABEL[kind]));breakdown.append(stat);
    if(!items.length)continue;
    const section=node('section','cb-deck-group');
    const title=node('h4','',ICON[kind]+' '+LABEL[kind]+' ');
    title.append(node('span','cb-pill',total));section.append(title);
    for(const c of items.sort(kind==='Pokémon'?dexSort:(a,b)=>a.name.localeCompare(b.name))){
     const row=node('div','cb-deck-row');
     const preview=node('button','cb-row-card');preview.type='button';preview.title='Preview '+c.name;
     preview.append(cardArt(c,'cb-tiny'),node('span','',c.name));
     preview.onclick=()=>select(c);row.append(preview,quantities(c,true));section.append(row);
    }
    list.append(section);
   }
   if(!list.children.length)list.append(node('p','cb-empty','No cards selected yet.'));
   $('cbClear').disabled=locked||!deck.length;
  const restore=$('cbRestore');
  restore.hidden=!suggestedDeck||locked;
  restore.disabled=!suggestedDeck||locked||
   (suggestedDeck.length===deck.length&&suggestedDeck.every((id,i)=>deck[i]===id));
  }
  function render(){showPool();showPreview();showDeck();}
  $('cbSearch').oninput=e=>{query=e.target.value;showPool();};
  $('cbSort').onchange=e=>{sort=e.target.value;showPool();};
  $('cbRestore').onclick=()=>{
   if(locked||!suggestedDeck||suggestedDeck.length!==targetSize)return;
   if(deck.length&&!confirm('Replace your current deck with the suggested build?'))return;
   deck=[...suggestedDeck];onChange([...deck]);render();
  };
  $('cbClear').onclick=()=>{
   if(locked||!deck.length||!confirm('Remove all cards from your deck?'))return;
   deck=[];onChange([]);render();
  };
  return {update({drafted=[],energyIds={},deck:nextDeck=[],locked:isLocked=false,ownedCounts=null,suggestedDeck:recommendation=null}={}){
   suggestedDeck=Array.isArray(recommendation)?[...recommendation]:null;
   deck=[...nextDeck];locked=isLocked;limits=new Map();index=new Map();
   for(const c of drafted){
    limits.set(c.id,ownedCounts?Math.max(0,ownedCounts[c.id]||0):(limits.get(c.id)||0)+1);index.set(c.id,c);
   }
   for(const type of TYPES){
    const id=energyIds[type];if(typeof id!=='string')continue;
    index.set(id,{id,name:type+' Energy',supertype:'Energy',subtypes:[],types:[type],images:{}});
    limits.set(id,targetSize);
   }
   cards=[...index.values()];
   if(!index.has(selectedId))selectedId=drafted[0]?.id||cards[0]?.id||null;
   render();
  }};
 }
 window.CubeDeckBuilder={create};
})();
