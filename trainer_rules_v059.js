'use strict';
// v0.5.9: close missing Trainer dispatch paths and fix choice ownership.
// All choices are checked against current zones; no Trainer is consumed while a
// choice remains pending. Opponent guesses in solo mode are CPU decisions.
const TRAINER59=new Set(["Blaine's Quiz #1","Blaine's Quiz #3","Lt. Surge's Secret Plan","Sabrina's Psychic Control"]);
const trainer59Previous=Engine.prototype.trainer;
const trainer59OldTrainer58=Engine.prototype.trainer58;
const trainer59OriginalCard=Engine.prototype.card;
// Known, printed species heights. A separate exhaustive archive of printed
// heights is not bundled in TCGdex; unknown heights are deliberately blocked.
const TRAINER59_HEIGHTS={
  Bulbasaur:0.7,Ivysaur:1,Venusaur:2,Charmander:0.6,Charmeleon:1.1,Charizard:1.7,
  Squirtle:0.5,Wartortle:1,Blastoise:1.6,Caterpie:0.3,Metapod:0.7,Butterfree:1.1,
  Weedle:0.3,Kakuna:0.6,Beedrill:1,Pidgey:0.3,Pidgeotto:1.1,Pidgeot:1.5,
  Rattata:0.3,Raticate:0.7,Spearow:0.3,Fearow:1.2,Ekans:2,Arbok:3.5,
  Pikachu:0.4,Raichu:0.8,Sandshrew:0.6,Sandslash:1,Nidoran:0.4,Nidorina:0.8,
  Nidoqueen:1.3,Nidorino:0.9,Nidoking:1.4,Clefairy:0.6,Clefable:1.3,
  Vulpix:0.6,Ninetales:1.1,Jigglypuff:0.5,Wigglytuff:1,Zubat:0.8,Golbat:1.6,
  Oddish:0.5,Gloom:0.8,Vileplume:1.2,Paras:0.3,Parasect:1,Venonat:1,
  Venomoth:1.5,Diglett:0.2,Dugtrio:0.7,Meowth:0.4,Persian:1,Growlithe:0.7,
  Arcanine:1.9,Psyduck:0.8,Golduck:1.7,Mankey:0.5,Primeape:1,Machop:0.8,
  Machoke:1.5,Machamp:1.6,Bellsprout:0.7,Weepinbell:1,Victreebel:1.7,
  Tentacool:0.9,Tentacruel:1.6,Geodude:0.4,Graveler:1,Golem:1.4,
  Ponyta:1,Rapidash:1.7,Slowpoke:1.2,Slowbro:1.6,Magnemite:0.3,Magneton:1,
  Farfetchd:0.8,Doduo:1.4,Dodrio:1.8,Seel:1.1,Dewgong:1.7,Grimer:0.9,
  Muk:1.2,Shellder:0.3,Cloyster:1.5,Gastly:1.3,Haunter:1.6,Gengar:1.5,
  Onix:8.8,Drowzee:1,Hypno:1.6,Krabby:0.4,Kingler:1.3,Voltorb:0.5,
  Electrode:1.2,Exeggcute:0.4,Exeggutor:2,Cubone:0.4,Marowak:1,
  Hitmonlee:1.5,Hitmonchan:1.4,Lickitung:1.2,Koffing:0.6,Weezing:1.2,
  Rhyhorn:1,Rhydon:1.9,Chansey:1.1,Tangela:1,Kangaskhan:2.2,Horsea:0.4,
  Seadra:1.2,Goldeen:0.6,Seaking:1.3,Staryu:0.8,Starmie:1.1,
  'Mr. Mime':1.3,Scyther:1.5,Jynx:1.4,Electabuzz:1.1,Magmar:1.3,
  Pinsir:1.5,Tauros:1.4,Magikarp:0.9,Gyarados:6.5,Lapras:2.5,Ditto:0.3,
  Eevee:0.3,Vaporeon:1,Jolteon:0.8,Flareon:0.9,Porygon:0.8,Omanyte:0.4,
  Omastar:1,Kabuto:0.5,Kabutops:1.3,Aerodactyl:1.8,Snorlax:2.1,
  Articuno:1.7,Zapdos:1.6,Moltres:2,Dratini:1.8,Dragonair:4,Dragonite:2.2,
  Mewtwo:2,Mew:0.4
};
function trainer59Species(n){return String(n||'').replace(/^(?:Blaine's|Brock's|Erika's|Giovanni's|Koga's|Lt\. Surge's|Misty's|Sabrina's|Rocket's|Dark|Light|Shining)\s+/i,'').replace(/\s*\[.*\]$/,'').trim()}
function trainer59Height(c){if(Number.isFinite(c?.height_m))return +c.height_m;if(Number.isFinite(c?.height))return +c.height;return TRAINER59_HEIGHTS[trainer59Species(c?.name)]}
function trainer59EligibleReplay(card){
 if(!card||card.supertype!=='Trainer')return false;
 if((card.subtypes||[]).includes('Stadium'))return false;
 if(/(?:Attach .+ to|This card stays in play|Put this card into play)/i.test((card.rules||[]).join(' ')))return false;
 return TRAINER58.has(card.name)||new Set(['Switch','Gust of Wind','Potion','Super Potion','Energy Removal']).has(card.name);
}
Engine.prototype.trainer59=function(i,provided){
 const game=this,p=this.me,f=this.foe,c=lookup.get(p.hand[i]),name=c?.name,choices=Array.isArray(provided)?provided.slice():[],path=[];
 if(!TRAINER59.has(name)||this.phase!=='game'||this.over||this.turn!==0)return false;
 const pick=(label,options,callback)=>{
  if(!options.length)return false;
  const stage=path.length;
  const valid=v=>options.some(o=>o.index===v);
  if(stage<choices.length){const value=choices[stage];path.push(value);return valid(value)?callback(value):false}
  if(Array.isArray(provided))return false;
  const prefix=path.slice();
  deckSearchRequest={label:`${name}: ${label}`,options,selected:[],execute:v=>game.trainer59(p.hand.indexOf(c.id),[...prefix,v])};
  render();return null;
 };
 const commit=(message=name)=>{const j=p.hand.indexOf(c.id);if(j<0)return false;p.discard.push(p.hand.splice(j,1)[0]);deckSearchRequest=null;selected=null;game.log(`${p.name} played ${message}.`);game.resolveKO();render();return true};
 const sourceOptions=p.hand.map((id,index)=>({index,id,name:lookup.get(id)?.name||id})).filter(o=>{const card=lookup.get(o.id);return o.index!==i&&card?.supertype==='Pokémon'&&card.hp&&!isBasicEnergyCard(card)&&!['Clefairy Doll','Mysterious Fossil'].includes(card.name);});
 switch(name){
 case "Blaine's Quiz #1":{
  const available=sourceOptions.filter(o=>Number.isFinite(trainer59Height(lookup.get(o.id))));
  return pick('Select a Pokémon to announce by name (printed length will be the answer)',available,j=>{
   const shown=lookup.get(p.hand[j]),height=trainer59Height(shown);
   // Length is announced with the Pokémon name, not shown to the opponent.
   const possible=[...new Set(Object.values(TRAINER59_HEIGHTS))];
   const guess=possible[Math.floor(Math.random()*possible.length)];
   const right=Math.abs(guess-height)<0.000001;
   game.log(`Blaine's Quiz #1 — ${shown.name}; rival guessed ${guess.toFixed(1)}m; answer ${height.toFixed(1)}m.`);
   game.draw(right?f:p,2);return commit();
  });
 }
 case "Blaine's Quiz #3":return pick('Select a Pokémon from your hand',sourceOptions.filter(o=>lookup.get(o.id)?.attacks?.length),j=>{
   const shown=lookup.get(p.hand[j]);
   return pick('Announce one printed attack (rival guesses the Pokémon)',(shown.attacks||[]).map((a,index)=>({index,name:a.name,id:shown.id})),attackIndex=>{
    const attack=shown.attacks[attackIndex].name;
    const options=[...new Set(Array.from(lookup.values()).filter(x=>x.supertype==='Pokémon'&&x.attacks?.some(a=>a.name===attack)).map(x=>x.name))];
    const guess=options[Math.floor(Math.random()*options.length)]||'';
    const correct=guess===shown.name;
    game.log(`Blaine's Quiz #3 — attack ${attack}; rival guessed ${guess}; revealed ${shown.name}.`);
    game.draw(correct?f:p,3);return commit();
   });
  });
 case "Lt. Surge's Secret Plan":{
  if(p.bench.length>=5)return false;
  const opts=p.hand.map((id,index)=>({index,id,name:lookup.get(id)?.name||id})).filter(o=>o.index!==i);
  return pick('Choose ANY other hand card to place face down as a Basic Pokémon',opts,j=>{
   // Revalidate before consuming either card: a pending choice may be stale.
   if(p.bench.length>=5||!p.hand.includes(c.id)||j===p.hand.indexOf(c.id)||!opts.some(o=>o.index===j&&o.id===p.hand[j]))return false;
   const id=p.hand.splice(j,1)[0],u=unit(id);u.secretPlanFaceDown=true;u.secretPlanOwner=game.turn;u.playedTurn=game.round;
   p.bench.push(u);return commit();
  });
 }
 case "Sabrina's Psychic Control":{
  // The selected Trainer remains physically in the rival discard pile. A
  // temporary proxy in the human hand lets existing selection handlers pay
  // the human player's costs; see trainer58's continuation wrapper below.
  const opts=f.discard.map((id,index)=>({index,id,name:lookup.get(id)?.name||id})).filter(o=>trainer59EligibleReplay(lookup.get(o.id)));
  const flipKey=`psychic:${game.turnSerial}:${c.id}:${i}`;
  if(!game._trainer59Coins)game._trainer59Coins=new Map();
  let heads=game._trainer59Coins.get(flipKey);
  if(heads===undefined){heads=coin(name);game._trainer59Coins.set(flipKey,heads)}
  if(!heads){game._trainer59Coins.delete(flipKey);return commit()}
  if(!opts.length){game._trainer59Coins.delete(flipKey);return commit()}
  return pick('Choose a playable Trainer in the rival discard pile',opts,j=>{
   const selectedOption=opts.find(o=>o.index===j);
   // The opponent's discard can change while the choice is pending. Never
   // substitute a different card at the same index or borrow a missing card.
   const id=selectedOption?.id;
   if(!id||f.discard[j]!==id||!trainer59EligibleReplay(lookup.get(id)))return false;
   const proxyId=`trainer59-proxy-${id}`;
   if(lookup.has(proxyId))return false; // avoid overwriting an active proxy
   lookup.set(proxyId,{...lookup.get(id),id:proxyId});
   const tempIndex=p.hand.length;p.hand.push(proxyId);
   game._psychicProxy59={id:proxyId,originalId:id,source:c.id,flipKey};
   const result=game.trainer(tempIndex);
   if(result===false){game.cancelPsychic59();return false}
   if(result===null){return null}
   // The replay wrapper already cleaned up the proxy and spent this Trainer.
   return true;
  });
 }
 default:return false;
 }
};
Engine.prototype.cancelPsychic59=function(){
 const proxy=this._psychicProxy59;if(!proxy)return;
 const p=this.me,k=p.hand.lastIndexOf(proxy.id);
 if(k>=0)p.hand.splice(k,1);
 this._psychicProxy59=null;deckSearchRequest=null;selected=null;render();
};
Engine.prototype.trainer58=function(...args){
 const outcome=trainer59OldTrainer58.apply(this,args);
 const proxy=this._psychicProxy59;
 if(!proxy)return outcome;
 if(outcome===true){
  const p=this.me;
  const idx=p.discard.lastIndexOf(proxy.id);
  if(idx>=0)p.discard.splice(idx,1); // virtual card never changes ownership
  const ctrl=p.hand.indexOf(proxy.source);
  if(ctrl>=0)p.discard.push(p.hand.splice(ctrl,1)[0]);
  this._trainer59Coins?.delete(proxy.flipKey);
  lookup.delete(proxy.id);this._psychicProxy59=null;
  this.log('Sabrina\'s Psychic Control resolved the rival Trainer without moving it from their discard.');
  render();
 }
 return outcome;
};
// Stadium Chaos Gym: coin-flip gates Trainer cards, including ones with
// choices. A failed play consumes its owner's card. The CPU only uses a
// diverted card if it has a safe, no-choice handler.
Engine.prototype.trainer=function(i,slot=null){
 const card=lookup.get(this.me?.hand?.[i]),name=card?.name;
 if(TRAINER59.has(name)||lookup.get(this.stadium?.id)?.name==='Chaos Gym'){
  if(this.phase!=='game'||this.over||!trainer(card)||this.me?.trainerLockUntil>=this.round&&this.me?.trainerLockUntil>0||this.continuousPower('Hay Fever'))return false;
 }
 if(lookup.get(this.stadium?.id)?.name==='Chaos Gym'&&card?.supertype==='Trainer'&&!(card.subtypes||[]).includes('Stadium')){
  if(!coin('Chaos Gym — Trainer permission')){
   const acting=this.me,opponent=this.foe;
   const id=acting.hand.splice(i,1)[0];
   acting.discard.push(id);
   // The rival may use the diverted card. Only reliable no-choice effects
   // are automated; others are declined rather than creating an illegal play.
   if(this.turn===0&&new Set(['Bill','Bill\'s Teleporter','Professor Oak','Full Heal']).has(name)&&!this.continuousPower('Hay Fever')){
    const originalTurn=this.turn;this.turn=1;opponent.hand.push(id);
    const temporaryIndex=opponent.hand.length-1;
    const result=trainer59Previous.call(this,temporaryIndex,slot);
    if(result===true){const inDiscard=opponent.discard.lastIndexOf(id);if(inDiscard>=0)opponent.discard.splice(inDiscard,1);}
    else {const handIndex=opponent.hand.lastIndexOf(id);if(handIndex>=0)opponent.hand.splice(handIndex,1)}
    this.turn=originalTurn;
    this.log(`Chaos Gym: ${name} failed its coin flip${result===true?'; rival used it.':'; rival declined.'}`);
   }else this.log(`Chaos Gym prevented ${name}.`);
   render();return true;
  }
 }
 if(TRAINER59.has(name))return this.trainer59(i);
 return trainer59Previous.call(this,i,slot);
};
// Face-down Secret Plan cards must not expose their contents in the board UI.
const TRAINER59_FACEDOWN={id:'trainer59-facedown',name:'Face-down Pokémon',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'10',attacks:[],retreatCost:[],weaknesses:[],resistances:[],abilities:[]};
Engine.prototype.card=function(u){if(u?.secretPlanFaceDown)return TRAINER59_FACEDOWN;return trainer59OriginalCard.call(this,u)};
Engine.prototype.revealSecretPlan=function(u,forced=false){
 if(!u?.secretPlanFaceDown)return false;
 // Only the controller may voluntarily expose their hidden card during their
 // own turn. Forced reveals (attacks, Powers, retreats, evolution) are exempt.
 const controller=this.players.findIndex(p=>p.active===u||p.bench.includes(u));
 if(!forced&&(controller<0||controller!==this.turn))return false;
 u.secretPlanFaceDown=false;
 const c=lookup.get(u.id),owner=this.players.find(p=>p.active===u||p.bench.includes(u));
 this.log(`Secret Plan revealed ${c?.name||'a card'}.`);
 if(!owner)return true;
 if(!basic(c)){
  owner.discard.push(u.id,...u.under,...u.energies,...(u.attachedTrainers||[]).map(x=>x.id));
  if(owner.active===u)owner.active=owner.bench.shift()||null;
  else owner.bench.splice(owner.bench.indexOf(u),1);
 }
 render();return true;
};
const trainer59OriginalRetreat=Engine.prototype.retreat;
Engine.prototype.retreat=function(idx){if(this.me.active?.secretPlanFaceDown)this.revealSecretPlan(this.me.active,true);return trainer59OriginalRetreat.call(this,idx)};
const trainer59OriginalEvolve=Engine.prototype.evolve;
Engine.prototype.evolve=function(i,slot){const u=slot===-1?this.me.active:this.me.bench[slot];if(u?.secretPlanFaceDown)this.revealSecretPlan(u,true);return trainer59OriginalEvolve.call(this,i,slot)};
const trainer59OriginalResolveKO=Engine.prototype.resolveKO;
Engine.prototype.resolveKO=function(...args){
 for(const side of this.players)for(const u of [side.active,...side.bench])if(u?.secretPlanFaceDown&&(u.damage>0||u.poison||u.burn||u.status))this.revealSecretPlan(u,true);
 return trainer59OriginalResolveKO.apply(this,args);
};

// Counterattack Claws and EXP.ALL are attached Tools, not simple Stadium effects.
// The former responds to attack damage even if its host is knocked out.
const trainer59BeforeToolResolve=Engine.prototype.resolveKO;
Engine.prototype.resolveKO=function(...args){
 const defending=this.foe?.active,attacker=this.me?.active;
 if(defending&&attacker&&defending.incomingAttack?.turnSerial===this.turnSerial&&defending.incomingAttack.damage>0){
  const stamp=`${this.turnSerial}:${this.me?.active?.id}:${defending.incomingAttack.damage}`;
  if(defending._trainer59ClawsStamp!==stamp){
   defending._trainer59ClawsStamp=stamp;
   const own=this.foe;
   for(const item of (defending.attachedTrainers||[]).slice())if(lookup.get(item.id)?.name==='Counterattack Claws'){
    defending.attachedTrainers.splice(defending.attachedTrainers.indexOf(item),1);
    own.discard.push(item.id);
    if(coin('Counterattack Claws')){attacker.damage+=20;this.log('Counterattack Claws put 2 damage counters on the attacking Pokémon.');}
   }
  }
 }
 // EXP.ALL: correct for the no-choice case (exactly one Basic Energy on the
 // knocked out Active). Multiple eligible Energy still require a defender
 // selection window before the knockout; tracked as partial in the audit.
 const victim=this.foe?.active,owner=this.foe;
 if(victim&&victim.damage>=this.maxHP(victim)&&victim.incomingAttack?.turnSerial===this.turnSerial&&!victim._trainer59ExpHandled){
  victim._trainer59ExpHandled=true;
  const energies=victim.energies.filter(id=>trainer58Energy(lookup.get(id)));
  const receivers=owner.bench.filter(u=>(u.attachedTrainers||[]).some(x=>lookup.get(x.id)?.name==='EXP.ALL'));
  if(energies.length===1&&receivers.length===1){
   const id=energies[0],target=receivers[0];
   victim.energies.splice(victim.energies.indexOf(id),1);target.energies.push(id);
   const tool=target.attachedTrainers.find(x=>lookup.get(x.id)?.name==='EXP.ALL');
   target.attachedTrainers.splice(target.attachedTrainers.indexOf(tool),1);owner.discard.push(tool.id);
   this.log('EXP.ALL saved one Basic Energy from the Knocked Out Active Pokémon.');
  }
 }
 return trainer59BeforeToolResolve.apply(this,args);
};

// Charity returns to hand if its Pokémon survives through the end of turn.
// Its optional damage-reduction choice still needs a separate attack-damage UI.
const trainer59BaseEnd=Engine.prototype.end;
Engine.prototype.end=function(...args){
 const owner=this.me;
 for(const u of [owner?.active,...(owner?.bench||[])])if(u?.attachedTrainers){
  for(const tool of u.attachedTrainers.slice())if(lookup.get(tool.id)?.name==='Charity'){
   u.attachedTrainers.splice(u.attachedTrainers.indexOf(tool),1);owner.hand.push(tool.id);
   this.log("Charity returned to its owner's hand at the end of the turn.");
  }
 }
 return trainer59BaseEnd.apply(this,args);
};
