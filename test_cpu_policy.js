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
