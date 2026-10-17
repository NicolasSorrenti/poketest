'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const A=require('./attack_effects_core');
const defs=require('./neo_attack_batch_v048').kinds;
const Unit=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
const E={F:'base1-98',W:'base1-102',L:'base1-100',G:'base1-99',D:'neo1-104',P:'base1-101',B:'base1-97',M:'neo1-19'};
function game(id,attack){const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:2026});g.phase='game';g.round=5;g.turnSerial=10;g.turn=0;g.players[0].active=Unit(id,{energies:[...Array(5).fill(E.F),...Array(5).fill(E.G),...Array(5).fill(E.W),...Array(5).fill(E.L),...Array(5).fill(E.B),...Array(5).fill(E.P),...Array(5).fill(E.M),...Array(5).fill(E.D)]});g.players[1].active=Unit('base1-58',{energies:[E.F,E.L,E.G]});g.players[0].bench=[Unit('neo1-54'),Unit('base1-3')];g.players[1].bench=[Unit('neo2-5'),Unit('base1-3')];g.players[0].hand=[E.F,E.F,E.W,E.G,E.L];g.players[0].discard=[E.F,E.L];g.players[0].deck=[E.F,E.W,E.G,E.L,'neo1-12'];g.players[1].deck=[E.W,E.L,E.G];g.players[0].prizes=[E.F,E.W,E.L,E.G];g.players[1].prizes=[E.F,E.W,E.L,E.G];return g;}
function cmd(g,s,type,payload={}){const r=applyCommand(g,s,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function choices(g,k){let n=0;while(g.pendingDecision&&n++<7){const d=g.pendingDecision;let selected=[];if(d.min){if(k==='elemental-blast'&&d.id.startsWith('neo48:')){const colors=['Fire Energy','Water Energy','Lightning Energy'];selected=colors.map(name=>d.options.find(o=>o.label===name)?.id).filter(Boolean);}else selected=d.options.slice(0,d.min).map(o=>o.id);}cmd(g,d.actor,'choose',{decisionId:d.id,selected});}assert.ok(n<=7,'unresolved pending decisions');}
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),attack=CATALOG.get(id).attacks.find(a=>a.name===name),program=A.compile(attack);
 assert.equal(program.kind,'neo48:'+kind,key+' missing handler');assert.equal(A.compile({...attack,text:attack.text+' changed'}),null,key+' signature too broad');
 const g=game(id,attack);const i=CATALOG.get(id).attacks.findIndex(a=>a.name===name);
 cmd(g,0,'attack',{attackIndex:i});choices(g,kind);
 assert.ok(!g.pendingDecision,key+' left an unresolved choice');
 console.log(`OK ${key}: ${kind}`);
}
console.log('PASS Neo v0.48 all 20 registered attack signatures resolve through reducer');
