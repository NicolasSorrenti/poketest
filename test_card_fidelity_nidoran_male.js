'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-55',grass:'base1-99',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-83',grass:'base4-127',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:89});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Horn Hazard must be rejected');assert.deepEqual(g,before,'rejected Horn Hazard must be atomic');}
function seedFor(heads){for(let seed=0;seed<10000;seed++){const state=(Math.imul(seed,1664525)+1013904223)>>>0;if((state>=0x80000000)===heads)return seed;}throw Error('coin seed not found');}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Nidoran♂');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Grass']);assert.deepEqual(card.attacks,[{name:'Horn Hazard',cost:['Grass'],damage:'30',text:'Flip a coin. If tails, this attack does nothing.'}]);assert.deepEqual(card.weaknesses,[{type:'Psychic',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
 // Heads deals the printed 30; tails does nothing. The paid Grass Energy
 // stays attached and both coin outcomes consume exactly one flip.
 for(const heads of [false,true]){const g=game(format,size);g.players[0].active=unit(c.id,[c.grass]);g.players[1].active=unit('base1-1');g.rngState=seedFor(heads);g.coinFlips=[];g.coinSeq=0;act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,heads?30:0);assert.deepEqual(g.players[0].active.energies,[c.grass]);assert.equal(g.coinFlips.length,1);scenarios++;}
 // A Colorless source cannot satisfy the Grass requirement; rejected
 // declarations must leave the complete game state untouched.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
assert.equal(scenarios,30);
console.log(`PASS Nidoran male Horn Hazard printings, coin outcomes, cost and atomic rejection (${scenarios} reducer scenarios)`);
