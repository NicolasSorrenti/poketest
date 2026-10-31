'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const variants=[
 {id:'base1-19',pikachu:'base1-58',chansey:'base1-3',fight:'base1-97',colorless:'base1-99',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-23',pikachu:'base4-87',chansey:'base4-3',fight:'base4-125',colorless:'base4-127',formats:[['online-preview',60],['online-preview',40]]}
];
function unit(id,energies=[],damage=0){return {id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0};}
function game(format,size,v){
 const deck=[...Array(4).fill(v.id),...Array(4).fill(v.pikachu),...Array(52).fill(v.colorless)].slice(0,size);
 const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:3});
 g.phase='game';g.turn=0;g.turnSerial=4;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.id,Array(4).fill(v.fight));p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.colorless);p.prizes=Array(size===40?4:6).fill(v.colorless);}
 return g;
}
function act(g,side,index){const r=applyCommand(g,side,{type:'attack',payload:{attackIndex:index}});assert.ok(r.ok,r.error);}
function reject(g,side,index){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type:'attack',payload:{attackIndex:index}}).ok,false);assert.deepEqual(g,before);}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Slash needs two Fighting plus one unrestricted Energy and deals 40.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.fight,v.fight,v.colorless]);g.players[1].active=unit('base1-2');act(g,0,0);assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active.damage,0);scenarios++;}
 // Earthquake uses exactly four Fighting. Active damage follows normal Resistance.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,Array(4).fill(v.fight));g.players[1].active=unit('base1-4');act(g,0,1);assert.equal(g.players[1].active.damage,40,'Charizard Fighting Resistance applies to Active');scenarios++;}
 // Its own Bench takes 10 each; Fighting Weakness is ignored for Benched Pokémon.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,Array(4).fill(v.fight));g.players[1].active=unit('base1-2');g.players[0].bench=[unit(v.pikachu),unit(v.chansey)];act(g,0,1);assert.equal(g.players[1].active.damage,70);assert.deepEqual(g.players[0].bench.map(p=>p.damage),[10,10]);scenarios++;}
 // Earthquake can Knock Out its user's Benched Pokémon; that KO discards it and awards a Prize to the opponent.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,Array(4).fill(v.fight));g.players[1].active=unit('base1-2');g.players[0].bench=[unit(v.pikachu,[],30)];act(g,0,1);assert.equal(g.players[1].active.damage,70);assert.deepEqual(g.players[0].bench,[]);assert.ok(g.players[0].discard.includes(v.pikachu));assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingAction.kind,'take_prize');scenarios++;}
 // No Bench means no self-damage or extra choice.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,Array(4).fill(v.fight));g.players[1].active=unit('base1-2');act(g,0,1);assert.equal(g.players[1].active.damage,70);assert.equal(g.pendingDecision,null);scenarios++;}
 // Three Fighting cannot pay the four-Fighting Earthquake cost; state stays unchanged.
 {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.fight,v.fight,v.colorless]);reject(g,0,1);scenarios++;}
}
console.log(`PASS Dugtrio Slash/Earthquake costs, Active Resistance, self-Bench damage/KO and Prize flow (${scenarios} scenarios)`);
