'use strict';
// This page NEVER calculates damage, pays costs or applies card effects.
// Every button sends a typed command to the same server-side Classic reducer.
(()=>{
 const $=id=>document.getElementById(id);
 const cubeRoomCode=new URLSearchParams(location.search).get('cubeRoom');
 let cubeReturnTimer=null;
 function returnToCubeWhenDone(){
  if(!cubeRoomCode||!/^([A-Z2-9]){6}$/.test(cubeRoomCode)||!current?.view?.over)return;
  if(cubeReturnTimer)return;
  // Let the finishing animation/results remain visible briefly, then take
  // everyone (including spectators) back to the tournament automatically.
  const note=document.createElement('div');note.id='cubeReturnNotice';
  note.textContent='Match complete · Returning to Cube tournament in 4 seconds…';
  Object.assign(note.style,{position:'fixed',left:'50%',bottom:'22px',
   transform:'translateX(-50%)',background:'#162744',color:'#ffe39b',
   border:'2px solid #f1ce77',borderRadius:'12px',zIndex:10000,
   padding:'12px 19px',fontWeight:'800',textAlign:'center'});
  document.body.append(note);
  cubeReturnTimer=setTimeout(()=>{
   location.assign('/cube_room.html?room='+encodeURIComponent(cubeRoomCode));
  },4000);
 }

 const cards=new Map();
 const deckNames=new Map();
 let lobbyDeckDraft=null;
 const quick=window.NeoDuelUI;
 const ux=window.NeoExperienceUI;
 const presentation=window.NeoBattlePresentation;
 const shared=window.NeoBattleComponents;
 const preview=quick.makePreview($('cardPreview'),id=>card(id));
 const feedback=quick.makeDuelFeedback($('duelFeedback'));
 const showEnergyLimitToast=quick.makeTransientToast($('energyLimitToast'));
 const combat=presentation.makeBattlePresentation({stage:document.querySelector('.stage'),popup:$('combatFx'),timeline:$('actionTimeline'),getCard:id=>cards.get(id)||{name:String(id)},me:()=>side(),opponentName:()=>current?.players?.[1-side()]?.name||'Opponent'});
 const opponentActivity=quick.makeOpponentActivity({status:$('opponentActivityStatus'),overlay:$('opponentActionFx'),arena:document.querySelector('.stage'),getCard:id=>cards.get(id)||{name:String(id)},suppressCombat:true});
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let modalDecisionId=null,lastFieldDecisionId=null;
 let token=null,roomCode=null,current=null,selectedHand=null,targetMode=null,busy=false,decisionSelection=new Set(),lastDecision=null,chatSeq=-1,chatBusy=false;
 let handVisible=true,powersOpen=false,chatOpen=false,logOpen=false,seenChatSeq=-1,lastCoinSeq=null,coinQueue=[],coinTimer=null,lastKoFeedSeq=null;
 const watching=()=>!!current?.spectator;
 const side=()=>current?.you??0;
 const command=(type,payload={})=>({type,payload});
 async function api(path,opts={}){
  const headers={'Content-Type':'application/json',...(token?{'X-Duel-Token':token}:{})};
  const r=await fetch('/api/online/'+path,{...opts,headers});const body=await r.json();
  if(!r.ok)throw Error(body.error||'Could not contact Classic engine');return body;
 }
 const card=id=>cards.get(id)||{name:String(id),types:[],attacks:[],abilities:[]};
 const fieldDecision=()=>{const d=current?.view?.pendingDecision;if(!d||d.actor!==side()||watching())return null;
  return window.NeoBattleDecisionUI.resolveTargets(d,current.view,side(),card);
 };
 function chooseFieldOption(id){const d=current?.view?.pendingDecision;if(!d||d.actor!==side()||!fieldDecision()?.some(x=>x.id===id)||busy)return;
  if(d.max===1){send(command('choose',{decisionId:d.id,selected:[id]}));return;}
  if(decisionSelection.has(id))decisionSelection.delete(id);else if(decisionSelection.size<d.max)decisionSelection.add(id);
  render();
 }
 const picture=id=>{const c=card(id),img=c.images?.small;return typeof img==='string'&&/^https:\/\//.test(img)?img:null;};
 function btn(text,handler,cls='',disabled=false){const b=document.createElement('button');b.textContent=text;b.className=cls;b.disabled=disabled;b.addEventListener('click',handler);return b;}
 function fail(e){$('error').textContent=e.message||String(e);$('error').classList.remove('hidden');}
 function clearError(){$('error').textContent='';$('error').classList.add('hidden');}
 function renderChat(data){
  if(!data||data.chatSeq===undefined)return;
  const box=$('chatMessages');
  if(data.chatSeq===chatSeq)return;
  if(seenChatSeq<0)seenChatSeq=data.chatSeq;
  else if(!chatOpen&&data.chatSeq>seenChatSeq){const incoming=(data.chatMessages||[]).filter(m=>m.id>seenChatSeq&&(watching()||m.player!==side()));if(incoming.length){const badge=$('unreadBadge');badge.textContent=String(incoming.length+Number(badge.dataset.unread||0));badge.dataset.unread=badge.textContent;badge.classList.remove('hidden');}seenChatSeq=data.chatSeq;}
  const stick=box.scrollHeight-box.scrollTop-box.clientHeight<50;
  chatSeq=data.chatSeq;box.textContent='';
  for(const m of data.chatMessages||[]){
   const wrap=document.createElement('div');wrap.className='chat-message'+(m.player===side()?' mine':'');
   const sender=document.createElement('strong');sender.className='chat-sender';sender.textContent=m.name||'Trainer';
   const content=document.createElement('p');content.textContent=m.text||'';
   wrap.append(sender,content);box.append(wrap);
  }
  if(stick)box.scrollTop=box.scrollHeight;
 }
 async function submitChat(event){
  event.preventDefault();if(chatBusy||!token||!roomCode)return;
  const input=$('chatText'),message=input.value.trim();if(!message)return;
  chatBusy=true;$('chatError').textContent='';$('chatError').classList.add('hidden');
  try{
   const result=await api('chat',{method:'POST',body:JSON.stringify({code:roomCode,text:message})});
   input.value='';renderChat(result);
  }catch(e){$('chatError').textContent=e.message||String(e);$('chatError').classList.remove('hidden');}
  finally{chatBusy=false;}
 }


 // Live playmats travel separately from the authoritative card-action revision.
 // Never embed binary data in room polling: only fetch art when its version changes.
 const mats=window.NeoDuelPlaymats;
 const matSelect=$('onlinePlaymatSelect');
 let matSessionRoom=null,matDesired='aurora',queuedMat=null,matPublishing=false;
 let matVersions=[null,null],matUrls=[null,null],matClockOffset=0,matNotice='';
 const matTerritories=()=>[document.querySelector('.player-territory'),document.querySelector('.opponent-territory')];
 function availableMats(){return mats.available(Object.keys(mats.themes));}
 function refreshMatChoices(preferred=matDesired){
  const choices=availableMats();
  const selected=mats.choose(preferred,choices.map(m=>m.id));
  matDesired=selected;
  matSelect.replaceChildren();
  for(const item of choices){
   const opt=document.createElement('option');opt.value=item.id;opt.textContent=item.name;matSelect.append(opt);
  }
  matSelect.value=selected;
 }
 function clearMatImages(){
  matUrls.forEach(url=>{if(url)URL.revokeObjectURL(url);});
  matUrls=[null,null];matVersions=[null,null];
  for(const territory of matTerritories())if(territory){
   territory.removeAttribute('data-playmat');
   territory.style.removeProperty('--neo-playmat-image');
  }
 }
 function resetOnlineMats(){
  clearMatImages();matSessionRoom=null;queuedMat=null;matPublishing=false;matNotice='';
  $('onlinePlaymatStatus').textContent='';
 }
 function secondsRemaining(){
  if(!current||watching())return 0;
  const until=current.playmats?.[side()]?.cooldownUntil||0;
  return Math.max(0,Math.ceil((until-(Date.now()+matClockOffset))/1000));
 }
 function showMatStatus(){
  const el=$('onlinePlaymatStatus');
  const seconds=secondsRemaining();
  const time=seconds?Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):'';
  el.textContent=matNotice||(queuedMat?(seconds?'Queued · '+time:'Saving mat…'):(seconds?'Change in '+time:'Mat ready'));
  matSelect.disabled=watching()||matPublishing;
  $('onlinePlaymatControl').classList.toggle('hidden',watching());
  $('onlinePlaymatStatus').classList.toggle('hidden',watching());
 }
 async function encodeMat(id){
  const url=await mats.imageUrl(id);
  if(!url)throw Error('The custom playmat image is missing from this browser.');
  const image=new Image();
  await new Promise((resolve,reject)=>{
   image.onload=resolve;image.onerror=()=>reject(Error('Could not read your saved playmat.'));
   image.src=url;
  });
  const frame=document.createElement('canvas'),ctx=frame.getContext('2d');
  if(!ctx)throw Error('Image export is unavailable.');
  const steps=[[1280,640,.67],[1280,640,.4],[960,480,.42],[800,400,.34],[640,320,.3]];
  for(const [width,height,quality] of steps){
   frame.width=width;frame.height=height;ctx.drawImage(image,0,0,width,height);
   const blob=await new Promise((resolve,reject)=>
    frame.toBlob(result=>result?resolve(result):reject(Error('Could not compress playmat.')),'image/webp',quality));
   if(!['image/webp','image/png'].includes(blob.type)||blob.size>160*1024)continue;
   return await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not encode playmat.'));
    reader.readAsDataURL(blob);
   });
  }
  throw Error('The artwork is too detailed to share (160 KB limit). Try a simpler exported mat.');
 }
 function wantMat(id){
  if(!current?.started||watching())return;
  const allowed=availableMats().map(item=>item.id);
  if(!allowed.includes(id))return;
  matDesired=id;matSelect.value=id;
  localStorage.setItem('neoCampusPlaymat',id);
  queuedMat=id;matNotice='';
  showMatStatus();publishQueuedMat();
 }
 async function publishQueuedMat(){
  if(!queuedMat||!current?.started||watching()||matPublishing||!token||!roomCode)return;
  if(secondsRemaining()){showMatStatus();return;}
  const requested=queuedMat,code=roomCode,originalToken=token;
  matPublishing=true;matNotice='Sending mat…';showMatStatus();
  try{
   const custom=mats.custom().some(item=>item.id===requested);
   const image=custom?await encodeMat(requested):undefined;
   // The user may leave or change rooms while image encoding is in progress.
   if(code!==roomCode||originalToken!==token)return;
   const response=await api('playmat',{method:'POST',body:JSON.stringify({code,id:custom?'custom':requested,...(custom?{image}:{})})});
   if(code!==roomCode||originalToken!==token)return;
   current.playmats=response.playmats;current.serverNow=response.serverNow;
   matClockOffset=response.serverNow-Date.now();
   if(queuedMat===requested)queuedMat=null;
   matNotice='';
   updateDisplayedMats(current);
  }catch(error){
   if(code!==roomCode||originalToken!==token)return;
   if(/cooldown/i.test(error.message)){
    // A second tab or stale clock may have changed a mat first.
    try{
     const fresh=await api('state?code='+encodeURIComponent(roomCode));
     if(code===roomCode&&originalToken===token){
      current.playmats=fresh.playmats;matClockOffset=fresh.serverNow-Date.now();updateDisplayedMats(fresh);
     }
    }catch{}
    matNotice='';
   }else{
    if(queuedMat===requested)queuedMat=null;
    matNotice=error.message||'Could not share playmat';
   }
  }finally{
   if(code===roomCode&&originalToken===token){matPublishing=false;showMatStatus();}
  }
 }
 function installMat(sideIndex,descriptor,uri){
  const territory=matTerritories()[sideIndex===side()?0:1];
  if(!territory)return;
  if(descriptor?.id==='custom'){
   territory.dataset.playmat='custom';
   territory.style.setProperty('--neo-playmat-image','url("'+uri+'")');
  }else mats.apply(territory,descriptor?.id||'aurora');
 }
 function applyMatVersion(sideIndex,descriptor){
  const key=descriptor?.version||0;
  if(matVersions[sideIndex]===key)return;
  matVersions[sideIndex]=key;
  const former=matUrls[sideIndex];matUrls[sideIndex]=null;
  if(former)URL.revokeObjectURL(former);
  if(descriptor?.id!=='custom'){installMat(sideIndex,descriptor,null);return;}
  const expectedRoom=roomCode;
  api('playmat?code='+encodeURIComponent(roomCode)+'&side='+sideIndex).then(result=>{
   if(expectedRoom!==roomCode||matVersions[sideIndex]!==key||result.version!==key)return;
   if(typeof result.image!=='string')throw Error('Missing shared mat image');
   const parsed=/^data:image\/(webp|png);base64,([A-Za-z0-9+/=]+)$/.exec(result.image);
   if(!parsed)throw Error('Invalid shared mat');
   const raw=atob(parsed[2]),buffer=new Uint8Array(raw.length);
   for(let i=0;i<raw.length;i++)buffer[i]=raw.charCodeAt(i);
   const url=URL.createObjectURL(new Blob([buffer],{type:'image/'+parsed[1]}));
   if(matVersions[sideIndex]!==key||expectedRoom!==roomCode){URL.revokeObjectURL(url);return;}
   matUrls[sideIndex]=url;installMat(sideIndex,descriptor,url);
  }).catch(()=>{
   if(matVersions[sideIndex]===key){matVersions[sideIndex]=null;installMat(sideIndex,null,null);}
  });
 }
 function updateDisplayedMats(state){
  if(!state?.started||!roomCode)return;
  matClockOffset=(state.serverNow||Date.now())-Date.now();
  if(matSessionRoom!==roomCode){
   clearMatImages();matSessionRoom=roomCode;
   refreshMatChoices(localStorage.getItem('neoCampusPlaymat')||'aurora');
   const own=state.playmats?.[side()];
   if(!watching()&&!own&&matDesired!=='aurora')queuedMat=matDesired;
  }
  for(let i=0;i<2;i++)applyMatVersion(i,state.playmats?.[i]);
  showMatStatus();
  if(queuedMat&&!matPublishing)publishQueuedMat();
 }
 matSelect.addEventListener('change',()=>wantMat(matSelect.value));
 window.addEventListener('storage',event=>{
  if(!['neoCampusCustomPlaymatsV1','neoCampusPlaymat',mats.IMPORT_KEY].includes(event.key))return;
  if(event.key==='neoCampusCustomPlaymatsV1'){refreshMatChoices(matDesired);return;}
  const selected=localStorage.getItem('neoCampusPlaymat');
  const previous=matDesired;
  refreshMatChoices(selected||matDesired);
  if(selected&&current?.started&&!watching()&&(selected!==previous||event.key===mats.IMPORT_KEY))wantMat(selected);
 });
 refreshMatChoices(localStorage.getItem('neoCampusPlaymat')||'aurora');

 async function send(action){if(!current||busy||watching())return;busy=true;clearError();try{
  const post=revision=>api('action',{method:'POST',body:JSON.stringify({code:roomCode,revision,command:action})});
  let result;
  try{result=await post(current.revision);}
  catch(e){
   if(!/Stale match revision/.test(e.message))throw e;
   // Opponent setup clicks can race a local button press. Re-sync first; only
   // retry setup actions if OUR cards and field are still exactly unchanged.
   const old=current,fresh=await api('state?code='+encodeURIComponent(roomCode));
   current=fresh;render();
   const slot=old.you,prior=old.view?.players?.[slot],next=fresh.view?.players?.[slot];
   const unchanged=old.started&&fresh.started&&old.you===fresh.you&&
    old.view?.phase==='setup'&&fresh.view?.phase==='setup'&&
    !old.view?.pendingDecision&&!fresh.view?.pendingDecision&&
    JSON.stringify(prior?.hand)===JSON.stringify(next?.hand)&&
    JSON.stringify(prior?.active)===JSON.stringify(next?.active)&&
    JSON.stringify(prior?.bench)===JSON.stringify(next?.bench);
   if(!unchanged||!['setup_select','setup_undo','setup_confirm'].includes(action.type))
    throw Error('The match advanced. Your cards are updated; please choose again.');
   result=await post(fresh.revision);
  }
  preview.hide();current=result;selectedHand=null;targetMode=null;decisionSelection.clear();render();
 }catch(e){fail(e);}finally{busy=false;render();}}
 async function openRoom(kind){if(busy)return;busy=true;$('startupError').textContent='';try{
  const deck=$('deck').value;
  const suppliedCode=$('joinCode').value.trim().toUpperCase();
  const body={deck,name:$('nickname').value,...(deck==='custom'?{customDeck:JSON.parse(localStorage.getItem('neoCampusCustomGymDeck')||'null')}:{}),...(suppliedCode?{code:suppliedCode}:{})};
  const data=await api(kind,{method:'POST',body:JSON.stringify(body)});
  feedback.reset();opponentActivity.clear();combat.reset();lobbyDeckDraft=null;token=data.token;roomCode=data.code;chatSeq=-1;seenChatSeq=-1;lastCoinSeq=null;lastKoFeedSeq=null;sessionStorage.setItem('neoOnlineToken',token);sessionStorage.setItem('neoOnlineRoom',roomCode);
  current=data;setHandVisible(true);render();
 }catch(e){$('startupError').textContent=e.message;}finally{busy=false;}}
 async function lobbyAction(path,payload={}){
  if(busy||!current||watching())return;
  busy=true;$('lobbyError').textContent='';
  try{
   const submit=revision=>api(path,{method:'POST',body:JSON.stringify({code:roomCode,revision,...payload})});
   let updated;
   try{updated=await submit(current.revision);}
   catch(error){
    if(!/Stale match revision/i.test(error.message))throw error;
    // Both players often click Ready at the same moment. Rebase the intended
    // lobby action on the current authoritative revision; do not lose the click.
    const fresh=await api('state?code='+encodeURIComponent(roomCode));
    current=fresh;renderChat(fresh);
    const alreadyReady=path==='ready'&&fresh.players?.[side()]?.ready===payload.ready;
    updated=alreadyReady||(path==='start'&&fresh.started)?fresh:await submit(fresh.revision);
   }
   current=updated;if(path==='deck')lobbyDeckDraft=null;render();
  }catch(error){
   $('lobbyError').textContent=error.message;
   // Never call refresh() here: it intentionally ignores requests while busy.
   try{
    const fresh=await api('state?code='+encodeURIComponent(roomCode));
    current=fresh;renderChat(fresh);render();
   }catch(syncError){$('lobbyError').textContent+=' · Unable to refresh room: '+syncError.message;}
  }finally{busy=false;}
 }
 function clearChoiceUi(){
  const box=$('decisionBox'),dock=$('choiceDock');if(box.parentElement!==dock)dock.append(box);
  $('choiceModal').classList.add('hidden');$('choiceModal').setAttribute('aria-hidden','true');
  $('fieldChoiceBar').classList.add('hidden');modalDecisionId=null;lastFieldDecisionId=null;
 }
 function newDuel(){resetOnlineMats();lobbyDeckDraft=null;clearChoiceUi();opponentActivity.clear();combat.reset();chatSeq=-1;$('chatMessages').textContent='';feedback.reset();preview.hide();chatOpen=false;logOpen=false;handVisible=true;powersOpen=false;token=null;roomCode=null;current=null;selectedHand=null;targetMode=null;
  sessionStorage.removeItem('neoOnlineToken');sessionStorage.removeItem('neoOnlineRoom');setHandVisible(true);render();}
 async function refresh(){if(!token||!roomCode||busy)return;try{
  const state=await api('state?code='+encodeURIComponent(roomCode));
  $('networkStatus').textContent='Connected';
  renderChat(state);
  if(!current||state.revision!==current.revision){const previous=current?.view?.pendingDecision?.id;
   preview.hide();current=state; if(previous!==state.view?.pendingDecision?.id)decisionSelection.clear();
   selectedHand=null;targetMode=null;render();}
  else{current.presence=state.presence;current.spectatorCount=state.spectatorCount;current.playmats=state.playmats;current.serverNow=state.serverNow;renderPresence();}
  updateDisplayedMats(state);
 }catch(e){if($('networkStatus'))$('networkStatus').textContent='Disconnected';}
 }
 function toggleDrawer(which,open){
  if(which==='chat'){chatOpen=open;$('roomChat').classList.toggle('hidden',!open);$('roomChat').classList.toggle('drawer-open',open);$('chatToggle').setAttribute('aria-expanded',String(open));if(open){$('unreadBadge').classList.add('hidden');$('unreadBadge').dataset.unread='0';seenChatSeq=chatSeq;}}
  else{logOpen=open;$('logDrawer').classList.toggle('hidden',!open);$('logToggle').setAttribute('aria-expanded',String(open));}
 }
 function renderPresence(){
  if(!current?.started)return;
  const other= current.presence?.[1-side()];
  const name=current.players?.[1-side()]?.name||'Opponent';
  const status=$('presenceNotice');
  status.textContent=watching()?`👁 ${current.spectatorCount||0} watching`:other?.connected?'● '+name+' online':other?`⚠ ${name} disconnected · ${other.secondsUntilForfeit}s to forfeit`:'Waiting for opponent';
  status.classList.toggle('connection-warn',!watching()&&other&&!other.connected);
  $('spectatorCount').textContent=`👁 ${current.spectatorCount||0}`;
  $('spectatorCount').classList.toggle('hidden',watching());
 }
 function setHandVisible(){
  // Hand is permanently visible for players; an empty/private hand stays empty.
  handVisible=true;
  const fan=$('handFan');
  if(current?.view)renderHandFan(current.view.players[side()]?.hand);
  else fan.classList.add('hidden');
 }
 function setPowersOpen(open){powersOpen=!!open;$('powerDrawer').classList.toggle('hidden',!powersOpen);$('powersToggle').setAttribute('aria-expanded',String(powersOpen));}
  function renderHandFan(ids){shared.renderHandFan({root:$('handFan'),ids,visible:handVisible,phase:current.view.phase,selectedHand,targetMode,makeCard:handCard,getCard:card,viewportWidth:window.innerWidth});}
  function pendingPrizeChoice(){const d=current?.view?.pendingDecision;return !watching()&&d?.kind==='prize-card'&&d.actor===side()?d:null;}
 function choosePrize(id){const d=pendingPrizeChoice();if(!d||busy||!d.options?.some(o=>o.id===id))return;send(command('choose',{decisionId:d.id,selected:[id]}));}
 function renderFaceUpPrizes(){shared.renderFaceUpPrizes({rail:$('prizeRail'),view:current?.view,me:side(),getCard:card});}
  function renderPrizes(ownCount,opponentCount){shared.renderPrizeRail({rail:$('prizeRail'),decision:pendingPrizeChoice(),busy,button:btn,choose:choosePrize});}
  function renderPrizeFallback(){shared.renderPrizeFallback({container:$('prizeChoicePanel'),decision:pendingPrizeChoice(),busy,button:btn,choose:choosePrize});}
  function openDiscard(owner){
  const p=current?.view?.players?.[owner];if(!p)return;
  $('pileTitle').textContent=`${current.players[owner]?.name||'Trainer'} — discard pile (${p.discard.length})`;
  const list=$('pileCards');list.replaceChildren();
  if(!p.discard.length){list.textContent='Discard pile is empty.';}
  p.discard.forEach(id=>{const c=card(id),b=btn('',()=>preview.inspect(id),'pile-card');
   const pic=picture(id);if(pic){const img=document.createElement('img');img.src=pic;img.alt='';b.append(img);}
   const name=document.createElement('span');name.textContent=c.name;b.append(name);list.append(b);});
  $('pileModal').classList.remove('hidden');
 }
 function renderCoin(view){
  const incoming=(view.coinFlips||[]).filter(x=>x.seq>lastCoinSeq);
  if(lastCoinSeq===null){lastCoinSeq=view.coinFlips?.at(-1)?.seq||0;return;}
  if(incoming.length){lastCoinSeq=incoming.at(-1).seq;coinQueue.push(...incoming.slice(-12));pumpCoin();}
 }
 function pumpCoin(){
  if(coinTimer||!coinQueue.length)return;
  const flip=coinQueue.shift(),el=$('coinFx');
  el.textContent='🪙 '+flip.result.toUpperCase();el.classList.remove('hidden');
  el.classList.remove('coin-animate');void el.offsetWidth;el.classList.add('coin-animate');
  coinTimer=setTimeout(()=>{el.classList.add('hidden');coinTimer=null;pumpCoin();},800);
 }
 function renderMatchFeed(){
  if(!current?.feed?.length)return;
  const list=$('actionTimeline');list.replaceChildren();
  for(const entry of current.feed.slice(-45).reverse()){
   const e=entry.kind==='action'?quick.actionDescription(entry,card,entry.side===side()&&!watching()?'You':current.players[entry.side]?.name||'Player'):null;
   const row=document.createElement('li');row.className='timeline-entry '+(e?.kind||'rule');
   const ico=document.createElement('span');ico.className='timeline-icon';ico.textContent=e?.icon||(/Coin flip/.test(entry.text)?'🪙':/Knocked Out/.test(entry.text)?'💥':'•');
   const text=document.createElement('span');text.textContent=e?.text||entry.text;
   row.append(ico,text);list.append(row);
  }
 }
 function renderKnockOut(view){
  const feed=current?.feed||[];
  const latest=feed.at(-1)?.seq||0;
  if(lastKoFeedSeq===null){lastKoFeedSeq=latest;return;}
  const news=feed.filter(e=>e.seq>lastKoFeedSeq&&e.kind==='message'&&/Knocked Out|wins by forfeit/i.test(e.text));
  lastKoFeedSeq=Math.max(lastKoFeedSeq,latest);
  if(!news.length)return;
  const el=$('koFx');el.textContent='💥 '+news.slice(-2).map(e=>e.text).join(' · ');el.classList.remove('hidden');
  clearTimeout(el._dismiss);el._dismiss=setTimeout(()=>el.classList.add('hidden'),2500);
 }

 function renderLobby(){const active=!!current&&!!current.started;
  $('roomChat').classList.toggle('hidden',!current||(!!current.started&&!chatOpen));
  $('roomChat').classList.toggle('drawer-open',!!current?.started&&chatOpen);
  $('logDrawer').classList.toggle('hidden',!active||!logOpen);
  $('chatToggle').setAttribute('aria-expanded',String(chatOpen));$('logToggle').setAttribute('aria-expanded',String(logOpen));
  const dock=$(active?'chatDuelDock':'chatLobbyDock');
  if(current&&dock&&$('roomChat').parentNode!==dock)dock.append($('roomChat'));

  $('lobby').classList.toggle('hidden',!!current);
  document.body.classList.toggle('duel-active',active);
  document.body.classList.toggle('invite-entry',!current&&!!new URLSearchParams(location.search).get('room'));
  $('chatDuelDock').classList.toggle('hidden',!active);
  $('waitingRoom').classList.toggle('hidden',!current||active);
  $('duel').classList.toggle('hidden',!active);
  if(!current)return;
  if(!active){
   $('roomCode').textContent=roomCode;
   $('readyBtn').classList.toggle('hidden',watching());$('startMatch').classList.toggle('hidden',watching());$('roomDeck').disabled=watching();$('saveRoomDeck').disabled=watching();
   $('lobbyMessage').textContent=watching()?'You are watching this room. You may chat while waiting for the match.':'';
   $('roomLink').value=location.origin+'/online.html?room='+encodeURIComponent(roomCode);
   const mine=current.players[side()];
   if(document.activeElement!==$('roomName'))$('roomName').value=mine?.name||'';
   $('roomName').disabled=watching();$('saveRoomName').disabled=watching();
   const ownDeck=mine?.deck||'';
   const selectedDeck=lobbyDeckDraft??ownDeck;
   $('roomDeck').value=selectedDeck;
   const unsaved=selectedDeck!==ownDeck;
   $('saveRoomDeck').disabled=watching()||(!unsaved&&selectedDeck!=='custom');
   $('roomDeckHint').textContent=unsaved?'Save your selected deck before clicking Ready. Both players will need to Ready again.':'Deck saved. You can change it until the duel starts; changing a deck clears both Ready confirmations.';
   $('roomDeckHint').classList.toggle('unsaved',unsaved);
   $('myDeckStatus').textContent=unsaved?'Unsaved selection':mine?.ready?'Ready':'Not ready';
   const el=$('lobbyPlayers');el.textContent='';current.players.forEach((p,i)=>{
    const item=document.createElement('div');item.className='lobby-seat'+(i===side()?' mine':'');
    item.innerHTML=`<strong>${i===0?'HOST':'GUEST'}${i===side()?' · YOU':''}</strong><span>${esc(p?.name||'Waiting for a friend…')}</span><div>${esc(p?deckNames.get(p.deck)||p.deck:'No deck')}</div><span class="tag">${p?.ready?'READY':'NOT READY'}</span>`;
    el.append(item);
   });
   $('readyBtn').disabled=unsaved||watching();
   $('readyBtn').textContent=mine?.ready?'Cancel ready':'Ready';
   $('startMatch').disabled=unsaved||side()!==0||!current.players[1]||current.players.some(p=>!p?.ready);
   $('startMatch').classList.toggle('hidden',side()!==0||watching());
   if(!watching())$('lobbyMessage').textContent=!current.joined?'Waiting for your friend to join…':!current.players.every(p=>p.ready)?'Both players must click Ready.':'Both players ready. Host can start the duel.';
  }
 }
 function setTarget(type,payload,title,benchOnly=false){preview.hide();targetMode={type,payload,title,benchOnly};render();}
 function cancelTarget(){targetMode=null;selectedHand=null;preview.hide();render();}
 function pokemonNode(u,ownerRelative,slot){
  const hidden=Boolean(u.secretPlanFaceDown);
  const c=hidden?{name:'Face-down Pokémon',hp:'10',types:['Colorless'],supertype:'Pokémon',subtypes:['Basic'],attacks:[]}:card(u.id),src=hidden?'neo_card_back.svg':picture(u.id),attached=Array.isArray(u.energies)?u.energies:[];
  const b=document.createElement('button');b.className='poke'+(u.damage>=Number(c.hp)?' broken':'');
  b.classList.add(...[feedback.unitClass(ownerRelative===0?current.you:1-current.you,slot)].filter(Boolean));
  b.innerHTML=shared.pokemonFace({unit:u,card:c,source:src,energyStack:unit=>quick.energyStack(unit,card),vitals:ux.vitals});
  b.setAttribute('aria-label',(ownerRelative===0?'Your ':'Opponent ')+c.name);
  preview.attach(b,u.id,u);
  const decisionTargets=fieldDecision(),decision=current.view.pendingDecision;
  const fieldOption=decisionTargets?.find(x=>x.side===(ownerRelative===0?side():1-side())&&x.slot===slot);
  if(decisionTargets){
   if(fieldOption){
    b.classList.add('legal','decision-target');b.title='Choose '+c.name;
    if(decisionSelection.has(fieldOption.id))b.classList.add('chosen');
    b.setAttribute('aria-pressed',String(decisionSelection.has(fieldOption.id)));
    b.addEventListener('click',()=>chooseFieldOption(fieldOption.id));
   }else{b.classList.add('ineligible');b.addEventListener('click',()=>preview.inspect(u.id,u));}
  }else if(ownerRelative===0&&targetMode&&(!targetMode.benchOnly||slot>=0)){
   if(quick.legalTarget(targetMode.type,card(targetMode.payload?.handIndex===undefined?u.id:current.view.players[side()].hand[targetMode.payload.handIndex]),u,card,slot,{round:current.view.round,turnSerial:current.turnSerial})){
    b.classList.add('legal');b.addEventListener('click',()=>send(command(targetMode.type,{...targetMode.payload,slot})));
   }else{b.classList.add('ineligible');b.addEventListener('click',()=>preview.inspect(u.id,u));}
  }else if(ownerRelative===0&&current.view.phase==='setup'&&(!current.setupConfirmed||(current.view.mulliganBonus?.side===side()&&current.view.mulliganBonus.drawn!==null&&slot!==-1))){
   b.title='Return this Pokémon to your hand';b.addEventListener('click',()=>send(command('setup_undo',{slot})));
  }else{b.addEventListener('click',()=>preview.inspect(u.id,u));}
  return b;
 }
 function showInfo(c,u){$('decisionTitle').textContent=c.name;
  $('decisionText').textContent=[`HP ${c.hp??'-'} · ${c.types?.join('/')||c.supertype}`,u?`Damage ${u.damage||0} · Attached Energy ${u.energies.map(id=>card(id).name).join(', ')||'none'}`:'',...(c.attacks||[]).map(a=>`${a.name} — ${a.damage||'effect'}: ${a.text||''}`),...(c.abilities||[]).map(a=>`${a.name}: ${a.text||''}`)].filter(Boolean).join(' · ');
 }
 function setZone(elementId,team,slot){shared.renderZone({root:$(elementId),team,active:slot===-1,createPokemon:(unit,index)=>pokemonNode(unit,team===current.view.players[side()]?0:1,index)});}
 function handCard(id,index,setup){const c=card(id),b=document.createElement('button'),src=picture(id);
  b.className='handcard'+(selectedHand===index?' selected':'');
  b.innerHTML=shared.handCardFace({card:c,source:src,handType:ux.handType(c)});
  b.setAttribute('aria-label',`${c.name} · ${c.supertype}`);
  preview.attach(b,id);
  b.addEventListener('click',()=>{
   const v=current.view;
   const intent=shared.handIntent({card:c,index,setup,setupConfirmed:!!current.setupConfirmed&&!(v.mulliganBonus?.side===side()&&v.mulliganBonus.drawn!==null),
    canAct:!watching()&&v.phase==='game'&&v.turn===side()&&!v.pendingDecision&&!v.over,
    energyUsed:!!current.me?.energyUsed,selectedHand,targetMode});
   if(intent.kind==='none')return;
   if(intent.kind==='inspect'){preview.inspect(id);return;}
   if(intent.kind==='error'){showEnergyLimitToast(intent.message);return;}
   if(intent.kind==='command'){if(intent.type!=='setup_select')preview.hide();send(command(intent.type,intent.payload));return;}
   if(intent.kind==='cancel'){cancelTarget();return;}
   if(intent.kind==='target'){selectedHand=index;preview.hide();setTarget(intent.type,intent.payload,intent.title);return;}
   selectedHand=index;targetMode=null;preview.inspect(id);render();
  });return b;
 }
 function renderHandActions(){
  const el=$('cardActions');el.textContent='';if(!current)return;
  if(targetMode){
   const msg=document.createElement('span');msg.className='target-hint';msg.textContent=targetMode.title+' — select a highlighted Pokémon.';
   el.append(msg,btn('✕ Cancel selection (Esc)',cancelTarget,'cancel-target'));return;
  }
  const v=current.view,us=v.players[side()],idx=selectedHand;
  if(idx===null||idx>=us.hand.length)return;
  el.append(btn('Inspect selected card',()=>preview.inspect(us.hand[idx])));
 }
 function renderDecisions(){const v=current.view,el=$('decisionBox'),title=$('decisionTitle'),description=$('decisionText'),opts=$('decisionOptions'),acts=$('decisionActions');
  const d=v.pendingDecision,field=fieldDecision(),prizeChoice=!!(d&&d.kind==='prize-card'&&d.actor===side()&&!watching());
  const bonusChoice=v.phase==='setup'&&!watching()&&v.mulliganBonus?.side===side()&&v.mulliganBonus.drawn===null;
  const showModal=!!((d&&d.actor===side()&&!field&&!targetMode&&!prizeChoice&&!watching())||bonusChoice);
  const destination=showModal?$('choiceModalContent'):$('choiceDock');
  if(el.parentElement!==destination)destination.append(el);
  $('choiceModal').classList.toggle('hidden',!showModal);
  $('choiceModal').setAttribute('aria-hidden',String(!showModal));
  $('fieldChoiceBar').replaceChildren();$('fieldChoiceBar').classList.add('hidden');
  if(showModal&&modalDecisionId!==(d?.id||'mulligan-bonus')){modalDecisionId=d?.id||'mulligan-bonus';$('choiceModalContent').focus({preventScroll:true});}
  if(!showModal)modalDecisionId=null;
  if(!field)lastFieldDecisionId=null;

  el.classList.toggle('hidden',!d&&!targetMode&&!v.over&&(v.phase==='game'||(v.phase==='setup'&&v.mulliganBonus?.drawn!==null&&v.mulliganBonus!==null)));
  opts.textContent='';acts.textContent='';el.classList.remove('active');
  if(targetMode){el.classList.add('active');title.textContent=targetMode.title;
   description.textContent='Click an eligible Pokémon in your Active or Bench area to complete this action.';
   acts.append(btn('Cancel selection (Esc)',cancelTarget,'cancel-target'));return;}
  if(prizeChoice){title.textContent='Choose a Prize card';description.textContent='Select a glowing Prize on your left, or tap a Prize number above the board.';const bar=$('fieldChoiceBar');bar.classList.remove('hidden');bar.textContent='🎁 Knock Out — choose a Prize card';return;}
  if(d&&d.actor===side()&&!watching()){el.classList.add('active');title.textContent=d.label||'Your decision';
   if(field){
    if(lastFieldDecisionId!==d.id){
     lastFieldDecisionId=d.id;
     requestAnimationFrame(()=>document.querySelector('.stage .decision-target')?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
    }
    description.textContent=`Select the highlighted Pokémon on the battlefield (${decisionSelection.size}/${d.max} selected).`;
    const bar=$('fieldChoiceBar');bar.classList.remove('hidden');
    const text=document.createElement('span');text.className='field-choice-text';
    const heading=document.createElement('strong');heading.textContent=d.label||'Choose a Pokémon';
    const hint=document.createElement('small');hint.textContent=d.max===1?'Tap an outlined Pokémon to choose.':`Tap ${d.min}–${d.max} outlined Pokémon · ${decisionSelection.size} selected`;
    text.append(heading,hint);bar.append(text);
    if(d.max>1){bar.append(btn('Confirm selection',()=>send(command('choose',{decisionId:d.id,selected:[...decisionSelection]})),'primary',decisionSelection.size<d.min||decisionSelection.size>d.max));}
    if(d.optional)bar.append(btn('Decline',()=>send(command('choose',{decisionId:d.id,decline:true})),'secondary'));
    if(d.cancelable)bar.append(btn('↶ Cancel card',()=>send(command('cancel_choice',{decisionId:d.id})),'secondary'));
    return;
   }

   description.textContent=`Choose ${d.min===d.max?d.min:`${d.min}–${d.max}`} option(s). ${d.optional?'You may decline.':'This choice is mandatory.'}`;
   if(d.kind==='arrange')description.textContent='Select cards in order: #1 will be on TOP of your deck and drawn next. Tap an already selected card to remove it.';
   if(/^New Pokédex:/.test(d.label||''))description.textContent=d.label+'. The card you choose now goes in this numbered draw position.';
   const choices=document.createElement('div');choices.className='choice-list';
   (d.displayDeck||d.options).forEach(item=>{
    const row=document.createElement('label'),input=document.createElement('input');input.type=d.max===1?'radio':'checkbox';input.name=d.id;input.value=item.id;input.checked=decisionSelection.has(item.id);
    if(item.eligible===false){input.disabled=true;row.classList.add('choice-ineligible');row.title='This card cannot be chosen for this effect';}
    row.classList.add('illustrated-choice');
    const candidate=item.cardId?card(item.cardId):[...cards.values()].find(c=>c.name===item.label||item.label?.endsWith(': '+c.name)||item.label?.startsWith(c.name+' ('));
    const src=candidate?.images?.small;
    if(typeof src==='string'&&/^https:\/\//.test(src)){
     const art=document.createElement('img');art.className='choice-card-art';art.src=src;art.alt=candidate.name||'';art.loading='lazy';row.append(art);
    }
    input.addEventListener('change',()=>{
     if(d.max===1)decisionSelection.clear();if(input.checked)decisionSelection.add(item.id);else decisionSelection.delete(item.id);
     renderDecisions();});row.append(input);
    const ordered=d.kind==='arrange'||/^New Pokédex:/.test(d.label||'');
    const position=ordered?[...decisionSelection].indexOf(item.id)+1:0;
    if(position){const badge=document.createElement('span');badge.className='selection-order';badge.textContent='#'+position;row.append(badge);}
    const caption=document.createElement('span');caption.className='choice-card-label';caption.textContent=item.label;row.append(caption);
    choices.append(row);
   });opts.append(choices);
   acts.append(btn('Confirm selection',()=>send(command('choose',{decisionId:d.id,selected:[...decisionSelection]})),'primary',decisionSelection.size<d.min||decisionSelection.size>d.max));
   if(d.optional)acts.append(btn('Decline',()=>send(command('choose',{decisionId:d.id,decline:true}))));
   if(d.cancelable)acts.append(btn('↶ Cancel card (Esc)',()=>send(command('cancel_choice',{decisionId:d.id})),'secondary'));
  }else if(d){title.textContent='Opponent is choosing';description.textContent='Waiting for the other player to resolve their choice.';}
  else if(v.over){title.textContent='DUEL COMPLETE';description.textContent=watching()?(current.winner===null?'Draw!':`${current.players[current.winner]?.name||'A player'} won.`):current.winner===side()?'You won!':current.winner===1-side()?'Your friend won.':'A draw!';acts.append(btn('Leave finished duel',newDuel,'primary'));}
  else if(watching()){title.textContent='SPECTATING';description.textContent='You can watch the public field and chat. Both players’ hands and face-down Prizes remain private.';}
  else if(v.phase==='setup'&&v.mulliganBonus){
   const bonus=v.mulliganBonus;
   title.textContent='MULLIGAN BONUS';
   if(bonus.side!==side())description.textContent='Waiting for your opponent to resolve their mulligan bonus.';
   else if(bonus.drawn===null){
    description.textContent=`Your opponent took ${bonus.max} more mulligan(s). You may draw up to ${bonus.max} extra card(s).`;
    const select=document.createElement('select');select.setAttribute('aria-label','Mulligan bonus cards');
    for(let i=0;i<=bonus.max;i++){const opt=document.createElement('option');opt.value=String(i);opt.textContent=`${i} bonus card${i===1?'':'s'}`;select.append(opt);}
    select.value=String(bonus.max);
    acts.append(select,btn('Draw selected cards',()=>send(command('setup_bonus_draw',{count:Number(select.value)})),'primary'));
    acts.append(btn('Skip bonus draw',()=>send(command('setup_bonus_draw',{count:0}))));
   }else{
    description.textContent=`You drew ${bonus.drawn} bonus card(s). Bench any additional Basic Pokémon, then start the duel. Your Active cannot change.`;
    acts.append(btn('Start duel',()=>send(command('setup_bonus_done')),'primary'));
   }
  }
  else if(v.phase==='setup'){
   title.textContent='OPENING SETUP';description.textContent='Select a Basic Pokémon from your opening hand to become Active. You may select up to five more for your Bench, then confirm. Your opponent’s team remains hidden until setup ends.';
   if(current.setupConfirmed){description.textContent='Opening setup confirmed. Waiting for your friend to confirm.';}
   else acts.append(btn('Confirm opening setup',()=>send(command('setup_confirm')),'primary',!v.players[side()].active));
  }else{title.textContent='YOUR NEXT MOVE';description.textContent='Click a Trainer or Basic Pokémon to play it. Select Energy or Evolution, then click a highlighted Pokémon. Use the attack buttons beside your Active Pokémon.';}
 }
 function performRender(){renderLobby();renderChat(current);if(!current?.started)return;
  feedback.update(current,side());opponentActivity.update(current,side(),current.players[1-side()]?.name||'Opponent');
  const v=current.view,you=v.players[side()],cpu=v.players[1-side()],yourTurn=!watching()&&v.turn===side()&&!v.over;
  document.querySelector('.stage').classList.toggle('your-turn',yourTurn&&v.phase==='game'&&!v.pendingDecision);
  $('yourLabel').textContent=(current.players[side()]?.name||'HOST').toUpperCase();$('opponentLabel').textContent=current.players[1-side()].name.toUpperCase();
  $('phaseText').textContent=watching()?'Watching · '+(v.over?'Finished':v.phase==='setup'?'Opening setup':'Live match'):v.over?'DUEL COMPLETE':v.phase==='setup'?'Opening setup':yourTurn?'Your turn':`Waiting for ${current.players[1-side()].name}`;
  quick.drawPrizes($('prizeRail'),you.prizeCount,cpu.prizeCount,current.players[1-side()].name.toUpperCase());
  $('turnChip').textContent='TURN '+(current.turnSerial+1);$('scoreline').textContent=`Your Prizes ${you.prizeCount} · Opponent Prizes ${cpu.prizeCount}`;
  $('stadiumText').textContent=v.stadium?`Stadium: ${card(v.stadium.id).name}`:'';
  if(v.stadium?.id==='neo4-99'&&v.phase==='game'&&yourTurn&&!v.pendingDecision){
   $('stadiumText').append(btn(' ↻ Use Stadium',()=>send(command('use_stadium')),'subtle'));
  }
  $('oppStats').textContent=`Hand ${cpu.handCount} · Deck ${cpu.deckCount} · Discard ${cpu.discard.length}`;
  $('myStats').textContent=`Hand ${you.handCount} · Deck ${you.deckCount} · Discard ${you.discard.length}`;
  $('myDeckCount').querySelector('b').textContent=you.deckCount;$('oppDeckCount').querySelector('b').textContent=cpu.deckCount;
  $('myDiscardBtn').querySelector('b').textContent=you.discard.length;$('oppDiscardBtn').querySelector('b').textContent=cpu.discard.length;
  renderPrizes(you.prizeCount,cpu.prizeCount);renderFaceUpPrizes();renderPrizeFallback();renderPresence();renderCoin(v);renderKnockOut(v);
  ux.renderGuide($('turnCoach'),{view:v,me:side(),energyUsed:current.me.energyUsed,targetMode,card,setupConfirmed:current.setupConfirmed});
  setZone('enemyActive',cpu,-1);setZone('enemyBench',cpu,0);setZone('myActive',you,-1);setZone('myBench',you,0);
  renderHandFan(you.hand);$('hand').textContent='';(you.hand||[]).forEach((id,i)=>$('hand').append(handCard(id,i,v.phase==='setup')));
  renderHandActions();$('attacks').textContent='';$('powers').textContent='';
  const attackEnabled=!watching()&&v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision;
  shared.renderAttacks({root:$('attacks'),unit:you.active,view:v,me:side(),getCard:card,enabled:attackEnabled,button:btn,onAttack:index=>send(command('attack',{attackIndex:index})),attackReason:presentation.attackReason});
  if(v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision&&you.active){
   [you.active,...you.bench].forEach((u,i)=>{if(u?.secretPlanFaceDown){$('powers').append(btn(`🎴 Reveal Secret Plan (${i===0?'Active':'Bench '+i})`,()=>send(command('reveal_secret',{slot:i-1}))));return;}const c=card(u.id);(c.abilities||[]).forEach(a=>{if(a.name)$('powers').append(btn(`✦ ${a.name} (${i===0?'Active':'Bench '+i})`,()=>send(command('use_power',{slot:i-1}))));});});
  }
  const actionsDisabled=watching()||!yourTurn||v.phase!=='game'||!!v.pendingDecision||v.over;
  $('retreatBtn').disabled=actionsDisabled||!you.bench.length;
  $('retreatBtn').title=actionsDisabled?'Retreat on your turn after resolving any choices.':!you.bench.length?'You need a Benched Pokémon to retreat.':'Choose a Benched Pokémon to replace your Active Pokémon.';
  $('undoBtn').disabled=busy||watching()||!current.undo?.available;
  $('undoBtn').title=current.undo?.available?'Undo '+current.undo.label:'Available only before random actions, drawing cards, or turn changes';
  const bonus=v.mulliganBonus,finishBonus=v.phase==='setup'&&!watching()&&bonus?.side===side()&&bonus.drawn!==null;
  $('endBtn').textContent=finishBonus?'✓ Start duel':'End turn →';
  $('endBtn').disabled=finishBonus?busy:actionsDisabled;
  $('concedeBtn').disabled=watching()||v.over||v.phase!=='game';
  $('history').textContent='';(v.messages||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;$('history').append(li);});
  renderDecisions();combat.update(current);renderMatchFeed();
 }
 function render(){try{performRender();updateDisplayedMats(current);returnToCubeWhenDone();}catch(error){
  console.error('Neo Campus online UI render failed',error);
  // Preserve the last intact card elements; show a recoverable error rather than going blank.
  fail(new Error('The battlefield could not be redrawn: '+(error.message||String(error))+' — refresh to recover.'));
 }}
 async function init(){
  const cubeRoom=new URLSearchParams(location.search).get('cubeRoom');
  if(cubeRoom&&/^[A-Z2-9]{6}$/.test(cubeRoom)){
   const back=document.createElement('a');
   back.href='/cube_room.html?room='+encodeURIComponent(cubeRoom);
   back.textContent='← Return to Cube Championship';
   back.setAttribute('aria-label','Return to your Cube championship standings');
   Object.assign(back.style,{position:'fixed',right:'14px',top:'10px',zIndex:'9999',
    background:'#ffd56f',color:'#17223e',fontWeight:'800',fontSize:'14px',
    textDecoration:'none',padding:'10px 14px',borderRadius:'10px',
    boxShadow:'0 4px 16px #0009'});
   document.body.append(back);
  }
  try{
   const data=await api('decks');$('deck').textContent='';$('roomDeck').textContent='';
   for(const x of data.decks){deckNames.set(x.id,x.name);for(const select of [$('deck'),$('roomDeck')]){const option=document.createElement('option');option.value=x.id;option.textContent=x.name;select.append(option);}}
   if(localStorage.getItem('neoCampusCustomGymDeck'))$('deck').value='custom';
   const hinted=new URLSearchParams(location.search).get('room');if(hinted){$('joinCode').value=hinted.toUpperCase();$('joinRoom').textContent='Enter match / Watch';document.querySelector('.lobby-form h3').textContent='Join room '+hinted.toUpperCase();$('joinCode').closest('label').classList.add('hidden');$('nickname').focus();}
   await Promise.all(['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4'].map(async set=>{
    const r=await fetch(`/cards/${set}.json`);if(!r.ok)throw Error(`Cannot load ${set}`);
    for(const c of await r.json())cards.set(c.id,c);
   }));
   token=sessionStorage.getItem('neoOnlineToken');roomCode=sessionStorage.getItem('neoOnlineRoom');
   if(token&&roomCode){try{current=await api('state?code='+encodeURIComponent(roomCode));}
    catch{token=null;roomCode=null;sessionStorage.removeItem('neoOnlineToken');sessionStorage.removeItem('neoOnlineRoom');}}
   render();setInterval(refresh,1200);
  }catch(e){$('startupError').textContent=e.message||String(e);}
 }
 window.addEventListener('resize',()=>{if(current?.view)renderHandFan(current.view.players[side()]?.hand);});
 $('closeHand').addEventListener('click',()=>$('handTray').classList.add('hidden'));
 $('powersToggle').addEventListener('click',()=>setPowersOpen(!powersOpen));
 $('closePowers').addEventListener('click',()=>setPowersOpen(false));
 $('chatForm').addEventListener('submit',submitChat);
 $('chatToggle').addEventListener('click',()=>toggleDrawer('chat',!chatOpen));$('closeChat').addEventListener('click',()=>toggleDrawer('chat',false));
 $('logToggle').addEventListener('click',()=>toggleDrawer('log',!logOpen));$('closeLog').addEventListener('click',()=>toggleDrawer('log',false));
 $('closePile').addEventListener('click',()=>$('pileModal').classList.add('hidden'));
 $('pileModal').addEventListener('click',e=>{if(e.target===$('pileModal'))$('pileModal').classList.add('hidden');});
 $('myDiscardBtn').addEventListener('click',()=>openDiscard(side()));$('oppDiscardBtn').addEventListener('click',()=>openDiscard(1-side()));
 $('createRoom').addEventListener('click',()=>openRoom('create'));
 $('joinRoom').addEventListener('click',()=>openRoom('join'));
 $('roomDeck').addEventListener('change',()=>{lobbyDeckDraft=$('roomDeck').value;renderLobby();});
 $('saveRoomDeck').addEventListener('click',()=>{
  if(!current||current.started)return;
  const deck=$('roomDeck').value;
  if(deck===current.players[side()]?.deck&&deck!=='custom')return;
  let customDeck;
  if(deck==='custom'){
   try{customDeck=JSON.parse(localStorage.getItem('neoCampusCustomGymDeck')||'null');}
   catch(e){$('lobbyError').textContent='Your custom deck could not be loaded. Please save it in the deck builder first.';return;}
  }
  lobbyAction('deck',{deck,...(deck==='custom'?{customDeck}:{})});
 });
 $('saveRoomName').addEventListener('click',()=>{const name=$('roomName').value.trim();if(!name||name===current?.players[side()]?.name)return;lobbyAction('name',{name});});
 $('readyBtn').addEventListener('click',()=>{if(lobbyDeckDraft&&lobbyDeckDraft!==current?.players?.[side()]?.deck)return;lobbyAction('ready',{ready:!current.players[side()].ready});});
 $('startMatch').addEventListener('click',()=>lobbyAction('start'));
 $('leaveLobby').addEventListener('click',async()=>{if(!current)return;try{await api('leave',{method:'POST',body:JSON.stringify({code:roomCode,revision:current.revision})});newDuel();}catch(e){$('lobbyError').textContent=e.message;}});
 $('copyInvite').addEventListener('click',async()=>{try{if(navigator.clipboard){await navigator.clipboard.writeText($('roomLink').value);}else{$('roomLink').select();document.execCommand('copy');}$('copyInvite').textContent='Copied!';}catch{$('roomLink').select();$('copyInvite').textContent='Select and copy link';}});
 $('reset').addEventListener('click',newDuel);
 $('undoBtn').addEventListener('click',()=>send(command('undo')));
 $('endBtn').addEventListener('click',()=>{
  const bonus=current?.view?.mulliganBonus;
  if(current?.view?.phase==='setup'&&bonus?.side===side()&&bonus.drawn!==null)
   send(command('setup_bonus_done'));
  else if(current?.view?.phase==='game')send(command('end_turn'));
 });
 $('retreatBtn').addEventListener('click',()=>setTarget('retreat',{},'Choose Benched replacement',true));
 $('concedeBtn').addEventListener('click',()=>{if(confirm('Concede this duel?'))send(command('concede'));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=current?.view?.pendingDecision;if(d?.cancelable&&!busy){e.preventDefault();send(command('cancel_choice',{decisionId:d.id}));return;}if(targetMode){e.preventDefault();cancelTarget();}else if(powersOpen){setPowersOpen(false);}}});
 init();
})();
