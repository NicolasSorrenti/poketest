'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const WORLD=require('../rpg_world'),CIRCUIT=require('../rpg_circuit'),MARKET=require('../rpg_market'),FINALE=require('../rpg_finale'),STORY=require('../rpg_story');
const cast={
 hana:{start:1,days:[0,1,2,3,4,5,6],slots:[0,1],locs:['shop','cafe','park']},
 reina:{start:1,days:[1,2,3,4,5,6],slots:[1,2],locs:['shop','center']},
 shiori:{start:1,days:[0,2,4,6],slots:[0,2],locs:['cafe','park','library']},
 yuna:{start:1,days:[0,1,3,5],slots:[1,2],locs:['arcade','shop']},
 akari:{start:1,days:[0,1,2,3],slots:[0,1],locs:['library','center']},
 camila:{start:1,days:[0,2,4,6],slots:[1,2],locs:['cafe','shop']},
 marina:{start:1,days:[0,2,4,6],slots:[0,2],locs:['park','cafe']},
 kaede:{start:40,days:[0,2,4,6],slots:[1,2],locs:['arcade','park']}
};
const simulation=()=>STORY.normalize({day:1,slot:0,location:'home',points:0,credits:80,flags:{},storyDone:{},storyMissed:{},relationships:{}});
const cardList=()=>{
 const cards=[{id:'base1-97',name:'Fighting Energy',supertype:'Energy',subtypes:[]}];
 for(let i=1;i<=65;i++)cards.push({id:'base1-'+i,name:'Creature '+i,supertype:'Pokémon',subtypes:[i%4?'Basic':'Stage 1']});
 return MARKET.catalog(cards);
};
test('RPG world schedules are valid and characters have regular, coherent sightings',()=>{
 assert.deepEqual(WORLD.validate(cast),[]);
 const state=simulation();
 for(const [id,c] of Object.entries(cast)){
  const next=WORLD.nextSighting(state,cast,id,id==='kaede'?50:7);
  assert.ok(next,id+' must have a future appearance');
  assert.equal(next.place,WORLD.locationFor(id,c,{...state,day:next.day,slot:next.slot}));
 }
 assert.equal(WORLD.locationFor('kaede',cast.kaede,{day:1,slot:1,relationships:{}}),null);
});
test('NPCs attend major competitions despite ordinary rest schedules',()=>{
 const state=simulation();state.day=30;state.slot=1;
 for(const [id,c] of Object.entries(cast)){
  if(id==='kaede')continue;
  assert.equal(WORLD.locationFor(id,c,state),'center');
 }
});
test('NPC league results advance without player involvement and never double apply',()=>{
 const state=simulation();WORLD.normalize(state);state.day=29;
 const first=WORLD.afterAdvance(state,1),count=Object.keys(state.world.weeklyResults).length;
 assert.equal(first.length,4);assert.equal(count,4);
 assert.equal(WORLD.afterAdvance(state,1).length,0);
 assert.equal(Object.keys(state.world.weeklyResults).length,4);
});
test('NPC decks use real available preset IDs and strengthen by chapter',()=>{
 const approved=new Set(['blackout','brushfire','overgrowth','zap','power_reserve','water_blast','rocket_lab','erika','brock','sabrina','psych_out','cold_fusion','brainwave','misty','trouble','dark','light','wallop','gym_new_voltage']);
 for(const id of Object.keys(cast)){
  for(const day of [10,45,75])assert.ok(approved.has(WORLD.deckFor(id,day)),id+' day '+day);
 }
 assert.notEqual(WORLD.deckFor('reina',10),WORLD.deckFor('reina',75));
});
test('Tournament plays real scheduled rounds and applies championship rewards only on winning',()=>{
 const s=simulation();s.day=30;s.slot=0;s.location='center';s.points=12;
 CIRCUIT.register(s,'neighborhood');s.slot=1;
 assert.equal(CIRCUIT.dueMatch(s).npc,'hana');
 const a=CIRCUIT.recordMatch(s,'game-1',true);assert.equal(a.ended,false);
 assert.equal(CIRCUIT.recordMatch(s,'game-1',true).duplicate,true);
 s.slot=2;assert.equal(CIRCUIT.dueMatch(s).npc,'reina');
 const end=CIRCUIT.recordMatch(s,'game-2',true);
 assert.equal(end.ended,true);assert.equal(end.won,true);
 assert.equal(s.points,27);assert.equal(s.credits,140);
 assert.equal(CIRCUIT.current(s),null);
});
test('Tournament loss or missed round never grants trophy rewards',()=>{
 const s=simulation();s.day=60;s.slot=0;s.location='center';s.points=20;
 CIRCUIT.register(s,'regional');s.slot=1;
 CIRCUIT.recordMatch(s,'game-3',true);
 s.day=61;s.slot=0;
 assert.equal(CIRCUIT.expire(s).reason,'missed');
 assert.equal(s.tournament.completed.regional.won,false);
 assert.equal(s.credits,80);
});
test('Market seeds exactly one actual 60-card starter and prevents illegal card ownership',()=>{
 const s=simulation(),cards=cardList(),starter=[...Array(56).fill('base1-97'),...Array(4).fill('base1-1')];
 assert.equal(MARKET.seedStarter(s,starter),true);
 assert.equal(MARKET.seedStarter(s,starter),false);
 assert.equal(MARKET.sum(s.collection.owned),60);
 assert.deepEqual(MARKET.validateDeck(s,cards),[]);
 assert.throws(()=>MARKET.adjustDraft(s,'base1-1',1,cards));
 assert.equal(MARKET.saveDeck(s,cards).length,60);
});
test('Pack opening subtracts credits atomically, adds actual card IDs, and uses a fixed seeded sequence',()=>{
 const s=simulation(),cards=cardList();
 MARKET.seedStarter(s,[...Array(56).fill('base1-97'),...Array(4).fill('base1-1')]);
 const first=MARKET.buyPack(s,cards);
 assert.equal(first.length,8);assert.equal(s.credits,62);assert.equal(MARKET.sum(s.collection.owned),68);
 assert.equal(s.collection.packLog[0].cards.length,8);
 s.credits=0;const before=MARKET.sum(s.collection.owned);
 assert.throws(()=>MARKET.buyPack(s,cards),/credits/);
 assert.equal(MARKET.sum(s.collection.owned),before);
});
test('Cross-character decisions update both relationships',()=>{
 const s=simulation(),e=STORY.byId('hana_marina_1');
 s.day=e.start;s.slot=e.slot;s.location=e.place;s.relationships.hana.affection=5;
 s.storyDone[e.prerequisite]={day:e.start-1};
 STORY.resolve(s,e.id,0);
 assert.equal(s.relationships.marina.affection,2);
 assert.equal(s.relationships.marina.trust,1);
});
test('Finale branches on championship and romance; New Game+ retains collection but resets progress',()=>{
 const old=simulation();old.day=91;old.partner='hana';old.routeOutcomes={hana:'romance'};old.tournament={completed:{championship:{won:true}}};
 old.collection={starterReady:true,owned:{'base1-1':2},draft:{'base1-1':2},customDeck:null};
 const summary=FINALE.summary(old);assert.equal(summary.champion,true);assert.ok(summary.intimate.includes('Hana'));
 FINALE.choose(old,'town');
 const next=FINALE.newGamePlus(old,simulation);
 assert.equal(next.day,1);assert.equal(next.credits,120);assert.equal(next.collection.owned['base1-1'],2);
 assert.equal(next.partner,null);
 assert.equal(next.storyDone?.hana_route_1,undefined);
 assert.throws(()=>FINALE.choose(old,'circuit'),/already/);
});

test('all eight core routes remain reachable and can finish at their authored windows',()=>{
 const characters=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
 for(const id of characters){
  const s=simulation();
  for(let n=1;n<=4;n++){
   const event=STORY.byId(id+'_route_'+n);
   assert.ok(event,'Missing story for '+id+' '+n);
   s.day=event.start;s.slot=event.slot;s.location=event.place;
   assert.ok(STORY.available(s).some(e=>e.id===event.id),id+' route '+n+' is unreachable');
   STORY.resolve(s,event.id,0);
  }
  assert.equal(s.partner,id,id+' romance resolution');
  assert.equal(s.routeOutcomes[id],'romance');
 }
});
test('the complete 90-day calendar progresses NPC life independently',()=>{
 const state=simulation();WORLD.normalize(state);CIRCUIT.normalize(state);
 for(let day=2;day<=91;day++){
  const before=state.day;state.day=day;state.slot=0;
  WORLD.afterAdvance(state,before);STORY.recordExpiry(state);CIRCUIT.expire(state);
 }
 assert.ok(Object.keys(state.world.weeklyResults).length>=12);
 assert.ok(state.world.notices.some(x=>x.kind==='arrival'));
 assert.ok(Object.keys(state.storyMissed).length>0);
});
