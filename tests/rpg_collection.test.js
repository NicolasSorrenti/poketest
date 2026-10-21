'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../rpg_collection'),E=require('../rpg_epilogue');
const setup=()=>({deckJourney:C.fresh(),playerDeck:'blackout',credits:80,day:1,slot:0,location:'shop',results:[]});
test('three 60-card mixed-type starter decks use the verified Base Set card IDs, 20 Pokémon, 16 Trainers, 24 energy',()=>{
 assert.equal(C.starters.length,3);assert.equal(new Set(C.starters.flatMap(x=>x.types)).size,6);
 for(const starter of C.starters){
  const s=setup();C.choose(s,starter.id);
  assert.equal(s.deckJourney.deck.length,60,starter.id);
  assert.equal(C.check(s.deckJourney.deck,s.deckJourney.owned).valid,true,starter.id);
  assert.equal(s.deckJourney.deck.filter(x=>C.ENERGY.has(x)).length,24);
  assert.equal(s.deckJourney.deck.filter(x=>[...Array(26)].map((_,i)=>'base1-'+(i+70)).includes(x)).length,16);
  assert.equal(s.playerDeck,'custom');
 }
});
test('starter cannot be switched or accessed without explicit selection',()=>{
 const s=setup();assert.throws(()=>C.choose(s,'unknown'),/three starter decks/);
 assert.equal(s.deckJourney.starter,null);
 C.choose(s,'ember_garden');assert.throws(()=>C.choose(s,'tidal_circuit'),/already chosen/);
});
test('player cannot add cards not owned, exceed copies, or reduce Basic Pokémon count below one',()=>{
 const s=setup();C.choose(s,'ember_garden');
 const old=JSON.stringify(s.deckJourney.deck);
 assert.throws(()=>C.change(s,'base1-46','base1-88'),/do not own/);
 assert.equal(JSON.stringify(s.deckJourney.deck),old);
 const id=s.deckJourney.deck[0];assert.throws(()=>C.change(s,id,id),/different/);
});
test('valid swaps preserve exactly 60 cards and save as separate editable draft',()=>{
 const s=setup();C.choose(s,'ember_garden');
 C.reward(s,true);
 const newCard=Object.entries(s.deckJourney.owned).find(([id,n])=>!s.deckJourney.deck.includes(id)&&n>0);
 assert.ok(newCard,'reward should add a new card to edit into deck');
 const before=[...s.deckJourney.deck];
 const updated=C.change(s,'base1-94',newCard[0]);assert.equal(updated.length,60);
 assert.deepEqual(s.deckJourney.deck,before,'live deck is not changed until Save');
 C.save(s);assert.ok(s.deckJourney.deck.includes(newCard[0]));assert.equal(s.deckJourney.draft,null);
 assert.equal(C.check(s.deckJourney.deck,s.deckJourney.owned).valid,true);
});
test('first ordinary win earns a five-card mini booster, losing earns none',()=>{
 const s=setup();C.choose(s,'tidal_circuit');
 const before=Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0);
 assert.equal(C.reward(s,false),null);assert.equal(s.deckJourney.rewards,0);
 const win=C.reward(s,true);assert.equal(win.length,5);assert.equal(s.deckJourney.rewards,1);
 assert.equal(Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0),before+5);
 assert.deepEqual(s.deckJourney.lastPack.cards,win);
 assert.equal(s.deckJourney.lastPack.source,'win');assert.equal(s.deckJourney.lastPack.opened,false);
 const again=C.reward(s,false);assert.equal(again,null);assert.equal(s.deckJourney.rewards,1);
});
test('shop packs spend 20 credits for exactly ten owned cards; they cannot buy elsewhere or without funds',()=>{
 const s=setup();C.choose(s,'mind_and_muscle');
 const before=Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0);
 const cards=C.buyPack(s);assert.equal(cards.length,10);assert.equal(s.credits,60);assert.equal(s.deckJourney.packs,1);
 assert.equal(Object.values(s.deckJourney.owned).reduce((a,v)=>a+v,0),before+10);
 assert.equal(s.deckJourney.lastPack.source,'shop');assert.equal(s.deckJourney.lastPack.cards.length,10);
 s.location='park';const original=JSON.stringify(s);
 assert.throws(()=>C.buyPack(s),/card shop/);assert.equal(JSON.stringify(s),original);
 s.location='shop';s.deckJourney.lastPack.opened=true;s.credits=19;assert.throws(()=>C.buyPack(s),/20 credits/);
});
test('real pending scenes block shop transactions and do not spend credits',()=>{
 const s=setup();C.choose(s,'ember_garden');s.pendingDuel={id:'test'};
 const credits=s.credits;assert.throws(()=>C.buyPack(s),/current scene/);assert.equal(s.credits,credits);
});
test('saved owned cards and edited deck survive reload',()=>{
 const s=setup();C.choose(s,'ember_garden');C.buyPack(s);
 const restored=JSON.parse(JSON.stringify(s));C.hydrate(restored);
 assert.deepEqual(restored.deckJourney,s.deckJourney);
 assert.equal(C.check(restored.deckJourney.deck,restored.deckJourney.owned).valid,true);
});
test('old campaign saves without collection remain legacy presets',()=>{
 const s={playerDeck:'blackout',deckJourney:null};C.hydrate(s);
 assert.equal(s.deckJourney,null);assert.equal(s.playerDeck,'blackout');
});
test('New Game+ resets RPG deck progress but preserves the gallery',()=>{
 const s={...setup(),day:91,ended:true,cgUnlocked:{hana_first_meeting:{day:1,slot:0}},cgViewed:{},playerDeck:'custom'};
 C.choose(s,'ember_garden');C.reward(s,true);
 const r=E.replay(s,()=>({...setup(),deckJourney:null}));
 assert.equal(r.deckJourney.starter,null);assert.equal(r.playerDeck,'blackout');
 assert.equal(r.cgUnlocked.hana_first_meeting.day,1);
});

test('dedicated deck studio permits incomplete drafts but never saves an illegal 59-card list',()=>{
 const s=setup();C.choose(s,'tidal_circuit');
 const before=[...s.deckJourney.deck];const id=before[0];
 const draft=C.edit(s,id,-1);
 assert.equal(draft.length,59);assert.equal(s.deckJourney.deck.length,60);
 assert.equal(C.check(draft,s.deckJourney.owned).valid,false);
 assert.throws(()=>C.save(s),/60 cards/);
 const unchanged=C.edit(s,id,+1);
 assert.equal(unchanged.length,60);
 assert.equal(C.check(unchanged,s.deckJourney.owned).valid,true);
 C.save(s);assert.equal(s.deckJourney.deck.length,60);
});
test('deck studio strictly enforces ownership, available copies and Basic Pokémon',()=>{
 const s=setup();C.choose(s,'ember_garden');
 assert.throws(()=>C.edit(s,'base1-46',1),/Remove a card/);
 C.edit(s,'base1-46',-1);
 assert.throws(()=>C.edit(s,'base1-88',1),/another copy/);
 C.edit(s,'base1-46',1);
 assert.throws(()=>C.edit(s,'base1-88',-1),/not in your deck/);
 const b=JSON.stringify(s.deckJourney.deck);assert.equal(JSON.stringify(s.deckJourney.deck),b);
});
test('unopened mini booster persists on reload until player views it',()=>{
 const s=setup();C.choose(s,'ember_garden');C.reward(s,true);
 const before=JSON.stringify(s.deckJourney);
 const reloaded=JSON.parse(JSON.stringify(s));C.hydrate(reloaded);
 assert.equal(JSON.stringify(reloaded.deckJourney),before);
 reloaded.deckJourney.lastPack.opened=true;C.hydrate(reloaded);
 assert.equal(reloaded.deckJourney.lastPack.opened,true);
});

test('character rewards draw five-card packs with guaranteed rare and energy',()=>{
 const s=setup();C.choose(s,'ember_garden');
 s.day=90;
 for(const [npc,set] of Object.entries(C.CHARACTER_SETS)){
  if(s.deckJourney.lastPack)s.deckJourney.lastPack.opened=true;
  const ids=C.reward(s,true,npc,Math.random,{story:true});
  assert.equal(ids.length,5);
  assert.equal(s.deckJourney.lastPack.set,set);
  assert.equal(s.deckJourney.lastPack.giver,npc);
  assert.ok(ids.some(id=>C.ENERGY.has(id)));
  assert.ok(ids.some(id=>id.startsWith(set+'-')&&['rare','holo','secret'].includes(C.packRarity(id))));
 }
 const a=C.randomPack('base3',()=>0),b=C.randomPack('base3',()=>0.75);
 assert.notDeepEqual(a,b,'different random outcomes must produce different packs');
});
test('new expanded collection cards survive save hydration',()=>{
 const s=setup();C.choose(s,'tidal_circuit');s.day=90;C.reward(s,true,'kaede',()=>0.25);
 const restored=JSON.parse(JSON.stringify(s));C.hydrate(restored);
 assert.deepEqual(restored.deckJourney.lastPack,s.deckJourney.lastPack);
 assert.ok(Object.keys(restored.deckJourney.owned).some(id=>id.startsWith('neo4-')));
});

test('expansion shop has ten playable sets with discovery stats and starter availability',()=>{
 const s=setup();C.choose(s,'ember_garden');
 const offers=C.shopPacks(s);
 assert.equal(offers.length,11);
 assert.deepEqual(offers.map(x=>x.set),Object.keys(C.SETS));
 assert.equal(offers[0].unlocked,true);
 assert.equal(offers[0].price,20);
 assert.ok(offers[0].completion>0);
 assert.equal(offers.find(x=>x.set==='neo4').unlocked,false);
 for(const offer of offers)assert.ok(offer.owned<=offer.total&&offer.completion>=0&&offer.completion<=100);
});
test('packs unlock from bonds, a completed character story, tournament wins or day',()=>{
 const s=setup();C.choose(s,'ember_garden');
 const unlocked=set=>C.shopPacks(s).find(x=>x.set===set).unlocked;
 assert.equal(unlocked('base5'),false);
 s.relationships={camila:{affection:3}};assert.equal(unlocked('base5'),true);
 s.relationships={};s.storyDone={akari_route_1:{choice:0,day:1}};
 assert.equal(unlocked('gym2'),true);
 s.storyDone={};s.tournaments={regional:{state:'champion'}};
 assert.equal(unlocked('neo1'),true);
 s.tournaments={};s.day=80;
 assert.equal(C.shopPacks(s).every(x=>x.unlocked),true);
});
test('locked or unknown packs do not charge money or change ownership',()=>{
 const s=setup();C.choose(s,'ember_garden');const before=JSON.stringify(s);
 assert.throws(()=>C.buyPack(s,'neo4'),/not unlocked/);
 assert.throws(()=>C.buyPack(s,'missing-set'),/does not exist/);
 assert.equal(JSON.stringify(s),before);
});
test('buy a Gym booster and preserve its cards after reload, without overwriting unrevealed packs',()=>{
 const s=setup();C.choose(s,'mind_and_muscle');s.day=34;s.credits=90;
 const first=C.buyPack(s,'gym1',()=>0.25);
 assert.equal(first.length,10);assert.equal(s.credits,55);assert.equal(s.deckJourney.packs,1);
 assert.equal(s.deckJourney.lastPack.set,'gym1');
 assert.ok(first.some(id=>id.startsWith('gym1-')&&['rare','holo','secret'].includes(C.packRarity(id))));
 assert.ok(first.some(id=>C.ENERGY.has(id)));
 const before=JSON.stringify(s);
 assert.throws(()=>C.buyPack(s,'base1'),/Reveal your previous booster/);
 assert.equal(JSON.stringify(s),before);
 s.deckJourney.lastPack.opened=true;
 C.buyPack(s,'base1',()=>0.5);assert.equal(s.credits,35);
 const restored=JSON.parse(JSON.stringify(s));C.hydrate(restored);
 assert.deepEqual(restored.deckJourney,s.deckJourney);
});
test('Camila awards Team Rocket cards that remain in the owned collection',()=>{
 const s=setup();C.choose(s,'ember_garden');assert.equal(C.setForCharacter('camila'),'base5');
 s.day=22;C.reward(s,true,'camila',()=>0.5);
 assert.ok(Object.keys(s.deckJourney.owned).some(x=>x.startsWith('base5-')));
 const restored=JSON.parse(JSON.stringify(s));C.hydrate(restored);
 assert.deepEqual(restored.deckJourney.owned,s.deckJourney.owned);
});
test('ordinary boosters are limited to two distinct NPCs per seven-day week',()=>{
 const s=setup();C.choose(s,'tidal_circuit');
 const earn=(npc,id)=>C.reward(s,true,npc,()=>0.4,{day:s.day,duelId:id});
 assert.equal(earn('hana','duel-a').length,5);
 assert.equal(earn('hana','duel-b'),null,'same NPC cannot be farmed this week');
 assert.equal(earn('reina','duel-c').length,5);
 assert.equal(earn('yuna','duel-d'),null,'third routine pack is beyond weekly cap');
 assert.equal(s.deckJourney.rewards,2);
 s.day=8;
 assert.equal(earn('hana','duel-e').length,5,'new week resets the allowance');
 assert.equal(s.deckJourney.weeklyPacks['1'],2);
 assert.equal(s.deckJourney.weeklyPacks['2'],1);
});
test('story and championship duels bypass routine cap but each receipt awards only once',()=>{
 const s=setup();C.choose(s,'ember_garden');s.day=35;
 C.reward(s,true,'hana',()=>0.4,{duelId:'ordinary-1'});
 C.reward(s,true,'reina',()=>0.4,{duelId:'ordinary-2'});
 const story=C.reward(s,true,'yuna',()=>0.4,{duelId:'story-1',story:true});
 assert.equal(story.length,5);
 assert.equal(C.reward(s,true,'yuna',()=>0.4,{duelId:'story-1',story:true}),null);
 const cup=C.reward(s,true,'camila',()=>0.4,{duelId:'cup-1',championship:true});
 assert.equal(cup.length,10);
 assert.equal(s.deckJourney.weeklyPacks['5'],2,'story wins never spend weekly allowance');
 assert.equal(s.deckJourney.rewards,4);
 assert.equal(s.deckJourney.pendingPacks.length,3,'unopened rewards must queue, not replace one another');
 assert.equal(s.deckJourney.lastPack.cards.length,5);
 const restored=JSON.parse(JSON.stringify(s));C.hydrate(restored);
 assert.equal(restored.deckJourney.pendingPacks.at(-1).kind,'championship');
 assert.equal(restored.deckJourney.pendingPacks.at(-1).cards.length,10);
});
test('late-set win rewards obey expansion unlock pacing and preserve legacy saves',()=>{
 const s=setup();C.choose(s,'ember_garden');
 const first=C.reward(s,true,'kaede',()=>0.3,{duelId:'early'});
 assert.equal(first.length,5);
 assert.equal(s.deckJourney.lastPack.set,'base1','early NPC duel must not unlock Neo Destiny');
 const legacy=JSON.parse(JSON.stringify(s));
 delete legacy.deckJourney.weeklyWins;delete legacy.deckJourney.weeklyPacks;
 delete legacy.deckJourney.rewardedDuels;delete legacy.deckJourney.pendingPacks;
 C.hydrate(legacy);
 assert.deepEqual(legacy.deckJourney.weeklyWins,{});assert.deepEqual(legacy.deckJourney.weeklyPacks,{});
 assert.deepEqual(legacy.deckJourney.rewardedDuels,{});assert.deepEqual(legacy.deckJourney.pendingPacks,[]);
 legacy.day=90;legacy.deckJourney.lastPack.opened=true;
 const late=C.reward(legacy,true,'kaede',()=>0.3,{duelId:'late'});
 assert.equal(late.length,5);
 assert.equal(legacy.deckJourney.lastPack.set,'neo4');
});

test('historical rarities classify all eleven sets with no holes or overlaps',()=>{
 for(const [set,meta] of Object.entries(C.SETS)){
  const ids=Object.values(C.PACK_POOLS[set]).flat();
  assert.equal(ids.length,meta.size,set);
  assert.equal(new Set(ids).size,meta.size,set);
  for(let n=1;n<=meta.size;n++)assert.ok(C.packRarity(set+'-'+n),set+'-'+n);
 }
 assert.equal(C.packRarity('base1-4'),'holo');
 assert.equal(C.packRarity('base1-71'),'rare'); // Computer Search
 assert.equal(C.packRarity('base1-88'),'uncommon'); // Professor Oak
 assert.equal(C.packRarity('base5-83'),'secret'); // Dark Raichu
 assert.equal(C.packRarity('neo4-107'),'secret'); // Shining Charizard
 assert.equal(C.packRarity('base1-98'),'energy');
 assert.equal(C.packRarity('not-a-card'),null);
});
test('five- and ten-card packs use correct Common, Uncommon, Rare and Energy slots',()=>{
 for(const set of Object.keys(C.SETS))for(const [size,common,uncommon] of [[5,2,1],[10,5,3]]){
  const cards=C.randomPack(set,()=>0.5,size),kinds=cards.map(C.packRarity);
  assert.equal(cards.length,size);
  assert.equal(kinds.filter(k=>k==='common').length,common,set+' commons');
  assert.equal(kinds.filter(k=>k==='uncommon').length,uncommon,set+' uncommons');
  assert.equal(kinds.filter(k=>k==='energy').length,1,set+' basic Energy');
  assert.equal(kinds.filter(k=>['holo','rare','secret'].includes(k)).length,1,set+' rare slot');
 }
});
test('rare slot distinguishes Holo, non-holo and Shining without a forced holo every pack',()=>{
 const pick=(set,roll)=>{let i=0;return C.randomPack(set,()=>i++===0?roll:0.5,5).map(C.packRarity);};
 assert.equal(pick('base1',0.1).filter(k=>k==='holo').length,1);
 assert.equal(pick('base1',0.8).filter(k=>k==='rare').length,1);
 assert.equal(pick('neo4',0).filter(k=>k==='secret').length,1);
 assert.equal(pick('neo4',0.1).filter(k=>k==='holo').length,1);
 assert.equal(pick('neo4',0.8).filter(k=>k==='rare').length,1);
});
