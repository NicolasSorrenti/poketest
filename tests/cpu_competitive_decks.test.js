'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {CATALOG,createGame}=require('../headless_duel');
const {validateDeck,countCards}=require('../core_rules');
const DECKS=require('../cpu_competitive_decks');
const BENCH=require('../scripts/benchmark-cpu-competitive');
const AI=require('../cpu_policy');

test('all competitive-archetype builds are legal, varied and playable 60-card decks',()=>{
 const families=new Set();
 assert.equal(DECKS.entries.length,8);
 for(const entry of DECKS.entries){
  const cards=DECKS.list(entry.id),valid=validateDeck(cards,CATALOG);
  assert.equal(cards.length,60,entry.id);
  assert.deepEqual(valid.errors,[],entry.id);
  assert.ok(valid.basicCount>=4,entry.id);
  assert.ok(entry.counts.Pokemon>=10,entry.id);
  assert.ok(entry.counts.Trainer>=20,entry.id);
  assert.ok(entry.counts.Energy>=12,entry.id);
  families.add(entry.family);
  assert.notEqual(cards,DECKS.list(entry.id),'do not share a mutable deck array');
 }
 assert.equal(families.size,8,'each build exercises a distinctive strategy');
});
test('benchmarks include real acceleration, evolution, control and attrition cards',()=>{
 const byName=id=>DECKS.list(id).map(x=>CATALOG.get(x)?.name);
 for(const [id,names] of [
  ['rain_dance',['Blastoise','Wartortle','Squirtle','Pokémon Breeder']],
  ['meganium',['Meganium','Bayleef','Chikorita']],
  ['feraligatr',['Feraligatr','Croconaw','Totodile']],
  ['typhlosion',['Typhlosion','Quilava','Cyndaquil']],
  ['energy_denial',['Energy Removal','Super Energy Removal']],
  ['stall',['Chansey','Snorlax','Scoop Up','Pokémon Center']],
  ['neo_dark',['Sneasel','Murkrow','Rainbow Energy']]
 ])for(const name of names)
  assert.ok(byName(id).includes(name),id+' must exercise '+name);
});
test('benchmark fixture groups include mirrors and both directions of key asymmetric matchups',()=>{
 const fixtures=Object.values(BENCH.FIXTURES).flat();
 assert.equal(fixtures.length,24);
 const key=f=>f.left+' / '+f.right;
 const keys=new Set(fixtures.map(key));
 for(const a of ['haymaker','rain_dance','meganium','typhlosion',
  'feraligatr','energy_denial','stall','neo_dark'])
  assert.ok(keys.has(a+' / '+a),a+' mirror missing');
 for(const [a,b] of [['haymaker','rain_dance'],['rain_dance','energy_denial'],
  ['meganium','typhlosion'],['stall','typhlosion'],['neo_dark','feraligatr']]){
  assert.ok(keys.has(a+' / '+b),a+' vs '+b);
  assert.ok(keys.has(b+' / '+a),b+' vs '+a);
 }
 assert.equal(BENCH.parse(['--group','evolution','--pairs','2']).pairs,2);
 assert.throws(()=>BENCH.parse(['--group','nonsense']),/Invalid group/);
 assert.throws(()=>BENCH.parse(['--pairs','0']),/Invalid pairs/);
});
test('all archetypes enter a game with conserved cards and legal setup moves',()=>{
 for(const entry of DECKS.entries){
  const a=DECKS.list(entry.id),other=DECKS.list('haymaker');
  let game=createGame({decks:[a,other],seed:50000+DECKS.entries.indexOf(entry),format:'online-preview'});
  assert.equal(game.phase,'setup',entry.id);
  for(const side of [0,1]){
   const result=AI.driveSide(game,{side,level:7,seed:600+side,limit:100});
   assert.ok(result.steps>0,entry.id+' side '+side);
   game=result.game;
  }
  assert.equal(countCards(game.players[0]),60,entry.id);
  assert.equal(countCards(game.players[1]),60,entry.id);
 }
});
