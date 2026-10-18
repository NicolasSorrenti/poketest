'use strict';
// Smallest possible historically faithful migration: exactly one printed
// attack, tested through the same reducer used by CPU and multiplayer.
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const printed=CATALOG.get('neo3-6').attacks.find(a=>a.name==='Searing Flames');
assert.ok(printed,'Neo Revelation Entei #6 printing missing');
const program=ATTACK.compile(printed);
assert.deepEqual(program,{kind:'energy-discard',damage:60,quantity:2,onlyType:null,subject:'Entei'});
assert.equal(ATTACK.compile({...printed,text:printed.text+' altered'}),null,'do not use loose name/text matching');
assert.equal(ATTACK.compile({...printed,cost:['Fire','Fire']}),null,'do not match a different printed cost');
assert.equal(ATTACK.resolve(program,()=>true).damage,60);
const unit=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
const deck=list('base1:Brushfire');
const g=createGame({decks:[deck,deck],format:'online-preview',seed:88});
g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;
g.players[0].active=unit('neo3-6',{energies:['base1-98','base1-98','base1-98']});
g.players[1].active=unit('base1-2');
g.players[0].bench=[unit('base1-44')];g.players[1].bench=[unit('base1-44')];
for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
function command(side,type,payload){return applyCommand(g,side,{type,payload});}
const before=g.players[0].discard.length;
assert.equal(command(0,'attack',{attackIndex:0}).ok,true,'Searing Flames must offer discard selection');
const choice=g.pendingDecision;
assert.equal(choice?.actor,0,'attacking player owns discard choice');
assert.equal(choice?.min,2);assert.equal(choice?.max,2);
assert.equal(choice?.options.length,3,'all attached Energy cards are eligible');
assert.equal(g.players[1].active.damage,0,'damage waits for payment');
const invalid=command(0,'choose',{decisionId:choice.id,selected:['energy:0','energy:0']});
assert.equal(invalid.ok,false,'duplicate payment must be rejected transactionally');
assert.equal(g.pendingDecision?.id,choice.id,'invalid selection must not close choice');
assert.equal(g.players[0].active.energies.length,3,'invalid payment must preserve attached Energy');
assert.equal(command(0,'choose',{decisionId:choice.id,selected:['energy:0','energy:2']}).ok,true,'legal exact payment must resolve attack');
assert.equal(g.players[0].active.energies.length,1);
assert.equal(g.players[0].discard.length,before+2);
assert.equal(g.players[0].discard.at(-1),'base1-98');
assert.equal(g.players[1].active.damage,60,'Searing Flames deals 60, not base damage without payment');
assert.equal(g.pendingDecision,null,'no stale choice after attack');
console.log('PASS Neo v088: Entei #6 Searing Flames exact Energy selection, no free damage, invalid choice rollback and full reducer attack');
