'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-57',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-86',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,damage=0,status=null,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:113});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Whirlwind action must be rejected');assert.deepEqual(g,before,'rejected Whirlwind action must be atomic');}
function choose(g,side,id){assert.ok(g.pendingDecision,'expected a pending choice');assert.equal(g.pendingDecision.actor,side,'choice belongs to the printed decision owner');act(g,side,'choose',{decisionId:g.pendingDecision.id,selected:[id]});}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Pidgey');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Colorless']);assert.deepEqual(card.attacks,[{name:'Whirlwind',cost:['Colorless','Colorless'],damage:'10',text:'If your opponent has any Benched Pokémon, he or she chooses 1 of them and switches it with the Defending Pokémon. (Do the damage before switching the Pokémon.)'}]);assert.deepEqual(card.weaknesses,[{type:'Lightning',value:'×2'}]);assert.deepEqual(card.resistances,[{type:'Fighting',value:'-30'}]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
 // Two Colorless are required; a single Double Colorless Energy is sufficient
 // and does not increase the fixed 10 damage.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,null,['base1-96']);g.players[1].active=unit('base1-52');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.deepEqual(g.players[0].active.energies,['base1-96']);scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id,0,null,['base1-97']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Damage lands on the current Defending Pokémon before the defending player
 // is asked to choose a replacement. The attacker cannot make that choice.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,null,['base1-96']);g.players[1].active=unit('base1-52',0,'Confused');g.players[1].bench=[unit('base1-58'),unit('base1-54')];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.id,'base1-52');assert.equal(g.players[1].active.damage,10);assert.equal(g.pendingDecision.actor,1);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['bench:0','bench:1']);reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});choose(g,1,'bench:1');assert.equal(g.players[1].active.id,'base1-54');assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].bench[1].id,'base1-52');assert.equal(g.players[1].bench[1].damage,10);assert.equal(g.players[1].bench[1].status,null);assert.equal(g.pendingDecision,null);scenarios++;}
 // With only one Benched Pokémon there is no meaningful choice to prompt for.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,null,['base1-96']);g.players[1].active=unit('base1-52');g.players[1].bench=[unit('base1-58')];act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.id,'base1-58');assert.equal(g.players[1].bench[0].id,'base1-52');assert.equal(g.players[1].bench[0].damage,10);scenarios++;}
 // An empty opposing Bench leaves only the attack damage.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,null,['base1-96']);g.players[1].active=unit('base1-52');act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.id,'base1-52');assert.equal(g.players[1].active.damage,10);scenarios++;}
 // If the damage Knocks Out the Defending Pokémon, the KO and promotion
 // procedure replaces it; Whirlwind does not then switch a second Pokémon.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,null,['base1-96']);g.players[1].active=unit('base1-58',40);g.players[1].bench=[unit('base1-52'),unit('base1-54')];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active,null);assert.equal(g.pendingDecision.kind,'prize-card');choose(g,0,'prize:0');assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.options.length,2);reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});choose(g,1,'bench:1');assert.equal(g.players[1].active.id,'base1-54');assert.equal(g.players[1].bench.length,1);assert.equal(g.pendingDecision,null);assert.equal(g.turn,1);scenarios++;}
}
assert.equal(scenarios,42);
console.log(`PASS Pidgey Whirlwind order, choice ownership, KO, Bench and cost (${scenarios} reducer scenarios)`);
