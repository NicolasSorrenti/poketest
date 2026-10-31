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
const unit=(id,energies=[],status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:29});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function rngStateFor(...flips){for(let seed=0;seed<100000;seed++){let state=seed,ok=true;for(const flip of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>>>31)!==Number(flip)){ok=false;break;}}if(ok)return seed;}throw Error('No deterministic RNG state found');}
let scenarios=0;
for(const id of ['base1-63','base4-93']){
 const card=CATALOG.get(id);assert.equal(card.name,'Squirtle');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Water']);
 assert.deepEqual(card.attacks,[
  {name:'Bubble',cost:['Water'],damage:'10',text:'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'},
  {name:'Withdraw',cost:['Water','Colorless'],damage:'',text:'Flip a coin. If heads, prevent all damage done to Squirtle during your opponent\'s next turn. (Any other effects of attacks still happen.)'}
 ]);
 assert.deepEqual(card.weaknesses,[{type:'Lightning',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-63','base4-93']){
  // Bubble requires Water, deals fixed 10, doubles against Water-weak Charmander,
  // and its paralysis is independently determined by the coin.
  for(const [heads,expectedDamage,expectedStatus] of [[false,20,null],[true,20,'Paralyzed']]){
   const g=game(format,size);g.players[0].active=unit(id,['base1-102']);g.players[1].active=unit('base1-46');g.rngState=rngStateFor(heads);
   act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,expectedDamage);assert.equal(g.players[1].active.status,expectedStatus);scenarios++;
  }
  // Withdraw is damage-only: two Defenders reduce Magneton's doubled 60 to 20
  // on tails, while heads prevents damage but leaves coin-based status active.
  for(const [withdrawHeads,thunderHeads,expectedDamage,expectedStatus] of [[false,true,20,'Paralyzed'],[true,true,0,'Paralyzed'],[true,false,0,null]]){
   const g=game(format,size);g.players[0].active=unit(id,['base1-102','base1-97']);g.players[0].active.attachedTrainers=[{id:'base1-80',expires:100},{id:'base1-80',expires:100}];g.players[1].active=unit('base1-9',['base1-100','base1-100','base1-97']);
   g.rngState=rngStateFor(withdrawHeads);act(g,0,'attack',{attackIndex:1});assert.equal(g.turn,1);
   g.rngState=rngStateFor(thunderHeads);act(g,1,'attack',{attackIndex:0});
   assert.equal(g.players[0].active.damage,expectedDamage);assert.equal(g.players[0].active.status,expectedStatus);scenarios++;
  }
  // Reject both an unpaid Water requirement and a Withdraw with only Colorless.
  for(const [attackIndex,energies] of [[0,['base1-97']],[1,['base1-97','base1-97']]]){
   const g=game(format,size);g.players[0].active=unit(id,energies);const result=applyCommand(g,0,{type:'attack',payload:{attackIndex}});assert.equal(result.ok,false);assert.equal(g.turn,0);scenarios++;
  }
 }
}
assert.equal(scenarios,58);
console.log(`PASS Squirtle Base/Base Set 2 Bubble and Withdraw, weakness, typed costs, coin effects and damage-only prevention (${scenarios} reducer scenarios)`);
