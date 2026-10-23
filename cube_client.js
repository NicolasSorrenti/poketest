'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 let token=null,state=null,busy=false,deck=[],deckInitialized=false,presets=[];
 const types=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
 async function loadPresets(){
  try{
   const response=await fetch('/api/cube/presets');
   if(!response.ok)throw Error('Cube formats unavailable');
   const data=await response.json();presets=data.presets||[];
   const selector=$('presetSelect'),previous=selector.value;
   selector.replaceChildren();
   for(const p of presets){
    const option=document.createElement('option');option.value=p.id;option.textContent=p.name;
    selector.append(option);
   }
   selector.value=presets.some(p=>p.id===previous)?previous:'balanced';
   showPreset();
  }catch{$('presetInfo').textContent='Balanced Cube is available.';}
 }
 function showPreset(){
  const p=presets.find(p=>p.id===$('presetSelect').value);
  if(p)$('presetInfo').textContent=p.description+' · '+p.archetypes.join(' / ');
   const exact=!!(state?.preset===p?.id&&Array.isArray(state?.cubePool));
   window.CubeSetBadges?.render($('presetSets'),{
    sets:exact?window.CubeSetBadges.fromPool(state.cubePool):p?.sets,
    exact,fixed:!!p?.fixedPool
   });
 }
 function esc(v){return String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[x]));}
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
 async function request(path,opts={}){
  const r=await fetch('/api/cube/'+path,{...opts,headers:{'Content-Type':'application/json',...(token?{'X-Cube-Token':token}:{})}});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Cube request failed');return data;
 }
 async function start(){
  if(busy)return;busy=true;$('error').textContent='';
  try{
   const result=await request('create',{method:'POST',body:JSON.stringify({preset:$('presetSelect').value,difficulty:Number($('cpuDifficulty').value)})});
   token=result.token;sessionStorage.setItem('neoCubeDraftToken',token);
   state=result;deck=[];deckInitialized=false;render();
  }catch(e){$('error').textContent=e.message;}finally{busy=false;if(state?.done&&!state.started)renderBuilder();}
 }
 async function pick(id){
  if(busy||!state||state.done)return;busy=true;$('error').textContent='';
  try{state=await request('pick',{method:'POST',body:JSON.stringify({id,revision:state.revision})});render();}
  catch(e){$('error').textContent=e.message;}finally{busy=false;}
 }
 let visualBuilder=null;
 function renderBuilder(){
  $('builder').classList.toggle('hidden',!state.done||state.started);
  if(!state.done||state.started)return;
  if(!deckInitialized){deck=[...(state.suggestedDeck||[])];deckInitialized=true;
   $('matchCpuDifficulty').value=String(state.difficulty??3);}
  if(!visualBuilder){
   visualBuilder=window.CubeDeckBuilder.create({
    root:$('soloDeckBuilder'),actionElement:$('soloBuilderAction'),
    onChange:next=>{deck=next;renderBuilder();window.CubeAnalysis?.update({pool:state.cubePool,drafted:state.drafted,pack:[],deck});}
   });
  }
  visualBuilder.update({drafted:state.drafted,energyIds:state.energyIds,deck,suggestedDeck:state.suggestedDeck});
  const basics=deck.filter(id=>state.drafted.some(c=>c.id===id&&
   (c.subtypes.includes('Basic')||c.subtypes.includes('Baby')))).length;
  const ready=deck.length===40&&basics>0;
  $('playCube').disabled=!ready||busy||state.started;
  $('deckStatus').textContent=ready?'Deck is ready. Start your semifinal when you are happy with it.':
   'Deck needs '+(40-deck.length)+' more cards and at least one Basic Pokémon.';
 }
 function renderTournament(){
  const t=state.tournament;
  $('tournament').classList.toggle('hidden',!t);
  if(!t)return;
  const rounds=$('roundList');rounds.replaceChildren();
  const titles={semiHuman:'Your semifinal',semiCpu:'CPU semifinal',final:'Championship final',third:'Third-place match'};
  for(const m of t.bracket){
   const row=document.createElement('div');
   row.className='round '+(m.status==='complete'?'complete':m.id===t.activeMatchId&&!t.readyForNext?'current':'');
   const title=document.createElement('strong');title.textContent=titles[m.id];
   const matchup=document.createElement('span');
   matchup.textContent=m.seats.length===2?m.seats.join(' vs '):'Awaiting semifinals';
   const status=document.createElement('small');status.style.display='block';
   status.textContent=m.status==='complete'?'Winner: '+m.winner+(m.method==='played'?'':' · '+m.method+' tiebreak'):
    m.id===t.activeMatchId&&!t.readyForNext?'MATCH IN PROGRESS':
    m.id===t.activeMatchId&&t.readyForNext?'READY TO PLAY':'PENDING';
   row.append(title,matchup,status);rounds.append(row);
  }
  const record=t.wins+' wins · '+t.losses+' losses'+(t.draws?' · '+t.draws+' rematch draws':'');
  let message='Your bracket record: '+record+'. ';
  if(t.finished){
   const place=t.standings.find(x=>x.name==='You')?.place;
   message+='Tournament finished — '+(place===1?'Champion!':place===2?'Runner-up!':place===3?'Third place.':'Fourth place.');
   const table=document.createElement('ol');table.className='standings';
   for(const result of t.standings){
    const row=document.createElement('li');row.textContent=result.name;
    table.append(row);
   }
   $('standings').replaceChildren(table);
  }else{
   $('standings').replaceChildren();
   message+=t.rematch?'The duel was a draw. Replay this match to decide the bracket.':
    t.readyForNext?'Your next bracket match is ready.':'Finish your current match to advance.';
  }
  $('tournamentStatus').textContent=message;
  $('tournamentStatus').classList.toggle('final-record',t.finished);
  $('nextMatch').classList.toggle('hidden',!t.readyForNext);
  $('nextMatch').textContent=t.rematch?'Replay drawn match →':'Play next bracket match →';
  $('resumeMatch').classList.toggle('hidden',!t.activeDuelToken||t.finished||t.readyForNext);
 }
 async function nextMatch(){
  if(busy||!state?.tournament?.readyForNext)return;
  busy=true;$('error').textContent='';
  try{
   const result=await request('next',{method:'POST',body:JSON.stringify({revision:state.revision})});
   sessionStorage.setItem('neoClassicLiveToken',result.duelToken);
   location.assign('/classic_live.html');
  }catch(e){
   $('error').textContent=e.message;
   try{state=await request('state');$('cpuDifficulty').value=String(state.difficulty??3);render();}catch{}
   busy=false;
  }
 }
 function arrangedPack(cards){
  const order=$('packSort').value;
  if(order==='pack')return cards;
  return [...cards].sort((a,b)=>order==='name'?
   a.name.localeCompare(b.name)||a.id.localeCompare(b.id):
   (a.supertype==='Pokémon'?0:1)-(b.supertype==='Pokémon'?0:1)||
   a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
 }
 function cardKind(c){
  return c.supertype==='Trainer'?'Trainer':
   (c.subtypes||[]).includes('Baby')?'Baby Pokémon':
   (c.subtypes||[]).includes('Basic')?'Basic Pokémon':
   c.evolvesFrom?'Evolves from '+c.evolvesFrom:'Evolution Pokémon';
 }
 function render(){
  showPreset();
  window.CubePoolViewer?.update(state.cubePool);
  const entering=!!state.done&&!state.started&&!document.body.classList.contains('cube-deck-mode');
  document.body.classList.toggle('cube-deck-mode',!!state.done&&!state.started);
  $('start').textContent='Restart Draft';
  $('start').setAttribute('aria-label','Restart the draft with the selected format and difficulty');
  $('progress').textContent=state.done?'Draft completed! Build your deck below.':
   'Pack '+(state.round+1)+' of '+state.packs+' · Pick '+(state.pick+1)+' of '+state.cardsPerPack;
  $('packTitle').textContent=state.done?'All packs completed':'Pick one card · '+(presets.find(p=>p.id===state.preset)?.name||'Cube');
  $('total').textContent=state.drafted.length;
  $('cpuDifficulty').title='Current difficulty: '+(state.difficulty??3)+'. Changes apply to a new draft.';
  const recommended=state.pack.find(c=>c.id===state.recommendedId);
  const guide=$('showPickHelp').checked&&recommended;
  $('pickAdvice').textContent=guide?'Suggested pick: '+recommended.name+
   ' · Based on your drafted Pokémon, attack costs and evolution lines.':'';
  $('pack').replaceChildren();
  arrangedPack(state.pack).forEach(c=>{
   const b=document.createElement('button');b.className='card';b.type='button';
   const title=document.createElement('strong');title.textContent=c.name;
   const detail=document.createElement('small');detail.textContent=c.supertype+' · '+c.types.join(', ');
   b.append(cardArt(c),title,detail);
   const kind=document.createElement('span');kind.className='card-kind';
   kind.textContent=cardKind(c);b.append(kind);
   if(guide&&c.id===state.recommendedId){
    b.classList.add('suggested');
    const badge=document.createElement('span');badge.className='pick-badge';
    badge.textContent='Suggested pick';b.append(badge);
   }
   b.addEventListener('click',()=>pick(c.id));$('pack').append(b);
  });
  $('drafted').innerHTML=state.drafted.map((c,i)=>'<div class="row">'+(i+1)+'. '+esc(c.name)+'</div>').join('');
  renderBuilder();
  window.CubeAnalysis?.update({pool:state.cubePool,drafted:state.drafted,pack:arrangedPack(state.pack),deck});
  renderTournament();
  if(entering){
   window.scrollTo({top:0,behavior:'instant'});
   const heading=$('builder').querySelector('.cb-header h2');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }
 }
 async function play(){
  if(busy||!state?.done||deck.length!==40)return;
  busy=true;$('error').textContent='';
  try{
   const result=await request('start',{method:'POST',body:JSON.stringify({revision:state.revision,deck,difficulty:Number($('matchCpuDifficulty').value)})});
   sessionStorage.setItem('neoClassicLiveToken',result.duelToken);
   location.assign('/classic_live.html');
  }catch(e){$('error').textContent=e.message;busy=false;renderBuilder();}
 }
 async function init(){
  token=sessionStorage.getItem('neoCubeDraftToken');
  if(!token)return;
  try{state=await request('state');$('cpuDifficulty').value=String(state.difficulty??3);render();}
  catch{sessionStorage.removeItem('neoCubeDraftToken');token=null;}
 }
 $('presetSelect').addEventListener('change',showPreset);
 $('packSort').addEventListener('change',()=>{if(state)render();});
 $('showPickHelp').addEventListener('change',()=>{if(state)render();});
 loadPresets();
 $('start').addEventListener('click',start);
 $('restartBuilder').addEventListener('click',()=>{
  if(window.confirm('Start a new Cube draft? Your current picks and deck will be replaced.'))start();
 });
 $('playCube').addEventListener('click',play);
 $('nextMatch').addEventListener('click',nextMatch);
 $('resumeMatch').addEventListener('click',()=>{
  if(state?.tournament?.activeDuelToken)sessionStorage.setItem('neoClassicLiveToken',state.tournament.activeDuelToken);
 });
 init();
})();