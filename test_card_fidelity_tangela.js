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
const unit=(id,energies=[],status=null,poison=false)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status,poison,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:47});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);assert.deepEqual(g,before,'rejected attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,ok=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){ok=false;break;}}if(ok)return seed;}throw Error('coin sequence not found');}
let scenarios=0;
for(const id of ['base1-66','base4-96']){
 const card=CATALOG.get(id);assert.equal(card.name,'Tangela');assert.equal(card.hp,'50');assert.deepEqual(card.types,['Grass']);
 assert.deepEqual(card.attacks,[
  {name:'Bind',cost:['Grass','Colorless'],damage:'20',text:'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'},
  {name:'Poisonpowder',cost:['Grass','Grass','Grass'],damage:'20',text:'The Defending Pokémon is now Poisoned.'}
 ]);
 assert.deepEqual(card.weaknesses,[{type:'Fire',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless','Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-66','base4-96']){
  // Bind deals 20 with either coin, and only heads applies Paralysis.
  for(const [heads,status] of [[false,null],[true,'Paralyzed']]){const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-96']);g.players[1].active=unit('base1-46');g.rngState=seedFor([heads]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.status,status);assert.equal(g.players[1].active.poison,false);scenarios++;}
  // Poisonpowder's 20 attack damage is followed by one Poison checkup; an
  // already-Poisoned target does not receive a stacked poison condition.
  for(const alreadyPoisoned of [false,true]){const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99']);g.players[1].active=unit('base1-46',[],null,alreadyPoisoned);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.poison,true);scenarios++;}
  // Poison and a single major Special Condition coexist; the Poison still
  // ticks at the defender's next between-turn checkup.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99']);g.players[1].active=unit('base1-46',['base1-96'],'Paralyzed',true);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.status,'Paralyzed');scenarios++;}
  // A later opponent turn also performs the Poison checkup after its attack.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-99','base1-99']);g.players[1].active=unit('base1-46',['base1-96']);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active.damage,20);scenarios++;}
  // Each attack's printed Grass requirements must be paid with Grass.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-99','base1-96']);reject(g,0,'attack',{attackIndex:1});scenarios++;}
  {const g=game(format,size);g.players[0].active=unit(id,['base1-100','base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 }
}
assert.equal(scenarios,66);
console.log(`PASS Tangela Base/Base Set 2 Bind and Poisonpowder, costs, coins, status coexistence and Poison checkups (${scenarios} reducer scenarios)`);
