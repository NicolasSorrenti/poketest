'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const variants=[
 {id:'base1-35',format:'classic',size:60,prizes:6,water:'base1-102',dce:'base1-96',fire:'base1-98',lightning:'base1-100'},
 {id:'base1-35',format:'neo-theme',size:60,prizes:6,water:'base1-102',dce:'base1-96',fire:'base1-98',lightning:'base1-100'},
 {id:'base1-35',format:'online-preview',size:60,prizes:6,water:'base1-102',dce:'base1-96',fire:'base1-98',lightning:'base1-100'},
 {id:'base1-35',format:'online-preview',size:40,prizes:4,water:'base1-102',dce:'base1-96',fire:'base1-98',lightning:'base1-100'},
 {id:'base4-50',format:'online-preview',size:60,prizes:6,water:'base4-130',dce:'base4-124',fire:'base4-126',lightning:'base4-128'},
 {id:'base4-50',format:'online-preview',size:40,prizes:4,water:'base4-130',dce:'base4-124',fire:'base4-126',lightning:'base4-128'}
];
const unit=(id,energies=[],damage=0,status=null,poison=false)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison,playedTurn:0});
function game(v){const deck=list('base1:Brushfire').slice(0,v.size);const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed:61});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.water);p.prizes=Array(v.prizes).fill(v.water);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}g.players[0].active=unit(v.id);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Magikarp attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-35');
 assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set text and costs');
 assert.equal(card.attacks[0].name,'Tackle');assert.deepEqual(card.attacks[0].cost,['Colorless']);assert.equal(card.attacks[0].damage,'10');
 assert.equal(card.attacks[1].name,'Flail');assert.deepEqual(card.attacks[1].cost,['Water']);assert.equal(card.attacks[1].damage,'10x');assert.equal(card.attacks[1].text,'Does 10 damage times the number of damage counters on Magikarp.');
 assert.equal(ATTACK.compile(card.attacks[1]).kind,'flail-counters');assert.equal(ATTACK.compile(card.attacks[1]).subject,'Magikarp');scenarios++;
 // Tackle's Colorless requirement can be paid by any single Energy.
 {const g=game(v);g.players[0].active.energies=[v.water];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.dce];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);scenarios++;}
 {const g=game(v);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Flail's typed Water cost is mandatory; its damage uses the counters already on Magikarp.
 for(const counters of [0,1,2]){const g=game(v);g.players[0].active=unit(v.id,[v.water],counters*10);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,counters*10);assert.equal(g.players[0].active.damage,counters*10);scenarios++;}
 // Double Colorless Energy does not satisfy the Water symbol.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce],10);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Water Weakness doubles Flail's counter-based damage after its base calculation.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water],20);g.players[1].active=unit('base1-4');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active.damage,20);scenarios++;}
 // Poison does not block attacks; its prior Checkup counter contributes to Flail, then Poison resolves again at this turn's Checkup.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water],10,null,true);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[0].active.damage,20);scenarios++;}
 // A Lightning attack doubles damage to Water-type Magikarp.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit('base1-20',[v.lightning]);g.rngState=0;act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
}
console.log(`PASS Magikarp Tackle and Flail: ${scenarios} reducer scenarios`);
