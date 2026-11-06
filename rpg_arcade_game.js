'use strict';
// Neon Circuit — arcade cabinet presentation and rhythm game.
// Standalone browser UI. Campaign rewards remain owned by rpg_social_activities.js.
(function(root){
'use strict';
const oldCss=document.getElementById('neo-arcade-css');
if(oldCss)oldCss.remove();
const CSS=String.raw`
.nc-mask{position:fixed;inset:0;z-index:100500;background:radial-gradient(ellipse at 50% 20%,#30165d 0%,#080b21 58%,#03050e 100%);display:grid;place-items:center;padding:clamp(6px,2vw,20px);font-family:system-ui,-apple-system,sans-serif;color:#f7f2ff;isolation:isolate}
.nc-mask *{box-sizing:border-box}.nc-cabinet{width:min(1120px,100%);max-height:calc(100dvh - 12px);overflow:auto;border:2px solid #a05effa6;border-radius:19px;position:relative;background:linear-gradient(155deg,#190e39,#0a102c 60%,#1d1044);box-shadow:0 0 0 5px #4c258333,0 0 65px #a73bff44,0 24px 85px #000b}
.nc-cabinet:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,#fff1,transparent 23%,transparent 70%,#bb7dff0c);border-radius:inherit}
.nc-bar{display:flex;justify-content:space-between;align-items:center;padding:13px 19px 5px;gap:12px}
.nc-logo{font-size:12px;letter-spacing:.15em;font-weight:900;color:#ff73e8;text-shadow:0 0 14px #fa64e6}
.nc-close{color:#d9d4fe;background:#ffffff0b;border:1px solid #a28df080;border-radius:9px;padding:8px 13px;cursor:pointer;font-weight:800}
.nc-layout{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:15px;padding:4px 18px 0}
.nc-main{min-width:0}.nc-heading{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:0 2px 9px}
.nc-overline{font-size:11px;letter-spacing:.2em;color:#61eeff;font-weight:900}.nc-title{font-size:clamp(27px,4vw,43px);letter-spacing:-.075em;line-height:1;margin:4px 0 2px;font-weight:1000;color:#fda5f6;text-shadow:0 0 16px #c631ff83}
.nc-sub{font-size:12px;color:#adbee3}.nc-rival{color:#fff;font-weight:850}
.nc-progress-text{font-size:12px;font-weight:900;font-variant-numeric:tabular-nums;color:#eed6ff;white-space:nowrap}
.nc-stage{width:100%;position:relative;aspect-ratio:1.88;border:1px solid #d060ff80;background:#090b23;border-radius:12px;overflow:hidden;box-shadow:0 0 28px #bd44ee33,inset 0 0 30px #0009}
.nc-stage canvas.nc-canvas{width:100%;height:100%;display:block}
.nc-stage canvas.nc-note-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:4}
.nc-mask.nc-daisy .nc-cabinet{border-color:#ff70d5;box-shadow:0 0 60px #e33be555}
.nc-mask.nc-daisy .nc-logo{color:#ffa1eb}.nc-mask.nc-daisy .nc-title{color:#fff0fd;text-shadow:0 0 17px #fb47d9}
.nc-mask.nc-daisy .nc-stage{background:radial-gradient(circle at 60% 45%,#522266,#0d0926 75%)}
.nc-dance-actor{position:absolute;z-index:2;left:32%;top:0;width:40%;height:100%;pointer-events:none;display:none;filter:drop-shadow(0 0 22px #ef56dc75);overflow:hidden}
.nc-daisy .nc-dance-actor{display:block}
.nc-dance-actor canvas{position:absolute;inset:0;width:100%;height:100%}
.nc-dance-hud{position:absolute;z-index:3;left:12px;right:12px;top:11px;display:none;align-items:center;justify-content:space-between;pointer-events:none;gap:8px}
.nc-daisy .nc-dance-hud{display:flex}
.nc-dance-tag{font-size:11px;font-weight:900;letter-spacing:.09em;color:#fff;background:#35133dcc;border:1px solid #f487e0;padding:7px 10px;border-radius:40px;box-shadow:0 0 12px #fb54d766}
.nc-dance-fever{height:10px;width:24%;min-width:55px;max-width:158px;border-radius:20px;background:#201132;border:1px solid #d9a3f8;overflow:hidden;box-shadow:0 0 12px #aa54ff80}
.nc-dance-fever>div{height:100%;width:0;background:linear-gradient(90deg,#ff61c8,#ffcb59);transition:width .15s}
.nc-daisy-import{display:inline-block;cursor:pointer;margin:6px 8px;padding:9px 12px;background:#531c64;border:1px solid #e98dec;border-radius:10px;font-size:12px;font-weight:900;color:#fff;text-align:center}.nc-daisy-import-status{font-size:11px;color:#d9bbeb;margin:2px auto 9px;max-width:360px}
.nc-dance-comment{position:absolute;bottom:13px;right:10px;z-index:3;max-width:42%;padding:7px 12px;border-radius:12px;border:1px solid #f683e8;background:#230e3edc;color:#fce6ff;font-size:11px;font-weight:700;line-height:1.3;text-shadow:0 1px 3px #000;box-shadow:0 0 15px #ea4cdd44;pointer-events:none;display:none}
.nc-daisy .nc-dance-comment{display:block}
.nc-daisy .nc-eval{z-index:4;top:48%}
@media(max-width:700px){.nc-dance-actor{left:27%;width:53%;top:7%;height:83%}.nc-dance-comment{bottom:55px;font-size:10px;max-width:49%}.nc-dance-tag{font-size:9px}}
.nc-eval{position:absolute;left:0;right:0;top:53%;text-align:center;font-size:clamp(22px,4vw,40px);font-weight:1000;font-style:italic;color:#fff5b1;text-shadow:0 0 10px #ff45db,3px 3px #a12fe2;pointer-events:none;opacity:0;transition:opacity .13s}
.nc-side{display:flex;flex-direction:column;gap:10px;padding-top:24px}
.nc-stat{padding:15px 10px;text-align:center;background:linear-gradient(125deg,#1c1746,#140f2e);border:2px solid #c23bff;border-radius:11px;box-shadow:0 0 19px #ca52fb3b,inset 0 0 14px #bc47ff15}
.nc-stat:nth-child(2){border-color:#ffb552;box-shadow:0 0 17px #fc9c3736}.nc-stat:nth-child(3){border-color:#4de4ff;box-shadow:0 0 17px #42cbff35}
.nc-stat small{display:block;letter-spacing:.14em;color:#7ceeff;font-size:11px;font-weight:900;margin-bottom:5px}.nc-stat strong{display:block;color:#e5d7ff;font-size:clamp(25px,3vw,37px);font-variant-numeric:tabular-nums;letter-spacing:-.05em;white-space:nowrap}.nc-stat:nth-child(2) strong{color:#ffd28a}
.nc-pads{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12px 0 6px}.nc-pad{border:1px solid var(--c);border-bottom:4px solid var(--c);border-radius:10px;background:linear-gradient(180deg,#17284d,#111029);color:#fff;padding:10px 7px;min-height:52px;font-size:15px;font-weight:950;cursor:pointer;touch-action:manipulation;box-shadow:inset 0 0 15px color-mix(in srgb,var(--c),transparent 80%),0 0 15px color-mix(in srgb,var(--c),transparent 75%)}
.nc-pad:active,.nc-pad.nc-lit{background:var(--c);color:#0a0c20}
.nc-foot{display:flex;gap:15px;align-items:center;justify-content:space-between;padding:9px 20px 14px;color:#a7a3d2;font-size:12px}
.nc-meter{background:#27183f;border-radius:40px;height:5px;flex:1;overflow:hidden}.nc-meter>div{height:100%;width:0;background:linear-gradient(90deg,#46eaff,#fc48d1,#ffc262);box-shadow:0 0 12px #fc5efa}
.nc-overlay{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(165deg,#080825eb,#170c37f7);padding:18px;backdrop-filter:blur(6px)}
.nc-overlay[hidden]{display:none}.nc-overlay-inner{max-width:530px}.nc-chip{font-size:11px;color:#6dfff4;font-weight:900;letter-spacing:.25em}
.nc-overlay h2{font-size:clamp(35px,5vw,62px);line-height:1;letter-spacing:-.07em;margin:13px 0;background:linear-gradient(100deg,#ff78eb,#fff,#70d7ff);background-clip:text;color:transparent;text-shadow:0 0 40px #ff6de22a}
.nc-overlay p{color:#d8d4f5;line-height:1.6;font-size:14px;max-width:440px;margin:10px auto}
.nc-action{border:0;border-radius:10px;padding:13px 21px;min-height:47px;font-weight:950;font-size:14px;background:linear-gradient(115deg,#ffe27b,#ffa34c);color:#1d1533;cursor:pointer;margin:8px 5px;box-shadow:0 5px 20px #ffb84d33}.nc-secondary{color:#e8d7fb;background:#302354;border:1px solid #9272c2}
.nc-grade{display:inline-grid;place-items:center;width:85px;height:85px;border-radius:50%;border:3px solid #ffe28c;color:#ffd86d;font-size:63px;font-weight:1000;text-shadow:0 0 22px #ffa747;box-shadow:0 0 25px #ffa94755;margin:5px}
.nc-resultscore{font-size:clamp(32px,5vw,56px);font-weight:1000;color:#ff95f0;font-variant-numeric:tabular-nums}
.nc-detail{font-size:12px;color:#bdb5db}
@media(max-width:700px){.nc-layout{grid-template-columns:1fr;padding:4px 9px 0;gap:0}.nc-side{flex-direction:row;padding-top:10px;gap:6px}.nc-stat{flex:1;padding:8px 3px;border-width:1px}.nc-stat strong{font-size:clamp(17px,4.5vw,25px)}.nc-stat small{font-size:9px}.nc-stage{aspect-ratio:1.2}.nc-bar{padding:8px 12px 3px}.nc-title{font-size:32px}.nc-foot{padding:6px 11px 10px}.nc-overlay{padding:9px}.nc-overlay p{font-size:12px}}
@media(prefers-reduced-motion:reduce){.nc-eval{transition:none}}
`;
const PATTERN=[0,1,2,1,0,2,1,0,1,2,0,1,2,0,2,1,0,1,2,1,0,2,0,1];
const STEP=610,DAISY_STEP=60000/136,LEAD=1700,TRAVEL=1600,WINDOW=190,REPEATS=10;
const LONG_PATTERN=Array.from({length:REPEATS},()=>PATTERN).flat();
const COLORS=['#40dafa','#ffbd55','#ff55cb'];
let active=null;
// Original, programmatic four-beat backing track. No external music assets.
function startArcadeAudio(bpm,leadMs){
 const AudioContextClass=root.AudioContext||root.webkitAudioContext;
 if(!AudioContextClass)return null;
 let ac,clock=null,step=0,next=0,stopped=false;
 try{ac=new AudioContextClass();ac.resume().catch(()=>{});}catch(_){return null;}
 const master=ac.createGain();master.gain.value=.15;master.connect(ac.destination);
 const noise=ac.createBuffer(1,Math.floor(ac.sampleRate*.16),ac.sampleRate);
 const samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
 const tone=(when,freq,duration,wave,volume,endFreq)=>{
  const osc=ac.createOscillator(),env=ac.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,when);
  if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),when+duration);
  env.gain.setValueAtTime(.0001,when);env.gain.exponentialRampToValueAtTime(volume,when+.006);
  env.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(env);env.connect(master);osc.start(when);osc.stop(when+duration+.02);
 };
 const percussion=(when,volume,filterFreq,decay)=>{
  const src=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain();
  src.buffer=noise;filter.type='highpass';filter.frequency.value=filterFreq;
  gain.gain.setValueAtTime(volume,when);gain.gain.exponentialRampToValueAtTime(.0001,when+decay);
  src.connect(filter);filter.connect(gain);gain.connect(master);src.start(when);src.stop(when+decay+.008);
 };
 const beatSeconds=60/bpm;
 next=ac.currentTime+leadMs/1000;
 const bass=[82.41,82.41,110,82.41,98,98,123.47,73.42];
 function schedule(){
  if(stopped)return;
  while(next<ac.currentTime+.22){
   const beat=step%8,section=step%4;
   if(section===0||section===2)tone(next,155,.17,'sine',.8,45);
   if(section===1||section===3)percussion(next,.18,1350,.115);
   for(let subdivision=0;subdivision<2;subdivision++)
    percussion(next+subdivision*beatSeconds/2,.045,6200,.035);
   tone(next,bass[beat],beatSeconds*.56,'sawtooth',.06);
   if(beat===7)tone(next+beatSeconds*.5,164.81,.14,'triangle',.055);
   next+=beatSeconds;step++;
  }
 }
 schedule();clock=setInterval(schedule,45);
 return {stop(){if(stopped)return;stopped=true;clearInterval(clock);master.gain.setTargetAtTime(.0001,ac.currentTime,.05);setTimeout(()=>ac.close().catch(()=>{}),220);}};
}
function open(options={}){
 if(active||typeof options.onComplete!=='function')return false;
 if(!document.getElementById('neo-circuit-v2-style')){const st=document.createElement('style');st.id='neo-circuit-v2-style';st.textContent=CSS;document.head.append(st);}
 const isDaisy=String(options.characterId||options.id||options.name||'').toLowerCase().includes('daisy');
 const host=document.createElement('section');host.className='nc-mask'+(isDaisy?' nc-daisy':'');host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-label',isDaisy?'Daisy Dance Battle rhythm game':'Neon Circuit arcade rhythm game');
 host.innerHTML='<div class="nc-cabinet"><header class="nc-bar"><div class="nc-logo">◈ &nbsp; PIXEL PALACE / NEON CIRCUIT</div><button class="nc-close" type="button">EXIT ×</button></header><div class="nc-layout"><div class="nc-main"><div class="nc-heading"><div><span class="nc-overline">ARCADE RUSH · RHYTHM CHALLENGE</span><h1 class="nc-title">NEON CIRCUIT</h1><div class="nc-sub">Playing against <span class="nc-rival"></span></div></div><span class="nc-progress-text">0:00 / 0:16</span></div><div class="nc-stage"><canvas class="nc-canvas" aria-label="Three-lane rhythm track"></canvas><canvas class="nc-note-canvas" aria-hidden="true"></canvas><div class="nc-dance-actor"><canvas class="nc-actor-canvas" aria-label="Daisy rhythmic animation"></canvas></div><div class="nc-dance-hud"><span class="nc-dance-tag">♫ DAISY · DANCE BATTLE</span><div class="nc-dance-fever"><div class="nc-fever-fill"></div></div></div><div class="nc-dance-comment" aria-live="polite">Come on, keep up! ♥</div><div class="nc-eval"></div><div class="nc-overlay"><div class="nc-overlay-inner"><div class="nc-chip">PIXEL PALACE · ARCADE RUSH</div><h2>BEAT THE CIRCUIT</h2><p>Hit notes as they meet the glowing line. Press <b>A / S / D</b> or tap the three colored buttons. Build a combo and beat your rival’s score.</p><button type="button" class="nc-action nc-start">START CHALLENGE</button><button type="button" class="nc-action nc-secondary nc-cancel">NOT NOW</button></div></div></div><div class="nc-pads"><button class="nc-pad" data-lane="0" style="--c:#40dafa" type="button">A · LEFT</button><button class="nc-pad" data-lane="1" style="--c:#ffbd55" type="button">S · CENTER</button><button class="nc-pad" data-lane="2" style="--c:#ff55cb" type="button">D · RIGHT</button></div></div><aside class="nc-side"><div class="nc-stat"><small>SCORE</small><strong class="nc-score">000000</strong></div><div class="nc-stat"><small>COMBO</small><strong class="nc-combo">× 0</strong></div><div class="nc-stat"><small>ACCURACY</small><strong class="nc-accuracy">100%</strong></div></aside></div><footer class="nc-foot"><span>⌨ A · S · D &nbsp; / &nbsp; TAP</span><div class="nc-meter"><div class="nc-meter-fill"></div></div><span>ESC TO EXIT</span></footer></div>';
 if(isDaisy){
  host.innerHTML=host.innerHTML.replace('PIXEL PALACE / NEON CIRCUIT','PIXEL PALACE / DANCE BATTLE').replace('NEON CIRCUIT</h1>','DANCE BATTLE</h1>').replace('ARCADE RUSH · RHYTHM CHALLENGE','DAISY · ELECTRIC HEART · DANCE CHALLENGE').replace('BEAT THE CIRCUIT','DANCE WITH DAISY').replace('NEON CIRCUIT · RUN COMPLETE','DANCE BATTLE · FINISHED');
 }
 document.body.append(host);
 const $=q=>host.querySelector(q),$$=q=>Array.from(host.querySelectorAll(q));
 $('.nc-rival').textContent=options.name||'your rival';
 const canvas=$('.nc-canvas'),ctx=canvas.getContext('2d'),notesCanvas=$('.nc-note-canvas'),notesCtx=notesCanvas.getContext('2d');
 if(!ctx||!notesCtx){host.remove();return false;}
 const previous=document.activeElement;
 const session={host,frame:0,playing:false,finished:false,audio:null,start:0,notes:LONG_PATTERN.map((lane,i)=>({lane,at:LEAD+i*(isDaisy?DAISY_STEP:STEP),done:false})),duration:LEAD+(LONG_PATTERN.length-1)*(isDaisy?DAISY_STEP:STEP)+WINDOW+200,fever:0,score:0,combo:0,best:0,hits:0,misses:0,quality:0,particles:[],fxUntil:0,feedbackTimer:0,lastTime:0};
 active=session;
 const asClock=ms=>{const n=Math.floor(ms/1000);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
 $('.nc-progress-text').textContent='0:00 / '+asClock(session.duration);
 const dancer=isDaisy?setupDaisyActor($('.nc-actor-canvas')):null;
 if(isDaisy){
  const begin=$('.nc-start'),pick=document.createElement('label'),upload=document.createElement('input');
  pick.className='nc-daisy-import';pick.textContent='✦ USAR MI IMAGEN DE DAISY';
  pick.title='Elegí el PNG de Daisy. Se guarda únicamente en este navegador.';
  upload.type='file';upload.accept='image/png,image/webp,image/jpeg';upload.style.display='none';
  pick.append(upload);begin.before(pick);
  const status=document.createElement('div');status.className='nc-daisy-import-status';
  status.textContent='Podés cargar tu PNG de Daisy para usarlo en este Dance Battle.';pick.after(status);
  upload.addEventListener('change',()=>{
   const file=upload.files?.[0];if(!file)return;
   const temp=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{try{
    const maxWidth=768,scale=Math.min(1,maxWidth/img.naturalWidth),c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const value=c.toDataURL('image/webp',.82);
    try{localStorage.setItem('neo-daisy-dance-portrait',value);}catch(_){}
    dancer?.setSource(value);status.textContent='✓ PNG de Daisy cargado para esta partida.';
   }catch(_){status.textContent='No se pudo preparar la imagen.';}finally{URL.revokeObjectURL(temp);}};
   img.onerror=()=>{URL.revokeObjectURL(temp);status.textContent='No se pudo abrir el archivo.';};img.src=temp;
  });
 }

 const RG=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);};
 function resetCanvas(){const r=canvas.getBoundingClientRect();const dpr=Math.min(2,root.devicePixelRatio||1);const w=Math.max(1,Math.floor(r.width*dpr)),h=Math.max(1,Math.floor(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}if(notesCanvas.width!==w||notesCanvas.height!==h){notesCanvas.width=w;notesCanvas.height=h;}ctx.setTransform(w/800,0,0,h/445,0,0);notesCtx.setTransform(w/800,0,0,h/445,0,0);}
 const project=(lane,p)=>{const y=73+Math.pow(Math.max(0,Math.min(1,p)),1.27)*304;const width=110+Math.pow(p,1.1)*474;const center=400;const left=center-width/2;return{x:left+width*(lane+.5)/3,y,w:width/3};};
 function glowLine(x1,y1,x2,y2,color,width=2){ctx.save();ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=15;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
 function scene(time){
  resetCanvas();
  if(dancer)dancer.render(time||0,session.fever/100);
  const bg=ctx.createLinearGradient(0,0,0,445);bg.addColorStop(0,'#08102b');bg.addColorStop(.7,'#170d36');bg.addColorStop(1,'#070b24');ctx.fillStyle=bg;ctx.fillRect(0,0,800,445);
  // Arcade room: atmospheric neon signs and cabinet silhouettes behind the lane.
  ctx.fillStyle='#160d38';for(let i=0;i<10;i++){const x=i*94-30;ctx.fillRect(x,80+(i%3)*15,60,240);ctx.fillStyle='#2d164a';ctx.fillRect(x+8,97+(i%3)*15,44,70);ctx.fillStyle='#170e34';}
  ctx.save();ctx.shadowColor='#ff37c4';ctx.shadowBlur=22;ctx.strokeStyle='#ff4fd7';ctx.lineWidth=3;ctx.strokeRect(38,52,122,60);ctx.fillStyle='#ff7de7';ctx.font='italic 900 25px system-ui';ctx.fillText('PIXEL',53,84);ctx.font='italic 900 16px system-ui';ctx.fillText('PALACE',56,106);ctx.restore();
  ctx.save();ctx.shadowColor='#49d7ff';ctx.shadowBlur=20;ctx.strokeStyle='#6cdbff';ctx.lineWidth=3;ctx.strokeRect(659,50,100,68);ctx.fillStyle='#6de9ff';ctx.font='900 16px system-ui';ctx.fillText('ARCADE',671,77);ctx.fillStyle='#fdd26f';ctx.fillText('RUSH',678,98);ctx.restore();
  // Arcade-themed neon mascots are decorative only.
  ctx.save();ctx.strokeStyle='#9a56ff';ctx.lineWidth=4;ctx.shadowColor='#af5aff';ctx.shadowBlur=17;ctx.beginPath();ctx.moveTo(48,338);ctx.lineTo(64,288);ctx.lineTo(81,318);ctx.lineTo(104,277);ctx.lineTo(122,318);ctx.lineTo(143,338);ctx.lineTo(122,365);ctx.lineTo(63,365);ctx.closePath();ctx.stroke();ctx.restore();
  ctx.save();ctx.strokeStyle='#f8ca50';ctx.shadowColor='#f2bd36';ctx.shadowBlur=20;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(671,347);ctx.lineTo(686,290);ctx.lineTo(703,314);ctx.lineTo(727,279);ctx.lineTo(746,328);ctx.lineTo(739,368);ctx.lineTo(683,368);ctx.closePath();ctx.stroke();ctx.restore();
  const horizon=73,base=445;
  // Synthwave grid behind the trapezoid.
  for(let i=0;i<9;i++){let y=190+i*i*3.7;glowLine(0,y,800,y,'#7427b055',1);}
  for(let i=-9;i<=9;i++)glowLine(400+i*10,horizon,400+i*92,base,'#c136ff44',1);
  // True perspective lane board drawn in canvas (hit positions match screen).
  ctx.beginPath();ctx.moveTo(345,horizon);ctx.lineTo(455,horizon);ctx.lineTo(692,base);ctx.lineTo(108,base);ctx.closePath();const laneGrad=ctx.createLinearGradient(0,horizon,0,base);laneGrad.addColorStop(0,'#0b153bdc');laneGrad.addColorStop(1,'#070d21f5');ctx.fillStyle=laneGrad;ctx.fill();
  for(let i=0;i<3;i++){ctx.beginPath();const leftTop=345+i*110/3,leftBottom=108+i*584/3;ctx.moveTo(leftTop,horizon);ctx.lineTo(leftTop+110/3,horizon);ctx.lineTo(leftBottom+584/3,base);ctx.lineTo(leftBottom,base);ctx.closePath();ctx.fillStyle=['#17406e42','#6e431a30','#6c176b3e'][i];ctx.fill();}
  for(let i=0;i<=3;i++){glowLine(345+i*110/3,horizon,108+i*584/3,base,['#34dffe','#a052f2','#f59a5e','#f44bc7'][i],i===0||i===3?3:2);}
  for(let j=0;j<9;j++){const p=(j/9+((time||0)*.00009)%1)%1;const y=73+p*p*304;const w=110+p*474;glowLine(400-w/2,y,400+w/2,y,'#928eff30',1);}
  const lineY=377;glowLine(156,lineY,644,lineY,'#ffffff',5);
  if(!isDaisy){const renderCtx=ctx;
  for(const n of session.notes){if(n.done)continue;const p=1-(n.at-(time||0))/TRAVEL;if(p<0||p>1.08)continue;const pos=project(n.lane,p),w=Math.max(14,pos.w*.72),h=Math.max(7,11+20*p),col=COLORS[n.lane];renderCtx.save();renderCtx.shadowColor=col;renderCtx.shadowBlur=18+12*p;renderCtx.fillStyle=col;RG(pos.x-w/2,pos.y-h/2,w,h,5);renderCtx.fill();renderCtx.strokeStyle='#fffc';renderCtx.lineWidth=1.5;renderCtx.stroke();renderCtx.restore();}
  // Projected hit zone and hardware symbols.
  for(let lane=0;lane<3;lane++){const p=project(lane,1),x=p.x;renderCtx.save();renderCtx.fillStyle='#13102bcc';renderCtx.strokeStyle=COLORS[lane];renderCtx.shadowColor=COLORS[lane];renderCtx.shadowBlur=22;renderCtx.lineWidth=3;RG(x-29,390,58,44,10);renderCtx.fill();renderCtx.stroke();renderCtx.fillStyle='#fff';renderCtx.font='900 24px system-ui';renderCtx.textAlign='center';renderCtx.fillText('ASD'[lane],x,419);renderCtx.restore();}
  }
  for(const particle of session.particles){const life=(performance.now()-particle.born)/particle.duration;if(life>=1)continue;ctx.save();ctx.globalAlpha=1-life;ctx.fillStyle=particle.color;ctx.shadowColor=particle.color;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(particle.x+particle.vx*life,particle.y+particle.vy*life,particle.radius*(1-life*.7),0,Math.PI*2);ctx.fill();ctx.restore();}
  renderNoteOverlay(time||0);
 }
 function renderNoteOverlay(time){
  notesCtx.clearRect(0,0,800,445);
  if(!isDaisy)return;
  const renderCtx=notesCtx;
  for(const n of session.notes){
   if(n.done)continue;
   const p=1-(n.at-time)/TRAVEL;
   if(p<0||p>1.08)continue;
   const pos=project(n.lane,p),w=Math.max(14,pos.w*.72),h=Math.max(7,11+20*p),col=COLORS[n.lane];
   renderCtx.save();renderCtx.shadowColor=col;renderCtx.shadowBlur=18+12*p;renderCtx.fillStyle=col;
   RGOverlay(renderCtx,pos.x-w/2,pos.y-h/2,w,h,5);renderCtx.fill();renderCtx.strokeStyle='#fffc';renderCtx.lineWidth=1.5;renderCtx.stroke();renderCtx.restore();
  }
  renderCtx.save();renderCtx.strokeStyle='#ffffff';renderCtx.shadowColor='#ff66cf';renderCtx.shadowBlur=20;renderCtx.lineWidth=5;
  renderCtx.beginPath();renderCtx.moveTo(156,377);renderCtx.lineTo(644,377);renderCtx.stroke();renderCtx.restore();
  for(let lane=0;lane<3;lane++){
   const p=project(lane,1),x=p.x;
   renderCtx.save();renderCtx.fillStyle='#13102bcc';renderCtx.strokeStyle=COLORS[lane];renderCtx.shadowColor=COLORS[lane];
   renderCtx.shadowBlur=22;renderCtx.lineWidth=3;
   RGOverlay(renderCtx,x-29,390,58,44,10);renderCtx.fill();renderCtx.stroke();
   renderCtx.fillStyle='#fff';renderCtx.font='900 24px system-ui';renderCtx.textAlign='center';renderCtx.fillText('ASD'[lane],x,419);renderCtx.restore();
  }
 }
 function RGOverlay(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
 function cleanup(cancel){if(active!==session)return;session.audio?.stop();if(dancer)dancer.dispose();cancelAnimationFrame(session.frame);clearTimeout(session.feedbackTimer);document.removeEventListener('keydown',keydown,true);root.removeEventListener('resize',resize);host.remove();active=null;if(previous?.isConnected&&previous.focus)previous.focus({preventScroll:true});if(cancel)options.onCancel?.();}
 function hud(){if(isDaisy){$('.nc-fever-fill').style.width=session.fever+'%';}$('.nc-score').textContent=String(session.score).padStart(6,'0');$('.nc-combo').textContent='× '+session.combo;$('.nc-accuracy').textContent=(session.hits+session.misses?Math.round(session.quality/(session.hits+session.misses)):100)+'%';}
 function feedback(message,good=true,lane=1){const x=$('.nc-eval');x.textContent=message;x.style.color=good?'#ffe7a0':'#ff7cbb';x.style.opacity='1';clearTimeout(session.feedbackTimer);session.feedbackTimer=setTimeout(()=>{if(host.isConnected)x.style.opacity='0';},330);if(isDaisy&&good){$('.nc-dance-comment').textContent=session.combo>=12?'You really can dance! ♥':session.combo>=5?'That’s the rhythm! Keep going!':'Nice move!';}else if(isDaisy&&!good){$('.nc-dance-comment').textContent='You’ve got this — follow my lead!';}if(good){const pos=project(lane,1);for(let i=0;i<15;i++){const a=Math.PI*2*i/15;session.particles.push({x:pos.x,y:377,vx:Math.cos(a)*(28+(i%3)*17),vy:Math.sin(a)*(25+(i%4)*12),born:performance.now(),duration:410+(i%3)*110,color:COLORS[lane],radius:2+(i%3)});}session.particles=session.particles.slice(-100);}}
 function press(lane){if(!session.playing)return;const elapsed=performance.now()-session.start;let target=null,closest=Infinity;for(const n of session.notes){const d=Math.abs(n.at-elapsed);if(!n.done&&n.lane===lane&&d<closest){closest=d;target=n;}}
 const pad=$$('.nc-pad')[lane];pad.classList.add('nc-lit');setTimeout(()=>{if(pad.isConnected)pad.classList.remove('nc-lit');},110);
 if(!target||closest>WINDOW){feedback('OFF BEAT',false,lane);return;}target.done=true;session.hits++;session.combo++;session.fever=Math.min(100,session.fever+5);session.best=Math.max(session.best,session.combo);const pts=closest<75?100:closest<135?75:45;session.quality+=pts;session.score+=(pts===100?1000:pts===75?650:350)+Math.min(500,session.combo*20);feedback(pts===100?'PERFECT ✦':pts===75?'GREAT!':'GOOD',true,lane);hud();}
 function keydown(e){if(active!==session)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cleanup(true);return;}if(e.repeat||!session.playing)return;const key=e.key.length===1?e.key.toLowerCase():e.key;const lane={a:0,s:1,d:2,ArrowLeft:0,ArrowDown:1,ArrowRight:2}[key];if(lane!==undefined){e.preventDefault();e.stopPropagation();press(lane);}}
 function resize(){if(active===session&&!session.playing)scene(0);}
 document.addEventListener('keydown',keydown,true);root.addEventListener('resize',resize);
 $$('.nc-pad').forEach(p=>p.addEventListener('pointerdown',e=>{e.preventDefault();press(Number(p.dataset.lane));}));
 $('.nc-close').addEventListener('click',()=>cleanup(true));$('.nc-cancel').addEventListener('click',()=>cleanup(true));
 function finish(){session.playing=false;session.finished=true;session.audio?.stop();cancelAnimationFrame(session.frame);const accuracy=Math.round(session.quality/session.notes.length),grade=accuracy>=93?'S':accuracy>=80?'A':accuracy>=65?'B':accuracy>=45?'C':'D',win=session.score>=155000;const result={game:'arcade_highscore',score:session.score,accuracy,bestCombo:session.best,grade,win};
 $('.nc-overlay').hidden=false;$('.nc-overlay').innerHTML='<div class="nc-overlay-inner"><div class="nc-chip">NEON CIRCUIT · RUN COMPLETE</div><h2>'+(win?'NEW HIGH SCORE!':'CHALLENGE COMPLETE')+'</h2><div class="nc-grade">'+grade+'</div><div class="nc-resultscore">'+String(session.score).padStart(6,'0')+'</div><p>Accuracy <b>'+accuracy+'%</b> · Max Combo <b>'+session.best+'×</b><br>'+(win?'You beat the arcade target!':'Your rival keeps the record for now.')+'</p><button type="button" class="nc-action nc-claim">SEE CHARACTER REACTION</button></div>';
 $('.nc-claim').addEventListener('click',()=>{if(active!==session)return;cleanup(false);options.onComplete(result);},{once:true});$('.nc-claim').focus();}
 function frame(now){if(!session.playing||active!==session)return;const elapsed=now-session.start;for(const n of session.notes){if(!n.done&&elapsed>n.at+WINDOW){n.done=true;session.combo=0;session.fever=Math.max(0,session.fever-25);session.misses++;feedback('MISS',false,n.lane);hud();}}
 scene(elapsed);session.particles=session.particles.filter(p=>now-p.born<p.duration);
 $('.nc-meter-fill').style.width=Math.min(100,elapsed/session.duration*100)+'%';$('.nc-progress-text').textContent=asClock(Math.min(elapsed,session.duration))+' / '+asClock(session.duration);
 if(elapsed>=session.duration){finish();return;}session.frame=requestAnimationFrame(frame);}
 $('.nc-start').addEventListener('click',()=>{if(session.playing||session.finished)return;session.playing=true;$('.nc-overlay').hidden=true;session.start=performance.now();session.audio=startArcadeAudio(isDaisy?136:60000/STEP,LEAD);session.frame=requestAnimationFrame(frame);hud();},{once:true});
 scene(0);$('.nc-start').focus();return true;
}
// A bounded, continuous inverse-warp on the *existing* Daisy sprite.
 // No disconnected pieces, no external music, and no change to RPG rewards.
 function setupDaisyActor(canvas){
  const c=canvas.getContext('2d',{alpha:true});
  if(!c)return {render(){},dispose(){}};
  const src=document.createElement('canvas'),sc=src.getContext('2d',{willReadFrequently:true});
  const out=document.createElement('canvas'),oc=out.getContext('2d');
  const img=new Image();let original=null,ready=false,last=-Infinity,disposed=false;
  const W=210,H=290;
  canvas.width=W;canvas.height=H;src.width=out.width=W;src.height=out.height=H;
  img.onload=()=>{
   if(disposed)return;
   sc.clearRect(0,0,W,H);
   // Original RPG art; portrait crop favors the face and upper body.
   sc.drawImage(img,0,0,img.naturalWidth,img.naturalHeight,6,9,W-12,H-18);
   original=sc.getImageData(0,0,W,H);ready=true;
  };
  img.onerror=()=>{if(!disposed&&!img.src.includes('/idle.png'))img.src='/rpg-assets/characters/daisy/idle.png';};
  let storedPortrait=null;try{storedPortrait=localStorage.getItem('neo-daisy-dance-portrait');}catch(_){}
  img.src=storedPortrait||'/rpg-assets/characters/daisy/dance-portrait.webp';
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const mask=(nx,ny,z)=>{const r=Math.hypot((nx-z.x)/z.rx,(ny-z.y)/z.ry);return r>=1?0:(1-smooth(Math.max(0,(r-.45)/.55)))**2;};
  function render(ms,fever=0){
   if(!ready||disposed||ms-last<75)return;last=ms;
   const phase=ms*.001*136/60*Math.PI*.93;
   const data=oc.createImageData(W,H),dst=data.data,sp=original.data;
   // Centers calibrated against the approved Daisy chest-zone reference.
   // With the new portrait (full image, not cropped), the region is below the face.
   const L={x:.365,y:.60,rx:.205,ry:.145},R={x:.645,y:.60,rx:.195,ry:.145};
   const bp=Math.sin(2*phase-.5),pL=Math.sin(2*phase-.4),pR=Math.sin(2*phase-.68);
   for(let y=0;y<H;y++){const ny=(y+.5)/H;for(let x=0;x<W;x++){
    const nx=(x+.5)/W,wl=mask(nx,ny,L),wr=mask(nx,ny,R);
    const dx=.012*4*bp*(wl*(nx-L.x)/L.rx+wr*(nx-R.x)/R.rx);
    const dy=.005*(wl*pL+wr*pR)+.004*bp*(wl*(ny-L.y)/L.ry+wr*(ny-R.y)/R.ry);
    const sx=Math.max(0,Math.min(W-1,(nx-dx)*W)),sy=Math.max(0,Math.min(H-1,(ny-dy)*H));
    const x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(W-1,x0+1),y1=Math.min(H-1,y0+1);
    const tx=sx-x0,ty=sy-y0,i=(y*W+x)*4;
    for(let k=0;k<4;k++){const a=sp[(y0*W+x0)*4+k],b=sp[(y0*W+x1)*4+k],d=sp[(y1*W+x0)*4+k],e=sp[(y1*W+x1)*4+k];dst[i+k]=(a*(1-tx)+b*tx)*(1-ty)+(d*(1-tx)+e*tx)*ty;}
   }}
   oc.putImageData(data,0,0);
   c.clearRect(0,0,W,H);
   // Fever builds the vertical dance energy; the viewport stays fixed at the approved waist-up crop.
   // Keep the movement bounded in sprite pixels so the face remains inside the camera at max Fever.
   const feverLevel=Math.max(0,Math.min(1,fever));
   const bounceAmplitude=2.7+5.5*feverLevel;
   const bounce=Math.sin(2*phase)*bounceAmplitude;
   const tilt=Math.sin(phase)*.018;
   c.save();c.translate(W/2,H*.54+bounce);c.rotate(tilt);c.drawImage(out,-W/2,-H*.54,W,H);c.restore();
  }
  return {render,setSource(value){ready=false;last=-Infinity;img.src=value;},dispose(){disposed=true;img.onload=img.onerror=null;}};
 }
 root.NeoRpgArcadeGame=Object.freeze({open,isOpen:()=>!!active});
})(window);
