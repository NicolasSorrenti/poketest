'use strict';
/* Shared, read-only Cube assistance. No draft decisions or game state are changed. */
(()=>{
 const css=document.createElement('style');
 css.textContent='.ca-panel{background:#152744;border:1px solid #49628d;border-radius:12px;padding:13px;margin:12px 0;color:#e8f0ff}.ca-panel h3{margin:0 0 9px;font-size:16px}.ca-chips{display:flex;flex-wrap:wrap;gap:6px}.ca-chip{background:#2c4165;border-radius:7px;padding:5px 8px;font-size:12px}.ca-muted{color:#b7c9e4;font-size:12px}.ca-control{background:#182c4b;border:1px solid #7994bc;border-radius:7px;padding:7px;color:white;margin:3px 0;width:100%}.ca-list{max-height:240px;overflow:auto}.ca-line{padding:5px;border-bottom:1px solid #31466c;font-size:13px}.ca-positive{color:#9bebc6}.ca-warning{color:#ffca8c}.ca-match{display:block;color:#8de5bf;font-size:12px;margin-top:3px}.ca-preview{position:fixed;inset:0;background:#030a19bd;z-index:1500;display:grid;place-items:center;padding:18px}.ca-preview[hidden]{display:none}.ca-preview-card{position:relative;background:#142744;border:1px solid #9cb9ef;border-radius:13px;max-height:90vh;overflow:auto;width:min(420px,95vw);padding:14px;text-align:center}.ca-preview-card img{max-height:60vh;max-width:100%;object-fit:contain}.ca-preview-card button{display:block;margin:0 0 8px auto;background:#30496e;color:white;border:1px solid #94b5dc;border-radius:7px;padding:7px 12px;cursor:pointer}';
 document.head.append(css);
 const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
 const isBasic=c=>(c.subtypes||[]).some(s=>s==='Basic'||s==='Baby')||(!c.evolvesFrom&&c.supertype==='Pokémon');
 const stage=c=>c.supertype!=='Pokémon'?'Trainer':(c.subtypes||[]).includes('Stage 2')?'Stage 2':c.evolvesFrom?'Stage 1':isBasic(c)?'Basic':'Other';
 const el=(tag,cls,txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node;};
 let root=null,pickPanel=null,healthPanel=null,preview=null,last={};
 function ensure(){
  if(root)return;
  root=el('div','ca-panel');root.id='cubeComposition';root.append(el('h3','', 'Cube composition'),el('div','ca-muted','The full generated pool, including duplicate copies.'),el('div','ca-chips'));
  const trigger=document.querySelector('.cube-pool-open');
  if(trigger)trigger.insertAdjacentElement('afterend',root);else document.body.prepend(root);
  pickPanel=el('div','ca-panel');pickPanel.append(el('h3','','Drafted cards'),el('p','ca-muted','Hold a pack card to inspect it without selecting it. On desktop, right-click or press I while focused.'));
  const selector=el('select','ca-control');selector.setAttribute('aria-label','Organize drafted cards');
  for(const [v,t] of [['history','Pick order'],['type','By type'],['stage','By evolution stage'],['family','By evolution family']]){const o=el('option','',t);o.value=v;selector.append(o);}
  selector.addEventListener('change',()=>drawPicks());pickPanel.append(selector,el('div','ca-list'));
  const solo=document.getElementById('drafted'),room=document.getElementById('picks');
  if(solo){solo.insertAdjacentElement('afterend',pickPanel);solo.style.display='none';}
  else if(room){room.insertAdjacentElement('afterend',pickPanel);room.style.display='none';}
  healthPanel=el('div','ca-panel');healthPanel.append(el('h3','','Deck health'),el('div','ca-chips'),el('div','ca-muted'));
  pickPanel.insertAdjacentElement('afterend',healthPanel);
  preview=el('div','ca-preview');preview.hidden=true;preview.setAttribute('role','dialog');preview.setAttribute('aria-modal','true');preview.setAttribute('aria-label','Card preview');
  preview.addEventListener('click',e=>{if(e.target===preview)closePreview();});
  document.body.append(preview);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!preview.hidden)closePreview();});
 }
 function drawComposition(){
  const pool=last.pool||[],chips=root.querySelector('.ca-chips');chips.replaceChildren();
  const stat=(name,n)=>chips.append(el('span','ca-chip',name+': '+n));
  stat('Cards',pool.length);stat('Unique printings',new Set(pool.map(c=>c.id)).size);
  stat('Pokémon',pool.filter(c=>c.supertype==='Pokémon').length);
  stat('Trainers',pool.filter(c=>c.supertype==='Trainer').length);
  stat('Basics',pool.filter(c=>c.supertype==='Pokémon'&&isBasic(c)).length);
  stat('Evolutions',pool.filter(c=>c.supertype==='Pokémon'&&!isBasic(c)).length);
  for(const t of TYPES){const n=pool.filter(c=>(c.types||[]).includes(t)).length;if(n)stat(t,n);}
 }
 function drawPicks(){
  const picks=last.drafted||[],selector=pickPanel.querySelector('select'),group=selector.value,box=pickPanel.querySelector('.ca-list');box.replaceChildren();
  const rows=picks.map((c,i)=>({c,i,key:group==='type'?(c.types||[])[0]||c.supertype:group==='stage'?stage(c):group==='family'?c.evolvesFrom||c.name:String(i).padStart(3,'0')}));
  if(group!=='history')rows.sort((a,b)=>a.key.localeCompare(b.key)||a.c.name.localeCompare(b.c.name));
  let prior='';
  rows.forEach(({c,i,key})=>{
   if(group!=='history'&&key!==prior){box.append(el('strong','ca-line',key));prior=key;}
   const b=el('button','ca-line',(i+1)+'. '+c.name);b.type='button';b.style.cssText='display:block;width:100%;text-align:left;background:transparent;color:inherit;border-left:0;border-right:0;border-top:0;cursor:pointer';
   b.addEventListener('click',()=>openPreview(c));box.append(b);
  });
  if(!rows.length)box.append(el('p','ca-muted','Your picks will appear here.'));
 }
 function drawHealth(){
  const cards=last.drafted||[],deck=last.deck||[],chosen=deck.length?deck.map(id=>cards.find(c=>c.id===id)).filter(Boolean):cards;
  const chips=healthPanel.querySelector('.ca-chips'),note=healthPanel.querySelector('.ca-muted');chips.replaceChildren();
  const mon=chosen.filter(c=>c.supertype==='Pokémon'),basics=mon.filter(isBasic),evolutions=mon.filter(c=>!isBasic(c)),trainers=chosen.filter(c=>c.supertype==='Trainer');
  for(const [name,n] of [['Deck cards',deck.length||'—'],['Basics',basics.length],['Evolutions',evolutions.length],['Trainers',trainers.length]])chips.append(el('span','ca-chip',name+': '+n));
  const missing=evolutions.filter(c=>!mon.some(p=>p.name===c.evolvesFrom));
  const needed=[...new Set(mon.flatMap(c=>(c.attacks||[]).flatMap(a=>(a.cost||[]).filter(t=>TYPES.includes(t)))))];
  const lines=[];
  if(!basics.length)lines.push('No Basic Pokémon selected yet.');
  if(missing.length)lines.push(missing.length+' evolution card(s) without a matching lower stage: '+[...new Set(missing.map(c=>c.name))].slice(0,4).join(', '));
  if(needed.length)lines.push('Attack Energy colors: '+needed.join(', '));
  if(deck.length){const energyCount=deck.length-chosen.length;lines.push('Basic Energy cards: '+energyCount);if(deck.length!==40)lines.push('Deck needs '+(40-deck.length)+' cards to reach 40.');}
  note.textContent=(deck.length?'Current deck · ':'Current draft · ')+(lines.join(' ')||'No obvious evolution gaps detected.')+' Energy quantities are not validated here.';
  note.className='ca-muted '+(missing.length||!basics.length?'ca-warning':'ca-positive');
 }
 function closePreview(){preview.hidden=true;preview.replaceChildren();}
 function openPreview(c){
  preview.replaceChildren();const box=el('div','ca-preview-card'),close=el('button','','Close');close.type='button';close.onclick=closePreview;
  const img=el('img');img.alt=c.name;img.src='/api/cube-card-image/'+encodeURIComponent(c.id);img.onerror=()=>img.remove();
  box.append(close,img,el('strong','',c.name),el('p','ca-muted',c.supertype+' · '+(c.types||[]).join(', ')));
  if(c.evolvesFrom)box.append(el('p','ca-match','Evolves from '+c.evolvesFrom));
  const count=(last.drafted||[]).filter(x=>x.name===c.evolvesFrom).length;
  if(count)box.append(el('p','ca-positive','You drafted '+count+' × '+c.evolvesFrom));
  if(c.attacks?.length)box.append(el('p','ca-muted',c.attacks.map(a=>a.name+' ('+(a.cost||[]).join(', ')+')').join(' · ')));
  preview.append(box);preview.hidden=false;close.focus();
 }
 function highlight(){
  const cards=last.pack||[],drafted=last.drafted||[];
  const buttons=[...document.querySelectorAll('#pack button.card')];
  buttons.forEach((btn,i)=>{
   const c=cards[i];if(!c)return;
   const current=cards.find(p=>p.id===btn.dataset.caId)||cards[i];
   const count=current.evolvesFrom?drafted.filter(p=>p.name===current.evolvesFrom).length:0;
   let tag=btn.querySelector('.ca-match');if(tag)tag.remove();
   if(count){tag=el('span','ca-match','✓ '+count+' '+current.evolvesFrom+' drafted');btn.append(tag);}
   if(!btn.dataset.caPreview){
    btn.dataset.caPreview='1';
    const show=()=>{const card=last.pack?.find(x=>x.id===btn.dataset.caId);if(card)openPreview(card);};
    btn.addEventListener('contextmenu',e=>{e.preventDefault();show();});
    btn.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='i'){e.preventDefault();show();}});
    let timer=null,suppress=false;
    btn.addEventListener('touchstart',()=>{suppress=false;clearTimeout(timer);timer=setTimeout(()=>{suppress=true;show();},550);},{passive:true});
    btn.addEventListener('touchend',()=>clearTimeout(timer),{passive:true});
    btn.addEventListener('touchcancel',()=>{clearTimeout(timer);suppress=false;},{passive:true});
    btn.addEventListener('touchmove',()=>clearTimeout(timer),{passive:true});
    btn.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopImmediatePropagation();suppress=false;}},true);
    btn.setAttribute('title',(btn.title?btn.title+' · ':'')+'Hold to inspect card · Press I to inspect');
   }
   btn.dataset.caId=c.id;
  });
 }
 window.CubeAnalysis={update({pool,drafted,pack,deck}){
  ensure();last={pool:pool||[],drafted:drafted||[],pack:pack||[],deck:deck||[]};
  root.hidden=!pool;pickPanel.hidden=!pool;healthPanel.hidden=!pool;
  if(!pool)return;
  const builder=document.getElementById('builder'),roomBuilder=document.getElementById('deckArea');
  const activeBuild=(builder&&!builder.classList.contains('hidden')?builder:null)||(roomBuilder&&!roomBuilder.classList.contains('hidden')?roomBuilder:null);
  if(activeBuild){if(healthPanel.parentElement!==activeBuild)activeBuild.insertBefore(healthPanel,activeBuild.firstChild);}
  else if(healthPanel.previousElementSibling!==pickPanel)pickPanel.insertAdjacentElement('afterend',healthPanel);
  drawComposition();drawPicks();drawHealth();highlight();
 },preview:openPreview};
})();