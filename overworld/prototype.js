'use strict';
(() => {
  const config=window.NeoOverworld, byId=id=>document.getElementById(id);
  const camera=byId('camera'), world=byId('world'), edges=byId('edges'), dialog=byId('dialog');
  const params=new URLSearchParams(location.search), poseTest=params.has('reina-test'), dev=params.has('dev');
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
  for(const h of map.hotspots){const b=document.createElement('button');b.className='hotspot';Object.assign(b.style,{left:h.x+'px',top:h.y+'px',width:h.w+'px',height:h.h+'px'});b.setAttribute('aria-label','Explore '+h.label);b.title=h.label;const label=document.createElement('span');label.textContent=h.label;b.append(label);b.onclick=()=>{if(ignoreClick)return;if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'hotspot',id:h.id},location.origin);return;}toast(h.label+' · activity connection pending')};world.appendChild(b);}
  camera.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button')||!dialog.hidden)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox,oy,moved:false};camera.setPointerCapture(e.pointerId);camera.classList.add('dragging')});
  camera.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;ox=drag.ox+dx;oy=drag.oy+dy;paint()});
  function endDrag(e){if(!drag||e.pointerId!==drag.id)return;ignoreClick=drag.moved;drag=null;camera.classList.remove('dragging');if(ignoreClick)setTimeout(()=>ignoreClick=false,80);}
  camera.addEventListener('pointerup',endDrag);camera.addEventListener('pointercancel',endDrag);
  camera.addEventListener('wheel',e=>{if(!e.ctrlKey||!dialog.hidden)return;e.preventDefault();const old=zoom,z=clamp(zoom*(e.deltaY<0?1.08:.92),.48,1.7),r=camera.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;ox=x-(x-ox)*z/old;oy=y-(y-oy)*z/old;zoom=z;paint()},{passive:false});
  byId('reset').onclick=center;byId('guides').onclick=()=>{document.body.classList.toggle('show-guides');byId('guides').setAttribute('aria-pressed',String(document.body.classList.contains('show-guides')))};
  byId('close').onclick=()=>{dialog.hidden=true};for(const id of ['activities','events','deck','status'])byId(id).onclick=()=>{if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'navigation',id},location.origin);return;}toast(id+' opens in the existing RPG; this map is a placement preview');};
  addEventListener('resize',center);center();
  window.__overworldPreview={map,placements,center,focus};
})();
