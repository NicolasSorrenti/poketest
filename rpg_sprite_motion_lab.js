'use strict';
// Standalone, stateful motion tuning UI. Never rebuilds controls on slider edits.
// Drafts stay in this browser; Apply writes a separate override for Dance Battle.
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const api=window.NeoRpgSpriteDeformer;
 const PRESET=api?.presets?.daisyDance;
 const posesApi=window.NeoRpgDancePoseController;
 if(!api||!window.NeoRpgSpriteInflate||!PRESET||!posesApi?.previewConfig){
  $('motionStatus').textContent='No se pudo cargar el módulo de movimiento. Recargá la página.';return;
 }
 const DRAFT='neoRpgMotionLabDraftV1';
 const ACTIVE='neoRpgDaisyMotionTuningV1';
 const RINA_ACTIVE='neoRpgRinaDancePoseTuningV1';
 const query=new URLSearchParams(location.search);
 let characterId=query.get('character')==='rina'?'rina':'daisy';
 let poseId=String(query.get('pose')||(characterId==='rina'?'happy':'primary')).toLowerCase();
 const available=()=>posesApi.presets[characterId]||[];
 if(!available().some(x=>x.id===poseId))poseId=available()[0]?.id||'primary';
 const draftKey=()=>characterId==='daisy'&&poseId==='primary'?DRAFT:
  'neoRpgMotionLabPoseDraftV2:'+characterId+':'+poseId;
 const globalFields=['tempo','speed','fps','baseBounce','feverBounce','tilt','intensity','feverInflate','cropTop','cropHeight'];
 const zoneFields=['x','y','rx','ry','inflateX','inflateY','inflatePhase','scaleX','scaleY','moveY','phase'];
 const clone=o=>JSON.parse(JSON.stringify(o));
 let defaults=clone(posesApi.previewConfig(characterId,poseId)||PRESET);
 const specs={
  x:['Centro X',.15,.85,.005,'pct','Coordenada horizontal en el retrato.'],
  y:['Centro Y',.25,.85,.005,'pct','Bajá este valor solo si la zona sigue demasiado arriba.'],
  rx:['Radio horizontal',.04,.35,.005,'pct','Ancho del área afectada.'],
  ry:['Radio vertical',.03,.3,.005,'pct','Alto del área afectada.'],
  inflateX:['Expandir ancho',0,.8,.005,'pct','Aumenta el tamaño horizontal y vuelve al original al compás.'],
  inflateY:['Expandir alto',0,.8,.005,'pct','Aumenta el tamaño vertical y vuelve al original al compás.'],
  inflatePhase:['Desfase expansión',-3.14,3.14,.02,'rad','Desfase con respecto a la otra zona.'],
  scaleX:['Deformación lateral antigua',0,.12,.002,'pct','Dejá en 0 para usar solo expansión independiente.'],
  scaleY:['Deformación vertical antigua',0,.08,.002,'pct','Dejá en 0 para evitar arrastrar el cuello.'],
  moveY:['Desplazar zona arriba/abajo',0,.06,.001,'pct','Desplazamiento adicional de los píxeles, no de todo el cuerpo.'],
  phase:['Fase del desplazamiento',-3.14,3.14,.02,'rad','Solo afecta a Desplazar zona.'],
  tempo:['BPM',60,220,1,'bpm','Pulsos por minuto de la animación.'],
  speed:['Multiplicador de frecuencia',.3,2,.01,'factor','1 = tempo estándar del preset.'],
  fps:['Fotogramas por segundo',8,40,1,'fps','22 FPS limita el coste en móviles.'],
  baseBounce:['Rebote del cuerpo',0,9,.1,'px','0 mantiene cara, cuello y torso completo quietos.'],
  feverBounce:['Rebote extra por Fever',0,12,.1,'px','Solo se aplica con Fever.'],
  tilt:['Giro del cuerpo',0,.05,.001,'rad','0 impide que cuello y cabeza se inclinen.'],
  intensity:['Intensidad local',0,3,.05,'factor','Escala la expansión y los otros efectos locales.'],
  feverInflate:['Más expansión con Fever',0,2,.05,'factor','0 = mismo tamaño siempre; 0.4 = hasta 40% extra de expansión con Fever completo.'],
  cropTop:['Posición vertical de cámara',0,.25,.005,'pct','En modo Ventana no corta la imagen: decide qué parte se ve al principio.'],
  cropHeight:['Alto visible / zoom',.50,1,.005,'pct','En modo Ventana, una fracción menor acerca la cámara sin destruir píxeles.'],
  energy:['Simular Fever',0,1,.01,'pct','Solo cambia la vista previa; no se exporta como ajuste.']
 };
 let state=clone(defaults);
 let energy=.75,selected='left',paused=false,viewOriginal=false,logical=0,previousNow=0,localUrl=null;
 const storageRead=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}};
 const storageWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}};
 function cleanConfig(raw,base=defaults){
  const result=clone(base);
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
  for(const key of globalFields){
   if(Number.isFinite(Number(raw[key])))result[key]=Number(raw[key]);
  }
  if(Array.isArray(raw.zones)){
   for(let side=0;side<2;side++){
    if(!raw.zones[side]||typeof raw.zones[side]!=='object')continue;
    for(const key of zoneFields)
     if(Number.isFinite(Number(raw.zones[side][key])))result.zones[side][key]=Number(raw.zones[side][key]);
   }
  }
  if(raw.cameraMode==='viewport'||raw.cameraMode==='crop')result.cameraMode=raw.cameraMode;
  if(['full-width','cover','dialogue-bust'].includes(raw.cameraFit))result.cameraFit=raw.cameraFit;
  if(typeof raw.source==='string'&&raw.source.startsWith('/rpg-assets/'))result.source=raw.source;
  return result;
 }
 state=cleanConfig(storageRead(draftKey()),defaults);
 const canvas=$('motionPreview'),stage=$('motionStage');
 const characterPicker=$('motionCharacter'),posePicker=$('motionPose');
 function fillPoseOptions(){
  posePicker.replaceChildren();
  const labels={primary:'Principal',happy:'Happy',idol:'Idol (overworld)',reaching:'Reaching (overworld)',
   determined:'Determined',victory:'Battle Victory',surprised:'Surprised',
   walking:'Walking',kneeling:'Kneeling (overworld)'};
  for(const pose of available()){
   const option=document.createElement('option');option.value=pose.id;
   option.textContent=labels[pose.id]||pose.id;posePicker.append(option);
  }
  posePicker.value=poseId;
  characterPicker.value=characterId;
  $('motionPreviewTitle').textContent='Vista previa · '+(characterId==='rina'?'Rina':'Daisy')+' · '+(posePicker.selectedOptions[0]?.textContent||poseId);
 }
 fillPoseOptions();
 const message=(text,isError=false)=>{$('motionStatus').textContent=text;$('motionStatus').dataset.error=String(isError);};
 let motion;
 try {
  motion=api.create(canvas,{...state,zones:clone(state.zones),onReady:()=>message('Retrato cargado. Modificá los controles sin reiniciar.'),onError:e=>message(e.message,true)});
 }catch(error){message(String(error),true);return;}
 // Build sliders ONCE; change events only update their own label and the actor.
 const sliderInputs=new Map();
 function readable(field,n){
  const kind=specs[field][4];
  if(kind==='pct')return (n*100).toFixed(field==='moveY'||field==='scaleY'?1:0)+'%';
  if(kind==='px')return n.toFixed(1)+' px';
  if(kind==='rad')return n.toFixed(2)+' rad';
  if(kind==='factor')return n.toFixed(2)+'×';
  return String(Math.round(n))+' '+kind;
 }
 function slider(container,key,scope,side){
  const [title,min,max,step,,description]=specs[key];
  const item=document.createElement('div');item.className='control';
  const label=document.createElement('label'),text=document.createElement('span');
  text.textContent=title;
  const output=document.createElement('output');
  const input=document.createElement('input');input.type='range';
  input.min=min;input.max=max;input.step=step;
  input.dataset.key=key;input.dataset.scope=scope;input.dataset.side=String(side);
  input.id='tune_'+scope+'_'+(side??'global')+'_'+key;
  label.htmlFor=input.id;label.append(text,output);
  const hint=document.createElement('small');hint.textContent=description;
  item.append(label,input,hint);container.append(item);
  sliderInputs.set(input.id,{input,output,key,scope,side});
  input.addEventListener('input',()=>{
   const n=Number(input.value);
   if(scope==='zone')state.zones[side][key]=n;
   else if(scope==='preview')energy=n;
   else state[key]=n;
   output.value=readable(key,n);
   changed();
  });
 }
 for(const [scope,side,holder] of [['zone',0,'leftControls'],['zone',1,'rightControls']]){
  for(const key of zoneFields)slider($(holder),key,scope,side);
 }
 for(const key of globalFields)slider($('globalControls'),key,'global');
 const cameraControl=document.createElement('div');cameraControl.className='control';
 cameraControl.innerHTML='<label for="motionCameraMode">Modo de cámara</label><select id="motionCameraMode" style="width:100%;padding:9px;margin-top:8px;border:1px solid #94629f;border-radius:8px;background:#141124;color:#fff"><option value="viewport">Ventana (sin recortar el sprite)</option><option value="crop">Recorte tradicional</option></select><small>Ventana mantiene toda la imagen disponible; el rebote revela las partes inicialmente ocultas.</small>';
 $('globalControls').prepend(cameraControl);
 const cameraInput=$('motionCameraMode');
 cameraInput.addEventListener('change',()=>{state.cameraMode=cameraInput.value;changed();});
 const widthControl=document.createElement('div');widthControl.className='control';
 widthControl.innerHTML='<label for="motionCameraFit">Ajuste horizontal</label><select id="motionCameraFit" style="width:100%;padding:9px;margin-top:8px;border:1px solid #94629f;border-radius:8px;background:#141124;color:#fff"><option value="dialogue-bust">Encuadre de diálogo (278% — Dance Battle)</option><option value="full-width">Mostrar todo el ancho</option><option value="cover">Priorizar zoom vertical (recorta los lados)</option></select><small>Mostrar todo el ancho evita cortar brazos, pelo y bordes del PNG.</small>';
 $('globalControls').prepend(widthControl);
 const widthInput=$('motionCameraFit');
 widthInput.addEventListener('change',()=>{state.cameraFit=widthInput.value;changed();});
 slider($('previewControls'),'energy','preview');
 function syncSliders(){
  cameraInput.value=state.cameraMode==='crop'?'crop':'viewport';
  widthInput.value=['full-width','cover','dialogue-bust'].includes(state.cameraFit)?state.cameraFit:'full-width';
  for(const {input,output,key,scope,side} of sliderInputs.values()){
   const v=scope==='zone'?state.zones[side][key]:scope==='preview'?energy:state[key];
   input.value=String(Number.isFinite(Number(v))?v:0);
   output.value=readable(key,Number(input.value));
  }
 }
 function overlay(){
  for(const [i,suffix] of ['Left','Right'].entries()){
   const z=state.zones[i],ellipse=$('zone'+suffix),center=$('center'+suffix),label=$('label'+suffix);
   const cx=z.x*210,cy=z.y*280;
   ellipse.setAttribute('cx',cx);ellipse.setAttribute('cy',cy);
   ellipse.setAttribute('rx',z.rx*210);ellipse.setAttribute('ry',z.ry*280);
   center.setAttribute('cx',cx);center.setAttribute('cy',cy);
   label.setAttribute('x',cx);label.setAttribute('y',cy-5);
  }
  stage.classList.toggle('hide-zones',!$('motionShowZones').checked);
 }
 function applyPreview(){
  if(!motion)return;
  const patch={...state,zones:viewOriginal?[]:clone(state.zones)};
  if(viewOriginal){patch.baseBounce=0;patch.feverBounce=0;patch.tilt=0;}
  motion.configure(patch);
  overlay();
 }
 function changed(){
  applyPreview();
  storageWrite(draftKey(),{...state,source:state.source.startsWith('blob:')?defaults.source:state.source});
 }
 function choosePose(character,pose){
  if(character!=='rina'&&character!=='daisy')return;
  characterId=character;
  const list=available();
  poseId=list.some(e=>e.id===pose)?pose:(characterId==='rina'?'happy':'primary');
  fillPoseOptions();
  defaults=clone(posesApi.previewConfig(characterId,poseId)||PRESET);
  state=cleanConfig(storageRead(draftKey()),defaults);
  motion?.dispose();
  motion=api.create(canvas,{...state,zones:clone(state.zones),
   onReady:()=>message('Pose '+poseId+' cargada. Mové las elipses para ajustar las zonas.'),
   onError:e=>message('No se pudo cargar la pose: '+e.message,true)});
  viewOriginal=false;
  $('motionOriginal').textContent='Ver original';
  $('motionSource').value=state.source||defaults.source;
  syncSliders();overlay();
  message('Cargando pose '+poseId+'…');
 }
 characterPicker.addEventListener('change',()=>choosePose(characterPicker.value,characterPicker.value==='rina'?'happy':'primary'));
 posePicker.addEventListener('change',()=>choosePose(characterId,posePicker.value));
 syncSliders();overlay();
 document.querySelectorAll('[data-tab]').forEach(button=>{
  button.addEventListener('click',()=>{
   selected=button.dataset.tab;
   for(const btn of document.querySelectorAll('[data-tab]'))btn.setAttribute('aria-selected',String(btn===button));
   for(const [name,id] of [['left','tabLeft'],['right','tabRight'],['global','tabGlobal']])$(id).hidden=name!==selected;
  });
 });
 $('motionShowZones').addEventListener('change',overlay);
 $('motionPause').addEventListener('click',()=>{
  paused=!paused;$('motionPause').textContent=paused?'▶ Reanudar':'⏸ Pausar';
 });
 $('motionOriginal').addEventListener('click',()=>{
  viewOriginal=!viewOriginal;
  $('motionOriginal').textContent=viewOriginal?'Ver animación':'Ver original';
  applyPreview();
 });
 function frame(now){
  const delta=previousNow?Math.min(75,Math.max(0,now-previousNow)):0;previousNow=now;
  if(!paused&&!document.hidden)logical+=delta;
  motion?.render(logical,energy);
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 let dragIndex=-1;
 function toRelative(e){
  const r=stage.getBoundingClientRect();
  return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),
         y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};
 }
 stage.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  const p=toRelative(e);
  const scores=state.zones.map(z=>Math.hypot((z.x-p.x)/Math.max(.02,z.rx),(z.y-p.y)/Math.max(.02,z.ry)));
  dragIndex=scores[0]<=scores[1]?0:1;
  document.querySelector('[data-tab="'+(dragIndex===0?'left':'right')+'"]')?.click();
  stage.setPointerCapture?.(e.pointerId);
  e.preventDefault();
  moveZone(p);
 });
 function moveZone(p){
  if(dragIndex<0)return;
  state.zones[dragIndex].x=Math.round(p.x*200)/200;
  state.zones[dragIndex].y=Math.round(p.y*200)/200;
  changed();syncSliders();
 }
 stage.addEventListener('pointermove',e=>{if(dragIndex>=0){moveZone(toRelative(e));e.preventDefault();}});
 stage.addEventListener('pointerup',()=>dragIndex=-1);
 stage.addEventListener('pointercancel',()=>dragIndex=-1);
 function showConfig(){const data={characterId,poseId,...state,zones:clone(state.zones)};if(data.source?.startsWith('blob:'))data.source=defaults.source;return data;}
 $('motionGenerate').addEventListener('click',()=>{
  $('motionExport').value=JSON.stringify(showConfig(),null,2);
  message('JSON generado. Compartí este texto para fijar los parámetros del juego.');
 });
 $('motionCopy').addEventListener('click',async()=>{
  const data=JSON.stringify(showConfig(),null,2);
  $('motionExport').value=data;
  try{
   await navigator.clipboard.writeText(data);
   message('Parámetros copiados. Pegalos en nuestra conversación.');
  }catch(_){
   $('motionExport').focus();$('motionExport').select();
   message('Seleccioné el JSON; copiá el texto del campo para enviarlo.');
  }
 });
 $('motionApply').addEventListener('click',()=>{
  const allowed={};
  for(const key of globalFields)allowed[key]=state[key];
  allowed.cameraMode=state.cameraMode==='crop'?'crop':'viewport';
  allowed.cameraFit=['full-width','cover','dialogue-bust'].includes(state.cameraFit)?state.cameraFit:'full-width';
  allowed.zones=clone(state.zones);
  if(characterId==='rina'){
   const saved=storageRead(RINA_ACTIVE)||{};
   saved[poseId]=allowed;
   if(storageWrite(RINA_ACTIVE,saved))
    message('Rina · '+poseId+': aplicado solo a esta pose en Dance Battle de este navegador.');
   else message('No se pudieron guardar los parámetros. Copiá el JSON.',true);
  }else if(poseId==='primary'){
   if(storageWrite(ACTIVE,allowed))message('Daisy principal: valores guardados para Dance Battle en este navegador.');
   else message('No se pudo guardar. Copiá el JSON.',true);
  }else{
   message('Esta pose de Daisy se calibra mediante JSON: copiá los parámetros para integrarlos al juego.');
  }
 });
 $('motionImport').addEventListener('click',()=>{
  try{
   const parsed=JSON.parse($('motionExport').value);
   if(!Array.isArray(parsed.zones)||parsed.zones.length<2)throw Error('Faltan las dos zonas en el JSON.');
   if(['rina','daisy'].includes(parsed.characterId)&&typeof parsed.poseId==='string')
    choosePose(parsed.characterId,parsed.poseId);
   state=cleanConfig(parsed,defaults);changed();syncSliders();
   message('JSON importado en '+characterId+' · '+poseId+'.');
  }catch(error){message('No se pudo importar: '+error.message,true);}
 });
 $('motionReset').addEventListener('click',()=>{
  if(!window.confirm('¿Restablecer los controles de esta pose a sus valores iniciales?'))return;
  state=clone(defaults);energy=.75;viewOriginal=false;
  $('motionOriginal').textContent='Ver original';
  changed();syncSliders();message('Restableciste los valores de esta pose. Tocá Aplicar para guardarlos en Dance Battle.');
 });
 function loadImageSource(src){
  if(!src)return;
  state.source=src;
  motion.setSource(src);
  $('motionSource').value=src.startsWith('blob:')?'[imagen local]':src;
  changed();
 }
 $('motionUseSource').addEventListener('click',()=>{
  const path=$('motionSource').value.trim();
  if(!path.startsWith('/rpg-assets/')){message('Usá una ruta que empiece con /rpg-assets/.',true);return;}
  if(localUrl){URL.revokeObjectURL(localUrl);localUrl=null;}
  loadImageSource(path);
 });
 $('motionFile').addEventListener('change',e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){message('Seleccioná una imagen.',true);return;}
  if(localUrl)URL.revokeObjectURL(localUrl);
  localUrl=URL.createObjectURL(file);
  loadImageSource(localUrl);
 });
 window.addEventListener('pagehide',()=>{motion?.dispose();if(localUrl)URL.revokeObjectURL(localUrl);});
 $('motionSource').value=state.source||defaults.source;
 message('Cargando '+(characterId==='rina'?'Rina':'Daisy')+' · '+poseId+'…');
})();
