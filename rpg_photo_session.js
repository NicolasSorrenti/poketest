
'use strict';
// Neo Campus Photo Session. Render-only minigame. Only the RPG controller
// awards credits, advances time, and saves metadata after a completed session.
(function(root){
 // Character-specific poses, dialogue and challenges live in rpg_photo_profiles.js.
 const frameZoom={close:1.9,medium:1.42,full:1.06};
 // Approximate subject focus within a full-body sprite. Actual visual bounds
 // are derived from the rendered layer, so these work on mobile and desktop.
 const frameFocus={full:.51,medium:.34,close:.17};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const $=(el,q)=>el.querySelector(q);
 let active=null;
 const humanLocation=id=>({park:'RIVERSIDE PARK',arcade:'PIXEL PALACE',shop:'LUCKY DRAW',
  cafe:'REST STOP CAFÉ',library:'LIBRARY',center:'TOURNAMENT HALL',home:'APARTMENT'})[id]||'NEO CAMPUS';
 function ensureStyle(){
  if(document.getElementById('neo-photo-session-style'))return;
  const link=document.createElement('link');
  link.id='neo-photo-session-style';link.rel='stylesheet';
  link.href='/rpg_photo_session.css?v=subtitle-only-story-v1-20261107';
  document.head.append(link);
 }
 function open(options={}){
  if(active||typeof document==='undefined')return false;
  const npc=String(options.characterId||'barb').toLowerCase();
  const profile=root.NeoRpgPhotoProfiles?.byId(npc);
  if(!profile)return false;
  const narrative=options.story?(options.storyId?
   root.NeoRpgPhotoStories?.byId(npc,options.storyId,profile):
   root.NeoRpgPhotoStories?.select(npc,profile,
    Number.isFinite(Number(options.trust))?Number(options.trust):99,
    {day:options.day||1,slot:options.slot||0})):null;
  if(options.storyId&&!narrative)return false;
  if(narrative&&options.trust!=null&&Number(options.trust)<narrative.trustMin)return false;
  const PORTRAIT=profile.portraitIds,CANDID=profile.candidIds,labels=profile.labels,
   captions=profile.captions,POSES=profile.poses,
   REACTIONS=options.story?(narrative?.storyActions||profile.storyActions):profile.actions,
   REACTION_TASKS=options.story?(narrative?.shots||profile.scripted):profile.tasks;
  const pose=id=>POSES.find(p=>p.id===id)||POSES[0];
  const location=String(options.location||profile.defaultLocation||'park').toLowerCase();
  const PHOTO_BACKGROUND=root.NeoRpgPhotoProfiles.backgroundFor(location);
  ensureStyle();
  const session={
   id:npc,name:profile.name,location,freePlay:!!options.freePlay,
   scripted:!!options.story,narrative,storyId:narrative?.id||null,
   storyTimer:null,
   savedAlbum:Array.isArray(options.savedAlbum)?options.savedAlbum.slice(-72):[],
   onCancel:options.onCancel,onComplete:options.onComplete,closed:false,
   mode:'reactions',poseId:'neutral',light:'warm',zoom:1.3,x:0,y:0,shots:[],
   tasks:REACTION_TASKS.slice(),auto:false,imageSequence:0,clock:null,interval:null,
   available:true,animation:null,reviewOpen:false,begin:performance.now(),
   reaction:null,reactionSerial:0,reactionBusy:false,reactionTimer:null,
   motion:null,motionReady:false,motionResolve:null,preload:new Map(),
   backdrop:null
  };
  active=session;
  const shell=document.createElement('div');
  shell.className='nps-root';
  shell.classList.toggle('nps-story',session.scripted);
  shell.classList.toggle('nps-precomposed',!!profile.precomposed);
  shell.classList.toggle('nps-discreet',document.documentElement.dataset.rpgDiscreet==='on');
  shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');
  shell.setAttribute('aria-label','Photo Session with '+session.name);
  shell.innerHTML='<div class="nps-shell">'+
   '<header class="nps-top"><div><div class="nps-kicker">NEO CAMPUS · '+humanLocation(session.location)+'</div>'+
   '<h2>📷 Photo Session · '+session.name+'</h2></div><div class="nps-top-right">'+
   '<span data-shotcount>Shot 1 / 3</span><strong data-score>0 / 3</strong>'+
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
   '<img class="nps-actor" data-actor alt="'+session.name+' posing for the camera">'+
   '<canvas class="nps-actor nps-motion-actor" data-motion aria-label="'+session.name+' animated pose"></canvas>'+
   '<div class="nps-silhouette" aria-label="Character artwork hidden">◇</div>'+
   '<div class="nps-frame" aria-hidden="true"></div><div class="nps-cross" aria-hidden="true"></div>'+
   '<div class="nps-meter">✦ SHUTTER MOMENT<div class="nps-meter-track"><span data-meter></span></div><span class="nps-meter-label" data-meter-label>Start an interaction to catch a moment</span></div>'+
   '<div class="nps-mobile-zoom" data-mobile-zoom aria-label="Camera zoom controls">'+
   '<button type="button" class="nps-btn" data-mobile-zoom-in aria-label="Zoom in">+</button>'+
   '<button type="button" class="nps-btn" data-mobile-zoom-out aria-label="Zoom out">−</button>'+
   '<button type="button" class="nps-btn" data-mobile-face aria-label="Focus on face">FACE</button></div>'+
   '<div class="nps-caption" data-caption>'+session.name+': "Ready when you are!"</div>'+
   '<div class="nps-story-subtitle" data-story-subtitle aria-live="polite">'+
   '<div class="nps-subtitle-meta"><span data-story-speaker>'+session.name+'</span>'+
   '<span data-story-step>PHOTO 1 / 3</span></div>'+
   '<div class="nps-subtitle-context" data-story-context></div>'+
   '<div class="nps-subtitle-line" data-story-line>Ready for the first picture?</div></div>'+
   '<div class="nps-loading" data-loading>Loading '+session.name+'’s artwork…</div></div>'+
   '<div class="nps-controls" id="nps-controls-panel">'+
   '<section class="nps-section" data-style-section><h3>📸 Session style</h3>'+
   '<div class="nps-mode"><button class="nps-btn" data-mode="reactions">🎭 Reactions</button>'+
   '<button class="nps-btn" data-mode="portrait">Directed</button>'+
   '<button class="nps-btn" data-mode="candid">Candid</button></div>'+
   '<div class="nps-camerarow" data-auto-wrap><button class="nps-btn" data-auto type="button">Auto poses: Off</button></div></section>'+
   '<section class="nps-section nps-react-actions" data-reactions>'+
   '<h3>💬 '+(session.scripted?'Photo request from ':'Interact with ')+session.name+'</h3><p class="nps-hint">'+(session.scripted?'Your model chooses the poses. Frame each requested detail and press SNAP during the moment.':'Choose an interaction. Watch the reaction and capture the best moment!')+'</p>'+
   '<div class="nps-react-grid" data-reaction-actions></div>'+
   '<p class="nps-react-status" data-reaction-status>Choose an interaction to begin.</p></section>'+
   '<section class="nps-section" data-pose-section><h3>✦ '+session.name+'’s poses / moods</h3><div class="nps-choice-grid" data-poses></div></section>'+
   '<section class="nps-section"><h3>☀ Lighting</h3><div class="nps-choice-grid">'+
   '<button class="nps-btn" data-light="soft">Soft</button>'+
   '<button class="nps-btn" data-light="warm">Warm</button>'+
   '<button class="nps-btn" data-light="bright">Bright</button></div></section>'+
   '<section class="nps-section"><h3>⊕ Camera zoom</h3>'+
   '<div class="nps-camerarow"><button class="nps-btn" data-zoom-out type="button">−</button>'+
   '<input aria-label="Camera zoom" data-zoom type="range" min="1" max="2.5" step=".01" value="1.3">'+
   '<button class="nps-btn" data-zoom-in type="button">+</button></div>'+
   '<div class="nps-camera-presets" role="group" aria-label="Framing presets">'+
   '<button type="button" class="nps-btn" data-frame="full">Full body</button>'+
   '<button type="button" class="nps-btn" data-frame="medium">Medium</button>'+
   '<button type="button" class="nps-btn" data-frame="close">Face</button></div>'+
   '<p class="nps-hint">Choose a framing preset, then fine-tune with pinch, zoom or dragging. The camera follows the area you are viewing when you zoom.</p>'+
   '<button class="nps-btn" data-reset type="button">Reset camera</button></section></div></div>'+
   '<footer class="nps-bottom"><div class="nps-mini-album" data-mini><div class="nps-mini-photo">3 shots to take</div></div>'+
   '<div class="nps-snaps"><span class="nps-snap-status" data-next-action>Match the brief, then snap when the meter is full.</span>'+
   '<button type="button" class="nps-btn nps-mobile-settings" data-mobile-settings aria-label="Camera settings" aria-expanded="false" aria-controls="nps-controls-panel">⚙ Settings</button>'+
   '<button class="nps-btn" data-album>View album</button>'+
   '<button class="nps-btn nps-primary" data-snap aria-label="Take photograph">📷 <span>SNAP</span></button></div></footer></div>';
  document.body.append(shell);
  session.shell=shell;
  const stage=$(shell,'[data-stage]'),actor=$(shell,'[data-actor]'),
   loading=$(shell,'[data-loading]'),poseBox=$(shell,'[data-poses]'),
   zoomInput=$(shell,'[data-zoom]'),motionCanvas=$(shell,'[data-motion]');
  // Use the exact same ground-level park illustration as the active RPG
  // eye-level scene, not the separate top-down map or legacy postcard panorama.
  // Cache it before the player presses SNAP so we can render the actual frame.
  const backdrop=new Image();
  backdrop.decoding='async';
  backdrop.src=PHOTO_BACKGROUND;
  stage.style.backgroundImage='url("'+PHOTO_BACKGROUND+'")';
  session.backdrop=backdrop;

  function storySubtitle(line='',task=session.tasks[session.shots.length]){
   if(!session.scripted)return;
   const panel=$(shell,'[data-story-subtitle]');
   if(!panel)return;
   const plain=String(line||'').replace(/^[^:]+:\s*"/,'').replace(/"$/,'').trim();
   $(panel,'[data-story-speaker]').textContent=session.name;
   $(panel,'[data-story-step]').textContent='PHOTO '+(Math.min(3,session.shots.length+1))+' / 3';
   $(panel,'[data-story-context]').textContent=task?.intro||session.narrative?.hook||'';
   $(panel,'[data-story-line]').textContent=plain||task?.dialogue||'Look toward the camera.';

  }
  const silhouette=$(shell,'.nps-silhouette');
  const cameraLayer=()=>shell.classList.contains('nps-discreet')?silhouette:actor;
  function paintCamera(){
   for(const element of [actor,motionCanvas,silhouette]){
    element.style.setProperty('--zoom',String(session.zoom));
    element.style.setProperty('--pan-x',session.x+'px');
    element.style.setProperty('--pan-y',session.y+'px');
   }
  }
  // Calculate limits from the actually transformed artwork, not a fixed
  // fraction of the stage. At close zoom, the player must be able to place
  // the sprite's head at the center without losing the rest of its pan range.
  function panLimits(){
   const view=stage.getBoundingClientRect(),sprite=cameraLayer().getBoundingClientRect();
   if(view.height<2||view.width<2||sprite.height<2||sprite.width<2)return null;
   const top=sprite.top-session.y,bottom=sprite.bottom-session.y;
   const left=sprite.left-session.x,right=sprite.right-session.x;
   return {
    minY:view.top+view.height*.37-bottom,
    maxY:view.top+view.height*.64-top,
    minX:view.left+view.width*.29-right,
    maxX:view.left+view.width*.71-left
   };
  }
  function camera(){
   paintCamera();
   const limits=panLimits();
   if(limits){
    session.x=clamp(session.x,limits.minX,limits.maxX);
    session.y=clamp(session.y,limits.minY,limits.maxY);
    paintCamera();
   }
   zoomInput.value=String(session.zoom);
   updateFeedback();
  }
  // Keep the same image point under the viewfinder's center when zooming.
  // Otherwise the 66%-height CSS transform origin makes faces jump upward.
  function setZoom(value){
   const next=clamp(Number(value)||1,1,2.5);
   if(Math.abs(next-session.zoom)<.001)return;
   const view=stage.getBoundingClientRect(),before=cameraLayer().getBoundingClientRect();
   const anchorX=view.left+view.width*.5,anchorY=view.top+view.height*.48;
   const fractionX=before.width?(anchorX-before.left)/before.width:.5;
   const fractionY=before.height?(anchorY-before.top)/before.height:.5;
   session.zoom=next;
   paintCamera();
   const after=cameraLayer().getBoundingClientRect();
   if(view.height>2&&after.height>2){
    session.x+=anchorX-(after.left+fractionX*after.width);
    session.y+=anchorY-(after.top+fractionY*after.height);
   }
   camera();
  }
  // Quick-shot presets center the appropriate part of a portrait, rather
  // than zooming toward the sprite's feet/torso. Users may still drag freely.
  function framePreset(type){
   if(!(type in frameZoom))return;
   session.zoom=frameZoom[type];
   session.x=0;session.y=0;
   paintCamera();
   const view=stage.getBoundingClientRect(),sprite=cameraLayer().getBoundingClientRect();
   if(view.height>2&&sprite.height>2){
    const requested=session.scripted?session.tasks[session.shots.length]?.target:null;
   session.y=view.top+view.height*.48-
     (sprite.top+sprite.height*(requested?.y??frameFocus[type]));
   }
   camera();
  }
  function frameAlignment(type){
   const view=stage.getBoundingClientRect(),sprite=cameraLayer().getBoundingClientRect();
   if(view.height<2||sprite.height<2)return 1;
   const target=session.scripted?session.tasks[session.shots.length]?.target:null;
   const subjectX=sprite.left+sprite.width*(target?.x??.5);
   const subjectY=sprite.top+sprite.height*(target?.y??frameFocus[type]??.34);
   const aimX=view.left+view.width*.5;
   const aimY=view.top+view.height*.48;
   const error=Math.hypot(
    (subjectX-aimX)/Math.max(1,view.width*.60),
    (subjectY-aimY)/Math.max(1,view.height*.65)
   );
   return clamp(1-error,0,1);
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
   if(session.scripted&&opts.line)storySubtitle(opts.line);
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
   if(session.storyTimer){clearTimeout(session.storyTimer);session.storyTimer=null;}
   const action=REACTIONS.find(a=>a.id===id);
   if(!action||session.closed||session.reviewOpen)return;
   stopReaction();
   session.mode='reactions';session.auto=false;session.reactionBusy=true;
   const serial=session.reactionSerial;
   drawChoices();
   const status=$(shell,'[data-reaction-status]');
   status.textContent=session.scripted?'Listen to '+session.name+' and frame the shot…':
    session.name+' is getting ready…';
   loading.hidden=false;
   loading.textContent='Preparing '+session.name+'’s reactions…';
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
    status.textContent=frame.highlight?(session.scripted?'📷 Frame the detail when ready':
      '📷 PHOTO OPPORTUNITY! Capture '+session.name+' now!'):
     session.name+': '+(i===0?'Preparing the pose…':'The moment is changing…');
    if(session.scripted)storySubtitle(frame.line);
    // Once the model holds the requested pose, re-enable Repeat pose.
    if(session.scripted&&frame.highlight)drawChoices();
    updateFeedback();
    await new Promise(resolve=>{
     session.reactionCancel=resolve;
     // Narrative poses hold until SNAP. No timed-out dialogue, no forced
     // neutral sprite while the player is still reading and framing.
     if(!session.scripted||!frame.highlight){
      session.reactionTimer=setTimeout(()=>{session.reactionCancel=null;resolve();},
       session.scripted?Math.max(2600,frame.duration):frame.duration);
     }
    });
    if(session.closed||serial!==session.reactionSerial)return;
   }
   if(session.closed||serial!==session.reactionSerial)return;
   session.reactionBusy=false;session.reaction=null;
   status.textContent=session.scripted?
    session.name+': "Want me to pose again? Just ask."':
    'The moment passed. Try another interaction.';
   await setMood('neutral',{fromReaction:true,silent:true});
   drawChoices();updateFeedback();
  }
  // One canvas instance per session, shared with the rhythm game's renderer.
  // No local torso warping: only low-amplitude whole-sprite motion for photos.
  if(!profile.precomposed&&!shell.classList.contains('nps-discreet')&&root.NeoRpgSpriteDeformer?.create){
   try{
    session.motion=root.NeoRpgSpriteDeformer.create(motionCanvas,{
     fit:'contain',cropTop:0,cropHeight:1,
     // Keep art crisp when the player zooms the camera. Higher raster
     // resolution is inexpensive here because zones=[] uses direct drawing.
     width:root.innerWidth<=740?420:600,
     height:root.innerWidth<=740?700:1000,
     fps:22,tempo:78,speed:.9,
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
   $(shell,'[data-style-section]').hidden=session.scripted;
   $(shell,'[data-pose-section]').hidden=reacting||session.scripted;
   $(shell,'[data-reactions]').hidden=!reacting;
   $(shell,'[data-auto-wrap]').hidden=reacting||session.scripted;
   const actionList=$(shell,'[data-reaction-actions]');
   if(session.scripted){
    // One dialogue-driven pose at a time: the player frames and shoots,
    // rather than choosing reactions or generating the requested pose.
    const scene=session.tasks[session.shots.length];
    if(actionList.firstElementChild?.dataset.action!==scene?.action){
     actionList.replaceChildren();
     const b=document.createElement('button');
     b.type='button';b.className='nps-btn nps-recommended';
     b.dataset.action=scene?.action||'';
     b.textContent='↻ Repeat '+(session.shots.length+1)+' / 3 pose';
     b.onclick=()=>{if(scene)void playReaction(scene.action);};
     actionList.append(b);
    }
   }else if(actionList&&!actionList.childElementCount){
    for(const action of REACTIONS){
     const b=document.createElement('button');
     b.type='button';b.className='nps-btn';
     b.textContent=action.label;
     b.dataset.action=action.id;
     b.onclick=()=>{void playReaction(action.id);};
     actionList.append(b);
    }
   }
   if(actionList){
    const goal=session.tasks[session.shots.length];
    const best=REACTIONS.find(a=>a.id===goal?.action);
    // Reorder without destroying event handlers or resetting scrolling during a reaction.
    if(best&&actionList.firstElementChild?.dataset.action!==best.id){
     const buttons=[...actionList.children];
     const recommended=buttons.find(b=>b.dataset.action===best.id);
     if(recommended)actionList.prepend(recommended);
    }
    for(const b of actionList.children){
     b.disabled=session.reviewOpen||
      (session.reactionBusy&&(!session.scripted||!session.reaction?.highlight));
     b.classList.toggle('nps-recommended',b.dataset.action===goal?.action);
    }
   }
   const list=session.scripted?[]:session.mode==='portrait'?PORTRAIT:CANDID;
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
   $(shell,'[data-goal]').textContent=session.scripted?
    (session.narrative?.title?session.narrative.title+' · ':'')+task.name:task.name;
   $(shell,'[data-hint]').textContent=task.hint;
   if(session.scripted){
    // Let the player concentrate on framing the requested detail.
    // Lighting is automatically chosen for the character's scene.
    session.light=task.light;
    stage.dataset.light=session.light;
    storySubtitle(task.intro,task);
    drawChoices();
   }
   $(shell,'[data-score]').textContent=session.shots.length+' / 3';
   updateFeedback();
  }
  function currentMeter(){
   if(session.mode==='reactions'){
    const r=session.reaction;
    if(!r?.highlight)return 0;
    const t=clamp((performance.now()-r.start)/r.duration,0,1);
    return session.scripted?1:
     clamp(1-Math.abs(t-.47)*2.2,0,1);
   }
   return .5+.5*Math.sin((performance.now()-session.begin)/620);
  }
  function updateFeedback(){
   const task=session.tasks[session.shots.length];
   if(!task||session.closed)return;
   const reacting=session.mode==='reactions';
   const poseGood=session.poseId===task.pose&&(!reacting||!!session.reaction?.highlight);
   const frameGood=Math.abs(session.zoom-frameZoom[task.framing])<=.25;
   // Intentional vertical panning is necessary for close-ups; judge the
   // subject's actual focal position in the viewfinder instead of raw pan.
   const centered=frameAlignment(task.framing)>=.72;
   const lightGood=session.scripted||session.light===task.light;
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
   check('framing',frameGood&&centered,(session.scripted?'Target: ':'Frame: ')+
    (session.scripted?({eyes:'Eyes',hair:'Hair',collar:'Neckline',lips:'Smile',
     'back-detail':'Clothing detail from behind',hands:'Hands',skirt:'Skirt hem',
     shoulders:'Shoulders',waist:'Waist',legs:'Legs',
     outfit:'Outfit',natural:'Candid moment'}[task.target?.region]||'Detail'):
     ({close:'Close-up',medium:'Medium',full:'Full body'}[task.framing]))+
    (frameGood&&centered?' ✓':(!frameGood?' · now '+myFrame:' · center character')));
   check('light',lightGood,'Light: '+({soft:'Soft',warm:'Warm',bright:'Bright'}[task.light]));
   check('moment',momentGood,'Moment: '+(momentGood?'NOW!':reacting?'Trigger reaction':'Wait for bar'));
   let next;
   if(reacting&&!poseGood)next=session.reactionBusy?'Wait for '+labels[task.pose]+' to appear…':
    session.scripted?'Press Repeat pose to see the requested moment again.':
    'Interact with '+session.name+'! Try '+REACTIONS.find(a=>a.id===task.action)?.label+'.';
   else if(!poseGood)next=pose(task.pose).kind!==session.mode?
    'First: switch to '+(pose(task.pose).kind==='candid'?'Candid':'Directed')+' mode, then choose '+labels[task.pose]+'.':
    'First: choose the '+labels[task.pose]+' pose.';
   else if(!frameGood)next='Next: adjust zoom until Frame turns green.';
   else if(!centered)next=session.scripted?'Move the requested detail into the center of the viewfinder.':
    'Next: drag the character toward the center.';
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
    '<p>'+(session.scripted?
     (session.narrative?.hook||session.name+' asked you to take three photographs.')+
     ' Your model chooses each pose and tells you what detail to capture.':
     'Your goal is to cause a reaction and photograph it while it happens.')+'</p>'+
    '<div class="nps-guide-steps">'+
    '<div><b>1 · Listen to '+session.name+'</b><div>'+(session.scripted?
     'Watch the short scene. The character will choose a pose and tell you what to photograph. Use Repeat pose as often as needed.':
     'Choose an interaction to reveal different poses.')+'</div></div>'+
    '<div><b>2 · Prepare your shot</b><div>Pinch or use the camera’s +/− buttons to zoom and drag to frame the character. Lighting and other modes are under Settings on mobile.</div></div>'+
    '<div><b>3 · Photograph the detail!</b><div>Move the requested detail to the center, then press SNAP during the moment. Retakes never cost time.</div></div></div>'+
    '<p>'+(session.scripted?
     'The requested pose and subtitle stay visible until you take the photo. Results appear together after all three shots. Space takes a photo on PC.':
     'In free posing you can retry any reaction. Scores appear only after all three photos.')+'</p>'+
    '<div class="nps-guide-actions"><button type="button" class="nps-btn nps-primary" data-start-shooting>Got it · Start shooting!</button></div></div>';
   $(shell,'.nps-shell').append(guide);
   $(guide,'[data-start-shooting]').onclick=()=>{
    guide.remove();
    if(session.scripted)void playReaction(session.tasks[session.shots.length].action);
   };
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
     (session.reactionBusy?'Watch the expression…':'Start an interaction to catch a moment'):
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
   const alignment=frameAlignment(task.framing);
   const comp=Math.round(30*framing*(.6+.4*alignment));
   const lightPoints=session.scripted||task.light===session.light?15:5;
   const timing=Math.round(20*currentMeter());
   return {score:clamp(posePoints+comp+lightPoints+timing,0,100),
    pose:posePoints,framing:comp,light:lightPoints,moment:timing};
  }

  // Snapshot the stage *as presented*, without recreating its sprite zoom/pan
  // inside the differently sized review card. Capture before stopping motion.
  // Camera HUD (crosshair, grid, dialogue, timing bar) is deliberately excluded.
  function captureStage(){
   const sceneRect=stage.getBoundingClientRect();
   if(!sceneRect.width||!sceneRect.height)throw Error('Camera is not visible');
   if(!profile.precomposed&&(!backdrop.complete||!backdrop.naturalWidth))
    throw Error('The location background is still loading. Please try SNAP again.');
   const ratio=Math.min(2,root.devicePixelRatio||1,1600/sceneRect.width);
   const full=document.createElement('canvas');
   full.width=Math.max(1,Math.round(sceneRect.width*ratio));
   full.height=Math.max(1,Math.round(sceneRect.height*ratio));
   const context=full.getContext('2d',{alpha:false});
   if(!context)throw Error('Photo canvas unavailable');
   context.scale(full.width/sceneRect.width,full.height/sceneRect.height);
   const w=sceneRect.width,h=sceneRect.height;
   context.fillStyle='#273a57';
   context.fillRect(0,0,w,h);
   // The stage CSS uses background-position:center and background-size:cover.
   if(!profile.precomposed){
    const bgScale=Math.max(w/backdrop.naturalWidth,h/backdrop.naturalHeight);
    const bgW=backdrop.naturalWidth*bgScale,bgH=backdrop.naturalHeight*bgScale;
    context.drawImage(backdrop,(w-bgW)/2,(h-bgH)/2,bgW,bgH);
   }
   // Use each element's *actual rendered DOM rectangle*. This includes zoom,
   // pan, canvas sizing and CSS transforms in the original camera stage.
   // Crucially, the captured image will never be transformed a second time.
   function drawSprite(element){
    const style=getComputedStyle(element);
    if(style.display==='none'||style.visibility==='hidden')return;
    const alpha=Number(style.opacity);
    if(!Number.isFinite(alpha)||alpha<=0)return;
    const isCanvas=element.tagName==='CANVAS';
    const nw=isCanvas?element.width:element.naturalWidth;
    const nh=isCanvas?element.height:element.naturalHeight;
    if(!nw||!nh||!isCanvas&&!element.complete)return;
    const rect=element.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    // Both the image and motion canvas use object-fit:contain. Preserve
    // transparent letterboxing, and object-position:center bottom for PNGs.
    const fit=Math.min(rect.width/nw,rect.height/nh);
    const drawWidth=nw*fit,drawHeight=nh*fit;
    const x=rect.left-sceneRect.left+(rect.width-drawWidth)/2;
    const y=rect.top-sceneRect.top+(isCanvas?(rect.height-drawHeight)/2:rect.height-drawHeight);
    context.save();
    context.globalAlpha=alpha;
    context.drawImage(element,x,y,drawWidth,drawHeight);
    context.restore();
   }
   if(!shell.classList.contains('nps-discreet')){
    drawSprite(actor);
    drawSprite(motionCanvas);
   }
   // Match the camera's subtle environment grade and selected lighting.
   const shade=context.createLinearGradient(0,0,0,h);
   shade.addColorStop(0,'rgba(7,22,42,0)');
   shade.addColorStop(1,'rgba(7,22,42,.208)');
   context.fillStyle=shade;context.fillRect(0,0,w,h);
   const tint={soft:'rgba(239,243,251,.106)',warm:'rgba(241,164,91,.149)',
    bright:'rgba(255,255,255,.13)'}[session.light];
   if(tint){context.fillStyle=tint;context.fillRect(0,0,w,h);}
   // Full composition is retained only for this live session's review.
   // Save a bounded copy in campaign metadata to avoid bloating cloud saves.
   const fullImage=full.toDataURL('image/webp',.87);
   let thumbnail='';
   for(const targetWidth of [320,260,220,180]){
    const thumb=document.createElement('canvas');
    thumb.width=Math.round(Math.min(targetWidth,full.width));
    thumb.height=Math.max(1,Math.round(thumb.width*full.height/full.width));
    const tc=thumb.getContext('2d',{alpha:false});
    if(!tc)continue;
    tc.drawImage(full,0,0,thumb.width,thumb.height);
    thumbnail=thumb.toDataURL('image/webp',.52);
    if(!thumbnail.startsWith('data:image/webp'))
     thumbnail=thumb.toDataURL('image/jpeg',.55);
    if(thumbnail.length<21000)break;
   }
   return {fullImage,thumbnail};
  }
  function showAlbum(){
   const stored=session.savedAlbum.filter(p=>p?.character===session.id);
   const combined=[...stored,...session.shots].slice(-24).reverse();
   const report=document.createElement('div');
   report.className='nps-report';
   const title=document.createElement('h3');title.textContent='📸 '+session.name+'’s photo album';
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
    if(!shell.classList.contains('nps-discreet')&&(p.snapshot||p.thumbnail)){
     const img=document.createElement('img');
     img.className='nps-photo-thumbnail';
     img.src=p.snapshot||p.thumbnail;
     img.alt='Camera photo of '+session.name+': '+(labels[p.pose]||'pose');
     img.loading='lazy';card.prepend(img);
    }else{
     const older=document.createElement('div');older.className='nps-photo-legacy';
     older.textContent=shell.classList.contains('nps-discreet')?'◇ Hidden':'📷 Older photo · image unavailable';
     card.prepend(older);
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
   if(session.closed||session.reviewOpen||session.shots.length>=3||
      !loading.hidden||!!$(shell,'.nps-instructions')||
      !!$(shell,'.nps-report'))return;
   // A scripted shot must show the target pose. Preparing dialogue is not a
   // shutter opportunity, but there is no deadline once the pose is ready.
   if(session.scripted&&(!session.reaction?.highlight||
      session.poseId!==session.tasks[session.shots.length]?.pose))return;
   const task=session.tasks[session.shots.length];
   const points=photoScore();
   let capture;
   try{capture=captureStage();}
   catch(error){
    $(shell,'[data-caption]').textContent='Camera: '+error.message;
    if(session.scripted)storySubtitle('Camera: '+error.message,task);
    console.warn('Photo capture unavailable',error);return;
   }
   const shot={character:session.id,location:session.location,storyId:session.storyId,
    day:null,pose:session.poseId,framing:task.framing,
    light:session.light,zoom:Number(session.zoom.toFixed(2)),
    x:Math.round(session.x),y:Math.round(session.y),score:points.score,task:task.name,
    thumbnail:capture.thumbnail};
   // No single-shot result, numerical score or blocking review between photos.
   // Keep full frames in memory until the three-shot contact sheet is displayed.
   stopReaction();
   session.shots.push({...shot,snapshot:capture.fullImage,
    breakdown:points});
   const mini=$(shell,'[data-mini]');
   mini.replaceChildren();
   session.shots.forEach((p,i)=>{
    const item=document.createElement('div');
    item.className='nps-mini-photo';
    item.textContent='✓ Shot '+(i+1)+' captured';
    mini.append(item);
   });
   stage.classList.remove('nps-shutter-flash');
   void stage.offsetWidth;
   stage.classList.add('nps-shutter-flash');
   const done=session.shots.length===3;
   const spoken=session.narrative?task.successLine:
    'Got it! '+(done?'Let us review all three.':'Ready for the next one?');
   $(shell,'[data-caption]').textContent=session.name+': "'+spoken+'"';
   if(session.scripted)storySubtitle(spoken,task);
   if(done){
    session.reviewOpen=true;
    session.storyTimer=setTimeout(()=>{
     session.storyTimer=null;
     if(!session.closed)showResult();
    },session.scripted?1750:400);
    return;
   }
   taskUI();
   if(session.scripted){
    // Let the reaction play as a transition, then cue the next microstory.
    queueStoryReaction(session.tasks[session.shots.length],
     spoken,1850,task.followupPose);
   }else{
    const next=session.tasks[session.shots.length];
    const reset=session.mode==='reactions'?'neutral':
     pose(next.pose).kind==='candid'?'walking':'neutral';
    void setMood(reset,{fromReaction:session.mode==='reactions',silent:true});
   }
  }
  function queueStoryReaction(task,line,delay=1250,followupPose=null){
   if(!task||session.closed)return;
   clearTimeout(session.storyTimer);
   const caption=line?session.name+': "'+line+'"':'';
   if(caption){
    $(shell,'[data-caption]').textContent=caption;
    $(shell,'[data-reaction-status]').textContent=caption;
   }
   if(followupPose)void setMood(followupPose,{
    fromReaction:true,silent:true,line:caption
   });
   session.storyTimer=setTimeout(()=>{
    session.storyTimer=null;
    if(!session.closed&&!session.reviewOpen)void playReaction(task.action);
   },delay);
  }
  function showResult(){
   const average=Math.round(session.shots.reduce((n,x)=>n+x.score,0)/3);
   const creditReward=average>=85?14:average>=65?10:6;
   const report=document.createElement('div');
   report.className='nps-report';
   report.innerHTML='<h3>Photo Session complete!</h3><p>'+
    (session.narrative?
     session.name+': "'+(session.tasks[2]?.successLine||'Let me see all three!')+'"':
     session.name+' looks over the photos with you. Every picture has its own personality.')+
    '</p>';
   const cards=document.createElement('div');cards.className='nps-report-items';
   for(const [label,value] of [['Average score',average+'/100'],['Best photo',Math.max(...session.shots.map(p=>p.score))+'/100'],
    ['RPG reward',session.freePlay?'Free play':creditReward+' credits']]){
    const div=document.createElement('div');div.className='nps-score-card';
    const strong=document.createElement('strong');strong.textContent=value;
    const small=document.createElement('small');small.textContent=label;
    div.append(strong,small);cards.append(div);
   }
   report.append(cards);
   // The three photographs and their individual results are revealed together.
   const gallery=document.createElement('div');
   gallery.className='nps-final-gallery';
   session.shots.forEach((shot,index)=>{
    const item=document.createElement('div');
    item.className='nps-final-photo';
    if(!shell.classList.contains('nps-discreet')&&(shot.snapshot||shot.thumbnail)){
     const photo=document.createElement('img');
     photo.src=shot.snapshot||shot.thumbnail;
     photo.alt='Photo '+(index+1)+' of '+session.name;
     item.append(photo);
    }else{
     const hidden=document.createElement('div');
     hidden.className='nps-photo-legacy';hidden.textContent='Photo hidden';
     item.append(hidden);
    }
    const title=document.createElement('strong');
    title.textContent='Photo '+(index+1)+' · '+shot.score+'/100';
    const detail=document.createElement('p');
    detail.textContent=shot.task;
    item.append(title,detail);
    gallery.append(item);
   });
   report.append(gallery);
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
     photos:session.shots.map(({snapshot,...saved})=>saved),
     characterId:session.id,storyId:session.storyId};
    close(true,result);
   };
   const retake=document.createElement('button');
   retake.className='nps-btn';retake.textContent='↻ Retake all three';
   retake.onclick=()=>{
    clearTimeout(session.storyTimer);session.storyTimer=null;
    session.reviewOpen=false;session.shots=[];
    report.remove();
    $(shell,'.nps-main').hidden=false;
    $(shell,'.nps-bottom').hidden=false;
    $(shell,'.nps-goal').hidden=false;
    $(shell,'[data-mini]').replaceChildren();
    taskUI();
    if(session.scripted)void playReaction(session.tasks[0].action);
    else void setMood('neutral',{fromReaction:true,silent:true});
   };
   buttons.append(retake,cancel,finish);report.append(buttons);
   $(shell,'.nps-shell').append(report);
   $(shell,'.nps-main').hidden=true;
   $(shell,'.nps-bottom').hidden=true;
   $(shell,'.nps-goal').hidden=true;
  }
  function close(completed,result){
   if(session.closed)return;
   clearTimeout(session.storyTimer);session.storyTimer=null;
   session.closed=true;
   cancelAnimationFrame(session.clock);
   stopReaction();
   if(session.motionResolve){session.motionResolve(false);session.motionResolve=null;}
   session.motion?.dispose();
   root.removeEventListener('resize',camera);
   session.preload.clear();
   if(session.interval)clearInterval(session.interval);
   document.removeEventListener('keydown',onShutterKey,true);
   shell.remove();
   active=null;
   try{if(completed)session.onComplete?.(result);else session.onCancel?.();}
   catch(error){console.error('Photo Session callback error',error);
    root.NeoRpgErrorReport?.capture?.(error,{source:'photo-minigame',action:'callback'});}
  }
  $(shell,'[data-close]').onclick=()=>close(false);
  $(shell,'[data-help]').onclick=showGuide;
  $(shell,'[data-snap]').onclick=snap;
  const onShutterKey=event=>{
   if(event.code!=='Space'&&event.key!==' ')return;
   if(session.closed||!document.body.contains(shell)||event.repeat||
      $(shell,'.nps-instructions')||$(shell,'.nps-report')||
      $(shell,'.nps-review'))return;
   const target=event.target;
   if(target?.isContentEditable||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName||''))return;
   event.preventDefault();
   event.stopPropagation();
   snap();
  };
  document.addEventListener('keydown',onShutterKey,true);
  $(shell,'[data-album]').onclick=showAlbum;
  const settingsButton=$(shell,'[data-mobile-settings]');
  function mobileSettings(open){
   const isOpen=!!open;
   $(shell,'.nps-shell').classList.toggle('nps-mobile-options-open',isOpen);
   settingsButton.setAttribute('aria-expanded',String(isOpen));
   settingsButton.textContent=isOpen?'✓ Done':'⚙ Settings';
   settingsButton.setAttribute('aria-label',isOpen?'Close camera settings':'Open camera settings');
   // Keep the visible camera and shutter in place; never hide them under
   // a scrollable control list during the short photo opportunity.
   if(isOpen)stopReaction();
  }
  settingsButton.onclick=()=>mobileSettings(!$(shell,'.nps-shell').classList.contains('nps-mobile-options-open'));
  $(shell,'[data-reset]').onclick=()=>framePreset(
   session.tasks[session.shots.length]?.framing||'medium');
  for(const b of shell.querySelectorAll('[data-frame]')){
   b.onclick=()=>framePreset(b.dataset.frame);
  }
  $(shell,'[data-mobile-face]').onclick=()=>framePreset('close');
  $(shell,'[data-zoom-out]').onclick=()=>setZoom(session.zoom-.15);
  $(shell,'[data-mobile-zoom-out]').onclick=()=>setZoom(session.zoom-.16);
  $(shell,'[data-mobile-zoom-in]').onclick=()=>setZoom(session.zoom+.16);
  // Overlay zoom buttons must not start the camera's drag/pinch handler.
  $(shell,'[data-mobile-zoom]').addEventListener('pointerdown',e=>e.stopPropagation());
  $(shell,'[data-zoom-in]').onclick=()=>setZoom(session.zoom+.15);
  zoomInput.oninput=()=>setZoom(zoomInput.value);
  $(shell,'[data-mode=reactions]').onclick=()=>{
   stopReaction();session.mode='reactions';drawChoices();
   void setMood('neutral',{fromReaction:true,silent:true});
   mobileSettings(false);
  };
  $(shell,'[data-mode=portrait]').onclick=()=>{session.mode='portrait';void setMood('neutral');mobileSettings(false);};
  $(shell,'[data-mode=candid]').onclick=()=>{session.mode='candid';void setMood('walking');mobileSettings(false);};
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
   session.x+=e.clientX-last.x;
   session.y+=e.clientY-last.y;
   camera();
  });
  const end=e=>{pointers.delete(e.pointerId);pinchDist=0;};
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(session.zoom+(e.deltaY>0?-.08:.08));},{passive:false});
  shell.addEventListener('keydown',e=>{
   if(e.key==='Escape'){
    e.preventDefault();
    if($(shell,'.nps-shell').classList.contains('nps-mobile-options-open'))mobileSettings(false);
    else close(false);
   }
  });
  root.addEventListener('resize',camera);
  drawChoices();taskUI();camera();void setMood('neutral',{fromReaction:true});startAuto();
  session.clock=requestAnimationFrame(tick);
  showGuide();
  return true;
 }
 root.NeoRpgPhotoSession=Object.freeze({open,isOpen:()=>!!active,
  characters:()=>root.NeoRpgPhotoProfiles?.list()||[],
  posesFor:id=>root.NeoRpgPhotoProfiles?.byId(id)?.poses||[],
  poses:root.NeoRpgPhotoProfiles?.byId('barb')?.poses||[]});
})(typeof window==='undefined'?null:window);
