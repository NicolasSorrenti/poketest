'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');

const variants=[
 {id:'base1-43',format:'classic',size:60,prizes:6,psychic:'base1-101',water:'base1-102'},
 {id:'base1-43',format:'neo-theme',size:60,prizes:6,psychic:'base1-101',water:'base1-102'},
 {id:'base1-43',format:'online-preview',size:60,prizes:6,psychic:'base1-101',water:'base1-102'},
 {id:'base1-43',format:'online-preview',size:40,prizes:4,psychic:'base1-101',water:'base1-102'},
 {id:'base4-65',format:'online-preview',size:60,prizes:6,psychic:'base4-129',water:'base4-130'},
 {id:'base4-65',format:'online-preview',size:40,prizes:4,psychic:'base4-129',water:'base4-130'}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(v,seed=17){
 const deck=list('base1:Brushfire').slice(0,v.size);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.psychic);p.prizes=Array(v.prizes).fill(v.psychic);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}
function coinSequence(g,results){for(let seed=0;seed<100000;seed++){let state=seed,match=true;for(const expected of results){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){match=false;break;}}if(match){g.rngState=seed;return;}}throw Error('coin sequence not found');}

let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id);
 assert.deepEqual(card.attacks[0],{name:'Psyshock',cost:['Psychic'],damage:'10',text:'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'},`${v.id} printed attack must require Psychic Energy`);
 assert.equal(ATTACK.compile(card.attacks[0]).kind,'coin-status-alias');scenarios++;

 // The typed cost is Psychic for both printings; Colorless Energy cannot pay it.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic]);g.players[1].active=unit('base1-2');coinSequence(g,[true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.status,'Paralyzed');assert.equal(g.pendingDecision,null);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.water]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Tails still deals the printed 10 damage but does not Paralyze.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic]);coinSequence(g,[false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.notEqual(g.players[1].active.status,'Paralyzed');scenarios++;}
 // Psychic Weakness applies to outgoing Psyshock damage.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic]);g.players[1].active=unit('base1-43');coinSequence(g,[false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
 // The same Psychic Weakness doubles incoming Drowzee Confuse Ray damage.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit('base1-49',[v.psychic,v.psychic]);coinSequence(g,[false]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
}
console.log(`PASS Abra Psyshock: ${scenarios} reducer scenarios`);
