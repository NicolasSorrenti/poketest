'use strict';
// Primary RPG overworld presentation. All gameplay commands use the RPG state bridge.
(()=>{
  // Bootstrap the canonical story DOM from the overworld's own template.
  // This runs before rpg.js so its scene/choice/CG bindings see exactly one
  // stable set of nodes, without loading or borrowing the retired RPG layout.
  const stageTemplate=document.getElementById('neoOverworldStageTemplate');
  if(!stageTemplate?.content?.querySelector('#neoOverworldStage'))
    throw Error('Overworld story-stage template is missing.');
  if(!document.getElementById('neoOverworldStage')){
    const stage=stageTemplate.content.querySelector('#neoOverworldStage').cloneNode(true);
    document.body.append(stage);
  }
  const bridge=()=>window.NeoRpgOverworldBridge;
  function mount(){
    if(document.getElementById('neoOverworldOverlay')||!bridge())return;
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
    window.addEventListener('neo-rpg-save-status',event=>{
      if(event.detail?.message)showNotice(event.detail.message);
    });
    const frame=document.createElement('iframe');frame.title='Current Neo Campus location';Object.assign(frame.style,{flex:'1',minHeight:'0',width:'100%',border:'0'});
    // A map is a persistent view, not a disposable result of each RPG render.
    let activeMapKey='',activeCastKey='',lastIndicatorKey='';
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
    function syncNpcIndicators(force=false){
      const data=bridge()?.snapshot?.();
      if(!data||!frame.contentWindow||frame.getAttribute('src')==='about:blank')return;
      const signature=JSON.stringify([data.location,data.day,data.slot,data.indicators||{}]);
      if(!force&&signature===lastIndicatorKey)return;
      lastIndicatorKey=signature;
      frame.contentWindow.postMessage({
        type:'neo-overworld-npc-indicators',location:data.location,day:data.day,slot:data.slot,
        indicators:data.indicators||{}
      },location.origin);
    }
    frame.addEventListener('load',()=>{syncChibiMode();syncNpcIndicators(true);});
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
    const placeArt={arcade:'arcade.jpg',home:'home.jpg',park:'park.jpg',shop:'card-shop-day.png',cafe:'cafe.jpg',center:'center.jpg',library:'library.jpg'};
    const placeIcon={arcade:'🎮',home:'⌂',park:'🌳',shop:'🎁',cafe:'☕',center:'♟',library:'📚'};
    let expandedSheet=null;
    let guideSignature='';
    function closeSheet(){
      if(!expandedSheet&&sheet.hidden)return;
      expandedSheet=null;guideSignature='';sheet.hidden=true;sheetBackdrop.hidden=true;
      next.setAttribute('aria-expanded','false');travelToggle.setAttribute('aria-expanded','false');
      next.classList.remove('is-open');travelToggle.classList.remove('is-open');
      sheetBody.replaceChildren();
    }
    function renderGuide(){
      const view=window.NeoRpgOverworldGuide,api=bridge();
      if(!view?.render||!api?.guide||!api?.guideAction){
        sheetBody.replaceChildren();
        const unavailable=document.createElement('p');
        unavailable.textContent='Your daily guide is not available yet.';
        sheetBody.append(unavailable);
        return;
      }
      const model=api.guide();
      const signature=JSON.stringify(model);
      if(signature===guideSignature&&sheetBody.children.length)return;
      const scroll=sheetBody.scrollTop;
      view.render(sheetBody,model,(kind,id)=>{
        closeSheet();
        if(!bridge()?.guideAction?.(kind,id))
          showNotice('That opportunity is no longer available. Refresh the guide to see current choices.');
      });
      guideSignature=signature;
      sheetBody.scrollTop=scroll;
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
        renderGuide();
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
    // The current overworld renders typed event data. No hidden dashboard
    // list is cloned, moved or kept in sync behind the screen.
    const eventPanel=document.createElement('section');eventPanel.id='neoOverworldEvents';eventPanel.hidden=true;
    eventPanel.style.cssText='position:absolute;z-index:7;left:50%;top:12%;transform:translateX(-50%);width:min(620px,94vw);max-height:75dvh;overflow:auto;background:#19172cf5;border:1px solid #b58cc7;border-radius:14px;padding:15px;box-shadow:0 18px 55px #000c';
    const eventHead=document.createElement('div');eventHead.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:10px';
    const eventTitle=document.createElement('strong');eventTitle.textContent='▦ EVENTS';
    const eventClose=document.createElement('button');eventClose.type='button';eventClose.textContent='✕ Close';eventClose.style.cssText='padding:8px;background:#453153;color:white;border:1px solid #a98bb6;border-radius:8px';
    const eventContent=document.createElement('div');
    eventContent.id='neoOverworldOpportunityGroups';
    eventHead.append(eventTitle,eventClose);eventPanel.append(eventHead,eventContent);overlay.append(eventPanel);
    function hideEvents(){eventPanel.hidden=true;}
    eventClose.onclick=hideEvents;
    function showEvents(section='all'){
      closeSheet();hideMenu();
      const api=window.NeoRpgOverworldOpportunities;
      if(!api?.render||!bridge()?.opportunities){showNotice('Events are not available yet.');return;}
      api.render(eventContent,bridge().opportunities(),(kind,id)=>{
        if(!bridge()?.runOpportunity?.(kind,id)){
          showNotice('This event is no longer available.');showEvents();return;
        }
        hideEvents();
        queueStorySync();
      },document);
      eventPanel.hidden=false;
      if(section==='circuit'){
        const circuit=eventContent.querySelector('[data-opportunity-section="circuit"]');
        if(circuit)eventPanel.scrollTop=Math.max(0,circuit.offsetTop-eventPanel.offsetTop-30);
      }
    }
    quickButton('Events','▦',showEvents);
    quickButton('Deck','▤',()=>showDeck());
    quickButton('Status','♥',()=>bridge()?.openStatus?.());
    // The real planner DOM (including its action handlers) moves into the sheet.
    // When collapsed or interrupted, it returns to the original RPG stage.

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
    const hideDeck=()=>{
      // Commit the iframe's saved-deck state to the still-running campaign.
      if(!deckPanel.hidden)window.NeoRpgSyncDeckStudio?.();
      deckPanel.hidden=true;deckPanel.style.display='none';deckFrame.src='about:blank';
    };
    deckClose.onclick=hideDeck;
    function hideMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
    // Audio preferences are now part of the overworld rather than an old
    // utility bar. The shared audio service still persists the settings.
    let audioSettingsPanel=null;
    function showAudioSettings(){
      hideMenu();closeSheet();
      if(!audioSettingsPanel){
        const panel=document.createElement('section');
        panel.id='neoOverworldAudioSettings';
        panel.setAttribute('role','dialog');
        panel.setAttribute('aria-label','Audio settings');
        panel.style.cssText='position:absolute;z-index:12;top:75px;right:12px;width:min(350px,calc(100vw - 24px));max-height:calc(100dvh - 95px);overflow:auto;padding:17px;background:#211934f7;border:1px solid #b28fb9;border-radius:13px;box-shadow:0 16px 42px #000b';
        const heading=document.createElement('strong');heading.textContent='♫ Audio settings';
        const toggle=document.createElement('button');toggle.type='button';
        const volumeLabel=document.createElement('label');
        volumeLabel.textContent='Volume';
        const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='100';volume.step='5';
        volume.setAttribute('aria-label','Sound effects volume');volumeLabel.append(volume);
        const ambienceLabel=document.createElement('label');ambienceLabel.style.display='block';
        const ambience=document.createElement('input');ambience.type='checkbox';
        ambienceLabel.append(ambience,document.createTextNode(' Ambient sounds'));
        const close=document.createElement('button');close.type='button';close.textContent='Close';
        for(const el of [toggle,close])el.style.cssText='display:block;margin:12px 0;padding:9px 14px;border-radius:9px;border:1px solid #ae89b1;background:#392946;color:white;cursor:pointer';
        volumeLabel.style.cssText='display:flex;flex-direction:column;gap:8px;margin:10px 0;font:600 13px system-ui';
        panel.append(heading,toggle,volumeLabel,ambienceLabel,close);
        toggle.onclick=()=>{
          const audio=window.NeoRpgAudio;
          audio?.setEnabled?.(!audio.settings.enabled);
          toggle.textContent=audio?.settings?.enabled?'Sound effects: on':'Sound effects: off';
          audio?.play?.('ui');
        };
        volume.oninput=()=>window.NeoRpgAudio?.setVolume?.(Number(volume.value)/100);
        ambience.onchange=()=>window.NeoRpgAudio?.setAmbience?.(ambience.checked);
        close.onclick=()=>{panel.hidden=true;};
        overlay.append(panel);audioSettingsPanel=panel;
      }
      const settings=window.NeoRpgAudio?.settings||{};
      const [toggle,volumeLabel,ambienceLabel]=audioSettingsPanel.querySelectorAll('button,input[type="range"],input[type="checkbox"]');
      if(toggle)toggle.textContent=settings.enabled?'Sound effects: on':'Sound effects: off';
      if(volumeLabel)volumeLabel.value=String(Math.round((settings.volume??.35)*100));
      if(ambienceLabel)ambienceLabel.checked=!!settings.ambience;
      audioSettingsPanel.hidden=false;
    }
    menuButton.onclick=()=>{closeSheet();menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));};
    const menuItems=[
      ['▣ Deck Studio',showDeck],
      ['▧ CG Gallery',()=>bridge()?.openGallery?.()],
      ['♥ Status & Relationships',()=>bridge()?.openStatus?.()],
      ['▦ Calendar',()=>bridge()?.openCalendar?.()],
      ['🏆 Circuit & Tournaments',()=>showEvents('circuit')],
      ['✧ Save Game',()=>{void bridge()?.saveCampaign?.();}],
      ['◇ Discreet / Chibi Mode',()=>{toggleChibiPreference();refresh();}],
      ['♫ Audio Settings',showAudioSettings],
      ['⌾ Travel',()=>openSheet('travel')],
      ['↻ Reset Campaign',()=>{const reset=bridge()?.resetCampaign;if(typeof reset==='function')void reset();else showNotice('Campaign reset is not available. Reload the page and try again.');}]
    ];
    for(const [label,action] of menuItems){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.style.cssText='display:block;text-align:left;width:100%;padding:13px 11px;margin:5px 0;border:1px solid #735881;border-radius:9px;background:#322743;color:white;font:600 14px system-ui;cursor:pointer';
      if(label.includes('Reset Campaign')){button.style.borderColor='#d68da2';button.style.color='#ffd0db';button.style.marginTop='16px';button.title='Erase this RPG campaign and return to Day 1';}
      button.onclick=()=>{hideMenu();action();};menu.append(button);
    }

    // One overworld-owned stage remains stable across all dialogue/CG changes.
    // Its nodes already existed before the controller loaded; no old RPG
    // stage or fallback interface is involved.
    const stage=document.getElementById('neoOverworldStage');

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
      // The new header remains available while story input is locked.
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
      /* The overworld owns the active VN portraits. */
      #neoOverworldStoryDock #dialogue{width:100%!important}
      #neoOverworldStoryDock #characterActions{margin-top:8px!important}
      #neoOverworldOverlay:has(#neoOverworldStoryDock:not([hidden])) #neoOverworldBottom{visibility:hidden}
      #neoOverworldStoryDock #scene .home-banner{display:none!important}
    `;
    // Keep current campaign action handlers attached to the stable stage nodes;
    // reveal them when the player opens Actions.
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
      // Pose triggers wait for an explicit character interaction.
    }
    async function playPoseTrigger(item,clickedSource=null){
      if(poseTriggerBusy||poseTriggerAwaitingDialogue||overlay.hidden||suspendedForDuel)return false;
      const data=bridge()?.snapshot();
      if(!data||data.locked||data.location!==item.scene||!data.people.includes(item.id))return false;
      poseTriggerBusy=true;
      try{
        // The clicked image is authoritative. Use precisely the same source for
        // chime, the selected interaction, and Glance rather than three paths.
        const source=bridge()?.setVisiblePose?.(item.id,clickedSource)?clickedSource:item.src;
        if(!bridge()?.setVisiblePose?.(item.id,source))throw Error('Unable to preserve the triggered pose');
        try{sessionStorage.setItem(item.key,'1')}catch{}
        if(window.NeoOutfitChime?.display)await window.NeoOutfitChime.display(source,{top:0,bottom:1,left:0,right:1},1450);
        const current=bridge()?.snapshot();
        if(!current||current.location!==item.scene||!current.people.includes(item.id)){try{sessionStorage.removeItem(item.key)}catch{}poseTriggersById.delete(item.id);return false}
        if(current.locked){try{sessionStorage.removeItem(item.key)}catch{}return false}
        interactionFocus=item.id;
        if(!showStory()||!bridge()?.poseTriggerDialogue?.(item.id,source)){
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
      if(poseTriggerAwaitingDialogue&&!data?.locked)poseTriggerAwaitingDialogue=false;
      // No automatic pose playback: only the person-click handler starts it.
    }
    function syncPortraits(hasCG,idleFocus=null){
      const cast=bridge()?.scenePortraits?.();
      const selectedPortrait=idleFocus?bridge()?.portrait?.(idleFocus):null;
      const participants=selectedPortrait?[selectedPortrait]:cast?.conversation&&!hasCG?
        (portraitWindow?.update(cast.participants||[],cast.focused)||
         (cast.participants||[]).slice(0,2)):[];
      const focused=selectedPortrait?.id||cast?.focused;
      // On phones, show only the active speaker; when narration has no
      // explicit speaker, keep the first available participant visible.
      const mobileStory=window.matchMedia('(max-width:650px)').matches&&!idleFocus;
      const visibleParticipants=mobileStory&&participants.length>1?
        [participants.find(person=>person.id===focused)||participants[0]]:participants;
      if(hasCG)portraitWindow?.reset();
      const signature=JSON.stringify([focused,visibleParticipants,mobileStory]);
      if(signature===lastPortraitSignature)return;
      lastPortraitSignature=signature;
      // Keep unchanged speaker images alive across dialogue turns. Only a
      // genuinely changed expression/portrait should replace its own node.
      const existing=new Map([...scenePeople.children].filter(node=>node.dataset.npc).map(node=>[node.dataset.npc,node]));
      for(const participant of visibleParticipants){
        const previous=existing.get(participant.id);
        existing.delete(participant.id);
        const requestedSrc=participant.src||'';
        if(previous?.dataset.requestedSrc===requestedSrc){
          previous.classList.toggle('is-speaking',participant.id===focused);
          previous.classList.toggle('is-listening',participant.id!==focused);
          scenePeople.append(previous);
          continue;
        }
        previous?.remove();
        const person=document.createElement('div');
        person.dataset.npc=participant.id;
        person.dataset.requestedSrc=requestedSrc;
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
          const fullBody=isApprovedMaster||/\/expressionsv2\//.test(source)||
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
      for(const stale of existing.values())stale.remove();
      scenePeople.hidden=!visibleParticipants.length;
      sceneArea?.classList.toggle('neo-ow-participants',!!visibleParticipants.length);
    }
    visualStyle.textContent+=`
      #neoOverworldStoryDock #neoOverworldScenePeople{display:flex;align-items:flex-end;justify-content:center;gap:clamp(3px,2vw,20px);width:100%;max-height:39dvh;overflow:hidden}
      #neoOverworldStoryDock #neoOverworldScenePeople[hidden]{display:none!important}
      #neoOverworldStoryDock .neo-ow-person{display:flex;flex:1 1 0;min-width:0;max-width:260px;max-height:38dvh;align-items:center;flex-direction:column;justify-content:flex-end;transition:opacity .2s,filter .2s,transform .2s}
      #neoOverworldStoryDock .neo-ow-person img{object-fit:contain;object-position:center bottom;width:100%;max-height:34dvh;min-height:0;filter:drop-shadow(0 6px 12px #0009)}
      #neoOverworldStoryDock .neo-ow-person span{background:#16132acc;border:1px solid #b88dbe;border-radius:7px;padding:3px 8px;font:600 12px system-ui}
      #neoOverworldStoryDock .neo-ow-person.is-listening{opacity:.57;filter:brightness(.7);transform:scale(.95)}
      @media(max-width:650px){#neoOverworldStoryDock #neoOverworldScenePeople{max-height:31dvh}#neoOverworldStoryDock .neo-ow-person img{max-height:26dvh}}
    `;


    // Story-only phone layout: same full-width portrait treatment as the
    // interaction menu, while keeping CGs and the dialogue box intact.

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

    // Final idle-only overrides intentionally follow the legacy RPG styles.
    // Hide exploration UI entirely while focusing a character, eliminate blue
    // panels, and force a single vertical action list as in the supplied mockup.


    // Keep the character at the same on-screen scale in interaction and dialogue
    // views. Dialogue remains a full-width strip below the scene.

    // Applied after idle interactions and shared-scene rules so they cannot
    // overwrite the source-preserving dialogue bust crop.



    // Phone-only finishing pass: keep the speaker centered above a compact,
    // readable dialogue panel without disturbing the native choice controls.


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

    // Last-resort phone story sizing: earlier desktop layout rules center the
    // dock with left:50%/translateX(-50%). A later width:100% alone leaves
    // its right half outside the viewport. Reset BOTH positioning properties.

    // Mobile character submenus (Make plans, Spend time, etc.): the portrait
    // stays full-width; the subtitle joins the character's name and the choice
    // buttons occupy two equal columns. Desktop retains its original layout.

    attachChoicePanels();
    let storyDock=null;
    let lastSceneKey='';
    let suspendedForDuel=false;
    let syncDuel=()=>{};
    function showStory(){
      if(!stage)return false;
      if(!storyDock){
        storyDock=document.createElement('section');
        storyDock.id='neoOverworldStoryDock';
        storyDock.setAttribute('aria-label','RPG conversation and story');
        Object.assign(storyDock.style,{position:'absolute',zIndex:'4',bottom:'12px',left:'max(8px,env(safe-area-inset-left))',right:'max(8px,env(safe-area-inset-right))',maxHeight:'min(72vh,680px)',overflow:'auto',border:'2px solid #b58cc7',borderRadius:'14px',background:'#181329',boxShadow:'0 10px 45px #000c'});
        const back=document.createElement('button');back.type='button';back.textContent='← Back to map';back.style.cssText='position:sticky;top:0;z-index:5;display:block;width:100%;padding:11px;border:0;background:#352548;color:white;font:700 14px system-ui;cursor:pointer';
        back.id='neoOverworldStoryMapBack';
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
      if(!stage)return;
      // Keep the overworld-owned story stage mounted across conversations.
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
    // The shared story controller listens for Space to advance story steps. Consume it
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
    // The calendar/planner may request navigation while a travel wipe is active.
    // Queue the focus and open the current panel only after the new scene settles.
    let pendingOpportunityKind=null;
    function presentPendingOpportunity(){
      if(!pendingOpportunityKind||overlay.hidden||suspendedForDuel)return;
      const data=bridge()?.snapshot();
      if(!data||data.locked||data.arriving||data.storyActive)return;
      const kind=pendingOpportunityKind;
      pendingOpportunityKind=null;
      if(kind==='activity')showActivities(bridge()?.activities()||[]);
      else if(['tournament','event','Official event','cup','competitive'].includes(kind))
        showEvents('circuit');
      else showEvents();
    }
    window.addEventListener('neo-rpg-focus-opportunities',event=>{
      pendingOpportunityKind=String(event.detail?.kind||'story');
      queueMicrotask(presentPendingOpportunity);
    });
    window.addEventListener('neo-rpg-overworld-render',()=>{
      if(overlay.hidden||suspendedForDuel)return;
      refresh();
      queueStorySync();
      syncPoseTriggerQueue();
      presentPendingOpportunity();
    });
    for(const id of ['line','choices','characterActions','rpgSceneCG','speaker']){
      const el=document.getElementById(id);
      if(el)new MutationObserver(queueStorySync).observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','src']});
    }
    function snapshot(){return bridge()?.snapshot();}
    function refresh(){
      const data=snapshot();if(!data)return;
      const selected=data.places.find(p=>p.id===data.location);
      const name=selected?.name||'Neo Campus';
      const dayText='Day '+data.day+' · '+(['Morning','Afternoon','Evening'][data.slot]||'');
      if(locationName.textContent!==name)locationName.textContent=name;
      if(dayLabel.textContent!==dayText)dayLabel.textContent=dayText;
      next.disabled=data.locked;travelToggle.disabled=data.locked;
      if(data.locked&&expandedSheet)closeSheet();
      const people=data.people.map(id=>{
        // Match Laca's canonical outfit rules: lifeguard uniform on duty at Riverside Park.
        const onLifeguardShift=id==='laca'&&data.location==='park'&&(data.slot===0||data.slot===1);
        return onLifeguardShift?'laca:lifeguardFrontLeaning':id;
      }).join(',');
      const mapKey=[data.location,data.day,data.slot].join('|');
      // Dialogue and ordinary UI actions must never navigate the entire map.
      // A cast change is applied after the current conversation finishes, so
      // NPCs cannot vanish/reload midway through an interaction.
      const hasMap=!!frame.getAttribute('src')&&frame.getAttribute('src')!=='about:blank';
      const mapChanged=!hasMap||activeMapKey!==mapKey;
      const castChanged=activeCastKey!==people;
      if(mapChanged||(castChanged&&!data.locked&&storyShield.hidden)){
        const nextSrc='/overworld-prototype.html?scene='+encodeURIComponent(data.location)+'&cast='+encodeURIComponent(people)+'&slot='+encodeURIComponent(data.slot)+'&day='+encodeURIComponent(data.day)+'&rpg-integration=1&chibi='+(document.documentElement.dataset.rpgDiscreet==='on'?'1':'0');
        activeMapKey=mapKey;activeCastKey=people;lastIndicatorKey='';
        if(frame.getAttribute('src')!==nextSrc)frame.src=nextSrc;
      }else syncNpcIndicators();
      if(expandedSheet==='next')renderGuide();
      note.hidden=true;
    }
    function activate(){
      attachChoicePanels();
      refresh();
      overlay.hidden=false;
      overlay.style.display='flex';
      queueStorySync();
      syncPoseTriggerQueue();
      syncDuel();
    }
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
        if(message.id==='status'){bridge()?.openStatus?.();return;}
        if(message.id==='activities'||message.id==='events'){hideMenu();if(message.id==='activities')showActivities(bridge()?.activities()||[]);else showEvents();return;}
      }
      if(message.kind==='person'){
        // Capture the exact rendered sprite before conversation UI takes over.
        bridge()?.setVisiblePose?.(message.id,message.src);
        const poseTrigger=poseTriggersById.get(message.id);
        if(poseTrigger){void playPoseTrigger(poseTrigger,message.src);return}
        // Capture the explicitly tapped NPC before the native engine renders.
        interactionFocus=message.id;
        if(!showStory()){showNotice('The story view is unavailable; reload to retry without losing progress.');return;}
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
          if(!showStory()){showNotice('The story view is unavailable; reload to retry without losing progress.');return;}
          if(!bridge()?.activity(a.id)){hideStory();showNotice('Activity no longer available.');}
          else queueStorySync();
        };panel.append(button);}
        const cancel=document.createElement('button');cancel.textContent='✕ Close activities';cancel.type='button';
        cancel.style.cssText='display:block;margin-top:14px;width:100%;padding:11px;border-radius:9px;background:#38284a;color:white;border:1px solid #9a7da5';
        cancel.onclick=closeActivities;panel.append(cancel);overlay.append(backdrop,panel);
    }
    document.addEventListener('keydown',event=>{if(event.key!=='Escape'||overlay.hidden)return;
      if(audioSettingsPanel&&!audioSettingsPanel.hidden){event.preventDefault();audioSettingsPanel.hidden=true;return;}
      if(overlay.classList.contains('neo-ow-has-choices')&&!overlay.classList.contains('neo-ow-choices-collapsed')&&!overlay.classList.contains('neo-ow-paging')){
        event.preventDefault();setChoicesCollapsed(true);syncChoicePresentation(false);return;
      }
      if(!storyShield.hidden){event.preventDefault();return;}if(overlay.classList.contains('neo-ow-activity-open')){event.preventDefault();overlay.querySelectorAll('[data-overworld-activity-panel],[data-overworld-activity-backdrop]').forEach(el=>el.remove());overlay.classList.remove('neo-ow-activity-open');return;}if(expandedSheet){event.preventDefault();closeSheet();return;}if(!deckPanel.hidden){hideDeck();return;}if(!eventPanel.hidden){hideEvents();return;}if(!menu.hidden){hideMenu();return;}event.preventDefault();});
    // Battles run in the authoritative full-screen duel layer. Restore the
    // overworld when it closes, without restarting or modifying the campaign save.
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
    activate();
  }
  window.addEventListener('neo-rpg-overworld-bridge-ready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
