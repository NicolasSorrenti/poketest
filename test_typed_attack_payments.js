'use strict';
// Exhaustive typed payment coverage for all historical attacks compiled by
// the generic energy-discard interpreter, regardless of printing or type.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {compile}=require('./attack_effects_core');
const {list}=require('./authentic_decks');
const {publicView}=require('./duel_protocol');
const energy={Fire:'base1-98',Grass:'base1-99',Water:'base1-102',Lightning:'base1-100',
 Psychic:'base1-101',Fighting:'base1-97',Metal:'neo1-19',Darkness:'neo1-104'};
const sampleUnit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
const candidates=[...CATALOG.values()].flatMap(c=>(c.attacks||[]).map((a,index)=>({c,a,index,p:compile(a)})))
 .filter(x=>x.p?.kind==='energy-discard'&&x.p.onlyType);
assert.ok(candidates.length>=12,'Expected typed Energy attack coverage across Base through Neo');
let checked=0;
for(const {c,a,index,p} of candidates){
 const wanted=energy[p.onlyType];assert.ok(wanted,c.id+' unsupported type '+p.onlyType);
 const wrong=energy[p.onlyType==='Grass'?'Fire':'Grass'];
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:27});
 g.phase='game';g.turn=0;g.round=4;g.turnSerial=10;
 // Keep enough cards for printed costs and typed payment; invalid choices
 // must remain impossible even when mixed Energy is attached.
 g.players[0].active={...sampleUnit(c.id),energies:[...Array(6).fill(wanted),...Array(6).fill(wrong)]};
 g.players[1].active=sampleUnit('base1-3');
 for(const pstate of g.players){pstate.bench=[sampleUnit('base1-58')];pstate.hand=[];pstate.prizes=Array(6).fill('base1-91');pstate.deck=Array(12).fill(wrong);pstate.discard=[];}
 const start=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});
 assert.ok(start.ok,c.id+' '+a.name+': '+start.error);
 const choice=g.pendingDecision;
 assert.ok(choice,c.id+' '+a.name+' should ask when several eligible typed Energy are attached');
 assert.ok(choice.options.length>=p.quantity,c.id+' eligible options missing');
 assert.ok(choice.options.every(o=>Number(o.id.slice(7))<6),c.id+' showed an off-type card');
 assert.deepEqual(publicView(g,0).pendingDecision.options.map(x=>x.id),choice.options.map(x=>x.id));
 const before=JSON.stringify(g);
 const invalid=applyCommand(g,0,{type:'choose',payload:{decisionId:choice.id,selected:[
   ...Array(Math.max(0,p.quantity-1)).keys()].map(i=>'energy:'+i).concat(['energy:6'])}});
 assert.equal(invalid.ok,false,c.id+' accepted off-type Energy');
 assert.equal(JSON.stringify(g),before,'Rejected attack mutated game for '+c.id);
 const valid=applyCommand(g,0,{type:'choose',payload:{decisionId:choice.id,selected:
   Array.from({length:p.quantity},(_,i)=>'energy:'+i)}});
 assert.ok(valid.ok,c.id+' valid '+p.onlyType+' discard rejected: '+valid.error);
 assert.equal(g.players[0].discard.filter(id=>id===wrong).length,0,c.id+' discarded wrong Energy');
 assert.equal(g.players[0].discard.filter(id=>id===wanted).length,p.quantity,c.id+' discarded incorrect quantity');
 checked++;
}
console.log('PASS '+checked+' generic typed-discard attacks: off-type choices hidden and rejected atomically');
