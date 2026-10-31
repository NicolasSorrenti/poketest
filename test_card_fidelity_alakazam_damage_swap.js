'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-1',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-1',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,damage=0,status=null)=>({id,under:[],energies:[],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size,alakazam){const energy='base1-101',deck=list('base1:Brushfire').slice(0,size),g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:13});g.phase='game';g.turn=0;g.turnSerial=4;g.round=3;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(energy);p.prizes=Array(size===40?4:6).fill(energy);p.energyUsed=false;p.turnPlays=[];}g.players[0].active=unit(alakazam);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}
function pick(g,side,id){const d=g.pendingDecision;assert.ok(d,'expected Power choice');assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected:[id]});}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 const card=CATALOG.get(v.id),text="As often as you like during your turn (before your attack), you may move 1 damage counter from 1 of your Pokémon to another as long as you don't Knock Out that Pokémon. This power can't be used if Alakazam is Asleep, Confused, or Paralyzed.";
 assert.equal(card.abilities[0].name,'Damage Swap');assert.equal(card.abilities[0].text,text);scenarios++;
 // Repeated one-counter transfers continue until the player presses Finish;
 // ending the Power session does not end the turn or forfeit the attack.
 {const g=game(format,size,v.id);g.players[0].bench=[unit('base1-5',30),unit('base1-2')];act(g,0,'use_power',{slot:-1,repeat:true});assert.equal(g.pendingDecision.kind,'source');assert.equal(g.pendingDecision.optional,true);assert.ok(g.pendingDecision.label.includes('Finish'));pick(g,0,'slot:0');assert.equal(g.pendingDecision.kind,'target');pick(g,0,'slot:1');assert.equal(g.players[0].bench[0].damage,20);assert.equal(g.players[0].bench[1].damage,10);pick(g,0,'slot:0');pick(g,0,'slot:1');pick(g,0,'slot:0');pick(g,0,'slot:1');assert.equal(g.players[0].bench[0].damage,0);assert.equal(g.players[0].bench[1].damage,30);act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});assert.equal(g.pendingDecision,null);assert.equal(g.turn,0);scenarios++;}
 // A receiving Pokémon cannot be Knocked Out by the moved counter.
 {const g=game(format,size,v.id);g.players[0].bench=[unit('base1-5',10),unit('base1-43',20)];act(g,0,'use_power',{slot:-1,repeat:true});pick(g,0,'slot:0');assert.ok(!g.pendingDecision.options.some(x=>x.id==='slot:1'));const before=structuredClone(g);const r=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['slot:1']}});assert.equal(r.ok,false);assert.deepEqual(g,before);pick(g,0,'slot:-1');assert.equal(g.players[0].active.damage,10);assert.equal(g.players[0].bench[1].damage,20);act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});scenarios++;}
 // Non-repeat activation moves exactly one counter and closes automatically.
 {const g=game(format,size,v.id);g.players[0].bench=[unit('base1-5',10),unit('base1-2')];act(g,0,'use_power',{slot:-1});pick(g,0,'slot:0');pick(g,0,'slot:1');assert.equal(g.players[0].bench[0].damage,0);assert.equal(g.players[0].bench[1].damage,10);assert.equal(g.pendingDecision,null);assert.equal(g.turn,0);scenarios++;}
 // The Power checks Alakazam's own status and may only be used on its turn.
 for(const status of ['Asleep','Confused','Paralyzed']){const g=game(format,size,v.id);g.players[0].bench=[unit('base1-5',10)];g.players[0].active.status=status;reject(g,0,'use_power',{slot:-1,repeat:true});scenarios++;}
 {const g=game(format,size,v.id);g.turn=1;g.players[0].bench=[unit('base1-5',10)];reject(g,0,'use_power',{slot:-1,repeat:true});scenarios++;}
}
console.log(`PASS Alakazam Damage Swap repeat/Finish, KO safety and eligibility (${scenarios} scenarios)`);
