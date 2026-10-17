'use strict';
// Presentation-only helpers. All legal actions and effects remain server-authoritative.
(function(root){
 const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function vitals(unit,card){
  const hp=Number(card?.hp), damage=Math.max(0,Number(unit?.damage)||0);
  if(!Number.isFinite(hp)||hp<=0)return '';
  const remain=Math.max(0,hp-damage),pct=Math.min(100,Math.round(100*remain/hp));
  const level=pct<=25?'critical':pct<=50?'wounded':'healthy';
  const badges=[];
  if(unit.status)badges.push(String(unit.status));
  if(unit.poison)badges.push('Poisoned');
  if(unit.burn)badges.push('Burned');
  return `<span class="vitals ${level}" aria-label="${html(remain)} of ${html(hp)} HP remaining">`+
   `<span class="hp-count">${html(remain)} / ${html(hp)} HP</span>`+
   `<span class="hp-track"><span class="hp-fill" style="width:${pct}%"></span></span></span>`+
   (badges.length?`<span class="condition-badges">${badges.map(x=>`<span class="condition-badge">${html(x)}</span>`).join('')}</span>`:'');
 }
 function handType(card){
  const type=String(card?.supertype||'').toLowerCase();
  if(type==='energy')return 'Energy';
  if(type==='trainer')return (card.subtypes||[]).includes('Stadium')?'Stadium':'Trainer';
  if(type==='pokémon')return (card.subtypes||[]).includes('Basic')?'Basic Pokémon':'Evolution';
  return 'Card';
 }
 function guide({view,me=0,energyUsed=false,targetMode=null,card=()=>({}),setupConfirmed=false}={}){
  if(!view)return null;
  const you=view.players?.[me],d=view.pendingDecision;
  if(view.over)return {kind:'complete',title:'Duel complete',tip:'Review the duel log or start another match.',chips:[]};
  if(view.phase==='setup')return {kind:'setup',title:setupConfirmed?'Waiting for opponent setup':'Choose your starting Pokémon',tip:setupConfirmed?'Your starting team is locked in.':'Pick a Basic Pokémon as Active, optionally fill your Bench, then confirm setup.',chips:[]};
  if(d)return d.actor===me?{kind:'decision',title:'Your choice matters',tip:'Use the highlighted Pokémon or the centered selection window to resolve this effect.',chips:[]}:
   {kind:'waiting',title:'Waiting for a card choice',tip:'The other player is resolving an effect.',chips:[]};
  if(view.turn!==me)return {kind:'waiting',title:'Opponent’s turn',tip:'Inspect the battlefield while you wait.',chips:[]};
  if(targetMode)return {kind:'targeting',title:targetMode.title||'Choose a Pokémon',tip:'Click an outlined Pokémon on your field, or press Esc to cancel.',chips:[]};
  const hand=you?.hand||[],types=hand.map(id=>handType(card(id)));
  const hasEnergy=types.includes('Energy')&&!energyUsed;
  const canBench=types.includes('Basic Pokémon')&&(you?.bench?.length||0)<5;
  let tip='Play Trainers, use a Pokémon Power, attack, or end your turn.';
  if(hasEnergy)tip='You can attach one Energy this turn: select it in your hand, then choose a highlighted Pokémon.';
  else if(canBench)tip='You can play a Basic Pokémon to your Bench, use a Trainer, or attack.';
  return {kind:'turn',title:'Your turn — plan your move',tip,chips:[{label:energyUsed?'Energy attached':'Energy available',done:energyUsed},{label:`Bench ${you?.bench?.length||0}/5`,done:false},{label:'Attacking ends your turn',done:false}]};
 }
 function renderGuide(node,args){
  if(!node)return;
  const data=guide(args);if(!data){node.classList.add('hidden');return;}
  node.classList.remove('hidden');node.className='turn-coach '+data.kind;
  // Skip DOM rebuilds on online polling when the guide has not changed.
  const signature=JSON.stringify(data);if(node.dataset.signature===signature)return;
  node.dataset.signature=signature;
  node.textContent='';
  const intro=document.createElement('div');intro.className='coach-message';
  const heading=document.createElement('strong');heading.textContent=data.title;
  const tip=document.createElement('span');tip.textContent=data.tip;
  intro.append(heading,tip);node.append(intro);
  if(data.chips.length){const chips=document.createElement('div');chips.className='coach-chips';
   for(const chip of data.chips){const el=document.createElement('span');el.className='coach-chip'+(chip.done?' done':'');el.textContent=chip.label;chips.append(el);}node.append(chips);
  }
 }
 root.NeoExperienceUI={html,vitals,handType,guide,renderGuide};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.NeoExperienceUI;
})(typeof window==='undefined'?globalThis:window);
