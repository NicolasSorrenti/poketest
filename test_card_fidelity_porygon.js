'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');

const variants=[
 {format:'classic',size:60,prizes:6,fire:'base1-98',water:'base1-102',fighting:'base1-97'},
 {format:'online-preview',size:60,prizes:6,fire:'base1-98',water:'base1-102',fighting:'base1-97'},
 {format:'online-preview',size:40,prizes:4,fire:'base1-98',water:'base1-102',fighting:'base1-97'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v,seed=11){
 const deck=list('base1:Brushfire').slice(0,v.size);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.water);p.prizes=Array(v.prizes).fill(v.water);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function choose(g,side,selected){const d=g.pendingDecision;assert.ok(d,'expected a pending choice');assert.equal(d.actor,side,'choice belongs to the correct player');act(g,side,'choose',{decisionId:d.id,selected});}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}

let scenarios=0;
for(const v of variants){
 const card=CATALOG.get('base1-39');
 assert.equal(card.attacks[0].text,'If the Defending Pokémon has a Weakness, you may change it to a type of your choice other than Colorless.');
 assert.equal(card.attacks[1].text,"Change Porygon's Resistance to a type of your choice other than Colorless.");
 assert.equal(ATTACK.compile(card.attacks[0]).kind,'conversion1');
 assert.equal(ATTACK.compile(card.attacks[1]).kind,'conversion2');
 scenarios++;

 // The conditional Conversion 1 effect can do nothing; this is not an attack
 // prohibition and a no-Weakness target must not trigger a meaningless prompt.
 {const g=game(v);g.players[0].active=unit('base1-39',[v.fire]);g.players[1].active=unit('base1-16');act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.weaknessOverride,undefined);assert.equal(g.turn,1);scenarios++;}

 // Conversion 1 belongs to the Defending Pokémon: it persists when the
 // attacker Porygon is benched, changes Weakness for a later attack, and is
 // removed when the modified Defending Pokémon itself leaves the Active Spot.
 {const g=game(v);g.players[0].active=unit('base1-39',[v.fire]);g.players[0].bench=[unit('base1-7',[v.fighting])];g.players[0].hand=['base1-95'];g.players[1].active=unit('base1-23');
  act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['type:Grass','type:Fire','type:Water','type:Lightning','type:Psychic','type:Fighting']);choose(g,0,['type:Fighting']);assert.equal(g.players[1].active.weaknessOverride,'Fighting');assert.equal(g.players[1].active.damage,0);
  act(g,1,'end_turn');act(g,0,'play_trainer',{handIndex:0});choose(g,0,['bench:0']);assert.equal(g.players[0].active.id,'base1-7');assert.equal(g.players[1].active.weaknessOverride,'Fighting');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40,'converted Fighting Weakness doubles Jab');scenarios++;
 }
 {const g=game(v);g.players[0].active=unit('base1-39',[v.fire]);g.players[1].active=unit('base1-23');g.players[1].bench=[unit('base1-16')];g.players[1].hand=['base1-95'];act(g,0,'attack',{attackIndex:0});choose(g,0,['type:Fighting']);act(g,1,'play_trainer',{handIndex:0});choose(g,1,['bench:0']);assert.equal(g.players[1].bench[0].weaknessOverride,undefined,'benched Defending Pokémon loses Conversion 1');scenarios++;}

 // Conversion 2's Resistance belongs to Porygon itself. Fighting Weakness is
 // applied before the converted -30 Resistance; leaving and returning clears
 // the attack effect so the next Hitmonchan hit uses only printed Weakness.
 {const g=game(v);g.players[0].active=unit('base1-39',[v.fire,v.water]);g.players[0].bench=[unit('base1-7')];g.players[0].hand=['base1-95'];g.players[1].active=unit('base1-7',[v.fighting]);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);choose(g,0,['type:Fighting']);assert.equal(g.players[0].active.resistanceOverride,'Fighting');act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,10,'40 Weakness-adjusted damage minus 30 Resistance');
  act(g,0,'retreat',{slot:0});assert.equal(g.pendingDecision.actor,0);choose(g,0,['energy:0']);assert.equal(g.players[0].bench[0].resistanceOverride,undefined,'Conversion 2 ends when Porygon retreats');act(g,0,'play_trainer',{handIndex:0});choose(g,0,['bench:0']);assert.equal(g.players[0].active.id,'base1-39');assert.equal(g.players[0].active.resistanceOverride,undefined);act(g,0,'end_turn');act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active,null,'40 damage KOs the 10-HP Porygon when the converted Resistance has expired');scenarios++;
 }

 // Both attacks still pay their printed Colorless costs and reject unpaid
 // attacks atomically; effect handling must not bypass cost validation.
 {const g=game(v);g.players[0].active=unit('base1-39',[v.fire]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(v);g.players[0].active=unit('base1-39',[]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
console.log(`PASS Porygon Conversion attacks: ${scenarios} reducer scenarios`);
