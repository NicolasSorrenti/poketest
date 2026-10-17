// Historical attacks added in v0.4.7. These are identified by printing ID and
// attack name, not by broad matches against incomplete translated card text.
const ATTACK47 = Object.freeze({
 'basep-8|Devolution Beam':{kind:'devolve'},
 'basep-9|Devolution Beam':{kind:'devolve'},
 'neo1-24|Feint Attack':{kind:'feint',damage:20},
 'neo2-13|Feint Attack':{kind:'feint',damage:30},
 'base3-14|Gigashock':{kind:'benchSpreadChoose',count:3,exact:true,damage:10},
 'base3-29|Gigashock':{kind:'benchSpreadChoose',count:3,exact:true,damage:10},
 'gym1-20|Rock Slide':{kind:'benchSpreadChoose',count:3,damage:10},
 'gym1-21|Tunneling':{kind:'benchSpreadChoose',count:2,damage:20,attackLock:true},
 'gym2-4|Wide Solarbeam':{kind:'benchSpreadChoose',count:2,exact:true,damage:20},
 'base3-12|Wildfire':{kind:'wildfire'},
 'base3-27|Wildfire':{kind:'wildfire'},
 'neo3-66|Dragon Bond':{kind:'searchDragon'},
 'basep-35|Let\'s Play!':{kind:'searchBaby'},
 'neo2-19|Magic Dust':{kind:'coinChooseStatus',statuses:['Asleep','Confused','Paralyzed','Poisoned']},
 'neo3-12|Delta Beam':{kind:'coinChooseStatus',statuses:['Asleep','Confused','Paralyzed']},
 'neo1-3|Sweet Nectar':{kind:'coinHealTarget'},
 'neo4-5|Crushing Blow':{kind:'coinEnergyDiscard'},
 'gym2-63|Pranks':{kind:'coinDiscardTop'}
});
function batch47Rule(card,attack){return ATTACK47[`${card?.id}|${attack?.name}`]||null}
function batch47Options(game,rule){
 const p=game.me,f=game.foe;
 switch(rule.kind){
  case 'devolve': return [
    ...[p.active,...p.bench].map((u,j)=>({key:j,side:0,slot:j-1,unit:u})),
    ...[f.active,...f.bench].map((u,j)=>({key:6+j,side:1,slot:j-1,unit:u}))
   ].filter(x=>x.unit?.under?.length).map(x=>({index:x.key,name:`${x.side===0?'Your':'Rival'} ${game.card(x.unit)?.name} (${x.slot===-1?'Active':'Bench '+(x.slot+1)})` }));
  case 'benchSpreadChoose':return f.bench.map((u,index)=>({index,name:`${game.card(u)?.name} (Bench ${index+1})`}));
  case 'wildfire':return game.me.active.energies.map((id,index)=>({index,name:`${lookup.get(id)?.name||id} (Energy ${index+1})`,id})).filter(x=>lookup.get(x.id)?.name==='Fire Energy');
  case 'searchBaby':return p.deck.map((id,index)=>({index,id,name:lookup.get(id)?.name})).filter(x=>(lookup.get(x.id)?.subtypes||[]).includes('Baby'));
  case 'coinChooseStatus':return rule.statuses.map((name,index)=>({index,name}));
  case 'coinHealTarget':return [p.active,...p.bench].filter(Boolean).map((u,index)=>({index,name:`${game.card(u)?.name} (${index?'Bench '+index:'Active'})`}));
  case 'coinEnergyDiscard':return f.active.energies.map((id,index)=>({index,name:`${lookup.get(id)?.name||id} (${index+1})`}));
  case 'coinDiscardTop':return f.discard.map((id,index)=>({index,name:lookup.get(id)?.name||id}));
  case 'searchDragon':return p.deck.map((id,index)=>({index,id,name:lookup.get(id)?.name})).filter(x=>['Gyarados','Dark Gyarados','Shining Gyarados'].includes(x.name));
  default:return [];
 }
}
function batch47Selection(game,rule,options,target,choice){
 if(rule.kind==='feint'){
  const slot=target===null&&game.turn===1?-1:target;
  return {ok:Number.isInteger(slot)&&slot>=-1&&slot<game.foe.bench.length,slot};
 }
 if(rule.kind==='searchBaby'&&game.me.bench.length>=5)return {ok:false};
 if(rule.kind==='devolve'&&!options.length)return {ok:false};
 if(rule.kind==='benchSpreadChoose'||rule.kind==='wildfire'){
  if(rule.kind==='benchSpreadChoose'&&!options.length)return {ok:true,values:[]};
  if(choice===null&&game.turn===1)choice=rule.kind==='wildfire'?options.slice(0,Math.min(options.length,game.foe.deck.length<=3?2:1)).map(o=>o.index):options.slice(0,rule.count).map(o=>o.index);
  if(choice===null&&game.turn===0&&options.length)return {ok:false,prompt:true,multi:true};
  const values=Array.isArray(choice)?choice:[];
  const max=rule.kind==='wildfire'?options.length:Math.min(rule.count,options.length);
  const min=rule.exact?max:0;
  if(values.length<min||values.length>max||new Set(values).size!==values.length||values.some(v=>!options.some(o=>o.index===v)))return {ok:false};
  return {ok:true,values};
 }
 if(['devolve','searchBaby','searchDragon','coinChooseStatus','coinHealTarget','coinEnergyDiscard','coinDiscardTop'].includes(rule.kind)){
  if(choice===null&&game.turn===0&&options.length)return {ok:false,prompt:true};
  if(choice===null){
   let best=options[0];
   if(game.turn===1&&rule.kind==='devolve')best=options.find(o=>o.index>=6)||best;
   if(game.turn===1&&rule.kind==='coinChooseStatus')best=options.find(o=>o.name==='Paralyzed')||options.find(o=>o.name==='Poisoned')||best;
   if(game.turn===1&&rule.kind==='coinHealTarget')best=[...options].sort((a,b)=>{const party=[game.me.active,...game.me.bench];return party[b.index].damage-party[a.index].damage})[0]||best;
   return {ok:true,value:best?.index??null};
  }
  if(!options.some(o=>o.index===choice))return {ok:false};
  return {ok:true,value:choice};
 }
 return {ok:false};
}
function batch47Resolve(game,rule,selection,attack,attacker,attackerPlayer,defenderPlayer,effectsBlocked=false){
 const p=attackerPlayer,f=defenderPlayer;
 if(rule.kind==='feint'){
  const victim=selection.slot===-1?f.active:f.bench[selection.slot];
  if(!victim)return;
  victim.damage+=rule.damage;
  game.log(`${attack.name} hit ${game.card(victim)?.name} for ${rule.damage}, ignoring Weakness, Resistance, Powers, and protection effects.`);
  battlefieldAttack(game.turn,selection.slot,attack.name,rule.damage,selection.slot!==-1);
 }
 if(rule.kind==='benchSpreadChoose'){
  const blocked=game.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=game.round);
  for(const slot of selection.values){const victim=f.bench[slot];if(!victim||blocked)continue;victim.damage+=rule.damage;battlefieldAttack(game.turn,slot,attack.name,rule.damage,true);}
  if(rule.attackLock)attacker.attackLocks.push({name:'*',until:game.round+1});
 }
 if(rule.kind==='wildfire'){
  for(const slot of [...selection.values].sort((a,b)=>b-a))p.discard.push(attacker.energies.splice(slot,1)[0]);
  for(let n=0;n<selection.values.length&&f.deck.length;n++)f.discard.push(f.deck.pop());
  game.log(`${attack.name}: discarded ${selection.values.length} Fire Energy; opponent discarded ${selection.values.length} cards from their deck (if available).`);
 }
 if(rule.kind==='devolve'){
  const side=selection.value>=6?f:p,slot=selection.value%6-1;
  const victim=slot===-1?side.active:side.bench[slot];if(!victim?.under?.length)return;
  const evolution=victim.id;
  victim.id=victim.under.shift();side.hand.push(evolution);
  victim.status=null;victim.poison=false;victim.poisonDamage=10;victim.burn=false;
  victim.attackShield=0;victim.preventAttackEffects=false;victim.cantRetreatUntil=0;
  victim.powerSilencedUntilSerial=0;victim.attackLocks=[];victim.usedAttacks={};
  // Devolution clears ongoing attack-imposed modifiers like an Evolution does.
  for(const key of ['smokescreenUntil','immuneUntil','preventBelow','damageBoost','damageBoostUntil','benchShieldUntil','nonDamageEffectsUntil','statusImmunityUntil','evolutionLockUntil','switchLockUntil','poisonOnEnergyUntil','energyAttachBlockUntil','damageOutgoingReductionUntil','persistentRetreatSource','persistentAttackLockSource','persistentAccuracySource','nextAttackBoost'])victim[key]=null;
  victim.halfShield=false;victim.cantRetreatUntilSerial=0;victim.coinDamageShieldUntil=0;
  game.log(`${attack.name}: returned ${lookup.get(evolution)?.name} to its owner's hand.`);
 }
 if(rule.kind==='coinChooseStatus'){
  if(coin(attack.name+' — condition check')&&!effectsBlocked&&selection.value!==null){
   const condition=rule.statuses[selection.value];
   if(condition==='Poisoned'){if(!game.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true;}
   else f.active.status=condition;
   game.log(`${attack.name}: ${game.card(f.active)?.name} became ${condition}.`);
  }
 }
 if(rule.kind==='coinHealTarget'&&coin(attack.name+' — healing')&&selection.value!==null){
  const target=[p.active,...p.bench][selection.value];if(target)target.damage=0;
 }
 if(rule.kind==='coinEnergyDiscard'&&f.active.energies.length&&coin(attack.name+' — discard')&&selection.value!==null){
  const id=f.active.energies.splice(selection.value,1)[0];if(id)f.discard.push(id);
 }
 if(rule.kind==='coinDiscardTop'&&coin(attack.name+' — recycle')&&selection.value!==null){
  const id=f.discard.splice(selection.value,1)[0];if(id)f.deck.push(id);
 }
 if(rule.kind==='searchBaby'||rule.kind==='searchDragon'){
  const slot=selection.value;
  if(slot!==null){const id=p.deck.splice(slot,1)[0];if(rule.kind==='searchBaby'){
   const newborn=unit(id);newborn.playedTurn=game.round;p.bench.push(newborn);
  }else p.hand.push(id);}
  p.deck=shuffle(p.deck);
  game.log(`${attack.name}: ${slot===null?'no eligible card found':'searched and shuffled the deck'}.`);
 }
}
