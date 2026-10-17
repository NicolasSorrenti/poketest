'use strict';
// v0.6.3: reactive Trainer choices and lifecycle cleanup. These are follow-up
// corrections to the rules modules; intentionally leave other partial audit
// classifications unchanged until those cards have complete interaction tests.

// EXP.ALL says MAY. Even with just one Basic Energy and one recipient the
// defending human must have the option to decline; previously the v059 KO
// handler always moved that one Energy. Intercept BEFORE the normal KO cleanup.
const trainer63PreviousResolveKO=Engine.prototype.resolveKO;
Engine.prototype.resolveKO=function(...args){
 const victim=this.foe?.active,owner=this.foe;
 if(this.turn===1&&this.phase==='game'&&!this.over&&!this._trainer60ExpPrompt&&victim&&
    victim.damage>=this.maxHP(victim)&&victim.incomingAttack?.turnSerial===this.turnSerial&&victim.incomingAttack.damage>0&&
    !victim._trainer59ExpHandled){
  const energies=victim.energies.map((id,index)=>({id,index})).filter(x=>isBasicEnergyCard(lookup.get(x.id)));
  const recipients=owner.bench.map((u,slot)=>({u,slot})).filter(x=>x.u.damage<this.maxHP(x.u)&&(x.u.attachedTrainers||[]).some(t=>lookup.get(t.id)?.name==='EXP.ALL'));
  if(energies.length&&recipients.length){
   const selections=recipients.flatMap(({u,slot})=>energies.map(({id,index})=>({
    index:`${slot}:${index}`,name:`${this.card(u)?.name||'Benched Pokémon'} receives ${lookup.get(id)?.name||id}`
   })));
   const options=[{index:'skip',name:'Decline EXP.ALL — discard the Energy as normal'},...selections];
   this._trainer60ExpPrompt={victim,owner};
   deckSearchRequest={
    label:'EXP.ALL: your Active Pokémon is about to be Knocked Out. You may save one Basic Energy.',
    defenderPrompt:true,options,
    execute:key=>{
     if(!options.some(x=>x.index===key)||this._trainer60ExpPrompt?.victim!==victim)return false;
     if(owner.active!==victim||victim.damage<this.maxHP(victim))return false;
     let transfer=null;
     if(key!=='skip'){
      const [slot,index]=key.split(':').map(Number),receiver=owner.bench[slot];
      const selected=victim.energies[index];
      const tool=receiver?.attachedTrainers?.find(t=>lookup.get(t.id)?.name==='EXP.ALL');
      if(!receiver||receiver.damage>=this.maxHP(receiver)||!tool||!isBasicEnergyCard(lookup.get(selected)))return false;
      transfer={receiver,index,selected,tool};
     }
     // Validation has finished, so the player cannot cause a partial KO.
     if(transfer){
      victim.energies.splice(transfer.index,1);
      transfer.receiver.energies.push(transfer.selected);
      transfer.receiver.attachedTrainers.splice(transfer.receiver.attachedTrainers.indexOf(transfer.tool),1);
      owner.discard.push(transfer.tool.id);
      this.log(`EXP.ALL saved ${lookup.get(transfer.selected)?.name||'Basic Energy'} for ${this.card(transfer.receiver)?.name}.`);
     }else this.log('EXP.ALL was declined; attached Energy will be discarded with the Pokémon.');
     victim._trainer59ExpHandled=true;this._trainer60ExpPrompt=null;deckSearchRequest=null;
     trainer63PreviousResolveKO.call(this,...args);
     render();
     if(cpuResumeChoice){const resume=cpuResumeChoice;cpuResumeChoice=null;resume(true);}
     return true;
    }
   };
   this.log('EXP.ALL: the defending player must choose whether to save an Energy.');
   render();return null;
  }
 }
 return trainer63PreviousResolveKO.apply(this,args);
};

// Koga's Ninja Trick is discarded whenever its host moves from Active to Bench,
// not only when the Ninja Trick response itself causes that movement.
// Preserve card identity to avoid erroneously discarding a Tool on a different
// copy of the same Pokémon.
function trainer63NinjaWatch(game){
 return game.players.flatMap(owner=>owner.active?.attachedTrainers?.some(t=>lookup.get(t.id)?.name==="Koga's Ninja Trick")
  ?[{owner,pokemon:owner.active}]:[]);
}
function trainer63NinjaCleanup(game,watch){
 for(const {owner,pokemon} of watch){
  if(owner.active===pokemon||!owner.bench.includes(pokemon))continue;
  for(const item of (pokemon.attachedTrainers||[]).slice()){
   if(lookup.get(item.id)?.name!=="Koga's Ninja Trick")continue;
   pokemon.attachedTrainers.splice(pokemon.attachedTrainers.indexOf(item),1);
   owner.discard.push(item.id);
   game.log("Koga's Ninja Trick was discarded when its Pokémon moved to the Bench.");
  }
 }
}
for(const action of ['retreat','trainer','trainer58','trainer59','attack','power56','stepIn','end']){
 const previous=Engine.prototype[action];if(typeof previous!=='function')continue;
 Engine.prototype[action]=function(...args){
  const watch=trainer63NinjaWatch(this);
  const response=previous.apply(this,args);
  trainer63NinjaCleanup(this,watch);
  return response;
 };
}

// Chaos Gym cannot cause an impossible Trainer play to be discarded or flip a
// coin. Check clear mandatory-field prerequisites before its permission flip;
// the underlying Trainer handler still validates card-specific choices.
const trainer63PreviousTrainer=Engine.prototype.trainer;
Engine.prototype.trainer=function(i,slot=null){
 const card=lookup.get(this.me?.hand?.[i]);
 if(lookup.get(this.stadium?.id)?.name==='Chaos Gym'&&card?.supertype==='Trainer'&&!(card.subtypes||[]).includes('Stadium')){
  const n=card.name,own=[this.me.active,...this.me.bench].filter(Boolean),foe=[this.foe.active,...this.foe.bench].filter(Boolean);
  if((n==='Switch'&&!this.me.bench.length)||(n==='Gust of Wind'&&!this.foe.bench.length)||
     (n==='Potion'&&!own.some(u=>u.damage>0))||
     (n==='Super Potion'&&!own.some(u=>u.damage>0&&u.energies.length))||
     (n==='Energy Removal'&&!foe.some(u=>u.energies.length&&!(u.attachedTrainers||[]).some(t=>lookup.get(t.id)?.name==="Brock's Protection")))){
   this.log(`Cannot play ${n}: it has no valid target. Chaos Gym does not flip.`);
   render();return false;
  }
 }
 return trainer63PreviousTrainer.call(this,i,slot);
};
