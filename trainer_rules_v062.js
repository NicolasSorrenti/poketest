'use strict';
// v0.6.2: Pokémon Tower applies to ALL sources (attacks, Pokémon Powers,
// Trainers), not only the Trainer implementation. This guards actual zone
// transfers, including a deferred card-selection confirmation.
function trainer62TowerActive(game){return lookup.get(game.stadium?.id)?.name==='Pokémon Tower';}
function trainer62TowerSnapshot(game){
 if(!trainer62TowerActive(game))return null;
 return game.players.map(p=>({side:p,discard:p.discard.slice(),hand:p.hand.slice()}));
}
function trainer62Counts(zone){const result=new Map();for(const id of zone)result.set(id,(result.get(id)||0)+1);return result;}
function trainer62EnforceTower(game,before){
 if(!before||!trainer62TowerActive(game))return;
 for(const {side,discard,hand} of before){
  const initialDiscard=trainer62Counts(discard),initialHand=trainer62Counts(hand);
  const currentDiscard=trainer62Counts(side.discard),currentHand=trainer62Counts(side.hand);
  for(const [id,count] of initialDiscard){
   const taken=Math.max(0,count-(currentDiscard.get(id)||0));
   const received=Math.max(0,(currentHand.get(id)||0)-(initialHand.get(id)||0));
   let blocked=Math.min(taken,received);
   while(blocked--){const j=side.hand.lastIndexOf(id);if(j<0)break;
    side.discard.push(side.hand.splice(j,1)[0]);
    game.log(`Pokémon Tower kept ${lookup.get(id)?.name||id} in its owner's discard pile.`);
   }
  }
 }
}
function trainer62WrapPrompt(game){
 const request=deckSearchRequest;
 if(!request||typeof request.execute!=='function'||request._tower62Wrapped)return;
 const previous=request.execute;
 request._tower62Wrapped=true;
 request.execute=function(...args){
  const snapshot=trainer62TowerSnapshot(game);
  const result=previous.apply(this,args);
  trainer62EnforceTower(game,snapshot);
  // A completed stage can create another player choice; guard it too.
  if(deckSearchRequest!==request)trainer62WrapPrompt(game);
  render();return result;
 };
}
// A face-down Secret Plan card is automatically revealed when an attack,
// Pokémon Power, or Trainer affects it, including zero-damage switches and
// Energy removal. Normal Bench-slot compaction is not an effect on the card.
function trainer62HiddenBefore(game){
 return game.players.flatMap(owner=>[owner.active,...owner.bench].filter(u=>u?.secretPlanFaceDown).map(u=>({
  u,owner,active:owner.active===u,damage:u.damage,status:u.status,poison:u.poison,burn:u.burn,
  energy:u.energies.join('|'),tools:(u.attachedTrainers||[]).map(t=>t.id).join('|'),
  type:u.coloringType,shield:u.attackShield
 })));
}
function trainer62RevealAffected(game,watchers){
 for(const w of watchers){const u=w.u,p=w.owner;
  if(!u.secretPlanFaceDown||![p.active,...p.bench].includes(u))continue;
  const affected=w.active!==(p.active===u)||w.damage!==u.damage||w.status!==u.status||
   w.poison!==u.poison||w.burn!==u.burn||w.energy!==u.energies.join('|')||
   w.tools!==(u.attachedTrainers||[]).map(t=>t.id).join('|')||
   w.type!==u.coloringType||w.shield!==u.attackShield;
  if(affected){game.revealSecretPlan(u,true);game.check();}
 }
}
function trainer62CoverTower(method){
 const original=Engine.prototype[method];if(typeof original!=='function')return;
 Engine.prototype[method]=function(...args){
  const snapshot=trainer62TowerSnapshot(this);
  const hidden=['attack','trainer','trainer58','power56'].includes(method)?trainer62HiddenBefore(this):[];
  // Rebirth discards its Pokémon *and then* recovers it during one KO call.
  // The general snapshot never observes the intermediate discard, so track
  // that Power explicitly. This is not a restriction on normal Prize draws.
  const rebirth=method==='resolveKO'&&snapshot?this.players.map(p=>{
   const u=p.active;
   return u&&u.damage>=this.maxHP(u)&&this.unitHasPower(u,'Rebirth')
    ?{owner:p,id:u.id,handCount:p.hand.filter(x=>x===u.id).length}:null;
  }).filter(Boolean):[];
  const result=original.apply(this,args);
  trainer62EnforceTower(this,snapshot);
  if(hidden.length)trainer62RevealAffected(this,hidden);
  for(const event of rebirth){
   const owner=event.owner;
   if(owner.hand.filter(x=>x===event.id).length<=event.handCount)continue;
   // If Time Travel or other protection saved the Pokémon, do not interfere.
   if([owner.active,...owner.bench].some(u=>u?.id===event.id))continue;
   const handIndex=owner.hand.lastIndexOf(event.id);
   if(handIndex>=0){owner.discard.push(owner.hand.splice(handIndex,1)[0]);
    this.log('Pokémon Tower prevented Rebirth from returning a Pokémon from the discard pile.');}
  }
  if(snapshot)trainer62WrapPrompt(this);
  return result;
 };
}
// The outer attack includes attack-copying and delegated effect interpreters;
// Power activation uses its own entrypoint. The earlier Trainer-specific Tower
// safeguard is retained as an additional protection.
for(const action of ['attack','power56','trainer','trainer58','resolveKO','onPlayEvolution','evolve','playBasic'])trainer62CoverTower(action);

// Blaine's Quiz #1: complete Johto-era species lengths (decimetres -> metres).
// Source: veekun/Pokédex species-height CSV, original Gen I/II forms.
// Unknown species are NOT assigned guessed lengths by the quiz.
const TRAINER62_JOHTO_HEIGHTS = `Chikorita:9 Bayleef:12 Meganium:18 Cyndaquil:5 Quilava:9 Typhlosion:17 Totodile:6 Croconaw:11 Feraligatr:23 Sentret:8 Furret:18 Hoothoot:7 Noctowl:16 Ledyba:10 Ledian:14 Spinarak:5 Ariados:11 Crobat:18 Chinchou:5 Lanturn:12 Pichu:3 Cleffa:3 Igglybuff:3 Togepi:3 Togetic:6 Natu:2 Xatu:15 Mareep:6 Flaaffy:8 Ampharos:14 Bellossom:4 Marill:4 Azumarill:8 Sudowoodo:12 Politoed:11 Hoppip:4 Skiploom:6 Jumpluff:8 Aipom:8 Sunkern:3 Sunflora:8 Yanma:12 Wooper:4 Quagsire:14 Espeon:9 Umbreon:10 Murkrow:5 Slowking:20 Misdreavus:7 Unown:5 Wobbuffet:13 Girafarig:15 Pineco:6 Forretress:12 Dunsparce:15 Gligar:11 Steelix:92 Snubbull:6 Granbull:14 Qwilfish:5 Scizor:18 Shuckle:6 Heracross:15 Sneasel:9 Teddiursa:6 Ursaring:18 Slugma:7 Magcargo:8 Swinub:4 Piloswine:11 Corsola:6 Remoraid:6 Octillery:9 Delibird:9 Mantine:21 Skarmory:17 Houndour:6 Houndoom:14 Kingdra:18 Phanpy:5 Donphan:11 Porygon2:6 Stantler:14 Smeargle:12 Tyrogue:7 Hitmontop:14 Smoochum:4 Elekid:6 Magby:7 Miltank:12 Blissey:15 Raikou:19 Entei:21 Suicune:20 Larvitar:6 Pupitar:12 Tyranitar:20 Lugia:52 Ho-Oh:38 Celebi:6`;
for(const pair of TRAINER62_JOHTO_HEIGHTS.split(' ')){
 const [name,dm]=pair.split(':');TRAINER59_HEIGHTS[name]=Number(dm)/10;
}
// Unown letter cards have the same species length regardless of letter.
const trainer62OriginalSpecies=trainer59Species;
trainer59Species=function(name){
 const species=trainer62OriginalSpecies(name);
 return /^Unown(?:\s+[A-Z])?$/i.test(species)?'Unown':species;
};
Object.assign(TRAINER59_HEIGHTS,{
 Abra:0.9,Kadabra:1.3,Alakazam:1.5,Poliwag:0.6,Poliwhirl:1,Poliwrath:1.3,
 'Nidoran♀':0.4,'Nidoran♂':0.5,'Ho-Oh':3.8
});
const trainer62SpeciesBase=trainer59Species;
trainer59Species=function(cardName){
 let n=String(cardName||'').replace(/^Team Rocket's\s+/,'')
  .replace(/^(?:Cool|Surfing|Flying)\s+/,'')
  .replace(/^_+'s\s+/,'');
 n=trainer62SpeciesBase(n);
 if(/^Unown(?:\s+[A-Z])?$/i.test(n))return 'Unown';
 if(/^Nidoran\s*♀$/i.test(n))return 'Nidoran♀';
 if(/^Nidoran\s*♂$/i.test(n))return 'Nidoran♂';
 if(/^Farfetch'd$/i.test(n))return 'Farfetchd';
 if(/^Ho-oh$/i.test(n))return 'Ho-Oh';
 return n;
};
