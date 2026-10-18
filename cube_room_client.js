'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
 let code=null,token=null,state=null,busy=false,deck=[],deckInitialized=false,loading=false,presets=[];
 const storageKey='neoCampusCubeRoomV1';
 async function loadPresets(){
  try{
   const r=await fetch('/api/cube/presets');
   if(!r.ok)throw Error('Presets unavailable');
   presets=(await r.json()).presets||[];
   const selector=$('cubePreset'),previous=selector.value;
   selector.replaceChildren();
   for(const p of presets){
    const option=document.createElement('option');option.value=p.id;option.textContent=p.name;
    selector.append(option);
   }
   selector.value=presets.some(p=>p.id===previous)?previous:'balanced';
   showPreset();
  }catch{$('cubePresetInfo').textContent='Classic Balanced is available.';}
 }
 function showPreset(){
  const active=presets.find(p=>p.id===$('cubePreset').value);
  if(active)$('cubePresetInfo').textContent=active.description+' · '+active.archetypes.join(' / ');
 }
 const store=()=>sessionStorage.setItem(storageKey,JSON.stringify({code,token}));
 const say=msg=>{$('message').textContent=msg||'';};
 function cardArt(card){
  const image=document.createElement('img');
  image.alt=card.name+' Pokémon TCG card';image.loading='lazy';image.decoding='async';
  const urls=['/api/cube-card-image/'+encodeURIComponent(card.id)];
  const upstream=card.images?.small;
  if(typeof upstream==='string'&&/^https:\/\/assets\.tcgdex\.net\/en\//.test(upstream))urls.push(upstream);
  const match=/^((?:base[1-5]|basep|gym[12]|neo[1-4]))-(\d+)$/.exec(card.id);
  if(match)urls.push('https://images.pokemontcg.io/'+match[1]+'/'+Number(match[2])+'.png');
  let index=0;
  image.addEventListener('error',()=>{
   if(++index<urls.length){image.src=urls[index];return;}
   const fallback=document.createElement('div');fallback.className='card-art-fallback';
   fallback.textContent='Art unavailable';image.replaceWith(fallback);
  });
  image.src=urls[0];
  return image;
 }
 async function api(path,data){
  const response=await fetch('/api/cube-room/'+path,{
   method:data===undefined?'GET':'POST',
   headers:{...(data!==undefined?{'Content-Type':'application/json'}:{}),
    ...(token?{'X-Cube-Room-Token':token}:{}),
    ...(code?{'X-Cube-Room-Code':code}:{})},
   ...(data===undefined?{}:{body:JSON.stringify(data)})
  });
  const json=await response.json();
  if(!response.ok)throw Error(json.error||'Cube room request failed');
  return json;
 }
 async function act(task){
  if(busy)return;
  busy=true;say('');
  try{await task();}catch(e){say(e.message||String(e));}
  finally{busy=false;}
 }
 async function createOrJoin(isJoin){
  await act(async()=>{
   const name=$('playerName').value.trim()||'Player';
   const result=await api(isJoin?'join':'create',isJoin?{code:$('roomCode').value.toUpperCase().trim(),name}:{name,preset:$('cubePreset').value});
   code=result.code;token=result.token;state=result;deck=[];deckInitialized=false;
   store();render();
  });
 }
 function count(id){return deck.filter(x=>x===id).length;}
 function countName(name){
  const ids=new Set(state.drafted.filter(c=>c.name===name).map(c=>c.id));
  return [...ids].reduce((sum,id)=>sum+count(id),0);
 }
 function change(id,name,max,delta,energy){
  if(state.seats[state.seat].deckReady||busy)return;
  if(delta>0){
   if(deck.length>=40||count(id)>=max||(!energy&&countName(name)>=4))return;
   deck.push(id);
  }else{
   const i=deck.lastIndexOf(id);if(i<0)return;deck.splice(i,1);
  }
  renderBuild();
 }
 function row(name,id,max,energy=false){
  const surface=document.createElement('div');surface.className='buildrow';
  const label=document.createElement('span');label.textContent=name;surface.append(label);
  const controls=document.createElement('div');
  const minus=document.createElement('button');minus.type='button';minus.textContent='−';
  minus.disabled=count(id)===0;minus.onclick=()=>change(id,name,max,-1,energy);
  const amount=document.createElement('strong');amount.textContent=String(count(id))+(energy?'':'/'+max);
  const plus=document.createElement('button');plus.type='button';plus.textContent='+';
  plus.disabled=count(id)>=max||deck.length>=40||(!energy&&countName(name)>=4);
  plus.onclick=()=>change(id,name,max,1,energy);
  controls.append(minus,amount,plus);surface.append(controls);return surface;
 }
 function renderBuild(){
  if(!state||!state.finished)return;
  const mine=state.seats[state.seat];
  if(!deckInitialized){
   deck=[...(state.ownDeck||state.suggestedDeck||[])];
   deckInitialized=true;
  }
  const choices=new Map();
  for(const card of state.drafted){
   const previous=choices.get(card.id);
   if(previous)previous.n++;
   else choices.set(card.id,{card,n:1});
  }
  $('buildChoices').replaceChildren();
  for(const {card,n} of [...choices.values()].sort((a,b)=>a.card.name.localeCompare(b.card.name)))
   $('buildChoices').append(row(card.name,card.id,n));
  $('energyChoices').replaceChildren();
  for(const type of TYPES){
   $('energyChoices').append(row(type+' Energy',state.energyIds[type],40,true));
  }
  const summary=new Map();
  for(const id of deck){
   const name=state.drafted.find(c=>c.id===id)?.name||
    TYPES.find(t=>state.energyIds[t]===id)+' Energy';
   summary.set(name,(summary.get(name)||0)+1);
  }
  $('builtCards').replaceChildren();
  for(const [name,n] of [...summary].sort((a,b)=>a[0].localeCompare(b[0]))){
   const line=document.createElement('div');
   line.textContent=n+' × '+name;$('builtCards').append(line);
  }
  const basics=deck.filter(id=>state.drafted.some(c=>c.id===id&&c.subtypes.includes('Basic'))).length;
  $('buildStatus').textContent=mine.deckReady?'Your deck is locked.':
   deck.length+'/40 cards · '+basics+' Basic Pokémon'+(deck.length===40&&basics?' · Ready to lock':'');
  $('lockDeck').disabled=mine.deckReady||deck.length!==40||!basics;
  $('lockDeck').textContent=mine.deckReady?'Deck locked':'Lock 40-card deck';
  $('roomNext').textContent=state.allDecksReady?
   'All human decks are locked. Multiplayer duel matchmaking is the next integration milestone; your drafted deck is ready.':
   'After you lock your deck, the room will show which other players are ready. Multiplayer duels are not connected yet.';
 }
 function render(){
  if(!state)return;
  $('entrance').classList.add('hidden');$('room').classList.remove('hidden');
  $('roomTitle').textContent='Cube room '+state.code+' · '+(presets.find(p=>p.id===state.preset)?.name||state.preset||'Classic Balanced');
  const invite=new URL(location.href);invite.pathname='/cube_room.html';invite.search='?room='+encodeURIComponent(code);
  invite.hash='';$('inviteLink').value=invite.toString();
  const seat=state.seats[state.seat];
  $('roster').replaceChildren();
  for(const s of state.seats){
   const holder=document.createElement('div');holder.className='seat';
   const name=document.createElement('strong');
   name.textContent=(s.seat===state.seat?'★ ':'')+s.name+(s.cpu?' · CPU':'');
   const meta=document.createElement('small');
   meta.textContent=state.status==='lobby'?(s.ready?'Ready':'Not ready'):
    state.finished?(s.deckReady?'Deck locked':s.cpu?'CPU seat':'Building deck'):
    s.pickCount+'/60 cards drafted';
   holder.append(name,meta);$('roster').append(holder);
  }
  $('lobbyActions').classList.toggle('hidden',state.status!=='lobby');
  $('readyRoom').textContent=seat.ready?'Cancel ready':'Ready to draft';
  $('beginDraft').classList.toggle('hidden',!state.host);
  $('beginDraft').disabled=state.humanCount<2||state.seats.some(s=>!s.ready);
  $('roomProgress').textContent=state.status==='lobby'?
    state.humanCount+' human players joined. Host starts after everyone is ready.':
    state.finished?'All 60 picks complete. Build your decks!':
    'Pack '+(state.round+1)+' of '+state.packs+' · Pick '+(state.pick+1)+' of '+state.cardsPerPack;
  $('draftArea').classList.toggle('hidden',state.status!=='draft');
  $('deckArea').classList.toggle('hidden',!state.finished);
  if(state.status==='draft'){
   $('draftHeading').textContent='Your pack · '+state.pack.length+' cards';
   $('draftStatus').textContent=state.waiting?'Waiting for other drafters to choose…':
    'Choose one card; packs pass when every seat has picked.';
   $('pickCount').textContent=state.drafted.length;
   $('pack').replaceChildren();
   for(const card of state.pack){
    const btn=document.createElement('button');btn.className='card';btn.type='button';
    btn.append(cardArt(card));
    const name=document.createElement('strong');name.textContent=card.name;
    const meta=document.createElement('small');meta.textContent=card.types.join(', ')+' · '+card.supertype;
    btn.append(name,meta);
    btn.onclick=()=>act(async()=>{
     state=await api('pick',{id:card.id,round:state.round,pick:state.pick});
     render();
    });
    $('pack').append(btn);
   }
   $('picks').replaceChildren();
   state.drafted.forEach((card,i)=>{
    const line=document.createElement('div');line.textContent=(i+1)+'. '+card.name;$('picks').append(line);
   });
  }
  if(state.finished)renderBuild();
 }
 async function refresh(){
  if(!token||!code||busy||loading)return;
  loading=true;
  try{
   const next=await api('state');
   if(!state||next.revision!==state.revision||next.status!==state.status){
    state=next;render();
   }
  }catch(e){say(e.message||String(e));}
  finally{loading=false;}
 }
 $('cubePreset').addEventListener('change',showPreset);
 loadPresets();
 $('createRoom').onclick=()=>createOrJoin(false);
 $('joinRoom').onclick=()=>createOrJoin(true);
 $('readyRoom').onclick=()=>act(async()=>{state=await api('ready',{ready:!state.seats[state.seat].ready});render();});
 $('beginDraft').onclick=()=>act(async()=>{state=await api('start',{});render();});
 $('lockDeck').onclick=()=>act(async()=>{state=await api('submit',{deck});render();});
 $('copyInvite').onclick=async()=>{try{await navigator.clipboard.writeText($('inviteLink').value);}catch{$('inviteLink').select();}};
 const inviteCode=new URLSearchParams(location.search).get('room');
 if(inviteCode)$('roomCode').value=inviteCode.toUpperCase();
 try{
  const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');
  if(saved?.token&&saved?.code){
   code=saved.code;token=saved.token;
   refresh();
  }
 }catch{}
 setInterval(refresh,1800);
})();
