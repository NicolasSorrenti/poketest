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

 const rpgParams=new URLSearchParams(location.search),rpgMode=rpgParams.get('rpg')==='1',rpgDuelId=rpgParams.get('duelId');
 const rpgKey=rpgMode&&rpgDuelId?window.NeoRpgDuelBridge.sessionKey(rpgDuelId):'neoClassicLiveToken';
 const rpgNpc=rpgMode?rpgParams.get('npc'):null;
 const reactions=rpgMode&&rpgNpc?window.NeoRpgMatchReactions.makeExperience({element:$('npcReaction'),npcId:rpgNpc,npcName:rpgParams.get('npcName')||'Opponent'}):null;
 function notifyRpg(){if(rpgMode&&rpgDuelId&&current?.view?.over&&(current.winner===null||current.winner===0||current.winner===1))window.parent.postMessage(window.NeoRpgDuelBridge.message(rpgDuelId,current.winner),location.origin);}
 const cards=new Map();
 const quick=window.NeoDuelUI;
 const ux=window.NeoExperienceUI;
 const presentation=window.NeoBattlePresentation;
 const preview=quick.makePreview($('cardPreview'),id=>card(id));
 const feedback=quick.makeDuelFeedback($('duelFeedback'));
 const combat=presentation.makeBattlePresentation({stage:document.querySelector('.stage'),popup:$('combatFx'),timeline:$('actionTimeline'),getCard:id=>cards.get(id)||{name:String(id)},me:()=>0,opponentName:()=>'Classic CPU'});
 const opponentActivity=quick.makeOpponentActivity({status:$('opponentActivityStatus'),overlay:$('opponentActionFx'),arena:document.querySelector('.stage'),getCard:id=>cards.get(id)||{name:String(id)},suppressCombat:true});
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let modalDecisionId=null,lastFieldDecisionId=null;
 let token=null,current=null,selectedHand=null,targetMode=null,busy=false,decisionSelection=new Set();
 let handVisible=true,powersOpen=false,logOpen=false,lastCoinSeq=null,coinQueue=[],coinTimer=null,lastKoMessage="";
 const command=(type,payload={})=>({type,payload});
 async function api(path,opts={}){
  const headers={'Content-Type':'application/json',...(token?{'X-Duel-Token':token}:{})};
  const r=await fetch('/api/classic/'+path,{...opts,headers});const body=await r.json();
  if(!r.ok)throw Error(body.error||'Could not contact Classic engine');return body;
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
 async function send(action){if(!current||busy)return;busy=true;clearError();try{
  const result=await api('action',{method:'POST',body:JSON.stringify({revision:current.revision,command:action})});
  const beforePrizes=current?.view?.players?.map(p=>p.prizeCount);preview.hide();current=result;
  
  selectedHand=null;targetMode=null;decisionSelection.clear();render();
  // Let a final knockout reaction appear before returning to the RPG map.
  const prizes=current.view.players;
  const finalKo=rpgMode&&current.view.over&&beforePrizes&&prizes.some((p,i)=>typeof beforePrizes[i]==='number'&&p.prizeCount<beforePrizes[i]);
  if(finalKo)setTimeout(notifyRpg,1900);else notifyRpg();
 }catch(e){fail(e);}finally{busy=false;render();}}
 async function start(){if(busy)return;busy=true;$('startupError').textContent='';try{
  const partnerCards=rpgMode&&rpgDuelId?sessionStorage.getItem('neoRpgNpcDeck:'+rpgDuelId):null;
  const response=await api('create',{method:'POST',body:JSON.stringify({
   deck:$('deck').value,opponent:$('opponent').value,
   ...($('deck').value==='custom'?{customDeck:JSON.parse(rpgMode?sessionStorage.getItem('neoRpgDeck:'+rpgDuelId)||'null':localStorage.getItem('neoCampusCustomGymDeck')||'null')}:{}),
   ...(partnerCards?{customOpponentDeck:JSON.parse(partnerCards)}:{})
  })});
  feedback.reset();opponentActivity.clear();combat.reset();reactions?.reset();token=response.token;sessionStorage.setItem(rpgKey,token);current=response;
  selectedHand=null;targetMode=null;decisionSelection.clear();handVisible=true;powersOpen=false;logOpen=false;lastCoinSeq=null;lastKoMessage="";setHandVisible(true);render();
 }catch(e){$('startupError').textContent=e.message;}finally{busy=false;}}

 function setHandVisible(visible){
  handVisible=!!visible;
  const fan=$('handFan'),toggle=$('handToggle');
  fan.classList.toggle('hidden',!handVisible||!fan.querySelector('.hand-fan-card'));
  toggle.setAttribute('aria-expanded',String(handVisible));
  toggle.setAttribute('aria-label',handVisible?'Hide hand':'Show hand');
  toggle.setAttribute('aria-pressed',String(!handVisible));
  $('handVisibilityIcon').textContent=handVisible?'▾':'▴';
  $('handVisibilityText').textContent=handVisible?'Hide hand':'Show hand';
 }
 function setPowersOpen(open){powersOpen=!!open;$('powerDrawer').classList.toggle('hidden',!powersOpen);$('powersToggle').setAttribute('aria-expanded',String(powersOpen));}
 function setLogOpen(open){logOpen=!!open;$('logDrawer').classList.toggle('hidden',!logOpen);$('logToggle').setAttribute('aria-expanded',String(logOpen));}
 function renderHandPeek(ids){const root=$('handPeek');root.replaceChildren();
  if(!ids?.length){const t=document.createElement('span');t.className='hand-peek-empty';t.textContent='Empty';root.append(t);return;}
  for(const [i,id] of ids.slice(0,3).entries()){const c=document.createElement('span');c.className='peek-card peek-card-'+i;const src=picture(id);if(src){const img=document.createElement('img');img.src=src;img.alt='';c.append(img);}else c.textContent='🎴';root.append(c);}
 }

 function renderHandFan(ids){
  const root=$('handFan'),cards=Array.isArray(ids)?ids:[];
  // The permanent fan uses the exact same click/preview handlers as the list hand.
  // Every card is rendered; long hands scroll instead of silently hiding cards.
  const oldScroll=root.scrollLeft;
  root.replaceChildren();root.classList.toggle('hidden',!handVisible||!cards.length);
  if(!cards.length)return;
  const compact=window.innerWidth<780;
  const cardWidth=compact?72:100;
  const available=Math.max(190,root.clientWidth||window.innerWidth*.48);
  const minStep=compact?38:52,maxStep=compact?48:68;
  const gap=Math.min(maxStep,Math.max(minStep,(available-cardWidth-24)/Math.max(1,cards.length-1)));
  const width=Math.max(available,Math.ceil(gap*(cards.length-1)+cardWidth+24));
  const track=document.createElement('div');track.className='hand-fan-track';track.style.width=width+'px';
  const middle=(cards.length-1)/2,setup=current.view.phase==='setup';
  cards.forEach((id,i)=>{
   const el=handCard(id,i,setup);
   el.type='button';
   el.classList.remove('handcard');el.classList.add('hand-fan-card');
   el.style.setProperty('--fan-x',(i*gap).toFixed(1)+'px');
   if(targetMode&&selectedHand!==null&&selectedHand!==i)el.classList.add('hand-inactive');
   el.style.setProperty('--fan-y',(Math.abs(i-middle)*2.6).toFixed(1)+'px');
   el.style.setProperty('--fan-angle',(Math.max(-22,Math.min(22,(i-middle)*4.5))).toFixed(1)+'deg');
   el.style.zIndex=String(i+1);
   el.title=card(id).name+' — click to play or select';
   track.append(el);
  });
  root.append(track);root.scrollLeft=oldScroll;
 }
 function pendingPrizeChoice(){const d=current?.view?.pendingDecision;return d?.kind==='prize-card'&&d.actor===0?d:null;}
 function choosePrize(id){const d=pendingPrizeChoice();if(!d||busy||!d.options?.some(o=>o.id===id))return;send(command('choose',{decisionId:d.id,selected:[id]}));}
 function renderFaceUpPrizes(){
  const v=current?.view;if(!v)return;
  const groups=$('prizeRail').querySelectorAll('.prize-group');
  for(let owner=0;owner<2;owner++){
   const grid=groups[1-owner]?.querySelector('.prize-grid');if(!grid)continue;
   for(const {index,id} of v.players[owner]?.revealedPrizes||[]){
    const el=grid.children[index];if(!el||!id)continue;
    const name=card(id).name;
    el.classList.add('prize-face-up');el.title='Face-up Prize: '+name;el.setAttribute('aria-label','Face-up Prize '+(index+1)+': '+name);el.textContent=name;
    el.style.fontSize='10px';el.style.overflow='hidden';el.style.overflowWrap='anywhere';
   }
  }
 }
 function renderPrizes(){const d=pendingPrizeChoice();if(!d)return;
  const section=$('prizeRail').querySelectorAll('.prize-group')[1];const grid=section?.querySelector('.prize-grid');if(!grid)return;
  section.classList.add('prize-awaiting');grid.replaceChildren();grid.setAttribute('aria-label','Choose your Prize');
  const choices=new Map((d.options||[]).map(o=>[Number(/^prize:(\d+)$/.exec(o.id)?.[1]),o]));
  for(let i=0;i<6;i++){const opt=choices.get(i);if(!opt){const empty=document.createElement('span');empty.className='prize-back prize-taken';grid.append(empty);continue;}
   const b=btn(String(i+1),()=>choosePrize(opt.id),'prize-back prize-select',busy);b.title='Take Prize '+(i+1);grid.append(b);}
 }
 function renderPrizeFallback(){const d=pendingPrizeChoice(),box=$('prizeChoicePanel');box.replaceChildren();box.classList.toggle('hidden',!d);if(!d)return;
  const title=document.createElement('strong');title.textContent='🎁 Choose a Prize';const info=document.createElement('span');info.textContent='Select a highlighted Prize or a number here';
  const choices=document.createElement('div');choices.className='prize-choices';for(const o of d.options||[]){const n=Number(/^prize:(\d+)$/.exec(o.id)?.[1]);choices.append(btn('🎴 '+(n+1),()=>choosePrize(o.id),'prize-option',busy));}box.append(title,info,choices);
 }
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
  const list=$('actionTimeline');list.replaceChildren();
  const lines=(view.messages||[]).slice(0,45);
  if(!lines.length){const empty=document.createElement('li');empty.className='timeline-empty';empty.textContent='Match events will appear here.';list.append(empty);return;}
  for(const text of lines){const row=document.createElement('li');row.className='timeline-entry rule';const icon=document.createElement('span');icon.className='timeline-icon';icon.textContent=/Coin flip/i.test(text)?'🪙':/Knocked Out|wins!/i.test(text)?'💥':/damage|attack|used /i.test(text)?'⚔':'•';const msg=document.createElement('span');msg.textContent=text;row.append(icon,msg);list.append(row);}
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
 function newDuel(){clearChoiceUi();opponentActivity.clear();combat.reset();reactions?.reset();feedback.reset();preview.hide();token=null;current=null;selectedHand=null;targetMode=null;handVisible=true;powersOpen=false;logOpen=false;document.body.classList.remove('duel-active','cpu-match');sessionStorage.removeItem(rpgKey);setHandVisible(true);render();}
 function setTarget(type,payload,title,benchOnly=false){preview.hide();targetMode={type,payload,title,benchOnly};render();}
 function cancelTarget(){targetMode=null;selectedHand=null;preview.hide();render();}
 function pokemonNode(u,side,slot){
  const b=document.createElement('button');b.className='poke'+(u.damage>=Number(card(u.id).hp)?' broken':'');
  const c=card(u.id),src=picture(u.id);
  b.classList.add(...[feedback.unitClass(side===0?0:1,slot)].filter(Boolean));
  b.innerHTML=quick.energyStack(u,card)+`<span class="pokemon-face">`+(src?`<img loading="lazy" alt="" src="${esc(src)}">`:`<div class="empty">${esc(c.name)}</div>`)+`</span>`+
   `<strong>${esc(c.name)}</strong>`+ux.vitals(u,c)+`<span class="stats">${u.energies.length} energy attached</span>`;
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
 function setZone(elementId,team,slot){const el=$(elementId);el.textContent='';if(slot===-1){
  if(team.active)el.append(pokemonNode(team.active,team===current.view.players[0]?0:1,-1));else el.innerHTML='<div class="empty">Not selected</div>';
 }else{if(!team.bench.length)el.innerHTML='<div class="empty">Empty Bench</div>';
  team.bench.forEach((u,i)=>el.append(pokemonNode(u,team===current.view.players[0]?0:1,i)));}}
 function handCard(id,index,setup){const c=card(id),b=document.createElement('button'),src=picture(id);
  b.className='handcard'+(selectedHand===index?' selected':'');
  b.innerHTML=(src?`<img loading="lazy" alt="" src="${esc(src)}">`:'')+`<strong>${esc(c.name)}</strong><span class="handcard-type">${esc(ux.handType(c))}</span>`;
  b.setAttribute('aria-label',`${c.name} · ${c.supertype}`);
  preview.attach(b,id);
  b.addEventListener('click',()=>{
   if(setup){if(c.supertype==='Pokémon'&&c.subtypes?.includes('Basic'))send(command('setup_select',{handIndex:index}));else preview.inspect(id);return;}
   const v=current.view, canAct=v.phase==='game'&&v.turn===0&&!v.pendingDecision&&!v.over;
   if(!canAct){preview.inspect(id);return;}
   if(c.supertype==='Energy'&&current.you.energyUsed){fail(new Error('You have already attached an Energy this turn.'));return;}
   if(c.supertype==='Trainer'){preview.hide();send(command('play_trainer',{handIndex:index}));return;}
   if(c.supertype==='Pokémon'&&c.subtypes?.includes('Basic')){preview.hide();send(command('bench',{handIndex:index}));return;}
   // Clicking Energy or an Evolution immediately enters target-selection mode.
   if((c.supertype==='Energy'||(c.supertype==='Pokémon'&&c.evolvesFrom))){
    if(selectedHand===index&&targetMode){cancelTarget();return;}
    selectedHand=index;
    preview.hide();
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
  const v=current.view,us=v.players[0],idx=selectedHand;
  if(idx===null||idx>=us.hand.length)return;
  el.append(btn('Inspect selected card',()=>preview.inspect(us.hand[idx])));
 }
 function renderDecisions(){const v=current.view,el=$('decisionBox'),title=$('decisionTitle'),description=$('decisionText'),opts=$('decisionOptions'),acts=$('decisionActions');
  const d=v.pendingDecision,field=fieldDecision(),prizeChoice=!!pendingPrizeChoice(),showModal=!!(d&&d.actor===0&&!field&&!targetMode&&!prizeChoice);
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
    return;
   }

   description.textContent=`Choose ${d.min===d.max?d.min:`${d.min}–${d.max}`} option(s). ${d.optional?'You may decline.':'This choice is mandatory.'}`;
   const choices=document.createElement('div');choices.className='choice-list';
   d.options.forEach(item=>{
    const row=document.createElement('label'),input=document.createElement('input');input.type=d.max===1?'radio':'checkbox';input.name=d.id;input.value=item.id;input.checked=decisionSelection.has(item.id);
    row.classList.add('illustrated-choice');
    // Selection options keep their authoritative IDs; art is presentation only.
    const candidate=item.cardId?card(item.cardId):[...cards.values()].find(c=>c.name===item.label||item.label?.endsWith(': '+c.name)||item.label?.startsWith(c.name+' ('));
    const src=candidate?.images?.small;
    if(typeof src==='string'&&/^https:\/\//.test(src)){
     const art=document.createElement('img');art.className='choice-card-art';art.src=src;art.alt=candidate.name||'';art.loading='lazy';row.append(art);
    }
    input.addEventListener('change',()=>{
     if(d.max===1)decisionSelection.clear();if(input.checked)decisionSelection.add(item.id);else decisionSelection.delete(item.id);
     renderDecisions();});row.append(input,document.createTextNode(item.label));choices.append(row);
   });opts.append(choices);
   acts.append(btn('Confirm selection',()=>send(command('choose',{decisionId:d.id,selected:[...decisionSelection]})),'primary',decisionSelection.size<d.min||decisionSelection.size>d.max));
   if(d.optional)acts.append(btn('Decline',()=>send(command('choose',{decisionId:d.id,decline:true}))));
  }else if(d){title.textContent='CPU is choosing';description.textContent='Waiting for the CPU to resolve its choice.';}
  else if(v.over){title.textContent='DUEL COMPLETE';description.textContent=current.winner===0?'You won!':current.winner===1?'The CPU won.':'A draw!';acts.append(btn(rpgMode?'Returning to Neo Harbor…':'Play another duel',rpgMode?()=>{}:newDuel,'primary',rpgMode));}
  else if(v.phase==='setup'){
   title.textContent='OPENING SETUP';description.textContent='Select a Basic Pokémon from your opening hand to become Active. You may select up to five more for your Bench, then confirm. Your opponent’s team remains hidden until setup ends.';
   acts.append(btn('Confirm opening setup',()=>send(command('setup_confirm')),'primary',!v.players[0].active));
  }else{title.textContent='YOUR NEXT MOVE';description.textContent='Click a Trainer or Basic Pokémon to play it. Select Energy or Evolution, then click a highlighted Pokémon. Use the attack buttons beside your Active Pokémon.';}
 }
 function render(){returnToCubeWhenDone();const has=Boolean(current);document.body.classList.toggle('duel-active',has);document.body.classList.toggle('cpu-match',has);$('lobby').classList.toggle('hidden',has);$('duel').classList.toggle('hidden',!has);if(!has)return;
  feedback.update(current,0);opponentActivity.update(current,0,'Classic CPU');
  const v=current.view,you=v.players[0],cpu=v.players[1],yourTurn=v.turn===0&&!v.over;
  document.querySelector('.stage').classList.toggle('your-turn',yourTurn&&v.phase==='game'&&!v.pendingDecision);
  $('phaseText').textContent=v.over?'DUEL COMPLETE':v.phase==='setup'?'Opening setup':yourTurn?'Your turn':'CPU turn';
  quick.drawPrizes($('prizeRail'),you.prizeCount,cpu.prizeCount,'CPU');renderPrizes();renderFaceUpPrizes();renderPrizeFallback();renderCoin(v);renderKnockOut(v);
  $('turnChip').textContent='TURN '+(current.turnSerial+1);$('scoreline').textContent=`Your Prizes ${you.prizeCount} · CPU Prizes ${cpu.prizeCount}`;
  $('stadiumText').textContent=v.stadium?`Stadium: ${card(v.stadium.id).name}`:'';
  if(['neo4-99','neo3-61','neo4-95','neo4-100'].includes(v.stadium?.id)&&v.phase==='game'&&yourTurn&&!v.pendingDecision){
   $('stadiumText').append(btn(current.you.stadiumUsed?' • Used this turn':' ↻ Use Stadium',()=>send(command('use_stadium')),'subtle',!!current.you.stadiumUsed));
  }
  $('oppStats').textContent=`Hand ${cpu.handCount} · Deck ${cpu.deckCount} · Discard ${cpu.discard.length}`;
  $('myStats').textContent=`Hand ${you.handCount} · Deck ${you.deckCount} · Discard ${you.discard.length}`;
  $('energyStatus').textContent=current.you.energyUsed?'Energy attached this turn':'Energy attachment available';
  $('myDeckCount').querySelector('b').textContent=you.deckCount;$('oppDeckCount').querySelector('b').textContent=cpu.deckCount;
  $('myDiscardBtn').querySelector('b').textContent=you.discard.length;$('oppDiscardBtn').querySelector('b').textContent=cpu.discard.length;
  ux.renderGuide($('turnCoach'),{view:v,me:0,energyUsed:current.you.energyUsed,targetMode,card});
  setZone('enemyActive',cpu,-1);setZone('enemyBench',cpu,0);setZone('myActive',you,-1);setZone('myBench',you,0);
  $('handAmount').textContent=`(${you.hand.length})`;renderHandPeek(you.hand);renderHandFan(you.hand);$('hand').textContent='';you.hand.forEach((id,i)=>$('hand').append(handCard(id,i,v.phase==='setup')));
  renderHandActions();$('attacks').textContent='';$('powers').textContent='';
  if(you.active){
   const active=card(you.active.id);
   const attackEnabled=v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision;
   (you.active.effectiveAttacks||active.attacks||[]).forEach((a,i)=>{
    const b=btn('',()=>send(command('attack',{attackIndex:i})),'attack-action',!attackEnabled);
    const energy=(a.cost||[]).map(t=>`<span class="energy-pip energy-${esc(String(t).toLowerCase())}">${esc(String(t)[0])}</span>`).join('');
    b.innerHTML=`<span class="attack-name">${esc(a.name)}</span><span class="attack-cost">${energy||'<small>FREE</small>'}</span><strong class="attack-damage">${esc(a.damage||'—')}</strong>${a.text?`<span class="attack-effect">${esc(a.text)}</span>`:''}`;
    b.title=a.text||a.name;b.setAttribute('aria-label',`${a.name}, cost ${(a.cost||[]).join(', ')||'free'}, damage ${a.damage||'effect'}`);
    const reason=presentation.attackReason({view:v,me:0,attack:a,unit:you.active,getCard:card});
   if(reason){b.title=reason;if(!attackEnabled)b.setAttribute('aria-disabled','true');const why=document.createElement('span');why.className='attack-warning';why.textContent=reason;b.append(why);}
   $('attacks').append(b);
   });
  }else $('attacks').innerHTML='<span class="hint">Choose an Active Pokémon</span>';
  if(v.phase==='game'&&!v.over&&yourTurn&&!v.pendingDecision&&you.active){
   [you.active,...you.bench].forEach((u,i)=>{if(u?.secretPlanFaceDown){$('powers').append(btn(`🎴 Reveal Secret Plan (${i===0?'Active':'Bench '+i})`,()=>send(command('reveal_secret',{slot:i-1}))));return;}const c=card(u.id);(c.abilities||[]).forEach(a=>{if(a.name)$('powers').append(btn(`✦ ${a.name} (${i===0?'Active':'Bench '+i})`,()=>send(command('use_power',{slot:i-1}))));});});
  }
  const actionsDisabled=!yourTurn||v.phase!=='game'||!!v.pendingDecision||v.over;
  $('retreatBtn').disabled=actionsDisabled||!you.bench.length;
  $('retreatBtn').title=actionsDisabled?'Retreat on your turn after resolving any choices.':!you.bench.length?'You need a Benched Pokémon to retreat.':'Choose a Benched Pokémon to replace your Active Pokémon.';
  $('undoBtn').disabled=busy||!current.undo?.available;
  $('undoBtn').title=current.undo?.available?'Undo '+current.undo.label:'Available only before random actions, drawing cards, or turn changes';
  $('endBtn').disabled=actionsDisabled;
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
   if(reactions)fetch('/rpg-assets/reactions/manifest.json').then(r=>r.ok?r.json():null).then(m=>reactions.setManifest(m)).catch(()=>{});
  if(rpgMode&&!rpgDuelId)throw Error('Open RPG duels from Neo Harbor.');
  if(rpgMode){
     const params=new URLSearchParams(location.search);
     $('deck').value=params.get('deck')||'blackout';
     $('opponent').value=params.get('opponent')||'brushfire';
   }
   token=sessionStorage.getItem(rpgKey);if(token){try{current=await api('state');}catch{token=null;sessionStorage.removeItem(rpgKey);}}
   if(rpgMode && !current) await start();
   notifyRpg();
   render();
  }catch(e){$('startupError').textContent=e.message||String(e);}
 }
 $('newDuel').addEventListener('click',start);$('reset').addEventListener('click',newDuel);
 window.addEventListener('resize',()=>{if(current?.view)renderHandFan(current.view.players[0]?.hand);});
 $('handToggle').addEventListener('click',()=>setHandVisible(!handVisible));$('closeHand').addEventListener('click',()=>setHandVisible(false));
 $('powersToggle').addEventListener('click',()=>setPowersOpen(!powersOpen));$('closePowers').addEventListener('click',()=>setPowersOpen(false));
 $('logToggle').addEventListener('click',()=>setLogOpen(!logOpen));$('closeLog').addEventListener('click',()=>setLogOpen(false));
 $('myDiscardBtn').addEventListener('click',()=>openDiscard(0));$('oppDiscardBtn').addEventListener('click',()=>openDiscard(1));
 $('closePile').addEventListener('click',()=>$('pileModal').classList.add('hidden'));$('pileModal').addEventListener('click',e=>{if(e.target===$('pileModal'))$('pileModal').classList.add('hidden');});
 $('undoBtn').addEventListener('click',()=>send(command('undo')));
 $('endBtn').addEventListener('click',()=>send(command('end_turn')));
 $('retreatBtn').addEventListener('click',()=>setTarget('retreat',{},'Choose Benched replacement',true));
 $('concedeBtn').addEventListener('click',()=>{if(confirm('Concede this duel?'))send(command('concede'));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(targetMode){e.preventDefault();cancelTarget();}else if(handVisible)setHandVisible(false);else if(powersOpen)setPowersOpen(false);else if(logOpen)setLogOpen(false);else $('pileModal').classList.add('hidden');}});
 init();
})();
