'use strict';
// View-only combat presentation. Only publicActivity and publicly visible HP are used.
// No rule changes, private card inspection or speculative damage calculations.
(function(root){
 const rules=typeof module==='object'&&module.exports?require('./core_rules'):root.NeoCoreRules;
 const shared=typeof module==='object'&&module.exports?require('./duel_quick_ui'):root.NeoDuelUI;
 function attackReason({view,me,attack,unit,getCard}){
  if(!view||view.over)return 'The duel has ended.';
  if(view.phase!=='game')return 'Finish opening setup before attacking.';
  if(view.pendingDecision)return view.pendingDecision.actor===me?'Resolve your card choice first.':'Wait for the other player to finish choosing.';
  if(view.turn!==me)return 'You can attack only during your turn.';
  if(!unit)return 'Choose an Active Pokémon first.';
  if(unit.status==='Asleep'||unit.status==='Paralyzed')return `${unit.status} Pokémon cannot attack.`;
  // Special Energy, attached effects, Powers and cost modifiers are adjudicated by the server.
  // Provide a precise *hint* only when every attached Energy is a simple basic Energy.
  const cost=attack?.cost||[],attached=unit.energies||[];
  const energyCards=attached.map(getCard);
  if(cost.length&&energyCards.every(c=>rules.isBasicEnergy(c))){
   const pool=energyCards.map(c=>c.name.replace(/ Energy$/,''));
   if(!rules.canPayEnergy(cost,pool))return `Not enough matching Energy for ${(attack?.name||'this attack')}. Attach Energy or use another attack.`;
  }
  return null;
 }
 function publicActions(activity,me,getCard,name='Opponent'){
  return (Array.isArray(activity)?activity:[]).filter(e=>e&&Number.isSafeInteger(e.seq))
   .map(e=>{const ours=e.side===me;const info=shared.actionDescription(e,getCard,ours?'You':name);
    const text=ours?info.text.replace('their turn','your turn').replace('their setup','your setup').replace('their opening field','your opening field'):info.text;
    return {seq:e.seq,type:e.type,side:e.side,kind:info.kind,icon:info.icon,text};});
 }
 function hpChanges(before,after,me){
  if(!before||!after||before.phase!=='game'||after.phase!=='game')return [];
  const result=[];
  for(let side=0;side<2;side++){
   const old=before.players?.[side],now=after.players?.[side];if(!old||!now)continue;
   for(const slot of [-1,0,1,2,3,4]){
    const prior=slot===-1?old.active:old.bench?.[slot];
    const next=slot===-1?now.active:now.bench?.[slot];
    if(!prior||!next||prior.id!==next.id)continue; // switch/KO is not HP damage
    const delta=(Number(next.damage)||0)-(Number(prior.damage)||0);
    if(delta!==0)result.push({side,relative:side===me?'my':'enemy',slot,delta});
   }
  }
  return result;
 }
 function makeBattlePresentation({stage,popup,timeline,getCard,opponentName=()=> 'Opponent',me=()=>0}){
  let lastSeq=null,lastView=null,lastRevision=null,pending=[],timer=null,active=false,animationId=0,lastTimeline='';
  const reduced=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function stop(){if(timer)clearTimeout(timer);timer=null;active=false;pending=[];animationId++;popup.textContent='';popup.classList.add('hidden');stage.classList.remove('combat-attack','combat-evolve','combat-me','combat-foe');}
  function reset(){stop();lastSeq=null;lastView=null;lastRevision=null;lastTimeline='';timeline.textContent='';}
  function cardNode(relative,slot){const selector=relative==='my'?'my':'enemy',area=slot<0?'Active':'Bench';const parent=document.getElementById(selector+area);return parent?.querySelectorAll('.poke')[slot<0?0:slot]||null;}
  function showHp({relative,slot,delta}){
   const element=cardNode(relative,slot);if(!element)return;
   const badge=document.createElement('span');badge.className='combat-hp-pop '+(delta>0?'lost':'recovered');
   badge.textContent=(delta>0?'-':'+')+Math.abs(delta)+' HP';
   badge.setAttribute('aria-hidden','true');element.append(badge);
   if(!reduced())element.classList.add(delta>0?'combat-hit':'combat-heal');
   const expire=()=>{badge.remove();element.classList.remove('combat-hit','combat-heal');};
   setTimeout(expire,reduced()?120:1400);
  }
  function pump(){
   if(active||!pending.length)return;
   const event=pending.shift();active=true;
   const isAttack=event.type==='attack',isEvolve=event.type==='evolve';
   const actorMine=event.side===me(),classSide=actorMine?'combat-me':'combat-foe';
   const who=actorMine?'You':opponentName();
   const detail=shared.actionDescription(event,getCard,who);
   popup.textContent='';const card=document.createElement('div');card.className='combat-banner '+(isAttack?'attack':'evolve');
   const glyph=document.createElement('span');glyph.className='combat-glyph';glyph.textContent=isAttack?'⚔':'✧';
   const copy=document.createElement('div');copy.className='combat-copy';
   const heading=document.createElement('strong');heading.textContent=isAttack?(event.label||'ATTACK!').toUpperCase():'EVOLUTION!';
   const caption=document.createElement('span');caption.textContent=detail.text;
   copy.append(heading,caption);card.append(glyph,copy);popup.append(card);
   popup.classList.remove('hidden');
   stage.classList.remove('combat-attack','combat-evolve','combat-me','combat-foe');
   if(!reduced()){void stage.offsetWidth;stage.classList.add(isAttack?'combat-attack':'combat-evolve',classSide);}
   const duration=reduced()?350:1250,id=++animationId;
   timer=setTimeout(()=>{if(animationId!==id)return;popup.classList.add('hidden');stage.classList.remove('combat-attack','combat-evolve','combat-me','combat-foe');active=false;timer=null;pump();},duration);
  }
  function paintTimeline(events){
   const recent=events.slice(-8).reverse();const signature=JSON.stringify(recent);
   if(signature===lastTimeline)return;lastTimeline=signature;timeline.textContent='';
   if(!recent.length){const empty=document.createElement('li');empty.className='timeline-empty';empty.textContent='Actions will appear here as the duel begins.';timeline.append(empty);return;}
   for(const event of recent){
    const row=document.createElement('li');row.className='timeline-entry '+event.kind;
    const glyph=document.createElement('span');glyph.className='timeline-icon';glyph.textContent=event.icon;
    const text=document.createElement('span');text.textContent=event.text;
    const side=document.createElement('small');side.textContent=event.side===me()?'YOU':'OPPONENT';
    row.append(glyph,text,side);timeline.append(row);
   }
  }
  function update(data){
   const view=data?.view;if(!view)return;
   const actions=publicActions(data.activity,me(),getCard,opponentName());paintTimeline(actions);
   const changed=lastView&&lastRevision!==data.revision;
   const deltas=changed?hpChanges(lastView,view,me()):[];
   const fresh=shared.newActivitySince(data.activity,lastSeq);lastSeq=fresh.seq;
   if(lastView&&fresh.newActions.length){
    pending.push(...fresh.newActions.filter(x=>x.type==='attack'||x.type==='evolve'));
    if(pending.length>12)pending=pending.slice(-12);
   }
   // Always capture previous stable public snapshot. A repeated poll never replays events.
   lastView=structuredClone(view);lastRevision=data.revision;
   for(const d of deltas)showHp(d);
   pump();
  }
  return {update,reset,stop};
 }
 root.NeoBattlePresentation={attackReason,publicActions,hpChanges,makeBattlePresentation};
 if(typeof module==='object'&&module.exports)module.exports=root.NeoBattlePresentation;
})(typeof window==='undefined'?globalThis:window);
