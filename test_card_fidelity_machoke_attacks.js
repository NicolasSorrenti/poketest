'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const variants=[
 {id:'base1-34',format:'classic',size:60,prizes:6,fighting:'base1-97',dce:'base1-96'},
 {id:'base1-34',format:'neo-theme',size:60,prizes:6,fighting:'base1-97',dce:'base1-96'},
 {id:'base1-34',format:'online-preview',size:60,prizes:6,fighting:'base1-97',dce:'base1-96'},
 {id:'base1-34',format:'online-preview',size:40,prizes:4,fighting:'base1-97',dce:'base1-96'},
 {id:'base4-49',format:'online-preview',size:60,prizes:6,fighting:'base4-125',dce:'base4-124'},
 {id:'base4-49',format:'online-preview',size:40,prizes:4,fighting:'base4-125',dce:'base4-124'}
];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){const deck=list('base1:Brushfire').slice(0,v.size);const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed:59});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.fighting);p.prizes=Array(v.prizes).fill(v.fighting);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}g.players[0].active=unit(v.id);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Machoke attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-34');
 assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set text and costs');
 assert.equal(card.attacks[0].text,'Does 50 damage minus 10 damage for each damage counter on Machoke.');assert.deepEqual(card.attacks[0].cost,['Fighting','Fighting','Colorless']);
 assert.equal(card.attacks[1].text,'Machoke does 20 damage to itself.');assert.deepEqual(card.attacks[1].cost,['Fighting','Fighting','Colorless','Colorless']);
 assert.equal(ATTACK.compile(card.attacks[0]).kind,'minus-counters');assert.equal(ATTACK.compile(card.attacks[0]).subject,'Machoke');scenarios++;
 // Double Colorless pays the Colorless slot without replacing a Fighting requirement.
 {const g=game(v);g.players[0].active.energies=[v.fighting,v.fighting,v.dce];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,50);scenarios++;}
 // Karate Chop's floor and counter scaling include the five-counter zero point and never go negative.
 for(const counters of [1,2,4,5,6,7]){const g=game(v);g.players[0].active=unit(v.id,[v.fighting,v.fighting,v.fighting],counters*10);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,Math.max(0,50-counters*10));scenarios++;}
 // Counters reduce base damage before the defender's Weakness multiplier.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fighting,v.fighting,v.dce],20);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,60);scenarios++;}
 // DCE cannot satisfy either of the two typed Fighting symbols.
 {const g=game(v);g.players[0].active.energies=[v.fighting,v.dce];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.fighting,v.fighting];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Submission applies 60 to the defender and 20 to Machoke, unaffected by Fighting Resistance.
 {const g=game(v);g.players[0].active.energies=[v.fighting,v.fighting,v.dce];g.players[1].active=unit('base1-29');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.damage,20);scenarios++;}
 // Weakness on the Defending Pokémon doubles Submission; its self-damage remains 20.
 {const g=game(v);g.players[0].active.energies=[v.fighting,v.fighting,v.dce];g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active,null);assert.equal(g.pendingAction.kind,'take_prize');assert.equal(g.players[0].active.damage,20);scenarios++;}
 // Self-recoil can Knock Out Machoke after damage resolves, with the opponent still taking a Prize.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fighting,v.fighting,v.dce],60);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active,null);assert.equal(g.players[1].active.damage,60);assert.equal(g.pendingAction.kind,'take_prize');assert.equal(g.pendingDecision.actor,1);scenarios++;}
}
console.log(`PASS Machoke Karate Chop and Submission: ${scenarios} reducer scenarios`);
