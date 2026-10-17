'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {isBasicEnergy}=require('./core_rules');
const EFFECTS=require('./attack_effects_core');
const U=(id,v={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...v});
const rainbow=['base5-17','base5-80'];
function game(active='gym2-1',energy=['base5-17','base5-80','base1-98','base1-98']){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:111});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=14;g.rngState=1456;
 g.players[0].active=U(active,{energies:energy});
 g.players[0].bench=[U('base1-46')];
 g.players[1].active=U('base1-3');
 g.players[1].bench=[U('base1-46')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(20).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,ids){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:ids});}
const source=CATALOG.get('gym2-1');
const firestorm=source.attacks.findIndex(a=>a.name==='Firestorm');
assert.ok(firestorm>=0);
const compiled=EFFECTS.compile(source.attacks[firestorm]);
assert.equal(compiled.kind,'energy-discard');
assert.equal(compiled.onlyType,'Fire');
assert.equal(compiled.quantity,3);
for(const id of rainbow)assert.equal(isBasicEnergy(CATALOG.get(id)),false,'Rainbow is not a Basic Energy card outside play');
{
 const g=game();
 send(g,0,'attack',{attackIndex:firestorm});
 assert.equal(g.pendingDecision.actor,0);
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['energy:0','energy:1','energy:2','energy:3']);
 const wrong=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['energy:0','energy:2','energy:8']}});
 assert.equal(wrong.ok,false,'Cannot select nonexistent Energy');
 assert.equal(g.players[0].active.energies.length,4,'Invalid payment rolls back');
 choose(g,['energy:0','energy:1','energy:2']);
 assert.equal(g.players[0].active.energies.length,1,'Exactly 3 cards discarded, despite 4 Fire energy units');
 assert.deepEqual(g.players[0].discard.slice().sort(),['base1-98','base5-17','base5-80'].sort());
 assert.equal(g.players[1].discard.includes('base1-3'),true,'Firestorm Knocked Out and discarded the defending Chansey');
 assert.ok(g.players[1].discard.includes('base1-3')||g.players[1].active.damage===120,'Firestorm deals 120 damage');
}
{
 const g=game('gym2-1',['base5-17','base5-80','base1-98','base1-98','base1-96']);
 send(g,0,'attack',{attackIndex:firestorm});
 assert.equal(g.pendingDecision.options.some(x=>x.id==='energy:4'),false,'Double Colorless does not satisfy Fire discard type');
 choose(g,['energy:0','energy:1','energy:3']);
 assert.equal(g.players[0].active.energies.includes('base1-96'),true,'Unselected Double Colorless remains attached');
}
{
 const g=game('gym2-1',['base5-17','base1-98','base1-98','base1-96']);
 const old=structuredClone(g);
 const result=applyCommand(g,0,{type:'attack',payload:{attackIndex:firestorm}});
 assert.equal(result.ok,false,'Only three Fire units cannot pay a four-Fire cost');
 assert.deepEqual(g.players[0].active.energies,old.players[0].active.energies,'Rejected attack preserves Energy');
}
{
 let copied=false;
 for(let seed=0;seed<13000&&!copied;seed+=677){
  const g=game('neo1-16',['base5-17','base5-80','base1-98','base1-98']);
  g.players[1].active=U('gym2-1');
  g.rngState=seed*6553600;
  send(g,0,'attack',{attackIndex:0});
  if(!g.pendingDecision)continue;
  choose(g,['slot:-1']);
  assert.ok(g.pendingDecision.options.some(o=>o.id==='attack:'+firestorm),'Rainbow counts as Fire for copied extra costs');
  choose(g,['attack:'+firestorm]);
  assert.equal(g.pendingDecision.kind,'neo-attack-choice');
  assert.equal(g.pendingDecision.min,3);
  assert.equal(g.pendingDecision.options.length,4);
  choose(g,['energy:0','energy:1','energy:2']);
  assert.equal(g.players[0].active.energies.length,1);
  assert.equal(g.players[0].discard.filter(x=>rainbow.includes(x)).length,2);
  copied=true;
 }
 assert.ok(copied,'Super Metronome must offer Firestorm when Rainbow meets typed discard requirements');
}
console.log('PASS v0.72: Rainbow typed-in-play Fire discards, attack underpayment rollback and Super Metronome extra-cost decisions');
