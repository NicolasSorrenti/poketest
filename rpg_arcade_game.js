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
.nc-stage canvas{width:100%;height:100%;display:block}
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
const STEP=610,LEAD=1700,TRAVEL=1600,WINDOW=190,DURATION=LEAD+(PATTERN.length-1)*STEP+WINDOW+200;
const COLORS=['#40dafa','#ffbd55','#ff55cb'];
let active=null;
function open(options={}){
 if(active||typeof options.onComplete!=='function')return false;
 if(!document.getElementById('neo-circuit-v2-style')){const st=document.createElement('style');st.id='neo-circuit-v2-style';st.textContent=CSS;document.head.append(st);}
 const host=document.createElement('section');host.className='nc-mask';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-label','Neon Circuit arcade rhythm game');
 host.innerHTML='<div class="nc-cabinet"><header class="nc-bar"><div class="nc-logo">◈ &nbsp; PIXEL PALACE / NEON CIRCUIT</div><button class="nc-close" type="button">EXIT ×</button></header><div class="nc-layout"><div class="nc-main"><div class="nc-heading"><div><span class="nc-overline">ARCADE RUSH · RHYTHM CHALLENGE</span><h1 class="nc-title">NEON CIRCUIT</h1><div class="nc-sub">Playing against <span class="nc-rival"></span></div></div><span class="nc-progress-text">0:00 / 0:16</span></div><div class="nc-stage"><canvas class="nc-canvas" aria-label="Three-lane rhythm track"></canvas><div class="nc-eval"></div><div class="nc-overlay"><div class="nc-overlay-inner"><div class="nc-chip">PIXEL PALACE · ARCADE RUSH</div><h2>BEAT THE CIRCUIT</h2><p>Hit notes as they meet the glowing line. Press <b>A / S / D</b> or tap the three colored buttons. Build a combo and beat your rival’s score.</p><button type="button" class="nc-action nc-start">START CHALLENGE</button><button type="button" class="nc-action nc-secondary nc-cancel">NOT NOW</button></div></div></div><div class="nc-pads"><button class="nc-pad" data-lane="0" style="--c:#40dafa" type="button">A · LEFT</button><button class="nc-pad" data-lane="1" style="--c:#ffbd55" type="button">S · CENTER</button><button class="nc-pad" data-lane="2" style="--c:#ff55cb" type="button">D · RIGHT</button></div></div><aside class="nc-side"><div class="nc-stat"><small>SCORE</small><strong class="nc-score">000000</strong></div><div class="nc-stat"><small>COMBO</small><strong class="nc-combo">× 0</strong></div><div class="nc-stat"><small>ACCURACY</small><strong class="nc-accuracy">100%</strong></div></aside></div><footer class="nc-foot"><span>⌨ A · S · D &nbsp; / &nbsp; TAP</span><div class="nc-meter"><div class="nc-meter-fill"></div></div><span>ESC TO EXIT</span></footer></div>';
 document.body.append(host);
 const $=q=>host.querySelector(q),$$=q=>Array.from(host.querySelectorAll(q));
 $('.nc-rival').textContent=options.name||'your rival';
 const canvas=$('.nc-canvas'),ctx=canvas.getContext('2d');
 if(!ctx){host.remove();return false;}
 const previous=document.activeElement;
 const session={host,frame:0,playing:false,finished:false,start:0,notes:PATTERN.map((lane,i)=>({lane,at:LEAD+i*STEP,done:false})),score:0,combo:0,best:0,hits:0,misses:0,quality:0,particles:[],fxUntil:0,feedbackTimer:0,lastTime:0};
 active=session;
 const RG=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);};
 function resetCanvas(){const r=canvas.getBoundingClientRect();const dpr=Math.min(2,root.devicePixelRatio||1);const w=Math.max(1,Math.floor(r.width*dpr)),h=Math.max(1,Math.floor(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(w/800,0,0,h/445,0,0);}
 const project=(lane,p)=>{const y=73+Math.pow(Math.max(0,Math.min(1,p)),1.27)*304;const width=110+Math.pow(p,1.1)*474;const center=400;const left=center-width/2;return{x:left+width*(lane+.5)/3,y,w:width/3};};
 function glowLine(x1,y1,x2,y2,color,width=2){ctx.save();ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=15;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
 function scene(time){
  resetCanvas();
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
  for(const n of session.notes){if(n.done)continue;const p=1-(n.at-(time||0))/TRAVEL;if(p<0||p>1.08)continue;const pos=project(n.lane,p),w=Math.max(14,pos.w*.72),h=Math.max(7,11+20*p),col=COLORS[n.lane];ctx.save();ctx.shadowColor=col;ctx.shadowBlur=18+12*p;ctx.fillStyle=col;RG(pos.x-w/2,pos.y-h/2,w,h,5);ctx.fill();ctx.strokeStyle='#fffc';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();}
  // Projected hit zone and hardware symbols.
  for(let lane=0;lane<3;lane++){const p=project(lane,1),x=p.x;ctx.save();ctx.fillStyle='#13102bcc';ctx.strokeStyle=COLORS[lane];ctx.shadowColor=COLORS[lane];ctx.shadowBlur=22;ctx.lineWidth=3;RG(x-29,390,58,44,10);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 24px system-ui';ctx.textAlign='center';ctx.fillText('ASD'[lane],x,419);ctx.restore();}
  for(const particle of session.particles){const life=(performance.now()-particle.born)/particle.duration;if(life>=1)continue;ctx.save();ctx.globalAlpha=1-life;ctx.fillStyle=particle.color;ctx.shadowColor=particle.color;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(particle.x+particle.vx*life,particle.y+particle.vy*life,particle.radius*(1-life*.7),0,Math.PI*2);ctx.fill();ctx.restore();}
 }
 function cleanup(cancel){if(active!==session)return;cancelAnimationFrame(session.frame);clearTimeout(session.feedbackTimer);document.removeEventListener('keydown',keydown,true);root.removeEventListener('resize',resize);host.remove();active=null;if(previous?.isConnected&&previous.focus)previous.focus({preventScroll:true});if(cancel)options.onCancel?.();}
 function hud(){$('.nc-score').textContent=String(session.score).padStart(6,'0');$('.nc-combo').textContent='× '+session.combo;$('.nc-accuracy').textContent=(session.hits+session.misses?Math.round(session.quality/(session.hits+session.misses)):100)+'%';}
 function feedback(message,good=true,lane=1){const x=$('.nc-eval');x.textContent=message;x.style.color=good?'#ffe7a0':'#ff7cbb';x.style.opacity='1';clearTimeout(session.feedbackTimer);session.feedbackTimer=setTimeout(()=>{if(host.isConnected)x.style.opacity='0';},330);if(good){const pos=project(lane,1);for(let i=0;i<15;i++){const a=Math.PI*2*i/15;session.particles.push({x:pos.x,y:377,vx:Math.cos(a)*(28+(i%3)*17),vy:Math.sin(a)*(25+(i%4)*12),born:performance.now(),duration:410+(i%3)*110,color:COLORS[lane],radius:2+(i%3)});}session.particles=session.particles.slice(-100);}}
 function press(lane){if(!session.playing)return;const elapsed=performance.now()-session.start;let target=null,closest=Infinity;for(const n of session.notes){const d=Math.abs(n.at-elapsed);if(!n.done&&n.lane===lane&&d<closest){closest=d;target=n;}}
 const pad=$$('.nc-pad')[lane];pad.classList.add('nc-lit');setTimeout(()=>{if(pad.isConnected)pad.classList.remove('nc-lit');},110);
 if(!target||closest>WINDOW){feedback('OFF BEAT',false,lane);return;}target.done=true;session.hits++;session.combo++;session.best=Math.max(session.best,session.combo);const pts=closest<75?100:closest<135?75:45;session.quality+=pts;session.score+=(pts===100?1000:pts===75?650:350)+Math.min(500,session.combo*20);feedback(pts===100?'PERFECT ✦':pts===75?'GREAT!':'GOOD',true,lane);hud();}
 function keydown(e){if(active!==session)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cleanup(true);return;}if(e.repeat||!session.playing)return;const key=e.key.length===1?e.key.toLowerCase():e.key;const lane={a:0,s:1,d:2,ArrowLeft:0,ArrowDown:1,ArrowRight:2}[key];if(lane!==undefined){e.preventDefault();e.stopPropagation();press(lane);}}
 function resize(){if(active===session&&!session.playing)scene(0);}
 document.addEventListener('keydown',keydown,true);root.addEventListener('resize',resize);
 $$('.nc-pad').forEach(p=>p.addEventListener('pointerdown',e=>{e.preventDefault();press(Number(p.dataset.lane));}));
 $('.nc-close').addEventListener('click',()=>cleanup(true));$('.nc-cancel').addEventListener('click',()=>cleanup(true));
 function finish(){session.playing=false;session.finished=true;cancelAnimationFrame(session.frame);const accuracy=Math.round(session.quality/PATTERN.length),grade=accuracy>=93?'S':accuracy>=80?'A':accuracy>=65?'B':accuracy>=45?'C':'D',win=session.score>=15500;const result={game:'arcade_highscore',score:session.score,accuracy,bestCombo:session.best,grade,win};
 $('.nc-overlay').hidden=false;$('.nc-overlay').innerHTML='<div class="nc-overlay-inner"><div class="nc-chip">NEON CIRCUIT · RUN COMPLETE</div><h2>'+(win?'NEW HIGH SCORE!':'CHALLENGE COMPLETE')+'</h2><div class="nc-grade">'+grade+'</div><div class="nc-resultscore">'+String(session.score).padStart(6,'0')+'</div><p>Accuracy <b>'+accuracy+'%</b> · Max Combo <b>'+session.best+'×</b><br>'+(win?'You beat the arcade target!':'Your rival keeps the record for now.')+'</p><button type="button" class="nc-action nc-claim">SEE CHARACTER REACTION</button></div>';
 $('.nc-claim').addEventListener('click',()=>{if(active!==session)return;cleanup(false);options.onComplete(result);},{once:true});$('.nc-claim').focus();}
 function frame(now){if(!session.playing||active!==session)return;const elapsed=now-session.start;for(const n of session.notes){if(!n.done&&elapsed>n.at+WINDOW){n.done=true;session.combo=0;session.misses++;feedback('MISS',false,n.lane);hud();}}
 scene(elapsed);session.particles=session.particles.filter(p=>now-p.born<p.duration);
 $('.nc-meter-fill').style.width=Math.min(100,elapsed/DURATION*100)+'%';const secs=Math.min(16,Math.floor(elapsed/1000));$('.nc-progress-text').textContent='0:'+String(secs).padStart(2,'0')+' / 0:16';
 if(elapsed>=DURATION){finish();return;}session.frame=requestAnimationFrame(frame);}
 $('.nc-start').addEventListener('click',()=>{if(session.playing||session.finished)return;session.playing=true;$('.nc-overlay').hidden=true;session.start=performance.now();session.frame=requestAnimationFrame(frame);hud();},{once:true});
 scene(0);$('.nc-start').focus();return true;
}
root.NeoRpgArcadeGame=Object.freeze({open,isOpen:()=>!!active});
})(window);
