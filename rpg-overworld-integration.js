'use strict';
// Optional adapter. All campaign changes go through the existing RPG controller.
(()=>{
  const bridge=()=>window.NeoRpgOverworldBridge;
  function mount(){
    if(document.getElementById('neoOverworldLaunch')||!bridge())return;
    const mapToggle=document.getElementById('rpgMapToggle');
    if(!mapToggle)return;
    const open=document.createElement('button');open.type='button';open.id='neoOverworldLaunch';open.className='toolbar-btn';open.textContent='◈ OVERWORLD';open.title='Explore your current location on the overworld map';
    mapToggle.insertAdjacentElement('afterend',open);
    const overlay=document.createElement('section');
    overlay.id='neoOverworldOverlay';overlay.hidden=true;overlay.setAttribute('aria-label','Explore Neo Harbor overworld');
    Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9998',background:'#101021',display:'none',flexDirection:'column',color:'#fff',fontFamily:'system-ui,sans-serif'});
    const toolbar=document.createElement('div');Object.assign(toolbar.style,{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',padding:'8px 12px',background:'#211a37',borderBottom:'1px solid #785c8b'});
    const title=document.createElement('strong');title.style.marginRight='auto';title.textContent='NEO CAMPUS · OVERWORLD';
    const placeSelect=document.createElement('select');placeSelect.setAttribute('aria-label','Travel destination');Object.assign(placeSelect.style,{background:'#322943',color:'#fff',padding:'8px',borderRadius:'8px'});
    const travel=document.createElement('button');travel.type='button';travel.textContent='Travel';const close=document.createElement('button');close.type='button';close.textContent='✕ Return to RPG';
    for(const b of [travel,close])Object.assign(b.style,{padding:'8px 12px',borderRadius:'8px',border:'1px solid #9775a3',background:'#403051',color:'#fff',cursor:'pointer'});
    const note=document.createElement('small');note.setAttribute('role','status');note.style.padding='6px 12px';note.style.background='#211a37';note.textContent='RPG time, schedules and story locks remain authoritative.';
    const frame=document.createElement('iframe');frame.title='Current Neo Campus location';Object.assign(frame.style,{flex:'1',minHeight:'0',width:'100%',border:'0'});
    const menuButton=document.createElement('button');menuButton.type='button';menuButton.textContent='☰ MENU';menuButton.setAttribute('aria-expanded','false');
    Object.assign(menuButton.style,{padding:'8px 12px',borderRadius:'8px',border:'1px solid #9775a3',background:'#403051',color:'#fff',cursor:'pointer'});
    toolbar.append(title,menuButton,placeSelect,travel,close);overlay.append(toolbar,note,frame);document.body.append(overlay);
    // Persistent mockup-style bottom navigation; the map stays interactive above it.
    const bottom=document.createElement('nav');bottom.id='neoOverworldBottom';bottom.setAttribute('aria-label','Overworld quick actions');
    const quick=document.createElement('div');quick.className='neo-ow-quick';
    const next=document.createElement('button');next.type='button';next.className='neo-ow-next';next.innerHTML='<strong>What\'s next?</strong><span id="neoOverworldNextText">Explore town and meet the locals.</span><b aria-hidden="true">›</b>';
    bottom.append(quick,next);overlay.append(bottom);
    function quickButton(label,icon,action){
      const b=document.createElement('button');b.type='button';b.className='neo-ow-action';
      const symbol=document.createElement('span');symbol.className='neo-ow-symbol';symbol.textContent=icon;
      const name=document.createElement('span');name.textContent=label;b.append(symbol,name);
      b.onclick=()=>{if(bridge()?.snapshot()?.locked){note.textContent='Finish the current conversation or event first.';return;}action();};
      quick.append(b);
    }
    quickButton('Activities','🎮',()=>showActivities(bridge()?.activities()||[]));
    const eventList=document.getElementById('storyEvents');
    const eventHome=eventList?.parentNode;
    const eventNext=eventList?.nextSibling||null;
    const eventPanel=document.createElement('section');eventPanel.id='neoOverworldEvents';eventPanel.hidden=true;
    eventPanel.style.cssText='position:absolute;z-index:7;left:50%;top:12%;transform:translateX(-50%);width:min(620px,94vw);max-height:75dvh;overflow:auto;background:#19172cf5;border:1px solid #b58cc7;border-radius:14px;padding:15px;box-shadow:0 18px 55px #000c';
    const eventHead=document.createElement('div');eventHead.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:10px';
    const eventTitle=document.createElement('strong');eventTitle.textContent='▦ EVENTS';
    const eventClose=document.createElement('button');eventClose.type='button';eventClose.textContent='✕ Close';eventClose.style.cssText='padding:8px;background:#453153;color:white;border:1px solid #a98bb6;border-radius:8px';
    eventHead.append(eventTitle,eventClose);eventPanel.append(eventHead);overlay.append(eventPanel);
    function hideEvents(){if(eventHome&&eventList){if(eventNext&&eventNext.parentNode===eventHome)eventHome.insertBefore(eventList,eventNext);else eventHome.append(eventList);}eventPanel.hidden=true;}
    eventClose.onclick=hideEvents;
    function showEvents(){if(!eventList){note.textContent='Events are not available yet.';return;}hideMenu();eventPanel.append(eventList);eventPanel.hidden=false;}
    quickButton('Events','▦',showEvents);
    quickButton('Deck','▤',()=>showDeck());
    quickButton('Status','♥',()=>document.getElementById('statusBtn')?.click());
    next.onclick=()=>{if(bridge()?.snapshot()?.locked)return;const b=document.getElementById('rpgInfoToggle');b?.click();};
    function refreshNext(){
      const raw=document.getElementById('dailyPlanner')?.innerText?.replace(/\\s+/g,' ').trim();
      const line=raw&&raw.length>8?raw.slice(0,145):'Explore town, talk to someone, or check your activities.';
      const label=bottom.querySelector('#neoOverworldNextText');if(label&&label.textContent!==line)label.textContent=line;
    }
    const planner=document.getElementById('dailyPlanner');
    if(planner)new MutationObserver(()=>{if(!overlay.hidden)refreshNext();}).observe(planner,{childList:true,subtree:true,characterData:true});
    const navStyle=document.createElement('style');
    navStyle.textContent=`
      #neoOverworldOverlay{--ow-bottom:164px}
      #neoOverworldBottom{position:absolute;z-index:3;bottom:0;left:0;right:0;padding:10px max(10px,env(safe-area-inset-left)) max(10px,env(safe-area-inset-bottom));background:linear-gradient(0deg,#14132dfb 75%,#14132de6);border-top:1px solid #b78ca778;display:flex;flex-direction:column;gap:8px;color:#fff}
      #neoOverworldBottom .neo-ow-quick{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
      #neoOverworldBottom .neo-ow-action{border:1px solid #9b819f;background:#23223b;color:white;border-radius:11px;padding:9px 3px;display:flex;flex-direction:column;align-items:center;gap:3px;font:600 12px system-ui;cursor:pointer;min-height:60px}
      #neoOverworldBottom .neo-ow-symbol{font-size:21px;line-height:26px}
      #neoOverworldBottom .neo-ow-next{border:1px solid #a779a4;color:#fff;background:#262037;border-radius:9px;padding:8px 36px 8px 13px;display:flex;flex-direction:column;gap:3px;text-align:left;position:relative;cursor:pointer}
      #neoOverworldBottom .neo-ow-next strong{font-size:15px}
      #neoOverworldBottom .neo-ow-next span{font-size:12px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
      #neoOverworldBottom .neo-ow-next b{position:absolute;right:14px;top:30%;font-size:26px;font-weight:400}
      #neoOverworldOverlay:has(#neoOverworldStoryDock:not([hidden])) #neoOverworldBottom{display:none}
      #neoOverworldStoryDock{bottom:max(10px,env(safe-area-inset-bottom))!important}
      #neoOverworldOverlay>iframe{padding-bottom:0}
      @media(min-width:720px){#neoOverworldBottom{left:50%;right:auto;transform:translateX(-50%);width:min(560px,94vw);border:1px solid #ad7baf;border-radius:16px 16px 0 0}}
      @media(max-width:520px){#neoOverworldOverlay .neo-ow-action{min-height:56px;padding:7px 2px}#neoOverworldBottom{padding-bottom:max(8px,env(safe-area-inset-bottom))}}
    `;
    document.head.append(navStyle);
    const menu=document.createElement('section');menu.id='neoOverworldMenu';menu.hidden=true;menu.setAttribute('aria-label','Overworld game menu');
    Object.assign(menu.style,{position:'absolute',zIndex:'6',top:'62px',right:'8px',width:'min(360px,calc(100vw - 16px))',maxHeight:'calc(100dvh - 85px)',overflowY:'auto',background:'#201930',border:'1px solid #af85c4',borderRadius:'14px',padding:'14px',boxShadow:'0 18px 50px #000c'});
    const menuTitle=document.createElement('h2');menuTitle.textContent='NEO CAMPUS · MENU';menuTitle.style.cssText='font:700 17px system-ui;margin:0 0 12px';menu.append(menuTitle);overlay.append(menu);
    const deckPanel=document.createElement('section');deckPanel.hidden=true;deckPanel.id='neoOverworldDeckPanel';deckPanel.setAttribute('aria-label','Deck Studio');
    Object.assign(deckPanel.style,{position:'absolute',inset:'0',zIndex:'8',background:'#101021',display:'none',flexDirection:'column'});
    const deckBar=document.createElement('div');deckBar.style.cssText='padding:10px;background:#2a203c;display:flex;justify-content:space-between;align-items:center;gap:10px';
    const deckHeading=document.createElement('strong');deckHeading.textContent='▣ DECK STUDIO';
    const deckClose=document.createElement('button');deckClose.type='button';deckClose.textContent='✕ Back to overworld';deckClose.style.cssText='padding:9px;color:white;background:#50395e;border:1px solid #b58cc7;border-radius:9px;cursor:pointer';
    deckBar.append(deckHeading,deckClose);
    const deckFrame=document.createElement('iframe');deckFrame.title='Neo Campus Deck Studio';deckFrame.style.cssText='width:100%;border:0;flex:1;min-height:0';
    deckPanel.append(deckBar,deckFrame);overlay.append(deckPanel);
    const showDeck=()=>{hideMenu();deckPanel.hidden=false;deckPanel.style.display='flex';deckFrame.src='/rpg_deck_studio.html';};
    const hideDeck=()=>{deckPanel.hidden=true;deckPanel.style.display='none';deckFrame.src='about:blank';};
    deckClose.onclick=hideDeck;
    function hideMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
    menuButton.onclick=()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));};
    const menuItems=[
      ['▣ Deck Studio',showDeck],
      ['▧ CG Gallery',()=>document.getElementById('galleryBtn')?.click()],
      ['♥ Status & Relationships',()=>document.getElementById('statusBtn')?.click()],
      ['▦ Calendar',()=>document.getElementById('calendarBtn')?.click()],
      ['✧ Save Game',()=>document.getElementById('save')?.click()],
      ['◇ Discreet / Chibi Mode',()=>{document.getElementById('rpgDiscreetToggle')?.click();refresh();}],
      ['☷ Town Map',()=>{hideMenu();placeSelect.focus();}]
    ];
    for(const [label,action] of menuItems){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.style.cssText='display:block;text-align:left;width:100%;padding:13px 11px;margin:5px 0;border:1px solid #735881;border-radius:9px;background:#322743;color:white;font:600 14px system-ui;cursor:pointer';
      button.onclick=()=>{hideMenu();action();};menu.append(button);
    }

    // Reparent the live RPG stage rather than cloning dialogue/CG/choice handlers.
    // Every existing event listener and rendered state stays attached to the same nodes.
    const stage=document.querySelector('.stage-panel');
    const stageHome=stage?.parentNode;
    const stageNext=stage?.nextSibling||null;
    // Overworld-only presentation: scene portraits and CGs above the map;
    // original dialogue and choice DOM stays live, without its old room backdrop.
    const visualStyle=document.createElement('style');
    visualStyle.textContent=`
      #neoOverworldStoryDock{width:min(760px,calc(100vw - 16px));max-height:76dvh!important;right:auto!important;bottom:max(8px,env(safe-area-inset-bottom))!important;overscroll-behavior:contain}
      #neoOverworldStoryDock .stage-panel{background:#171326!important;border:0!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;gap:0!important}
      #neoOverworldStoryDock #scene{background:none!important;background-image:none!important;min-height:clamp(140px,27dvh,290px)!important;max-height:32dvh!important;height:auto!important;position:relative!important;border:0!important}
      #neoOverworldStoryDock #scene .scene-head,#neoOverworldStoryDock #homeBanner,#neoOverworldStoryDock .rpg-discreet-stage{display:none!important}
      #neoOverworldStoryDock #portrait{position:relative!important;inset:auto!important;margin:auto!important;max-height:30dvh!important;height:100%!important;overflow:hidden!important}
      #neoOverworldStoryDock #portrait img{max-height:30dvh!important;object-fit:contain!important;object-position:center bottom!important}
      #neoOverworldStoryDock #rpgSceneCG:not([hidden]){display:block!important;position:relative!important;max-height:30dvh!important;width:100%!important;object-fit:contain!important}
      #neoOverworldStoryDock #dialogue{position:relative!important;margin:0!important;width:100%!important;max-width:none!important;min-height:110px!important;overflow:visible!important}
      #neoOverworldStoryDock #choices{max-height:32dvh;overflow-y:auto;overscroll-behavior:contain}
      #neoOverworldStoryDock .stage-planner,#neoOverworldStoryDock .scene-foot{display:none!important}
      #neoOverworldStoryDock #characterActions:not([hidden]){display:flex!important;flex-wrap:wrap!important}
      @media(max-width:650px){
        #neoOverworldStoryDock{left:8px!important;right:8px!important;width:auto!important;max-height:72dvh!important}
        #neoOverworldStoryDock #scene{min-height:120px!important;max-height:24dvh!important}
        #neoOverworldStoryDock #portrait,#neoOverworldStoryDock #portrait img,#neoOverworldStoryDock #rpgSceneCG{max-height:23dvh!important}
      }
    `;
    visualStyle.textContent+=`
      /* VN overlay: wide translucent dialogue panel with artwork floating above it. */
      #neoOverworldStoryDock{left:50%!important;transform:translateX(-50%)!important;right:auto!important;width:min(980px,calc(100vw - 24px))!important;max-height:86dvh!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow-y:auto!important}
      #neoOverworldStoryDock>.stage-panel{padding:0!important;background:transparent!important;gap:0!important}
      #neoOverworldStoryDock #scene{min-height:0!important;height:auto!important;max-height:43dvh!important;background:transparent!important;pointer-events:none}
      #neoOverworldStoryDock #portrait{height:auto!important;max-height:40dvh!important;display:flex!important;align-items:flex-end;justify-content:center}
      #neoOverworldStoryDock #portrait img{max-height:40dvh!important;width:auto!important;object-fit:contain!important;filter:drop-shadow(0 8px 20px #0009)}
      #neoOverworldStoryDock #rpgSceneCG:not([hidden]){max-height:40dvh!important}
      #neoOverworldStoryDock #dialogue{background:#16152bf0!important;border:1px solid #ae82b9!important;border-radius:14px!important;padding:16px!important;box-shadow:0 12px 32px #0009!important;color:white!important}
      #neoOverworldStoryDock #characterActions:not([hidden]){padding:9px;background:#19172fe8;border-radius:12px}
      #neoOverworldStoryDock>button{background:#302644d9!important;border:1px solid #b68aaf!important;border-radius:9px!important;position:sticky!important;top:0!important;width:auto!important;margin-left:auto!important}
      @media(max-width:650px){
        #neoOverworldStoryDock{width:calc(100vw - 14px)!important;max-height:82dvh!important}
        #neoOverworldStoryDock #scene,#neoOverworldStoryDock #portrait,#neoOverworldStoryDock #portrait img,#neoOverworldStoryDock #rpgSceneCG{max-height:33dvh!important}
        #neoOverworldStoryDock #dialogue{padding:11px!important}
      }
    `;
    document.head.append(visualStyle);
    // Capture input above the iframe while VN dialogue is on-screen.
    // Keeping the map visible is safe; pointer, wheel and touch never reach it.
    const storyShield=document.createElement('div');
    storyShield.id='neoOverworldStoryShield';
    storyShield.hidden=true;
    storyShield.setAttribute('aria-hidden','true');
    storyShield.style.cssText='position:absolute;inset:0;z-index:3;background:#08071360;touch-action:none;pointer-events:auto';
    overlay.append(storyShield);
    function lockMapForStory(locked){
      storyShield.hidden=!locked;
      frame.style.pointerEvents=locked?'none':'auto';
      toolbar.style.pointerEvents=locked?'none':'auto';
      menuButton.disabled=locked;
      placeSelect.disabled=locked;
      travel.disabled=locked;
      close.disabled=locked;
      bottom.style.pointerEvents=locked?'none':'auto';
      if(locked){hideMenu();hideEvents();}
    }
    visualStyle.textContent+=`
      #neoOverworldStoryDock{z-index:5!important;pointer-events:auto}
      #neoOverworldStoryDock .stage-panel{max-width:none!important;width:100%!important}
      #neoOverworldStoryDock #scene{display:flex!important;align-items:flex-end!important;justify-content:center!important}
      #neoOverworldStoryDock #portrait{max-width:100%!important;width:100%!important;min-height:0!important}
      #neoOverworldStoryDock #dialogue{width:100%!important}
      #neoOverworldStoryDock #characterActions{margin-top:8px!important}
      #neoOverworldOverlay:has(#neoOverworldStoryDock:not([hidden])) #neoOverworldBottom{visibility:hidden}
      #neoOverworldStoryDock #scene .home-banner{display:none!important}
    `;
    // Keep the original RPG's interaction buttons wired to their native handlers,
    // but reveal them only when the player deliberately opens Actions.
    const actionTray=document.createElement('div');
    actionTray.id='neoOverworldActionTray';
    const actionToggle=document.createElement('button');
    actionToggle.type='button';actionToggle.id='neoOverworldActionToggle';
    actionToggle.textContent='✦ Actions';actionToggle.setAttribute('aria-expanded','false');
    actionToggle.style.cssText='padding:8px 16px;border:1px solid #bd8fbc;border-radius:10px;background:#352944;color:white;cursor:pointer';
    actionTray.append(actionToggle);
    actionToggle.onclick=()=>{
      const active=actionTray.classList.toggle('expanded');
      actionToggle.setAttribute('aria-expanded',String(active));
      actionToggle.textContent=active?'✕ Hide actions':'✦ Actions';
    };
    const actionStyle=document.createElement('style');
    actionStyle.textContent=`
      #neoOverworldStoryDock #neoOverworldActionTray{display:none;padding:6px 8px;background:#18162ce8;border-radius:10px}
      #neoOverworldStoryDock #neoOverworldActionTray:has(+ #characterActions:not([hidden])){display:block}
      #neoOverworldStoryDock #characterActions:not([hidden]){display:none!important}
      #neoOverworldStoryDock #neoOverworldActionTray.expanded + #characterActions:not([hidden]){display:flex!important}
      #neoOverworldStoryDock #rpgSceneCG:not([hidden]){z-index:2!important}
      #neoOverworldStoryDock #scene:has(#rpgSceneCG:not([hidden])) #neoOverworldScenePeople{display:none!important}
      #neoOverworldStoryDock #scene:has(#rpgSceneCG:not([hidden])) #portrait{display:none!important}
      #neoOverworldStoryDock #scene:has(#rpgSceneCG:not([hidden])) #portrait{visibility:hidden!important;position:absolute!important}
      #neoOverworldStoryDock #portrait{transition:opacity .18s ease,filter .18s ease}
      #neoOverworldStoryDock #dialogue .dialogue-title{display:flex;align-items:center;gap:12px}
      #neoOverworldStoryDock #dialogue #speaker:not([hidden]){color:#f4b5dc;font-weight:800}
    `;
    document.head.append(actionStyle);
    const characterActions=document.getElementById('characterActions');
    characterActions?.parentNode?.insertBefore(actionTray,characterActions);
    const scenePeople=document.createElement('div');scenePeople.id='neoOverworldScenePeople';
    const sceneArea=document.getElementById('scene');
    sceneArea?.append(scenePeople);
    let lastPortraitSignature='';
    function syncPortraits(hasCG){
      const cast=bridge()?.scenePortraits?.();
      const participants=cast?.conversation&&!hasCG?cast.participants||[]:[];
      const signature=JSON.stringify([cast?.focused,participants]);
      if(signature===lastPortraitSignature)return;
      lastPortraitSignature=signature;
      scenePeople.replaceChildren();
      for(const participant of participants){
        const person=document.createElement('div');
        person.className='neo-ow-person'+(participant.id===cast.focused?' is-speaking':' is-listening');
        const image=document.createElement('img');image.alt=participant.name;
        image.src=participant.src||'/rpg-assets/characters/reina/chibi/front.png';
        image.onerror=()=>{if(!image.src.endsWith('/reina/chibi/front.png'))image.src='/rpg-assets/characters/reina/chibi/front.png';};
        const name=document.createElement('span');name.textContent=participant.name;
        person.append(image,name);scenePeople.append(person);
      }
      scenePeople.hidden=!participants.length;
      sceneArea?.classList.toggle('neo-ow-participants',!!participants.length);
    }
    visualStyle.textContent+=`
      #neoOverworldStoryDock #scene.neo-ow-participants #portrait{display:none!important}
      #neoOverworldStoryDock #neoOverworldScenePeople{display:flex;align-items:flex-end;justify-content:center;gap:clamp(3px,2vw,20px);width:100%;max-height:39dvh;overflow:hidden}
      #neoOverworldStoryDock #neoOverworldScenePeople[hidden]{display:none!important}
      #neoOverworldStoryDock .neo-ow-person{display:flex;flex:1 1 0;min-width:0;max-width:260px;max-height:38dvh;align-items:center;flex-direction:column;justify-content:flex-end;transition:opacity .2s,filter .2s,transform .2s}
      #neoOverworldStoryDock .neo-ow-person img{object-fit:contain;object-position:center bottom;width:100%;max-height:34dvh;min-height:0;filter:drop-shadow(0 6px 12px #0009)}
      #neoOverworldStoryDock .neo-ow-person span{background:#16132acc;border:1px solid #b88dbe;border-radius:7px;padding:3px 8px;font:600 12px system-ui}
      #neoOverworldStoryDock .neo-ow-person.is-listening{opacity:.57;filter:brightness(.7);transform:scale(.95)}
      @media(max-width:650px){#neoOverworldStoryDock #neoOverworldScenePeople{max-height:31dvh}#neoOverworldStoryDock .neo-ow-person img{max-height:26dvh}}
    `;
    let storyDock=null;
    let lastSceneKey='';
    let suspendedForDuel=false;
    function showStory(){
      if(!stage||!stageHome)return false;
      if(!storyDock){
        storyDock=document.createElement('section');
        storyDock.id='neoOverworldStoryDock';
        storyDock.setAttribute('aria-label','RPG conversation and story');
        Object.assign(storyDock.style,{position:'absolute',zIndex:'4',bottom:'12px',left:'max(8px,env(safe-area-inset-left))',right:'max(8px,env(safe-area-inset-right))',maxHeight:'min(72vh,680px)',overflow:'auto',border:'2px solid #b58cc7',borderRadius:'14px',background:'#181329',boxShadow:'0 10px 45px #000c'});
        const back=document.createElement('button');back.type='button';back.textContent='← Back to map';back.style.cssText='position:sticky;top:0;z-index:5;display:block;width:100%;padding:11px;border:0;background:#352548;color:white;font:700 14px system-ui;cursor:pointer';
        back.onclick=()=>{if(bridge()?.snapshot()?.locked){note.textContent='Finish the current conversation or event first.';return;}hideStory();};storyDock.append(back);
      }
      overlay.append(storyDock);storyDock.append(stage);
      stage.style.cssText='display:block;position:relative;width:100%;max-width:none;height:auto;min-height:0;overflow:visible;margin:0;padding:8px';
      storyDock.hidden=false;actionTray.classList.remove('expanded');actionToggle.textContent='✦ Actions';actionToggle.setAttribute('aria-expanded','false');lockMapForStory(true);return true;
    }
    function hideStory(){
      if(!stageHome||!stage)return;
      if(stageNext&&stageNext.parentNode===stageHome)stageHome.insertBefore(stage,stageNext);
      else stageHome.append(stage);
      stage.removeAttribute('style');
      if(storyDock){storyDock.hidden=true;storyDock.remove();}lockMapForStory(false);lastPortraitSignature='';
      if(!overlay.hidden)refresh();
    }
    // Observe native story rendering rather than guessing when a conversation ends.
    // A single stage remains authoritative; the map only changes presentation.
    let storySyncQueued=false;
    function syncStory(){
      if(overlay.hidden||suspendedForDuel)return;
      const data=snapshot();
      if(!data)return;
      const line=document.getElementById('line')?.textContent?.trim();
      const choices=document.getElementById('choices');
      const actions=document.getElementById('characterActions');
      const cg=document.getElementById('rpgSceneCG');
      const hasChoices=!!choices?.querySelector('button');
      const hasActions=!!actions&&!actions.hidden&&!!actions.querySelector('button');
      const hasCG=!!cg&&!cg.hidden&&!!cg.getAttribute('src')&&cg.closest('#scene')?.classList.contains('has-story-cg');
      syncPortraits(hasCG);
      const needsStory=!!((data.locked&&!data.arriving)||(line&&line!=='The town is waiting.')||hasChoices||hasActions||hasCG);
      if(needsStory){
        if(!storyDock||storyDock.hidden)showStory();
        else lockMapForStory(true);
      }else if(storyDock&&!storyDock.hidden){
        hideStory();
      }
    }
    function queueStorySync(){
      if(storySyncQueued)return;
      storySyncQueued=true;
      queueMicrotask(()=>{storySyncQueued=false;syncStory();});
    }
    for(const id of ['line','choices','characterActions','rpgSceneCG','speaker']){
      const el=document.getElementById(id);
      if(el)new MutationObserver(queueStorySync).observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','src']});
    }
    function snapshot(){return bridge()?.snapshot();}
    function refresh(){
      const data=snapshot();if(!data)return;
      placeSelect.replaceChildren();
      for(const p of data.places){const option=document.createElement('option');option.value=p.id;option.textContent=p.name;placeSelect.append(option);}
      placeSelect.value=data.location;travel.disabled=data.locked||!storyShield.hidden;
      const people=data.people.join(',');
      const nextSrc='/overworld-prototype.html?scene='+encodeURIComponent(data.location)+'&cast='+encodeURIComponent(people)+'&rpg-integration=1&chibi='+(document.documentElement.dataset.rpgDiscreet==='on'?'1':'0');
      if(frame.getAttribute('src')!==nextSrc)frame.src=nextSrc;
      refreshNext();
      note.textContent=data.locked?'Travel disabled during an active conversation, event or duel.':'Day '+data.day+' · '+['Morning','Afternoon','Evening'][data.slot]+' · RPG schedules active · Preview NPC interaction only';
    }
    function dismiss(){hideMenu();hideEvents();hideDeck();suspendedForDuel=false;hideStory();overlay.querySelectorAll('[data-overworld-activity-panel]').forEach(el=>el.remove());overlay.hidden=true;overlay.style.display='none';frame.src='about:blank';open.focus();}
    open.addEventListener('click',()=>{refresh();overlay.hidden=false;overlay.style.display='flex';queueStorySync();close.focus();});
    close.addEventListener('click',()=>{if(bridge()?.snapshot()?.locked){note.textContent='Finish the active story or duel before leaving the overworld.';return;}dismiss();});
    document.getElementById('rpgDiscreetToggle')?.addEventListener('click',()=>{if(!overlay.hidden)refresh();});
    travel.addEventListener('click',()=>{
      const target=placeSelect.value;const data=snapshot();if(!data)return;
      if(target===data.location){note.textContent='You are already here.';return;}
      // Native travel may start a mandatory event or first-visit dialogue.
      // Never leave the map overlay covering that conversation.
      if(!bridge().travel(target)){note.textContent='Travel is unavailable during the current story or activity.';refresh();return;}
      refresh();
      // First-visit and scheduled entry conversations stay in the map's story dock.
      queueStorySync();
    });
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||overlay.hidden)return;
      const message=event.data;if(message?.type!=='neo-overworld-action')return;
      if(message.kind==='navigation'){
        if(message.id==='deck'){showDeck();return;}
        if(message.id==='status'){document.getElementById('statusBtn')?.click();return;}
        if(message.id==='activities'||message.id==='events'){hideMenu();if(message.id==='activities')showActivities(bridge()?.activities()||[]);else showEvents();return;}
      }
      if(message.kind==='person'){
        // Dismiss first: native conversations can open modal prompts immediately.
        if(!showStory())dismiss();
        if(!bridge()?.interact(message.id)){hideStory();note.textContent='Character interaction is not currently available.';}else queueStorySync();
      }else if(message.kind==='hotspot'){
        const activities=bridge()?.activities()||[];
        showActivities(activities);
      }
    });
    function showActivities(activities){
        const eligible=activities.filter(a=>!a.disabled);
        if(!eligible.length){note.textContent='No activities are available right now.';return;}
        overlay.querySelectorAll('[data-overworld-activity-panel]').forEach(el=>el.remove());
        const panel=document.createElement('div');panel.dataset.overworldActivityPanel='true';Object.assign(panel.style,{position:'absolute',bottom:'68px',left:'12px',right:'12px',padding:'12px',maxHeight:'45vh',overflow:'auto',background:'#211a37',border:'1px solid #9775a3',borderRadius:'12px',zIndex:'2'});
        const head=document.createElement('div');head.textContent='Choose a current RPG activity';panel.append(head);
        for(const a of eligible){const button=document.createElement('button');button.textContent=a.title;button.type='button';Object.assign(button.style,{display:'block',marginTop:'8px',padding:'10px',width:'100%',background:'#403051',color:'white',borderRadius:'8px'});button.onclick=()=>{panel.remove();if(!showStory())dismiss();if(!bridge()?.activity(a.id)){hideStory();note.textContent='Activity no longer available.';}else queueStorySync();};panel.append(button);}
        const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>panel.remove();panel.append(cancel);overlay.append(panel);
    }
    document.addEventListener('keydown',event=>{if(event.key!=='Escape'||overlay.hidden)return;if(!storyShield.hidden){event.preventDefault();return;}if(!deckPanel.hidden){hideDeck();return;}if(!eventPanel.hidden){hideEvents();return;}if(!menu.hidden){hideMenu();return;}if(!bridge()?.snapshot()?.locked)dismiss();});
    // Battles run in the original full-screen duel layer. Resume the map as soon as
    // its battle layer closes, without restarting the campaign or changing saves.
    const duel=document.getElementById('duel');
    if(duel){
      const syncDuel=()=>{
        if(!overlay.hidden&&!duel.hidden){
          suspendedForDuel=true;
          overlay.style.display='none';
        }else if(suspendedForDuel&&duel.hidden){
          suspendedForDuel=false;
          overlay.style.display='flex';
          refresh();
          queueStorySync();
        }
      };
      new MutationObserver(syncDuel).observe(duel,{attributes:true,attributeFilter:['hidden']});
    }
    if(window.NeoRpgOverworldStandalone)setTimeout(()=>{if(bridge()&&overlay.hidden)open.click();},0);
  }
  window.addEventListener('neo-rpg-overworld-bridge-ready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
