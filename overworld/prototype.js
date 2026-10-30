'use strict';
(() => {
  const config=window.NeoOverworld, byId=id=>document.getElementById(id);
  const camera=byId('camera'), world=byId('world'), edges=byId('edges'), dialog=byId('dialog');
  const params=new URLSearchParams(location.search), poseTest=params.has('reina-test'), dev=params.has('dev');

  if(params.has('sprite-gallery')){
    const spriteCharacterIds=['yuna','hana','laca','rina','akari','shiori','camila','marina','kaede'];
    const locationOptions=[['arcade','Pixel Palace'],['shop','The Lucky Draw'],['home','Home'],['park','Riverside Park'],['cafe','The Rest Stop'],['center','Community Center'],['library','Library']];
    const entries=spriteCharacterIds.flatMap(id=>{
      const character=config.characters?.[id];
      return Object.entries(character?.poses||{}).map(([poseKey,art])=>({id,name:character.name,poseKey,art}));
    }).filter(entry=>entry.art?.src);
    const storageKey='neoOverworldSpritePlacementSuggestionsV1';
    let suggestions={};try{suggestions=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{}
    document.getElementById('shell')?.setAttribute('hidden','');
    document.body.classList.add('neo-sprite-gallery-open');
    const style=document.createElement('style');
    style.textContent=`
      body.neo-sprite-gallery-open{margin:0;background:#100f1c;color:#f7eefb;font:15px system-ui,sans-serif}
      #neoSpriteGallery{position:fixed;inset:0;z-index:100;background:radial-gradient(ellipse at top,#29213a,#100f1c 65%);overflow:auto;padding:clamp(14px,3vw,34px);box-sizing:border-box}
      #neoSpriteGallery .top{max-width:1500px;margin:0 auto 22px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
      #neoSpriteGallery h1{font-size:clamp(24px,4vw,38px);margin:0 0 6px}
      #neoSpriteGallery p{margin:0;color:#d9cce2}
      #neoSpriteGallery .tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      #neoSpriteGallery button,#neoSpriteGallery select{font:inherit;color:#fff;background:#30253f;border:1px solid #a87da9;border-radius:9px;padding:9px 12px}
      #neoSpriteGallery a{color:#f5d4ff}
      #neoSpriteGallery .section{max-width:1500px;margin:28px auto}
      #neoSpriteGallery h2{font-size:22px;margin:0 0 12px;border-bottom:1px solid #755f7c;padding-bottom:7px}
      #neoSpriteGallery .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
      #neoSpriteGallery .card{background:#1c1927;border:1px solid #5c4b66;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;min-width:0}
      #neoSpriteGallery .art{height:242px;display:grid;place-items:center;border:1px solid #51465b;border-radius:8px;background-color:#272332;background-image:linear-gradient(45deg,#383344 25%,transparent 25%),linear-gradient(-45deg,#383344 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#383344 75%),linear-gradient(-45deg,transparent 75%,#383344 75%);background-size:18px 18px;background-position:0 0,0 9px,9px -9px,-9px 0;overflow:hidden}
      #neoSpriteGallery .art img{max-height:230px;max-width:100%;object-fit:contain}
      #neoSpriteGallery .pose{font-weight:700}
      #neoSpriteGallery code{font-size:11px;color:#d2bfd9;overflow-wrap:anywhere}
      #neoSpriteGallery .card select{width:100%;font-size:13px}
      #neoSpriteGallery .note{max-width:1500px;margin:0 auto 20px;color:#e2cde9}
      #neoSpriteGallery .status{max-width:1500px;margin:10px auto;color:#ffe5a9;white-space:pre-wrap}
      @media(max-width:560px){#neoSpriteGallery .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#neoSpriteGallery .card{padding:7px}#neoSpriteGallery .art{height:205px}#neoSpriteGallery .art img{max-height:194px}}
    `;
    document.head.append(style);
    const gallery=document.createElement('main');gallery.id='neoSpriteGallery';
    const top=document.createElement('header');top.className='top';
    const titleWrap=document.createElement('div');
    const title=document.createElement('h1');title.textContent='Overworld sprite gallery';
    const sub=document.createElement('p');sub.textContent=entries.length+' sprite poses · 9 characters';
    titleWrap.append(title,sub);
    const tools=document.createElement('div');tools.className='tools';
    const back=document.createElement('a');back.href='overworld-prototype.html?cast-test=1';back.textContent='← Back to map preview';
    const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent='Download map suggestions';
    const clearButton=document.createElement('button');clearButton.type='button';clearButton.textContent='Clear suggestions';
    tools.append(back,exportButton,clearButton);top.append(titleWrap,tools);
    const note=document.createElement('p');note.className='note';note.textContent='Choose a suggested map for each pose you want placed. Suggestions stay in this browser; download the JSON to send them to me. This does not move characters in the game by itself.';
    const status=document.createElement('p');status.className='status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const filter=document.createElement('select');filter.setAttribute('aria-label','Filter sprites by character');
    filter.add(new Option('All characters','all'));
    for(const id of spriteCharacterIds)filter.add(new Option(config.characters[id].name,id));
    const filterWrap=document.createElement('div');filterWrap.className='tools';filterWrap.style.maxWidth='1500px';filterWrap.style.margin='0 auto 14px';filterWrap.append(filter);
    const sections=document.createElement('div');
    function saveSuggestion(key,value){if(value)suggestions[key]=value;else delete suggestions[key];localStorage.setItem(storageKey,JSON.stringify(suggestions));}
    function renderGallery(){
      sections.replaceChildren();
      for(const id of spriteCharacterIds){
        if(filter.value!=='all'&&filter.value!==id)continue;
        const group=entries.filter(entry=>entry.id===id);
        const section=document.createElement('section');section.className='section';
        const heading=document.createElement('h2');heading.textContent=config.characters[id].name+' · '+group.length+' poses';section.append(heading);
        const grid=document.createElement('div');grid.className='grid';
        for(const entry of group){
          const card=document.createElement('article');card.className='card';
          const artBox=document.createElement('div');artBox.className='art';
          const img=document.createElement('img');img.loading='lazy';img.src=entry.art.src;img.alt=config.characters[id].name+' · '+entry.poseKey;
          img.onerror=()=>{img.hidden=true;artBox.textContent='Image failed to load';};
          artBox.append(img);
          const poseName=document.createElement('div');poseName.className='pose';poseName.textContent=entry.poseKey.replace(/([A-Z])/g,' $1').replace(/[-_]/g,' ').trim();
          const path=document.createElement('code');path.textContent=decodeURIComponent(entry.art.src).replace(/^\//,'');
          const mapSelect=document.createElement('select');mapSelect.setAttribute('aria-label','Suggested map for '+config.characters[id].name+' '+entry.poseKey);
          mapSelect.add(new Option('Suggest a map…',''));
          for(const [mapId,mapName] of locationOptions)mapSelect.add(new Option(mapName,mapId));
          const key=id+':'+entry.poseKey;mapSelect.value=suggestions[key]||'';
          mapSelect.onchange=()=>{saveSuggestion(key,mapSelect.value);status.textContent='Saved '+Object.keys(suggestions).length+' map suggestion(s) in this browser.';};
          card.append(artBox,poseName,path,mapSelect);grid.append(card);
        }
        section.append(grid);sections.append(section);
      }
    }
    filter.onchange=renderGallery;
    exportButton.onclick=()=>{
      const selected=Object.entries(suggestions).map(([key,mapId])=>{const [character,pose]=key.split(':');return {character,pose,map:mapId,src:config.characters[character].poses[pose].src};});
      if(!selected.length){status.textContent='Choose at least one map suggestion first.';return;}
      const blob=new Blob([JSON.stringify({suggestions:selected},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='overworld-sprite-map-suggestions.json';link.click();URL.revokeObjectURL(url);
      status.textContent='Downloaded '+selected.length+' map suggestion(s).';
    };
    clearButton.onclick=()=>{suggestions={};localStorage.removeItem(storageKey);renderGallery();status.textContent='Cleared saved map suggestions.';};
    gallery.append(top,note,filterWrap,status,sections);document.body.append(gallery);renderGallery();
    return;
  }
  // When the parent RPG shows VN dialogue, preserve the location as a backdrop
  // but remove map NPC portraits, edge indicators and hotspots from the scene.
  // This message is only trusted from the same-origin parent of integrated mode.
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==window.parent||!params.has('rpg-integration'))return;
    if(event.data?.type!=='neo-overworld-story-visibility')return;
    document.body.classList.toggle('neo-overworld-dialogue',event.data.hidden===true);
  });
  if(params.has('rpg-integration'))document.body.classList.add('neo-overworld-embedded');
  // When the parent RPG shows VN dialogue, preserve the location as a backdrop
  // but remove map NPC portraits, edge indicators and hotspots from the scene.
  // This message is only trusted from the same-origin parent of integrated mode.
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==window.parent||!params.has('rpg-integration'))return;
    if(event.data?.type!=='neo-overworld-story-visibility')return;
    document.body.classList.toggle('neo-overworld-dialogue',event.data.hidden===true);
  });
  if(params.has('rpg-integration'))document.body.classList.add('neo-overworld-embedded');
  const shopTest=params.has('shop-test'),requestedScene=params.get('scene'),sceneId=config[requestedScene]?.image?requestedScene:(shopTest?'shop':'arcade'),map=config[sceneId];
  byId('mapArt').src=map.image;byId('mapArt').alt=map.title;byId('world').style.width=map.width+'px';byId('world').style.height=map.height+'px';
  document.querySelector('.title strong').textContent=map.title;
  if(map.blueprint)document.querySelector('#bottom p').textContent='Temporary spatial blueprint · Final artwork not installed yet.';else if(shopTest)document.querySelector('#bottom p').textContent='Illustration candidate · placement under review.';
  const placements=poseTest ? [
    {id:'reina',anchor:'P1',pose:'standing',foot:{x:665,y:465},previewKey:'standing'},
    {id:'reina',anchor:'E1',pose:'arcade',foot:{x:245,y:430},previewKey:'arcade'}
  ] : map.blueprint ? [{id:'reina',anchor:'P1',pose:'standing'},{id:'yuna',anchor:'P2',pose:'standing'},{id:'barb',anchor:'P3',pose:'standing'}] : shopTest ? config.shopPreview : params.has('art-test') ? config.artPreview : params.has('cast-test') ? config.preview : config.preview.filter(p=>p.id==='reina');
  // Integrated mode displays only NPCs currently scheduled here by the RPG.
  // Reuse stable anchor slots and do not invent story encounters.
  if(params.has('rpg-integration')){
    const castEntries=(params.get('cast')||'').split(',').map(entry=>{
      const [id,requestedPose]=entry.split(':');
      if(!/^[a-z][a-z0-9_-]{0,35}$/.test(id||''))return null;
      const knownPose=!!config.characters?.[id]?.poses?.[requestedPose];
      return {id,pose:knownPose?requestedPose:'standing'};
    }).filter(Boolean);
    placements.splice(0,placements.length,...castEntries.slice(0,8).map(({id,pose},i)=>({id,anchor:['P1','P2','P3','P4','E1','E2','E3','E4'][i],pose})));
    const subtitle=document.querySelector('.title small');if(subtitle)subtitle.textContent='Live RPG schedule · placement preview';
  }
  if(dev){byId('guides').hidden=false;}
  let zoom=1,ox=0,oy=0,drag=null,ignoreClick=false,toastTimer;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const point=p=>p.foot||map.anchors[p.anchor];
  const person=p=>config.characters[p.id]||{name:p.id.replace(/(^|[_-])([a-z])/g,(_,sep,letter)=>' '+letter.toUpperCase()).trim(),face:'',poses:{}};
  const pose=p=>person(p).poses?.[p.pose||'standing'];
  const face=p=>person(p).face||'';
  const chibiMode=params.has('rpg-integration')&&params.get('chibi')==='1';
  const reinaChibi='/rpg-assets/characters/reina/chibi/front.png';
  const chibiPaths=id=>['/rpg-assets/characters/'+id+'/discreet/neutral.webp','/rpg-assets/characters/'+id+'/discreet/neutral.png','/rpg-assets/characters/'+id+'/chibi/front.png',reinaChibi];
  function loadChibi(img,id){const paths=chibiPaths(id);let index=0;const next=()=>{if(index>=paths.length){img.onerror=null;img.removeAttribute('src');return;}img.src=paths[index++];};img.onerror=next;next();}

  function bound(){const w=camera.clientWidth,h=camera.clientHeight;ox=map.width*zoom>w?clamp(ox,w-map.width*zoom,0):(w-map.width*zoom)/2;oy=map.height*zoom>h?clamp(oy,h-map.height*zoom,0):(h-map.height*zoom)/2;}
  function paint(){bound();world.style.transform=`translate(${ox}px,${oy}px) scale(${zoom})`;edges.replaceChildren();
    const w=camera.clientWidth,h=camera.clientHeight,margin=28,top=80,bottom=110;
    for(const p of placements){const pos=point(p),x=ox+pos.x*zoom,y=oy+(pos.y-(pose(p)?.height||130)/2)*zoom;
      if(x>=margin&&x<=w-margin&&y>=top&&y<=h-bottom)continue;
      const dx=x-w/2,dy=y-h/2,ratio=Math.max(1,Math.abs(dx)/(w/2-margin),Math.abs(dy)/(h/2-top));
      const ex=clamp(w/2+dx/ratio,margin,w-margin),ey=clamp(h/2+dy/ratio,top,h-bottom);
      const b=document.createElement('button');b.className='edge';b.style.left=ex+'px';b.style.top=ey+'px';b.title=`Find ${person(p).name}${p.previewKey?' · '+p.previewKey:''}`;b.setAttribute('aria-label',b.title);
      const img=document.createElement('img');if(chibiMode){loadChibi(img,p.id);}else{img.src=face(p);img.onerror=()=>{img.remove();b.insertAdjacentText('afterbegin',person(p).name[0])};}img.alt='';
      const arrow=document.createElement('b');arrow.textContent=Math.abs(dx)>Math.abs(dy)?(dx>0?'›':'‹'):(dy>0?'⌄':'⌃');b.append(img,arrow);b.onclick=()=>focus(p);edges.appendChild(b);
    }
  }
  function focus(p){const pt=point(p);ox=camera.clientWidth/2-pt.x*zoom;oy=camera.clientHeight/2-(pt.y-60)*zoom;world.style.transition='transform .3s ease-out';paint();setTimeout(()=>world.style.transition='',320);}
  function center(){zoom=clamp(Math.max(camera.clientWidth/map.initial.viewWidth,camera.clientHeight/map.initial.viewHeight),.52,1.05);const initialReina=map.id==='arcade'?placements.find(p=>p.id==='reina'&&p.pose==='arcade'):null;const target=(poseTest||(!shopTest&&!params.has('art-test')&&!params.has('cast-test')))&&initialReina?point(initialReina):map.initial;ox=camera.clientWidth/2-target.x*zoom;oy=camera.clientHeight/2-(target.y-55)*zoom;paint();}
  function toast(message){const t=byId('toast');t.textContent=message;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,3500);}
  function openPerson(p){if(ignoreClick)return;if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'person',id:p.id},location.origin);return;}byId('dialogName').textContent=person(p).name+(p.previewKey?' · '+p.previewKey:'');const img=byId('dialogImg');img.src=face(p);img.alt=person(p).name;img.onerror=()=>img.hidden=true;img.hidden=false;dialog.hidden=false;byId('close').focus();}
  for(const p of placements){const pt=point(p),art=pose(p),b=document.createElement('button');b.className='anchor';b.style.left=pt.x+'px';b.style.top=pt.y+'px';b.dataset.character=p.id;b.dataset.pose=p.pose||'standing';b.dataset.foot=`${pt.x}, ${pt.y}`;b.title=`Interact with ${person(p).name}`;b.setAttribute('aria-label',b.title);
    const img=document.createElement('img');img.className='sprite';img.alt='';if(chibiMode){loadChibi(img,p.id);b.style.setProperty('--sprite-height','130px');}else if(art){img.src=art.src;b.style.setProperty('--sprite-height',art.height+'px');}else{b.classList.add('missing');b.style.setProperty('--sprite-height','130px');}
    if(!chibiMode)img.onerror=()=>{b.classList.add('missing');toast('Artwork not loading: '+person(p).name+' · '+(p.pose||'standing'));};const fallback=document.createElement('span');fallback.className='fallback';fallback.textContent=person(p).name[0];const name=document.createElement('span');name.className='name';name.textContent=person(p).name;b.append(img,fallback,name);b.onclick=()=>openPerson(p);world.appendChild(b);
  }
  for(const h of map.hotspots){const b=document.createElement('button');b.className='hotspot';Object.assign(b.style,{left:h.x+'px',top:h.y+'px',width:h.w+'px',height:h.h+'px'});b.setAttribute('aria-label','Explore '+h.label);b.title=h.label;const label=document.createElement('span');label.textContent=h.label;b.append(label);b.onclick=()=>{if(ignoreClick)return;if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'hotspot',id:h.id},location.origin);return;}toast(h.label+' · activity connection pending')};world.appendChild(b);}
  camera.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button')||!dialog.hidden)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox,oy,moved:false};camera.setPointerCapture(e.pointerId);camera.classList.add('dragging')});
  camera.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;ox=drag.ox+dx;oy=drag.oy+dy;paint()});
  function endDrag(e){if(!drag||e.pointerId!==drag.id)return;ignoreClick=drag.moved;drag=null;camera.classList.remove('dragging');if(ignoreClick)setTimeout(()=>ignoreClick=false,80);}
  camera.addEventListener('pointerup',endDrag);camera.addEventListener('pointercancel',endDrag);
  camera.addEventListener('wheel',e=>{if(!e.ctrlKey||!dialog.hidden)return;e.preventDefault();const old=zoom,z=clamp(zoom*(e.deltaY<0?1.08:.92),.48,3.4),r=camera.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;ox=x-(x-ox)*z/old;oy=y-(y-oy)*z/old;zoom=z;paint()},{passive:false});
  byId('reset').onclick=center;byId('guides').onclick=()=>{document.body.classList.toggle('show-guides');byId('guides').setAttribute('aria-pressed',String(document.body.classList.contains('show-guides')))};
  byId('close').onclick=()=>{dialog.hidden=true};for(const id of ['activities','events','deck','status'])byId(id).onclick=()=>{if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'navigation',id},location.origin);return;}toast(id+' opens in the existing RPG; this map is a placement preview');};
  addEventListener('resize',center);center();
  window.__overworldPreview={map,placements,center,focus};
})();
