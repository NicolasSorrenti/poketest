'use strict';
const assert=require('node:assert/strict');
const {createGame,CATALOG,reduce}=require('./headless_duel');
const {countCards}=require('./core_rules');
const AI=require('./cpu_policy');

const IDS={hit:'base1-7',rat:'base1-61',machop:'base1-52',fight:'base1-97',bill:'base1-91',potion:'base1-94',gust:'base1-93',switch:'base1-95'};
const deck=[...Array(4).fill(IDS.hit),...Array(4).fill(IDS.rat),...Array(4).fill(IDS.machop),
 ...Array(4).fill(IDS.bill),...Array(4).fill(IDS.potion),...Array(4).fill(IDS.gust),
 ...Array(4).fill(IDS.switch),...Array(32).fill(IDS.fight)];
assert.equal(deck.length,60);
assert.equal(Object.keys(AI.SKILLS).length,5);
assert.equal(Object.keys(AI.PERSONALITIES).length,6);
assert.throws(()=>AI.configuration({level:0}),/1/);
assert.throws(()=>AI.configuration({personality:'cheater'}),/personality/);
const settings={level:3,personality:'balanced',side:1,seed:47};

{
 const game=createGame({decks:[deck,deck],seed:120,format:'classic'});
 const projected=AI.observation(game,1);
 assert.equal(projected.opponent.hand,undefined);
 assert.equal(projected.opponent.deck,undefined);
 assert.equal(projected.opponent.prizes,undefined);
 assert.equal(projected.self.deck,undefined);
 const decision=AI.chooseAction(game,settings);
 assert.equal(decision.command.type,'setup_select','Opening setup must choose an Active');
 assert.equal(reduce(game,1,decision.command).ok,true);
 const identical=AI.chooseAction(structuredClone(game),settings);
 assert.deepEqual(decision.command,identical.command,'Seeded policy must be reproducible');
 const hidden=structuredClone(game);
 // Change only concealed hand and deck contents, not public counts.
 const foe=hidden.players[0];
 if(foe.deck.length&&foe.hand.length){const old=foe.hand[0];foe.hand[0]=foe.deck[0];foe.deck[0]=old;}
 assert.deepEqual(AI.chooseAction(hidden,settings)?.command,decision.command,
  'Opponent hidden cards must not alter a CPU decision');
}

{
 // Regressions for mandatory payment choices: selecting only the first Energy
 // cannot cover a two-unit retreat where Double Colorless must pay alone.
 const game=createGame({decks:[deck,deck],seed:33,format:'classic'});
 const o=AI.observation(game,1);o.phase='game';o.turn=1;
 o.decision={id:'retreat:1',actor:1,kind:'energy-discard',
  label:'Choose Energy cards providing at least 2 retreat units',min:1,max:2,optional:false,
  options:[{id:'energy:0',label:'Water Energy'},{id:'energy:1',label:'Double Colorless Energy'}]};
 const options=AI.candidates(o,AI.configuration({side:1,level:1}),{powerKeys:new Set()});
 assert.ok(options.some(c=>c.type==='choose'&&c.payload.selected.length===1&&c.payload.selected[0]==='energy:1'),
  'Beginner must still consider a valid Double Colorless payment');
 o.decision=null;
 o.self.active={id:IDS.hit,energies:[IDS.fight],damage:0};
 o.self.bench=[{id:IDS.machop,energies:[],damage:0}];
 o.self.hand=['base1-79'];o.self.energyUsed=true;
 o.opponent.active={id:IDS.rat,energies:[],damage:0};
 assert.ok(!AI.candidates(o,AI.configuration({side:1,level:5}),{trainers:0,powerKeys:new Set()})
   .some(c=>c.type==='play_trainer'),
   'Super Energy Removal must not begin without a legal opposing Energy target');
}
{
 const o={self:{active:{id:'base1-63',energies:['base1-102'],damage:0},bench:[]},
  opponent:{active:{id:'base1-61',energies:['base1-97'],damage:0},bench:[]}};
 const action={type:'attack',payload:{attackIndex:0}};
 const risky=AI.score(action,o,AI.configuration({level:3,personality:'risk_taking'}),{});
 const neutral=AI.score(action,o,AI.configuration({level:3,personality:'balanced'}),{});
 const defensive=AI.score(action,o,AI.configuration({level:3,personality:'defensive'}),{});
 assert.ok(risky>neutral&&neutral>defensive,
  'Personality should visibly affect preferences on coin-flip attacks independently of skill');
}
{
 // Champion builds its first backup before spending the turn on a cheap hit.
 const g=createGame({decks:[deck,deck],seed:109,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight],damage:0};
 o.self.bench=[];o.self.hand=[IDS.machop];
 o.opponent.active={id:IDS.hit,energies:[],damage:0}; // do not override an immediate KO
 const cfg=AI.configuration({level:5,side:1});
 const benchAction={type:'bench',payload:{handIndex:0}};
 const jab={type:'attack',payload:{attackIndex:0}};
 assert.ok(AI.score(benchAction,o,cfg,{})>AI.score(jab,o,cfg,{}),
  'Experienced player should establish a backup when entirely unbenched');
 o.self.bench=[{id:IDS.machop,energies:[],damage:0}];
 o.self.hand=['base1-88'];o.self.deckCount=32;o.self.handCount=8;
 assert.ok(AI.score({type:'play_trainer',payload:{handIndex:0}},o,cfg,{})<
  AI.score(jab,o,cfg,{}),'Champion should preserve an already-useful hand instead of dumping it with Oak');
 const basic=AI.configuration({level:1,side:1});
 o.self.hand=[IDS.fight];o.self.energyUsed=false;
 o.self.active.energies=[];o.self.bench=[];
 assert.equal(AI.candidates(o,basic,{trainers:0,powerKeys:new Set()})
  .filter(c=>c.type==='attack').length,0,'An empty-Energy Active must not propose unaffordable attacks');
 o.self.hand=['base1-34'];o.self.active={id:IDS.machop,energies:[],playedTurn:o.round,damage:0};
 assert.ok(!AI.candidates(o,cfg,{trainers:0,powerKeys:new Set()})
  .some(c=>c.type==='evolve'),'First-turn evolution must be excluded before reducer probes');
}
{
 const g=createGame({decks:[deck,deck],seed:91,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight,IDS.fight],damage:0};
 o.self.bench=[];o.self.hand=[IDS.fight,'base1-84','base1-93'];
 o.opponent.active={id:'base1-46',energies:[],damage:20};
 o.opponent.bench=[{id:'base1-46',energies:[],damage:30}];
 const experienced=AI.configuration({side:1,level:5});
 const beginner=AI.configuration({side:1,level:1});
 const energy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const experiencedValue=AI.score(energy,o,experienced,{});
 const basicValue=AI.score(energy,o,beginner,{});
 assert.ok(experiencedValue>basicValue,
  'Experienced AI should value the next stronger attack unlocked by Energy');
 const plusPower={type:'play_trainer',payload:{handIndex:1}};
 assert.ok(AI.score(plusPower,o,experienced,{})>AI.score({type:'attack',payload:{attackIndex:0}},o,experienced,{}),
  'Strong AI should prepare a PlusPower KO when immediate damage is insufficient');
 const gust={type:'play_trainer',payload:{handIndex:2}};
 const valueWithGust=AI.score(gust,o,experienced,{});
 o.opponent.bench=[];
 assert.ok(AI.score(gust,o,experienced,{})<valueWithGust,
  'Gust utility must depend on a genuinely vulnerable opponent Bench');
}
{
 const {NPC_PROFILES,profileForNpc}=require('./cpu_profiles');
 const {ClassicLocalService}=require('./classic_local_service');
 assert.equal(Object.keys(NPC_PROFILES).length,8);
 assert.deepEqual(profileForNpc('reina'),{level:4,personality:'aggressive'});
 assert.deepEqual(profileForNpc('akari'),{level:5,personality:'tactical'});
 assert.throws(()=>profileForNpc('unknown'),/Unknown CPU NPC/);
 const service=new ClassicLocalService();
 const first=service.create({npc:'reina',seed:41,deck:'blackout',opponent:'brushfire'});
 assert.deepEqual(first.cpu,{level:4,personality:'aggressive',npc:'reina'});
 const second=service.create({npc:'reina',difficulty:1,personality:'defensive',seed:42});
 assert.deepEqual(second.cpu,{level:1,personality:'defensive',npc:'reina'},
  'An RPG NPC identity must not constrain independent skill and temperament overrides');
}
{
 const g=createGame({decks:[deck,deck],seed:125,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:'base1-35',energies:['base1-102'],damage:20};
 o.opponent.active={id:'base1-46',energies:[],damage:0};
 const champion=AI.configuration({side:1,level:5});
 assert.ok(AI.score({type:'attack',payload:{attackIndex:1}},o,champion,{})>
  AI.score({type:'attack',payload:{attackIndex:0}},o,champion,{}),
  'A wounded Magikarp must recognize Flail damage counters instead of rating it as printed flat 10');
}
let duels=0,decisions=0,attacks=0,energy=0,evolutions=0,trainer=0;
for(let seed=1;seed<=4;seed++){
 let game=createGame({decks:[deck,deck],seed:seed*1789,format:'classic'});
 const profiles=[
  {side:0,level:seed%2?1:4,personality:'aggressive',seed:seed*67},
  {side:1,level:seed%2?5:2,personality:'defensive',seed:seed*79}
 ];
 for(const config of profiles){
  const result=AI.driveSide(game,{...config,limit:200});
  assert.ok(result.steps>0,'CPU must autonomously complete setup');
  game=result.game;
  decisions+=result.steps;
 }
 assert.equal(game.phase,'game','Both CPU seats should confirm setup');
 for(let turn=0;turn<28&&!game.over;turn++){
  const side=game.pendingDecision?game.pendingDecision.actor:game.turn;
  const before=game.events.length;
  const result=AI.driveSide(game,{...profiles[side],limit:200});
  assert.ok(result.steps>0,'CPU stalled at turn '+turn+' seed '+seed);
  assert.equal(result.game.events.length,before+result.steps);
  assert.ok(result.commands.every(x=>x.side===side));
  for(const x of result.commands){
   assert.ok(x.alternatives>=1);
   assert.ok(x.probedCandidates>=1&&x.rejectedCandidates>=0);
   assert.ok(x.rejectedCandidates<x.probedCandidates,'Selected CPU actions passed reducer checks');
   if(x.command.type==='attack')attacks++;
   if(x.command.type==='attach_energy')energy++;
   if(x.command.type==='evolve')evolutions++;
   if(x.command.type==='play_trainer')trainer++;
  }
  game=result.game;decisions+=result.steps;
  assert.deepEqual(game.players.map(countCards),[60,60],'CPU actions must conserve cards');
 }
 duels++;
}
assert.ok(attacks>0,'CPU must attack');
assert.ok(energy>0,'CPU must attach Energy');
assert.ok(trainer>0,'CPU must play useful Trainers');
console.log('PASS CPU policies: 5 levels, 6 personalities, hidden information, seeded decisions, '+duels+' headless self-play scenarios, '+decisions+' legal accepted actions ('+attacks+' attacks, '+energy+' attachments, '+trainer+' Trainers)');
