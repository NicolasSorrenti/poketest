'use strict';
const assert=require('node:assert/strict');
const HAYMAKER=require('./haymaker_decks');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy,validateDeck}=require('./core_rules');
const {ClassicLocalService,DECKS,deckOptions}=require('./classic_local_service');
const {ClassicOnlineService}=require('./classic_online_service');
const ATTACKS=require('./attack_effects_core');
const POWERS=require('./classic_power_core');
const TRAINERS=require('./classic_trainer_core');
assert.equal(HAYMAKER.entries.length,5);
assert.equal(new Set(HAYMAKER.entries.map(x=>x.id)).size,5);
assert.equal(HAYMAKER.has('__proto__'),false);
assert.equal(HAYMAKER.list('nope'),null);
assert.deepEqual(HAYMAKER.list('haymaker_classic'),HAYMAKER.list('haymaker_classic'));
const local=new ClassicLocalService({maxSessions:25});
const online=new ClassicOnlineService({maxRooms:20});
let checked=0;
for(const [index,preset] of HAYMAKER.entries.entries()){
 const list=HAYMAKER.list(preset.id);
 assert.equal(list.length,60,preset.id+' exactly 60 cards');
 assert.equal(DECKS[preset.id],'haymaker:'+preset.id);
 assert(deckOptions().some(x=>x.id===preset.id&&x.haymaker),'Deck selector missing '+preset.id);
 assert.deepEqual(local.decklist(preset.id),list,'Published deck list differs');
 const valid=validateDeck(list,CATALOG);
 assert(valid.valid,preset.id+' deck illegal: '+valid.errors?.join(', '));
 const byName=new Map(),pokemon=[],trainers=[],energies=[];
 for(const id of list){
  const c=CATALOG.get(id);
  assert(c,'Unknown '+id);
  assert(/^base[123]-/.test(id),'Non-Base/Jungle/Fossil printing: '+id);
  if(c.supertype==='Pokémon'){
   assert(isBasicPokemon(c),'Haymaker cannot include an evolved Pokémon: '+c.name);
   assert((c.attacks||[]).length>0,'Standalone Haymaker must have usable attacks: '+c.name);
   assert((c.attacks||[]).every(a=>!!ATTACKS.compile(a)),'Unsupported attack: '+c.name);
   assert((c.abilities||[]).every(a=>[POWERS.ACTIVATED,POWERS.PASSIVE,POWERS.ONPLAY].some(pool=>pool.has(a.name))),
    'Unsupported Pokémon Power: '+c.name);
   pokemon.push(id);
  }else if(c.supertype==='Trainer'){
   assert(TRAINERS.SUPPORTED.has(c.name),'Unsupported Trainer '+c.name);
   trainers.push(id);
  }else if(isEnergy(c))energies.push(id);
  else assert.fail('Unexpected card supertype '+id);
  if(!isEnergy(c)||c.name==='Double Colorless Energy'){
   byName.set(c.name,(byName.get(c.name)||0)+1);
  }
 }
 for(const [name,n] of byName)assert(n<=4,preset.id+' violates four-of for '+name);
 assert(pokemon.length>=14&&pokemon.length<=16,'Unexpected Pokémon count');
 assert(trainers.length>=24&&trainers.length<=28,'Unexpected Trainer count');
 assert(energies.length>=17&&energies.length<=21,'Unexpected Energy count');
 // New decks are fully selectable as both human and CPU opponents.
 const asHuman=local.create({deck:preset.id,opponent:'blackout',seed:1100+index});
 assert.deepEqual(asHuman.counts,[60,60]);
 const asCpu=local.create({deck:'blackout',opponent:preset.id,seed:2200+index});
 assert.deepEqual(asCpu.counts,[60,60]);
 assert.equal(asHuman.view.players[1].hand,undefined,'CPU hand leaked');
 // A separate online room with one of each deck must still start legitimately.
 const host=online.create({deck:preset.id,name:'Haymaker Host'});
 const other=HAYMAKER.entries[(index+1)%HAYMAKER.entries.length].id;
 const guest=online.join({code:host.code,deck:other,name:'Haymaker Guest'});
 assert.equal(guest.players[1].deck,other);
 online.ready(host.code,host.token,{ready:true,revision:guest.revision});
 online.ready(host.code,guest.token,{ready:true,revision:guest.revision+1});
 const started=online.start(host.code,host.token,{revision:guest.revision+2});
 assert.deepEqual(started.counts,[60,60]);
 assert.equal(started.view.players[1].hand,undefined);
 assert.equal(online.state(host.code,guest.token).view.players[0].hand,undefined);
 checked++;
}
console.log('PASS Haymaker: '+checked+' Base/Jungle/Fossil Basic-only decks, supported rules, 60-card legality, solo and online match setup');
