'use strict';
// This page NEVER calculates damage, pays costs or applies card effects.
// Every button sends a typed command to the same server-side Classic reducer.
(()=>{
 const $=id=>document.getElementById(id);
 function settleBoot(error){
  if(error&&rpgMode&&rpgDuelId&&window.parent!==window)window.parent.postMessage({type:'neo-rpg-duel-error',duelId:rpgDuelId,error:String(error.message||error).slice(0,240)},location.origin);
  const loading=$('duelLoading');
  if(error){
   $('duelLoadingTitle').textContent='Unable to open the duel';
   $('duelLoadingText').textContent=error.message||String(error);
   $('duelLoadingSpinner').hidden=true;
   $('duelLoadingRetry').hidden=false;
   $('duelLoadingBack').hidden=false;
   $('duelLoadingBack').href=rpgMode?'/rpg.html':cubeRoomCode?'/cube_room.html?room='+encodeURIComponent(cubeRoomCode):cubeSoloMode?'/cube.html':'/play.html';
   return;
  }
  loading.hidden=true;
  document.body.classList.remove('duel-booting');
 }
 $('duelLoadingRetry').addEventListener('click',()=>location.reload());

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

 const rpgParams=new URLSearchParams(location.search),rpgMode=rpgParams.get('rpg')==='1',rpgDuelId=rpgParams.get('duelId');
 const cubeSoloMode=rpgParams.get('cubeSolo')==='1';
 // Distinct browser sessions stop Cube duels leaking into Single Match.
 const rpgKey=rpgMode&&rpgDuelId?window.NeoRpgDuelBridge.sessionKey(rpgDuelId):cubeRoomCode?'neoCubeRoomLiveToken:'+cubeRoomCode:cubeSoloMode?'neoCubeLiveToken':'neoClassicLiveToken';
 const rpgNpc=rpgMode?rpgParams.get('npc'):null;
 const rpgNpcOutfit=rpgMode?rpgParams.get('npcOutfit'):null;
 const opponentName=rpgMode?(rpgParams.get('npcName')||'Opponent'):'Classic CPU';
 const mats=window.NeoDuelPlaymats;
 const gifts=rpgMode?(rpgParams.get('giftMats')||'').split(',').filter(Boolean):Object.keys(mats.themes);
 let matOptions=[],matIds=[];
 let cubeMatOwner=!cubeRoomCode;
 // A multiplayer Cube match against a CPU still belongs to the online
 // tournament: keep its mat controls locked until server-verified owner login.
 let selectedMat=cubeRoomCode?'aurora':rpgMode?rpgParams.get('mat'):localStorage.getItem('neoCampusPlaymat');
 const matSelect=$('playmatSelect');
 function updateCubeMatControls(){
  const locked=!!cubeRoomCode&&!cubeMatOwner;
  matSelect.disabled=locked;
  document.querySelector('.duel-playmat-picker')?.classList.toggle('hidden',locked);
  document.querySelector('.duel-playmat-editor')?.classList.toggle('hidden',locked);
 }
 async function checkCubeMatOwner(){
  if(!cubeRoomCode||cubeMatOwner)return;
  try{
   const credentials=JSON.parse(sessionStorage.getItem('neoCampusCubeRoomV1')||'null');
   if(credentials?.code!==cubeRoomCode||typeof credentials.token!=='string')return;
   const bearer=await window.NeoCubeMatAuth?.bearer?.();
   if(!bearer)return;
   const response=await fetch('/api/cube-room/mat-permission',{
    headers:{'X-Cube-Room-Code':cubeRoomCode,'X-Cube-Room-Token':credentials.token,Authorization:bearer}
   });
   if(!response.ok||(await response.json()).canEdit!==true)return;
   cubeMatOwner=true;refreshMatOptions(localStorage.getItem('neoCampusPlaymat')||'aurora');
   updatePlaymats();updateCubeMatControls();
  }catch{}
 }
 updateCubeMatControls();
 function refreshMatOptions(preferred=selectedMat){
  matOptions=mats.available(gifts);matIds=matOptions.map(m=>m.id);
  selectedMat=mats.choose(preferred,matIds);
  matSelect.replaceChildren();
  for(const mat of matOptions){const option=document.createElement('option');option.value=mat.id;option.textContent=mat.name;matSelect.append(option);}
  matSelect.value=selectedMat;
 }
 refreshMatOptions();
 if(cubeRoomCode)void checkCubeMatOwner();
 function updatePlaymats(){mats.apply(document.querySelector('.player-territory'),selectedMat);mats.apply(document.querySelector('.opponent-territory'),rpgMode&&mats.themes[rpgNpc]?'npc-'+rpgNpc:'heritage');}
 function persistPlaymatSelection(){
  if(cubeRoomCode&&!cubeMatOwner)return;
  localStorage.removeItem(mats.IMPORT_KEY);
  localStorage.setItem('neoCampusPlaymat',selectedMat);
  if(rpgMode&&rpgDuelId)window.parent.postMessage({type:'neo-rpg-playmat-selected',duelId:rpgDuelId,playmat:selectedMat},location.origin);
 }
 matSelect.addEventListener('change',()=>{
  if(cubeRoomCode&&!cubeMatOwner)return;
  selectedMat=mats.choose(matSelect.value,matIds);
  persistPlaymatSelection();
  updatePlaymats();
 });
 // If the Studio is open in another tab, newly finished mats become usable without reloading the duel.
 window.addEventListener('storage',event=>{
  if(cubeRoomCode&&event.key==='neoRpgCloudSessionV1'){
   cubeMatOwner=false;refreshMatOptions('aurora');updatePlaymats();
   updateCubeMatControls();void checkCubeMatOwner();return;
  }
  if(cubeRoomCode&&!cubeMatOwner)return;
  if(!['neoCampusCustomPlaymatsV1','neoCampusPlaymat',mats.IMPORT_KEY].includes(event.key))return;
  const previous=selectedMat;
  const proposed=event.key==='neoCampusPlaymat'||event.key===mats.IMPORT_KEY?localStorage.getItem('neoCampusPlaymat'):selectedMat;
  refreshMatOptions(proposed);
  updatePlaymats();
  if(selectedMat!==previous&&rpgMode&&rpgDuelId)window.parent.postMessage({type:'neo-rpg-playmat-selected',duelId:rpgDuelId,playmat:selectedMat},location.origin);
 });
 updatePlaymats();
 const cards=new Map();
 const npcChat=rpgMode?window.NeoRpgMatchChat.make({container:$('rpgDialogueMessages'),key:'neoRpgDuelChat:'+rpgDuelId}):null;
 let npcChatOpen=false;
 function toggleNpcChat(open){npcChatOpen=!!open;$('rpgReactionChat').classList.toggle('hidden',!npcChatOpen);$('rpgChatToggle').setAttribute('aria-expanded',String(npcChatOpen));}
 const reactions=rpgMode&&rpgNpc?window.NeoRpgMatchReactions.makeExperience({
  element:$('npcReaction'),npcId:rpgNpc,npcName:opponentName,outfit:rpgNpcOutfit,onShow:reaction=>npcChat?.push(reaction),
  getCard:id=>cards.get(id)||null
 }):null;
 function notifyRpg(){if(rpgMode&&rpgDuelId&&current?.view?.over&&(current.winner===null||current.winner===0||current.winner===1))window.parent.postMessage(window.NeoRpgDuelBridge.message(rpgDuelId,current.winner),location.origin);}
 function notifyRpgReady(){if(rpgMode&&rpgDuelId&&window.parent!==window)window.parent.postMessage({type:'neo-rpg-duel-ready',duelId:rpgDuelId},location.origin);}
 const quick=window.NeoDuelUI;
 const ux=window.NeoExperienceUI;
 const presentation=window.NeoBattlePresentation;
 const shared=window.NeoBattleComponents;
 const preview=quick.makePreview($('cardPreview'),id=>card(id));
 const feedback=quick.makeDuelFeedback($('duelFeedback'),id=>card(id));
 const showEnergyLimitToast=quick.makeTransientToast($('energyLimitToast'));
 const combat=presentation.makeBattlePresentation({stage:document.querySelector('.stage'),popup:$('combatFx'),timeline:$('actionTimeline'),getCard:id=>cards.get(id)||{name:String(id)},me:()=>0,opponentName:()=>opponentName});
 const opponentActivity=quick.makeOpponentActivity({status:$('opponentActivityStatus'),overlay:$('opponentActionFx'),arena:document.querySelector('.stage'),getCard:id=>cards.get(id)||{name:String(id)},suppressCombat:true});
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let modalDecisionId=null,lastFieldDecisionId=null;
 let token=null,current=null,selectedHand=null,targetMode=null,busy=false,decisionSelection=new Set();
 let playbackEpoch=0;
 let handVisible=true,powersOpen=false,logOpen=false,lastCoinSeq=null,coinQueue=[],coinTimer=null,lastKoMessage="";
 const command=(type,payload={})=>({type,payload});
 async function rpgAccessToken(){
  if(!rpgMode)return null;
  const key='neoRpgCloudSessionV1';
  let saved;try{saved=JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}
  if(!saved?.access_token||!saved.refresh_token)return null;
  if(saved.expires_at>Date.now()+30000)return saved.access_token;
  // The RPG and its embedded duel use the same origin and login.
  try{
   const response=await fetch('/api/rpg-cloud/config',{cache:'no-store'});
   const config=await response.json();
   if(!config.enabled)return null;
   const result=await fetch(config.url+'/auth/v1/token?grant_type=refresh_token',{
    method:'POST',headers:{'Content-Type':'application/json',apikey:config.key},
    body:JSON.stringify({refresh_token:saved.refresh_token})
   });
   if(!result.ok)return null;
   const refreshed=await result.json();
   if(!refreshed?.access_token||!refreshed?.refresh_token)return null;
   saved={access_token:refreshed.access_token,refresh_token:refreshed.refresh_token,
    user:refreshed.user,expires_at:Date.now()+Math.max(0,Number(refreshed.expires_in||3600)-60)*1000};
   localStorage.setItem(key,JSON.stringify(saved));
   return saved.access_token;
  }catch{return null;}
 }
 async function api(path,opts={}){
  const accessToken=await rpgAccessToken();
  const headers={'Content-Type':'application/json',...(token?{'X-Duel-Token':token}:{}),
    ...(accessToken?{Authorization:'Bearer '+accessToken}:{})};
  const r=await fetch('/api/classic/'+path,{...opts,headers});const body=await r.json();
  if(!r.ok){const error=new Error(body.error||'Could not contact Classic engine');error.status=r.status;throw error;}
  return body;
 }
 function checkCloudCheckpoint(result){
  // Local battles should not display a red error for missing cloud sign-in.
  // Checkpoint requests and signed-in persistence are unaffected.
  if(result?.cloudSaved===false&&result.cloudError)console.info('Cloud checkpoint unavailable:',result.cloudError);
 }
 const card=id=>cards.get(id)||{name:String(id),types:[],attacks:[],abilities:[]};
 const fieldDecision=()=>{const d=current?.view?.pendingDecision;if(!d||d.actor!==0)return null;
  return window.NeoBattleDecisionUI.resolveTargets(d,current.view,0,card);
 };
 function chooseFieldOption(id){const d=current?.view?.pendingDecision;if(!d||d.actor!==0||!fieldDecision()?.some(x=>x.id===id)||busy)return;
  if(d.max===1){send(command('choose',{decisionId:d.id,selected:[id]}));return;}
  if(decisionSelection.has(id))decisionSelection.delete(id);else if(decisionSelection.size<d.max)decisionSelection.add(id);
  render();
 }
 const picture=id=>{const c=card(id),img=c.images?.small;return typeof img==='string'&&/^https:\/\//.test(img)?img:null;};
 function btn(text,handler,cls='',disabled=false){const b=document.createElement('button');b.textContent=text;b.className=cls;b.disabled=disabled;b.addEventListener('click',handler);return b;}
 function fail(e){$('error').textContent=e.message||String(e);$('error').classList.remove('hidden');}
 function clearError(){$('error').textContent='';$('error').classList.add('hidden');}

 const CPU_ACTION_PAUSE_MS=1800,CPU_ATTACK_PAUSE_MS=2400,RPG_ATTACK_PAUSE_MS=3300;
 const lastEventSeq=actions=>(Array.isArray(actions)?actions:[]).reduce(
  (max,event)=>Number.isSafeInteger(event?.seq)?Math.max(max,event.seq):max,0);
 async function playCpuPlayback(result,epoch){
  const snapshots=Array.isArray(result.cpuPlayback)?result.cpuPlayback:[];
  // These are chronological public snapshots from the authoritative server,
  // not client-side re-executions of card effects or CPU decisions.
  let previousSeq=lastEventSeq(current?.activity);
  for(const frame of [...snapshots,result]){
   if(epoch!==playbackEpoch)return false;
   const cpuAttacked=frame.activity?.some(event=>
    event.side===1&&event.type==='attack'&&event.seq>previousSeq);
   previousSeq=lastEventSeq(frame.activity);
   current=frame===result?result:{...result,...frame};
   render();
   // Keep CPU playback and the victory transition behind image preparation.
   // Presentation duration begins only after the NPC cut-in is visible.
   if(rpgMode&&reactions?.active){
    await reactions.whenShown();
    if(epoch!==playbackEpoch)return false;
   }
   if(frame!==result){
    // RPG attacks must hold until the illustrated NPC cut-in has completed.
    // Other modes still receive a readable attack animation, but no NPC art.
    const duration=cpuAttacked?(rpgMode?RPG_ATTACK_PAUSE_MS:CPU_ATTACK_PAUSE_MS):CPU_ACTION_PAUSE_MS;
    await new Promise(resolve=>setTimeout(resolve,duration));
   }
  }
  return true;
 }
 async function send(action){if(!current||busy)return;busy=true;clearError();
  const epoch=playbackEpoch;
  try{
   const result=await api('action',{method:'POST',body:JSON.stringify({revision:current.revision,command:action})});
   if(epoch!==playbackEpoch)return;
   const beforePrizes=current?.view?.players?.map(p=>p.prizeCount);
   preview.hide();selectedHand=null;targetMode=null;decisionSelection.clear();
   if(!await playCpuPlayback(result,epoch))return;
   checkCloudCheckpoint(result);
   // Let a final knockout reaction appear before returning to the RPG map.
   const prizes=current.view.players;
   const finalKo=rpgMode&&current.view.over&&beforePrizes&&prizes.some((p,i)=>typeof beforePrizes[i]==='number'&&p.prizeCount<beforePrizes[i]);
   if(finalKo)setTimeout(notifyRpg,3000);else notifyRpg();
  }catch(e){if(epoch===playbackEpoch)fail(e);}
  finally{if(epoch===playbackEpoch){busy=false;render();}}
 }
 async function start(){if(cubeRoomCode||cubeSoloMode)return false;if(busy)return;busy=true;$('startupError').textContent='';try{
  let pendingDecks=null;
  if(rpgMode&&rpgDuelId){
   try{pendingDecks=window.parent?.NeoRpgOverworldBridge?.pendingDuelDecks?.(rpgDuelId)||null;}catch{}
  }
  const readCampaignDeck=(key,slot)=>{
   let raw=rpgDuelId?sessionStorage.getItem(key+ rpgDuelId):null;
   let parsed=null;try{parsed=raw?JSON.parse(raw):null}catch{}
   if(Array.isArray(parsed)&&parsed.length===60)return raw;
   const fallback=pendingDecks?.[slot];
   if(Array.isArray(fallback)&&fallback.length===60){raw=JSON.stringify(fallback);sessionStorage.setItem(key+rpgDuelId,raw);return raw;}
   return raw;
  };
  let partnerCards=rpgMode&&rpgDuelId?readCampaignDeck('neoRpgNpcDeck:','opponentDeck'):null;
  const playerDeckRaw=rpgMode&&rpgDuelId?readCampaignDeck('neoRpgDeck:','playerDeck'):null;
  if(rpgMode&&$('deck').value==='custom'){
   let cards=null;try{cards=playerDeckRaw?JSON.parse(playerDeckRaw):null}catch{}
   if(!Array.isArray(cards)||cards.length!==60)throw Error('Your campaign deck could not be recovered. Return to the overworld and retry the duel.');
  }
  if(partnerCards){let cards=null;try{cards=JSON.parse(partnerCards)}catch{}if(!Array.isArray(cards)||cards.length!==60)partnerCards=null;}
  const response=await api('create',{method:'POST',body:JSON.stringify({
   deck:$('deck').value,opponent:$('opponent').value,
    ...(!rpgMode&&!cubeRoomCode?{difficulty:Number($('cpuDifficulty').value),advancedTactics:Number($('cpuDifficulty').value)>=6}:{}),
   ...(rpgMode&&rpgDuelId?{rpgDuelId,npcDeckId:rpgNpc,npcDeckTier:Number(rpgParams.get('npcTier'))||1,npcDeckVariant:Number(rpgParams.get('npcVariant'))||0,prizeCount:Number(rpgParams.get('prizes'))===6?6:4}:{}),
   ...($('deck').value==='custom'?{customDeck:JSON.parse(rpgMode?playerDeckRaw||'null':localStorage.getItem('neoCampusCustomGymDeck')||'null')}:{}),
   ...(partnerCards?{customOpponentDeck:JSON.parse(partnerCards)}:{})
  })});
  const players=response?.view?.players;
  if(rpgMode&&(!Array.isArray(players)||players.length!==2||players.some(p=>!Number.isFinite(p.deckCount)||p.deckCount<0||!Number.isFinite(p.handCount)||!Number.isFinite(p.prizeCount)||p.deckCount+p.handCount+p.prizeCount<=0)))
   throw Error('The duel opened without both decks. Your campaign is intact; return to the overworld and retry.');
  feedback.reset();opponentActivity.clear();combat.reset();reactions?.reset();npcChat?.reset();token=response.token;sessionStorage.setItem(rpgKey,token);current=response;
  checkCloudCheckpoint(response);
  selectedHand=null;targetMode=null;decisionSelection.clear();handVisible=true;powersOpen=false;logOpen=false;lastCoinSeq=null;lastKoMessage="";setHandVisible(true);render();
 }catch(e){$('startupError').textContent=e.message;return false;}finally{busy=false;}return true;}

 function setHandVisible(){
  // Hand is permanently visible for players; an empty/private hand stays empty.
  handVisible=true;
  const fan=$('handFan');
  if(current?.view)renderHandFan(current.view.players[0]?.hand);
  else fan.classList.add('hidden');
 }
 function setPowersOpen(open){powersOpen=!!open;$('powerDrawer').classList.toggle('hidden',!powersOpen);$('powersToggle').setAttribute('aria-expanded',String(powersOpen));}
 function setLogOpen(open){logOpen=!!open;$('logDrawer').classList.toggle('hidden',!logOpen);$('logToggle').setAttribute('aria-expanded',String(logOpen));}
  function renderHandFan(ids){shared.renderHandFan({root:$('handFan'),ids,visible:handVisible,phase:current.view.phase,selectedHand,targetMode,makeCard:handCard,getCard:card,viewportWidth:window.innerWidth});}
  function pendingPrizeChoice(){const d=current?.view?.pendingDecision;return d?.kind==='prize-card'&&d.actor===0?d:null;}
 function choosePrize(id){const d=pendingPrizeChoice();if(!d||busy||!d.options?.some(o=>o.id===id))return;send(command('choose',{decisionId:d.id,selected:[id]}));}
 function renderFaceUpPrizes(){shared.renderFaceUpPrizes({rail:$('prizeRail'),view:current?.view,me:0,getCard:card});}
  function renderPrizes(){shared.renderPrizeRail({rail:$('prizeRail'),decision:pendingPrizeChoice(),busy,button:btn,choose:choosePrize});}
  function renderPrizeFallback(){shared.renderPrizeFallback({container:$('prizeChoicePanel'),decision:pendingPrizeChoice(),busy,button:btn,choose:choosePrize});}
  function openDiscard(owner){const u=current?.view?.players?.[owner];if(!u)return;$('pileTitle').textContent=(owner===0?'You':'Classic CPU')+' — discard pile ('+u.discard.length+')';
  const root=$('pileCards');root.replaceChildren();if(!u.discard.length)root.textContent='Discard pile is empty.';
  for(const id of u.discard){const c=card(id),b=btn('',()=>preview.inspect(id),'pile-card'),src=picture(id);if(src){const img=document.createElement('img');img.src=src;img.alt='';b.append(img);}const n=document.createElement('span');n.textContent=c.name;b.append(n);root.append(b);} $('pileModal').classList.remove('hidden');
 }
 function renderCoin(view){const flips=view.coinFlips||[];
  if(lastCoinSeq===null){lastCoinSeq=flips.at(-1)?.seq||0;return;}
  const news=flips.filter(x=>x.seq>lastCoinSeq);if(news.length){lastCoinSeq=news.at(-1).seq;coinQueue.push(...news.slice(-12));pumpCoin();}
 }
 function pumpCoin(){if(coinTimer||!coinQueue.length)return;const f=coinQueue.shift(),el=$('coinFx');el.textContent='🪙 '+String(f.result).toUpperCase();el.classList.remove('hidden','coin-animate');void el.offsetWidth;el.classList.add('coin-animate');coinTimer=setTimeout(()=>{el.classList.add('hidden');coinTimer=null;pumpCoin();},800);}
 function renderCPULog(view){
  window.NeoMatchLog.render({list:$('actionTimeline'),activity:current?.activity,messages:view.messages,
   getCard:card,opponent:document.getElementById('opponentLabel')?.textContent||'Opponent'});
 }

 function renderKnockOut(view){const messages=view.messages||[];const relevant=messages.filter(x=>/Knocked Out|wins by forfeit|wins!/i.test(x));const latest=relevant.at(-1)||'';
  if(!lastKoMessage){lastKoMessage=latest;return;}
  if(latest&&latest!==lastKoMessage){const el=$('koFx');el.textContent='💥 '+latest;el.classList.remove('hidden');clearTimeout(el._dismiss);el._dismiss=setTimeout(()=>el.classList.add('hidden'),2400);lastKoMessage=latest;}
 }

 function clearChoiceUi(){
  const box=$('decisionBox'),dock=$('choiceDock');if(box.parentElement!==dock)dock.append(box);
  $('choiceModal').classList.add('hidden');$('choiceModal').setAttribute('aria-hidden','true');
  $('fieldChoiceBar').classList.add('hidden');modalDecisionId=null;lastFieldDecisionId=null;
 }
 function newDuel(){
  // Cube sessions belong to an authoritative tournament. Never open the
  // Single Match deck lobby or create a new untracked duel from here.
  if(cubeRoomCode||cubeSoloMode){location.assign(cubeRoomCode?'/cube_room.html?room='+encodeURIComponent(cubeRoomCode):'/cube.html');return;}
  npcChat?.reset();toggleNpcChat(false);playbackEpoch++;busy=false;clearChoiceUi();opponentActivity.clear();combat.reset();reactions?.reset();feedback.reset();preview.hide();token=null;current=null;selectedHand=null;targetMode=null;handVisible=true;powersOpen=false;logOpen=false;setLogOpen(false);document.body.classList.remove('duel-active','cpu-match');sessionStorage.removeItem(rpgKey);setHandVisible(true);render();}
 function setTarget(type,payload,title,benchOnly=false){preview.hide();targetMode={type,payload,title,benchOnly};render();}
 function cancelTarget(){targetMode=null;selectedHand=null;preview.hide();render();}
 function pokemonNode(u,side,slot){
  const b=document.createElement('button');b.className='poke'+(u.damage>=Number(card(u.id).hp)?' broken':'');
  const c=card(u.id),src=picture(u.id);
  b.classList.add(...[feedback.unitClass(side===0?0:1,slot)].filter(Boolean));
  b.innerHTML=shared.pokemonFace({unit:u,card:c,source:src,energyStack:unit=>quick.energyStack(unit,card),vitals:ux.vitals});
  b.setAttribute('aria-label',(side===0?'Your ':'Opponent ')+c.name);
  preview.attach(b,u.id,u);
  const decisionTargets=fieldDecision(),decision=current.view.pendingDecision;
  const fieldOption=decisionTargets?.find(x=>x.side===(side===0?0:1)&&x.slot===slot);
  if(decisionTargets){
   if(fieldOption){
    b.classList.add('legal','decision-target');b.title='Choose '+c.name;
    if(decisionSelection.has(fieldOption.id))b.classList.add('chosen');
    b.setAttribute('aria-pressed',String(decisionSelection.has(fieldOption.id)));
    b.addEventListener('click',()=>chooseFieldOption(fieldOption.id));
   }else{b.classList.add('ineligible');b.addEventListener('click',()=>preview.inspect(u.id,u));}
  }else if(side===0&&targetMode&&(!targetMode.benchOnly||slot>=0)){
   if(quick.legalTarget(targetMode.type,card(targetMode.payload?.handIndex===undefined?u.id:current.view.players[0].hand[targetMode.payload.handIndex]),u,card,slot,{round:current.view.round,turnSerial:current.turnSerial})){
    b.classList.add('legal');b.addEventListener('click',()=>send(command(targetMode.type,{...targetMode.payload,slot})));
   }else{b.classList.add('ineligible');b.addEventListener('click',()=>preview.inspect(u.id,u));}
  }else if(side===0&&current.view.phase==='setup'){
   b.title='Return this Pokémon to your hand';b.addEventListener('click',()=>send(command('setup_undo',{slot})));
  }else{b.addEventListener('click',()=>preview.inspect(u.id,u));}
  return b;
 }
 function showInfo(c,u){$('decisionTitle').textContent=c.name;
  $('decisionText').textContent=[`HP ${c.hp??'-'} · ${c.types?.join('/')||c.supertype}`,u?`Damage ${u.damage||0} · Attached Energy ${u.energies.map(id=>card(id).name).join(', ')||'none'}`:'',...(c.attacks||[]).map(a=>`${a.name} — ${a.damage||'effect'}: ${a.text||''}`),...(c.abilities||[]).map(a=>`${a.name}: ${a.text||''}`)].filter(Boolean).join(' · ');
 }
 function setZone(elementId,team,slot){shared.renderZone({root:$(elementId),team,active:slot===-1,createPokemon:(unit,index)=>pokemonNode(unit,team===current.view.players[0]?0:1,index)});}
 function handCard(id,index,setup){const c=card(id),b=document.createElement('button'),src=picture(id);
  b.className='handcard'+(selectedHand===index?' selected':'');
  b.innerHTML=shared.handCardFace({card:c,source:src,handType:ux.handType(c)});
  b.setAttribute('aria-label',`${c.name} · ${c.supertype}`);
  preview.attach(b,id);
  b.addEventListener('click',()=>{
   const v=current.view;
   const intent=shared.handIntent({card:c,index,setup,setupConfirmed:!!current.view.mulliganBonus&&current.view.mulliganBonus.drawn===null,
    canAct:v.phase==='game'&&v.turn===0&&!v.pendingDecision&&!v.over,
    energyUsed:!!current.you?.energyUsed,selectedHand,targetMode});
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
  const v=current.view,us=v.players[0],idx=selectedHand;
  if(idx===null||idx>=us.hand.length)return;
  el.append(btn('Inspect selected card',()=>preview.inspect(us.hand[idx])));
 }
 function renderDecisions(){const v=current.view,el=$('decisionBox'),title=$('decisionTitle'),description=$('decisionText'),opts=$('decisionOptions'),acts=$('decisionActions');
  const d=v.pendingDecision,field=fieldDecision(),prizeChoice=!!pendingPrizeChoice();
  const bonusChoice=v.phase==='setup'&&v.mulliganBonus?.side===0&&v.mulliganBonus.drawn===null;
  const showModal=!!((d&&d.actor===0&&!field&&!targetMode&&!prizeChoice)||bonusChoice);
  const destination=showModal?$('choiceModalContent'):$('choiceDock');
  if(el.parentElement!==destination)destination.append(el);
  $('choiceModal').classList.toggle('hidden',!showModal);
  $('choiceModal').setAttribute('aria-hidden',String(!showModal));
  $('fieldChoiceBar').replaceChildren();$('fieldChoiceBar').classList.add('hidden');
  if(showModal&&modalDecisionId!==(d?.id||'mulligan-bonus')){modalDecisionId=d?.id||'mulligan-bonus';$('choiceModalContent').focus({preventScroll:true});}
  if(!showModal)modalDecisionId=null;
  if(!field)lastFieldDecisionId=null;

  // Once bonus cards have been drawn, free the battlefield for Benching.
  const bonusPrompt=!!(v.mulliganBonus?.side===0&&v.mulliganBonus.drawn===null);
  el.classList.toggle('hidden',!d&&!targetMode&&!v.over&&(v.phase==='game'||v.phase==='setup')&&!bonusPrompt);
  opts.textContent='';acts.textContent='';el.classList.remove('active');
  if(targetMode){el.classList.add('active');title.textContent=targetMode.title;
   description.textContent='Click an eligible Pokémon in your Active or Bench area to complete this action.';
   acts.append(btn('Cancel selection (Esc)',cancelTarget,'cancel-target'));return;}
  if(d&&d.actor===0){el.classList.add('active');title.textContent=d.label||'Your decision';
   if(prizeChoice){title.textContent='Choose a Prize';description.textContent='Tap a highlighted Prize, or choose the number above the board.';const bar=$('fieldChoiceBar');bar.classList.remove('hidden');bar.textContent='🎁 Knock Out — choose your Prize';return;}
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

   description.textContent=`Choose ${d.min===d.max?d.min:`${d.min}–${d.max}`} option(s) · ${decisionSelection.size}/${d.max} selected. ${d.optional?'You may decline.':'This choice is mandatory.'}`;
   if((d.label||'').startsWith('Maintenance:'))
    description.textContent=`Select 2 other cards (${decisionSelection.size}/2). They return to your deck; Maintenance is discarded and you draw 1 card.`;
   if(d.kind==='arrange')description.textContent='Select cards in order: #1 will be on TOP of your deck and drawn next. Tap an already selected card to remove it.';
   if(/^New Pokédex:/.test(d.label||''))description.textContent=d.label+'. The card you choose now goes in this numbered draw position.';
   const choices=document.createElement('div');choices.className='choice-list';
   (d.displayDeck||d.options).forEach(item=>{
    const row=document.createElement('label'),input=document.createElement('input');input.type=d.max===1?'radio':'checkbox';input.name=d.id;input.value=item.id;input.checked=decisionSelection.has(item.id);
    if(item.eligible===false){input.disabled=true;row.classList.add('choice-ineligible');row.title='This card cannot be chosen for this effect';}
    row.classList.add('illustrated-choice');
    // Selection options keep their authoritative IDs; art is presentation only.
    const candidate=item.cardId?cards.get(item.cardId):null;
    const src=candidate?.images?.small;
    if(typeof src==='string'&&/^https:\/\//.test(src)){
     const art=document.createElement('img');art.className='choice-card-art';art.src=src;art.alt=candidate.name||'';art.loading='lazy';row.append(art);
    }
    input.addEventListener('change',()=>{
     if(d.max===1)decisionSelection.clear();
     if(input.checked&&decisionSelection.size<d.max)decisionSelection.add(item.id);
     else if(!input.checked)decisionSelection.delete(item.id);
     // Once the allowed number is reached, ignore further checks rather
     // than building an invalid choice that silently disables confirmation.
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
  }else if(d){title.textContent='CPU is choosing';description.textContent='Waiting for the CPU to resolve its choice.';}
  else if(v.over){title.textContent='DUEL COMPLETE';description.textContent=current.winner===0?'You won!':current.winner===1?'The CPU won.':'A draw!';acts.append(btn(rpgMode?'Returning to Neo Harbor…':(cubeRoomCode||cubeSoloMode)?'Return to Cube tournament':'Play another duel',rpgMode?()=>{}:newDuel,'primary',rpgMode));}
  else if(v.phase==='setup'&&v.mulliganBonus){
   const bonus=v.mulliganBonus;
   title.textContent='MULLIGAN BONUS';
   if(bonus.side!==0){description.textContent='The CPU is resolving its mulligan bonus.';}
   else if(bonus.drawn===null){
    description.textContent=`Your opponent took ${bonus.max} more mulligan(s). Choose up to ${bonus.max} bonus cards to draw before the duel begins.`;
    const select=document.createElement('select');select.setAttribute('aria-label','Mulligan bonus cards');
    for(let i=0;i<=bonus.max;i++){const opt=document.createElement('option');opt.value=String(i);opt.textContent=`${i} bonus card${i===1?'':'s'}`;select.append(opt);}
    select.value=String(bonus.max);
    acts.append(select,btn('Draw selected cards',()=>send(command('setup_bonus_draw',{count:Number(select.value)})),'primary'));
    acts.append(btn('Skip bonus draw',()=>send(command('setup_bonus_draw',{count:0}))));
   }else{
    description.textContent=`You drew ${bonus.drawn} bonus card(s). You may Bench additional Basic Pokémon, then begin the duel. Your Active is locked.`;
    acts.append(btn('Start duel',()=>send(command('setup_bonus_done')),'primary'));
   }
  }
  else if(v.phase==='setup'){
   title.textContent='OPENING SETUP';description.textContent='Select a Basic Pokémon from your opening hand to become Active. You may select up to five more for your Bench, then confirm. Your opponent’s team remains hidden until setup ends.';
   // The setup confirmation action is in the regular turn controls, not a floating decision popup.
  }else{title.textContent='YOUR NEXT MOVE';description.textContent='Click a Trainer or Basic Pokémon to play it. Select Energy or Evolution, then click a highlighted Pokémon. Use the attack buttons beside your Active Pokémon.';}
 }
 function render(){returnToCubeWhenDone();const has=Boolean(current);document.body.classList.toggle('duel-active',has);document.body.classList.toggle('cpu-match',has);$('lobby').classList.toggle('hidden',has);$('duel').classList.toggle('hidden',!has);if(!has)return;
  feedback.update(current,0);opponentActivity.update(current,0,opponentName);
  const v=current.view,you=v.players[0],cpu=v.players[1],yourTurn=v.turn===0&&!v.over;
  document.querySelector('.stage').classList.toggle('your-turn',yourTurn&&v.phase==='game'&&!v.pendingDecision);

  quick.drawPrizes($('prizeRail'),you.prizeCount,cpu.prizeCount,'CPU');renderPrizes();renderFaceUpPrizes();renderPrizeFallback();renderCoin(v);renderKnockOut(v);
  $('turnChip').textContent='TURN '+(current.turnSerial+1);
  $('stadiumText').textContent=v.stadium?`Stadium: ${card(v.stadium.id).name}`:'';
  if(['neo4-99','neo3-61','neo4-95','neo4-100','gym2-122'].includes(v.stadium?.id)&&v.phase==='game'&&yourTurn&&!v.pendingDecision){
   const saffron=v.stadium.id==='gym2-122';
   const eligible=saffron&&[you.active,...you.bench].some(p=>p&&card(p.id).name.startsWith("Sabrina's ")&&p.energies.some(id=>/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(card(id).name)));
   const disabled=saffron?!eligible:!!current.you.stadiumUsed;
   $('stadiumText').append(btn(disabled?' • '+(saffron?'No eligible Energy':'Used this turn'):' ↻ Use Stadium',()=>send(command('use_stadium')),'subtle',disabled));
  }
  $('oppStats').textContent=`Hand ${cpu.handCount} · Deck ${cpu.deckCount} · Discard ${cpu.discard.length}`;
  $('myStats').textContent=`Hand ${you.handCount} · Deck ${you.deckCount} · Discard ${you.discard.length}`;
  $('myDeckCount').querySelector('b').textContent=you.deckCount;$('oppDeckCount').querySelector('b').textContent=cpu.deckCount;
  $('myDiscardBtn').querySelector('b').textContent=you.discard.length;$('oppDiscardBtn').querySelector('b').textContent=cpu.discard.length;
  ux.renderGuide($('turnCoach'),{view:v,me:0,energyUsed:current.you.energyUsed,targetMode,card});
  setZone('enemyActive',cpu,-1);setZone('enemyBench',cpu,0);setZone('myActive',you,-1);setZone('myBench',you,0);
  shared.renderStadium({mine:$('myStadium'),theirs:$('enemyStadium'),stadium:v.stadium,me:0,getCard:card,picture,onInspect:id=>preview.inspect(id),onHover:(element,id)=>preview.attach(element,id)});
  renderHandFan(you.hand);$('hand').textContent='';you.hand.forEach((id,i)=>$('hand').append(handCard(id,i,v.phase==='setup')));
  renderHandActions();$('attacks').textContent='';$('powers').textContent='';
  const attackEnabled=v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision&&!busy;
  shared.renderAttacks({root:$('attacks'),unit:you.active,view:v,me:0,getCard:card,enabled:attackEnabled,button:btn,onAttack:index=>send(command('attack',{attackIndex:index})),attackReason:presentation.attackReason});
  $('mobileAttacksToggle').disabled=!you.active||v.over||v.phase!=='game';
  if(v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision&&you.active){
   [you.active,...you.bench].forEach((u,i)=>{if(u?.secretPlanFaceDown){$('powers').append(btn(`🎴 Reveal Secret Plan (${i===0?'Active':'Bench '+i})`,()=>send(command('reveal_secret',{slot:i-1}))));return;}const c=card(u.id);(c.abilities||[]).forEach(a=>{if(a.name)$('powers').append(btn(`✦ ${a.name} (${i===0?'Active':'Bench '+i})`,()=>send(command('use_power',{slot:i-1}))));});});
  }
  const actionsDisabled=busy||!yourTurn||v.phase!=='game'||!!v.pendingDecision||v.over;
  $('retreatBtn').disabled=actionsDisabled||!you.bench.length;
  $('retreatBtn').title=actionsDisabled?'Retreat on your turn after resolving any choices.':!you.bench.length?'You need a Benched Pokémon to retreat.':'Choose a Benched Pokémon to replace your Active Pokémon.';
  $('undoBtn').disabled=busy||!current.undo?.available;
  $('undoBtn').title=current.undo?.available?'Undo '+current.undo.label:'Available only before random actions, drawing cards, or turn changes';
  const openingSetup=v.phase==='setup'&&!v.over;
  const bonus=v.mulliganBonus;
  $('endBtn').textContent=openingSetup?(bonus?(bonus.side===0&&bonus.drawn!==null?'✓ Start duel':'Choose bonus cards'):(you.active?'✓ Confirm setup':'Choose Active first')):'End turn →';
  $('endBtn').title=openingSetup?(bonus?'Resolve the mulligan bonus, then finish setup.':'Choose your Active Pokémon, optionally add up to five Benched Pokémon, then confirm to begin.'):'End your turn';
  $('endBtn').disabled=openingSetup?(bonus?(busy||bonus.side!==0||bonus.drawn===null):(busy||!you.active||!!v.pendingDecision)):actionsDisabled;
  $('concedeBtn').disabled=v.over||v.phase!=='game'||!yourTurn;
  $('history').textContent='';(v.messages||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;$('history').append(li);});
  renderDecisions();combat.update(current);reactions?.update(current);renderCPULog(v);
 }
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
   const data=await api('decks');for(const id of ['deck','opponent']){
    $(id).textContent='';for(const x of data.decks.filter(row=>id!=='opponent'||row.id!=='custom')){const option=document.createElement('option');option.value=x.id;option.textContent=x.name;$(id).append(option);}}
   $('opponent').value='brushfire';
   if(localStorage.getItem('neoCampusCustomGymDeck'))$('deck').value='custom';
   await Promise.all(['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4'].map(async set=>{const r=await fetch(`/cards/${set}.json`);if(!r.ok)throw Error(`Cannot load ${set}`);const arr=await r.json();for(const c of arr)cards.set(c.id,c);}));
   document.body.classList.toggle('rpg-duel',rpgMode);
   if(rpgMode)$('opponentLabel').textContent=opponentName;
   if(reactions)fetch('/rpg-assets/reactions/manifest.json').then(r=>r.ok?r.json():null).then(m=>reactions.setManifest(m)).catch(()=>{});
  if(rpgMode&&!rpgDuelId)throw Error('Open RPG duels from Neo Harbor.');
  if(rpgMode){
     const params=new URLSearchParams(location.search);
     $('deck').value=params.get('deck')||'blackout';
     $('opponent').value=params.get('opponent')||'brushfire';
   }
   token=sessionStorage.getItem(rpgKey);if(token){try{current=await api('state');checkCloudCheckpoint(current);}catch{token=null;sessionStorage.removeItem(rpgKey);}}
   if(rpgMode&&!current){
    // Restore exact duel state after a reload, Render restart or device switch.
    // A network/auth error must never silently create a different duel.
    if(await rpgAccessToken()){
     try{
      const restored=await api('rpg/resume',{method:'POST',body:JSON.stringify({duelId:rpgDuelId})});
      token=restored.token;current=restored;sessionStorage.setItem(rpgKey,token);
      checkCloudCheckpoint(restored);
     }catch(error){if(error.status!==404)throw error;}
    }
    if(!current&&!await start())throw Error($('startupError').textContent||'The duel could not start.');
   }
   if(cubeSoloMode&&!current)throw Error('This Cube match has expired. Return to the Cube tournament to reopen it.');
    if(cubeRoomCode&&!current)throw Error('This Cube match has expired. Return to the tournament to reopen it.');
   notifyRpg();
   render();
   notifyRpgReady();
   settleBoot();
  }catch(e){$('startupError').textContent=e.message||String(e);settleBoot(e);}
 }
 $('rpgChatToggle').addEventListener('click',()=>toggleNpcChat(!npcChatOpen));$('closeRpgChat').addEventListener('click',()=>toggleNpcChat(false));
 $('newDuel').addEventListener('click',start);$('reset').addEventListener('click',newDuel);
 window.addEventListener('resize',()=>{if(current?.view)renderHandFan(current.view.players[0]?.hand);});
 $('closeHand').addEventListener('click',()=>$('handTray').classList.add('hidden'));
 $('powersToggle').addEventListener('click',()=>setPowersOpen(!powersOpen));$('closePowers').addEventListener('click',()=>setPowersOpen(false));
 $('logToggle').addEventListener('click',()=>setLogOpen(!logOpen));$('closeLog').addEventListener('click',()=>setLogOpen(false));
 $('myDiscardBtn').addEventListener('click',()=>openDiscard(0));$('oppDiscardBtn').addEventListener('click',()=>openDiscard(1));
 $('closePile').addEventListener('click',()=>$('pileModal').classList.add('hidden'));$('pileModal').addEventListener('click',e=>{if(e.target===$('pileModal'))$('pileModal').classList.add('hidden');});
 $('undoBtn').addEventListener('click',()=>send(command('undo')));
 $('endBtn').addEventListener('click',()=>{
  if(!current||busy)return;
  if(current.view.phase==='setup'){
   const bonus=current.view.mulliganBonus;
   if(bonus){if(bonus.side===0&&bonus.drawn!==null)send(command('setup_bonus_done'));}
   else if(current.view.players[0]?.active&&!current.view.pendingDecision)send(command('setup_confirm'));
  }else if(current.view.phase==='game')send(command('end_turn'));
 });
 $('retreatBtn').addEventListener('click',()=>setTarget('retreat',{},'Choose Benched replacement',true));
 $('concedeBtn').addEventListener('click',()=>{if(confirm('Concede this duel?'))send(command('concede'));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=current?.view?.pendingDecision;if(d?.cancelable&&!busy){e.preventDefault();send(command('cancel_choice',{decisionId:d.id}));return;}if(targetMode){e.preventDefault();cancelTarget();}else if(powersOpen)setPowersOpen(false);else if(logOpen)setLogOpen(false);else $('pileModal').classList.add('hidden');}});
 init();
})();
