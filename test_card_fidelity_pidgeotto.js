'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const variants=[
 {id:'base1-22',format:'classic',dce:'base1-96',grass:'base1-99'},
 {id:'base4-28',format:'online-preview',dce:'base4-124',grass:'base4-127'}
];
const unit=(id,energies=[],opts={})=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:opts.damage||0,status:opts.status||null,poison:opts.poison||false,poisonDamage:opts.poisonDamage||0,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.id),...Array(4).fill('base1-17'),...Array(4).fill('base1-11'),...Array(4).fill('base1-44'),...Array(44).fill(v.grass)];
 const g=createGame({format:v.format,decks:[deck,deck],seed:20261031});g.phase='game';g.turn=0;g.round=4;g.turnSerial=8;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(6).fill(v.grass);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const old=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,old,'Rejected attack must be atomic');}
function choose(g,side,id){const d=g.pendingDecision;assert.ok(d,'Expected pending choice');assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected:[id]});}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-22');assert.equal(card.attacks[0].name,'Whirlwind');assert.equal(card.attacks[1].name,'Mirror Move');assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text})),'Base Set 2 reprint must preserve both attack texts and costs');assert.match(card.attacks[0].text,/he or she chooses 1.*Do the damage before switching/i);assert.match(card.attacks[1].text,/attacked last turn.*final result/i);
 // Whirlwind deals damage before a meaningful defender-owned choice; the
 // outgoing Active keeps the damage as it moves to the Bench.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-44'),unit('base1-44')];
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.pendingDecision.actor,1);assert.equal(g.turn,0);
  choose(g,1,'bench:1');assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.id,'base1-44');assert.equal(g.players[1].bench[1].id,'base1-3');assert.equal(g.players[1].bench[1].damage,20);scenarios++;}
 // A single opposing Bench target auto-switches. No Bench means no switch.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-44')];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.id,'base1-44');assert.equal(g.players[1].bench[0].id,'base1-3');assert.equal(g.players[1].bench[0].damage,20);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.damage,20);scenarios++;}
 // Mirror Move is unavailable unless Pidgeotto took an attack last turn.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass,v.grass]);const before=structuredClone(g),r=applyCommand(g,0,{type:'attack',payload:{attackIndex:1}});assert.equal(r.ok,false);assert.match(r.error,/Mirror Move requires a hit on the previous turn/);assert.deepEqual(g,before);scenarios++;}
 // Poison Sting's final result includes Poison. The baseline engine recorded
 // damage but lost the separate poison flag, so Mirror Move failed to repeat it.
 {const g=game(v);g.players[0].active=unit('base1-17',[v.grass,v.grass,v.grass]);g.players[1].active=unit(v.id,[v.grass,v.grass,v.grass]);g.rngState=50000;
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.lastAttackImpact.damage,40);assert.equal(g.players[1].active.lastAttackImpact.poison,true);
  act(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active.poison,true,'Mirror Move must reproduce Poison Sting');assert.equal(g.players[0].active.poisonDamage,10);assert.equal(g.players[0].active.damage,50,'40 final attack damage plus Poison checkup');scenarios++;}
 // Toxic's increased Poison damage is also part of the final attack result.
 {const g=game(v);g.players[0].active=unit('base1-11',[v.grass,v.grass,v.grass]);g.players[1].active=unit(v.id,[v.grass,v.grass,v.grass]);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.poisonDamage,20);assert.equal(g.players[1].active.lastAttackImpact.damage,20);assert.equal(g.players[1].active.lastAttackImpact.poisonDamage,20);
  act(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active.poison,true,'Mirror Move must reproduce Toxic Poison');assert.equal(g.players[0].active.poisonDamage,20);assert.equal(g.players[0].active.damage,40,'20 attack damage plus 20 Toxic checkup');scenarios++;}
}
console.log(`PASS Pidgeotto Whirlwind/Mirror Move: ${scenarios} reducer scenarios`);
