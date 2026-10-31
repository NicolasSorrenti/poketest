'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');

const variants=[
 {id:'base1-42',format:'classic',size:60,prizes:6,water:'base1-102',lightning:'base1-100',fire:'base1-98',dce:'base1-96'},
 {id:'base1-42',format:'neo-theme',size:60,prizes:6,water:'base1-102',lightning:'base1-100',fire:'base1-98',dce:'base1-96'},
 {id:'base1-42',format:'online-preview',size:60,prizes:6,water:'base1-102',lightning:'base1-100',fire:'base1-98',dce:'base1-96'},
 {id:'base1-42',format:'online-preview',size:40,prizes:4,water:'base1-102',lightning:'base1-100',fire:'base1-98',dce:'base1-96'},
 {id:'base4-63',format:'online-preview',size:60,prizes:6,water:'base4-130',lightning:'base4-128',fire:'base4-126',dce:'base4-124'},
 {id:'base4-63',format:'online-preview',size:40,prizes:4,water:'base4-130',lightning:'base4-128',fire:'base4-126',dce:'base4-124'}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(v,seed=17){
 const deck=list('base1:Brushfire').slice(0,v.size);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.water);p.prizes=Array(v.prizes).fill(v.water);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}
function coinSequence(g,results){for(let seed=0;seed<100000;seed++){let state=seed,match=true;for(const expected of results){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){match=false;break;}}if(match){g.rngState=seed;return;}}throw Error('coin sequence not found');}

let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-42');
 assert.deepEqual(card.attacks,base.attacks,'Base Set 2 Wartortle must match Base Set attacks');
 assert.deepEqual(card.attacks[0],{name:'Withdraw',cost:['Water','Colorless'],damage:'',text:"Flip a coin. If heads, prevent all damage done to Wartortle during your opponent's next turn. (Any other effects of attacks still happen.)"});
 assert.deepEqual(card.attacks[1],{name:'Bite',cost:['Water','Colorless','Colorless'],damage:'40',text:''});
 assert.equal(ATTACK.compile(card.attacks[0]).kind,'coin-shield');
 assert.equal(ATTACK.compile(card.attacks[1]).kind,'flat');scenarios++;

 // Withdraw costs one Water plus one Colorless; tails grants no shield.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);coinSequence(g,[false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.shield,undefined);assert.equal(g.turn,1);scenarios++;}
 // On heads, damage is prevented for the opponent's turn but attack effects still resolve.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);g.players[1].active=unit('base1-9',[v.lightning,v.lightning,v.lightning]);coinSequence(g,[true,true]);act(g,0,'attack',{attackIndex:0});act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.status,'Paralyzed');assert.equal(g.players[0].active.shield.preventDamage,true);scenarios++;}
 // The protection expires after exactly the opponent's protected turn.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);g.players[1].active=unit('base1-9',[v.lightning,v.lightning,v.lightning]);coinSequence(g,[true,false,false]);act(g,0,'attack',{attackIndex:0});act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);act(g,0,'end_turn');act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,60);scenarios++;}
 // Bite requires Water plus two Colorless and deals 40; DCE pays both Colorless units.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.pendingDecision,null);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);g.players[1].active=unit('base1-23');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,80,'Water weakness doubles Bite');scenarios++;}
 // Lightning damage against Wartortle is doubled by its printed Weakness.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit('base1-9',[v.lightning,v.lightning,v.lightning]);coinSequence(g,[false]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,60);scenarios++;}
}
console.log(`PASS Wartortle Withdraw and Bite: ${scenarios} reducer scenarios`);
