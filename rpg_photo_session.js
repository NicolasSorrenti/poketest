
'use strict';
// Neo Campus Photo Session. Render-only minigame. Only the RPG controller
// awards credits, advances time, and saves metadata after a completed session.
(function(root){
 const BASE='/rpg-assets/characters/barb/';
 const PORTRAIT=['neutral','happy','surprised','determined','irritated','vulnerable'];
 const CANDID=['walking','chatting','lounge','back-view'];
 const labels={
  neutral:'Relaxed',happy:'Happy',surprised:'Surprised',determined:'Confident',
  irritated:'Teasing',vulnerable:'Shy',walking:'Walking',chatting:'Chatting',
  lounge:'Relaxing','back-view':'Looking away'
 };
 const captions={
  neutral:'Barb: "How do you want me to stand?"',
  happy:'Barb: "That is a smile you can keep!"',
  surprised:'Barb: "You really surprised me there!"',
  determined:'Barb: "Okay, serious model face. Got it!"',
  irritated:'Barb: "That angle? You are kidding!"',
  vulnerable:'Barb: "This one feels a little more personal."',
  walking:'Barb: "I will walk by. Catch me when you are ready!"',
  chatting:'Barb: "It is easier when we just talk!"',
  lounge:'Barb: "Now this is how I like to relax."',
  'back-view':'Barb: "The river looks lovely from here."'
 };
 const POSES=[...PORTRAIT.map(id=>({id,kind:'portrait',src:BASE+'expressionsv2/'+id+'.png'})),
  ...CANDID.map(id=>({id,kind:'candid',src:BASE+'overworld/'+id+'.png'}))];
 const TASKS=[
  {name:'A joyful portrait',pose:'happy',framing:'close',light:'warm',
   hint:'Catch a genuine smile up close with warm lighting.'},
  {name:'A walk by the river',pose:'walking',framing:'full',light:'bright',
   hint:'Capture Barb in motion, showing her full pose.'},
  {name:'A relaxed afternoon',pose:'lounge',framing:'medium',light:'soft',
   hint:'A calm medium shot, gently lit.'},
  {name:'An unexpected reaction',pose:'surprised',framing:'close',light:'bright',
   hint:'Get close and capture her surprise.'},
  {name:'Casual conversation',pose:'chatting',framing:'medium',light:'warm',
   hint:'Catch Barb chatting naturally in a medium shot.'},
  {name:'Quiet confidence',pose:'determined',framing:'medium',light:'soft',
   hint:'A composed portrait with soft lighting.'},
  {name:'Riverside silhouette',pose:'back-view',framing:'full',light:'warm',
   hint:'A scenic full-body shot from behind.'}
 ];

 // Each prompt is a short performance with a genuine photo window.
 // The requested pose appears only after the player's action, not from a checklist.
 const REACTIONS=[
  {id:'joke',label:'😄 Tell a joke',name:'Make her laugh',
   frames:[{pose:'surprised',duration:1050,line:'Barb: "Wait, what?"'},
    {pose:'happy',duration:1850,highlight:true,line:'Barb: "Pfft—okay, that was actually funny!"'},
    {pose:'irritated',duration:1050,line:'Barb: "Don’t get too proud of yourself!"'}]},
  {id:'walk',label:'🚶 Walk together',name:'A walk by the river',
   frames:[{pose:'chatting',duration:1150,line:'Barb: "You set the pace!"'},
    {pose:'walking',duration:2050,highlight:true,line:'Barb: "Quick, this is a good spot!"'},
    {pose:'back-view',duration:1150,line:'Barb: "Look at the water from here."'}]},
  {id:'designs',label:'✏️ Ask about designs',name:'A focused designer',
   frames:[{pose:'neutral',duration:900,line:'Barb: "My latest idea?"'},
    {pose:'determined',duration:1850,highlight:true,line:'Barb: "I know exactly how I want it to look."'},
    {pose:'happy',duration:1250,line:'Barb: "Thanks for listening."'}]},
  {id:'relax',label:'☕ Take a break',name:'Unposed and relaxed',
   frames:[{pose:'chatting',duration:1000,line:'Barb: "We have time for a break, right?"'},
    {pose:'lounge',duration:1950,highlight:true,line:'Barb: "This is actually pretty nice."'},
    {pose:'neutral',duration:1200,line:'Barb: "One more photo?"'}]},
  {id:'compliment',label:'💬 Compliment her',name:'A shy smile',
   frames:[{pose:'surprised',duration:900,line:'Barb: "You mean that?"'},
    {pose:'vulnerable',duration:1900,highlight:true,line:'Barb: "Okay… now I’m embarrassed."'},
    {pose:'happy',duration:1200,line:'Barb: "You make this difficult!"'}]}
 ];
 const REACTION_TASKS=[
  {name:'Catch a genuine laugh',pose:'happy',framing:'close',light:'warm',
   hint:'Make Barb laugh. Get close and capture the smile before it fades.',action:'joke'},
  {name:'A spontaneous riverside shot',pose:'walking',framing:'full',light:'bright',
   hint:'Ask Barb to walk. Catch her mid-step in a wide frame.',action:'walk'},
  {name:'The focused designer',pose:'determined',framing:'medium',light:'soft',
   hint:'Ask about her designs. Catch her confident expression.',action:'designs'}
 ];
 const frameZoom={close:1.9,medium:1.42,full:1.06};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const $=(el,q)=>el.querySelector(q);
 let active=null;
 function ensureStyle(){
  if(document.getElementById('neo-photo-session-style'))return;
  const link=document.createElement('link');
  link.id='neo-photo-session-style';link.rel='stylesheet';
  link.href='/rpg_photo_session.css?v=barb-photo-v3';
  document.head.append(link);
 }
 function pickTasks(){
  const sorted=[TASKS[0],TASKS[1],TASKS[2+Math.floor(Math.random()*(TASKS.length-2))]];
  return sorted.sort(()=>Math.random()-.5);
 }
 function pose(id){return POSES.find(p=>p.id===id)||POSES[0];}
 function open(options={}){
  if(active||typeof document==='undefined')return false;
  const npc=String(options.characterId||'barb').toLowerCase();
  if(npc!=='barb')return false; // Only use assets inspected and approved for this character.
  ensureStyle();
  const session={
   name:options.name||'Barb',freePlay:!!options.freePlay,
   savedAlbum:Array.isArray(options.savedAlbum)?options.savedAlbum.slice(-24):[],
   onCancel:options.onCancel,onComplete:options.onComplete,closed:false,
   mode:'reactions',poseId:'neutral',light:'warm',zoom:1.3,x:0,y:0,shots:[],
   tasks:REACTION_TASKS.slice(),auto:false,imageSequence:0,clock:null,interval:null,
   available:true,animation:null,reviewOpen:false,begin:performance.now(),
   reaction:null,reactionSerial:0,reactionBusy:false,reactionTimer:null,
   motion:null,motionReady:false,motionResolve:null,preload:new Map()
  };
  active=session;
  const shell=document.createElement('div');
  shell.className='nps-root';
  shell.classList.toggle('nps-discreet',document.documentElement.dataset.rpgDiscreet==='on');
  shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');
  shell.setAttribute('aria-label','Photo Session with Barb');
  shell.innerHTML='<div class="nps-shell">'+
   '<header class="nps-top"><div><div class="nps-kicker">NEO CAMPUS · RIVERSIDE PARK</div>'+
   '<h2>📷 Photo Session · Barb</h2></div><div class="nps-top-right">'+
   '<span data-shotcount>Shot 1 / 3</span><strong data-score>0 pts</strong>'+
   '<button type="button" class="nps-btn nps-help" data-help>❔ Help</button>'+
   '<button type="button" class="nps-btn nps-close" data-close>✕ Close</button></div></header>'+
   '<div class="nps-goal"><div class="nps-brief-copy"><div class="nps-step-tag">PHOTO BRIEF · <span data-brief-index>1 OF 3</span></div>'+
   '<strong data-goal>Preparing the camera…</strong><p data-hint></p></div>'+
   '<div class="nps-checklist" aria-label="Live photo goal checklist">'+
   '<span class="nps-check" data-check-pose>Pose</span>'+
   '<span class="nps-check" data-check-framing>Framing</span>'+
   '<span class="nps-check" data-check-light>Lighting</span>'+
   '<span class="nps-check" data-check-moment>Moment</span></div></div>'+
   '<div class="nps-main"><div class="nps-stage" data-stage data-light="warm">'+
   '<img class="nps-actor" data-actor alt="Barb posing for the camera">'+
   '<canvas class="nps-actor nps-motion-actor" data-motion aria-label="Barb animated pose"></canvas>'+
   '<div class="nps-silhouette" aria-label="Character artwork hidden">◇</div>'+
   '<div class="nps-frame" aria-hidden="true"></div><div class="nps-cross" aria-hidden="true"></div>'+
   '<div class="nps-meter">✦ SHUTTER MOMENT<div class="nps-meter-track"><span data-meter></span></div><span class="nps-meter-label" data-meter-label>Start an interaction to catch a moment</span></div>'+
   '<div class="nps-caption" data-caption>Barb: "Ready when you are!"</div>'+
   '<div class="nps-loading" data-loading>Loading Barb’s artwork…</div></div>'+
   '<div class="nps-controls">'+
   '<section class="nps-section"><h3>📸 Session style</h3>'+
   '<div class="nps-mode"><button class="nps-btn" data-mode="reactions">🎭 Reactions</button>'+
   '<button class="nps-btn" data-mode="portrait">Directed</button>'+
   '<button class="nps-btn" data-mode="candid">Candid</button></div>'+
   '<div class="nps-camerarow" data-auto-wrap><button class="nps-btn" data-auto type="button">Auto poses: Off</button></div></section>'+
   '<section class="nps-section nps-react-actions" data-reactions>'+
   '<h3>💬 Interact with Barb</h3><p class="nps-hint">Choose what to say. Barb reacts in a short sequence. Capture the perfect expression!</p>'+
   '<div class="nps-react-grid" data-reaction-actions></div>'+
   '<p class="nps-react-status" data-reaction-status>Choose an interaction to begin.</p></section>'+
   '<section class="nps-section" data-pose-section><h3>✦ Barb’s poses / moods</h3><div class="nps-choice-grid" data-poses></div></section>'+
   '<section class="nps-section"><h3>☀ Lighting</h3><div class="nps-choice-grid">'+
   '<button class="nps-btn" data-light="soft">Soft</button>'+
   '<button class="nps-btn" data-light="warm">Warm</button>'+
   '<button class="nps-btn" data-light="bright">Bright</button></div></section>'+
   '<section class="nps-section"><h3>⊕ Camera zoom</h3>'+
   '<div class="nps-camerarow"><button class="nps-btn" data-zoom-out type="button">−</button>'+
   '<input aria-label="Camera zoom" data-zoom type="range" min="1" max="2.5" step=".01" value="1.3">'+
   '<button class="nps-btn" data-zoom-in type="button">+</button></div>'+
   '<div class="nps-framing-guide"><span>Full body</span><span>Medium</span><span>Close-up</span></div>'+
   '<p class="nps-hint">Use zoom for the requested frame. Drag Barb toward the center. When the framing indicator turns green, you are ready.</p>'+
   '<button class="nps-btn" data-reset type="button">Reset camera</button></section></div></div>'+
   '<footer class="nps-bottom"><div class="nps-mini-album" data-mini><div class="nps-mini-photo">3 shots to take</div></div>'+
   '<div class="nps-snaps"><span class="nps-snap-status" data-next-action>Match the brief, then snap when the meter is full.</span>'+
   '<button class="nps-btn" data-album>View album</button>'+
   '<button class="nps-btn nps-primary" data-snap>📷 SNAP!</button></div></footer></div>';
  document.body.append(shell);
  session.shell=shell;
  const stage=$(shell,'[data-stage]'),actor=$(shell,'[data-actor]'),
   loading=$(shell,'[data-loading]'),poseBox=$(shell,'[data-poses]'),
   zoomInput=$(shell,'[data-zoom]'),motionCanvas=$(shell,'[data-motion]');
  function camera(){
   actor.style.setProperty('--zoom',String(session.zoom));
   motionCanvas.style.setProperty('--zoom',String(session.zoom));
   motionCanvas.style.setProperty('--pan-x',session.x+'px');
   motionCanvas.style.setProperty('--pan-y',session.y+'px');
   actor.style.setProperty('--pan-x',session.x+'px');
   actor.style.setProperty('--pan-y',session.y+'px');
   const silhouette=$(shell,'.nps-silhouette');
   silhouette.style.setProperty('--zoom',String(session.zoom));
   silhouette.style.setProperty('--pan-x',session.x+'px');
   silhouette.style.setProperty('--pan-y',session.y+'px');
   zoomInput.value=String(session.zoom);
   updateFeedback();
  }
  function setZoom(value){
   session.zoom=clamp(Number(value)||1,1,2.5);camera();
  }
  // All reaction frames are preloaded before a sequence begins.
  // This avoids surprise blank frames when flipping between overworld and portraits.
  function preloadPose(id){
   if(session.preload.has(id))return session.preload.get(id);
   const src=pose(id).src;
   const promise=new Promise(resolve=>{
    if(shell.classList.contains('nps-discreet')){resolve(true);return;}
    const im=new Image();
    im.onload=()=>{im.decode?.().catch(()=>{}).finally(()=>resolve(true))||resolve(true);};
    im.onerror=()=>resolve(false);
    im.src=src;
   });
   session.preload.set(id,promise);
   return promise;
  }
  function setMood(id,opts={}){
   const target=pose(id);
   if(session.closed)return Promise.resolve(false);
   const fromReaction=!!opts.fromReaction;
   const seq=++session.imageSequence;
   session.poseId=target.id;
   if(!fromReaction){
    stopReaction();
    session.mode=target.kind;
    session.auto=false;
   }
   drawChoices();
   updateFeedback();
   $(shell,'[data-caption]').textContent=opts.line||captions[target.id];
   if(session.motionResolve){session.motionResolve(false);session.motionResolve=null;}
   if(shell.classList.contains('nps-discreet')){
    loading.hidden=true;
    return Promise.resolve(true);
   }
   // Keep the previous rendered frame as a still until the new animation
   // has actually loaded; crossfade only after the new canvas is ready.
   if(session.motionReady){
    try{actor.src=motionCanvas.toDataURL('image/png');}
    catch{actor.src=pose(id).src;}
    actor.style.opacity='1';
    motionCanvas.style.opacity='0';
   }
   session.motionReady=false;
   loading.hidden=!!actor.src; // Keep the previous frame visible; don't flash a loader.
   if(!loading.hidden)loading.textContent='Loading '+labels[target.id]+' pose…';
   return new Promise(resolve=>{
    const done=(okay)=>{
     if(session.imageSequence!==seq||session.closed){resolve(false);return;}
     loading.hidden=true;
     if(!okay){
      actor.src=target.src;
      actor.style.opacity='1';
      motionCanvas.style.opacity='0';
     }
     resolve(okay);
    };
    if(session.motion){
     session.motionResolve=done;
     session.motion.setSource(target.src);
    }else{
     const image=new Image();
     image.onload=()=>{if(session.imageSequence===seq){actor.src=target.src;done(true);}};
     image.onerror=()=>done(false);
     image.src=target.src;
    }
   });
  }
  // Cancel every pending timeline when closing, retrying, changing mode,
  // or capturing; callbacks are tied to a monotonic serial number.
  function stopReaction(){
   session.reactionSerial++;
   session.reaction=null;
   session.reactionBusy=false;
   clearTimeout(session.reactionTimer);
   session.reactionTimer=null;
   if(session.reactionCancel){session.reactionCancel();session.reactionCancel=null;}
   updateFeedback();
  }
  async function playReaction(id){
   const action=REACTIONS.find(a=>a.id===id);
   if(!action||session.closed||session.reviewOpen)return;
   stopReaction();
   session.mode='reactions';session.auto=false;session.reactionBusy=true;
   const serial=session.reactionSerial;
   drawChoices();
   const status=$(shell,'[data-reaction-status]');
   status.textContent='Barb is getting ready…';
   loading.hidden=false;
   loading.textContent='Preparing Barb’s reactions…';
   const prepared=await Promise.all(action.frames.map(frame=>preloadPose(frame.pose)));
   if(session.closed||serial!==session.reactionSerial)return;
   loading.hidden=true;
   if(prepared.some(ok=>!ok)){
    status.textContent='Some images did not load. Please try again.';
    session.reactionBusy=false;drawChoices();return;
   }
   for(let i=0;i<action.frames.length;i++){
    if(session.closed||serial!==session.reactionSerial)return;
    const frame=action.frames[i];
    const ready=await setMood(frame.pose,{fromReaction:true,silent:true,line:frame.line});
    if(session.closed||serial!==session.reactionSerial)return;
    if(!ready){
     status.textContent='Could not show this reaction. Please retry.';
     break;
    }
    const started=performance.now();
    session.reaction={id:action.id,pose:frame.pose,highlight:!!frame.highlight,
     start:started,duration:frame.duration};
    status.textContent=frame.highlight?'📷 PHOTO OPPORTUNITY! Capture Barb now!':
     'Barb: '+(i===0?'Reacting…':'The moment is changing…');
    updateFeedback();
    await new Promise(resolve=>{
     session.reactionCancel=resolve;
     session.reactionTimer=setTimeout(()=>{session.reactionCancel=null;resolve();},frame.duration);
    });
    if(session.closed||serial!==session.reactionSerial)return;
   }
   if(session.closed||serial!==session.reactionSerial)return;
   session.reactionBusy=false;session.reaction=null;
   status.textContent='The moment passed. Try another interaction.';
   await setMood('neutral',{fromReaction:true,silent:true});
   drawChoices();updateFeedback();
  }
  // One canvas instance per session, shared with the rhythm game's renderer.
  // No local torso warping: only low-amplitude whole-sprite motion for photos.
  if(!shell.classList.contains('nps-discreet')&&root.NeoRpgSpriteDeformer?.create){
   try{
    session.motion=root.NeoRpgSpriteDeformer.create(motionCanvas,{
     fit:'contain',cropTop:0,cropHeight:1,
     width:270,height:440,fps:22,tempo:78,speed:.9,
     baseBounce:1.3,feverBounce:1.9,tilt:.011,zones:[],
     onReady:()=>{
      if(session.closed)return;
      session.motionReady=true;
      motionCanvas.style.opacity='1';
      actor.style.opacity='0';
      loading.hidden=true;
      const done=session.motionResolve;session.motionResolve=null;
      if(done)done(true);
     },
     onError:()=>{
      session.motionReady=false;
      const done=session.motionResolve;session.motionResolve=null;
      if(done)done(false);
     }
    });
   }catch(error){
    console.warn('Photo sprite motion unavailable, falling back to portraits',error);
   }
  }
  function drawChoices(){
   poseBox.replaceChildren();
   $(shell,'[data-mode=reactions]').classList.toggle('is-selected',session.mode==='reactions');
   $(shell,'[data-mode=portrait]').classList.toggle('is-selected',session.mode==='portrait');
   $(shell,'[data-mode=candid]').classList.toggle('is-selected',session.mode==='candid');
   const reacting=session.mode==='reactions';
   $(shell,'[data-pose-section]').hidden=reacting;
   $(shell,'[data-reactions]').hidden=!reacting;
   $(shell,'[data-auto-wrap]').hidden=reacting;
   const actionList=$(shell,'[data-reaction-actions]');
   if(actionList&&!actionList.childElementCount){
    for(const action of REACTIONS){
     const b=document.createElement('button');
     b.type='button';b.className='nps-btn';
     b.textContent=action.label;
     b.onclick=()=>{void playReaction(action.id);};
     actionList.append(b);
    }
   }
   if(actionList)for(const b of actionList.children)b.disabled=session.reactionBusy||session.reviewOpen;
   const list=session.mode==='portrait'?PORTRAIT:CANDID;
   for(const id of list){
    const b=document.createElement('button');
    b.type='button';b.className='nps-btn';
    b.textContent=labels[id];b.classList.toggle('is-selected',id===session.poseId);
    b.setAttribute('aria-pressed',String(id===session.poseId));
    b.onclick=()=>setMood(id);
    poseBox.append(b);
   }
   $(shell,'[data-auto]').textContent='Auto poses: '+(session.auto?'On':'Off');
   for(const btn of shell.querySelectorAll('button[data-light]')){
    btn.classList.toggle('is-selected',btn.dataset.light===session.light);
   }
  }
  function taskUI(){
   const task=session.tasks[session.shots.length];
   if(!task)return;
   $(shell,'[data-shotcount]').textContent='Shot '+(session.shots.length+1)+' / 3';
   $(shell,'[data-brief-index]').textContent=(session.shots.length+1)+' OF 3';
   $(shell,'[data-goal]').textContent=task.name;
   $(shell,'[data-hint]').textContent=task.hint;
   $(shell,'[data-score]').textContent=session.shots.reduce((v,p)=>v+p.score,0)+' pts';
   updateFeedback();
  }
  function currentMeter(){
   if(session.mode==='reactions'){
    const r=session.reaction;
    if(!r?.highlight)return 0;
    const t=clamp((performance.now()-r.start)/r.duration,0,1);
    return clamp(1-Math.abs(t-.47)*2.2,0,1);
   }
   return .5+.5*Math.sin((performance.now()-session.begin)/620);
  }
  function updateFeedback(){
   const task=session.tasks[session.shots.length];
   if(!task||session.closed)return;
   const reacting=session.mode==='reactions';
   const poseGood=session.poseId===task.pose&&(!reacting||!!session.reaction?.highlight);
   const frameGood=Math.abs(session.zoom-frameZoom[task.framing])<=.22;
   const centered=Math.hypot(session.x,session.y)<=Math.max(45,stage.clientWidth*.13);
   const lightGood=session.light===task.light;
   const momentGood=currentMeter()>=.78;
   const myFrame=session.zoom>=1.66?'Close-up':session.zoom>=1.23?'Medium':'Full body';
   function check(key,good,message){
    const el=$(shell,'[data-check-'+key+']');
    if(!el)return;
    el.dataset.ready=String(good);
    el.textContent=(good?'✓ ':'○ ')+message;
   }
   check('pose',poseGood,(reacting?'Reaction: ':'Pose: ')+labels[task.pose]+(poseGood?'':
    (reacting?' · interact':pose(task.pose).kind!==session.mode?' · '+(pose(task.pose).kind==='candid'?'Candid':'Directed'):' · select')));
   check('framing',frameGood&&centered,'Frame: '+({close:'Close-up',medium:'Medium',full:'Full body'}[task.framing])+
    (frameGood&&centered?' ✓':(!frameGood?' · now '+myFrame:' · center Barb')));
   check('light',lightGood,'Light: '+({soft:'Soft',warm:'Warm',bright:'Bright'}[task.light]));
   check('moment',momentGood,'Moment: '+(momentGood?'NOW!':reacting?'Trigger reaction':'Wait for bar'));
   let next;
   if(reacting&&!poseGood)next=session.reactionBusy?'Wait for '+labels[task.pose]+' to appear…':
    'Interact with Barb! Try '+REACTIONS.find(a=>a.id===task.action)?.label+'.';
   else if(!poseGood)next=pose(task.pose).kind!==session.mode?
    'First: switch to '+(pose(task.pose).kind==='candid'?'Candid':'Directed')+' mode, then choose '+labels[task.pose]+'.':
    'First: choose the '+labels[task.pose]+' pose.';
   else if(!frameGood)next='Next: adjust zoom until Frame turns green.';
   else if(!centered)next='Next: drag Barb toward the center.';
   else if(!lightGood)next='Next: choose '+task.light+' light.';
   else if(!momentGood)next='Almost ready! Wait for the moment bar to fill.';
   else next='PERFECT SETUP! Press SNAP now!';
   const helper=$(shell,'[data-next-action]');
   if(helper)helper.textContent=next;
   const shutter=$(shell,'[data-snap]');
   if(shutter)shutter.classList.toggle('nps-ready',poseGood&&frameGood&&centered&&lightGood&&momentGood);
  }
  function showGuide(){
   if(session.closed||$(shell,'.nps-instructions'))return;
   const guide=document.createElement('div');
   guide.className='nps-instructions';
   guide.setAttribute('role','dialog');guide.setAttribute('aria-label','How to play Photo Session');
   guide.innerHTML='<div class="nps-guide-card">'+
    '<div class="nps-step-tag">A QUICK GUIDE · THREE PHOTOS</div>'+
    '<h3>How to play 📷</h3>'+
    '<p>Barb reacts to what you say. This time, the goal is not to select a pose: it is to <b>cause</b> a reaction and photograph it while it happens.</p>'+
    '<div class="nps-guide-steps">'+
    '<div><b>1 · Talk to Barb</b><div>Choose an interaction on the right, like telling a joke, walking with her or asking about her designs.</div></div>'+
    '<div><b>2 · Prepare your shot</b><div>Adjust your zoom and lighting. Barb will change poses and expressions during the interaction.</div></div>'+
    '<div><b>3 · Catch the reaction!</b><div>When Barb shows the requested expression, the bar fills briefly. SNAP before the moment ends! Retry without penalty.</div></div></div>'+
    '<p>There is no countdown between interactions. A reaction itself is brief, but you can trigger it again. Directed and Candid modes remain available for free posing.</p>'+
    '<div class="nps-guide-actions"><button type="button" class="nps-btn nps-primary" data-start-shooting>Got it · Start shooting!</button></div></div>';
   $(shell,'.nps-shell').append(guide);
   $(guide,'[data-start-shooting]').onclick=()=>guide.remove();
   $(guide,'[data-start-shooting]').focus();
  }
  function tick(){
   if(session.closed)return;
   if(session.motionReady&&session.motion&&!shell.classList.contains('nps-discreet')){
    const energy=session.reaction?.highlight ? .75 : session.reactionBusy ? .35 : 0;
    session.motion.render(performance.now()-session.begin,energy);
   }
   const moment=currentMeter();
   stage.dataset.reacting=String(!!session.reactionBusy);
   stage.dataset.peak=String(!!session.reaction?.highlight&&moment>.64);
   $(shell,'[data-meter]').style.transform='scaleX('+moment.toFixed(3)+')';
   const ready=moment>=.78;
   const label=$(shell,'[data-meter-label]');
   if(label.dataset.ready!==String(ready)){
    label.dataset.ready=String(ready);
    label.textContent=ready?'✨ NOW! Take the shot!':session.mode==='reactions'?
     (session.reactionBusy?'Watch Barb’s expression…':'Start an interaction to catch a moment'):
     'Wait for the bar to fill…';
    updateFeedback();
   }
   session.clock=requestAnimationFrame(tick);
  }
  function startAuto(){
   if(session.interval)clearInterval(session.interval);
   session.interval=setInterval(()=>{
    if(session.closed||!session.auto||!document.body.contains(shell))return;
    const pool=session.mode==='portrait'?PORTRAIT:CANDID;
    let next=pool[(pool.indexOf(session.poseId)+1)%pool.length];
    setMood(next);
    session.auto=true;
    drawChoices();
   },3900);
  }
  function photoScore(){
   const task=session.tasks[session.shots.length];
   const selected=pose(session.poseId);
   const posePoints=session.mode==='reactions'?
    (task.pose===selected.id&&session.reaction?.highlight?35:
     task.pose===selected.id?12:2):
    (task.pose===selected.id?35:pose(task.pose).kind===selected.kind?14:2);
   const framing=clamp(1-Math.abs(session.zoom-frameZoom[task.framing])/1.1,0,1);
   const panPenalty=clamp(1-Math.hypot(session.x,session.y)/Math.max(120,stage.clientWidth*.53),0,1);
   const comp=Math.round(30*framing*(.6+.4*panPenalty));
   const lightPoints=task.light===session.light?15:5;
   const timing=Math.round(20*currentMeter());
   return {score:clamp(posePoints+comp+lightPoints+timing,0,100),
    pose:posePoints,framing:comp,light:lightPoints,moment:timing};
  }
  function showAlbum(){
   const stored=session.savedAlbum.filter(p=>p?.character==='barb');
   const combined=[...stored,...session.shots].slice(-24).reverse();
   const report=document.createElement('div');
   report.className='nps-report';
   const title=document.createElement('h3');title.textContent='📸 Barb’s photo album';
   const subtitle=document.createElement('p');
   subtitle.textContent=combined.length?'Saved compositions and photographs from this session.':'No photos yet. Start shooting!';
   report.append(title,subtitle);
   const list=document.createElement('div');
   list.className='nps-report-items';
   combined.forEach(p=>{
    const card=document.createElement('div');card.className='nps-score-card';
    const strong=document.createElement('strong');strong.textContent=(p.score||0)+'/100';
    const small=document.createElement('small');
    small.textContent=(labels[p.pose]||'Photo')+' · '+(p.framing||'frame');
    card.append(strong,small);
    // Rebuild thumbnails from asset paths. Do not store large bitmap data in cloud saves.
    if(!shell.classList.contains('nps-discreet')){
     const preview=document.createElement('div');
     preview.style.cssText='position:relative;width:128px;height:94px;overflow:hidden;border-radius:7px;margin:0 auto 6px;background:#273a57 url(/rpg-assets/locations/panoramas/park-day.webp) center/cover';
     const image=document.createElement('img');image.src=pose(p.pose).src;
     image.alt=labels[p.pose]||'Barb pose';
     image.loading='lazy';
     image.style.cssText='position:absolute;left:50%;bottom:-2%;height:99%;width:80%;object-fit:contain;object-position:bottom center;transform-origin:center 66%;transform:translate(calc(-50% + '+Math.round((p.x||0)*.25)+'px),'+Math.round((p.y||0)*.25)+'px) scale('+(p.zoom||1)+')';
     preview.append(image);card.prepend(preview);
    }
    list.append(card);
   });
   report.append(list);
   const b=document.createElement('button');
   b.className='nps-btn';b.textContent='← Back to camera';
   report.append(b);
   $(shell,'.nps-shell').append(report);
   $(shell,'.nps-main').hidden=true;
   $(shell,'.nps-bottom').hidden=true;
   $(shell,'.nps-goal').hidden=true;
   b.onclick=()=>{report.remove();$(shell,'.nps-main').hidden=false;$(shell,'.nps-bottom').hidden=false;$(shell,'.nps-goal').hidden=false;};
  }
  function snap(){
   if(session.reviewOpen||session.shots.length>=3||!loading.hidden)return;
   const task=session.tasks[session.shots.length];
   const points=photoScore();
   const shot={character:'barb',day:null,pose:session.poseId,framing:task.framing,
    light:session.light,zoom:Number(session.zoom.toFixed(2)),
    x:Math.round(session.x),y:Math.round(session.y),score:points.score,task:task.name};
   // The animation can be moving. Freeze the current *rendered* frame before
   // stopping the timeline; metadata only is stored in the campaign save.
   let frozen=null;
   if(session.motionReady&&session.motion){
    session.motion.render(performance.now()-session.begin,session.reaction?.highlight ? .75 : 0);
    try{frozen=motionCanvas.toDataURL('image/png');}catch{}
   }
   stopReaction();
   showReview(shot,points,frozen);
  }
  function showReview(shot,points,frozen=null){
   session.reviewOpen=true;
   const review=document.createElement('div');
   review.className='nps-review';
   review.setAttribute('role','dialog');
   review.setAttribute('aria-label','Review your photo');
   review.innerHTML='<div class="nps-guide-card nps-review-card">'+
    '<div class="nps-step-tag">PHOTO REVIEW · SHOT '+(session.shots.length+1)+' OF 3</div>'+
    '<h3>'+points.score+' / 100 points</h3>'+
    '<div class="nps-review-content">'+
    '<div class="nps-review-preview" data-preview></div>'+
    '<div><div class="nps-review-breakdown" data-breakdown></div>'+
    '<p class="nps-review-message" data-review-message></p></div></div>'+
    '<div class="nps-guide-actions">'+
    '<button type="button" class="nps-btn" data-retry>↻ Try again</button>'+
    '<button type="button" class="nps-btn nps-primary" data-keep>✓ Keep photo</button>'+
    '</div></div>';
   const preview=$(review,'[data-preview]');
   preview.dataset.light=shot.light;
   if(!shell.classList.contains('nps-discreet')){
    const img=document.createElement('img');
    img.src=frozen||pose(shot.pose).src;
    img.alt='Your photo of Barb in the '+labels[shot.pose]+' pose';
    img.style.transform='translate(calc(-50% + '+shot.x+'px),'+shot.y+'px) scale('+shot.zoom+')';
    preview.append(img);
   }else{
    const symbol=document.createElement('div');
    symbol.style.cssText='height:100%;display:grid;place-items:center;font-size:65px;color:#faf7ff';
    symbol.textContent='◇';
    preview.append(symbol);
   }
   const checks=[['Pose / expression',points.pose,35],
    ['Zoom and composition',points.framing,30],
    ['Lighting',points.light,15],
    ['Shutter moment',points.moment,20]];
   const list=$(review,'[data-breakdown]');
   for(const [label,value,max] of checks){
    const row=document.createElement('div');
    const name=document.createElement('span');
    name.textContent=label;
    const score=document.createElement('strong');
    score.textContent=value+' / '+max;
    row.append(name,score);
    list.append(row);
   }
   const weakest=checks.slice().sort((a,b)=>a[1]/a[2]-b[1]/b[2])[0];
   $(review,'[data-review-message]').textContent=points.score>=85?
    'Barb: "That one is great! Can we keep it?" You can keep it or practice again.':
    points.score>=65?
    'Nice shot! You could improve the '+weakest[0].toLowerCase()+' for a higher score.':
    'Almost there! The biggest improvement would be '+weakest[0].toLowerCase()+'. Try again—there is no penalty.';
   $(shell,'.nps-shell').append(review);
   $(review,'[data-retry]').onclick=()=>{
    session.reviewOpen=false;review.remove();
    // The photo was rejected; the player can prompt Barb again.
    void setMood('neutral',{fromReaction:session.mode==='reactions',silent:true});
    drawChoices();updateFeedback();
   };
   $(review,'[data-keep]').onclick=()=>{
    session.reviewOpen=false;review.remove();
    session.shots.push(shot);
    const mini=$(shell,'[data-mini]');
    mini.replaceChildren();
    session.shots.forEach((p,i)=>{
     const label=document.createElement('div');
     label.className='nps-mini-photo';
     label.textContent='Photo '+(i+1)+' · '+p.score+'/100';
     mini.append(label);
    });
    $(shell,'[data-caption]').textContent=shot.score>=85?
     'Barb: "That looks fantastic! Show me!"':shot.score>=65?
     'Barb: "Hey, I like that one!"':'Barb: "We can try a new angle next time!"';
    if(session.shots.length===3){showResult();}
    else{
     taskUI();
     // Do not auto-solve the next brief: give the player a reason to choose a new pose.
     const next=session.tasks[session.shots.length];
     const reset=session.mode==='reactions'?'neutral':pose(next.pose).kind==='candid'?'walking':'neutral';
     void setMood(reset,{fromReaction:session.mode==='reactions',silent:true});
    }
   };
   $(review,'[data-retry]').focus();
  }
  function showResult(){
   const average=Math.round(session.shots.reduce((n,x)=>n+x.score,0)/3);
   const creditReward=average>=85?14:average>=65?10:6;
   const report=document.createElement('div');
   report.className='nps-report';
   report.innerHTML='<h3>Photo Session complete!</h3><p>Barb looks over the photos with you. Every picture has its own personality.</p>';
   const cards=document.createElement('div');cards.className='nps-report-items';
   for(const [label,value] of [['Average score',average+'/100'],['Best photo',Math.max(...session.shots.map(p=>p.score))+'/100'],
    ['RPG reward',session.freePlay?'Free play':creditReward+' credits']]){
    const div=document.createElement('div');div.className='nps-score-card';
    const strong=document.createElement('strong');strong.textContent=value;
    const small=document.createElement('small');small.textContent=label;
    div.append(strong,small);cards.append(div);
   }
   report.append(cards);
   const note=document.createElement('p');
   note.textContent=session.freePlay?
    'Practice only: no time, focus, credits or affection are changed.':
    'Save the session to claim credits and your normal social activity rewards. Closing cancels without changes.';
   report.append(note);
   const buttons=document.createElement('div');buttons.className='nps-report-actions';
   const cancel=document.createElement('button');cancel.className='nps-btn';cancel.textContent='Cancel (no rewards)';
   cancel.onclick=()=>close(false);
   const finish=document.createElement('button');finish.className='nps-btn nps-primary';
   finish.textContent=session.freePlay?'Finish practice':'Save session and collect';
   finish.onclick=()=>{
    const result={average,credits:session.freePlay?0:creditReward,
     photos:session.shots.map(p=>({...p})),characterId:'barb'};
    close(true,result);
   };
   buttons.append(cancel,finish);report.append(buttons);
   $(shell,'.nps-shell').append(report);
   $(shell,'.nps-main').hidden=true;
   $(shell,'.nps-bottom').hidden=true;
   $(shell,'.nps-goal').hidden=true;
  }
  function close(completed,result){
   if(session.closed)return;
   session.closed=true;
   cancelAnimationFrame(session.clock);
   stopReaction();
   if(session.motionResolve){session.motionResolve(false);session.motionResolve=null;}
   session.motion?.dispose();
   session.preload.clear();
   if(session.interval)clearInterval(session.interval);
   shell.remove();
   active=null;
   try{if(completed)session.onComplete?.(result);else session.onCancel?.();}
   catch(error){console.error('Photo Session callback error',error);
    root.NeoRpgErrorReport?.capture?.(error,{source:'photo-minigame',action:'callback'});}
  }
  $(shell,'[data-close]').onclick=()=>close(false);
  $(shell,'[data-help]').onclick=showGuide;
  $(shell,'[data-snap]').onclick=snap;
  $(shell,'[data-album]').onclick=showAlbum;
  $(shell,'[data-reset]').onclick=()=>{session.x=0;session.y=0;setZoom(1.3);};
  $(shell,'[data-zoom-out]').onclick=()=>setZoom(session.zoom-.15);
  $(shell,'[data-zoom-in]').onclick=()=>setZoom(session.zoom+.15);
  zoomInput.oninput=()=>setZoom(zoomInput.value);
  $(shell,'[data-mode=reactions]').onclick=()=>{
   stopReaction();session.mode='reactions';drawChoices();
   void setMood('neutral',{fromReaction:true,silent:true});
  };
  $(shell,'[data-mode=portrait]').onclick=()=>{session.mode='portrait';void setMood('neutral');};
  $(shell,'[data-mode=candid]').onclick=()=>{session.mode='candid';void setMood('walking');};
  $(shell,'[data-auto]').onclick=()=>{session.auto=!session.auto;drawChoices();};
  for(const b of shell.querySelectorAll('button[data-light]')){
   b.onclick=()=>{session.light=b.dataset.light;stage.dataset.light=session.light;drawChoices();updateFeedback();};
  }
  let pointer=null,pinchDist=0;
  const pointers=new Map();
  stage.addEventListener('pointerdown',e=>{
   if(e.button!==undefined&&e.button!==0)return;
   stage.setPointerCapture(e.pointerId);
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   pointer={x:e.clientX,y:e.clientY};
  });
  stage.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;
   const last=pointers.get(e.pointerId);
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){
    const p=[...pointers.values()];const dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    if(pinchDist)setZoom(session.zoom+(dist-pinchDist)/220);
    pinchDist=dist;return;
   }
   pinchDist=0;
   session.x=clamp(session.x+e.clientX-last.x,-stage.clientWidth*.4,stage.clientWidth*.4);
   session.y=clamp(session.y+e.clientY-last.y,-stage.clientHeight*.38,stage.clientHeight*.38);
   camera();
  });
  const end=e=>{pointers.delete(e.pointerId);pinchDist=0;};
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(session.zoom+(e.deltaY>0?-.08:.08));},{passive:false});
  shell.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close(false);}});
  drawChoices();taskUI();camera();void setMood('neutral',{fromReaction:true});startAuto();
  session.clock=requestAnimationFrame(tick);
  showGuide();
  return true;
 }
 root.NeoRpgPhotoSession=Object.freeze({open,isOpen:()=>!!active,poses:POSES.map(p=>({id:p.id,kind:p.kind,path:p.src}))});
})(typeof window==='undefined'?null:window);
