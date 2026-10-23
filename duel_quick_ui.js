'use strict';
// Shared presentation/selection helpers for authoritative CPU and online clients.
// They never change the game state: all effects must go through the server reducer.
(function(root){
 const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const slots=team=>[-1,...(team?.bench||[]).map((_,i)=>i)];
 const rules=typeof module!=='undefined'&&module.exports?require('./core_rules'):root.NeoCoreRules;
 function legalTarget(action, cardData, unit, getCard, slot, context={}){
  if(!unit)return false;
  if(action==='retreat')return slot>=0;
  if(action==='attach_energy')return true; // server enforces turn and card-specific attachments
  if(action==='evolve'){
   const compatible=rules.canEvolve(cardData,getCard(unit.id));
   const beforeTurn=typeof context.round==='number'&&unit.playedTurn>=context.round;
   const override=!!(context.turnSerial!==undefined&&unit.giovanniEvolveUntil>context.turnSerial&&String(cardData.name||'').startsWith("Giovanni's "));
   return compatible&&(!beforeTurn||override);
  }
  return false;
 }
 function prizeSection(label,remaining){
  const section=document.createElement('section');section.className='prize-group';
  const title=document.createElement('h3');title.textContent=label;
  const badge=document.createElement('span');badge.className='prize-count';badge.textContent=`${Math.max(0,Number(remaining)||0)} left`;
  section.append(title,badge);
  const stack=document.createElement('div');stack.className='prize-grid';
  const count=Math.max(0,Math.min(6,Number(remaining)||0));
  for(let i=0;i<6;i++){
   const back=document.createElement('span');back.className='prize-back'+(i>=count?' prize-taken':'');
   back.title=i<count?'Face-down Prize card':'Prize card taken';
   back.setAttribute('aria-hidden','true');stack.append(back);
  }
  stack.setAttribute('role','img');stack.setAttribute('aria-label',`${count} of 6 Prize cards remaining`);
  section.append(stack);return section;
 }
 function drawPrizes(node,ownCount,opponentCount,opponentName='OPPONENT'){
  if(!node)return;node.textContent='';
  // The opponent's prizes belong opposite their half (top), yours opposite yours (bottom).
  node.append(prizeSection(`${opponentName} PRIZES`,opponentCount),prizeSection('YOUR PRIZES',ownCount));
 }
 function energyStack(unit,getCard){
  // All authoritative duel modes (CPU, RPG, online and Cube) use this same
  // miniature-card stack. The actual card art slides out from underneath the
  // left edge of each Pokémon, like physical attached Energy cards.
  const ids=Array.isArray(unit?.energies)?unit.energies:[];
  const tools=Array.isArray(unit?.attachedTrainers)?unit.attachedTrainers:[];
  const toolCards=tools.map(t=>getCard(typeof t==='string'?t:t?.id)||{name:'Attached Trainer'});
  const toolNames=toolCards.map(c=>String(c.name||'Attached Trainer'));
  const toolLimit=3;
  const visibleTools=toolCards.slice(0,toolLimit);
  const toolOver=Math.max(0,toolCards.length-visibleTools.length);
  const toolBadges=toolCards.length?`<span class="pokemon-tools tool-card-stack" title="${html(toolNames.join(', '))}" aria-label="${toolCards.length} attached Trainers: ${html(toolNames.join(', '))}">${visibleTools.map((c,i)=>{
   const name=String(c.name||'Attached Trainer'),url=c.images?.small;
   const art=typeof url==='string'&&/^https:\/\//.test(url)
    ?`<img class="tool-card-art" src="${html(url)}" alt="" loading="lazy">`
    :`<span class="tool-card-fallback">TRAINER<span>${html(name)}</span></span>`;
   return `<span class="pokemon-tool-card" title="${html(name)}" style="--tool-position:${i}">${art}</span>`;
  }).join('')}${toolOver?`<span class="tool-overflow" aria-label="${toolOver} more attached Trainers">+${toolOver}</span>`:''}</span>`:'';
  if(!ids.length)return toolBadges;
  const cards=ids.map(id=>getCard(id)||{});
  const shown=cards.slice(0,4),over=Math.max(0,cards.length-shown.length);
  const types={
   Grass:['grass','G','GRS'],Fire:['fire','F','FIR'],Water:['water','W','WAT'],
   Lightning:['lightning','L','LGT'],Psychic:['psychic','P','PSY'],Fighting:['fighting','F','FGT'],
   Colorless:['colorless','C','COL'],Darkness:['darkness','D','DRK'],Metal:['metal','M','MTL'],
   Rainbow:['rainbow','R','RNB'],Miracle:['rainbow','M','MIR'],Recycle:['recycle','R','RCY'],
   'Double Colorless':['colorless','2','DCE'],Potion:['special','+','PTN'],
   'Full Heal':['special','+','FHL']
  };
  const minis=shown.map((c,i)=>{
   const name=String(c.name||'Unknown Energy');
   const key=name.replace(/ Energy$/,'');
   const [type,symbol,short]=types[key]||['special',key[0]||'?',(key.slice(0,3)||'ENG').toUpperCase()];
   const url=c.images?.small;
   const art=typeof url==='string'&&/^https:\/\//.test(url)
    ?`<img class="energy-card-art" src="${html(url)}" alt="" loading="lazy">`
    :`<span class="energy-card-fallback"><span class="energy-symbol">${html(symbol)}</span><span class="energy-label">${html(short)}</span></span>`;
   return `<span class="attached-energy energy-card-mini energy-type-${type}" title="${html(name)}" style="--energy-position:${i}">${art}</span>`;
  }).join('');
  const names=cards.map(c=>String(c.name||'Unknown Energy')).join(', ');
  return `<span class="energy-peeks energy-card-stack" title="${html(names)}" aria-label="${cards.length} attached Energy: ${html(names)}">${minis}${over?`<span class="energy-overflow">+${over}</span>`:''}</span>${toolBadges}`;
 }
 function makeDuelFeedback(el,getCard=()=>({})){
  let last=null,removeTimer=null,changes=new Map();
  function reset(){last=null;changes.clear();if(removeTimer)clearTimeout(removeTimer);el.textContent='';el.classList.remove('show','turn-change');}
  function unitOf(view,index,slot){const p=view.players[index];return slot===-1?p?.active:p?.bench?.[slot];}
  function update(data,me=0){
   const v=data?.view;if(!v)return;
   changes=new Map();
   if(last&&v.phase==='game'&&last.view.phase==='game'&&data.revision!==last.revision){
    for(let who=0;who<2;who++)for(const slot of [-1,0,1,2,3,4]){
     const before=unitOf(last.view,who,slot),after=unitOf(v,who,slot);
     if(!after)continue;
     const key=`${who}:${slot}`;
     if(!before||before.id!==after.id)changes.set(key,'card-entered');
     else if(after.damage>before.damage)changes.set(key,'card-hit');
     else if((after.energies||[]).length>(before.energies||[]).length)changes.set(key,'card-powered');
    }
    // Hand changes are private: inspect only the local player's authorized view.
    // A multiset diff avoids replaying old cards or treating hand reordering as draws.
    const previousHand=last.view.players?.[me]?.hand||[];
    const nextHand=v.players?.[me]?.hand||[];
    const remaining=new Map();
    for(const id of previousHand)remaining.set(id,(remaining.get(id)||0)+1);
    const drawn=[];
    for(const id of nextHand){
     if(remaining.get(id)>0)remaining.set(id,remaining.get(id)-1);
     else if(typeof id==='string')drawn.push(id);
    }
    const knockedOut=[];
    for(let who=0;who<2;who++){
     const before=last.view.players?.[who],after=v.players?.[who];
     if(before?.active&&!after?.active)knockedOut.push((who===me?'Your ':'Opponent ')+(getCard(before.active.id)?.name||'Pokémon'));
    }
    let announcement='',turn=false;
    if(knockedOut.length)announcement=knockedOut.join(' and ')+' Knocked Out!';
    else if(drawn.length)announcement='You drew '+drawn.length+' card'+(drawn.length===1?'':'s');
    else if(v.turn!==last.view.turn){announcement=v.turn===me?'YOUR TURN':'OPPONENT TURN';turn=true;}
    else if(v.pendingDecision?.id&&v.pendingDecision.id!==last.view.pendingDecision?.id){announcement=v.pendingDecision.actor===me?'YOUR DECISION':'OPPONENT IS CHOOSING';}
    else{
     const older=new Set(last.view.messages||[]);
     announcement=(v.messages||[]).find(x=>!older.has(x))||((v.messages||[])[0]||'');
    }
    if(announcement){
     el.replaceChildren();
     const label=document.createElement('span');label.textContent=announcement;el.append(label);
     if(drawn.length&&!knockedOut.length){
      const cards=document.createElement('span');cards.className='draw-feedback-cards';
      for(const id of drawn.slice(0,5)){
       const c=getCard(id)||{},image=c.images?.small;
       const item=document.createElement('span');item.className='draw-feedback-card';
       if(typeof image==='string'&&/^https:\/\//.test(image)){
        const img=document.createElement('img');img.src=image;img.alt=c.name||'Drawn card';item.append(img);
       }else item.textContent=c.name||'Card';
       cards.append(item);
      }
      el.append(cards);
     }
     el.classList.remove('show','turn-change');void el.offsetWidth;
     el.classList.add('show');if(turn)el.classList.add('turn-change');
     if(removeTimer)clearTimeout(removeTimer);removeTimer=setTimeout(()=>el.classList.remove('show','turn-change'),3000);
    }
   }
   last={revision:data.revision,view:structuredClone(v)};
  }
  function unitClass(who,slot){return changes.get(`${who}:${slot}`)||'';}
  return {update,unitClass,reset};
 }
 // Display a brief, non-blocking warning without changing the match error state.
 function makeTransientToast(el,duration=2200){
  let timer=null;
  return message=>{
   if(!el)return;
   if(timer)clearTimeout(timer);
   el.textContent=String(message);
   el.classList.add('show');
   timer=setTimeout(()=>{
    el.classList.remove('show');
    el.textContent='';
    timer=null;
   },duration);
  };
 }
 // Stable names for public, ordered, server-certified actions. These are
 // presentation hints only: no hidden card or decision payloads are exposed.
 const ACTION_LOOK={
  play_trainer:{icon:'✦',kind:'trainer',verb:'played'},
  attach_energy:{icon:'⚡',kind:'energy',verb:'attached'},
  evolve:{icon:'✧',kind:'evolve',verb:'evolved into'},
  bench:{icon:'◆',kind:'bench',verb:'benched'},
  attack:{icon:'⚔',kind:'attack',verb:'attacked'},
  use_power:{icon:'✹',kind:'power',verb:'used a Pokémon Power'},
  use_stadium:{icon:'⌂',kind:'trainer',verb:'used a Stadium'},
  retreat:{icon:'⇄',kind:'switch',verb:'retreated'},
  undo:{icon:'↶',kind:'choice',verb:'undid their last move'},
  choose:{icon:'◈',kind:'choice',verb:'made a choice'},
  end_turn:{icon:'⏭',kind:'turn',verb:'ended their turn'},
  concede:{icon:'★',kind:'turn',verb:'conceded'},
  setup_select:{icon:'◆',kind:'bench',verb:'selected a starting Pokémon'},
  setup_undo:{icon:'◈',kind:'bench',verb:'adjusted their opening field'},
  setup_confirm:{icon:'✓',kind:'turn',verb:'confirmed their setup'}
 };
 function actionDescription(event,getCard,opponentName='Opponent'){
  const spec=ACTION_LOOK[event?.type]||{icon:'✦',kind:'choice',verb:'took an action'};
  const name=typeof event?.cardId==='string'?String(getCard(event.cardId)?.name||''):'';
  const label=typeof event?.label==='string'?event.label:'';
  let text=opponentName+' '+spec.verb;
  if(event.type==='attack')text=opponentName+' used '+(label||'an attack')+(name?' with '+name:'');
  else if(event.type==='use_power')text=opponentName+' used '+(label||'a Pokémon Power')+(name?' ('+name+')':'');
  else if(event.type==='undo')text=opponentName+' undid '+(label||'their last move');
  else if(event.type==='retreat')text=opponentName+' retreated'+(name?' '+name:'');
  else if(event.type==='use_stadium')text=opponentName+' used '+(name||'a Stadium');
  else if(name&&['play_trainer','attach_energy','evolve','bench'].includes(event.type))text+=' '+name;
  return {...spec,text,cardId:event.cardId||null};
 }
 function newActivitySince(activity,lastSeq){
  const all=Array.isArray(activity)?activity:[];
  const max=all.reduce((n,e)=>Number.isSafeInteger(e.seq)?Math.max(n,e.seq):n,0);
  return {seq:Math.max(lastSeq??0,max),newActions:lastSeq===null?[]:all.filter(e=>Number.isSafeInteger(e.seq)&&e.seq>lastSeq).sort((a,b)=>a.seq-b.seq)};
 }
 function makeOpponentActivity({status,overlay,arena,getCard,suppressCombat=false}){
  let lastSeq=null,timer=null,playing=false,queue=[],lastSummary='',lastStatus='';
  const reduced=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function clear(){if(timer)clearTimeout(timer);timer=null;lastSeq=null;playing=false;queue=[];lastSummary='';lastStatus='';overlay.textContent='';overlay.classList.add('hidden');status.textContent='';arena.classList.remove('opponent-thinking','opponent-action-flash');}
  function pump(name){
   if(playing||!queue.length)return;playing=true;
   const a=queue.shift(),detail=actionDescription(a,getCard,name);
   lastSummary=detail.text;lastStatus='';
   const subtitle=status.querySelector?.('.activity-subtitle');if(subtitle)subtitle.textContent=lastSummary;
   // Use DOM text nodes: a player's display name is never an HTML string.
   overlay.textContent='';const inner=document.createElement('div');inner.className='action-fx-card fx-'+detail.kind;
   const symbol=document.createElement('span');symbol.className='fx-symbol';symbol.textContent=detail.icon;inner.append(symbol);
   if(detail.cardId&&['trainer','evolve','energy','bench'].includes(detail.kind)){
    const url=getCard(detail.cardId)?.images?.small;
    if(typeof url==='string'&&/^https:\/\//.test(url)){const img=document.createElement('img');img.src=url;img.alt='';img.className='fx-card-art';inner.append(img);}
   }
   const text=document.createElement('strong');text.textContent=detail.text;inner.append(text);overlay.append(inner);
   overlay.classList.remove('hidden');arena.classList.remove('opponent-action-flash');
   if(!reduced()){void arena.offsetWidth;arena.classList.add('opponent-action-flash');}
   timer=setTimeout(()=>{overlay.classList.add('hidden');arena.classList.remove('opponent-action-flash');playing=false;timer=null;pump(name);},reduced()?200:1150);
  }
  function update(data,me=0,name='Opponent'){
   const v=data?.view;if(!v)return;
   const result=newActivitySince(data.activity,lastSeq);lastSeq=result.seq;
   const ours=result.newActions.filter(a=>a.side!==me&&(!suppressCombat||a.type!=='attack'&&a.type!=='evolve'));
   if(ours.length){queue.push(...ours);if(queue.length>14)queue=queue.slice(-14);pump(name);}
   const d=v.pendingDecision;const waiting=v.phase==='setup'||(v.phase==='game'&&!v.over&&(v.turn!==me||d?.actor!==undefined&&d.actor!==me));
   arena.classList.toggle('opponent-thinking',waiting);
   status.classList.toggle('waiting',waiting);status.classList.toggle('your-move',!waiting);
   const title=waiting?(d?.actor!==undefined&&d.actor!==me?name+' IS CHOOSING':v.phase==='setup'?name+' IS PREPARING':name+' IS PLAYING'):v.over?'DUEL COMPLETE':'YOUR MOVE';
   const note=waiting?(d?.actor!==undefined&&d.actor!==me?'Waiting for a card decision…':'Watch the field for their next action.'):'You can inspect the field while you plan your move.';
   const signature=title+'\u0000'+(lastSummary||note);
   if(lastStatus===signature)return;lastStatus=signature;
   status.textContent='';
   const dot=document.createElement('span');dot.className='activity-dot';dot.setAttribute('aria-hidden','true');
   const text=document.createElement('span');text.className='activity-title';text.textContent=title;
   const sub=document.createElement('span');sub.className='activity-subtitle';sub.textContent=lastSummary||note;
   status.append(dot,text,sub);
  }
  return {update,clear};
 }
 function makePreview(el,getCard){
  const panel=el;
  let pinned=false,shownId=null;
  function move(x,y){
   if(panel.classList.contains('hidden'))return;
   const w=panel.offsetWidth||300,h=panel.offsetHeight||450;
   const margin=12;
   panel.style.left=Math.max(margin,Math.min(window.innerWidth-w-margin,x+22))+'px';
   panel.style.top=Math.max(margin,Math.min(window.innerHeight-h-margin,y+16))+'px';
  }
  function paint(id,unit){
   const c=getCard(id);shownId=id;
   const src=c.images?.large||c.images?.small;
   const img=typeof src==='string'&&/^https:\/\//.test(src)?`<img class="preview-art" src="${html(src)}" alt="${html(c.name)} card artwork">`:'';
   const attachedEnergy=unit?.energies?.map(id=>getCard(id)?.name||String(id))||[];
   const attachedTools=unit?.attachedTrainers?.map(t=>getCard(typeof t==='string'?t:t?.id)?.name||'Attached Trainer')||[];
   const hp=Math.max(0,Number(c.hp)||0),remaining=Math.max(0,hp-Math.max(0,Number(unit?.damage)||0));
   const life=unit&&hp?'<div class="preview-life"><div class="preview-life-label"><strong>HP remaining</strong><span>'+remaining+' / '+hp+'</span></div><div class="preview-life-track" role="progressbar" aria-label="HP remaining" aria-valuemin="0" aria-valuemax="'+hp+'" aria-valuenow="'+remaining+'"><span style="width:'+Math.min(100,remaining/hp*100)+'%"></span></div></div>':'';
   const energySummary=unit?'<div class="preview-energy"><strong>Attached Energy: '+attachedEnergy.length+'</strong><span>'+html(attachedEnergy.join(', ')||'None')+'</span></div>':'';
   const extra=unit?`<p>Damage: ${html(unit.damage||0)} · ${attachedEnergy.length} attached Energy</p><p>Energy: ${html(attachedEnergy.join(', ')||'None')}</p><p>Attached Trainers: ${html(attachedTools.join(', ')||'None')}</p>`:'';
   const attacks=(c.attacks||[]).map(a=>`<div class="preview-effect"><strong>${html(a.name)}</strong> ${html((a.cost||[]).join(' / '))} ${html(a.damage||'')}<p>${html(a.text||'')}</p></div>`).join('');
   const powers=(c.abilities||[]).map(a=>`<div class="preview-effect"><strong>${html(a.name||'Pokémon Power')}</strong><p>${html(a.text||'')}</p></div>`).join('');
   panel.innerHTML=`<button type="button" class="preview-close" aria-label="Close card preview">×</button>${img}<div class="preview-data"><strong>${html(c.name)}</strong> <small>${html(c.hp?`${c.hp} HP`:(c.supertype||''))}</small>${life}${energySummary}${extra}${attacks}${powers}</div>`;
   panel.querySelector('.preview-close').addEventListener('click',hide);
   panel.classList.toggle('text-only',!img);
  }
  function show(id,unit,x,y,lock=false){pinned=lock;paint(id,unit);panel.classList.remove('hidden');panel.classList.toggle('pinned',lock);move(x??window.innerWidth/2,y??window.innerHeight/2);}
  function hide(){pinned=false;shownId=null;panel.classList.add('hidden');panel.classList.remove('pinned');}
  function attach(anchor,id,unit){
   anchor.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||pinned)return;show(id,unit,e.clientX,e.clientY);});
   anchor.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||pinned)return;if(shownId!==id)show(id,unit,e.clientX,e.clientY);else move(e.clientX,e.clientY);});
   anchor.addEventListener('pointerleave',()=>{if(!pinned)hide();});
   anchor.addEventListener('focus',()=>{if(!pinned){const r=anchor.getBoundingClientRect();show(id,unit,r.right,r.top);}});
   anchor.addEventListener('blur',()=>{if(!pinned)hide();});
  }
  panel.addEventListener('pointerleave',()=>{if(!pinned)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pinned)hide();});
  document.addEventListener('pointerdown',e=>{if(pinned&&!panel.contains(e.target))hide();});
  return {attach,inspect:(id,unit)=>show(id,unit,window.innerWidth/2-145,window.innerHeight/2-180,true),hide};
 }
 root.NeoDuelUI={legalTarget,drawPrizes,makePreview,energyStack,makeDuelFeedback,makeTransientToast,makeOpponentActivity,actionDescription,newActivitySince,slots};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NeoDuelUI;
})(typeof window==='undefined'?globalThis:window);
