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
    const toolbar=document.createElement('header');
    toolbar.className='neo-ow-header';
    const title=document.createElement('div');title.className='neo-ow-place';
    const locationName=document.createElement('strong');locationName.textContent='NEO CAMPUS';
    const dayLabel=document.createElement('small');dayLabel.textContent='Overworld';
    title.append(locationName,dayLabel);
    const note=document.createElement('div');note.id='neoOverworldNotice';note.hidden=true;note.setAttribute('role','status');note.setAttribute('aria-live','polite');
    const showNotice=message=>{note.textContent=message;note.hidden=false;};
    const frame=document.createElement('iframe');frame.title='Current Neo Campus location';Object.assign(frame.style,{flex:'1',minHeight:'0',width:'100%',border:'0'});
    const headerActions=document.createElement('div');headerActions.className='neo-ow-header-actions';
    const cloudButton=document.createElement('button');cloudButton.type='button';cloudButton.className='neo-ow-menu-button neo-ow-cloud-button';cloudButton.textContent='☁ SIGN IN';cloudButton.title='Open cloud save account';cloudButton.setAttribute('aria-label','Open cloud save account');
    const chibiButton=document.createElement('button');chibiButton.type='button';chibiButton.className='neo-ow-menu-button neo-ow-chibi-button';chibiButton.setAttribute('aria-pressed','false');chibiButton.title='Toggle character chibi mode';
    const menuButton=document.createElement('button');menuButton.type='button';menuButton.textContent='☰ MENU';menuButton.setAttribute('aria-expanded','false');
    menuButton.className='neo-ow-menu-button';
    const syncChibiButton=()=>{
      const enabled=document.documentElement.dataset.rpgDiscreet==='on';
      chibiButton.textContent=enabled?'◈ CHIBI ON':'◇ CHIBI OFF';
      chibiButton.setAttribute('aria-pressed',String(enabled));
    };
    const syncCloudButton=()=>{
      const native=document.getElementById('cloudSaveButton');
      cloudButton.textContent=native?.textContent?.trim()||'☁ SIGN IN';
    };
    const syncChibiMode=()=>{
      frame.contentWindow?.postMessage({type:'neo-overworld-chibi-mode',enabled:document.documentElement.dataset.rpgDiscreet==='on'},location.origin);
    };
    const toggleChibiPreference=()=>{
      const preference=window.NeoRpgDiscreet;
      if(preference?.toggle)preference.toggle();
      else document.getElementById('rpgDiscreetToggle')?.click();
      syncChibiButton();syncChibiMode();
    };
    chibiButton.onclick=toggleChibiPreference;
    cloudButton.onclick=()=>document.getElementById('cloudSaveButton')?.click();
    headerActions.append(cloudButton,chibiButton,menuButton);
    toolbar.append(title,headerActions);overlay.append(toolbar,frame,note);document.body.append(overlay);
    frame.addEventListener('load',syncChibiMode);
    syncChibiButton();syncCloudButton();
    const chibiPreferenceObserver=new MutationObserver(syncChibiButton);
    chibiPreferenceObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-rpg-discreet']});
    const nativeChibiToggle=document.getElementById('rpgDiscreetToggle');
    nativeChibiToggle?.addEventListener('click',()=>{syncChibiButton();syncChibiMode();});
    const nativeCloudButton=document.getElementById('cloudSaveButton');
    if(nativeCloudButton)new MutationObserver(syncCloudButton).observe(nativeCloudButton,{childList:true,characterData:true,subtree:true});
    // Both compact controls are equal-width; only the chosen sheet expands.
    const bottom=document.createElement('nav');bottom.id='neoOverworldBottom';bottom.setAttribute('aria-label','Overworld quick actions');
    const sheetBackdrop=document.createElement('button');sheetBackdrop.type='button';sheetBackdrop.id='neoOverworldSheetBackdrop';
    sheetBackdrop.hidden=true;sheetBackdrop.setAttribute('aria-label','Close expanded overworld panel');
    const sheet=document.createElement('section');sheet.id='neoOverworldSheet';sheet.hidden=true;sheet.setAttribute('aria-label','Expanded overworld panel');
    const sheetHead=document.createElement('div');sheetHead.className='neo-ow-sheet-head';
    const sheetHeading=document.createElement('strong');
    const sheetClose=document.createElement('button');sheetClose.type='button';sheetClose.textContent='✕';sheetClose.setAttribute('aria-label','Close panel');
    const sheetBody=document.createElement('div');sheetBody.className='neo-ow-sheet-body';
    sheetHead.append(sheetHeading,sheetClose);sheet.append(sheetHead,sheetBody);
    const compact=document.createElement('div');compact.className='neo-ow-compact';
    const next=document.createElement('button');next.type='button';next.className='neo-ow-trigger';next.textContent='✦ What\'s next?';
    const travelToggle=document.createElement('button');travelToggle.type='button';travelToggle.className='neo-ow-trigger';travelToggle.textContent='⌾ Travel';
    next.setAttribute('aria-controls','neoOverworldSheet');travelToggle.setAttribute('aria-controls','neoOverworldSheet');
    next.setAttribute('aria-expanded','false');travelToggle.setAttribute('aria-expanded','false');
    compact.append(next,travelToggle);
    const quick=document.createElement('div');quick.className='neo-ow-quick';
    bottom.append(sheet,compact,quick);overlay.append(sheetBackdrop,bottom);
    const planner=document.getElementById('dailyPlanner');
    const plannerHome=planner?.parentNode,plannerNext=planner?.nextSibling||null;
    const placeArt={arcade:'arcade.jpg',home:'home.jpg',park:'park.jpg',shop:'card-shop-day.png',cafe:'cafe.jpg',center:'center.jpg',library:'library.jpg'};
    const placeIcon={arcade:'🎮',home:'⌂',park:'🌳',shop:'🎁',cafe:'☕',center:'♟',library:'📚'};
    let expandedSheet=null;
    function restorePlanner(){
      if(!planner||!plannerHome||planner.parentNode!==sheetBody)return;
      if(plannerNext?.parentNode===plannerHome)plannerHome.insertBefore(planner,plannerNext);
      else plannerHome.append(planner);
    }
    function closeSheet(){
      restorePlanner();expandedSheet=null;sheet.hidden=true;sheetBackdrop.hidden=true;
      next.setAttribute('aria-expanded','false');travelToggle.setAttribute('aria-expanded','false');
      next.classList.remove('is-open');travelToggle.classList.remove('is-open');
      sheetBody.replaceChildren();
    }
    function openSheet(kind){
      if(bridge()?.snapshot()?.locked||!storyShield.hidden){showNotice('Finish the current scene before opening another panel.');return;}
      if(expandedSheet===kind){closeSheet();return;}
      hideMenu();hideEvents();
      overlay.querySelectorAll('[data-overworld-activity-panel],[data-overworld-activity-backdrop]').forEach(el=>el.remove());
      overlay.classList.remove('neo-ow-activity-open');
      closeSheet();expandedSheet=kind;
      sheetHeading.textContent=kind==='travel'?'Choose a destination':'Your next opportunities';
      if(kind==='next'){
        if(planner)sheetBody.append(planner);
        else {const empty=document.createElement('p');empty.textContent='Your daily guide is not available yet.';sheetBody.append(empty);}
      }else{
        const grid=document.createElement('div');grid.className='neo-ow-travel-grid';
        const data=snapshot();
        for(const place of data?.places||[]){
          const button=document.createElement('button');button.type='button';button.className='neo-ow-destination';
          const current=place.id===data.location;
          if(current){button.classList.add('is-current');button.disabled=true;}
          const thumb=document.createElement('div');thumb.className='neo-ow-destination-art';
          const image=document.createElement('img');image.loading='lazy';image.alt='';
          image.src='/rpg-assets/'+(placeArt[place.id]||'park.jpg');
          image.onerror=()=>{image.hidden=true;};
          const icon=document.createElement('span');icon.textContent=placeIcon[place.id]||'⌾';
          thumb.append(image,icon);
          const name=document.createElement('span');name.className='neo-ow-destination-name';name.textContent=place.name;
          const status=document.createElement('small');status.textContent=current?'You are here':'Travel · free';
          button.append(thumb,name,status);
          button.onclick=()=>performTravel(place.id);
          grid.append(button);
        }
        sheetBody.append(grid);
      }
      sheet.hidden=false;sheetBackdrop.hidden=false;
      next.classList.toggle('is-open',kind==='next');travelToggle.classList.toggle('is-open',kind==='travel');
      next.setAttribute('aria-expanded',String(kind==='next'));travelToggle.setAttribute('aria-expanded',String(kind==='travel'));
    }
    next.onclick=()=>openSheet('next');travelToggle.onclick=()=>openSheet('travel');
    sheetBackdrop.onclick=closeSheet;sheetClose.onclick=closeSheet;
    function quickButton(label,icon,action){
      const b=document.createElement('button');b.type='button';b.className='neo-ow-action';
      const symbol=document.createElement('span');symbol.className='neo-ow-symbol';symbol.textContent=icon;
      const name=document.createElement('span');name.textContent=label;b.append(symbol,name);
      b.onclick=()=>{if(bridge()?.snapshot()?.locked){showNotice('Finish the current conversation or event first.');return;}action();};
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
    function showEvents(){closeSheet();if(!eventList){showNotice('Events are not available yet.');return;}hideMenu();eventPanel.append(eventList);eventPanel.hidden=false;}
    quickButton('Events','▦',showEvents);
    quickButton('Deck','▤',()=>showDeck());
    quickButton('Status','♥',()=>document.getElementById('statusBtn')?.click());
    // The real planner DOM (including its action handlers) moves into the sheet.
    // When collapsed or interrupted, it returns to the original RPG stage.
    const navStyle=document.createElement('style');
    navStyle.textContent=`
      #neoOverworldOverlay .neo-ow-header{z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#16152ceb;border-bottom:1px solid #a881a65c;padding:9px max(12px,env(safe-area-inset-left));min-height:58px}
      #neoOverworldOverlay .neo-ow-place{display:flex;flex-direction:column;gap:3px}
      #neoOverworldOverlay .neo-ow-place strong{font-size:17px;line-height:1.1}
      #neoOverworldOverlay .neo-ow-place small{font-size:12px;color:#e6c8ef}
      #neoOverworldOverlay .neo-ow-header-actions{display:flex;align-items:center;gap:7px;flex:none}
      #neoOverworldOverlay .neo-ow-menu-button{padding:10px 11px;border:1px solid #b38bb8;border-radius:10px;background:#322643;color:#fff;cursor:pointer;white-space:nowrap}
      #neoOverworldOverlay .neo-ow-chibi-button[aria-pressed="true"]{background:#41516a;border-color:#b8d2ff}
      @media(max-width:500px){#neoOverworldOverlay .neo-ow-header-actions{gap:4px}#neoOverworldOverlay .neo-ow-menu-button{padding:8px 6px;font-size:11px}#neoOverworldOverlay .neo-ow-place strong{font-size:14px}}
      #neoOverworldNotice:not([hidden]){position:absolute;z-index:7;top:70px;left:50%;transform:translateX(-50%);max-width:min(460px,90vw);padding:9px 14px;border:1px solid #b38bb8;border-radius:10px;background:#291e3df2;color:#fff;font:13px system-ui;box-shadow:0 12px 28px #0007;pointer-events:none}
      #neoOverworldSheetBackdrop:not([hidden]){position:absolute;inset:58px 0 0;z-index:3;background:#07051555;border:0;cursor:default}
      #neoOverworldBottom{position:absolute;z-index:4;bottom:0;left:0;right:0;padding:9px max(10px,env(safe-area-inset-left)) max(10px,env(safe-area-inset-bottom));background:linear-gradient(0deg,#14132dfb 75%,#14132de6);border-top:1px solid #b78ca778;display:flex;flex-direction:column;gap:8px;color:#fff}
      #neoOverworldBottom .neo-ow-compact{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      #neoOverworldBottom .neo-ow-trigger{min-height:48px;padding:9px 7px;white-space:nowrap;border:1px solid #a779a4;border-radius:10px;background:#29203c;color:#fff;font:700 14px system-ui;cursor:pointer}
      #neoOverworldBottom .neo-ow-trigger.is-open{border-color:#fac4fa;background:#493050;box-shadow:inset 0 0 0 1px #c67cba}
      #neoOverworldBottom .neo-ow-quick{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
      #neoOverworldBottom .neo-ow-action{border:1px solid #9b819f;background:#23223b;color:white;border-radius:11px;padding:9px 3px;display:flex;flex-direction:column;align-items:center;gap:3px;font:600 12px system-ui;cursor:pointer;min-height:58px}
      #neoOverworldBottom .neo-ow-symbol{font-size:21px;line-height:26px}
      #neoOverworldBottom #neoOverworldSheet:not([hidden]){display:flex;flex-direction:column;gap:8px;max-height:min(48dvh,480px);overflow:hidden;background:#201930f8;border:1px solid #b987b8;border-radius:13px;padding:10px;box-shadow:0 -15px 45px #0009;animation:neo-ow-sheet-enter .16s ease-out}
      #neoOverworldBottom .neo-ow-sheet-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 5px}
      #neoOverworldBottom .neo-ow-sheet-head strong{font:700 16px system-ui}
      #neoOverworldBottom .neo-ow-sheet-head button{border:1px solid #8d7296;border-radius:8px;padding:6px 10px;background:#3a2a4a;color:#fff;cursor:pointer}
      #neoOverworldBottom .neo-ow-sheet-body{overflow-y:auto;overscroll-behavior:contain;min-height:0;padding:2px}
      #neoOverworldBottom .neo-ow-sheet-body #dailyPlanner{display:grid!important;gap:8px}
      #neoOverworldBottom .neo-ow-sheet-body .planner-card{background:#2c2440;border:1px solid #826a91;border-radius:10px;padding:10px}
      #neoOverworldBottom .neo-ow-sheet-body .planner-card strong{display:block;margin:4px 0}
      #neoOverworldBottom .neo-ow-sheet-body .planner-card p{margin:3px 0 8px}
      #neoOverworldBottom .neo-ow-sheet-body .planner-action{background:#58365e;color:#fff;border:1px solid #bd8fbc;border-radius:8px;padding:8px;cursor:pointer}
      #neoOverworldBottom .neo-ow-travel-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      #neoOverworldBottom .neo-ow-destination{min-width:0;display:flex;align-items:stretch;flex-direction:column;text-align:left;overflow:hidden;border:1px solid #907599;border-radius:11px;padding:0 0 9px;background:#2c253f;color:#fff;cursor:pointer}
      #neoOverworldBottom .neo-ow-destination.is-current{border-color:#eca2eb;box-shadow:inset 0 0 0 1px #eca2eb;opacity:.88;cursor:default}
      #neoOverworldBottom .neo-ow-destination-art{height:76px;position:relative;display:flex;align-items:center;justify-content:center;background:linear-gradient(125deg,#4a275b,#172e55)}
      #neoOverworldBottom .neo-ow-destination-art img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
      #neoOverworldBottom .neo-ow-destination-art img[hidden]{display:none!important}
      #neoOverworldBottom .neo-ow-destination-art span{position:relative;z-index:1;font-size:26px;text-shadow:0 2px 10px #000}
      #neoOverworldBottom .neo-ow-destination-name{font-weight:700;font-size:13px;padding:7px 9px 0}
      #neoOverworldBottom .neo-ow-destination small{font-size:11px;color:#e5d3e9;padding:2px 9px 0}
      #neoOverworldOverlay:has(#neoOverworldStoryDock:not([hidden])) #neoOverworldBottom{display:none}
      #neoOverworldStoryDock{bottom:max(10px,env(safe-area-inset-bottom))!important}
      @keyframes neo-ow-sheet-enter{from{opacity:.4;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media(min-width:720px){#neoOverworldBottom{left:50%;right:auto;transform:translateX(-50%);width:min(560px,94vw);border:1px solid #ad7baf;border-radius:16px 16px 0 0}#neoOverworldBottom .neo-ow-travel-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:520px){#neoOverworldOverlay .neo-ow-action{min-height:54px;padding:7px 2px}#neoOverworldBottom{padding-bottom:max(8px,env(safe-area-inset-bottom))}#neoOverworldBottom .neo-ow-trigger{min-height:46px}}
      @media(prefers-reduced-motion:reduce){#neoOverworldBottom #neoOverworldSheet{animation:none}}
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
    const showDeck=()=>{closeSheet();hideMenu();deckPanel.hidden=false;deckPanel.style.display='flex';deckFrame.src='/rpg_deck_studio.html';};
    const hideDeck=()=>{deckPanel.hidden=true;deckPanel.style.display='none';deckFrame.src='about:blank';};
    deckClose.onclick=hideDeck;
    function hideMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
    menuButton.onclick=()=>{closeSheet();menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));};
    const menuItems=[
      ['▣ Deck Studio',showDeck],
      ['▧ CG Gallery',()=>document.getElementById('galleryBtn')?.click()],
      ['♥ Status & Relationships',()=>document.getElementById('statusBtn')?.click()],
      ['▦ Calendar',()=>document.getElementById('calendarBtn')?.click()],
      ['✧ Save Game',()=>document.getElementById('save')?.click()],
      ['◇ Discreet / Chibi Mode',()=>{toggleChibiPreference();refresh();}],
      ['⌾ Travel',()=>openSheet('travel')],
      ['← Original RPG',()=>dismiss()]
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
      /* Time wipes are appended to the page body; keep them above this full-screen overlay. */
      #neoOverworldOverlay:not([hidden]) ~ .neo-timefx{z-index:10000!important}
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
      // Keep the place art but suppress background NPC sprites and edge portraits
      // throughout VN dialogue/CGs. The iframe can reload when schedules change.
      frame.contentWindow?.postMessage({type:'neo-overworld-story-visibility',hidden:!!locked},location.origin);
      frame.style.pointerEvents=locked?'none':'auto';
      // Keep the UI switcher available during story locks. Returning to the
      // original interface only changes presentation; it does not advance or
      // resolve the active event.
      toolbar.style.pointerEvents='auto';
      menuButton.disabled=false;
      next.disabled=locked;
      travelToggle.disabled=locked;
      if(locked)closeSheet();
      bottom.style.pointerEvents=locked?'none':'auto';
      if(locked){
        closeSheet();hideEvents();
        overlay.querySelectorAll('[data-overworld-activity-panel],[data-overworld-activity-backdrop]').forEach(el=>el.remove());
        overlay.classList.remove('neo-ow-activity-open');
      }
    }
    frame.addEventListener('load',()=>{
      frame.contentWindow?.postMessage({type:'neo-overworld-story-visibility',hidden:!storyShield.hidden},location.origin);
    });
    visualStyle.textContent+=`
      #neoOverworldStoryDock{z-index:5!important;pointer-events:auto}
      #neoOverworldStoryDock .stage-panel{max-width:none!important;width:100%!important}
      #neoOverworldStoryDock #scene{display:flex!important;align-items:flex-end!important;justify-content:center!important}
      /* The engine creates its own legacy scene cast; the overworld owns all VN portraits. */
      #neoOverworldStoryDock #rpgSceneCast,
      #neoOverworldStoryDock .rpg-scene-cast,
      #neoOverworldStoryDock #portrait{display:none!important}
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
    const portraitWindow=window.NeoRpgSceneCast?.createSpeakerWindow?.();
    let interactionFocus=null;
    const poseTriggersById=new Map();
    let poseTriggerBusy=false,poseTriggerAwaitingDialogue=false,poseTriggerRetryTimer=null;
    function queuePoseTriggers(message){
      const data=bridge()?.snapshot();if(!data||message.scene!==data.location)return;
      poseTriggersById.clear();
      for(const item of Array.isArray(message.triggers)?message.triggers:[]){
        if(!/^[a-z][a-z0-9_-]{0,35}$/.test(item?.id||'')||!data.people.includes(item.id))continue;
        let url;try{url=new URL(item.src,location.href)}catch{continue}
        if(url.origin!==location.origin||!url.pathname.startsWith('/rpg-assets/characters/'))continue;
        const pose=String(item.pose||'standing');
        const key=['neoOverworldPoseTriggerV2',data.location,data.day,data.slot,item.id,pose].join(':');
        let seen=false;try{seen=sessionStorage.getItem(key)==='1'}catch{}
        if(seen)continue;
        poseTriggersById.set(item.id,{id:item.id,pose,src:url.pathname+url.search,scene:data.location,key});
      }
      syncPoseTriggerQueue();
    }
    async function playPoseTrigger(item){
      if(poseTriggerBusy||poseTriggerAwaitingDialogue||overlay.hidden||suspendedForDuel)return false;
      const data=bridge()?.snapshot();
      if(!data||data.locked||data.location!==item.scene||!data.people.includes(item.id))return false;
      poseTriggerBusy=true;
      try{
        try{sessionStorage.setItem(item.key,'1')}catch{}
        if(window.NeoOutfitChime?.display)await window.NeoOutfitChime.display(item.src,{top:0,bottom:1,left:0,right:1},1450);
        const current=bridge()?.snapshot();
        if(!current||current.location!==item.scene||!current.people.includes(item.id)){try{sessionStorage.removeItem(item.key)}catch{}poseTriggersById.delete(item.id);return false}
        if(current.locked){try{sessionStorage.removeItem(item.key)}catch{}return false}
        interactionFocus=item.id;
        if(!showStory()||!bridge()?.poseTriggerDialogue?.(item.id,item.src)){
          interactionFocus=null;hideStory();showNotice('This pose could not start its dialogue.');
          try{sessionStorage.removeItem(item.key)}catch{}
          poseTriggersById.delete(item.id);
          return false;
        }
        poseTriggersById.delete(item.id);
        poseTriggerAwaitingDialogue=true;
        queueStorySync();
        return true;
      }catch(error){
        console.warn('Overworld pose trigger failed:',error);
        try{sessionStorage.removeItem(item.key)}catch{}
        poseTriggersById.delete(item.id);
        return false;
      }finally{
        poseTriggerBusy=false;
        syncPoseTriggerQueue();
      }
    }
    function syncPoseTriggerQueue(){
      const data=bridge()?.snapshot();
      if(poseTriggerAwaitingDialogue){
        if(data?.locked)return;
        poseTriggerAwaitingDialogue=false;
      }
      if(poseTriggerBusy||overlay.hidden||suspendedForDuel)return;
      if(data?.locked){
        if(poseTriggersById.size&&!poseTriggerRetryTimer){
          poseTriggerRetryTimer=setTimeout(()=>{poseTriggerRetryTimer=null;syncPoseTriggerQueue()},300);
        }
        return;
      }
      const item=[...poseTriggersById.values()].find(entry=>
        entry.scene===data?.location&&data?.people.includes(entry.id));
      if(!item||poseTriggerRetryTimer)return;
      poseTriggerRetryTimer=setTimeout(()=>{
        poseTriggerRetryTimer=null;
        void playPoseTrigger(item).then(started=>{if(!started)syncPoseTriggerQueue()});
      },120);
    }
    function syncPortraits(hasCG,idleFocus=null){
      const cast=bridge()?.scenePortraits?.();
      const selectedPortrait=idleFocus?bridge()?.portrait?.(idleFocus):null;
      const participants=selectedPortrait?[selectedPortrait]:cast?.conversation&&!hasCG?
        (portraitWindow?.update(cast.participants||[],cast.focused)||
         (cast.participants||[]).slice(0,2)):[];
      const focused=selectedPortrait?.id||cast?.focused;
      if(hasCG)portraitWindow?.reset();
      const signature=JSON.stringify([focused,participants]);
      if(signature===lastPortraitSignature)return;
      lastPortraitSignature=signature;
      scenePeople.replaceChildren();
      for(const participant of participants){
        const person=document.createElement('div');
        person.className='neo-ow-person'+(participant.id===focused?' is-speaking':' is-listening');
        const image=document.createElement('img');image.alt=participant.name;
        // Apply the full-body source's top-to-waist dialogue crop only when
        // this exact art actually loads. Fallback art and discreet portraits
        // keep their own presentation.
        image.addEventListener('load',()=>{
          const otherApprovedMasters={
            iris:'/rpg-assets/characters/iris/dialogue/neutral.png',
            alma:'/rpg-assets/characters/alma/overworld/standing-front.png',
            barb:'/rpg-assets/characters/barb/portraits/primary.png',
            elena:'/rpg-assets/characters/elena/overworld/standing-portfolio.png',
            jun:'/rpg-assets/characters/jun/standing-front.png',
            teo:'/rpg-assets/characters/teo/dialogue/neutral.png',
            nereo:'/rpg-assets/characters/nereo/dialogue/neutral.png',
            elio:'/rpg-assets/characters/elio/dialogue/neutral.png',
 kaede:'/rpg-assets/characters/kaede/dialogue/neutral.png',
            shiori:'/rpg-assets/characters/shiori/dialogue/neutral.png',
            marina:'/rpg-assets/characters/marina/dialogue/neutral.png',
            akari:'/rpg-assets/characters/akari/overworld/standing-clipboard.png',
            daisy:'/rpg-assets/characters/daisy/overworld/idle.png',
            hana:'/rpg-assets/characters/hana/overworld/phone-standing.png',
            jicy:'/rpg-assets/characters/jicy/overworld/standing.webp',
            jinx:'/rpg-assets/characters/jinx/overworld/idle.png',
            luna:'/rpg-assets/characters/luna/overworld/standing-front.png',
            reina:'/rpg-assets/characters/reina/overworld/standing.png',
            rina:'/rpg-assets/characters/rina/overworld/alternate-card-pose.png',
            sierra:'/rpg-assets/characters/sierra/overworld/standing-wink.png',
            sol:'/rpg-assets/characters/sol/standing-front.png',
            yuna:'/rpg-assets/characters/yuna/overworld/gamer-idle.png'
          };
          const source=image.currentSrc||image.src||'';
          const isApprovedMaster=participant.id==='camila'
            ?source.includes('/rpg-assets/characters/camila/overworld/standing-front.png')
            :participant.id==='laca'
              ?(source.includes('/rpg-assets/characters/laca/overworld/casual/reaching-out.png')||source.includes('/rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png'))
              :!!otherApprovedMasters[participant.id]&&source.includes(otherApprovedMasters[participant.id]);
          person.classList.toggle('neo-ow-dialogue-front-master',isApprovedMaster);
          // Full-body art needs the tight head-to-chest crop; a face-only
          // expression asset needs less zoom. No image bytes are modified.
          const fullBody=isApprovedMaster||
            /\/(?:overworld|overworld-variants)\//.test(source)||
            /\/standing-front\.png(?:[?#]|$)/.test(source)||
            /\/portraits\/special-day-\d+\.png(?:[?#]|$)/.test(source);
          const alreadyCropped=/\/(?:expression-portraits|expression-faces|vn-expressions)\//.test(source);
          person.style.setProperty('--neo-ow-dialogue-bust-height',
            fullBody?'278%':alreadyCropped?'165%':'190%');
        });
        // A missing portrait must never display a different character's face.
        // The original game's avatar loader already resolves outfit-specific art.
        if(participant.src)image.src=participant.src;
        const portraitSources=Array.isArray(participant.srcs)?participant.srcs:[participant.src].filter(Boolean);
        let portraitSourceIndex=1,usedPoseFallback=false;
        image.onerror=()=>{
          person.classList.remove('neo-ow-dialogue-front-master');
          const next=portraitSources[portraitSourceIndex++];
          if(next){image.hidden=false;image.src=next;return}
          const fallback=bridge()?.poseIntroFallback?.(participant.id);
          if(fallback&&!usedPoseFallback){usedPoseFallback=true;image.hidden=false;image.src=fallback;return}
          image.hidden=true;person.classList.add('neo-ow-portrait-missing');
        };
        // Dialogue speaker names belong to #dialogue #speaker, never below portraits.
        person.append(image);
        // Mark the in-scene portrait too, so Discreet Mode can replace it live.
        window.NeoRpgDiscreetAvatars?.set?.(person,participant.id,'neutral',participant.name);
        scenePeople.append(person);
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
    const storyLayout=document.createElement('style');
    storyLayout.textContent=`
      #neoOverworldOverlay.neo-ow-arriving #neoOverworldBottom{display:none!important}
      #neoOverworldStoryDock{width:calc(100vw - 20px)!important;max-width:1520px!important;max-height:90dvh!important;overflow-y:auto!important}
      #neoOverworldStoryDock #scene{min-height:0!important;max-height:54dvh!important;width:100%!important}
      #neoOverworldStoryDock #portrait{display:none!important}
      #neoOverworldStoryDock #neoOverworldScenePeople:not([hidden]){display:flex!important;align-items:flex-end!important;justify-content:center!important;gap:clamp(4px,2vw,22px)!important;width:100%!important;height:min(50dvh,660px)!important;max-height:50dvh!important;overflow:hidden!important}
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person{flex:0 0 40vw!important;width:40vw!important;max-width:40vw!important;height:100%!important;max-height:none!important;overflow:hidden!important}
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person img{display:block;object-fit:contain!important;object-position:center bottom!important;max-width:100%!important;width:100%!important;height:calc(100% - 29px)!important;max-height:none!important}
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person img[hidden]{display:none!important}
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person span{flex:none}
      #neoOverworldStoryDock #scene:has(#rpgSceneCG:not([hidden])) #neoOverworldScenePeople{display:none!important}
      #neoOverworldStoryDock #rpgSceneCG:not([hidden]){max-height:53dvh!important;object-fit:contain!important}
      #neoOverworldStoryDock>button:first-child{position:absolute!important;right:2px!important;top:2px!important;z-index:8!important;width:auto!important;padding:7px 11px!important;font-size:12px!important}
      #neoOverworldStoryDock #dialogue{z-index:5!important;position:relative!important}
      @media(max-width:650px){
        #neoOverworldStoryDock{width:calc(100vw - 10px)!important;max-height:92dvh!important;bottom:max(5px,env(safe-area-inset-bottom))!important}
        #neoOverworldStoryDock #scene{max-height:51dvh!important}
        #neoOverworldStoryDock #neoOverworldScenePeople:not([hidden]){height:45dvh!important;max-height:45dvh!important}
        #neoOverworldStoryDock #rpgSceneCG:not([hidden]){max-height:48dvh!important}
      }
    `;
    storyLayout.textContent+=`
      #neoOverworldOverlay.neo-ow-activity-open #neoOverworldBottom{visibility:hidden!important;pointer-events:none!important}
      #neoOverworldOverlay.neo-ow-activity-open #neoOverworldSheetBackdrop{display:none!important}
      #neoOverworldOverlay.neo-ow-activity-open #neoOverworldMenu{display:none!important}
    `;
    document.head.append(storyLayout);
    const portraitPlacement=document.createElement('style');
    portraitPlacement.textContent=`
      /* Keep portraits flush with the speech box; the nameplate lives in its header. */
      #neoOverworldStoryDock .stage-panel{gap:0!important;padding:0!important}
      #neoOverworldStoryDock #scene{
        margin:0!important;padding:0!important;border:0!important;
        border-radius:0!important;overflow:hidden!important;
        display:flex!important;align-items:flex-end!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople:not([hidden]){
        align-items:flex-end!important;margin:0!important;padding:0!important;
        flex-shrink:0!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person{
        justify-content:flex-end!important;align-items:center!important;
        padding:0!important;margin:0!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person img{
        height:100%!important;max-height:100%!important;
        object-position:center bottom!important;margin:0!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person span{display:none!important}
      #neoOverworldStoryDock #dialogue{margin:0!important;border-radius:12px!important}
      #neoOverworldStoryDock #dialogue .dialogue-title{position:relative!important}
      #neoOverworldStoryDock #dialogue #speaker:not([hidden]){
        display:inline-block!important;font-weight:800!important;
      }
    `;
    document.head.append(portraitPlacement);
    // Character interaction layout follows the portrait-left / actions-right
    // visual reference; ordinary story dialogue is unaffected.
    const idleStage=sceneArea?.closest('.stage-panel');
    const idleCaption=document.createElement('div');
    idleCaption.id='neoOverworldInteractionCaption';
    idleCaption.setAttribute('aria-live','polite');
    const idleName=document.createElement('strong');
    const idleHint=document.createElement('span');
    idleHint.textContent='Choose how you would like to spend time together.';
    idleCaption.append(idleName,idleHint);
    const idleBack=document.createElement('button');
    idleBack.type='button';idleBack.id='neoOverworldInteractionBack';
    idleBack.textContent='↶ Back';
    idleBack.onclick=()=>{
      if(bridge()?.snapshot()?.locked)return;
      interactionFocus=null;bridge()?.clearInteraction?.();
      hideStory();queueStorySync();
    };
    idleStage?.append(idleCaption,idleBack);
    const idleLayout=document.createElement('style');
    idleLayout.textContent=`
      #neoOverworldInteractionCaption,#neoOverworldInteractionBack{display:none!important}
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock{
        width:min(850px,calc(100vw - 24px))!important;left:50%!important;right:auto!important;
        transform:translateX(-50%)!important;max-height:min(78dvh,750px)!important;
        overflow-y:auto!important;background:transparent!important;border:0!important;box-shadow:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-panel{
        display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(190px,.7fr)!important;
        grid-template-rows:minmax(220px,1fr) auto!important;align-items:stretch!important;
        gap:0 12px!important;padding:12px!important;background:transparent!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #scene{
        grid-column:1!important;grid-row:1!important;min-height:240px!important;
        height:min(70dvh,440px)!important;max-height:none!important;
        display:flex!important;align-items:flex-end!important;justify-content:center!important;
        overflow:hidden!important;background:transparent!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldScenePeople:not([hidden]){
        height:100%!important;max-height:100%!important;width:100%!important;justify-content:center!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .neo-ow-person{
        flex:0 1 100%!important;width:100%!important;max-width:100%!important;
        height:100%!important;max-height:100%!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .neo-ow-person img{
        height:100%!important;max-height:100%!important;object-fit:contain!important;
        object-position:center bottom!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not([hidden]){
        position:relative!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;
        grid-column:2!important;grid-row:1!important;align-self:center!important;width:100%!important;max-width:none!important;
        display:flex!important;flex-direction:column!important;gap:7px!important;
        padding:0!important;margin:0!important;max-height:none!important;
        overflow:visible!important;background:transparent!important;border:0!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu{
        padding:14px!important;background:#171426ed!important;border:1px solid #b77ca6!important;
        border-radius:13px!important;box-shadow:0 14px 36px #0009!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions button{
        width:100%!important;min-height:45px!important;text-align:left!important;
        padding:10px 14px!important;white-space:normal!important;
        border:1px solid #a18ab4!important;background:#29243f!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions button:hover,
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions button:focus-visible{
        background:#2869b8!important;border-color:#b8dcff!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldInteractionCaption{
        grid-column:1!important;grid-row:2!important;display:flex!important;flex-direction:column;
        gap:5px;padding:12px!important;border:1px solid #a382b4;border-radius:10px;
        background:#1c1830e8;color:#f7eefa;font:14px system-ui;
      }
      #neoOverworldInteractionCaption strong{color:#ffc3e5;font-size:16px}
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldInteractionBack{
        grid-column:2!important;grid-row:2!important;display:block!important;
        width:100%!important;min-height:43px!important;align-self:stretch!important;
        color:#fff;background:#302942;border:1px solid #a18ab4;
        border-radius:9px;cursor:pointer;font:700 14px system-ui;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-planner,
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .scene-foot{display:none!important}
      @media(max-width:650px){
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-panel{
          grid-template-columns:minmax(0,1fr) minmax(145px,.75fr)!important;
          grid-template-rows:minmax(180px,1fr) auto!important;gap:0 8px!important;padding:8px!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #scene{
          min-height:190px!important;height:min(42dvh,330px)!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions button{
          padding:8px!important;font-size:12px!important;min-height:40px!important;
        }
        #neoOverworldInteractionCaption{font-size:12px!important}
      }
    `;
    document.head.append(idleLayout);
    // Final idle-only overrides intentionally follow the legacy RPG styles.
    // Hide exploration UI entirely while focusing a character, eliminate blue
    // panels, and force a single vertical action list as in the supplied mockup.
    const mockupPolish=document.createElement('style');
    mockupPolish.textContent=`
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldBottom,
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldSheet,
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldMenu,
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldSheetBackdrop{
        display:none!important;visibility:hidden!important;pointer-events:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock{
        background:transparent!important;border:0!important;box-shadow:none!important;
        overflow:visible!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock>button:first-child{
        display:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-panel{
        background:transparent!important;border:0!important;box-shadow:none!important;
        overflow:visible!important;min-height:0!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-panel > :not(#scene):not(#characterActions):not(#neoOverworldInteractionCaption):not(#neoOverworldInteractionBack){
        display:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #scene{
        background:transparent!important;border:0!important;box-shadow:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #scene::after{
        display:none!important;background:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not([hidden]){
        display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;
        grid-template-columns:none!important;grid-template-rows:none!important;
        justify-content:center!important;align-items:stretch!important;gap:5px!important;
        padding:0!important;margin:0!important;background:transparent!important;
        border:0!important;box-shadow:none!important;width:100%!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not([hidden]) > button{
        display:block!important;flex:0 0 auto!important;grid-column:auto!important;
        width:100%!important;min-width:0!important;max-width:none!important;
        min-height:42px!important;padding:9px 15px!important;
        border-radius:8px!important;border:1px solid #a28eab!important;
        background:linear-gradient(110deg,#29253ed9,#171627d9)!important;
        color:#fff!important;box-shadow:0 3px 12px #0006!important;
        font:700 13px system-ui!important;text-align:left!important;
        white-space:normal!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not([hidden]) > button:first-child{
        background:linear-gradient(105deg,#3989e8f2,#1e5bb6f2)!important;
        border-color:#acd2ff!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldInteractionCaption{
        background:linear-gradient(90deg,#151222e0,#1512227a)!important;
        border:0!important;border-left:3px solid #e88cb7!important;
        border-radius:7px!important;box-shadow:none!important;
      }
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldInteractionBack{
        background:#201a33dd!important;border:1px solid #9b83a8!important;
        text-align:left!important;padding-left:15px!important;min-height:42px!important;
      }
      @media(max-width:650px){
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock{
          width:calc(100vw - 12px)!important;max-height:82dvh!important;
          overflow-y:auto!important;
        }
      }
    `;
    document.head.append(mockupPolish);

    // Keep the character at the same on-screen scale in interaction and dialogue
    // views. Dialogue remains a full-width strip below the scene.
    const sharedSceneScale=document.createElement('style');
    sharedSceneScale.textContent=`
      #neoOverworldStoryDock #scene:not(:has(#rpgSceneCG:not([hidden]))){
        height:min(70dvh,440px)!important;min-height:min(70dvh,440px)!important;
        max-height:min(70dvh,440px)!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople:not([hidden]){
        height:100%!important;max-height:100%!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person{
        height:100%!important;max-height:100%!important;
      }
      #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person img{
        height:100%!important;max-height:100%!important;object-fit:contain!important;
        object-position:center bottom!important;
      }
    `;
    document.head.append(sharedSceneScale);
    // Applied after idle interactions and shared-scene rules so they cannot
    // overwrite the source-preserving dialogue bust crop.
    const dialogueBustCropStyle=document.createElement('style');
    dialogueBustCropStyle.id='neoOverworldDialogueBustCrop';
    dialogueBustCropStyle.textContent=`
      #neoOverworldOverlay #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person{
        position:relative!important;overflow:hidden!important;
      }
      #neoOverworldOverlay #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person>img:not(.rpg-safe-avatar){
        position:absolute!important;left:0!important;top:0!important;
        display:block!important;width:100%!important;
        height:var(--neo-ow-dialogue-bust-height,278%)!important;
        max-width:none!important;max-height:none!important;
        object-fit:cover!important;object-position:center top!important;
        transform:none!important;margin:0!important;
      }
      #neoOverworldOverlay #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person>img[hidden]{display:none!important}
      /* Discreet Mode chibis are separate overlays and remain uncropped. */
      :root[data-rpg-discreet="on"] #neoOverworldOverlay #neoOverworldStoryDock #neoOverworldScenePeople .neo-ow-person>.rpg-safe-avatar{
        position:relative!important;height:100%!important;object-fit:contain!important;
      }
    `;
    document.head.append(dialogueBustCropStyle);

    const dialogueStyle=document.createElement('style');
    dialogueStyle.textContent=`
      /* A stable two-line PC / three-line mobile speech window, independent
         of the author's sentence length or currently offered choices. */
      #neoOverworldStoryDock #dialogue{
        box-sizing:border-box!important;height:150px!important;min-height:150px!important;
        max-height:150px!important;flex:0 0 150px!important;
        padding:13px 18px 40px!important;overflow:visible!important;
      }
      #neoOverworldStoryDock #dialogue #line{
        font-size:16px!important;line-height:1.45!important;
        height:2.9em!important;min-height:0!important;
        max-height:2.9em!important;overflow:hidden!important;
        max-width:none!important;width:100%!important;margin:8px 0 0!important;
        white-space:pre-line!important;overflow-wrap:anywhere!important;
      }
      #neoOverworldStoryDock #neoOverworldPageContinue:not([hidden]){
        position:absolute;right:14px;bottom:9px;display:block;
        border:1px solid #b88eb9;border-radius:8px;background:#513451;
        color:white;padding:6px 13px;font:700 14px system-ui;cursor:pointer;
        z-index:10;
      }
      #neoOverworldOverlay.neo-ow-paging #neoOverworldStoryDock #choices,
      #neoOverworldOverlay.neo-ow-paging #neoOverworldStoryDock #playerChoicePrompt{display:none!important}
      #neoOverworldStoryDock #dialogue > #choices:not(:empty){
        position:absolute!important;bottom:7px!important;left:16px!important;
        right:80px!important;max-height:34dvh!important;overflow-y:auto!important;
        margin:0!important;z-index:9!important;
      }
      #neoOverworldStoryDock #dialogue > #choices:has(>button:nth-child(2)){
        left:10px!important;right:10px!important;
        bottom:calc(100% + 7px)!important;
        padding:10px!important;border-radius:12px;background:#211b34fa;
        border:1px solid #b48bb7;
      }
      #neoOverworldStoryDock #playerChoicePrompt:not([hidden]){
        position:absolute!important;inset:auto 0 calc(100% + 7px)!important;
        z-index:11!important;max-height:42dvh!important;display:block!important;
      }
      #neoOverworldStoryDock #playerChoicePanel{max-height:42dvh!important;overflow:auto!important}
      #neoOverworldOverlay:not(.neo-ow-idle-interaction) #neoOverworldStoryDock #neoOverworldActionTray,
      #neoOverworldOverlay:not(.neo-ow-idle-interaction) #neoOverworldStoryDock #characterActions{display:none!important}
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #dialogue,
      #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldActionTray{display:none!important}
      @media(max-width:700px){
        #neoOverworldStoryDock #dialogue{
          height:176px!important;min-height:176px!important;max-height:176px!important;
          flex:0 0 176px!important;padding:12px 12px 38px!important;
        }
        #neoOverworldStoryDock #dialogue #line{
          font-size:15px!important;line-height:1.45!important;
          height:4.35em!important;max-height:4.35em!important;
        }
      }
    `;
    document.head.append(dialogueStyle);

    // Choice buttons stay native. Move their existing DOM into a foreground
    // panel so a response never stretches the fixed-height dialogue box.
    const nativePrompt=document.getElementById('playerChoicePrompt');
    const nativePromptHome=nativePrompt?.parentNode;
    const nativePromptNext=nativePrompt?.nextSibling||null;
    const nativePromptPanel=document.getElementById('playerChoicePanel');
    const choiceList=document.getElementById('choices');
    const genericChoicePanel=document.createElement('section');
    genericChoicePanel.id='neoOverworldGenericChoices';
    genericChoicePanel.hidden=true;
    genericChoicePanel.setAttribute('aria-label','Response choices');
    const genericChoiceInner=document.createElement('div');
    genericChoiceInner.className='neo-ow-choice-inner';
    const genericChoiceHeading=document.createElement('div');
    genericChoiceHeading.className='neo-ow-choice-head';
    const genericTitle=document.createElement('strong');
    genericTitle.textContent='YOUR RESPONSE';
    genericChoiceHeading.append(genericTitle);
    genericChoiceInner.append(genericChoiceHeading);
    genericChoicePanel.append(genericChoiceInner);
    const showChoicesButton=document.createElement('button');
    showChoicesButton.type='button';
    showChoicesButton.id='neoOverworldShowChoices';
    showChoicesButton.textContent='☷ Show choices';
    showChoicesButton.hidden=true;
    showChoicesButton.setAttribute('aria-controls','playerChoicePrompt neoOverworldGenericChoices');
    const hideChoicesButton=document.createElement('button');
    hideChoicesButton.type='button';
    hideChoicesButton.className='neo-ow-hide-choices';
    hideChoicesButton.textContent='✕ Hide choices';
    const hideGenericChoicesButton=hideChoicesButton.cloneNode(true);
    nativePromptPanel?.prepend(hideChoicesButton);
    genericChoiceHeading.append(hideGenericChoicesButton);
    overlay.append(genericChoicePanel,showChoicesButton);
    let lastChoiceKey='',choicesCollapsed=false;
    function attachChoicePanels(){
      if(nativePrompt&&nativePrompt.parentNode!==overlay)overlay.append(nativePrompt);
      hideChoicesButton.hidden=false;
    }
    function restoreChoicePanels(){
      if(choiceList?.parentNode===genericChoiceInner)document.getElementById('dialogue')?.append(choiceList);
      if(nativePrompt&&nativePromptHome&&nativePrompt.parentNode===overlay){
        if(nativePromptNext?.parentNode===nativePromptHome)nativePromptHome.insertBefore(nativePrompt,nativePromptNext);
        else nativePromptHome.append(nativePrompt);
      }
      hideChoicesButton.hidden=true;
      genericChoicePanel.hidden=true;
      showChoicesButton.hidden=true;
    }
    function setChoicesCollapsed(collapsed){
      choicesCollapsed=!!collapsed;
      overlay.classList.toggle('neo-ow-choices-collapsed',choicesCollapsed);
      showChoicesButton.hidden=!choicesCollapsed||overlay.classList.contains('neo-ow-paging');
      showChoicesButton.setAttribute('aria-expanded',String(!choicesCollapsed));
      if(choicesCollapsed)showChoicesButton.focus({preventScroll:true});
    }
    hideChoicesButton.onclick=()=>setChoicesCollapsed(true);
    hideGenericChoicesButton.onclick=()=>setChoicesCollapsed(true);
    showChoicesButton.onclick=()=>{
      setChoicesCollapsed(false);
      const activePanel=(!nativePrompt?.hidden&&nativePrompt)||genericChoicePanel;
      activePanel?.querySelector('#choices button:not(:disabled)')?.focus?.({preventScroll:true});
    };
    function syncChoicePresentation(idleFocus){
      const nativeActive=!!nativePrompt&&!nativePrompt.hidden;
      const count=choiceList?.querySelectorAll('button')?.length||0;
      const genericActive=!nativeActive&&count>1&&!idleFocus;
      const active=(nativeActive||genericActive)&&!idleFocus;
      const paging=overlay.classList.contains('neo-ow-paging');
      if(!active){
        overlay.classList.remove('neo-ow-has-choices','neo-ow-choices-collapsed');
        genericChoicePanel.hidden=true;showChoicesButton.hidden=true;
        if(choiceList?.parentNode===genericChoiceInner)document.getElementById('dialogue')?.append(choiceList);
        lastChoiceKey='';choicesCollapsed=false;
        return;
      }
      attachChoicePanels();
      if(genericActive){
        if(choiceList.parentNode!==genericChoiceInner)genericChoiceInner.append(choiceList);
        genericChoicePanel.hidden=false;
      }else genericChoicePanel.hidden=true;
      const key=String(bridge()?.dialogueText?.()||'')+'\u0000'+
        String(document.getElementById('speaker')?.textContent||'')+'\u0000'+
        Array.from(choiceList.querySelectorAll('button'),b=>b.textContent).join('\u0000');
      if(key!==lastChoiceKey){lastChoiceKey=key;choicesCollapsed=false;}
      overlay.classList.add('neo-ow-has-choices');
      overlay.classList.toggle('neo-ow-choices-collapsed',choicesCollapsed);
      overlay.classList.toggle('neo-ow-two-speakers',scenePeople.children.length>1);
      showChoicesButton.hidden=!choicesCollapsed||paging;
    }
    const choiceLayout=document.createElement('style');
    choiceLayout.textContent="\n#neoOverworldOverlay #playerChoicePrompt[hidden],#neoOverworldOverlay #neoOverworldGenericChoices[hidden],\n#neoOverworldOverlay #neoOverworldShowChoices[hidden]{display:none!important}\n#neoOverworldOverlay #playerChoicePrompt:not([hidden]),#neoOverworldOverlay #neoOverworldGenericChoices:not([hidden]){\n  position:absolute!important;z-index:9!important;inset:auto!important;top:43%!important;\n  left:50%!important;right:auto!important;transform:translate(-50%,-50%)!important;\n  width:min(520px,calc(100vw - 28px))!important;max-width:none!important;\n  max-height:min(46dvh,440px)!important;display:block!important;box-sizing:border-box!important;\n  overflow-y:auto!important;overscroll-behavior:contain!important;margin:0!important;\n  padding:0!important;pointer-events:auto!important;filter:drop-shadow(0 14px 30px #000a)\n}\n#neoOverworldOverlay #playerChoicePanel,#neoOverworldOverlay #neoOverworldGenericChoices .neo-ow-choice-inner{\n  position:relative!important;display:flex!important;flex-direction:column!important;\n  width:100%!important;max-width:none!important;max-height:none!important;\n  padding:14px!important;margin:0!important;box-sizing:border-box!important;\n  background:#211b35f4!important;border:1px solid #cb9ccc!important;\n  border-radius:13px!important;box-shadow:0 16px 34px #0009!important;\n  gap:9px!important;pointer-events:auto!important;animation:none!important\n}\n#neoOverworldOverlay .neo-ow-hide-choices{\n  align-self:flex-end!important;order:-1;cursor:pointer;padding:7px 10px!important;\n  min-height:34px;border:1px solid #ad8bb8;border-radius:8px;color:#fff;background:#513858;\n  font:700 12px system-ui\n}\n#neoOverworldOverlay #playerChoicePanel #choices,#neoOverworldOverlay #neoOverworldGenericChoices #choices{\n  position:static!important;inset:auto!important;display:grid!important;grid-template-columns:1fr!important;\n  gap:8px!important;width:100%!important;max-height:none!important;\n  margin:0!important;padding:0!important;overflow:visible!important;\n  border:0!important;background:transparent!important\n}\n#neoOverworldOverlay #playerChoicePanel #choices button,#neoOverworldOverlay #neoOverworldGenericChoices #choices button{\n  width:100%!important;min-height:43px!important;text-align:left!important;\n  white-space:normal!important;line-height:1.3!important\n}\n#neoOverworldOverlay .neo-ow-choice-head{display:flex;align-items:center;justify-content:space-between;gap:10px}\n#neoOverworldOverlay #neoOverworldShowChoices:not([hidden]){\n  position:absolute;z-index:10;bottom:calc(150px + 18px);right:max(16px,env(safe-area-inset-right));\n  border:1px solid #da9ed3;border-radius:9px;padding:9px 14px;color:#fff;background:#533558e8;\n  box-shadow:0 8px 24px #0009;cursor:pointer;font:700 13px system-ui\n}\n#neoOverworldOverlay.neo-ow-choices-collapsed #playerChoicePrompt,\n#neoOverworldOverlay.neo-ow-choices-collapsed #neoOverworldGenericChoices,\n#neoOverworldOverlay.neo-ow-paging #playerChoicePrompt,\n#neoOverworldOverlay.neo-ow-paging #neoOverworldGenericChoices{display:none!important}\n#neoOverworldOverlay.neo-ow-idle-interaction #playerChoicePrompt,\n#neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldGenericChoices,\n#neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldShowChoices{display:none!important}\n@media(min-width:1100px){\n#neoOverworldOverlay:not(.neo-ow-two-speakers):not(.neo-ow-showing-cg) #playerChoicePrompt:not([hidden]),\n#neoOverworldOverlay:not(.neo-ow-two-speakers):not(.neo-ow-showing-cg) #neoOverworldGenericChoices:not([hidden]){\n  left:auto!important;right:2.5vw!important;top:43%!important;\n  transform:translateY(-50%)!important;width:min(370px,28vw)!important\n}}\n@media(max-width:700px){\n#neoOverworldOverlay #playerChoicePrompt:not([hidden]),#neoOverworldOverlay #neoOverworldGenericChoices:not([hidden]){\n  top:41%!important;max-height:43dvh!important;width:calc(100vw - 20px)!important\n}\n#neoOverworldOverlay #playerChoicePanel,#neoOverworldOverlay #neoOverworldGenericChoices .neo-ow-choice-inner{padding:10px!important}\n#neoOverworldOverlay #neoOverworldShowChoices:not([hidden]){\n  bottom:calc(176px + max(12px,env(safe-area-inset-bottom)));right:10px\n}}\n";
    document.head.append(choiceLayout);
    // Mobile-only: full-width character, then two action columns and caption.
    // Desktop interaction and story dialogue styles remain unchanged.
    const mobileInteractionGrid=document.createElement('style');
    mobileInteractionGrid.id='neoOverworldMobileInteractionGrid';
    mobileInteractionGrid.textContent=`
@media(max-width:650px){
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock{
  box-sizing:border-box!important;left:6px!important;right:6px!important;
  width:calc(100vw - 12px)!important;transform:none!important;
  bottom:max(8px,env(safe-area-inset-bottom))!important;
  max-height:calc(100dvh - 100px - env(safe-area-inset-bottom))!important;
  overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-panel{
  box-sizing:border-box!important;display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:minmax(190px,36dvh) auto auto auto!important;
  gap:0!important;padding:0!important;width:100%!important;min-width:0!important;
  overflow:visible!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #scene{
  box-sizing:border-box!important;grid-column:1!important;grid-row:1!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  height:36dvh!important;min-height:190px!important;max-height:36dvh!important;
  margin:0!important;padding:0!important;
  overflow:hidden!important;display:flex!important;justify-content:center!important;align-items:flex-start!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldScenePeople:not([hidden]){
  position:relative!important;inset:auto!important;transform:none!important;
  display:flex!important;justify-content:center!important;align-items:flex-start!important;
  width:100%!important;max-width:100%!important;height:100%!important;
  margin:0!important;padding:0!important;overflow:hidden!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .neo-ow-person{
  position:relative!important;left:auto!important;right:auto!important;
  margin:0 auto!important;transform:none!important;flex:0 0 100%!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  height:100%!important;max-height:100%!important;overflow:hidden!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .neo-ow-person>img:not(.rpg-safe-avatar){
  position:absolute!important;left:0!important;right:0!important;top:0!important;
  width:100%!important;height:var(--neo-ow-dialogue-bust-height,278%)!important;
  max-width:none!important;max-height:none!important;transform:none!important;
  object-fit:cover!important;object-position:center top!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not([hidden]){
  box-sizing:border-box!important;grid-column:1!important;grid-row:2!important;
  display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
  grid-auto-rows:minmax(46px,auto)!important;align-items:stretch!important;
  justify-items:stretch!important;gap:7px!important;
  margin-top:0!important;
  position:relative!important;inset:auto!important;transform:none!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  max-height:none!important;overflow:visible!important;
  padding:0!important;margin:0!important;background:transparent!important;
  border:0!important;box-shadow:none!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions:not([hidden])>button{
  box-sizing:border-box!important;display:flex!important;
  align-items:center!important;justify-content:flex-start!important;
  grid-column:auto!important;width:100%!important;min-width:0!important;
  max-width:100%!important;min-height:46px!important;
  padding:9px 10px!important;font-size:13px!important;line-height:1.25!important;
  text-align:left!important;white-space:normal!important;overflow-wrap:anywhere!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldInteractionCaption{
  grid-column:1!important;grid-row:3!important;min-width:0!important;
  padding:9px 12px!important;font-size:12px!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions>button[data-character-action="scout"]{
  display:none!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions>button[data-character-action="glance"]{
  background:#29243b!important;color:#fff!important;
  border:1px solid #9b819f!important;box-shadow:none!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions>button[data-character-action="deck"]{
  order:6!important;
 }
 #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions #neoOverworldInteractionBack{
  box-sizing:border-box!important;display:flex!important;grid-column:auto!important;
  grid-row:auto!important;order:7!important;align-items:center!important;justify-content:flex-start!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  min-height:46px!important;padding:9px 10px!important;
  text-align:left!important;font-size:13px!important;
 }
}`;
    document.head.append(mobileInteractionGrid);
    // Mobile character submenus (Make plans, Spend time, etc.): the portrait
    // stays full-width; the subtitle joins the character's name and the choice
    // buttons occupy two equal columns. Desktop retains its original layout.
    const mobileSubmenuGrid=document.createElement('style');
    mobileSubmenuGrid.id='neoOverworldMobileSubmenuGrid';
    mobileSubmenuGrid.textContent=`
      @media(max-width:650px){
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock .stage-panel:has(#characterActions.choice-menu){
          grid-template-rows:minmax(190px,36dvh) auto auto!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu:not([hidden]){
          grid-column:1!important;grid-row:3!important;
          display:block!important;padding:0!important;margin:0!important;
          background:transparent!important;border:0!important;box-shadow:none!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu>.character-menu-eyebrow,
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu>.character-menu-title,
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu>.character-menu-description{
          display:none!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu .character-menu-options{
          display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:7px!important;width:100%!important;min-width:0!important;
          margin:0!important;padding:0!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu .character-menu-options>button{
          box-sizing:border-box!important;width:100%!important;min-width:0!important;
          min-height:52px!important;padding:9px 10px!important;
          white-space:normal!important;overflow-wrap:anywhere!important;
          font-size:12px!important;line-height:1.3!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #neoOverworldInteractionCaption.neo-ow-submenu-caption{
          grid-column:1!important;grid-row:2!important;
          margin:0!important;padding:10px 12px!important;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldInteractionCaption.neo-ow-submenu-caption::before{
          content:attr(data-menu-heading);display:block;
          font:700 11px system-ui;letter-spacing:.12em;color:#f5afcd;
          text-transform:uppercase;order:-1;
        }
        #neoOverworldOverlay.neo-ow-idle-interaction #neoOverworldStoryDock #characterActions.choice-menu #neoOverworldInteractionBack{
          display:none!important;
        }
      }
    `;
    document.head.append(mobileSubmenuGrid);
    attachChoicePanels();
    let storyDock=null;
    let lastSceneKey='';
    let suspendedForDuel=false;
    let syncDuel=()=>{};
    function showStory(){
      if(!stage||!stageHome)return false;
      if(!storyDock){
        storyDock=document.createElement('section');
        storyDock.id='neoOverworldStoryDock';
        storyDock.setAttribute('aria-label','RPG conversation and story');
        Object.assign(storyDock.style,{position:'absolute',zIndex:'4',bottom:'12px',left:'max(8px,env(safe-area-inset-left))',right:'max(8px,env(safe-area-inset-right))',maxHeight:'min(72vh,680px)',overflow:'auto',border:'2px solid #b58cc7',borderRadius:'14px',background:'#181329',boxShadow:'0 10px 45px #000c'});
        const back=document.createElement('button');back.type='button';back.textContent='← Back to map';back.style.cssText='position:sticky;top:0;z-index:5;display:block;width:100%;padding:11px;border:0;background:#352548;color:white;font:700 14px system-ui;cursor:pointer';
        back.onclick=()=>{
          if(bridge()?.snapshot()?.locked){showNotice('Finish the current conversation or event first.');return;}
          interactionFocus=null;bridge()?.clearInteraction?.();hideStory();queueStorySync();
        };storyDock.append(back);
      }
      overlay.append(storyDock);storyDock.append(stage);
      stage.style.cssText='display:block;position:relative;width:100%;max-width:none;height:auto;min-height:0;overflow:visible;margin:0;padding:8px';
      storyDock.hidden=false;
      actionTray.classList.remove('expanded');actionToggle.textContent='✦ Actions';
      actionToggle.setAttribute('aria-expanded','false');lockMapForStory(true);return true;
    }
    function hideStory(){
      if(!stageHome||!stage)return;
      // Never reparent stage back to the classic layout between conversations.
      // Only explicit dismiss() restores it after hiding the overworld overlay.
      if(storyDock)storyDock.hidden=true;
      lockMapForStory(false);
      portraitWindow?.reset();lastPortraitSignature='';
      scenePeople.replaceChildren();scenePeople.hidden=true;
      sceneArea?.classList.remove('neo-ow-participants');
      if(!overlay.hidden)refresh();
    }
    // Paginate *only presentation text*: the RPG and its scripted CG/choice
    // step remain unchanged until the final page is acknowledged.
    const lineElement=document.getElementById('line');
    const dialogueElement=document.getElementById('dialogue');
    const pageContinue=document.createElement('button');
    pageContinue.id='neoOverworldPageContinue';pageContinue.type='button';
    pageContinue.hidden=true;pageContinue.textContent='Continue ›';
    pageContinue.setAttribute('aria-label','Continue reading dialogue');
    dialogueElement?.append(pageContinue);
    let pageKey='',pageIndex=0;
    function resetDialoguePages(){
      pageKey='';pageIndex=0;pageContinue.hidden=true;
      overlay.classList.remove('neo-ow-paging');
    }
    function syncDialoguePages(idleFocus){
      if(!lineElement||!dialogueElement||idleFocus){resetDialoguePages();return;}
      const original=bridge()?.dialogueText?.()||'';
      const speaker=document.getElementById('speaker')?.textContent||'';
      const key=speaker+'\u0000'+original;
      if(key!==pageKey){pageKey=key;pageIndex=0;}
      const style=window.getComputedStyle(lineElement);
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      const family=style.fontFamily||'sans-serif';
      const size=style.fontSize||'16px';
      const weight=style.fontWeight||'400';
      const spacing=parseFloat(style.letterSpacing)||0;
      if(ctx)ctx.font=weight+' '+size+' '+family;
      const measure=text=>(ctx?ctx.measureText(text).width:text.length*8)+spacing*Array.from(text).length;
      const width=Math.max(80,Math.floor(lineElement.getBoundingClientRect().width||dialogueElement.clientWidth-40)-6);
      const maxLines=window.innerWidth<=700?3:2;
      const pages=window.NeoOverworldTextPages?.split?.(original,width,maxLines,measure)||[original];
      pageIndex=Math.min(pageIndex,pages.length-1);
      const display=pages[pageIndex]||'';
      if(lineElement.textContent!==display)lineElement.textContent=display;
      const hasMore=pageIndex<pages.length-1;
      pageContinue.hidden=!hasMore;
      pageContinue.setAttribute('aria-label','Continue reading dialogue, page '+(pageIndex+1)+' of '+pages.length);
      overlay.classList.toggle('neo-ow-paging',hasMore);
    }
    pageContinue.onclick=()=>{
      if(pageContinue.hidden||!storyDock||storyDock.hidden)return;
      pageIndex++;syncDialoguePages(false);
    };
    // The original RPG listens for Space to advance story steps. Consume it
    // while a long sentence still has unread pages.
    document.addEventListener('keydown',event=>{
      if(pageContinue.hidden||overlay.hidden||event.target===pageContinue)return;
      if(event.key===' '||event.key==='Enter'){
        if(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select'))return;
        event.preventDefault();event.stopImmediatePropagation();pageContinue.click();
      }
    },true);
    window.addEventListener('resize',()=>{if(!overlay.hidden&&storyDock&&!storyDock.hidden)queueStorySync();});
    document.fonts?.ready?.then(()=>{if(!overlay.hidden)queueStorySync();});
    // Observe native story rendering rather than guessing when a conversation ends.
    // A single stage remains authoritative; the map only changes presentation.
    let storySyncQueued=false;
    function syncStory(){
      if(overlay.hidden||suspendedForDuel)return;
      const data=snapshot();
      if(!data)return;
      const cg=document.getElementById('rpgSceneCG');
      const hasCG=!!cg&&!cg.hidden&&!!cg.getAttribute('src')&&
        cg.closest('#scene')?.classList.contains('has-story-cg');
      // Never retain a tap-focus across travel, mandatory scenes or disappearance.
      if(interactionFocus&&(!data.people.includes(interactionFocus)||data.selected!==interactionFocus)){
        interactionFocus=null;
      }
      const arrivalOnly=!!data.arriving&&!data.eventActive;
      const characterChoiceMenu=document.body.classList.contains('rpg-character-choice-menu');
      const idleFocus=!data.arriving&&!hasCG&&interactionFocus===data.selected&&
        (!data.storyActive||characterChoiceMenu)?interactionFocus:null;
      const needsStory=!!((data.storyActive&&!arrivalOnly)||(hasCG&&!arrivalOnly)||idleFocus);
      overlay.classList.toggle('neo-ow-arriving',!!data.arriving&&!needsStory);
      overlay.classList.toggle('neo-ow-idle-interaction',!!idleFocus);
      if(idleFocus){
        idleName.textContent=bridge()?.portrait?.(idleFocus)?.name||idleFocus;
        // Reuse the existing caption beneath the portrait for submenu text.
        // Do not clone or move choice handlers: only the presentation changes.
        const menu=characterChoiceMenu?document.getElementById('characterActions'):null;
        const menuHeading=menu?.querySelector('.character-menu-eyebrow')?.textContent?.trim();
        const menuDescription=menu?.querySelector('.character-menu-description')?.textContent?.trim();
        idleHint.textContent=menuDescription||'Choose how you would like to spend time together.';
        idleCaption.dataset.menuHeading=menuHeading||'';
        idleCaption.classList.toggle('neo-ow-submenu-caption',!!menu);
      }
      // Mobile: Back is the final action, paired with Deck in the two-column
      // grid. On desktop, return it to its original separate stage position.
      const actionsForBack=document.getElementById('characterActions');
      const mobileBack=window.matchMedia('(max-width:650px)').matches;
      const backParent=mobileBack&&idleFocus?actionsForBack:idleStage;
      if(backParent&&idleBack.parentElement!==backParent)backParent.append(idleBack);
      if(needsStory){
        if(!storyDock||storyDock.hidden)showStory();
        else lockMapForStory(true);
        syncPortraits(hasCG,idleFocus);
        syncDialoguePages(idleFocus);
        overlay.classList.toggle('neo-ow-showing-cg',hasCG);
        syncChoicePresentation(idleFocus);
      }else{
        if(storyDock&&!storyDock.hidden)hideStory();
        else if(data.arriving)lockMapForStory(true);
        else lockMapForStory(false);
        resetDialoguePages();
        syncChoicePresentation(true);
        overlay.classList.remove('neo-ow-showing-cg','neo-ow-two-speakers');
        if(!data.storyActive)portraitWindow?.reset();
      }
      // The RPG render event is authoritative for both ordinary talks and
      // forced events; keeping the navigation synchronized prevents UI leaks.
      next.disabled=!!data.locked;
      travelToggle.disabled=!!data.locked;
    }
    function queueStorySync(){
      if(storySyncQueued)return;
      storySyncQueued=true;
      queueMicrotask(()=>{storySyncQueued=false;syncStory();});
    }
    window.addEventListener('neo-rpg-overworld-render',()=>{
      if(overlay.hidden||suspendedForDuel)return;
      refresh();
      queueStorySync();
      syncPoseTriggerQueue();
    });
    for(const id of ['line','choices','characterActions','rpgSceneCG','speaker']){
      const el=document.getElementById(id);
      if(el)new MutationObserver(queueStorySync).observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','src']});
    }
    function snapshot(){return bridge()?.snapshot();}
    function refresh(){
      const data=snapshot();if(!data)return;
      const selected=data.places.find(p=>p.id===data.location);
      locationName.textContent=selected?.name||'Neo Campus';
      dayLabel.textContent='Day '+data.day+' · '+(['Morning','Afternoon','Evening'][data.slot]||'');
      next.disabled=data.locked;travelToggle.disabled=data.locked;
      if(data.locked)closeSheet();
      const people=data.people.map(id=>{
        // Match Laca's canonical outfit rules: lifeguard uniform on duty at Riverside Park.
        const onLifeguardShift=id==='laca'&&data.location==='park'&&(data.slot===0||data.slot===1);
        return onLifeguardShift?'laca:lifeguardFrontLeaning':id;
      }).join(',');
      const nextSrc='/overworld-prototype.html?scene='+encodeURIComponent(data.location)+'&cast='+encodeURIComponent(people)+'&rpg-integration=1&chibi='+(document.documentElement.dataset.rpgDiscreet==='on'?'1':'0');
      if(frame.getAttribute('src')!==nextSrc)frame.src=nextSrc;
      note.hidden=true;
    }
    function dismiss(){
      interactionFocus=null;
      restoreChoicePanels();
      closeSheet();hideMenu();hideEvents();hideDeck();suspendedForDuel=false;hideStory();
      // Only an explicit return to the classic interface restores its stage.
      if(stage&&stageHome&&stage.parentNode===storyDock){
        if(stageNext&&stageNext.parentNode===stageHome)stageHome.insertBefore(stage,stageNext);
        else stageHome.append(stage);
        stage.removeAttribute('style');
      }
      overlay.querySelectorAll('[data-overworld-activity-panel],[data-overworld-activity-backdrop]').forEach(el=>el.remove());
      overlay.classList.remove('neo-ow-activity-open');
      overlay.hidden=true;overlay.style.display='none';frame.src='about:blank';open.focus();
    }
    open.addEventListener('click',()=>{attachChoicePanels();refresh();overlay.hidden=false;overlay.style.display='flex';queueStorySync();syncPoseTriggerQueue();syncDuel();});
    document.getElementById('rpgDiscreetToggle')?.addEventListener('click',()=>{syncChibiButton();syncChibiMode();});
    function performTravel(target){
      const data=snapshot();if(!data)return;
      if(data.locked){showNotice('Travel is unavailable during the current scene.');closeSheet();return;}
      if(target===data.location){closeSheet();return;}
      closeSheet();
      if(!bridge().travel(target)){showNotice('Travel is unavailable during the current story or activity.');refresh();return;}
      refresh();
      queueStorySync();
    }
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||overlay.hidden)return;
      const message=event.data;
      if(message?.type==='neo-overworld-pose-triggers'){queuePoseTriggers(message);return}
      if(message?.type!=='neo-overworld-action')return;
      if(overlay.classList.contains('neo-ow-activity-open')||!storyShield.hidden)return;
      if(message.kind==='navigation'){
        if(message.id==='deck'){showDeck();return;}
        if(message.id==='status'){document.getElementById('statusBtn')?.click();return;}
        if(message.id==='activities'||message.id==='events'){hideMenu();if(message.id==='activities')showActivities(bridge()?.activities()||[]);else showEvents();return;}
      }
      if(message.kind==='person'){
        const poseTrigger=poseTriggersById.get(message.id);
        if(poseTrigger){void playPoseTrigger(poseTrigger);return}
        // Capture the explicitly tapped NPC before the native engine renders.
        interactionFocus=message.id;
        if(!showStory())dismiss();
        if(!bridge()?.interact(message.id)){
          interactionFocus=null;hideStory();showNotice('Character interaction is not currently available.');
        }else queueStorySync();
      }else if(message.kind==='hotspot'){
        const activities=bridge()?.activities()||[];
        showActivities(activities);
      }
    });
    function showActivities(activities){
        closeSheet();hideMenu();hideEvents();
        const eligible=activities.filter(a=>!a.disabled);
        if(!eligible.length){showNotice('No activities are available right now.');return;}
        overlay.querySelectorAll('[data-overworld-activity-panel],[data-overworld-activity-backdrop]').forEach(el=>el.remove());
        const backdrop=document.createElement('button');
        backdrop.type='button';backdrop.dataset.overworldActivityBackdrop='true';
        backdrop.setAttribute('aria-label','Close activities');
        backdrop.style.cssText='position:absolute;z-index:11;inset:0;border:0;background:#080618ad;cursor:default';
        const panel=document.createElement('section');panel.dataset.overworldActivityPanel='true';
        panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
        panel.setAttribute('aria-label','Current RPG activities');
        Object.assign(panel.style,{
          position:'absolute',zIndex:'12',top:'max(76px,env(safe-area-inset-top))',
          bottom:'max(15px,env(safe-area-inset-bottom))',
          left:'max(10px,env(safe-area-inset-left))',right:'max(10px,env(safe-area-inset-right))',
          width:'min(580px,calc(100vw - 20px))',margin:'0 auto',
          padding:'16px',overflowY:'auto',overscrollBehavior:'contain',
          background:'#211a37f9',border:'1px solid #c79dc9',borderRadius:'15px',
          boxShadow:'0 18px 65px #000e'
        });
        overlay.classList.add('neo-ow-activity-open');
        const head=document.createElement('div');head.textContent='Choose a current RPG activity';panel.append(head);
        function closeActivities(){panel.remove();backdrop.remove();overlay.classList.remove('neo-ow-activity-open');}
        backdrop.onclick=closeActivities;
        for(const a of eligible){const button=document.createElement('button');button.textContent=a.title;button.type='button';Object.assign(button.style,{display:'block',marginTop:'8px',padding:'10px',width:'100%',background:'#403051',color:'white',borderRadius:'8px'});button.onclick=()=>{
          closeActivities();
          if(!showStory())dismiss();
          if(!bridge()?.activity(a.id)){hideStory();showNotice('Activity no longer available.');}
          else queueStorySync();
        };panel.append(button);}
        const cancel=document.createElement('button');cancel.textContent='✕ Close activities';cancel.type='button';
        cancel.style.cssText='display:block;margin-top:14px;width:100%;padding:11px;border-radius:9px;background:#38284a;color:white;border:1px solid #9a7da5';
        cancel.onclick=closeActivities;panel.append(cancel);overlay.append(backdrop,panel);
    }
    document.addEventListener('keydown',event=>{if(event.key!=='Escape'||overlay.hidden)return;
      if(overlay.classList.contains('neo-ow-has-choices')&&!overlay.classList.contains('neo-ow-choices-collapsed')&&!overlay.classList.contains('neo-ow-paging')){
        event.preventDefault();setChoicesCollapsed(true);syncChoicePresentation(false);return;
      }
      if(!storyShield.hidden){event.preventDefault();return;}if(overlay.classList.contains('neo-ow-activity-open')){event.preventDefault();overlay.querySelectorAll('[data-overworld-activity-panel],[data-overworld-activity-backdrop]').forEach(el=>el.remove());overlay.classList.remove('neo-ow-activity-open');return;}if(expandedSheet){event.preventDefault();closeSheet();return;}if(!deckPanel.hidden){hideDeck();return;}if(!eventPanel.hidden){hideEvents();return;}if(!menu.hidden){hideMenu();return;}if(!bridge()?.snapshot()?.locked)dismiss();});
    // Battles run in the original full-screen duel layer. Resume the map as soon as
    // its battle layer closes, without restarting the campaign or changing saves.
    const duel=document.getElementById('duel');
    if(duel){
      syncDuel=()=>{
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
      syncDuel();
    }
    if(window.NeoRpgOverworldStandalone)setTimeout(()=>{if(bridge()&&overlay.hidden)open.click();},0);
  }
  window.addEventListener('neo-rpg-overworld-bridge-ready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
