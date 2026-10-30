'use strict';
(async () => {
  const config=window.NeoOverworld, byId=id=>document.getElementById(id);
  const camera=byId('camera'), world=byId('world'), edges=byId('edges'), dialog=byId('dialog');
  const params=new URLSearchParams(location.search), poseTest=params.has('reina-test'), dev=params.has('dev');

  if(params.has('sprite-gallery')){
    const mapIds=Object.keys(config).filter(id=>id!=='characters'&&config[id]?.image&&config[id]?.width&&config[id]?.height);
    const characterIds=Object.keys(config.characters||{});
    const storageKey='neoOverworldPlacementEditorV1';
    const clone=value=>JSON.parse(JSON.stringify(value));
    let saved={version:1,maps:{}},cloudRevision=1;
    try{saved=JSON.parse(localStorage.getItem(storageKey)||'null')||saved}catch{}
    const placementCloud=window.NeoOverworldPlacements;
    const cloudState=await placementCloud?.load().catch(error=>{console.warn('Cloud placements unavailable',error);return null});
    if(cloudState?.placements?.maps){saved={...saved,maps:{...(saved.maps||{}),...cloudState.placements.maps}};cloudRevision=cloudState.revision||1;}
    const draft=clone(saved), state={map:mapIds.includes(params.get('map'))?params.get('map'):(mapIds.includes('arcade')?'arcade':mapIds[0]),selected:null};
    for(const [mapId,items] of Object.entries(draft.maps||{}))if(Array.isArray(items))draft.maps[mapId]=items.map(item=>{const art=config.characters?.[item.character]?.poses?.[item.pose];return {...item,id:item.id||('pose-'+Math.random().toString(36).slice(2)),src:item.src||art?.src||'',height:item.height||art?.height||155,facing:item.facing||art?.facing||'front',outfit:item.outfit||art?.outfit||null}});
    document.getElementById('shell')?.setAttribute('hidden','');
    document.body.classList.add('neo-placement-editor-open');
    const style=document.createElement('style');
    style.textContent=[
      'body.neo-placement-editor-open{margin:0;background:#100f1c;color:#f7eefb;font:14px system-ui,sans-serif}',
      '#neoPlacementEditor{position:fixed;inset:0;z-index:100;background:#12101b;display:grid;grid-template-rows:auto 1fr;overflow:hidden}',
      '#neoPlacementEditor *{box-sizing:border-box}',
      '#neoPlacementEditor button,#neoPlacementEditor select,#neoPlacementEditor input{font:inherit;color:#fff;background:#2b2339;border:1px solid #8c709d;border-radius:8px;padding:8px}',
      '#neoPlacementEditor button{cursor:pointer}#neoPlacementEditor button:hover{background:#453355}',
      '#neoPlacementEditor .head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:#1b1728;border-bottom:1px solid #675276}',
      '#neoPlacementEditor h1{font-size:18px;margin:0}#neoPlacementEditor .head p{margin:3px 0 0;color:#c9bbd4;font-size:12px}',
      '#neoPlacementEditor .actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}',
      '#neoPlacementEditor .layout{min-height:0;display:grid;grid-template-columns:minmax(250px,330px) 1fr}',
      '#neoPlacementEditor .side{min-height:0;overflow:auto;border-right:1px solid #53445f;padding:12px}',
      '#neoPlacementEditor .side h2{font-size:14px;margin:0 0 8px}',
      '#neoPlacementEditor .hint{color:#c9bbd4;font-size:12px;line-height:1.45;margin:6px 0 12px}',
      '#neoPlacementEditor .filter{width:100%;margin:0 0 10px}',
      '#neoPlacementEditor .tray{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '#neoPlacementEditor .pose{border:1px solid #53445f;background:#211c2b;border-radius:9px;padding:6px;cursor:grab;min-width:0}',
      '#neoPlacementEditor .pose:active{cursor:grabbing}#neoPlacementEditor .pose img{width:100%;height:125px;object-fit:contain;background:#2b2734;border-radius:5px}',
      '#neoPlacementEditor .pose strong{display:block;font-size:11px;overflow-wrap:anywhere}#neoPlacementEditor .pose small{color:#c9bbd4;font-size:10px}',
      '#neoPlacementEditor .work{min-width:0;min-height:0;display:grid;grid-template-rows:auto 1fr auto;gap:8px;padding:10px}',
      '#neoPlacementEditor .bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '#neoPlacementEditor .bar label{display:flex;align-items:center;gap:6px;color:#ddd}',
      '#neoPlacementEditor .stageWrap{min-height:0;display:grid;place-items:center;overflow:auto;background:#09080e;border:1px solid #4d4059;border-radius:10px;padding:8px}',
      '#neoPlacementEditor .stage{position:relative;overflow:hidden;max-width:100%;max-height:100%;background:#211c2b;touch-action:none;user-select:none}',
      '#neoPlacementEditor .stage>img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none}',
      '#neoPlacementEditor .stage .placed{position:absolute;transform:translate(-50%,-100%);object-fit:contain;object-position:center bottom;cursor:move;touch-action:none;filter:drop-shadow(0 2px 2px #0008)}',
      '#neoPlacementEditor .stage .placed.selected{outline:2px solid #75b7ff;outline-offset:2px}',
      '#neoPlacementEditor .stage .dropHint{position:absolute;inset:0;display:grid;place-items:center;color:#fff9;text-shadow:0 1px 5px #000;pointer-events:none;font-size:16px}',
      '#neoPlacementEditor .status{font-size:12px;color:#d9cce2;min-height:18px}',
      '@media(max-width:760px){#neoPlacementEditor{grid-template-rows:auto 1fr}#neoPlacementEditor .head{align-items:flex-start;flex-direction:column;padding:8px}#neoPlacementEditor .layout{grid-template-columns:1fr;grid-template-rows:minmax(145px,28vh) 1fr}#neoPlacementEditor .side{border-right:0;border-bottom:1px solid #53445f;padding:8px}#neoPlacementEditor .side h2,#neoPlacementEditor .hint{display:none}#neoPlacementEditor .tray{display:flex;overflow-x:auto}#neoPlacementEditor .pose{flex:0 0 108px}#neoPlacementEditor .pose img{height:85px}#neoPlacementEditor .work{padding:6px;gap:5px}#neoPlacementEditor .stageWrap{padding:3px}}'
    ].join('');
    document.head.append(style);
    const root=document.createElement('main');root.id='neoPlacementEditor';
    const header=document.createElement('header');header.className='head';
    const heading=document.createElement('div');heading.innerHTML='<h1>Overworld placement editor</h1><p>Drag poses onto maps, move and resize them, then save directly to the game.</p>';
    const actions=document.createElement('div');actions.className='actions';
    const back=document.createElement('a');back.href='overworld-prototype.html?cast-test=1';back.textContent='← Map preview';back.style.color='#e9d9f3';
    const saveBtn=document.createElement('button');saveBtn.textContent='Save';
    const downloadBtn=document.createElement('button');downloadBtn.textContent='Download placements';
    const clearMapBtn=document.createElement('button');clearMapBtn.textContent='Clear this map';
    actions.append(back,saveBtn,downloadBtn,clearMapBtn);header.append(heading,actions);
    const layout=document.createElement('div');layout.className='layout';
    const side=document.createElement('aside');side.className='side';
    const trayTitle=document.createElement('h2');trayTitle.textContent='Character poses';
    const hint=document.createElement('p');hint.className='hint';hint.textContent='Drag a pose from this list onto the map. Drag placed characters to move them. Select one to adjust its height. Coordinates are saved relative to the full map image.';
    const characterFilter=document.createElement('select');characterFilter.className='filter';
    characterFilter.add(new Option('All characters','all'));
    characterIds.forEach(id=>characterFilter.add(new Option(config.characters[id].name,id)));
    const tray=document.createElement('div');tray.className='tray';side.append(trayTitle,hint,characterFilter,tray);
    const work=document.createElement('section');work.className='work';
    const bar=document.createElement('div');bar.className='bar';
    const mapSelect=document.createElement('select');mapSelect.setAttribute('aria-label','Map');
    mapIds.forEach(id=>mapSelect.add(new Option(config[id].title||id,id)));
    mapSelect.value=state.map;
    const mapLabel=document.createElement('label');mapLabel.append('Map ',mapSelect);
    const sizeLabel=document.createElement('label');sizeLabel.append('Selected pose height ');
    const sizeRange=document.createElement('input');sizeRange.type='range';sizeRange.min='45';sizeRange.max='300';sizeRange.step='1';sizeRange.value='155';sizeRange.setAttribute('aria-label','Selected pose height');
    const sizeValue=document.createElement('span');sizeValue.textContent='155';
    sizeLabel.append(sizeRange,sizeValue,' map units');
    const removeBtn=document.createElement('button');removeBtn.textContent='Remove selected';
    bar.append(mapLabel,sizeLabel,removeBtn);
    const stageWrap=document.createElement('div');stageWrap.className='stageWrap';
    const stage=document.createElement('div');stage.className='stage';stage.setAttribute('aria-label','Map placement canvas');
    stageWrap.append(stage);
    const status=document.createElement('div');status.className='status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    work.append(bar,stageWrap,status);layout.append(side,work);root.append(header,layout);document.body.append(root);
    function listForMap(){draft.maps[state.map] ||= [];return draft.maps[state.map]}
    function persist(message){localStorage.setItem(storageKey,JSON.stringify(draft));status.textContent=message||'Saved in this browser.'}
    function cloudPayload(){const maps={};for(const [mapId,items] of Object.entries(draft.maps||{}))maps[mapId]=(items||[]).map(({character,pose,x,y,height,flipped})=>({character,pose,x,y,height,flipped:!!flipped}));return {schemaVersion:1,maps}}
    function renderTray(){
      tray.replaceChildren();
      const only=characterFilter.value;
      for(const characterId of characterIds){
        if(only!=='all'&&only!==characterId)continue;
        const character=config.characters[characterId];
        for(const [poseKey,pose] of Object.entries(character.poses||{})){
          if(!pose.src)continue;
          const card=document.createElement('div');card.className='pose';card.draggable=true;
          card.dataset.character=characterId;card.dataset.pose=poseKey;
          const img=document.createElement('img');img.src=pose.src;img.alt=character.name+' '+poseKey;img.loading='lazy';
          const name=document.createElement('strong');name.textContent=character.name+' · '+poseKey;
          const details=document.createElement('small');details.textContent=(pose.outfit?pose.outfit+' · ':'')+(pose.status||'');
          card.append(img,name,details);
          card.addEventListener('dragstart',event=>{event.dataTransfer.setData('application/x-neo-pose',JSON.stringify({character:characterId,pose:poseKey}));event.dataTransfer.effectAllowed='copy';});
          card.addEventListener('click',()=>{addPose(characterId,poseKey,config[state.map].width/2,config[state.map].height*0.86);});
          tray.append(card);
        }
      }
    }
    function drawStage(){
      const map=config[state.map],rect=stageWrap.getBoundingClientRect();
      const maxW=Math.max(120,rect.width-20),maxH=Math.max(120,rect.height-20);
      const ratio=Math.min(maxW/map.width,maxH/map.height);
      stage.style.width=Math.round(map.width*ratio)+'px';stage.style.height=Math.round(map.height*ratio)+'px';
      stage.replaceChildren();
      const bg=document.createElement('img');bg.className='bg';bg.src=map.image;bg.alt=map.title;stage.append(bg);
      const list=listForMap();
      list.forEach((item,index)=>{
        const img=document.createElement('img');img.className='placed'+(state.selected===item.id?' selected':'');
        img.src=item.src;img.alt=config.characters[item.character]?.name+' '+item.pose;img.draggable=false;
        img.style.left=(item.x/map.width*100)+'%';img.style.top=(item.y/map.height*100)+'%';
        img.style.height=(item.height/map.height*100)+'%';img.dataset.id=item.id;
        img.addEventListener('pointerdown',event=>{
          event.preventDefault();event.stopPropagation();state.selected=item.id;sizeRange.value=String(item.height);sizeValue.textContent=String(item.height);
          stage.querySelectorAll('.placed').forEach(node=>node.classList.toggle('selected',node.dataset.id===item.id));
          const image=event.currentTarget;image.setPointerCapture(event.pointerId);
          const move=e=>{const r=stage.getBoundingClientRect(),current=listForMap().find(x=>x.id===item.id);if(!current)return;current.x=Math.max(0,Math.min(map.width,(e.clientX-r.left)/r.width*map.width));current.y=Math.max(0,Math.min(map.height,(e.clientY-r.top)/r.height*map.height));image.style.left=(current.x/map.width*100)+'%';image.style.top=(current.y/map.height*100)+'%';};
          const up=()=>{image.removeEventListener('pointermove',move);image.removeEventListener('pointerup',up);persist('Moved pose. Save or download when the map is ready.')};
          image.addEventListener('pointermove',move);image.addEventListener('pointerup',up,{once:true});
        });
        stage.append(img);
      });
      if(!list.length){const msg=document.createElement('div');msg.className='dropHint';msg.textContent='Drag a character pose here';stage.append(msg)}
    }
    function addPose(character,poseKey,x,y){
      const art=config.characters[character]?.poses?.[poseKey];if(!art)return;
      const item={id:'pose-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),character,pose:poseKey,src:art.src,x:Math.round(x),y:Math.round(y),height:art.height||155,facing:art.facing||'front',outfit:art.outfit||null};
      listForMap().push(item);state.selected=item.id;sizeRange.value=String(item.height);sizeValue.textContent=String(item.height);drawStage();persist('Added '+config.characters[character].name+' to '+(config[state.map].title||state.map)+'. Drag to position it.');
    }
    stage.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='copy'});
    stage.addEventListener('drop',event=>{
      event.preventDefault();let pose;try{pose=JSON.parse(event.dataTransfer.getData('application/x-neo-pose'))}catch{return}
      const rect=stage.getBoundingClientRect(),map=config[state.map];
      addPose(pose.character,pose.pose,(event.clientX-rect.left)/rect.width*map.width,(event.clientY-rect.top)/rect.height*map.height);
    });
    stage.addEventListener('pointerdown',event=>{if(event.target===stage){state.selected=null;drawStage()}});
    sizeRange.addEventListener('input',()=>{const item=listForMap().find(x=>x.id===state.selected);if(!item)return;item.height=Number(sizeRange.value);sizeValue.textContent=sizeRange.value;drawStage()});
    sizeRange.addEventListener('change',()=>persist('Pose size saved in this browser.'));
    removeBtn.onclick=()=>{const list=listForMap(),index=list.findIndex(x=>x.id===state.selected);if(index<0)return;list.splice(index,1);state.selected=null;drawStage();persist('Removed selected pose.')};
    mapSelect.onchange=()=>{state.map=mapSelect.value;state.selected=null;drawStage();status.textContent='Editing '+(config[state.map].title||state.map)+'.'};
    characterFilter.onchange=renderTray;
    saveBtn.onclick=async()=>{persist('Saved in this browser.');if(!placementCloud){status.textContent='Cloud placement service is unavailable.';return}saveBtn.disabled=true;status.textContent='Saving placements to the game…';try{const result=await placementCloud.save(cloudPayload(),cloudRevision);cloudRevision=result.revision;status.textContent='Saved '+Object.keys(draft.maps).length+' map(s) to the game.'}catch(error){status.textContent='Cloud save failed: '+error.message}finally{saveBtn.disabled=false}};
    clearMapBtn.onclick=()=>{draft.maps[state.map]=[];state.selected=null;drawStage();persist('Cleared placements for this map.')};
    downloadBtn.onclick=()=>{
      const maps={};
      for(const [mapId,items] of Object.entries(draft.maps||{})){
        maps[mapId]={mapSize:{width:config[mapId]?.width,height:config[mapId]?.height},placements:items.map(({id,...item})=>item)};
      }
      const output={schemaVersion:1,generatedAt:new Date().toISOString(),coordinateUnits:'map image pixels; x is character foot center and y is character foot baseline',maps};
      const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='neo-campus-overworld-placements.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='Downloaded placements for '+Object.keys(maps).length+' map(s).';
    };
    addEventListener('resize',drawStage);
    renderTray();drawStage();status.textContent=cloudState?'Loaded placements from the game.':'Loaded local placements. Drag a pose onto the map to start.';
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
  const shopTest=params.has('shop-test'),requestedScene=params.get('scene'),sceneId=config[requestedScene]?.image?requestedScene:(shopTest?'shop':'arcade'),map=config[sceneId];
  let cloudPlacementState=null;
  if(window.NeoOverworldPlacements)cloudPlacementState=await window.NeoOverworldPlacements.load().catch(error=>{console.warn('Cloud placements unavailable; using built-in map layout',error);return null});
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
  const savedMapRecords=Array.isArray(cloudPlacementState?.placements?.maps?.[sceneId])?cloudPlacementState.placements.maps[sceneId]:[];
  function fromSavedPlacement(item,anchor){
    const id=String(item?.character||'');
    if(!config.characters?.[id]||!Number.isFinite(Number(item.x))||!Number.isFinite(Number(item.y)))return null;
    const poses=config.characters[id].poses||{},requested=String(item.pose||'standing'),poseKey=poses[requested]?requested:'standing';
    const x=Math.min(map.width,Math.max(0,Number(item.x))),y=Math.min(map.height,Math.max(0,Number(item.y)));
    const height=Math.min(340,Math.max(45,Number(item.height)||poses[poseKey]?.height||150));
    return {id,anchor,pose:poseKey,foot:{x,y},height,flipped:!!item.flipped};
  }
  if(!params.has('rpg-integration')&&savedMapRecords.length&&!poseTest&&!params.has('art-test')){
    const placed=savedMapRecords.map(item=>fromSavedPlacement(item)).filter(Boolean);
    if(placed.length)placements.splice(0,placements.length,...placed);
  }
  // Integrated mode displays only NPCs currently scheduled here by the RPG.
  // Reuse stable anchor slots and do not invent story encounters.
  if(params.has('rpg-integration')){
    const castEntries=(params.get('cast')||'').split(',').map(entry=>{
      const [id,requestedPose]=entry.split(':');
      if(!/^[a-z][a-z0-9_-]{0,35}$/.test(id||''))return null;
      const knownPose=!!config.characters?.[id]?.poses?.[requestedPose];
      return {id,pose:knownPose?requestedPose:'standing'};
    }).filter(Boolean);
    placements.splice(0,placements.length,...castEntries.slice(0,8).map(({id,pose},i)=>{const anchor=['P1','P2','P3','P4','E1','E2','E3','E4'][i],saved=savedMapRecords.find(item=>item.character===id),custom=saved&&fromSavedPlacement(saved,anchor);return custom?{...custom,pose:custom.pose||pose}:{id,anchor,pose}}));
    const subtitle=document.querySelector('.title small');if(subtitle)subtitle.textContent='Live RPG schedule · placement preview';
  }
  if(dev){byId('guides').hidden=false;}
  let zoom=1,ox=0,oy=0,drag=null,ignoreClick=false,toastTimer;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const point=p=>p.foot||map.anchors[p.anchor];
  const person=p=>config.characters[p.id]||{name:p.id.replace(/(^|[_-])([a-z])/g,(_,sep,letter)=>' '+letter.toUpperCase()).trim(),face:'',poses:{}};
  const pose=p=>{const art=person(p).poses?.[p.pose||'standing'];return art&&Number.isFinite(p.height)?{...art,height:p.height}:art};
  const face=p=>person(p).face||'';
  const chibiMode=params.has('rpg-integration')&&params.get('chibi')==='1';
  const reinaChibi='/rpg-assets/characters/reina/chibi/front.png';
  const chibiPaths=id=>['/rpg-assets/characters/'+id+'/discreet/neutral.webp','/rpg-assets/characters/'+id+'/discreet/neutral.png','/rpg-assets/characters/'+id+'/chibi/front.png',reinaChibi];
  function loadChibi(img,id){const paths=chibiPaths(id);let index=0;const next=()=>{if(index>=paths.length){img.onerror=null;img.removeAttribute('src');return;}img.src=paths[index++];};img.onerror=next;next();}

  // Do not let the map shrink below the scale needed to cover the camera in both dimensions.
  // The larger ratio avoids empty bars along either axis at the minimum zoom.
  const minZoom=()=>Math.max(camera.clientWidth/map.width,camera.clientHeight/map.height);
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
  function center(){zoom=Math.max(minZoom(),clamp(Math.max(camera.clientWidth/map.initial.viewWidth,camera.clientHeight/map.initial.viewHeight),.52,1.05));const initialReina=map.id==='arcade'?placements.find(p=>p.id==='reina'&&p.pose==='arcade'):null;const target=(poseTest||(!shopTest&&!params.has('art-test')&&!params.has('cast-test')))&&initialReina?point(initialReina):map.initial;ox=camera.clientWidth/2-target.x*zoom;oy=camera.clientHeight/2-(target.y-55)*zoom;paint();}
  function toast(message){const t=byId('toast');t.textContent=message;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,3500);}
  function openPerson(p){if(ignoreClick)return;if(params.has('rpg-integration')&&window.parent!==window){window.parent.postMessage({type:'neo-overworld-action',kind:'person',id:p.id},location.origin);return;}byId('dialogName').textContent=person(p).name+(p.previewKey?' · '+p.previewKey:'');const img=byId('dialogImg');img.src=face(p);img.alt=person(p).name;img.onerror=()=>img.hidden=true;img.hidden=false;dialog.hidden=false;byId('close').focus();}
  for(const p of placements){const pt=point(p),art=pose(p),b=document.createElement('button');b.className='anchor';b.style.left=pt.x+'px';b.style.top=pt.y+'px';b.dataset.character=p.id;b.dataset.pose=p.pose||'standing';b.dataset.foot=`${pt.x}, ${pt.y}`;b.title=`Interact with ${person(p).name}`;b.setAttribute('aria-label',b.title);
    const img=document.createElement('img');img.className='sprite';img.alt='';if(p.flipped)img.style.transform='scaleX(-1)';if(chibiMode){loadChibi(img,p.id);b.style.setProperty('--sprite-height','130px');}else if(art){img.src=art.src;b.style.setProperty('--sprite-height',(p.height||art.height)+'px');}else{b.classList.add('missing');b.style.setProperty('--sprite-height','130px');}
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
  camera.addEventListener('wheel',e=>{if(!e.ctrlKey||!dialog.hidden)return;e.preventDefault();const old=zoom,minimum=minZoom(),maximum=Math.max(3.4,minimum),z=clamp(zoom*(e.deltaY<0?1.08:.92),minimum,maximum),r=camera.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;ox=x-(x-ox)*z/old;oy=y-(y-oy)*z/old;zoom=z;paint()},{passive:false});
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
