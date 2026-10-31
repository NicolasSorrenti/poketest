'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const configs=[
 {format:'classic',size:60},
 {format:'neo-theme',size:60},
 {format:'online-preview',size:60},
 {format:'online-preview',size:40}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:41});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);return r;}
function choose(g,side,selected){const d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected});}
function rngStateFor(heads){for(let seed=0;seed<100000;seed++){const state=(Math.imul(seed,1664525)+1013904223)>>>0;if((state>>>31)===Number(heads))return seed;}throw Error('No deterministic RNG state found');}
let scenarios=0;
for(const [id,number] of [['base1-64',64],['base4-94',94]]){
 const card=CATALOG.get(id);assert.equal(card.name,'Starmie');assert.equal(card.hp,'60');assert.deepEqual(card.types,['Water']);
 assert.deepEqual(card.attacks,[
  {name:'Recover',cost:['Water','Water'],damage:'',text:'Discard 1 Water Energy card attached to Starmie in order to use this attack. Remove all damage counters from Starmie.'},
  {name:'Star Freeze',cost:['Water','Colorless','Colorless'],damage:'20',text:'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'}
 ]);
 assert.deepEqual(card.weaknesses,[{type:'Lightning',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-64','base4-94']){
  // Recover's additional discard is Water-typed. Fighting Energy is not an
  // eligible discard, even though it is attached alongside payable Water.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102','base1-102','base1-97'],50);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,['base1-102','base1-97']);assert.deepEqual(g.players[0].discard,['base1-102']);assert.equal(g.players[0].active.damage,0);scenarios++;}
  // Distinct eligible Energy cards keep the attacker's choice. Rainbow Energy
  // provides Water, so the player can choose it instead of basic Water.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102','base5-17'],20);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['energy:0','energy:1']);choose(g,0,['energy:1']);assert.deepEqual(g.players[0].active.energies,['base1-102']);assert.deepEqual(g.players[0].discard,['base5-17']);assert.equal(g.players[0].active.damage,0);scenarios++;}
  // Recover is still legal at zero damage and pays its printed Energy cost.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102','base1-102']);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.energies.length,1);assert.equal(g.players[0].discard[0],'base1-102');assert.equal(g.players[0].active.damage,0);scenarios++;}
  // Star Freeze uses Water + two Colorless (Double Colorless supplies the
  // latter), deals 20, and applies paralysis only on heads.
  for(const [heads,status] of [[false,null],[true,'Paralyzed']]){const g=game(format,size);g.players[0].active=unit(id,['base1-102','base1-96']);g.players[1].active=unit('base1-64');g.rngState=rngStateFor(heads);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.status,status);scenarios++;}
  {const g=game(format,size);g.players[0].active=unit(id,['base1-102','base1-97']);reject(g,0,'attack',{attackIndex:0});assert.equal(g.turn,0);scenarios++;}
 }
}
assert.equal(scenarios,50);
console.log(`PASS Starmie Base/Base Set 2 Recover Water discard, Star Freeze, typed costs and distinct Energy choice (${scenarios} reducer scenarios)`);
