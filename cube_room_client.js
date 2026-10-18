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
 let visualBuilder=null;
 function renderBuild(){
  if(!state||!state.finished)return;
  const mine=state.seats[state.seat];
  if(!deckInitialized){deck=[...(state.ownDeck||state.suggestedDeck||[])];deckInitialized=true;}
  if(!visualBuilder){
   visualBuilder=window.CubeDeckBuilder.create({
    root:$('roomDeckBuilder'),actionElement:$('roomBuilderAction'),
    onChange:next=>{deck=next;renderBuild();}
   });
  }
  visualBuilder.update({drafted:state.drafted,energyIds:state.energyIds,deck,
   locked:mine.deckReady});
  const basics=deck.filter(id=>state.drafted.some(c=>c.id===id&&
   (c.subtypes.includes('Basic')||c.subtypes.includes('Baby')))).length;
  const ready=deck.length===40&&basics>0;
  $('lockDeck').disabled=mine.deckReady||!ready||busy;
  $('lockDeck').textContent=mine.deckReady?'Deck locked':'Lock 40-card deck';
  $('buildStatus').textContent=mine.deckReady?'Your 40-card deck is locked.':
   ready?'Deck ready: lock it when you are happy with your choices.':
   'Choose '+(40-deck.length)+' more cards. At least one Basic Pokémon is required.';
  $('roomNext').textContent=state.allDecksReady?
   'All decks are locked. The round-robin tournament is starting…':
   'Your deck is private to your seat. All players must lock their decks before the next stage.';
 }
 function renderTournament(){
  const t=state?.tournament;
  $('roundRobinArea').classList.toggle('hidden',!t);
  if(!t)return;
  $('roomProgress').textContent=t.finished?'All six tournament matches completed.':
   'Round-robin underway · Each player faces the other three seats once.';
  $('rrProgress').textContent=t.finished?'Tournament complete':
   'Completed '+t.matchIndex+' of '+t.totalMatches+' matches';
  const active=$('rrActive');active.replaceChildren();
  if(t.finished){
   const row=document.createElement('strong');row.textContent='🏆 '+t.standings[0].name+' wins the Cube!';
   active.append(row);
  }else if(t.activeMatch){
   const title=document.createElement('strong');
   title.textContent='Match '+t.activeMatch.id+': '+t.activeMatch.names.join(' vs ');
   active.append(title);
   if(t.yourMatch){
    const link=document.createElement('a');
    if(t.yourMatch.kind==='online'){
     link.href='/online.html?cubeRoom='+encodeURIComponent(code);
     link.textContent='Play against '+t.yourMatch.opponent+' →';
     link.addEventListener('click',()=>{
      sessionStorage.setItem('neoOnlineRoom',t.yourMatch.code);
      sessionStorage.setItem('neoOnlineToken',t.yourMatch.token);
     });
    }else{
     link.href='/classic_live.html?cubeRoom='+encodeURIComponent(code);
     link.textContent='Play against '+t.yourMatch.opponent+' (CPU) →';
     link.addEventListener('click',()=>{
      sessionStorage.setItem('neoClassicLiveToken',t.yourMatch.token);
     });
    }
    active.append(link);
   }else{
    const text=document.createElement('span');text.className='waiting';
    text.textContent='Waiting for this match to finish. Your turn is coming!';
    active.append(text);
   }
  }
  const fixtures=$('rrFixtures');fixtures.replaceChildren();
  for(const match of t.matches){
   const tile=document.createElement('div');
   tile.className='rr-match '+(match.status==='complete'?'complete':
    t.activeMatch?.id===match.id?'active':'');
   const title=document.createElement('b');title.textContent='Match '+match.id+': '+match.names.join(' vs ');
   const result=document.createElement('small');
   result.textContent=match.status==='complete'?
    'Winner: '+state.seats[match.winner].name+
     (match.method&&match.method!=='played'?' · '+match.method+' tiebreak':''):
    match.status==='active'?'Playing now':'Upcoming';
   tile.append(title,result);fixtures.append(tile);
  }
  const standings=$('rrStandings');
  standings.replaceChildren();
  const table=document.createElement('table');
  const head=document.createElement('thead'),tr=document.createElement('tr');
  for(const label of ['Rank','Player','Played','W','L','Points']){
   const th=document.createElement('th');th.textContent=label;tr.append(th);
  }
  head.append(tr);table.append(head);
  const body=document.createElement('tbody');
  for(const row of t.standings){
   const tr=document.createElement('tr');
   if(row.seat===state.seat)tr.className='me';
   for(const value of [row.rank,row.name,row.played,row.wins,row.losses,row.points]){
    const td=document.createElement('td');td.textContent=String(value);tr.append(td);
   }
   body.append(tr);
  }
  table.append(body);standings.append(table);
  $('rrFooter').textContent=t.finished?
   'Everyone has played three matches. Final standings are locked.':
   'Keep this tab or return after your duel. The next pairing unlocks automatically.';
 }
 function render(){
  if(!state)return;
  const focused=!!state.finished&&!state.tournament;
  const entering=focused&&!document.body.classList.contains('cube-deck-mode');
  document.body.classList.toggle('cube-deck-mode',focused);
  $('cubeRoomBuildContext').textContent='Room '+state.code+' · '+
   (state.seats[state.seat].deckReady?'Deck locked · Waiting for other players':'60 cards drafted · Create your 40-card deck');
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
  $('deckArea').classList.toggle('hidden',!state.finished||!!state.tournament);
  renderTournament();
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
  if(entering){
   window.scrollTo({top:0,behavior:'instant'});
   const heading=$('deckArea').querySelector('.cb-header h2');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }
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
