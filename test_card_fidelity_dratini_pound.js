'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-26',format:'classic',energy:'base1-98',psychic:'base1-101'},
 {id:'base4-38',format:'online-preview',energy:'base4-126',psychic:'base4-129'}
];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire');const g=createGame({decks:[deck,deck],format:v.format,seed:20261031});
 g.phase='game';g.round=4;g.turnSerial=8;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.energy);p.prizes=Array(6).fill(v.energy);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid attack must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),base=CATALOG.get('base1-26');
 assert.deepEqual(c.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 must match Base Set attack text/cost');
 const attack=c.attacks[0];assert.equal(attack.name,'Pound');assert.deepEqual(attack.cost,['Colorless']);assert.equal(attack.damage,'10');assert.equal(attack.text,'');scenarios++;

 // Any Energy card satisfies Pound's single Colorless requirement.
 {const g=game(v);g.players[0].active=unit(v.id,[v.energy]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);assert.equal(g.pendingDecision,null);scenarios++;}
 // Double Colorless supplies two units but Pound still deals only 10.
 {const g=game(v);g.players[0].active=unit(v.id,[v.id==='base1-26'?'base1-96':'base4-124']);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);scenarios++;}
 // No attached Energy cannot pay even this one-unit attack.
 {const g=game(v);g.players[0].active=unit(v.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Colorless Pound does not trigger a Psychic-type Weakness modifier.
 {const g=game(v);g.players[0].active=unit(v.id,[v.energy]);g.players[1].active=unit('base1-10');
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);scenarios++;}
 // Dratini's printed Psychic Resistance reduces a 40-damage Psychic attack by 30.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id,[v.energy,v.energy,v.energy]);g.players[1].active=unit('base1-10',[v.psychic,v.psychic]);
  act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,10);scenarios++;}
 // Damage prevention blocks the vanilla attack without creating a choice.
 {const g=game(v);g.players[0].active=unit(v.id,[v.energy]);g.players[1].active.shield={preventDamage:true,expires:g.turnSerial+2};
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.pendingDecision,null);scenarios++;}
}
console.log(`PASS Dratini Pound and Psychic Resistance: ${scenarios} reducer scenarios`);
