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


test('turn planner reserves valuable cards instead of assigning all hand cards equal cost',()=>{
 const P=require('../cpu_lookahead');
 const catalog=id=>({
  oak:{supertype:'Trainer',name:'Professor Oak'},
  search:{supertype:'Trainer',name:'Computer Search'},
  potion:{supertype:'Trainer',name:'Potion'},
  energy:{supertype:'Energy',name:'Fighting Energy'},
  special:{supertype:'Energy',name:'Double Colorless Energy'},
  basic:{supertype:'Pokémon',name:'Machop'}
 })[id];
 assert.ok(P.reserveValue('search',catalog)>P.reserveValue('potion',catalog));
 assert.ok(P.reserveValue('oak',catalog)>P.reserveValue('basic',catalog));
 assert.ok(P.reserveValue('special',catalog)>P.reserveValue('energy',catalog));
});
test('opponent response uses visible attacks, discounts bench switching, and respects disabling status',()=>{
 const P=require('../cpu_lookahead');
 const our={hp:90,damage:20};
 const o={turnSerial:3,self:{active:our},opponent:{
  active:{hp:60,damage:0,dmg:80,status:null},bench:[{dmg:70,hp:90,damage:0}]}};
 const helpers={hpRemaining:u=>u.hp-u.damage,projectedAttackValue:u=>u.dmg||0,
  strongestAffordableAttack:u=>u.dmg||0};
 const threat=P.publicCounterplay(o,helpers);
 assert.equal(threat.koChance,1);
 assert.ok(threat.expected>=80);
 o.opponent.active.status='Asleep';
 const blocked=P.publicCounterplay(o,helpers);
 assert.equal(blocked.koChance,0);
 assert.ok(blocked.expected<25,'visible ready Bench is only a possible switch, not an assumed free swap');
});
test('end-of-turn evaluation rewards preserving a backup against an affordable counter-KO',()=>{
 const P=require('../cpu_lookahead');
 const o={phase:'game',turnSerial:9,self:{
  active:{id:'hit',hp:70,damage:20,energies:[]},
  hand:[],bench:[],prizeCount:2,deckCount:22
 },opponent:{active:{id:'opp',hp:100,damage:0,dmg:90},bench:[],prizeCount:2}};
 const helper={
  card:()=>({supertype:'Pokémon',hp:70,attacks:[]}),
  hpRemaining:u=>u.hp-u.damage,
  projectedAttackValue:u=>u.dmg||0,
  strongestAffordableAttack:u=>u.dmg||0,
  candidates:()=>[],
  score:()=>0,
  attackBonus:()=>0,
  knockoutChance:()=>0
 };
 const cfg={side:1,level:8,style:{survival:1}};
 const alone=P.evaluateTurn(o,cfg,helper);
 const backup=structuredClone(o);
 backup.self.bench=[{id:'rat',hp:50,damage:0,dmg:30}];
 assert.ok(P.evaluateTurn(backup,cfg,helper)>alone,
  'the AI should not leave itself exposed to losing its final Pokémon');
});


test('full-turn planner explores a legal evolve + Energy sequence without resolving imaginary attacks',()=>{
 const g=midgame(),side=g.turn;
 g.round=5;g.turnSerial=8;g.players[side].energyUsed=false;
 const active=g.players[side].active;
 Object.assign(active,{id:C.machop,damage:0,playedTurn:2,
  energies:[C.fight,C.fight],status:null});
 g.players[side].hand=['base1-34',C.fight]; // Machoke and a Fighting Energy
 const first=AI.chooseAction(g,{side,level:8,seed:174});
 assert.ok(first&&first.game,'must still produce a legal action through the authoritative reducer');
 assert.ok(first.searchNodes>0,'actual deterministic evolution / attachment options should be searched');
 assert.ok(first.searchNodes<=AI.SKILLS[8].searchNodes);
 const hidden=structuredClone(g),other=hidden.players[1-side];
 if(other.deck.length&&other.hand.length)[other.hand[0],other.deck[0]]=[other.deck[0],other.hand[0]];
 hidden.rngState=(hidden.rngState^0x9e3779b9)>>>0;
 const second=AI.chooseAction(hidden,{side,level:8,seed:174});
 assert.deepEqual(second?.command,first.command,
  'planning must not consult concealed opposing cards or next coin flip');
});


test('planner penalizes overcommitting attached Energy beyond useful printed attack costs',()=>{
 const P=require('../cpu_lookahead');
 const base={phase:'game',turnSerial:5,self:{
  active:{id:'fighter',hp:80,damage:0,energies:['fight']},
  bench:[{id:'backup',hp:60,damage:0,energies:[]}],
  hand:[],deckCount:25,prizeCount:3
 },opponent:{active:{id:'enemy',hp:70,damage:0,energies:[],status:null},bench:[],prizeCount:3}};
 const helpers={
  card:id=>id==='fight'?{name:'Fighting Energy',supertype:'Energy'}:
   {name:id,supertype:'Pokémon',attacks:[{cost:['Fighting'],damage:'10'}]},
  hpRemaining:u=>u.hp-u.damage,
  strongestAffordableAttack:()=>0,
  projectedAttackValue:()=>0,candidates:()=>[],score:()=>0,
  attackBonus:()=>0,knockoutChance:()=>0
 };
 const level8={side:1,level:8,style:{survival:1}};
 const economical=P.evaluateTurn(base,level8,helpers);
 const excess=structuredClone(base);
 excess.self.active.energies.push('fight','fight','fight');
 assert.ok(P.evaluateTurn(excess,level8,helpers)<economical,
  'do not overvalue wasted energy commitments that enable no extra attack');
});
