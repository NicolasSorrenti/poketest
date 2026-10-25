'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const {createGame}=require('../headless_duel');
const {ClassicLocalService}=require('../classic_local_service');
const {RPG_CPU_LEVEL}=require('../rpg_cpu_config');

const C={hit:'base1-7',rat:'base1-61',machop:'base1-52',fight:'base1-97',bill:'base1-91'};
const deck=[...Array(4).fill(C.hit),...Array(4).fill(C.rat),...Array(4).fill(C.machop),
 ...Array(4).fill(C.bill),...Array(44).fill(C.fight)];
function midgame(){
 let g=createGame({decks:[deck,deck],seed:12093,format:'classic'});
 g=AI.driveSide(g,{side:0,level:5,seed:87}).game;
 g=AI.driveSide(g,{side:1,level:5,seed:91}).game;
 if(g.mulliganBonus)g=AI.driveSide(g,{side:g.mulliganBonus.side,level:5,seed:91}).game;
 assert.equal(g.phase,'game');
 return g;
}
test('three advanced levels configure increasing bounded search, without changing Level 5',()=>{
 const names=['Grandmaster','Mastermind','Apex'];
 assert.equal(AI.SKILLS[5].searchDepth,undefined);
 for(let i=6;i<=8;i++){
  const c=AI.configuration({level:i});
  assert.equal(c.skill.name,names[i-6]);
  assert.equal(c.skill.temperature,0);
  assert.equal(c.skill.searchDepth,i-4);
  assert.ok(c.skill.searchNodes>0&&c.skill.searchNodes<=96);
  assert.equal(c.skill,AI.SKILLS[i]);
 }
 assert.throws(()=>AI.configuration({level:9}),/1–8/);
 assert.equal(RPG_CPU_LEVEL,5,'experimental levels must be opt-in until measured');
});
test('Level 6–8 decisions are legal, deterministic and independent of hidden enemy cards and future RNG',()=>{
 const g=midgame();
 for(let level=6;level<=8;level++){
  const side=g.turn,config={level,side,seed:993,personality:'tactical'};
  const first=AI.chooseAction(g,config);
  assert.ok(first?.command,'Level '+level+' must select an action');
  assert.ok(first?.game,'Level '+level+' command must be legal');
  assert.ok(first.searchNodes<=AI.SKILLS[level].searchNodes,'bounded planning');
  const second=AI.chooseAction(structuredClone(g),config);
  assert.deepEqual(first.command,second.command,'Level '+level+' must be deterministic');
  const unseen=structuredClone(g),other=unseen.players[1-side];
  if(other.deck.length&&other.hand.length)[other.deck[0],other.hand[0]]=[other.hand[0],other.deck[0]];
  unseen.rngState=(unseen.rngState^0x9e3779b9)>>>0;
  const third=AI.chooseAction(unseen,config);
  assert.deepEqual(first.command,third.command,'Level '+level+' may not peek');
 }
});
test('single matches accept opt-in advanced levels while preserving default Level 3',()=>{
 const service=new ClassicLocalService();
 assert.equal(service.create({seed:490,deck:'blackout',opponent:'blackout'}).cpu.level,3);
 for(let level=6;level<=8;level++){
  const duel=service.create({seed:490+level,deck:'blackout',opponent:'blackout',difficulty:level});
  assert.equal(duel.cpu.level,level);
 }
});
