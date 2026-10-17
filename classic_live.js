'use strict';
// This page NEVER calculates damage, pays costs or applies card effects.
// Every button sends a typed command to the same server-side Classic reducer.
(()=>{
 const $=id=>document.getElementById(id);
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
  preview.hide();current=result;selectedHand=null;targetMode=null;decisionSelection.clear();render();
 }catch(e){fail(e);}finally{busy=false;}}
 async function start(){if(busy)return;busy=true;$('startupError').textContent='';try{
  const response=await api('create',{method:'POST',body:JSON.stringify({deck:$('deck').value,opponent:$('opponent').value,...($('deck').value==='custom'?{customDeck:JSON.parse(localStorage.getItem('neoCampusCustomGymDeck')||'null')}: {})})});
  feedback.reset();opponentActivity.clear();combat.reset();token=response.token;sessionStorage.setItem('neoClassicLiveToken',token);current=response;
  selectedHand=null;targetMode=null;decisionSelection.clear();render();
 }catch(e){$('startupError').textContent=e.message;}finally{busy=false;}}
 function clearChoiceUi(){
  const box=$('decisionBox'),dock=$('choiceDock');if(box.parentElement!==dock)dock.append(box);
  $('choiceModal').classList.add('hidden');$('choiceModal').setAttribute('aria-hidden','true');
  $('fieldChoiceBar').classList.add('hidden');modalDecisionId=null;lastFieldDecisionId=null;
 }
 function newDuel(){clearChoiceUi();opponentActivity.clear();combat.reset();feedback.reset();preview.hide();token=null;current=null;selectedHand=null;targetMode=null;sessionStorage.removeItem('neoClassicLiveToken');render();}
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
  const d=v.pendingDecision,field=fieldDecision(),showModal=!!(d&&d.actor===0&&!field&&!targetMode);
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
  }else if(d){title.textContent='CPU is choosing';description.textContent='Waiting for the CPU to resolve its choice.';}
  else if(v.over){title.textContent='DUEL COMPLETE';description.textContent=current.winner===0?'You won!':current.winner===1?'The CPU won.':'A draw!';acts.append(btn('Play another duel',newDuel,'primary'));}
  else if(v.phase==='setup'){
   title.textContent='OPENING SETUP';description.textContent='Select a Basic Pokémon from your opening hand to become Active. You may select up to five more for your Bench, then confirm. Your opponent’s team remains hidden until setup ends.';
   acts.append(btn('Confirm opening setup',()=>send(command('setup_confirm')),'primary',!v.players[0].active));
  }else{title.textContent='YOUR NEXT MOVE';description.textContent='Click a Trainer or Basic Pokémon to play it. Select Energy or Evolution, then click a highlighted Pokémon. Use the attack buttons beside your Active Pokémon.';}
 }
 function render(){const has=Boolean(current);$('lobby').classList.toggle('hidden',has);$('duel').classList.toggle('hidden',!has);if(!has)return;
  feedback.update(current,0);opponentActivity.update(current,0,'Classic CPU');
  const v=current.view,you=v.players[0],cpu=v.players[1],yourTurn=v.turn===0&&!v.over;
  document.querySelector('.stage').classList.toggle('your-turn',yourTurn&&v.phase==='game'&&!v.pendingDecision);
  $('phaseText').textContent=v.over?'DUEL COMPLETE':v.phase==='setup'?'Opening setup':yourTurn?'Your turn':'CPU turn';
  quick.drawPrizes($('prizeRail'),you.prizeCount,cpu.prizeCount,'CPU');
  $('turnChip').textContent='TURN '+(current.turnSerial+1);$('scoreline').textContent=`Your Prizes ${you.prizeCount} · CPU Prizes ${cpu.prizeCount}`;
  $('stadiumText').textContent=v.stadium?`Stadium: ${card(v.stadium.id).name}`:'';
  if(v.stadium?.id==='neo4-99'&&v.phase==='game'&&yourTurn&&!v.pendingDecision){
   $('stadiumText').append(btn(' ↻ Use Stadium',()=>send(command('use_stadium')),'subtle'));
  }
  $('oppStats').textContent=`Hand ${cpu.handCount} · Deck ${cpu.deckCount} · Discard ${cpu.discard.length}`;
  $('myStats').textContent=`Hand ${you.handCount} · Deck ${you.deckCount} · Discard ${you.discard.length}`;
  $('energyStatus').textContent=current.you.energyUsed?'Energy attached this turn':'Energy attachment available';
  ux.renderGuide($('turnCoach'),{view:v,me:0,energyUsed:current.you.energyUsed,targetMode,card});
  setZone('enemyActive',cpu,-1);setZone('enemyBench',cpu,0);setZone('myActive',you,-1);setZone('myBench',you,0);
  $('handAmount').textContent=`(${you.hand.length})`;$('hand').textContent='';you.hand.forEach((id,i)=>$('hand').append(handCard(id,i,v.phase==='setup')));
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
   [you.active,...you.bench].forEach((u,i)=>{const c=card(u.id);(c.abilities||[]).forEach(a=>{if(a.name)$('powers').append(btn(`✦ ${a.name} (${i===0?'Active':'Bench '+i})`,()=>send(command('use_power',{slot:i-1}))));});});
  }
  const actionsDisabled=!yourTurn||v.phase!=='game'||!!v.pendingDecision||v.over;
  $('retreatBtn').disabled=actionsDisabled||!you.bench.length;
  $('retreatBtn').title=actionsDisabled?'Retreat on your turn after resolving any choices.':!you.bench.length?'You need a Benched Pokémon to retreat.':'Choose a Benched Pokémon to replace your Active Pokémon.';
  $('endBtn').disabled=actionsDisabled;
  $('concedeBtn').disabled=v.over||v.phase!=='game'||!yourTurn;
  $('history').textContent='';(v.messages||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;$('history').append(li);});
  renderDecisions();combat.update(current);
 }
 async function init(){
  try{
   const data=await api('decks');for(const id of ['deck','opponent']){
    $(id).textContent='';for(const x of data.decks.filter(row=>id!=='opponent'||row.id!=='custom')){const option=document.createElement('option');option.value=x.id;option.textContent=x.name;$(id).append(option);}}
   $('opponent').value='brushfire';
   if(localStorage.getItem('neoCampusCustomGymDeck'))$('deck').value='custom';
   await Promise.all(['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4'].map(async set=>{const r=await fetch(`/cards/${set}.json`);if(!r.ok)throw Error(`Cannot load ${set}`);const arr=await r.json();for(const c of arr)cards.set(c.id,c);}));
   token=sessionStorage.getItem('neoClassicLiveToken');if(token){try{current=await api('state');}catch{token=null;sessionStorage.removeItem('neoClassicLiveToken');}}
   render();
  }catch(e){$('startupError').textContent=e.message||String(e);}
 }
 $('newDuel').addEventListener('click',start);$('reset').addEventListener('click',newDuel);
 $('endBtn').addEventListener('click',()=>send(command('end_turn')));
 $('retreatBtn').addEventListener('click',()=>setTarget('retreat',{},'Choose Benched replacement',true));
 $('concedeBtn').addEventListener('click',()=>{if(confirm('Concede this duel?'))send(command('concede'));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&targetMode){e.preventDefault();cancelTarget();}});
 init();
})();
