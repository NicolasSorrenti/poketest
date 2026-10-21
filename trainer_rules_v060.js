'use strict';
// v0.6.0 focused gameplay fixes. Keep pending defender choices separate from
// the active player's actions: EXP.ALL must interrupt a Knock Out and Charity
// must reduce the *final* damage (after Weakness/Resistance).
const trainer60PreviousResolveKO = Engine.prototype.resolveKO;
Engine.prototype.resolveKO = function(...args) {
 if(this._trainer60ExpPrompt)return null;
 const victim=this.foe?.active,owner=this.foe;
 if(this.turn===1&&victim&&victim.damage>=this.maxHP(victim)&&
    victim.incomingAttack?.turnSerial===this.turnSerial&&!victim._trainer59ExpHandled){
  const energies=victim.energies.map((id,index)=>({id,index})).filter(x=>isBasicEnergyCard(lookup.get(x.id)));
  const receivers=owner.bench.map((u,slot)=>({u,slot})).filter(x=>(x.u.attachedTrainers||[]).some(t=>lookup.get(t.id)?.name==='EXP.ALL'));
  if(energies.length&&receivers.length&&(energies.length!==1||receivers.length!==1)){
   const selections=receivers.flatMap(({u,slot})=>energies.map(({id,index})=>({
    index:slot+':'+index,id,name:`${this.card(u)?.name||'Benched Pokémon'} receives ${lookup.get(id)?.name||'Energy'}`})));
   const options=[{index:'skip',name:'Do not use EXP.ALL'},...selections];
   this._trainer60ExpPrompt={victim,owner};
   const finish=key=>{
    if(!options.some(x=>x.index===key))return false;
    if(this._trainer60ExpPrompt?.victim!==victim)return false;
    // Validate the target and Energy before consuming the pending interrupt.
    // A stale choice must not silently turn an optional EXP.ALL transfer into a KO.
    let transfer=null;
    if(key!=='skip'){
     const [slot,index]=key.split(':').map(Number),target=owner.bench[slot];
     const chosenEnergy=victim.energies[index],tool=target?.attachedTrainers?.find(x=>lookup.get(x.id)?.name==='EXP.ALL');
     if(!target||!tool||!isBasicEnergyCard(lookup.get(chosenEnergy)))return false;
     transfer={target,index,chosenEnergy,tool};
    }
    this._trainer60ExpPrompt=null;victim._trainer59ExpHandled=true;
    if(transfer){
     const {target,index,chosenEnergy,tool}=transfer;
     victim.energies.splice(index,1);target.energies.push(chosenEnergy);
     target.attachedTrainers.splice(target.attachedTrainers.indexOf(tool),1);owner.discard.push(tool.id);
     this.log(`EXP.ALL transferred ${lookup.get(chosenEnergy).name} to ${this.card(target)?.name}.`);
    }
    deckSearchRequest=null;
    trainer60PreviousResolveKO.call(this,...args);
    render();
    if(cpuResumeChoice){const next=cpuResumeChoice;cpuResumeChoice=null;next(true);}
    return true;
   };
   deckSearchRequest={label:'Your Active Pokémon is about to be Knocked Out. Choose whether and how to use EXP.ALL.',defenderPrompt:true,options,execute:finish};
   this.log('EXP.ALL: waiting for the defending player to choose an Energy transfer.');render();
   return null;
  }
 }
 return trainer60PreviousResolveKO.apply(this,args);
};
const trainer60PreviousEnd=Engine.prototype.end;
Engine.prototype.end=function(...args){
 if(this._trainer60ExpPrompt)return null;
 return trainer60PreviousEnd.apply(this,args);
};

const trainer60PreviousAttack=Engine.prototype.attack;
Engine.prototype.attack=function(i,benchTarget=null,deferTurnEnd=false,searchChoice=null,copyOverride=null){
 const affected=this.foe?.active;
 // Koga's Ninja Trick is a defending-player interrupt, BEFORE damage or any
 // other attack effect. In the CPU turn the human must be able to decide.
 const ninja=affected?.attachedTrainers?.find(x=>lookup.get(x.id)?.name==="Koga's Ninja Trick");
 const printed=this.card(this.me?.active)?.attacks?.[i];
 // The defending CPU has the same optional pre-damage window as a human.
 // Delegate directly to the previous attack implementation after switching so
 // this wrapper never offers the same response twice during a single attack.
 if(this.turn===0&&ninja&&this.foe.bench.length&&printed&&this.phase==='game'&&
    !this.over&&this.afford(this.me.active,printed.cost)&&
    !['Asleep','Paralyzed'].includes(this.me.active?.status)){
  const defender=this.foe,old=defender.active;
  const choices=defender.bench.map((u,index)=>({u,index,hp:this.maxHP(u)-u.damage}))
   .filter(x=>x.hp>0).sort((a,b)=>b.hp-a.hp);
  // Favor a healthier substitute. The effect is optional: do not switch into
  // a Pokemon that has less remaining HP than the protected Active Pokemon.
  const chosen=choices[0];
  if(chosen&&chosen.hp>this.maxHP(old)-old.damage){
   [defender.active,defender.bench[chosen.index]]=[defender.bench[chosen.index],old];
   old.attachedTrainers.splice(old.attachedTrainers.indexOf(ninja),1);
   defender.discard.push(ninja.id);
   old.status=null;old.poison=false;old.burn=false;
   this.log("Koga's Ninja Trick: defending CPU switched before the attack; Tool discarded.");
  }
  return trainer60PreviousAttack.call(this,i,benchTarget,deferTurnEnd,searchChoice,copyOverride);
 }
 if(this.turn===1&&ninja&&this.foe.bench.length&&printed&&this.phase==='game'&&
    !this.over&&this.afford(this.me.active,printed.cost)&&
    !['Asleep','Paralyzed'].includes(this.me.active?.status)&&
    !this._trainer60NinjaPending){
  this._trainer60NinjaPending=true;
  const owner=this.foe,options=[{index:-1,name:'Stay Active (do not use Ninja Trick)'},
   ...owner.bench.map((u,index)=>({index,name:'Switch to '+(this.card(u)?.name||'Pokémon')}))];
  deckSearchRequest={label:"Koga's Ninja Trick: rival is attacking. Choose whether to switch before the attack resolves.",defenderPrompt:true,options,execute:choice=>{
   if(!options.some(x=>x.index===choice)||!this._trainer60NinjaPending)return false;
   if(choice!==-1){
    const previous=owner.active;[owner.active,owner.bench[choice]]=[owner.bench[choice],owner.active];
    previous.attachedTrainers.splice(previous.attachedTrainers.indexOf(ninja),1);
    owner.discard.push(ninja.id);previous.status=null;previous.poison=false;previous.burn=false;
    this.log("Koga's Ninja Trick switched Pokémon before the incoming attack.");
   }
   this._trainer60NinjaPending=false;deckSearchRequest=null;
   const outcome=trainer60PreviousAttack.call(this,i,benchTarget,deferTurnEnd,searchChoice,copyOverride);
   render();if(cpuResumeChoice){const finish=cpuResumeChoice;cpuResumeChoice=null;finish(Boolean(outcome));}
   return outcome;
  }};render();return false;
 }

 const attacker=this.me?.active,card=this.card(attacker),attack=copyOverride?.attack||card?.attacks?.[i];
 const hasCharity=this.turn===0&&attacker?.attachedTrainers?.some(x=>lookup.get(x.id)?.name==='Charity');
 if(hasCharity&&attack&&this.phase==='game'&&!this.over&&
   this.afford(attacker,card.attacks?.[i]?.cost||[])&&
   !['Asleep','Paralyzed'].includes(attacker.status)&&
   attacker._trainer60CharitySerial!==this.turnSerial){
  deckSearchRequest={
   label:'Charity: choose how much attack damage to give up (after Weakness and Resistance).',
   options:[...Array.from({length:101},(_,index)=>({index:index*10,name:index?`Reduce damage by up to ${index*10}`:'Do not reduce damage'})),{index:'all',name:'Reduce all damage (any amount)'}],
   execute:value=>{
    if(value!=='all'&&(!Number.isInteger(value)||value<0||value>1000||value%10))return false;
    attacker._trainer60CharitySerial=this.turnSerial;
    attacker._trainer60CharityReduction=value==='all'?Number.POSITIVE_INFINITY:value;
    deckSearchRequest=null;
    const result=trainer60PreviousAttack.call(this,i,benchTarget,deferTurnEnd,searchChoice,copyOverride);
    if(result===false){delete attacker._trainer60CharitySerial;delete attacker._trainer60CharityReduction;}
    render();return result;
   }
  };render();return null;
 }
 return trainer60PreviousAttack.call(this,i,benchTarget,deferTurnEnd,searchChoice,copyOverride);
};
Engine.prototype.trainer60ApplyCharity=function(u,damage){
 if(!(u?.attachedTrainers||[]).some(x=>lookup.get(x.id)?.name==='Charity')||!Number.isFinite(damage)||damage<=0)return damage;
 const toReduce=Math.min(damage,u._trainer60CharityReduction||0);
 if(toReduce)this.log(`Charity voluntarily reduced attack damage by ${toReduce}.`);
 return Math.max(0,damage-toReduce);
};

// Chaos Gym is a permission check, not a list of four special-cased Trainers.
// When the human loses the flip, a computer-controlled rival may legally play
// the card by paying the costs from ITS hand/field. Its owner still discards it.
const trainer60PreviousTrainer=Engine.prototype.trainer;
Engine.prototype.trainer=function(i,slot=null){
 const card=lookup.get(this.me?.hand?.[i]),name=card?.name;
 if(lookup.get(this.stadium?.id)?.name!=='Chaos Gym'||!card||card.supertype!=='Trainer'||(card.subtypes||[]).includes('Stadium'))return trainer60PreviousTrainer.call(this,i,slot);
 const owner=this.me;
 if(this.phase!=='game'||this.over||owner.trainerLockUntil>=this.round&&owner.trainerLockUntil>0||this.continuousPower('Hay Fever'))return false;
 if(coin('Chaos Gym — Trainer permission')){
  const stadium=this.stadium;this.stadium=null;
  try{return trainer60PreviousTrainer.call(this,i,slot)}finally{if(!this.stadium)this.stadium=stadium}
 }
 const id=owner.hand.splice(i,1)[0];owner.discard.push(id);
 let replay=false;
 if(this._trainer60MayRivalReplay(card)){
  if(this.turn===1){
   // During the CPU turn the human is the receiving player. They decide
   // whether to accept the redirected Trainer rather than being skipped.
   deckSearchRequest={label:`Chaos Gym: opponent's ${name} failed its flip. Use this Trainer?`,defenderPrompt:true,
    options:[{index:0,name:'Decline'},{index:1,name:`Use ${name}`}],
    execute:choice=>{
     if(choice!==0&&choice!==1)return false;
     deckSearchRequest=null;
     const used=choice===1&&this._trainer60RivalReplay(id);
     this.log(`Chaos Gym: ${name} — ${used?'you used it':'declined or could not be played'}.`);
     render();if(cpuResumeChoice){const resume=cpuResumeChoice;cpuResumeChoice=null;resume(true)}
     return true;
    }};
   render();return true;
  }
  replay=this._trainer60RivalReplay(id);
 }
 this.log(`Chaos Gym: ${name} failed its flip; ${replay?'the rival used it':'the rival declined or could not play it'}.`);
 render();return true;
};
Engine.prototype._trainer60MayRivalReplay=function(card){
 const excluded=new Set(['Chaos Gym','Sabrina\'s Psychic Control','Blaine\'s Quiz #1','Blaine\'s Quiz #2','Blaine\'s Quiz #3',
  'Erika','Computer Error','Time Capsule','Challenge!','Lt. Surge\'s Treaty','Misty\'s Wish','Misty\'s Duel']);
 // Attached Trainers and persistent cards cannot be safely redirected as
 // simple one-shot effects: doing so would duplicate a physical attachment.
 const text=(card.rules||[]).join(' ');
 if(/Attach .+ to|This card stays in play|Put this card into play/i.test(text))return false;
 return !excluded.has(card.name)&&(TRAINER58.has(card.name)||['Potion','Switch','Gust of Wind','Energy Removal','Bill','Professor Oak'].includes(card.name));
};
Engine.prototype._trainer60RivalReplay=function(id){
 const oldTurn=this.turn,opponent=this.players[1-oldTurn],lastDeckSearch=deckSearchRequest;
 // A rejected delegated Trainer must never leave partial costs or effects.
 // Preserve player object identity because UI and engine callbacks reference it.
 const playerSnapshot=this.players.map(p=>JSON.stringify(p));
 const stadiumSnapshot=this.stadium?JSON.stringify(this.stadium):null;
 const oldLogs=this.logs?.length;
 // Do not let the replay discard a card that the human still owns.
 opponent.hand.push(id);this.turn=1-oldTurn;
 let success=false;
 try{
  const idx=opponent.hand.lastIndexOf(id);
  let outcome=trainer59Previous.call(this,idx);
  // Trainer58 choices are transactional until commit. Feed only options valid
  // in the rival's own zones. Never display a human prompt for these choices.
  for(let steps=0;steps<30&&outcome===null&&deckSearchRequest;steps++){
   const q=deckSearchRequest;
   if(q.defenderPrompt)break;
   const opts=q.options||[];
   if(!opts.length)break;
   // Resolve only valid picker cardinalities. A redirected Trainer must not
   // bypass mandatory payments by submitting too few selections.
   const min=q.multi?Math.max(0,Number(q.min??1)):1;
   const max=q.multi?Math.max(min,Number(q.max??min)):1;
   if(opts.length<min)break;
   const indexes=q.multi?opts.slice(0,Math.min(opts.length,max)).map(x=>x.index):opts[0].index;
   if(q.multi&&(indexes.length<min||indexes.length>max))break;
   outcome=q.execute(indexes);
  }
  // An effect may return true while opening a subsequent mandatory prompt.
  // A redirected play is only finished if it leaves no outstanding choice;
  // otherwise rolling back avoids silently dropping a mandatory decision.
  success=outcome===true&&(!deckSearchRequest||deckSearchRequest===lastDeckSearch);
 }catch(err){this.log('Chaos Gym replay was declined because its requirements could not be resolved.');}
 finally{
  const ix=opponent.hand.lastIndexOf(id);if(ix>=0)opponent.hand.splice(ix,1);
  if(success){const discard=opponent.discard.lastIndexOf(id);if(discard>=0)opponent.discard.splice(discard,1)}
  this.turn=oldTurn;deckSearchRequest=lastDeckSearch;
  if(!success){
   for(let side=0;side<2;side++){const saved=JSON.parse(playerSnapshot[side]);for(const k of Object.keys(this.players[side]))delete this.players[side][k];Object.assign(this.players[side],saved)}
   this.stadium=stadiumSnapshot?JSON.parse(stadiumSnapshot):null;
   if(Number.isInteger(oldLogs)&&this.logs)this.logs.length=oldLogs;
  }
 }
 return success;
};
// TCGdex omits the Evolves From field on some vintage Fossil Pokémon.
// Fossil Egg and certain Powers place these Stage 1 cards as Basics.
const trainer60PreviousCard=Engine.prototype.card;
Engine.prototype.card=function(u){
 const card=trainer60PreviousCard.call(this,u);
 return u?.fossilAsBasic&&card?{...card,subtypes:['Basic']}:card;
};
Engine.prototype.discardMysteriousFossil=function(slot=-1){
 const p=this.me,u=slot===-1?p.active:p.bench[slot];
 if(this.phase!=='game'||this.over||this.turn!==0||this.card(u)?.name!=='Mysterious Fossil')return false;
 p.discard.push(u.id,...(u.under||[]),...(u.energies||[]),...(u.attachedTrainers||[]).map(x=>x.id));
 if(slot===-1)p.active=p.bench.shift()||null;
 else p.bench.splice(slot,1);
 this.log('Mysterious Fossil was voluntarily discarded.');this.check();render();return true;
};
const trainer60FossilPreviousResolve=Engine.prototype.resolveKO;
Engine.prototype.resolveKO=function(...args){
 for(const p of this.players)for(const u of [p.active,...p.bench])if(this.card(u)?.name==='Mysterious Fossil'){
  u.status=null;u.poison=false;u.burn=false;
 }
 return trainer60FossilPreviousResolve.apply(this,args);
};
