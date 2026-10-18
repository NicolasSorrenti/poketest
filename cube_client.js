'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 let token=null,state=null,busy=false,deck=[],deckInitialized=false;
 const types=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
 function esc(v){return String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[x]));}
 async function request(path,opts={}){
  const r=await fetch('/api/cube/'+path,{...opts,headers:{'Content-Type':'application/json',...(token?{'X-Cube-Token':token}:{})}});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Cube request failed');return data;
 }
 async function start(){
  if(busy)return;busy=true;$('error').textContent='';
  try{
   const result=await request('create',{method:'POST',body:'{}'});
   token=result.token;sessionStorage.setItem('neoCubeDraftToken',token);
   state=result;deck=[];deckInitialized=false;render();
  }catch(e){$('error').textContent=e.message;}finally{busy=false;}
 }
 async function pick(id){
  if(busy||!state||state.done)return;busy=true;$('error').textContent='';
  try{state=await request('pick',{method:'POST',body:JSON.stringify({id,revision:state.revision})});render();}
  catch(e){$('error').textContent=e.message;}finally{busy=false;}
 }
 function count(id){return deck.filter(x=>x===id).length;}
 function quantityByName(name){
  const ids=new Set(state.drafted.filter(x=>x.name===name).map(c=>c.id));
  return [...ids].reduce((n,id)=>n+count(id),0);
 }
 function change(id,delta,limit,name,energy=false){
  if(delta>0){
   if(deck.length>=40||count(id)>=limit||(!energy&&quantityByName(name)>=4))return;
   deck.push(id);
  }else{
   const index=deck.lastIndexOf(id);if(index<0)return;deck.splice(index,1);
  }
  renderBuilder();
 }
 function choice(name,id,limit,energy=false){
  const row=document.createElement('div');row.className='build-row';
  const label=document.createElement('span');label.textContent=name;row.append(label);
  const controls=document.createElement('div');
  const minus=document.createElement('button');minus.type='button';minus.textContent='−';
  minus.title='Remove one';minus.disabled=count(id)===0;minus.addEventListener('click',()=>change(id,-1,limit,name,energy));
  const qty=document.createElement('strong');qty.textContent=count(id)+(energy?'':' / '+limit);
  const plus=document.createElement('button');plus.type='button';plus.textContent='+';
  plus.title='Add one';plus.disabled=deck.length>=40||count(id)>=limit||(!energy&&quantityByName(name)>=4);
  plus.addEventListener('click',()=>change(id,1,limit,name,energy));
  controls.append(minus,qty,plus);row.append(controls);return row;
 }
 function renderBuilder(){
  $('builder').classList.toggle('hidden',!state.done);
  if(!state.done)return;
  if(!deckInitialized){deck=[...(state.suggestedDeck||[])];deckInitialized=true;}
  const unique=new Map();
  state.drafted.forEach(c=>{const v=unique.get(c.id);if(v)v.copies++;else unique.set(c.id,{card:c,copies:1});});
  const cardChoices=$('cardChoices');cardChoices.replaceChildren();
  for(const {card,copies} of [...unique.values()].sort((a,b)=>a.card.name.localeCompare(b.card.name))){
   cardChoices.append(choice(card.name,card.id,copies,false));
  }
  const energyChoices=$('energyChoices');energyChoices.replaceChildren();
  for(const type of types)energyChoices.append(choice(type+' Energy',state.energyIds[type],40,true));
  const names=new Map();
  for(const id of deck){
   const c=state.drafted.find(x=>x.id===id);
   const name=c?.name||types.find(t=>state.energyIds[t]===id)+' Energy';
   names.set(name,(names.get(name)||0)+1);
  }
  const container=$('deckContents');container.replaceChildren();
  for(const [name,n] of [...names].sort((a,b)=>a[0].localeCompare(b[0]))){
   const row=document.createElement('div');row.className='row';row.textContent=n+' × '+name;container.append(row);
  }
  const basics=deck.filter(id=>state.drafted.some(c=>c.id===id&&(c.subtypes.includes('Basic')||c.subtypes.includes('Baby')))).length;
  const valid=deck.length===40&&basics>0;
  $('deckStatus').textContent=deck.length+' / 40 cards · '+basics+' Basic Pokémon'+(valid?' · Ready to battle!':' · Choose 40 cards with at least one Basic');
  $('deckStatus').classList.toggle('success',valid);
  $('playCube').disabled=!valid||busy||state.started;
  $('playCube').textContent=state.started?'Match already started':'Start 4-Prize CPU Duel →';
 }
 function render(){
  $('start').textContent='Restart Draft';
  $('progress').textContent=state.done?'Draft completed! Build your deck below.':
   'Pack '+(state.round+1)+' of '+state.packs+' · Pick '+(state.pick+1)+' of '+state.cardsPerPack;
  $('packTitle').textContent=state.done?'All packs completed':'Pick one card';
  $('total').textContent=state.drafted.length;
  $('pack').replaceChildren();
  state.pack.forEach(c=>{
   const b=document.createElement('button');b.className='card';b.type='button';
   const img=c.images?.small;
   b.innerHTML=(typeof img==='string'&&/^https:\/\//.test(img)?'<img alt="" loading="lazy" src="'+esc(img)+'">':'')+
    '<strong>'+esc(c.name)+'</strong><small>'+esc(c.supertype)+' · '+esc(c.types.join(', '))+'</small>';
   b.addEventListener('click',()=>pick(c.id));$('pack').append(b);
  });
  $('drafted').innerHTML=state.drafted.map((c,i)=>'<div class="row">'+(i+1)+'. '+esc(c.name)+'</div>').join('');
  renderBuilder();
 }
 async function play(){
  if(busy||!state?.done||deck.length!==40)return;
  busy=true;$('error').textContent='';
  try{
   const result=await request('start',{method:'POST',body:JSON.stringify({revision:state.revision,deck})});
   sessionStorage.setItem('neoClassicLiveToken',result.duelToken);
   location.assign('/classic_live.html');
  }catch(e){$('error').textContent=e.message;busy=false;renderBuilder();}
 }
 async function init(){
  token=sessionStorage.getItem('neoCubeDraftToken');
  if(!token)return;
  try{state=await request('state');render();}
  catch{sessionStorage.removeItem('neoCubeDraftToken');token=null;}
 }
 $('start').addEventListener('click',start);
 $('playCube').addEventListener('click',play);
 init();
})();