'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const NPC=require('../rpg_npc_deck_progression');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck}=require('../core_rules');
const PARTNER=require('../rpg_partner_decks');
const service=new ClassicLocalService();

const MAIN=Object.freeze({
 hana:'power_reserve',reina:'blackout',shiori:'overgrowth',yuna:'zap',
 akari:'gym_new_voltage',camila:'rocket_lab',marina:'water_blast',kaede:'rocket_lab',
 jun:'fossil_lab',teo:'hotfoot',iris:'cold_fusion',elio:'bodyguard',
 alma:'lockdown',nereo:'cold_fusion'
});
const rank=ids=>Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(x=>x===id).length]));
test('NPC decks advance exactly on act boundaries',()=>{
 for(const [day,tier] of [[1,1],[15,1],[16,2],[30,2],[31,3],[45,3],[46,4],[60,4],[61,5],[75,5],[76,6],[90,6],[91,7]])
  assert.equal(NPC.tierForDay(day),tier,'Day '+day);
 assert.equal(NPC.tierForDay(undefined),1);
});
test('all primary and supporting NPCs have distinct legal Act I, II and III decks',()=>{
 for(const [npc,theme] of Object.entries(MAIN)){
  const original=service.decklist(theme);
  assert.equal(original.length,60,npc);
  const a=NPC.upgrade({npc,tier:1,original,catalog:CATALOG});
  const b=NPC.upgrade({npc,tier:2,original,catalog:CATALOG});
  const c=NPC.upgrade({npc,tier:3,original,catalog:CATALOG});
  assert.deepEqual(a,original,npc+' Act I keeps source');
  assert.notDeepEqual(b,a,npc+' Act II differs');
  assert.notDeepEqual(c,b,npc+' Act III differs');
  for(const [i,cards] of [a,b,c].entries()){
   assert.equal(cards.length,60,npc+' Act '+(i+1));
   const legality=validateDeck(cards,CATALOG);
   assert.equal(legality.valid,true,npc+' Act '+(i+1)+': '+legality.errors.join('; '));
   const counts=rank(cards);
   assert.ok(Object.keys(counts).every(id=>CATALOG.has(id)),'unknown card in '+npc);
  }
  assert.deepEqual(original,service.decklist(theme),'never mutate a shared retail or lab recipe');
 }
});
test('signature Pokémon evolve legally when reinforced and original basic lines remain available',()=>{
 for(const [npc,theme] of Object.entries(MAIN)){
  const original=service.decklist(theme);
  const progressed=NPC.upgrade({npc,tier:3,original,catalog:CATALOG});
  const target=NPC.PROFILES[npc]?.ace;
  if(!target||!original.includes(target))continue;
  const card=CATALOG.get(target);
  if(!card?.evolvesFrom||!original.some(id=>CATALOG.get(id)?.name===card.evolvesFrom))continue;
  assert.ok(progressed.filter(id=>id===target).length>=original.filter(id=>id===target).length);
 }
});
test('undocumented future NPCs receive legal deterministic archetype upgrades',()=>{
 const original=service.decklist('brushfire');
 const first=NPC.upgrade({npc:'new_guest',tier:3,original,catalog:CATALOG});
 const second=NPC.upgrade({npc:'new_guest',tier:3,original,catalog:CATALOG});
 assert.deepEqual(first,second);
 assert.equal(validateDeck(first,CATALOG).valid,true);
 assert.notDeepEqual(first,original);
});
test('Classic RPG uses upgraded CPU deck without changing default single matches or custom collaboration',()=>{
 const original=service.decklist('blackout');
 const baseline=service.create({deck:'brushfire',opponent:'blackout',seed:91});
 assert.equal(baseline.cpu.deckTier,1);
 const upgraded=service.create({deck:'brushfire',opponent:'blackout',npcDeckId:'reina',npcDeckTier:3,seed:92});
 assert.equal(upgraded.cpu.deckTier,3);
 assert.equal(upgraded.cpu.level,baseline.cpu.level,'deck progression does not change CPU skill');
 const playerEdited=service.create({deck:'brushfire',opponent:'blackout',customOpponentDeck:[...original],
  npcDeckId:'reina',npcDeckTier:3,seed:93});
 assert.equal(playerEdited.cpu.deckTier,null,'player-edited partner deck takes priority');
 assert.throws(()=>service.create({deck:'brushfire',opponent:'blackout',npcDeckTier:8}),/tier/);
 assert.throws(()=>service.create({deck:'brushfire',opponent:'blackout',npcDeckTier:3}),/identity/);
 assert.equal(PARTNER.count(original)['base1-7']>0,true);
});
test('RPG snapshots a tier at challenge time and forwards it to the existing Classic authority',()=>{
 const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
 const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
 const live=fs.readFileSync(path.join(root,'classic_live.js'),'utf8');
 assert.match(rpg,/NPC_DECKS\?\.tierForOpponent\?\.\(state,id\)/);
 assert.match(rpg,/competitiveTitle:competition\?\.title\|\|null,npcDeckTier/);
 assert.match(rpg,/npcTier=/);
 assert.match(live,/npcDeckId:rpgNpc,npcDeckTier:/);
 assert.match(live,/customOpponentDeck/);
});

test('RPG opponent progression never alters the authoritative player starting deck',()=>{
 const source=service.decklist('blackout');
 const recipe=NPC.upgrade({npc:'reina',tier:3,original:source,catalog:CATALOG});
 assert.equal(recipe.length,60);
 assert.deepEqual(service.decklist('blackout'),source,'shared preset must not be modified by RPG progression');
 assert.equal(recipe.filter(id=>id==='base1-7').length,2,'Reina retains stronger Hitmonchan pressure without stacking a third copy');
 assert.equal(recipe.filter(id=>id==='base1-92').length,2,'Reina keeps two Energy Removal, not four');
 assert.equal(recipe.filter(id=>id==='base1-79').length,0,'Reina gives up Super Energy Removal counterplay lock');
 assert.equal(recipe.filter(id=>id==='base1-71').length,1,'Reina gains Computer Search');
 assert.ok(recipe.includes('base1-74'),'Reina gains Item Finder');
});

test('completed first character chapters can trigger tier two from Day 18 without romance',()=>{
 const s={day:17,storyDone:{reina_route_1:{day:12,choice:1}}};
 assert.equal(NPC.tierForOpponent(s,'reina'),1,'day floor prevents an early power spike');
 s.day=18;assert.equal(NPC.tierForOpponent(s,'reina'),2);
 assert.equal(NPC.tierForOpponent(s,'hana'),1,'one character cannot improve another opponent');
 assert.equal(NPC.tierForOpponent({day:19,storyDone:{rina_guest_1:true}},'rina'),2);
 assert.equal(NPC.tierForOpponent({day:20,storyDone:{sol_bond_1:{day:19}}},'sol'),2);
 assert.equal(NPC.tierForOpponent({day:21,storyDone:{reina_route_1:false}},'reina'),1);
});
test('completed third chapters and Reina rivalry milestones accelerate expert decks from Day 45',()=>{
 const s={day:44,storyDone:{reina_route_3:{day:43}},arcFlags:{reina_rival_2:{day:43}}};
 assert.equal(NPC.tierForOpponent(s,'reina'),2,'the Day 45 floor still applies');
 s.day=45;assert.equal(NPC.tierForOpponent(s,'reina'),3);
 assert.equal(NPC.tierForOpponent(s,'hana'),2,'only the progressing rival improves');
 assert.equal(NPC.tierForOpponent({day:45,storyDone:{jinx_route_3:{day:45}}},'jinx'),3);
 assert.equal(NPC.tierForOpponent({day:49,arcFlags:{reina_rival_1:{day:17}}},'reina'),2);
 assert.equal(NPC.tierForOpponent({day:49,arcFlags:{reina_rival_2:{day:49}}},'reina'),3);
 assert.equal(NPC.tierForOpponent({day:20,arcFlags:{reina_rival_1:{day:19}}},'reina'),2);
});
test('calendar remains a floor, neutral opponents progress and save reload does not affect selected tier',()=>{
 const state={day:29,storyDone:{},arcFlags:{}};
 assert.equal(NPC.tierForOpponent(state,'reina'),1);
 state.day=31;assert.equal(NPC.tierForOpponent(state,'reina'),2);
 state.day=61;assert.equal(NPC.tierForOpponent(state,'reina'),3);
 assert.equal(NPC.tierForOpponent({day:29,storyDone:{jun_guest_1:{day:28}}},'jun'),2);
 assert.equal(NPC.tierForOpponent({day:55,storyDone:{jun_guest_3:{day:50}}},'jun'),3);
 assert.equal(NPC.tierForOpponent({day:45,storyDone:{reina_route_3:{day:44}}},'shiori'),2);
 assert.equal(NPC.tierForOpponent({day:NaN},'reina'),1);
 assert.equal(NPC.tierForOpponent({day:20,storyDone:{other_route_3:true}},'bad/npc'),1);
 const before=NPC.tierForOpponent({day:24,storyDone:{hana_route_1:{day:6}}},'hana');
 const reloaded=JSON.parse(JSON.stringify({day:24,storyDone:{hana_route_1:{day:6}}}));
 assert.equal(before,2);assert.equal(NPC.tierForOpponent(reloaded,'hana'),before);
});
test('NPC progression browser global matches authoritative Node exports',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const script=fs.readFileSync(path.join(__dirname,'..','rpg_npc_deck_progression.js'),'utf8');
 const window={};
 vm.runInNewContext(script,{window});
 assert.equal(window.NeoRpgNpcDeckProgression.tierForOpponent({day:20,storyDone:{reina_route_1:{day:10}}},'reina'),2);
 const html=fs.readFileSync(path.join(__dirname,'..','rpg.html'),'utf8');
 assert.match(html,/<script src="\/rpg_npc_deck_progression\.js"><\/script>/);
});

test('Rocket rival upgrades strengthen playable Grass/Water evolution lines without starving Energy',()=>{
 const original=service.decklist('rocket_lab'),frequency=(ids,id)=>ids.filter(x=>x===id).length;
 assert.equal(frequency(original,'base1-99'),8,'shared Rocket source already contains Grass Energy');
 assert.equal(frequency(original,'base1-102'),8,'shared Rocket source contains Water Energy');
 assert.equal(frequency(original,'base1-98'),0,'do not invent an off-color Fire Energy issue');
 for(const npc of ['camila','kaede']){
  const refined=NPC.upgrade({npc,tier:2,original,catalog:CATALOG});
  const expert=NPC.upgrade({npc,tier:3,original,catalog:CATALOG});
  for(const cards of [refined,expert]){
   assert.equal(validateDeck(cards,CATALOG).valid,true,npc+' deck legality');
   assert.ok(frequency(cards,'base1-99')>=(npc==='camila'?8:6),npc+' must support Grass attacks');
   assert.ok(frequency(cards,'base1-102')>=(npc==='camila'?5:6),npc+' must retain enough Water for remaining attacks');
   assert.ok(frequency(cards,'base1-96')<=2,npc+' trims excess Double Colorless instead of vital colored Energy');
   assert.ok(frequency(cards,'base1-99')+frequency(cards,'base1-102')>=14);
  }
  if(npc==='kaede')assert.ok(frequency(refined,'base5-41')>=frequency(original,'base5-41')+1,
   'Kaede reinforces Dark Muk while retaining her Dark Weezing identity');
  else assert.equal(frequency(refined,'base5-30'),1,'Camila unlocks Dark Vileplume control in Act II');
  assert.ok(frequency(expert,'base5-25')>=frequency(original,'base5-25'),npc+' keeps Dark Gyarados playable');
  assert.deepEqual(service.decklist('rocket_lab'),original,'shared lab deck is never mutated');
 }
});

test('Camila develops the genuine Team Rocket Dark Vileplume chain, not unsupported Stage 2 filler',()=>{
 const {canEvolve}=require('../core_rules');
 const original=service.decklist('rocket_lab');
 const first=NPC.upgrade({npc:'camila',tier:1,original,catalog:CATALOG});
 const mid=NPC.upgrade({npc:'camila',tier:2,original,catalog:CATALOG});
 const late=NPC.upgrade({npc:'camila',tier:3,original,catalog:CATALOG});
 const count=(cards,id)=>cards.filter(x=>x===id).length;
 assert.deepEqual(first,original,'early Camila keeps the original Rocket recipe');
 for(const deck of [mid,late]){
  assert.equal(deck.length,60);
  assert.equal(validateDeck(deck,CATALOG).valid,true);
  assert.equal(count(deck,'base5-70'),0,'Zubat line yields to more focused strategy');
  assert.equal(count(deck,'base5-24'),0,'Dark Golbat should not be stranded');
  assert.equal(count(deck,'base1-99')>=6,true,'retain Grass Energy for Dark Vileplume');
 }
 assert.deepEqual([count(mid,'base5-63'),count(mid,'base5-36'),count(mid,'base5-30')],[2,2,1]);
 assert.deepEqual([count(late,'base5-63'),count(late,'base5-36'),count(late,'base5-30')],[3,3,2]);
 assert.ok(canEvolve(CATALOG.get('base5-36'),CATALOG.get('base5-63')),'Oddish evolves into Dark Gloom');
 assert.ok(canEvolve(CATALOG.get('base5-30'),CATALOG.get('base5-36')),'Dark Gloom evolves into Dark Vileplume');
 assert.ok(canEvolve(CATALOG.get('base5-13'),CATALOG.get('base5-36')),'holo printing uses same evolution rule');
 assert.equal(canEvolve(CATALOG.get('base5-30'),CATALOG.get('base1-37')),false,
  'normal Gloom cannot illegally substitute for Dark Gloom');
 assert.deepEqual(service.decklist('rocket_lab'),original,'the source lab deck remains untouched');
});


test('RPG duels use the NPC CPU identity automatically, including Act I and story-accelerated tiers',()=>{
 const {profileForNpc}=require('../cpu_profiles');
 const live=new ClassicLocalService({maxSessions:40});
 for(const [npc,opponent] of [['reina','blackout'],['yuna','zap'],['camila','rocket_lab']]){
  for(const tier of [1,2,3]){
   const result=live.create({deck:'brushfire',opponent,npcDeckId:npc,npcDeckTier:tier,seed:2500+tier});
   assert.equal(result.cpu.level,profileForNpc(npc).level,npc+' Act '+tier+' skill');
   assert.equal(result.cpu.personality,profileForNpc(npc).personality,npc+' Act '+tier+' personality');
   assert.equal(result.cpu.deckTier,tier);
  }
 }
 const normal=live.create({deck:'brushfire',opponent:'blackout',seed:2540});
 assert.equal(normal.cpu.level,3,'ordinary single match keeps default difficulty');
 assert.equal(normal.cpu.personality,'balanced');
 const guest=live.create({deck:'brushfire',opponent:'blackout',npcDeckId:'guest_unprofiled',npcDeckTier:2,seed:2541});
 assert.equal(guest.cpu.level,3,'unprofiled guests keep the fallback');
 assert.equal(guest.cpu.personality,'balanced');
 const override=live.create({deck:'brushfire',opponent:'blackout',npcDeckId:'reina',npcDeckTier:1,difficulty:1,personality:'setup',seed:2542});
 assert.equal(override.cpu.level,1,'explicit difficulty still wins');
 assert.equal(override.cpu.personality,'setup','explicit personality still wins');
});

test('RPG deck variants are stable, legal and preserve Pokemon/Energy composition',()=>{
 for(const [npc,theme] of Object.entries(MAIN)){
  const source=service.decklist(theme);
  for(const tier of [1,2,3]){
   const baseline=NPC.upgrade({npc,tier,original:source,catalog:CATALOG});
   for(const variant of [0,1,2]){
    const deck=NPC.varyDeck(baseline,npc,variant,CATALOG);
    assert.equal(deck.length,60);
    assert.equal(validateDeck(deck,CATALOG).valid,true,npc+' tier '+tier+' variant '+variant);
    assert.deepEqual(deck.filter(id=>CATALOG.get(id)?.supertype!=='Trainer').sort(),
     baseline.filter(id=>CATALOG.get(id)?.supertype!=='Trainer').sort());
   }
  }
 }
 assert.equal(NPC.variantForDuel('npc-reina-1-0-0'),NPC.variantForDuel('npc-reina-1-0-0'));
});
