'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Bench=require('../scripts/benchmark-rpg-npc-decks');
const Collection=require('../rpg_collection');
const NPC=require('../rpg_npc_deck_progression');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck}=require('../core_rules');

test('every campaign stage produces a legal owned player deck with no free unowned upgrades',()=>{
 for(const starter of Bench.INITIAL){
  for(const stage of Bench.STAGES){
   const a=Bench.buildPlayerDeck(starter,stage,371),b=Bench.buildPlayerDeck(starter,stage,371);
   assert.deepEqual(a,b,'simulated acquisition and deck edits are deterministic');
   assert.equal(a.cards.length,60);
   assert.equal(validateDeck(a.cards,CATALOG).valid,true);
   assert.ok(a.earnedCopies>=60);
   assert.equal(a.packsDrawn,stage.miniPacks+stage.shopPacks);
   assert.ok(a.upgrades>=0&&a.upgrades<=60);
   assert.ok(a.metrics.basics>=1);
   assert.ok(a.metrics.energies>=17,'do not strip necessary starter Energy');
  }
 }
});
test('benchmarks use existing legal NPC deck tiers rather than altered card rules',()=>{
 const service=new ClassicLocalService();
 for(const [npc,theme] of Object.entries(Bench.MATCHUPS)){
  const original=service.decklist(theme);
  for(const tier of [1,2,3]){
   const progressed=NPC.upgrade({npc,tier,original,catalog:CATALOG});
   assert.equal(progressed.length,60);
   assert.equal(validateDeck(progressed,CATALOG).valid,true,npc+' tier '+tier);
   if(tier===1)assert.deepEqual(progressed,NPC.STARTING_RECIPES[npc],'tier 1 uses the authored RPG recipe, not the retail source');
  }
 }
});
test('fixed outcome controls refuse invalid benchmark inputs',()=>{
 assert.deepEqual(Bench.parse(['--npcs','reina','--starters','ember_garden','--stages','mid','--pairs','2']).npcs,['reina']);
 assert.throws(()=>Bench.parse(['--npcs','unknown']),/Unknown NPC/);
 assert.throws(()=>Bench.parse(['--starters','fake']),/Unknown starter/);
 assert.throws(()=>Bench.parse(['--stages','fake']),/Unknown stage/);
 assert.throws(()=>Bench.parse(['--pairs','0']),/Invalid paired/);
 assert.throws(()=>Bench.parse(['--max-turns','0']),/Invalid maximum/);
});
test('the player growth model does not mutate starter recipes or global collection metadata',()=>{
 const before=Collection.starters.map(s=>[...s.cards]);
 Bench.buildPlayerDeck('ember_garden',Bench.STAGES[2],101);
 assert.deepEqual(Collection.starters.map(s=>s.cards),before);
 assert.equal(Bench.modifications(before[0],before[0]),0);
});
test('CPU avoids Item Finder with no recoverable Trainer rather than stranding a duel',()=>{
 const {trainerOpportunity}=require('../cpu_policy');
 const info={self:{active:null,bench:[],discard:[],deckCount:10},opponent:{active:null,bench:[]}};
 const cfg={level:3};
 assert.equal(trainerOpportunity(info,'Item Finder',cfg),false);
 info.self.discard.push('base1-98'); // Fire Energy is not a recoverable Trainer
 assert.equal(trainerOpportunity(info,'Item Finder',cfg),false);
 info.self.discard.push('base1-94'); // Potion is a Trainer
 assert.equal(trainerOpportunity(info,'Item Finder',cfg),true);
 assert.equal(trainerOpportunity(info,'Computer Search',cfg),true);
 info.self.deckCount=0;
 assert.equal(trainerOpportunity(info,'Computer Search',cfg),false);
});

test('impossible Trader and Item Finder searches are rejected before any mandatory choice',()=>{
 const {createGame,applyCommand}=require('../headless_duel');
 const cards=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
 for(const [trainer,hand,discard,deck,error] of [
  ['base1-77',['base1-77','base1-44','base1-99'],[],Array(10).fill('base1-99'),/Pokémon Trader.*deck/],
  ['base1-74',['base1-74','base1-44','base1-99'],[],Array(10).fill('base1-99'),/Item Finder.*Trainer/]
 ]){
  const g=createGame({decks:[cards,cards],format:'classic',seed:42});
  g.phase='game';g.turn=0;g.turnSerial=4;g.round=3;
  g.players[0].active={id:'base1-44',under:[],energies:[],attachedTrainers:[],damage:0,status:null,playedTurn:0};
  g.players[0].hand=hand;g.players[0].discard=discard;g.players[0].deck=deck;
  const original=JSON.stringify(g);
  const response=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
  assert.equal(response.ok,false,trainer+' must reject an impossible effect');
  assert.match(response.error,error);
  assert.equal(JSON.stringify(g),original,'illegal play must not strand the game or mutate cards');
  assert.equal(g.pendingDecision,null);
 }
});

test('Pokémon Breeder only offers Stage 2 cards with a compatible Basic already in play',()=>{
 const {createGame,applyCommand}=require('../headless_duel');
 const cards=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
 const game=()=>{const g=createGame({decks:[cards,cards],format:'classic',seed:322});
  g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;
  g.players[0].active={id:'base1-44',under:[],energies:[],attachedTrainers:[],damage:0,status:null,playedTurn:1};
  g.players[0].hand=['base1-76','base5-30','base1-99'];
  g.players[0].deck=['base1-99','base1-44'];
  return g;
 };
 const noOddish=game(),before=JSON.stringify(noOddish);
 const rejected=applyCommand(noOddish,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.equal(rejected.ok,false);
 assert.match(rejected.error,/Pokémon Breeder.*matching Basic/);
 assert.equal(JSON.stringify(noOddish),before,'rejected Trainer is atomic');
 const withOddish=game();
 withOddish.players[0].bench=[{id:'base5-63',under:[],energies:[],attachedTrainers:[],damage:0,status:null,playedTurn:1}];
 const opened=applyCommand(withOddish,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.equal(opened.ok,true,opened.error);
 assert.equal(withOddish.pendingDecision?.kind,'evolution');
 assert.ok(withOddish.pendingDecision.options.some(x=>x.label==='Dark Vileplume'));
});
