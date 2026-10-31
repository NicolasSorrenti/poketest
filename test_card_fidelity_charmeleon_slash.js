'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {compile}=require('./attack_effects_core');

const variants=[
 {id:'base1-24',format:'classic',dce:'base1-96',fire:'base1-98',grassEnergy:'base1-99'},
 {id:'base4-35',format:'online-preview',dce:'base4-124',fire:'base4-126',grassEnergy:'base4-127'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire');const g=createGame({decks:[deck,deck],format:v.format,seed:20261031});
 g.phase='game';g.round=4;g.turnSerial=8;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grassEnergy);p.prizes=Array(6).fill(v.grassEnergy);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Slash must be rejected');assert.deepEqual(g,before,'rejected Slash must be atomic');}
let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),attacks=c.attacks,slash=attacks[0],base=CATALOG.get('base1-24');
 assert.deepEqual(attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 attacks must match Base Set text and costs');
 assert.equal(slash.name,'Slash');assert.deepEqual(slash.cost,['Colorless','Colorless','Colorless']);assert.equal(slash.damage,'30');assert.equal(slash.text,'');
 const program=compile(slash);assert.equal(program.kind,'flat');assert.equal(program.damage,30);scenarios++;

 // Colorless payment is flexible: one DCE plus one Fire and one Grass card.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce,v.fire,v.grassEnergy]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,30);assert.equal(g.pendingDecision,null);scenarios++;}

 // Three typed Energy cards also pay the three-Colorless cost.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.fire,v.fire]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,30);scenarios++;}

 // One Double Colorless card supplies only two of the three required units.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}

 // Fire Weakness doubles Slash from 30 to 60 without treating the attacker's
 // own Fire type as a reason to modify its Colorless cost.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce,v.fire,v.grassEnergy]);g.players[1].active=unit('base2-33');
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,60);scenarios++;}

 // A damage-only shield prevents Slash damage; it adds no attack choices or
 // other effects, matching the card's blank effect text.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce,v.fire,v.grassEnergy]);g.players[1].active.shield={preventDamage:true,expires:g.turnSerial+2};
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.pendingDecision,null);scenarios++;}
}
console.log(`PASS Charmeleon Slash: ${scenarios} reducer scenarios`);
