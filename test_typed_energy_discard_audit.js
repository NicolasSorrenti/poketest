'use strict';
// Original printed Energy requirements in Base → Neo Destiny are authoritative.
// Assert both UI choices and forged-command rejection, not just card descriptions.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const F='base1-98',G='base1-99',W='base1-102',L='base1-100',P='base1-101';
const unit=(id,energies=[])=>({id,under:[],energies,attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
const deck=list('base1:Brushfire');
function game(id,energies=[F,F,F,F,G,W,L,P,P]){
 const g=createGame({decks:[deck,deck],format:'online-preview',seed:2026});
 g.phase='game';g.round=5;g.turnSerial=10;g.turn=0;g.rngState=0x80000000;
 g.players[0].active=unit(id,[...energies]);g.players[1].active=unit('base1-3');
 for(const p of g.players){p.hand=[];p.deck=Array(15).fill(G);p.prizes=Array(6).fill(G);p.discard=[];p.bench=[unit('base1-44')];}
 return g;
}
const doAction=(g,type,payload={})=>applyCommand(g,0,{type,payload});
const attack=(g,name)=>{
 const index=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);
 assert.ok(index>=0,name+' missing');
 const res=doAction(g,'attack',{attackIndex:index});
 assert.equal(res.ok,true,g.players[0].active.id+': '+res.error);
 return g.pendingDecision;
};
const invalid=(g,selected)=>{
 const before=JSON.stringify(g);
 const r=doAction(g,'choose',{decisionId:g.pendingDecision.id,selected});
 assert.equal(r.ok,false,'Server accepted an illegal Energy payment: '+selected.join(', '));
 assert.equal(JSON.stringify(g),before,'A rejected Energy payment changed game state');
};
const fireSingles=[
 ['base1-12','Fire Blast'],['base1-46','Ember'],['base4-13','Fire Blast'],
 ['base4-69','Ember'],['base5-64','Ember'],['neo1-46','Ember'],
 ['neo4-50','Fire Blast'],['neo4-91','Ember'],['neo4-109','Psyburst']
];
for(const [id,name] of fireSingles){
 const card=CATALOG.get(id),a=card.attacks.find(a=>a.name===name);
 assert.match(a.text,/Discard (?:1|a) Fire Energy card attached to/,id+' missing printed type');
 assert.ok(ATTACK.compile(a),id+' attack cannot compile');
 const g=game(id),d=attack(g,name);
 assert.ok(d,id+' should let player choose between multiple attached Fire cards');
 assert.deepEqual(d.options.map(o=>o.id),['energy:0','energy:1','energy:2','energy:3'],id+' offered wrong Energy');
 invalid(g,['energy:4']);
 const r=doAction(g,'choose',{decisionId:d.id,selected:['energy:1']});
 assert.equal(r.ok,true,id+': '+r.error);
 assert.equal(g.players[0].discard.at(-1),F,id+' discarded wrong type');
}
{
 const g=game('neo1-9',[F,W,L,G]);
 const a=CATALOG.get('neo1-9').attacks[0];
 assert.match(a.text,/Fire Energy card, a Water Energy card, and a Lightning Energy card/);
 const d=attack(g,'Elemental Blast');
 assert.deepEqual(d.options.map(o=>o.id),['energy:0','energy:1','energy:2']);
 invalid(g,['energy:0','energy:1','energy:3']);
 const r=doAction(g,'choose',{decisionId:d.id,selected:['energy:0','energy:1','energy:2']});
 assert.equal(r.ok,true,r.error);
 assert.deepEqual(g.players[0].discard,[F,W,L]);
}
{
 const g=game('neo4-107',[F,F,F,L,L,G]);
 const d=attack(g,'White-Hot Flame');
 assert.ok(d&&d.min===2);
 invalid(g,['energy:0','energy:1']);
 invalid(g,['energy:0','energy:5']);
 const r=doAction(g,'choose',{decisionId:d.id,selected:['energy:0','energy:3']});
 assert.equal(r.ok,true,r.error);
 assert.deepEqual(g.players[0].discard.sort(),[F,L].sort());
}
{
 const g=game('neo4-18',[F,F,G]);
 const d=attack(g,'Ball of Flame');
 assert.ok(d,'Dark Magcargo optional Fire Energy must be selectable');
 assert.equal(d.options.every(o=>o.label==='Fire Energy'),true,'Ball of Flame offered a non-Fire card');
 invalid(g,['energy:2']);
}
{
 const a=CATALOG.get('neo4-46').attacks.find(a=>a.name==='Burning Flame');
 assert.match(a.text,/discard a Fire Energy card/i);
 assert.equal(ATTACK.compile(a)?.kind,'neo48:burning-flame');
 let got=false;
 for(const seed of [0,1,2,3,4,0x80000000,0xffffffff]){
  const g=game('neo4-46',[F,F,G]);
  g.rngState=seed;
  const d=attack(g,'Burning Flame');
  if(!d)continue;
  got=true;
  assert.equal(d.options.every(o=>o.label==='Fire Energy'),true);
  invalid(g,['energy:2']);
  const r=doAction(g,'choose',{decisionId:d.id,selected:d.options.slice(0,d.min).map(o=>o.id)});
  assert.equal(r.ok,true,r.error);
  assert.equal(g.players[0].discard.every(id=>id===F),true);
 }
 assert.ok(got,'Burning Flame must expose a Fire-only prompt on heads');
}
{
 // Fire Spin differs: it explicitly allows ANY Energy. Preserve that behavior.
 const g=game('base1-4',[F,F,F,F,G]);
 const d=attack(g,'Fire Spin');
 assert.ok(d.options.some(o=>o.id==='energy:4'),'Fire Spin must allow Grass as a non-typed cost');
}
console.log('PASS: typed Fire, Fire/Water/Lightning, Fire/Lightning, optional and conditional payments + untyped control');
