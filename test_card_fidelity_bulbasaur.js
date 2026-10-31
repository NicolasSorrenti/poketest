'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-44',format:'classic',grass:'base1-99'},
 {id:'base1-44',format:'neo-theme',grass:'base1-99'},
 {id:'base1-44',format:'online-preview',grass:'base1-99',size:60},
 {id:'base1-44',format:'online-preview',grass:'base1-99',size:40},
 {id:'base4-67',format:'online-preview',grass:'base4-127',size:60},
 {id:'base4-67',format:'online-preview',grass:'base4-127',size:40}
];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){
 const size=v.size||60,deck=Array(4).fill(v.id).concat(Array(size-4).fill(v.grass));
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:73});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(size===40?4:6).fill(v.grass);p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Leech Seed must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}

let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),attack=c.attacks[0];
 assert.equal(c.name,'Bulbasaur');assert.equal(c.hp,'40');assert.equal(attack.name,'Leech Seed');
 assert.deepEqual(attack.cost,['Grass','Grass']);assert.equal(attack.damage,'20');
 assert.equal(attack.text,'Unless all damage from this attack is prevented, you may remove 1 damage counter from Bulbasaur.');
 scenarios++;

 // Compulsory healing erratum: dealing damage automatically heals one counter,
 // even though the historic printed wording says "may". No player decision is
 // offered. Damage counters are removed from this Bulbasaur only.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass],20);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,20);assert.equal(g.players[0].active.damage,10);assert.equal(g.pendingDecision,null);scenarios++;}
 // Healing is capped by the damage already on Bulbasaur and still automatic.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass],10);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[0].active.damage,0);assert.equal(g.players[1].active.damage,20);assert.equal(g.pendingDecision,null);scenarios++;}
 // If all attack damage is prevented, the erratum's condition fails and no
 // healing occurs; this is not a player choice.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass],20);g.players[1].active.shield={preventDamage:true,expires:g.turnSerial+2};
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].active.damage,20);assert.equal(g.pendingDecision,null);scenarios++;}
 // A card that has no damage counters to remove cannot be healed below zero.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[0].active.damage,0);assert.equal(g.players[1].active.damage,20);assert.equal(g.pendingDecision,null);scenarios++;}
 // Grass + Double Colorless is not two Grass Energy for this typed cost.
 {const dce=v.id==='base1-44'?'base1-96':'base4-124',g=game(v);g.players[0].active=unit(v.id,[v.grass,dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}

console.log(`PASS Bulbasaur Leech Seed cost, compulsory heal erratum, and prevention (${scenarios} reducer scenarios)`);
