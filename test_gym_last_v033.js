'use strict';
const assert=require('node:assert/strict');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const GYM=require('./gym_last_attack_plan');
const ATK=require('./attack_effects_core');
const E={Fire:'base1-98',Grass:'base1-99',Water:'base1-102',Psychic:'base1-101',Lightning:'base1-100',Fighting:'base1-97',Colorless:'base1-99'};
const U=(id,p={})=>({id,under:[],energies:[],damage:0,attachedTrainers:[],status:null,playedTurn:1,...p});
let checks=0;function check(id,name,mutate=()=>{},follow=()=>{},seed=31){
 const g=createGame({decks:[[...Array(4).fill('base1-3'),...Array(56).fill('base1-99')],[...Array(4).fill('base1-3'),...Array(56).fill('base1-99')]],format:'gym-expanded',seed});g.phase='game';g.turn=0;g.round=5;g.turnSerial=8;const attack=CATALOG.get(id).attacks.find(a=>a.name===name);assert.ok(attack);const energy=attack.cost.map(x=>E[x]||E.Grass);g.players[0].active=U(id,{energies:energy});g.players[1].active=U('base1-4',{energies:[E.Grass,E.Water]});g.players[0].bench=[U('base1-3'),U('base1-2')];g.players[1].bench=[U('base1-3'),U('base1-2')];g.players[0].hand=[E.Grass,E.Grass];g.players[0].deck.push('gym1-1','gym2-83','gym1-17',E.Grass);
 mutate(g);
 const result=applyCommand(g,0,{type:'attack',payload:{attackIndex:CATALOG.get(id).attacks.indexOf(attack)}});assert.ok(result.ok,`${id} ${name} start: ${result.error}`);
 let steps=0;while(g.pendingDecision&&steps++<18){const d=g.pendingDecision;const selected=d.min?d.options.slice(0,d.min).map(x=>x.id):d.label.includes('Koga’s Zubat')?[d.options[0].id]:[];const r=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected}});assert.ok(r.ok,`${id} ${name} choose ${d.label}: ${r.error}`);}
 assert.ok(steps<18,`${name} decision loop`);follow(g);checks++;return g;
}
// Exercise 21 Gym-specific missing attacks with real engine commands.
const cases=[['gym1-3','Fairy Power'],['gym1-4','Take Away'],['gym1-14','Call of the Night'],['gym1-27','Electric Current'],['gym1-48','Flytrap'],['gym1-61','Kindle'],['gym1-94','Sleight of Hand'],['gym2-2','Flame Jet'],['gym2-4','Growth'],['gym2-12','Super Removal'],['gym2-22','Earthdrill'],['gym2-24','Overhead Toss'],['gym2-39','Errand-Running'],['gym2-40','Lunar Power'],['gym2-49','Messenger'],['gym2-56','Invigorate'],['gym2-59','Magic Darts'],['gym2-63','Pranks'],['gym2-65','Overrun'],['gym2-83','Group Attack']];
for(const [id,name] of cases){
 const c=CATALOG.get(id),atk=c.attacks.find(a=>a.name===name);
 assert.equal(GYM.planned(ATK.compile(atk).kind),true,`${id}: exact handler`);
 const setup=g=>{if(name==='Earthdrill')g.players[0].active.gymLieLowSerial=6;
 if(name==='Invigorate')g.players[1].discard.push('base1-3');if(name==='Pranks')g.players[1].discard.push(E.Grass);
 if(name==='Electric Current')g.players[0].active.energies.push(E.Lightning);
 if(name==='Super Removal')g.players[1].bench[0].energies.push(E.Grass);
 if(name==='Sleight of Hand')g.players[0].deck.push(E.Water);
 if(name==='Lunar Power')g.players[0].bench[0]=U('gym2-39');g.players[0].deck.push('gym2-4');
 if(name==='Group Attack')g.players[0].deck.push('gym2-83');
 };
 check(id,name,setup);
}
// Attack-result tests including empty bench and conditional damage.
const e=check('gym1-27','Electric Current',g=>{g.players[0].active.energies=[E.Lightning,E.Lightning,E.Grass];});
assert.equal(e.players[0].active.energies.length,2);assert.ok(e.players[0].bench[0].energies.includes(E.Lightning));
const t=check('gym1-4','Take Away');assert.notEqual(t.players[0].active?.id,'gym1-4');assert.notEqual(t.players[1].active?.id,'base1-4');
const m=check('gym2-49','Messenger');assert.notEqual(m.players[0].active?.id,'gym2-49');
const v=check('gym2-56','Invigorate',g=>g.players[1].discard.push('base1-3'));assert.ok(v.players[1].bench.some(x=>x.id==='base1-3'&&x.damage===60));
const l=check('gym2-83','Group Attack',g=>g.players[0].deck.push('gym2-83'));assert.ok(l.players[0].bench.some(x=>x.id==='gym2-83'));
console.log(`PASS v0.33 Gym remaining attack scenarios: ${checks}`);
