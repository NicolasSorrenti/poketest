'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');

const variants=[
 {id:'base1-41',format:'classic',size:60,prizes:6,water:'base1-102',fire:'base1-98',dce:'base1-96'},
 {id:'base1-41',format:'neo-theme',size:60,prizes:6,water:'base1-102',fire:'base1-98',dce:'base1-96'},
 {id:'base1-41',format:'online-preview',size:60,prizes:6,water:'base1-102',fire:'base1-98',dce:'base1-96'},
 {id:'base1-41',format:'online-preview',size:40,prizes:4,water:'base1-102',fire:'base1-98',dce:'base1-96'},
 {id:'base4-61',format:'online-preview',size:60,prizes:6,water:'base4-130',fire:'base4-126',dce:'base4-124'},
 {id:'base4-61',format:'online-preview',size:40,prizes:4,water:'base4-130',fire:'base4-126',dce:'base4-124'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v,seed=17){
 const deck=list('base1:Brushfire').slice(0,v.size);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.water);p.prizes=Array(v.prizes).fill(v.water);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}

let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-41');
 assert.deepEqual(card.attacks,base.attacks,'Base Set 2 Seel must match the Base Set attack');
 assert.deepEqual(card.attacks[0],{name:'Headbutt',cost:['Water'],damage:'10',text:''});
 assert.equal(ATTACK.compile(card.attacks[0]).kind,'flat');
 scenarios++;

 // Headbutt needs a typed Water Energy, not merely a Colorless unit, deals
 // only its printed 10 damage, and offers no unnecessary decision.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water]);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.equal(g.pendingDecision,null);assert.equal(g.turn,1);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire]);reject(g,0,'attack',{attackIndex:0});scenarios++;}

 // Water Headbutt doubles against Fire-weak Arcanine; incoming Lightning
 // Gnaw doubles against Seel's printed Weakness.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water]);g.players[1].active=unit('base1-23');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit('base1-58',[v.water]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
}
console.log(`PASS Seel Headbutt: ${scenarios} reducer scenarios`);
