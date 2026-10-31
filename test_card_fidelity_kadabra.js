'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-32',format:'classic',size:60,prizes:6,psychic:'base1-101',dce:'base1-96',grass:'base1-99',rainbow:'base5-17',weak:'base1-8',resist:'base1-5'},
 {id:'base1-32',format:'neo-theme',size:60,prizes:6,psychic:'base1-101',dce:'base1-96',grass:'base1-99',rainbow:'base5-17',weak:'base1-8',resist:'base1-5'},
 {id:'base1-32',format:'online-preview',size:60,prizes:6,psychic:'base1-101',dce:'base1-96',grass:'base1-99',rainbow:'base5-17',weak:'base1-8',resist:'base1-5'},
 {id:'base1-32',format:'online-preview',size:40,prizes:4,psychic:'base1-101',dce:'base1-96',grass:'base1-99',rainbow:'base5-17',weak:'base1-8',resist:'base1-5'},
 {id:'base4-46',format:'online-preview',size:60,prizes:6,psychic:'base4-129',dce:'base4-124',grass:'base4-127',rainbow:'base5-17',weak:'base1-8',resist:'base1-5'},
 {id:'base4-46',format:'online-preview',size:40,prizes:4,psychic:'base4-129',dce:'base4-124',grass:'base4-127',rainbow:'base5-17',weak:'base1-8',resist:'base1-5'}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.size);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed:43});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.psychic);p.prizes=Array(v.prizes).fill(v.psychic);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.players[0].active=unit(v.id);return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Kadabra action should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
function choose(g,side,selected){const d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected});}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-32');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set attack text and costs');
 assert.equal(printed.attacks[0].text,'Discard 1 Psychic Energy card attached to Kadabra in order to use this attack. Remove all damage counters from Kadabra.');
 assert.deepEqual(printed.attacks[0].cost,['Psychic','Psychic']);assert.deepEqual(printed.attacks[1].cost,['Psychic','Psychic','Colorless']);scenarios++;
 // Recover still requires and discards one Psychic Energy when Kadabra is undamaged.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.psychic]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.energies.length,2);assert.deepEqual(g.players[0].discard,[v.psychic]);assert.ok(g.message.some(x=>x.includes('discarded 1 Psychic Energy')));if(v.format==='online-preview')assert.ok(g.matchFeed.some(x=>String(x.text||'').includes('discarded 1 Psychic Energy')));scenarios++;}
 // Recover discards its additional cost then removes every damage counter.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.dce],50);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,[v.psychic,v.dce]);assert.deepEqual(g.players[0].discard,[v.psychic]);scenarios++;}
 // Same-name Basic Psychic reprints have identical outcomes and resolve without a prompt.
 {const g=game(v);const other=v.psychic==='base1-101'?'base4-129':'base1-101';g.players[0].active=unit(v.id,[v.psychic,other,v.dce],20);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.energies.length,2);assert.equal(CATALOG.get(g.players[0].discard[0]).name,'Psychic Energy');scenarios++;}
 // The typed discard cannot consume Grass Energy, and the remaining Psychic is retained.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.grass],40);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,[v.psychic,v.grass]);assert.deepEqual(g.players[0].discard,[v.psychic]);assert.equal(g.players[0].active.damage,0);scenarios++;}
 // Rainbow Energy supplies Psychic while attached but remains a distinct, selectable card outcome.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.rainbow],30);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['energy:0','energy:1','energy:2']);choose(g,0,['energy:2']);assert.deepEqual(g.players[0].active.energies,[v.psychic,v.psychic]);assert.deepEqual(g.players[0].discard,[v.rainbow]);assert.equal(g.players[0].active.damage,0);scenarios++;}
 // A DCE cannot replace the second Psychic required to pay Recover's attack cost.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.dce],30);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Super Psy: two typed Psychic plus one Colorless slot (DCE may pay that slot).
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.dce]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,50);scenarios++;}
 // An Energy-rich but under-typed attacker still cannot use Super Psy.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.dce,v.grass]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Psychic Weakness doubles Super Psy; Psychic Resistance reduces it by 30.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.grass]);g.players[1].active=unit(v.weak);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active,null);assert.equal(g.pendingAction.kind,'take_prize');scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic,v.grass]);g.players[1].active=unit(v.resist);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);scenarios++;}
}
console.log(`PASS Kadabra Recover and Super Psy: ${scenarios} reducer scenarios`);
