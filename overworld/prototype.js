'use strict';
(() => {
  const config=window.NeoOverworld, byId=id=>document.getElementById(id);
  const camera=byId('camera'), world=byId('world'), edges=byId('edges'), dialog=byId('dialog');
  const params=new URLSearchParams(location.search), poseTest=params.has('reina-test'), dev=params.has('dev');
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
  // Map-placement QA mode is explicit (?dev=1), never enabled during RPG play.
  // Copies layout data so artist adjustments never mutate shared engine state.
  const layoutDev=dev&&!params.has('rpg-integration');
  const layoutKey='neo-campus-overworld-placement-'+sceneId+'-v1';
  const savedLayout=layoutDev?(()=>{try{return JSON.parse(localStorage.getItem(layoutKey)||'null')}catch{return null}})():null;
  if(layoutDev&&savedLayout){
    for(const [id,pt] of Object.entries(savedLayout.anchors||{})){
      if(map.anchors[id]&&Number.isFinite(pt.x)&&Number.isFinite(pt.y))map.anchors[id]={x:pt.x,y:pt.y};
    }
    for(const hotspot of map.hotspots){
      const saved=savedLayout.hotspots?.[hotspot.id];
      if(saved&&['x','y','w','h'].every(k=>Number.isFinite(saved[k])))Object.assign(hotspot,saved);
    }
  }

  // Prefer installed art under a predictable canonical location path.
  // The repo may still contain only a blueprint; never display a broken map.
  const mapArt=byId('mapArt');
  const canonicalBase='/rpg-assets/locations/'+map.id+'/overworld-map';
  const candidates=map.blueprint?
    [canonicalBase+'.webp',canonicalBase+'.png',canonicalBase+'.jpg',map.image]:
    [map.image];
  let candidateIndex=0;
  function setMapSource(index){
    candidateIndex=index;
    mapArt.src=candidates[index];
  }
  function setMapStatus(source){
    const footer=document.querySelector('#bottom p');
    if(!footer)return;
    const fallback=source===map.image&&!!map.blueprint;
    footer.textContent=fallback?'Temporary spatial blueprint · Final artwork not installed yet.':
      (map.blueprint?'Installed location artwork · RPG schedule active':'Location artwork · RPG schedule active');
    document.body.classList.toggle('neo-overworld-blueprint',fallback);
  }
  mapArt.addEventListener('load',()=>setMapStatus(candidates[candidateIndex]));
  mapArt.addEventListener('error',()=>{
    if(candidateIndex+1<candidates.length)setMapSource(candidateIndex+1);
    else{
      const footer=document.querySelector('#bottom p');
      if(footer)footer.textContent='Location map image missing. Check the published GitHub asset paths.';
      document.body.classList.add('neo-overworld-missing-map');
    }
  });
  mapArt.alt=map.title;
  setMapSource(0);
  byId('world').style.width=map.width+'px';byId('world').style.height=map.height+'px';
  document.querySelector('.title strong').textContent=map.title;
  if(shopTest)document.querySelector('#bottom p').textContent='Illustration candidate · placement under review.';
  const placements=poseTest ? [
    {id:'reina',anchor:'P1',pose:'standing',foot:{x:665,y:465},previewKey:'standing'},
    {id:'reina',anchor:'E1',pose:'arcade',foot:{x:245,y:430},previewKey:'arcade'}
  ] : map.blueprint ? [{id:'reina',anchor:'P1',pose:'standing'},{id:'yuna',anchor:'P2',pose:'standing'},{id:'barb',anchor:'P3',pose:'standing'}] : shopTest ? config.shopPreview : params.has('art-test') ? config.artPreview : params.has('cast-test') ? config.preview : config.preview.filter(p=>p.id==='reina');
  // Integrated mode displays only NPCs currently scheduled here by the RPG.
  // Reuse stable anchor slots and do not invent story encounters.
  if(params.has('rpg-integration')){
    const castIds=(params.get('cast')||'').split(',').filter(id=>/^[a-z][a-z0-9_-]{0,35}$/.test(id));
    placements.splice(0,placements.length,...castIds.slice(0,8).map((id,i)=>({id,anchor:['P1','P2','P3','P4','E1','E2','E3','E4'][i],pose:'standing'})));
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
  for(const h of map.hotspots){const b=document.createElement('button');b.className='hotspot';b.dataset.hotspotId=h.id;
    const rect={x:clamp(h.x,0,map.width-24),y:clamp(h.y,0,map.height-24),w:Math.max(24,Math.min(h.w,map.width-clamp(h.x,0,map.width-24))),h:Math.max(24,Math.min(h.h,map.height-clamp(h.y,0,map.height-24)))};
    // Normalize legacy zones to image bounds before placing or editing them.
    // Earlier Pixel Palace rectangles extended beyond the source canvas.
    Object.assign(h,rect);
    // On published maps, an explicit small tap target is safer than a huge
    // invisible rectangle covering benches, NPCs, or unrelated objects.
    // The development editor still uses the full adjustable hotspot region.
    const pin=!layoutDev; // Consistent, non-obscuring landmarks across all seven locations, including Pixel Palace.
    if(pin){b.classList.add('neo-hotspot-pin');Object.assign(b.style,{left:clamp(rect.x+rect.w/2,30,map.width-30)+'px',top:clamp(rect.y+rect.h/2,30,map.height-30)+'px',width:'56px',height:'56px'});}
    else Object.assign(b.style,{left:rect.x+'px',top:rect.y+'px',width:rect.w+'px',height:rect.h+'px'});
    b.setAttribute('aria-label','Explore '+h.label);b.title=h.label;const label=document.createElement('span');label.textContent=h.label;b.append(label);b.onclick=()=>{if(ignoreClick)return;if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'hotspot',id:h.id},location.origin);return;}toast(h.label+' · activity connection pending')};world.appendChild(b);}
  camera.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button')||!dialog.hidden)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox,oy,moved:false};camera.setPointerCapture(e.pointerId);camera.classList.add('dragging')});
  camera.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;ox=drag.ox+dx;oy=drag.oy+dy;paint()});
  function endDrag(e){if(!drag||e.pointerId!==drag.id)return;ignoreClick=drag.moved;drag=null;camera.classList.remove('dragging');if(ignoreClick)setTimeout(()=>ignoreClick=false,80);}
  camera.addEventListener('pointerup',endDrag);camera.addEventListener('pointercancel',endDrag);
  camera.addEventListener('wheel',e=>{if(!e.ctrlKey||!dialog.hidden)return;e.preventDefault();const old=zoom,z=clamp(zoom*(e.deltaY<0?1.08:.92),.48,1.7),r=camera.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;ox=x-(x-ox)*z/old;oy=y-(y-oy)*z/old;zoom=z;paint()},{passive:false});
  byId('reset').onclick=center;byId('guides').onclick=()=>{document.body.classList.toggle('show-guides');byId('guides').setAttribute('aria-pressed',String(document.body.classList.contains('show-guides')))};
  byId('close').onclick=()=>{dialog.hidden=true};for(const id of ['activities','events','deck','status'])byId(id).onclick=()=>{if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'navigation',id},location.origin);return;}toast(id+' opens in the existing RPG; this map is a placement preview');};
  if(layoutDev){
    document.body.classList.add('neo-overworld-layout-editor','show-guides');
    const panel=document.createElement('aside');panel.id='neoLayoutEditor';
    panel.style.cssText='position:fixed;z-index:25;top:85px;right:12px;width:min(330px,calc(100vw - 24px));padding:12px;background:#18152eeb;border:1px solid #d6a6d9;color:white;border-radius:12px;display:grid;gap:7px;font:13px system-ui';
    const heading=document.createElement('strong');heading.textContent='Placement editor · '+map.title;
    const desc=document.createElement('p');desc.style.margin='0';desc.textContent='Drag the blue foot markers or dashed hotspot zones to align them with the painting. Changes are local until exported.';
    const exportBtn=document.createElement('button');exportBtn.type='button';exportBtn.textContent='Copy layout JSON';
    const resetBtn=document.createElement('button');resetBtn.type='button';resetBtn.textContent='Clear saved adjustments';
    const exportHint=document.createElement('small');exportHint.textContent='Blue circles: NPC foot placement · orange corners: resize hotspots';
    const status=document.createElement('small');status.setAttribute('role','status');status.textContent='No game data is changed.';
    panel.append(heading,desc,exportHint,exportBtn,resetBtn,status);document.body.append(panel);
    const anchorLayer=document.createElement('div');anchorLayer.id='neoLayoutAnchors';anchorLayer.style.cssText='position:absolute;inset:0;pointer-events:none';world.append(anchorLayer);
    const markerStyle=document.createElement('style');markerStyle.textContent=`
      body.neo-overworld-layout-editor #neoLayoutAnchors .neo-layout-anchor{pointer-events:auto;position:absolute;translate:-50% -100%;width:29px;height:29px;display:grid;place-items:center;background:#193b82dd;color:#fff;border:2px solid #b9ddff;border-radius:50%;font:700 10px system-ui;cursor:grab;touch-action:none;z-index:14}
      body.neo-overworld-layout-editor .hotspot{outline:2px dashed #eeaf55!important;touch-action:none;cursor:move!important}
      body.neo-overworld-layout-editor .anchor{pointer-events:none!important}
      body.neo-overworld-layout-editor #neoLayoutEditor button{border:1px solid #9b7cbd;background:#473659;color:white;border-radius:7px;padding:8px;cursor:pointer}
    `;document.head.append(markerStyle);
    const persist=()=>{
      const anchors=Object.fromEntries(Object.entries(map.anchors).map(([id,p])=>[id,{x:Math.round(p.x),y:Math.round(p.y)}]));
      const hotspots=Object.fromEntries(map.hotspots.map(h=>[h.id,{x:Math.round(h.x),y:Math.round(h.y),w:Math.round(h.w),h:Math.round(h.h)}]));
      const layout={location:sceneId,width:map.width,height:map.height,anchors,hotspots};
      localStorage.setItem(layoutKey,JSON.stringify(layout));status.textContent='Saved locally · Copy layout JSON to share changes';
      return layout;
    };
    function draggable(el,point,update){
      let held=null;
      el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();held={id:e.pointerId,x:e.clientX,y:e.clientY,point:{...point}};el.setPointerCapture(e.pointerId)});
      el.addEventListener('pointermove',e=>{if(!held||e.pointerId!==held.id)return;
        const x=Math.round(clamp(held.point.x+(e.clientX-held.x)/zoom,0,map.width-(el.classList.contains('hotspot')?point.w:0)));
        const y=Math.round(clamp(held.point.y+(e.clientY-held.y)/zoom,0,map.height-(el.classList.contains('hotspot')?point.h:0)));
        update(x,y);paint();
      });
      const finish=e=>{if(!held||e.pointerId!==held.id)return;held=null;persist()};
      el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
    }
    for(const [id,pt] of Object.entries(map.anchors)){
      const marker=document.createElement('button');marker.type='button';marker.className='neo-layout-anchor';marker.textContent=id;marker.title=id+' · NPC foot position';
      const position=()=>{marker.style.left=map.anchors[id].x+'px';marker.style.top=map.anchors[id].y+'px'};
      position();anchorLayer.append(marker);
      draggable(marker,pt,(x,y)=>{map.anchors[id].x=x;map.anchors[id].y=y;position();
        world.querySelectorAll('.anchor').forEach(sprite=>{const p=placements.find(t=>t.id===sprite.dataset.character&&t.anchor===id);if(p&&!p.foot){sprite.style.left=x+'px';sprite.style.top=y+'px'}})});
    }
    // Top-left drag handles move zones; corner handles resize without modifying
    // the original image. Keep changes in map pixels for reproducible exports.
    for(const h of map.hotspots){
      const el=[...world.querySelectorAll('.hotspot')].find(x=>x.title===h.label);
      if(!el)continue;
      draggable(el,h,(x,y)=>{h.x=x;h.y=y;el.style.left=x+'px';el.style.top=y+'px'});
      const grip=document.createElement('span');
      grip.className='neo-layout-resize';grip.title='Resize '+h.label;
      grip.setAttribute('aria-label','Resize '+h.label);
      grip.style.cssText='position:absolute;right:0;bottom:0;width:23px;height:23px;background:#ffcf82;border:2px solid #3b274e;border-radius:6px;cursor:nwse-resize;touch-action:none;z-index:30';
      el.append(grip);
      let held=null;
      grip.addEventListener('pointerdown',e=>{
        e.preventDefault();e.stopPropagation();held={id:e.pointerId,x:e.clientX,y:e.clientY,w:h.w,h:h.h};
        grip.setPointerCapture(e.pointerId);
      });
      grip.addEventListener('pointermove',e=>{
        if(!held||held.id!==e.pointerId)return;
        h.w=Math.round(clamp(held.w+(e.clientX-held.x)/zoom,32,map.width-h.x));
        h.h=Math.round(clamp(held.h+(e.clientY-held.y)/zoom,32,map.height-h.y));
        el.style.width=h.w+'px';el.style.height=h.h+'px';
      });
      const finish=e=>{if(!held||held.id!==e.pointerId)return;held=null;persist()};
      grip.addEventListener('pointerup',finish);
      grip.addEventListener('pointercancel',finish);
    }
    exportBtn.onclick=async()=>{
      const json=JSON.stringify(persist(),null,2);
      try{await navigator.clipboard.writeText(json);status.textContent='Copied! Paste layout JSON in the Neo Campus conversation.'}
      catch{status.textContent='Clipboard unavailable. Layout JSON logged to developer console.';console.info('Neo Campus map placement',json)}
    };
    resetBtn.onclick=()=>{localStorage.removeItem(layoutKey);location.reload()};
  }
  addEventListener('resize',center);center();
  window.__overworldPreview={map,placements,center,focus};
})();
