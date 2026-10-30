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
 const program=ATTACK.compile(a);
 assert.ok(program,id+' attack cannot compile');
 if(id==='neo4-50')assert.equal(program.onlyType,'Fire','Compiler must preserve typed Fire Energy: '+JSON.stringify(program));
 const g=game(id),d=attack(g,name);
 assert.equal(d,null,id+' should auto-discard when all eligible Fire Energy cards are identical');
 assert.equal(g.players[0].discard.at(-1),F,id+' discarded wrong type');
 assert.equal(g.players[0].active.energies.filter(x=>x===F).length,3,id+' must discard exactly one Fire Energy');
 assert.equal(g.players[0].active.energies.includes(G),true,id+' must preserve ineligible Energy');
 assert.ok(g.message.some(line=>line.includes('discarded')&&line.includes('Fire Energy')),id+' must report its Energy discard');
}
{
 // Rainbow supplies Fire but has a different outcome from Basic Fire, so retain a meaningful choice.
 const g=game('base1-12',[F,F,F,F,'base5-17',G]);
 g.players[0].active.damage=10; // Rainbow Energy's attachment damage is already accounted for.
 const d=attack(g,'Fire Blast');
 assert.ok(d,'Ninetales must allow a choice between Basic Fire and Rainbow Energy');
 assert.deepEqual(d.options.map(o=>o.id),['energy:0','energy:1','energy:2','energy:3','energy:4']);
 invalid(g,['energy:5']);
 const r=doAction(g,'choose',{decisionId:d.id,selected:['energy:4']});
 assert.equal(r.ok,true,r.error);
 assert.equal(g.players[0].discard.at(-1),'base5-17');
}
{
 const g=game('base1-12',[F,'base4-126',F,F,G]);
 const d=attack(g,'Fire Blast');
 assert.equal(d,null,'Basic Fire Energy reprints are equivalent discard choices');
 assert.equal(g.players[0].discard.at(-1),F);
 assert.equal(g.players[0].active.energies.includes('base4-126'),true);
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
 assert.deepEqual(g.players[0].discard.slice().sort(),[F,W,L].sort(),'Lugia discards each required type regardless of removal order');
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
 for(const seed of [0,1,2,3,4,0x80000000,0xffffffff]){
  const g=game('neo4-46',[F,F,G]);
  g.rngState=seed;
  const d=attack(g,'Burning Flame');
  assert.equal(d,null,'Burning Flame should auto-discard equivalent Fire Energy on heads');
  const heads=g.coinFlips.slice(-2).filter(x=>x.result==='heads').length;
  assert.equal(g.players[1].active.damage,30+heads*20);
  assert.equal(g.players[0].active.energies.filter(id=>id===F).length,2-heads);
  assert.equal(g.players[0].discard.filter(id=>id===F).length,heads);
  if(heads)assert.ok(g.message.some(line=>line.includes('discarded')&&line.includes('Fire Energy')));
 }
}
{
 // Fire Spin differs: it explicitly allows ANY Energy. Preserve that behavior.
 const g=game('base1-4',[F,F,F,F,G]);
 const d=attack(g,'Fire Spin');
 assert.ok(d.options.some(o=>o.id==='energy:4'),'Fire Spin must allow Grass as a non-typed cost');
}
console.log('PASS: typed Fire, Fire/Water/Lightning, Fire/Lightning, optional and conditional payments + untyped control');
