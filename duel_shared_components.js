'use strict';
// Shared, transport-neutral battle UI. Solo, online, Cube and RPG all use
// these renderers. Never calculate game results or send commands here.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoBattleComponents=api;
})(typeof window==='undefined'?null:window,function(){
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function renderHandPeek({root,ids,picture,hidden=false}){
  root.replaceChildren();
  if(hidden){root.textContent='Hidden';return;}
  if(!ids?.length){const el=document.createElement('span');el.className='hand-peek-empty';el.textContent='Empty';root.append(el);return;}
  ids.slice(0,3).forEach((id,i)=>{
   const el=document.createElement('span');el.className='peek-card peek-card-'+i;
   const src=picture(id);
   if(src){const img=document.createElement('img');img.src=src;img.alt='';el.append(img);}
   else el.textContent='🎴';
   root.append(el);
  });
 }
 function renderHandFan({root,ids,visible=true,phase,selectedHand=null,targetMode=null,makeCard,getCard,viewportWidth}){
  const cards=Array.isArray(ids)?ids:[];
  const oldScroll=root.scrollLeft;
  root.replaceChildren();
  root.classList.toggle('hidden',!visible||!cards.length);
  if(!visible||!cards.length)return;
  const width=Number.isFinite(viewportWidth)?viewportWidth:window.innerWidth;
  const compact=width<780,cardWidth=compact?72:100;
  const available=Math.max(190,root.clientWidth||width*.48);
  const gap=Math.min(compact?48:68,Math.max(compact?38:52,(available-cardWidth-24)/Math.max(1,cards.length-1)));
  const track=document.createElement('div');track.className='hand-fan-track';
  track.style.width=Math.max(available,Math.ceil(gap*(cards.length-1)+cardWidth+24))+'px';
  const middle=(cards.length-1)/2;
  cards.forEach((id,i)=>{
   const el=makeCard(id,i,phase==='setup');
   el.type='button';el.classList.remove('handcard');el.classList.add('hand-fan-card');
   el.style.setProperty('--fan-x',(i*gap).toFixed(1)+'px');
   if(targetMode&&selectedHand!==null&&selectedHand!==i)el.classList.add('hand-inactive');
   el.style.setProperty('--fan-y',(Math.abs(i-middle)*2.6).toFixed(1)+'px');
   el.style.setProperty('--fan-angle',Math.max(-22,Math.min(22,(i-middle)*4.5)).toFixed(1)+'deg');
   el.style.zIndex=String(i+1);
   el.title=getCard(id).name+' — click to play or select';
   track.append(el);
  });
  root.append(track);root.scrollLeft=oldScroll;
 }
 // Returns an input intent, never a game command by itself. The host
 // controller owns turn entitlement, networking, feedback and rendering.
 function handIntent({card,index,setup=false,setupConfirmed=false,canAct=false,energyUsed=false,selectedHand=null,targetMode=null}){
  if(setup){
   if(setupConfirmed)return {kind:'none'};
   return card.supertype==='Pokémon'&&card.subtypes?.includes('Basic')?
    {kind:'command',type:'setup_select',payload:{handIndex:index}}:{kind:'inspect'};
  }
  if(!canAct)return {kind:'inspect'};
  if(card.supertype==='Energy'&&energyUsed)return {kind:'error',message:'You have already attached an Energy this turn.'};
  if(card.supertype==='Trainer')return {kind:'command',type:'play_trainer',payload:{handIndex:index}};
  if(card.supertype==='Pokémon'&&card.subtypes?.includes('Basic'))return {kind:'command',type:'bench',payload:{handIndex:index}};
  if(card.supertype==='Energy'||card.supertype==='Pokémon'&&card.evolvesFrom){
   if(selectedHand===index&&targetMode)return {kind:'cancel'};
   return {kind:'target',type:card.supertype==='Energy'?'attach_energy':'evolve',payload:{handIndex:index},
    title:card.supertype==='Energy'?'Attach '+card.name+' — choose Pokémon':'Evolve into '+card.name+' — choose Pokémon'};
  }
  return {kind:'select'};
 }
 function handCardFace({card,source,handType}){
  return (source?'<img loading="lazy" alt="" src="'+escape(source)+'">':'')+
   '<strong>'+escape(card.name)+'</strong><span class="handcard-type">'+escape(handType)+'</span>';
 }
 function renderZone({root,team,active,createPokemon}){
  if(active){
   if(team?.active)root.replaceChildren(createPokemon(team.active,-1));
   else{const el=document.createElement('div');el.className='empty';el.textContent='Not selected';root.replaceChildren(el);}
   return;
  }
  const bench=team?.bench||[];
  if(!bench.length){const el=document.createElement('div');el.className='empty';el.textContent='Empty Bench';root.replaceChildren(el);return;}
  root.replaceChildren(...bench.map((unit,index)=>createPokemon(unit,index)));
 }
 // Stadiums affect both players, but the physical card sits on its owner's mat.
 // Preserve unchanged DOM during CPU playback and online polling to avoid flicker.
 function renderStadium({mine,theirs,stadium,me=0,getCard,picture,onInspect,onHover}){
  for(const [slot,owner] of [[mine,me],[theirs,1-me]]){
   const shown=!!(stadium?.id&&stadium.owner===owner);
   slot.hidden=!shown;
   slot.classList.toggle('occupied',shown);
   if(!shown){if(slot.children.length)slot.replaceChildren();slot._stadiumId=null;continue;}
   if(slot._stadiumId===stadium.id&&slot.children.length)continue;
   const c=getCard(stadium.id),button=document.createElement('button'),src=picture(stadium.id);
   button.type='button';button.className='stadium-card';
   button.title=(c.name||'Stadium')+' — inspect Stadium';
   button.setAttribute('aria-label',button.title);
   if(src){
    const img=document.createElement('img');img.src=src;img.alt='';img.loading='eager';
    button.append(img);
   }else{
    const label=document.createElement('span');label.className='stadium-card-fallback';
    label.textContent=c.name||'Stadium';button.append(label);
   }
   button.addEventListener('click',()=>onInspect(stadium.id));
   if(onHover)onHover(button,stadium.id);
   slot.replaceChildren(button);slot._stadiumId=stadium.id;
  }
 }
 // Card visuals are shared; ownership, visibility and legal target callbacks
 // stay in the mode-specific controller.
 function damagePips(unit,card){
  const hp=Math.max(0,Number(card.hp)||0);
  if(!hp)return '';
  const count=Math.ceil(hp/10),filled=Math.min(count,Math.floor(Math.max(0,Number(unit.damage)||0)/10));
  const pips=Array.from({length:count},(_,i)=>'<span class="damage-pip'+(i<filled?' filled':'')+'" aria-hidden="true"></span>').join('');
  return '<span class="damage-pips" role="img" aria-label="'+escape((unit.damage||0)+' damage of '+hp+' HP')+'">'+pips+'</span>';
 }
 function pokemonFace({unit,card,source,energyStack,vitals}){
  const attached=Array.isArray(unit.energies)?unit.energies:[];
  return energyStack({...unit,energies:attached})+
   '<span class="pokemon-card-stage"><span class="pokemon-face">'+(source?'<img loading="lazy" alt="" src="'+escape(source)+'">':'<div class="empty">'+escape(card.name)+'</div>' )+'</span>'+damagePips(unit,card)+'</span>'+
   '<strong>'+escape(card.name)+'</strong>'+vitals(unit,card)+
   '<span class="stats">'+attached.length+' energy attached</span>';
 }
 function renderAttacks({root,unit,view,me,getCard,enabled,button,onAttack,attackReason}){
  root.replaceChildren();
  if(!unit){root.innerHTML='<span class="hint">Choose an Active Pokémon</span>';return;}
  const active=getCard(unit.id);
  (unit.effectiveAttacks||active.attacks||[]).forEach((attack,index)=>{
   const el=button('',()=>onAttack(index),'attack-action',!enabled);
   const cost=(attack.cost||[]).map(type=>'<span class="energy-pip energy-'+escape(String(type).toLowerCase())+'">'+escape(String(type)[0])+'</span>').join('');
   el.innerHTML='<span class="attack-name">'+escape(attack.name)+'</span><span class="attack-cost">'+(cost||'<small>FREE</small>')+'</span><strong class="attack-damage">'+escape(attack.damage||'—')+'</strong>'+(attack.text?'<span class="attack-effect">'+escape(attack.text)+'</span>':'');
   el.title=attack.text||attack.name;
   el.setAttribute('aria-label',attack.name+', cost '+((attack.cost||[]).join(', ')||'free')+', damage '+(attack.damage||'effect'));
   const reason=attackReason({view,me,attack,unit,getCard});
   if(reason){el.title=reason;if(!enabled)el.setAttribute('aria-disabled','true');}
   root.append(el);
  });
 }
 function renderFaceUpPrizes({rail,view,me,getCard}){
  if(!view?.players)return;
  const groups=rail.querySelectorAll('.prize-group');
  for(const [railIndex,owner] of [[0,1-me],[1,me]]){
   const grid=groups[railIndex]?.querySelector('.prize-grid');if(!grid)continue;
   for(const {index,id} of view.players[owner]?.revealedPrizes||[]){
    const el=grid.children[index];if(!el||!id)continue;
    const name=getCard(id).name;
    el.classList.add('prize-face-up');el.title='Face-up Prize: '+name;
    el.setAttribute('aria-label','Face-up Prize '+(index+1)+': '+name);
    el.textContent=name;
    el.style.fontSize='10px';el.style.overflow='hidden';el.style.overflowWrap='anywhere';
   }
  }
 }
 function prizeOptions(decision){
  return (decision?.options||[]).map(option=>{
   const match=/^prize:([0-5])$/.exec(option.id);
   return match?{id:option.id,index:Number(match[1])}:null;
  }).filter(Boolean);
 }
 function renderPrizeRail({rail,decision,busy,button,choose}){
  if(!decision)return;
  const group=rail.querySelectorAll('.prize-group')[1],grid=group?.querySelector('.prize-grid');
  if(!grid)return;
  group.classList.add('prize-awaiting');
  grid.setAttribute('role','group');grid.setAttribute('aria-label','Choose your Prize card');grid.replaceChildren();
  const options=new Map(prizeOptions(decision).map(x=>[x.index,x]));
  for(let index=0;index<6;index++){
   const option=options.get(index);
   if(!option){const el=document.createElement('span');el.className='prize-back prize-taken';grid.append(el);continue;}
   const el=button(String(index+1),()=>choose(option.id),'prize-back prize-select',busy);
   el.title='Take Prize '+(index+1);el.setAttribute('aria-label','Take Prize '+(index+1));
   grid.append(el);
  }
 }
 function renderPrizeFallback({container,decision,busy,button,choose}){
  container.replaceChildren();container.classList.toggle('hidden',!decision);
  if(!decision)return;
  const title=document.createElement('strong');title.textContent='🎁 Choose a Prize';
  const info=document.createElement('span');info.textContent='Select a highlighted Prize or a number here';
  const options=document.createElement('div');options.className='prize-choices';
  for(const option of prizeOptions(decision))options.append(button('🎴 '+(option.index+1),()=>choose(option.id),'prize-option',busy));
  container.append(title,info,options);
 }
 return {renderHandPeek,renderHandFan,handIntent,handCardFace,renderZone,renderStadium,pokemonFace,renderAttacks,renderFaceUpPrizes,renderPrizeRail,renderPrizeFallback,prizeOptions};
});
