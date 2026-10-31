'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const variants=[
 {id:'base1-36',format:'classic',size:60,prizes:6,fire:'base1-98',grass:'base1-99',dce:'base1-96',rainbow:'base5-17'},
 {id:'base1-36',format:'neo-theme',size:60,prizes:6,fire:'base1-98',grass:'base1-99',dce:'base1-96',rainbow:'base5-17'},
 {id:'base1-36',format:'online-preview',size:60,prizes:6,fire:'base1-98',grass:'base1-99',dce:'base1-96',rainbow:'base5-17'},
 {id:'base1-36',format:'online-preview',size:40,prizes:4,fire:'base1-98',grass:'base1-99',dce:'base1-96',rainbow:'base5-17'},
 {id:'base4-51',format:'online-preview',size:60,prizes:6,fire:'base4-126',grass:'base4-127',dce:'base4-124',rainbow:'base5-17'},
 {id:'base4-51',format:'online-preview',size:40,prizes:4,fire:'base4-126',grass:'base4-127',dce:'base4-124',rainbow:'base5-17'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){const deck=list('base1:Brushfire').slice(0,v.size);const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed:67});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.fire);p.prizes=Array(v.prizes).fill(v.fire);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}g.players[0].active=unit(v.id);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Magmar attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
function choose(g,side,selected){const d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected});}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-36');
 assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set attacks');
 const attack=card.attacks[0];assert.equal(attack.name,'Fire Punch');assert.deepEqual(attack.cost,['Fire','Fire']);assert.equal(attack.damage,'30');assert.equal(attack.text,'Discard 1 Fire Energy card attached to Magmar in order to use this attack.');
 const program=ATTACK.compile(attack);assert.equal(program.kind,'energy-discard');assert.equal(program.quantity,1);assert.equal(program.onlyType,'Fire');scenarios++;
 // The additional discard is mandatory even when the two Fire Energy cards are the entire attack cost.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.fire];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30);assert.deepEqual(g.players[0].active.energies,[v.fire]);assert.deepEqual(g.players[0].discard,[v.fire]);assert.equal(g.pendingDecision,null);assert.ok(g.message.some(x=>x.includes('discarded 1 Fire Energy')));if(v.format==='online-preview')assert.ok(g.matchFeed.some(x=>String(x.text||'').includes('discarded 1 Fire Energy')));scenarios++;}
 // Equivalent Basic Fire reprints auto-resolve and preserve the same Energy-card outcome.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.fire==='base1-98'?'base4-126':'base1-98',v.fire];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.energies.length,2);assert.equal(CATALOG.get(g.players[0].discard[0]).name,'Fire Energy');scenarios++;}
 // Rainbow supplies Fire, but differs from Basic Fire so the attacker chooses the discard.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.rainbow];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['energy:0','energy:1']);choose(g,0,['energy:1']);assert.deepEqual(g.players[0].active.energies,[v.fire]);assert.deepEqual(g.players[0].discard,[v.rainbow]);assert.equal(g.players[1].active.damage,30);scenarios++;}
 // Grass is not a legal discard; the remaining Fire is discarded automatically.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.fire,v.grass];act(g,0,'attack',{attackIndex:0});assert.deepEqual(g.players[0].discard,[v.fire]);assert.deepEqual(g.players[0].active.energies,[v.fire,v.grass]);assert.equal(g.pendingDecision,null);scenarios++;}
 // One Fire plus Double Colorless has enough units but not two Fire symbols.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.dce];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Fire Weakness applies to the attack damage; the mandatory discard and Prize flow still resolve.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.fire];g.players[1].active=unit('base1-44');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active,null);assert.equal(g.pendingAction.kind,'take_prize');assert.deepEqual(g.players[0].discard,[v.fire]);scenarios++;}
}
console.log(`PASS Magmar Fire Punch: ${scenarios} reducer scenarios`);
