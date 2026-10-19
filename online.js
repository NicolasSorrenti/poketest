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
 const preview=quick.makePreview($('cardPreview'),id=>card(id));
 const feedback=quick.makeDuelFeedback($('duelFeedback'));
 const combat=presentation.makeBattlePresentation({stage:document.querySelector('.stage'),popup:$('combatFx'),timeline:$('actionTimeline'),getCard:id=>cards.get(id)||{name:String(id)},me:()=>side(),opponentName:()=>current?.players?.[1-side()]?.name||'Opponent'});
 const opponentActivity=quick.makeOpponentActivity({status:$('opponentActivityStatus'),overlay:$('opponentActionFx'),arena:document.querySelector('.stage'),getCard:id=>cards.get(id)||{name:String(id)},suppressCombat:true});
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let modalDecisionId=null,lastFieldDecisionId=null;
 let token=null,roomCode=null,current=null,selectedHand=null,targetMode=null,busy=false,decisionSelection=new Set(),lastDecision=null,chatSeq=-1,chatBusy=false;
 let handOpen=false,powersOpen=false,chatOpen=false,logOpen=false,seenChatSeq=-1,lastCoinSeq=null,coinQueue=[],coinTimer=null,lastKoFeedSeq=null;
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

 async function send(action){if(!current||busy||watching())return;busy=true;clearError();try{
  const result=await api('action',{method:'POST',body:JSON.stringify({code:roomCode,revision:current.revision,command:action})});
  preview.hide();current=result;if(action.type!=='choose')setHandOpen(false);selectedHand=null;targetMode=null;decisionSelection.clear();render();
 }catch(e){fail(e);}finally{busy=false;render();}}
 async function openRoom(kind){if(busy)return;busy=true;$('startupError').textContent='';try{
  const deck=$('deck').value;
  const suppliedCode=$('joinCode').value.trim().toUpperCase();
  const body={deck,name:$('nickname').value,...(deck==='custom'?{customDeck:JSON.parse(localStorage.getItem('neoCampusCustomGymDeck')||'null')}:{}),...(suppliedCode?{code:suppliedCode}:{})};
  const data=await api(kind,{method:'POST',body:JSON.stringify(body)});
  feedback.reset();opponentActivity.clear();combat.reset();lobbyDeckDraft=null;token=data.token;roomCode=data.code;chatSeq=-1;seenChatSeq=-1;lastCoinSeq=null;lastKoFeedSeq=null;sessionStorage.setItem('neoOnlineToken',token);sessionStorage.setItem('neoOnlineRoom',roomCode);
  current=data;render();
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
 function newDuel(){lobbyDeckDraft=null;clearChoiceUi();opponentActivity.clear();combat.reset();chatSeq=-1;$('chatMessages').textContent='';feedback.reset();preview.hide();chatOpen=false;logOpen=false;handOpen=false;powersOpen=false;token=null;roomCode=null;current=null;selectedHand=null;targetMode=null;
  sessionStorage.removeItem('neoOnlineToken');sessionStorage.removeItem('neoOnlineRoom');render();}
 async function refresh(){if(!token||!roomCode||busy)return;try{
  const state=await api('state?code='+encodeURIComponent(roomCode));
  $('networkStatus').textContent='Connected';
  renderChat(state);
  if(!current||state.revision!==current.revision){const previous=current?.view?.pendingDecision?.id;
   preview.hide();current=state; if(previous!==state.view?.pendingDecision?.id)decisionSelection.clear();
   selectedHand=null;targetMode=null;render();}
  else{current.presence=state.presence;current.spectatorCount=state.spectatorCount;renderPresence();}
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
 function setHandOpen(open){handOpen=!!open;$('handTray').classList.toggle('hidden',!handOpen);$('handPanel').classList.toggle('tray-open',handOpen);$('handToggle').setAttribute('aria-expanded',String(handOpen));$('handToggle').setAttribute('aria-label',handOpen?'Close hand':'Open hand');if(handOpen)setPowersOpen(false);}
 function setPowersOpen(open){powersOpen=!!open;$('powerDrawer').classList.toggle('hidden',!powersOpen);$('powersToggle').setAttribute('aria-expanded',String(powersOpen));if(powersOpen)setHandOpen(false);}
 function renderHandPeek(ids){const root=$('handPeek');root.replaceChildren();
  if(watching()){root.textContent='Hidden';return;}
  if(!ids?.length){const s=document.createElement('span');s.className='hand-peek-empty';s.textContent='Empty';root.append(s);return;}
  ids.slice(0,3).forEach((id,i)=>{const s=document.createElement('span');s.className='peek-card peek-card-'+i;const src=picture(id);if(src){const img=document.createElement('img');img.alt='';img.src=src;s.append(img);}else{s.textContent='🎴';}root.append(s);});
 }
 function pendingPrizeChoice(){const d=current?.view?.pendingDecision;return !watching()&&d?.kind==='prize-card'&&d.actor===side()?d:null;}
 function choosePrize(id){const d=pendingPrizeChoice();if(!d||busy||!d.options?.some(o=>o.id===id))return;send(command('choose',{decisionId:d.id,selected:[id]}));}
 function renderFaceUpPrizes(){
  if(!current?.view)return;
  const groups=$('prizeRail').querySelectorAll('.prize-group');
  // The rail orders opponent's Prizes first, regardless of which seat owns
  // this browser; spectators are presented from seat 0's perspective.
  for(const [rail,player] of [[0,1-side()],[1,side()]]){
   const grid=groups[rail]?.querySelector('.prize-grid');if(!grid)continue;
   for(const {index,id} of current.view.players[player]?.revealedPrizes||[]){
    const el=grid.children[index];if(!el||!id)continue;
    const name=card(id).name;
    el.classList.add('prize-face-up');el.title='Face-up Prize: '+name;
    el.setAttribute('aria-label','Face-up Prize '+(index+1)+': '+name);
    el.textContent=name;el.style.fontSize='10px';
    el.style.overflow='hidden';el.style.overflowWrap='anywhere';
   }
  }
 }
 function renderPrizes(ownCount,opponentCount){
  const d=pendingPrizeChoice();if(!d)return;
  const section=$('prizeRail').querySelectorAll('.prize-group')[1];if(!section)return;
  const grid=section.querySelector('.prize-grid');if(!grid)return;
  section.classList.add('prize-awaiting');grid.setAttribute('role','group');grid.setAttribute('aria-label','Choose your Prize card');grid.replaceChildren();
  const options=new Map((d.options||[]).map(o=>[Number(/^prize:(\d+)$/.exec(o.id)?.[1]),o]));
  for(let i=0;i<6;i++){
   const option=options.get(i);
   if(!option){const slot=document.createElement('span');slot.className='prize-back prize-taken';grid.append(slot);continue;}
   const button=btn(String(i+1),()=>choosePrize(option.id),'prize-back prize-select',busy);
   button.title='Take Prize '+(i+1);button.setAttribute('aria-label','Take Prize '+(i+1));grid.append(button);
  }
 }
 function renderPrizeFallback(){
  const d=pendingPrizeChoice(),dialog=$('prizeChoicePanel');
  dialog.replaceChildren();dialog.classList.toggle('hidden',!d);
  if(!d)return;
  const title=document.createElement('strong');title.textContent='🎁 Choose a Prize';
  const hint=document.createElement('span');hint.textContent='Tap your glowing Prize on the left, or choose a number here:';
  const buttons=document.createElement('div');buttons.className='prize-choices';
  for(const option of d.options||[]){const n=Number(/^prize:(\d+)$/.exec(option.id)?.[1]);buttons.append(btn('🎴 '+(n+1),()=>choosePrize(option.id),'prize-option',busy));}
  dialog.append(title,hint,buttons);
 }
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
  b.innerHTML=quick.energyStack({...u,energies:attached},card)+`<span class="pokemon-face">`+(src?`<img loading="lazy" alt="" src="${esc(src)}">`:`<div class="empty">${esc(c.name)}</div>`)+`</span>`+
   `<strong>${esc(c.name)}</strong>`+ux.vitals(u,c)+`<span class="stats">${attached.length} energy attached</span>`;
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
  }else if(ownerRelative===0&&current.view.phase==='setup'){
   b.title='Return this Pokémon to your hand';b.addEventListener('click',()=>send(command('setup_undo',{slot})));
  }else{b.addEventListener('click',()=>preview.inspect(u.id,u));}
  return b;
 }
 function showInfo(c,u){$('decisionTitle').textContent=c.name;
  $('decisionText').textContent=[`HP ${c.hp??'-'} · ${c.types?.join('/')||c.supertype}`,u?`Damage ${u.damage||0} · Attached Energy ${u.energies.map(id=>card(id).name).join(', ')||'none'}`:'',...(c.attacks||[]).map(a=>`${a.name} — ${a.damage||'effect'}: ${a.text||''}`),...(c.abilities||[]).map(a=>`${a.name}: ${a.text||''}`)].filter(Boolean).join(' · ');
 }
 function setZone(elementId,team,slot){const el=$(elementId),fragment=document.createDocumentFragment();if(slot===-1){
  if(team.active)fragment.append(pokemonNode(team.active,team===current.view.players[side()]?0:1,-1));else{const empty=document.createElement('div');empty.className='empty';empty.textContent='Not selected';fragment.append(empty);}
 }else{if(!team.bench.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='Empty Bench';fragment.append(empty);}
  team.bench.forEach((u,i)=>fragment.append(pokemonNode(u,team===current.view.players[side()]?0:1,i)));}
  el.replaceChildren(fragment);}
 function handCard(id,index,setup){const c=card(id),b=document.createElement('button'),src=picture(id);
  b.className='handcard'+(selectedHand===index?' selected':'');
  b.innerHTML=(src?`<img loading="lazy" alt="" src="${esc(src)}">`:'')+`<strong>${esc(c.name)}</strong><span class="handcard-type">${esc(ux.handType(c))}</span>`;
  b.setAttribute('aria-label',`${c.name} · ${c.supertype}`);
  preview.attach(b,id);
  b.addEventListener('click',()=>{
   if(setup){if(current.setupConfirmed)return;if(c.supertype==='Pokémon'&&c.subtypes?.includes('Basic'))send(command('setup_select',{handIndex:index}));else preview.inspect(id);return;}
   const v=current.view, canAct=!watching()&&v.phase==='game'&&v.turn===side()&&!v.pendingDecision&&!v.over;
   if(!canAct){preview.inspect(id);return;}
   if(c.supertype==='Energy'&&current.me.energyUsed){fail(new Error('You have already attached an Energy this turn.'));return;}
   if(c.supertype==='Trainer'){preview.hide();send(command('play_trainer',{handIndex:index}));return;}
   if(c.supertype==='Pokémon'&&c.subtypes?.includes('Basic')){preview.hide();send(command('bench',{handIndex:index}));return;}
   // Clicking Energy or an Evolution immediately enters target-selection mode.
   if((c.supertype==='Energy'||(c.supertype==='Pokémon'&&c.evolvesFrom))){
    if(selectedHand===index&&targetMode){cancelTarget();return;}
    selectedHand=index;
    preview.hide();setHandOpen(false);
    setTarget(c.supertype==='Energy'?'attach_energy':'evolve',{handIndex:index},
      c.supertype==='Energy'?`Attach ${c.name} — choose Pokémon`:`Evolve into ${c.name} — choose Pokémon`);
    return;
   }
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
  const d=v.pendingDecision,field=fieldDecision(),prizeChoice=!!(d&&d.kind==='prize-card'&&d.actor===side()&&!watching()),showModal=!!(d&&d.actor===side()&&!field&&!targetMode&&!prizeChoice&&!watching());
  const destination=showModal?$('choiceModalContent'):$('choiceDock');
  if(el.parentElement!==destination)destination.append(el);
  $('choiceModal').classList.toggle('hidden',!showModal);
  $('choiceModal').setAttribute('aria-hidden',String(!showModal));
  $('fieldChoiceBar').replaceChildren();$('fieldChoiceBar').classList.add('hidden');
  if(showModal&&modalDecisionId!==d.id){modalDecisionId=d.id;$('choiceModalContent').focus({preventScroll:true});}
  if(!showModal)modalDecisionId=null;
  if(!field)lastFieldDecisionId=null;

  el.classList.toggle('hidden',!d&&!targetMode&&!v.over&&v.phase==='game');
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
    return;
   }

   description.textContent=`Choose ${d.min===d.max?d.min:`${d.min}–${d.max}`} option(s). ${d.optional?'You may decline.':'This choice is mandatory.'}`;
   const choices=document.createElement('div');choices.className='choice-list';
   d.options.forEach(item=>{
    const row=document.createElement('label'),input=document.createElement('input');input.type=d.max===1?'radio':'checkbox';input.name=d.id;input.value=item.id;input.checked=decisionSelection.has(item.id);
    input.addEventListener('change',()=>{
     if(d.max===1)decisionSelection.clear();if(input.checked)decisionSelection.add(item.id);else decisionSelection.delete(item.id);
     renderDecisions();});row.append(input,document.createTextNode(item.label));choices.append(row);
   });opts.append(choices);
   acts.append(btn('Confirm selection',()=>send(command('choose',{decisionId:d.id,selected:[...decisionSelection]})),'primary',decisionSelection.size<d.min||decisionSelection.size>d.max));
   if(d.optional)acts.append(btn('Decline',()=>send(command('choose',{decisionId:d.id,decline:true}))));
  }else if(d){title.textContent='Opponent is choosing';description.textContent='Waiting for the other player to resolve their choice.';}
  else if(v.over){title.textContent='DUEL COMPLETE';description.textContent=watching()?(current.winner===null?'Draw!':`${current.players[current.winner]?.name||'A player'} won.`):current.winner===side()?'You won!':current.winner===1-side()?'Your friend won.':'A draw!';acts.append(btn('Leave finished duel',newDuel,'primary'));}
  else if(watching()){title.textContent='SPECTATING';description.textContent='You can watch the public field and chat. Both players’ hands and face-down Prizes remain private.';}
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
  $('energyStatus').textContent=watching()?'Spectating':current.me.energyUsed?'Energy attached this turn':'Energy attachment available';
  $('myDeckCount').querySelector('b').textContent=you.deckCount;$('oppDeckCount').querySelector('b').textContent=cpu.deckCount;
  $('myDiscardBtn').querySelector('b').textContent=you.discard.length;$('oppDiscardBtn').querySelector('b').textContent=cpu.discard.length;
  renderPrizes(you.prizeCount,cpu.prizeCount);renderFaceUpPrizes();renderPrizeFallback();renderPresence();renderCoin(v);renderKnockOut(v);
  ux.renderGuide($('turnCoach'),{view:v,me:side(),energyUsed:current.me.energyUsed,targetMode,card,setupConfirmed:current.setupConfirmed});
  setZone('enemyActive',cpu,-1);setZone('enemyBench',cpu,0);setZone('myActive',you,-1);setZone('myBench',you,0);
  $('handAmount').textContent=`(${you.handCount||0}${watching()?' hidden':''})`;renderHandPeek(you.hand);$('hand').textContent='';(you.hand||[]).forEach((id,i)=>$('hand').append(handCard(id,i,v.phase==='setup')));
  renderHandActions();$('attacks').textContent='';$('powers').textContent='';
  if(you.active){
   const active=card(you.active.id);
   const attackEnabled=!watching()&&v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision;
   (you.active.effectiveAttacks||active.attacks||[]).forEach((a,i)=>{
    const b=btn('',()=>send(command('attack',{attackIndex:i})),'attack-action',!attackEnabled);
    const energy=(a.cost||[]).map(t=>`<span class="energy-pip energy-${esc(String(t).toLowerCase())}">${esc(String(t)[0])}</span>`).join('');
    b.innerHTML=`<span class="attack-name">${esc(a.name)}</span><span class="attack-cost">${energy||'<small>FREE</small>'}</span><strong class="attack-damage">${esc(a.damage||'—')}</strong>${a.text?`<span class="attack-effect">${esc(a.text)}</span>`:''}`;
    b.title=a.text||a.name;b.setAttribute('aria-label',`${a.name}, cost ${(a.cost||[]).join(', ')||'free'}, damage ${a.damage||'effect'}`);
    const reason=presentation.attackReason({view:v,me:side(),attack:a,unit:you.active,getCard:card});
   if(reason){b.title=reason;if(!attackEnabled)b.setAttribute('aria-disabled','true');const why=document.createElement('span');why.className='attack-warning';why.textContent=reason;b.append(why);}
   $('attacks').append(b);
   });
  }else $('attacks').innerHTML='<span class="hint">Choose an Active Pokémon</span>';
  if(v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision&&you.active){
   [you.active,...you.bench].forEach((u,i)=>{if(u?.secretPlanFaceDown){$('powers').append(btn(`🎴 Reveal Secret Plan (${i===0?'Active':'Bench '+i})`,()=>send(command('reveal_secret',{slot:i-1}))));return;}const c=card(u.id);(c.abilities||[]).forEach(a=>{if(a.name)$('powers').append(btn(`✦ ${a.name} (${i===0?'Active':'Bench '+i})`,()=>send(command('use_power',{slot:i-1}))));});});
  }
  const actionsDisabled=watching()||!yourTurn||v.phase!=='game'||!!v.pendingDecision||v.over;
  $('retreatBtn').disabled=actionsDisabled||!you.bench.length;
  $('retreatBtn').title=actionsDisabled?'Retreat on your turn after resolving any choices.':!you.bench.length?'You need a Benched Pokémon to retreat.':'Choose a Benched Pokémon to replace your Active Pokémon.';
  $('endBtn').disabled=actionsDisabled;
  $('concedeBtn').disabled=watching()||v.over||v.phase!=='game';
  $('history').textContent='';(v.messages||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;$('history').append(li);});
  renderDecisions();combat.update(current);renderMatchFeed();
 }
 function render(){try{performRender();returnToCubeWhenDone();}catch(error){
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
 $('handToggle').addEventListener('click',()=>setHandOpen(!handOpen));
 $('closeHand').addEventListener('click',()=>setHandOpen(false));
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
 $('endBtn').addEventListener('click',()=>send(command('end_turn')));
 $('retreatBtn').addEventListener('click',()=>setTarget('retreat',{},'Choose Benched replacement',true));
 $('concedeBtn').addEventListener('click',()=>{if(confirm('Concede this duel?'))send(command('concede'));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(targetMode){e.preventDefault();cancelTarget();}else if(handOpen){setHandOpen(false);}else if(powersOpen){setPowersOpen(false);}}});
 init();
})();
