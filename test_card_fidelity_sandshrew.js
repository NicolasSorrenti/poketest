'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const EXT=require('./classic_attack_extensions');
const configs=[
 {format:'classic',size:60},
 {format:'neo-theme',size:60},
 {format:'online-preview',size:60},
 {format:'online-preview',size:40}
];
const unit=(id,energies=[],status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:23});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function rngStateFor(...flips){for(let seed=0;seed<100000;seed++){let state=seed;let ok=true;for(const flip of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>>>31)!==Number(flip)){ok=false;break;}}if(ok)return seed;}throw Error('No deterministic RNG state found');}
function sandshrewTurn(g,id,defender){g.players[0].active=unit(id,['base1-97']);g.players[1].active=defender;act(g,0,'attack',{attackIndex:0});assert.equal(g.turn,1);assert.equal(g.players[1].active.attackPenalty?.expires,8);}
let scenarios=0;
for(const id of ['base1-62','base4-91']){
 const card=CATALOG.get(id);assert.equal(card.name,'Sandshrew');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Fighting']);
 assert.deepEqual(card.attacks,[{name:'Sand-attack',cost:['Fighting'],damage:'10',text:'If the Defending Pokémon tries to attack during your opponent\'s next turn, your opponent flips a coin. If tails, that attack does nothing.'}]);
 assert.deepEqual(card.weaknesses,[{type:'Grass',value:'×2'}]);assert.deepEqual(card.resistances,[{type:'Lightning',value:'-30'}]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
// Early Base 1st Edition and Shadowless copies say "this attack"; the WotC
// ruling confirms this is an attack-prevention effect on the Defending Pokémon.
const oldText='If the Defending Pokémon tries to attack during your opponent\'s next turn, your opponent flips a coin. If tails, this attack does nothing.';
assert.equal(EXT.compile({name:'Sand-attack',damage:'10',text:oldText})?.kind,'sand-attack');scenarios++;
for(const {format,size} of configs){
 for(const id of ['base1-62','base4-91']){
  // Against Swift, tails prevents the attack entirely; heads lets Swift resolve.
  for(const [flip,expected] of [[false,0],[true,20]]){
   const g=game(format,size);sandshrewTurn(g,id,unit('gym1-90',['base1-102','base1-96']));g.rngState=rngStateFor(flip);
   act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,expected);scenarios++;
  }
  // Ruling Q20: pay the required discard cost before the Sand-attack coin.
  {const g=game(format,size);sandshrewTurn(g,id,unit('base1-10',['base1-101','base1-101']));g.rngState=rngStateFor(false);
   act(g,1,'attack',{attackIndex:1});assert.equal(g.players[1].discard.filter(x=>x==='base1-101').length,1);assert.equal(g.players[1].active.energies.length,1);scenarios++;}
  // Ruling Q328: check Sand-attack before Confusion; separate coin flips.
  {const g=game(format,size);sandshrewTurn(g,id,unit('base1-10',['base1-101','base1-101'],'Confused'));g.rngState=rngStateFor(false);
   act(g,1,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].discard.filter(x=>x==='base1-101').length,1);assert.equal(g.coinFlips.at(-1).result,'tails');scenarios++;}
  {const g=game(format,size);sandshrewTurn(g,id,unit('base1-10',['base1-101','base1-101'],'Confused'));g.rngState=rngStateFor(true,false);
   act(g,1,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,50);assert.equal(g.players[1].discard.filter(x=>x==='base1-101').length,1);assert.deepEqual(g.coinFlips.slice(-2).map(x=>x.result),['heads','tails']);scenarios++;}
 }
}
assert.equal(scenarios,43);
console.log(`PASS Sandshrew Base/Base Set 2 Sand-attack printings, prevention, ordering and Swift rulings (${scenarios} reducer scenarios)`);
