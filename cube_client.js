'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 let token=null,state=null,busy=false;
 function esc(v){return String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
 async function request(path,opts={}){
  const r=await fetch('/api/cube/'+path,{...opts,headers:{'Content-Type':'application/json',...(token?{'X-Cube-Token':token}:{})}});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Cube request failed');return data;
 }
 async function start(){
  if(busy)return;busy=true;$('error').textContent='';
  try{const result=await request('create',{method:'POST',body:'{}'});token=result.token;state=result;render();}
  catch(e){$('error').textContent=e.message;}finally{busy=false;}
 }
 async function pick(id){
  if(busy||!state||state.done)return;busy=true;$('error').textContent='';
  try{state=await request('pick',{method:'POST',body:JSON.stringify({id,revision:state.revision})});render();}
  catch(e){$('error').textContent=e.message;}finally{busy=false;}
 }
 function render(){
  $('start').textContent='Restart Draft';
  $('progress').textContent=state.done?'Draft complete — 60 cards collected. Deck building and duel launch are not wired yet.':
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
 }
 $('start').addEventListener('click',start);
})();