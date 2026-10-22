'use strict';
// Opening-hand bonus draws are optional and use the difference in mulligan counts.
// Runs against the shared engine used by RPG, single matches, Cube and online.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {isBasicPokemon,countCards}=require('./core_rules');
const {publicView,validateCommand}=require('./duel_protocol');
const AI=require('./cpu_policy');
const id={hit:'base1-7',rat:'base1-61',machop:'base1-52',seel:'base1-41',magikarp:'base1-35',fight:'base1-97'};
const rich=[...Object.keys(id).filter(x=>x!=='fight').flatMap(x=>Array(4).fill(id[x])),...Array(40).fill(id.fight)];
const rare=[id.hit,...Array(59).fill(id.fight)];
assert.equal(rich.length,60);assert.equal(rare.length,60);
function action(g,side,type,payload={}){
 const out=applyCommand(g,side,{type,payload});assert.ok(out.ok,`${type}: ${out.error}`);return g;
}
function rejected(g,side,type,payload){
 const old=JSON.stringify(g),result=applyCommand(g,side,{type,payload});
 assert.equal(result.ok,false,`Expected ${type} to fail`);
 assert.equal(JSON.stringify(g),old,'Invalid bonus action must be transactional');
}
function setup(g){
 for(let side=0;side<2;side++){
  const index=g.players[side].hand.findIndex(x=>isBasicPokemon(CATALOG.get(x)));
  assert.ok(index>=0);
  action(g,side,'setup_select',{handIndex:index});
  action(g,side,'setup_confirm');
 }
 return g;
}
function withDifference(decks,winner=0,opts={}){
 for(let seed=1;seed<=600;seed++){
  const g=createGame({decks,seed,...opts});
  if(g.players[winner].mulligans<g.players[1-winner].mulligans &&
    g.players[winner].hand.filter(x=>isBasicPokemon(CATALOG.get(x))).length>=2)return g;
 }
 throw Error('No deterministic fixture with a mulligan difference');
}
{
 const g=withDifference([rich,rare],0);
 const difference=g.players[1].mulligans-g.players[0].mulligans;
 const beforeActive=g.players[0].hand.length;
 setup(g);
 assert.equal(g.phase,'setup');
 assert.deepEqual(g.mulliganBonus,{side:0,max:difference,drawn:null});
 assert.equal(g.players[0].prizes.length,6,'Prizes must be reserved before bonuses');
 assert.equal(g.players[1].prizes.length,6);
 assert.equal(publicView(g,1).players[0].hand,undefined,'Opponent cannot see the bonus hand');
 assert.equal(publicView(g,0).mulliganBonus.max,difference);
 assert.deepEqual(publicView(g,null).mulligans,g.players.map(p=>p.mulligans));
 for(const bad of [-1,0.5,difference+1,'2',null])rejected(g,0,'setup_bonus_draw',{count:bad});
 rejected(g,1,'setup_bonus_draw',{count:1});
 rejected(g,0,'setup_bonus_done');
 rejected(g,0,'setup_confirm');
 const handCount=g.players[0].hand.length, deckCount=g.players[0].deck.length;
 const number=Math.min(2,difference);
 action(g,0,'setup_bonus_draw',{count:number});
 assert.equal(g.mulliganBonus.drawn,number);
 assert.equal(g.players[0].hand.length,handCount+number);
 assert.equal(g.players[0].deck.length,deckCount-number);
 rejected(g,0,'setup_bonus_draw',{count:0});
 rejected(g,1,'setup_bonus_done');
 rejected(g,0,'setup_undo',{slot:-1});
 rejected(g,1,'setup_select',{handIndex:0});
 rejected(g,0,'end_turn');
 const bench=g.players[0].bench.length,idx=g.players[0].hand.findIndex(x=>isBasicPokemon(CATALOG.get(x)));
 assert.ok(idx>=0);
 action(g,0,'setup_select',{handIndex:idx});
 assert.equal(g.players[0].bench.length,bench+1,'Bonus beneficiary can Bench Basic');
 action(g,0,'setup_bonus_done');
 assert.equal(g.phase,'game');
 assert.equal(g.mulliganBonus,null);
 assert.equal(g.players[0].hand.length,beforeActive-1+number-1+1,'First player draws at duel start');
 assert.equal(countCards(g.players[0]),60);
 assert.equal(countCards(g.players[1]),60);
}
{
 const g=withDifference([rich,rare],0);
 setup(g);
 action(g,0,'setup_bonus_draw',{count:0});
 assert.equal(g.phase,'game','Declining the bonus starts immediately');
 assert.equal(g.mulliganBonus,null);
 assert.equal(countCards(g.players[0]),60);
 assert.equal(countCards(g.players[1]),60);
}
{
 const equal=Array.from({length:400},(_,i)=>createGame({decks:[rich,rich],seed:i+1}))
  .find(g=>g.players[0].mulligans===g.players[1].mulligans);
 assert.ok(equal);
 setup(equal);
 assert.equal(equal.phase,'game','Equal mulligans should not create a bonus step');
 assert.equal(equal.mulliganBonus,null);
}
{
 const g=withDifference([rare,rich],1);
 const state=AI.driveBot(g,200,{level:3,seed:33}).game;
 assert.equal(state.setupReady[1],true);
 const index=state.players[0].hand.findIndex(x=>isBasicPokemon(CATALOG.get(x)));
 action(state,0,'setup_select',{handIndex:index});
 action(state,0,'setup_confirm');
 assert.equal(state.mulliganBonus.side,1,'CPU qualifies for the difference');
 const finished=AI.driveBot(state,200,{level:3,seed:33}).game;
 assert.equal(finished.phase,'game','CPU must resolve mulligan bonus and finish');
 assert.equal(finished.mulliganBonus,null);
 assert.equal(countCards(finished.players[0]),60);
 assert.equal(countCards(finished.players[1]),60);
}
{
 const deck40=[...Array(4).fill(id.hit),...Array(4).fill(id.rat),
  ...Array(4).fill(id.machop),...Array(4).fill(id.seel),...Array(24).fill(id.fight)];
 const rare40=[id.hit,...Array(39).fill(id.fight)];
 const g=withDifference([deck40,rare40],0,{format:'online-preview',deckSize:40,prizeCount:4});
 setup(g);
 assert.equal(g.players[0].prizes.length,4,'Cube uses four Prize cards');
 assert.equal(g.mulliganBonus.side,0);
 action(g,0,'setup_bonus_draw',{count:1});
 action(g,0,'setup_bonus_done');
 assert.equal(g.phase,'game');
 assert.equal(countCards(g.players[0]),40);
 assert.equal(countCards(g.players[1]),40);
}
assert.equal(validateCommand({type:'setup_bonus_draw',payload:{count:1}}).type,'setup_bonus_draw');
assert.equal(validateCommand({type:'setup_bonus_done'}).type,'setup_bonus_done');
console.log('PASS mulligan bonus: optional/partial, canceling shared mulligans, Prize order, hidden information, extra Bench, CPU, Cube');
