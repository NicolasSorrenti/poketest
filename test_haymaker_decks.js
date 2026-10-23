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
const DECK_BUILDER=require('./deck_builder_core');
// Audit all preset cards before match setup so regressions report every unsupported
// Pokémon / Trainer in one run, rather than only the first failing deck.
const unsupported=[];
for(const entry of HAYMAKER.entries){
 for(const id of new Set(HAYMAKER.list(entry.id))){
  const c=CATALOG.get(id);
  if(!c){unsupported.push(entry.id+': missing '+id);continue;}
  if(c.supertype==='Pokémon'){
   for(const a of c.attacks||[])if(!ATTACKS.compile(a))unsupported.push(entry.id+': attack '+id+' '+c.name+' / '+a.name);
   for(const a of c.abilities||[])if(![POWERS.ACTIVATED,POWERS.PASSIVE,POWERS.ONPLAY].some(pool=>pool.has(a.name)))
    unsupported.push(entry.id+': power '+id+' '+c.name+' / '+a.name);
  }else if(c.supertype==='Trainer'&&!TRAINERS.SUPPORTED.has(c.name))unsupported.push(entry.id+': trainer '+id+' '+c.name);
 }
}
assert.equal(unsupported.length,0,'Unsupported Haymaker card effects:\\n'+unsupported.join('\\n'));
assert.equal(HAYMAKER.entries.length,17);
assert.equal(new Set(HAYMAKER.entries.map(x=>x.id)).size,HAYMAKER.entries.length);
assert.equal(HAYMAKER.has('__proto__'),false);
assert.equal(HAYMAKER.list('nope'),null);
assert.deepEqual(HAYMAKER.list('haymaker_classic'),HAYMAKER.list('haymaker_classic'));
const LEGACY_IDS=['haymaker_classic','haymaker_fire','haymaker_psychic','haymaker_water','haymaker_jungle'];
const NEW_ERAS=['Base Set 2','Team Rocket','Gym Heroes','Gym Challenge','Neo Genesis','Neo Discovery','Neo Revelation','Neo Destiny'];
assert.deepEqual(HAYMAKER.entries.slice(0,5).map(x=>x.id),LEGACY_IDS,'Original Haymaker decks must retain their selection order');
for(const era of NEW_ERAS)assert(HAYMAKER.entries.some(x=>x.era===era),'Missing Haymaker for '+era);
const originalPrintings={
 haymaker_classic:{hit:'base1-7',buzz:'base1-20',scyther:'base2-26'},
 haymaker_fire:{magmar:'base3-39',buzz:'base1-20'},
 haymaker_psychic:{mewtwo:'base1-10',hit:'base1-7'},
 haymaker_water:{lapras:'base3-25',hit:'base1-7'},
 haymaker_jungle:{scyther:'base2-26',buzz:'base1-20'}
};
for(const [id,pokemon] of Object.entries(originalPrintings))for(const printing of Object.values(pokemon))
 assert(HAYMAKER.list(id).includes(printing),'Original Haymaker printing missing: '+id+' '+printing);
const local=new ClassicLocalService({maxSessions:55});
const online=new ClassicOnlineService({maxRooms:55});
const builderCatalog=local.cardPool();
const builderIds=new Set(builderCatalog.map(c=>c.id));
let checked=0;
for(const [index,preset] of HAYMAKER.entries.entries()){
 const list=HAYMAKER.list(preset.id);
 assert.equal(list.length,60,preset.id+' exactly 60 cards');
 assert.equal(DECKS[preset.id],'haymaker:'+preset.id);
 assert(deckOptions().some(x=>x.id===preset.id&&x.haymaker),'Deck selector missing '+preset.id);
 assert.deepEqual(local.decklist(preset.id),list,'Published deck list differs');
 for(const id of list)assert(builderIds.has(id),'Haymaker card unavailable to deck builder: '+id+' in '+preset.id);
 const builderValidation=DECK_BUILDER.verify(list,builderCatalog);
 assert(builderValidation.valid,'Haymaker starter cannot load in deck builder: '+preset.id+' '+builderValidation.errors?.join(', '));
 const valid=validateDeck(list,CATALOG);
 assert(valid.valid,preset.id+' deck illegal: '+valid.errors?.join(', '));
 const byName=new Map(),pokemon=[],trainers=[],energies=[];
 for(const id of list){
  const c=CATALOG.get(id);
  assert(c,'Unknown '+id);
  assert(/^(base[1-5]|gym[12]|neo[1-4])-/.test(id),'Outside the supported historical era: '+id);
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
 // New era lists need genuine playable cards from that era, not a cosmetic name.
 if(!LEGACY_IDS.includes(preset.id)){
  const expected=preset.id==='haymaker_base2'?'base4':['haymaker_rocket_blitz','haymaker_rocket_venom'].includes(preset.id)?'base5':
   preset.id==='haymaker_gym_heroes'?'gym1':preset.id==='haymaker_gym_challenge'?'gym2':
   preset.id==='haymaker_neo_genesis'?'neo1':preset.id==='haymaker_neo_discovery'?'neo2':
   preset.id==='haymaker_neo_revelation'?'neo3':preset.id==='haymaker_neo_destiny'?'neo4':null;
  if(expected)assert(pokemon.some(id=>id.startsWith(expected+'-')),'No real '+expected+' Pokémon in '+preset.id);
  if(preset.id==='haymaker_neo_dark')for(const era of ['neo1','neo2','neo3','neo4'])
   assert(pokemon.some(id=>id.startsWith(era+'-')),'Cross-Neo Haymaker missing '+era);
 }
 // A deck must have a Basic that can attack with the energies it actually runs.
 const provided=new Set(energies.map(id=>CATALOG.get(id).name.replace(' Energy','')));
 const canPay=(type)=>type==='Colorless'||provided.has(type)||provided.has('Rainbow');
 assert(pokemon.some(id=>(CATALOG.get(id).attacks||[]).some(a=>(a.cost||[]).every(canPay))),
  'Deck cannot pay for any Basic attacks: '+preset.id);
 // New decks are fully selectable as both human and CPU opponents.
 const asHuman=local.create({deck:preset.id,opponent:'blackout',seed:1100+index});
 assert.deepEqual(asHuman.counts,[60,60]);
 assert.equal(asHuman.format,LEGACY_IDS.includes(preset.id)?'classic':
  list.some(id=>/^neo[1-4]-/.test(id))?'online-preview':'gym-expanded',
  'Unexpected local match format for '+preset.id);
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
console.log('PASS Haymaker: '+checked+' Basic-only decks from Base through Neo Destiny; original five retained, supported effects, 60-card legality, deck builder and solo / online match setup');
