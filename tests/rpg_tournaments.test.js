'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const T=require('../rpg_tournaments');
const config=(opts={})=>T.hydrate({day:30,slot:1,location:'center',credits:80,points:0,reputation:0,
 tournamentSessions:{},activeTournament:null,eventsDone:{},...opts});
function played(state,outcome,id='m-'+Math.random()){
 const next=T.nextMatch(state);
 if(!next)throw Error('No current round');
 const duel={id,npc:next.opponent,tournamentId:next.tournamentId,tournamentRound:next.round};
 const receipt={duelId:duel.id,npc:duel.npc,outcome};
 return T.settle(state,receipt,duel);
}
test('three authentic-format 8-entrant brackets validate and simulate offscreen fixtures deterministically',()=>{
 assert.deepEqual(T.validate(),[]);assert.equal(T.cups.length,3);
 for(const cup of T.cups){assert.equal(cup.entrants.length,8);assert.deepEqual(T.generate(cup),T.generate(cup));assert.equal(T.generate(cup).opponents.length,3);}
});
test('major cups have fixed one-period entry windows',()=>{
 const s=config();assert.equal(T.entry(s,'neighborhood').possible,true);
 s.slot=2;assert.equal(T.entry(s,'neighborhood').possible,false);
 s.day=29;s.slot=1;assert.equal(T.entry(s,'neighborhood').possible,false);
});
test('alternative qualification paths never require a compulsory campaign storyline',()=>{
 const regional=config({day:60,credits:5});assert.equal(T.entry(regional,'regional').possible,false);
 regional.credits=20;assert.equal(T.entry(regional,'regional').cost,12);
 regional.points=6;assert.equal(T.entry(regional,'regional').cost,0);
 const final=config({day:90,credits:50});assert.equal(T.entry(final,'championship').cost,25);
 final.reputation=18;assert.equal(T.entry(final,'championship').cost,0);
});
test('starting the event pays the fee once, locks repeat entry and persists first opponent',()=>{
 const s=config({day:60,credits:40});
 const opening=T.begin(s,'regional');assert.equal(s.credits,28);
 assert.equal(s.activeTournament,'regional');assert.equal(opening.round,0);
 assert.equal(T.nextMatch(s).opponent,'camila');
 assert.equal(T.entry(s,'regional').possible,false);
 assert.throws(()=>T.begin(s,'regional'));
});
test('three real player victories progress rounds and award championship bonus once',()=>{
 const s=config();T.begin(s,'neighborhood');
 assert.equal(played(s,'Victory','w1').status,'next');assert.equal(s.tournamentSessions.neighborhood.round,1);
 assert.equal(played(s,'Victory','w2').status,'next');assert.equal(s.tournamentSessions.neighborhood.round,2);
 const ending=played(s,'Victory','w3');
 assert.equal(ending.status,'champion');
 assert.equal(ending.bonusPoints,15);assert.equal(ending.bonusCredits,30);
 assert.equal(s.points,15);assert.equal(s.credits,110);assert.equal(s.activeTournament,null);
 assert.equal(s.eventsDone['30:Neighborhood Cup'].won,true);
 assert.equal(T.nextMatch(s),null);
 assert.equal(T.entry(s,'neighborhood').possible,false);
});
test('one defeat eliminates the player without erasing earlier round wins',()=>{
 const s=config();T.begin(s,'neighborhood');
 played(s,'Victory','e1');const ending=played(s,'Defeat','e2');
 assert.equal(ending.status,'eliminated');assert.equal(s.tournamentSessions.neighborhood.round,1);
 assert.equal(s.tournamentSessions.neighborhood.matches.length,2);
 assert.equal(s.activeTournament,null);assert.equal(s.eventsDone['30:Neighborhood Cup'].won,false);
 assert.equal(ending.bonusPoints,3);assert.equal(ending.bonusCredits,6);
});
test('a draw requires replaying the same match, not skipping the round or time window',()=>{
 const s=config();T.begin(s,'neighborhood');
 const draw=played(s,'Draw','draw1');
 assert.equal(draw.status,'draw');assert.equal(s.tournamentSessions.neighborhood.round,0);
 assert.equal(T.nextMatch(s).opponent,'hana');assert.equal(s.activeTournament,'neighborhood');
 assert.equal(played(s,'Victory','replay2').status,'next');
 assert.equal(s.tournamentSessions.neighborhood.round,1);
});
test('reload between rounds keeps the exact bracket draw and player progress',()=>{
 const s=config();const original=T.begin(s,'neighborhood').opponents.slice();
 played(s,'Victory','save1');
 const restored=T.hydrate(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(T.active(restored).opponents,original);
 assert.equal(T.nextMatch(restored).round,1);
 assert.equal(T.nextMatch(restored).opponent,original[1]);
});
test('foreign or duplicate duel receipts cannot affect saved tournament rewards',()=>{
 const s=config();T.begin(s,'neighborhood');
 const next=T.nextMatch(s);
 assert.equal(T.settle(s,{duelId:'bad',npc:'reina',outcome:'Victory'},{id:'bad',npc:'reina',tournamentId:'neighborhood',tournamentRound:0}),null);
 played(s,'Victory','one');
 assert.equal(T.settle(s,{duelId:'one',npc:next.opponent,outcome:'Victory'},{id:'one',npc:next.opponent,tournamentId:'neighborhood',tournamentRound:0}),null);
 assert.equal(s.tournamentSessions.neighborhood.round,1);
});
test('completed brackets survive save/load with trophy and match history',()=>{
 const s=config({day:90,points:22});T.begin(s,'championship');
 played(s,'Victory','c1');played(s,'Victory','c2');played(s,'Victory','c3');
 const other=T.hydrate(JSON.parse(JSON.stringify(s)));
 assert.equal(other.tournamentSessions.championship.outcome,'champion');
 assert.equal(other.tournamentSessions.championship.matches.length,3);
 assert.equal(other.activeTournament,null);
 assert.ok(other.points>=30);
});
