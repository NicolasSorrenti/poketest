'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-52',fighting:'base1-97',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-78',fighting:'base4-125',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:73});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Low Kick must be rejected');assert.deepEqual(g,before,'rejected Low Kick must be atomic');}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Machop');assert.equal(card.hp,'50');assert.deepEqual(card.types,['Fighting']);assert.deepEqual(card.attacks,[{name:'Low Kick',cost:['Fighting'],damage:'20',text:''}]);assert.deepEqual(card.weaknesses,[{type:'Psychic',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
 // Fixed 20 damage; an extra Double Colorless does not increase the attack.
 {const g=game(format,size);g.players[0].active=unit(c.id,[c.fighting,'base1-96']);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.deepEqual(g.players[0].active.energies,[c.fighting,'base1-96']);scenarios++;}
 // The printed Fighting Weakness doubles Low Kick, while Fighting Resistance
 // reduces it by 30 to zero. Neither modifier changes attack cost.
 {const g=game(format,size);g.players[0].active=unit(c.id,[c.fighting]);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40);scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id,[c.fighting]);g.players[1].active=unit('base1-17');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);scenarios++;}
 // One Double Colorless supplies no Fighting Energy and cannot pay Low Kick.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
assert.equal(scenarios,36);
console.log(`PASS Machop Low Kick printings, typed cost, fixed damage, Weakness and Resistance (${scenarios} reducer scenarios)`);
