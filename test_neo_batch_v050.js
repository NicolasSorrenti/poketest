'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const A=require('./attack_effects_core');
const {list}=require('./authentic_decks');
const FORMAT=require('./classic_format');
const {ClassicLocalService}=require('./classic_local_service');
const defs=require('./neo_attack_batch_v050').defs;
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(id='neo1-36'){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:111});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=222;
 g.players[0].active=U(id,{energies:Array(4).fill('base1-99')});
 g.players[1].active=U('base1-58',{energies:Array(4).fill('base1-100')});
 g.players[0].bench=[U('neo2-11'),U('base1-3')];
 g.players[1].bench=[U('base1-3'),U('base1-46')];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function attack(g,side,name){const index=CATALOG.get(g.players[side].active.id).attacks.findIndex(a=>a.name===name);assert.ok(index>=0);send(g,side,'attack',{attackIndex:index});}
function choose(g,id){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:[id||d.options[0].id]});}
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=CATALOG.get(id).attacks.find(a=>a.name===name);
 assert.equal(A.compile(a)?.kind,'neo50:'+kind);
 assert.equal(A.compile({...a,text:a.text+'altered'}),null);
}
assert.ok(new ClassicLocalService().cardPool().find(c=>c.id==='neo1-36')?.supported);
assert.equal(FORMAT.isAllowed('neo1-36',{neo:true}),true);
for(const id of ['neo1-16','neo2-11','neo2-30'])assert.equal(FORMAT.isAllowed(id,{neo:true}),false);
const outcomes=new Set();
for(let seed=0;seed<300&&outcomes.size<2;seed++){
 const g=game();g.rngState=seed*6553600;attack(g,0,'Sticky Nectar');
 const heads=g.coinFlips.at(-1).result==='heads';outcomes.add(heads);
 assert.equal(g.players[1].active.damage,heads?30:20);
 assert.equal(Boolean(g.players[1].active.noSwitch),heads);
 if(heads){g.turn=1;assert.equal(applyCommand(g,1,{type:'retreat',payload:{slot:0}}).ok,false);}
}
assert.equal(outcomes.size,2,'Both Sticky Nectar outcomes covered');
{const g=game('neo2-11');attack(g,0,'Sketch');assert.equal(g.players[1].active.damage,0);}
let copied=false;
for(let seed=0;seed<300&&!copied;seed++){
 const g=game('neo1-16');g.rngState=seed*6553600;attack(g,0,'Super Metronome');
 if(!g.pendingDecision)continue;
 choose(g,'slot:-1');assert.equal(g.pendingDecision.kind,'neo-attack-choice');
 choose(g,'attack:0');assert.equal(g.pendingDecision,null);
 copied=true;
}
assert.ok(copied,'Metronome selection sequence executes');
console.log('PASS v0.50: all four signatures, Sticky Nectar locks, guarded copy flow and deck gating');
