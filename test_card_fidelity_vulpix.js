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
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:59});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should be rejected`);assert.deepEqual(g,before,'rejected attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,ok=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){ok=false;break;}}if(ok)return seed;}throw Error('coin sequence not found');}
let scenarios=0;
for(const id of ['base1-68','base4-99']){
 const card=CATALOG.get(id);assert.equal(card.name,'Vulpix');assert.equal(card.hp,'50');assert.deepEqual(card.types,['Fire']);
 assert.deepEqual(card.attacks,[{name:'Confuse Ray',cost:['Fire','Fire'],damage:'10',text:'Flip a coin. If heads, the Defending Pokémon is now Confused.'}]);
 assert.deepEqual(card.weaknesses,[{type:'Water',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
}
for(const {format,size} of configs){
 for(const id of ['base1-68','base4-99']){
  // Both coin outcomes deal 10; heads applies Confusion.
  for(const [heads,status] of [[false,null],[true,'Confused']]){const g=game(format,size);g.players[0].active=unit(id,['base1-98','base1-98']);g.players[1].active=unit('base1-61');g.rngState=seedFor([heads]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.status,status);scenarios++;}
  // Confusion replaces Sleep only on heads; a tails result leaves Sleep alone.
  for(const [heads,status] of [[false,'Asleep'],[true,'Confused']]){const g=game(format,size);g.players[0].active=unit(id,['base1-98','base1-98']);g.players[1].active=unit('base1-61',[], 'Asleep');g.rngState=seedFor([heads]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.status,status);scenarios++;}
  // Poison coexists with the new major Special Condition and still checks up.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-98','base1-98']);g.players[1].active=unit('base1-61',[],null,true);g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.status,'Confused');scenarios++;}
  // The opponent's following attack resolves only on its Confusion heads.
  for(const confusionHeads of [false,true]){const g=game(format,size);g.players[0].active=unit(id,['base1-98','base1-98']);g.players[1].active=unit('base1-46',['base1-96']);g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});g.rngState=seedFor([confusionHeads]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,confusionHeads?10:30);assert.equal(g.players[0].active.damage,confusionHeads?10:0);scenarios++;}
  // WotC-era rules apply Weakness and Resistance to Confusion self-damage.
  // Mewtwo's Psychic Weakness doubles the failed-attack self-hit to 40.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-98','base1-98']);g.players[1].active=unit('base1-10',['base1-101','base1-96']);g.rngState=seedFor([true]);act(g,0,'attack',{attackIndex:0});g.rngState=seedFor([false]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,50);assert.equal(g.players[1].active.status,'Confused');assert.equal(g.players[0].active.damage,0);scenarios++;}
  // A Fire and Double Colorless pair cannot satisfy the two-Fire requirement.
  {const g=game(format,size);g.players[0].active=unit(id,['base1-98','base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
  // Staryu's Water attack is doubled by Vulpix's printed Weakness.
  {const g=game(format,size);g.players[0].active=unit('base1-65',['base1-102']);g.players[1].active=unit(id);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40);scenarios++;}
 }
}
for(const {format,size} of configs.filter(x=>x.format!=='classic')){
 for(const id of ['base1-68','base4-99']){
  // Rainbow Energy counts as Fire in the supported later formats.
  const g=game(format,size);g.players[0].active=unit(id,['base1-98','base5-17']);g.players[1].active=unit('base1-61');g.rngState=seedFor([false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);scenarios++;
 }
}
assert.equal(scenarios,88);
console.log(`PASS Vulpix Base/Base Set 2 Confuse Ray, coin outcomes, Confusion checks, costs, Poison coexistence and Water Weakness (${scenarios} reducer scenarios)`);
