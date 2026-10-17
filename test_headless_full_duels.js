'use strict';
// Run complete server-side matches, exercising the new rules boundary without a browser.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {countCards,isBasicPokemon,isEnergy}=require('./core_rules');
const {compile}=require('./attack_effects_core');
const IDS={hit:'base1-7',rat:'base1-61',machop:'base1-52',fighting:'base1-97',bill:'base1-91',potion:'base1-94',gust:'base1-93',switch:'base1-95'};
const deck=[...Array(4).fill(IDS.hit),...Array(4).fill(IDS.rat),...Array(4).fill(IDS.machop),...Array(4).fill(IDS.bill),...Array(4).fill(IDS.potion),...Array(4).fill(IDS.gust),...Array(4).fill(IDS.switch),...Array(32).fill(IDS.fighting)];
assert.equal(deck.length,60);
const action=(g,side,type,payload={})=>applyCommand(g,side,{type,payload});
let completed=0,attacks=0,kos=0,turns=0,actions=0,rejected=0;
for(let seed=1;seed<=100;seed++){
 const game=createGame({decks:[deck,deck],seed,format:'classic'});
 for(let side=0;side<2;side++){
  const p=game.players[side];
  const candidates=p.hand.map((id,index)=>({id,index})).filter(({id})=>isBasicPokemon(CATALOG.get(id)));
  const selected=candidates.find(o=>o.id===IDS.hit)||candidates.find(o=>o.id===IDS.machop)||candidates[0];
  assert.equal(action(game,side,'setup_select',{handIndex:selected.index}).ok,true);
  for(let i=0;i<2;i++){
   const j=game.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   if(j<0)break;assert.equal(action(game,side,'setup_select',{handIndex:j}).ok,true);
  }
  assert.equal(action(game,side,'setup_confirm').ok,true);
 }
 assert.equal(game.phase,'game');
 for(let step=0;step<450&&!game.over;step++){
  if(game.pendingDecision){
   const side=game.pendingDecision.actor;
   const out=action(game,side,'choose',{decisionId:game.pendingDecision.id,selected:[game.pendingDecision.options[0].id]});
   assert.ok(out.ok,`Pending choice failed: ${out.error}`);actions++;continue;
  }
  const side=game.turn,p=game.players[side],previousPrizes=game.players[1-side].prizes.length;
  const j=game.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  if(j>=0&&p.bench.length<4){assert.equal(action(game,side,'bench',{handIndex:j}).ok,true);actions++;}
  const energyIndex=game.players[side].hand.findIndex(id=>isEnergy(CATALOG.get(id)));
  if(energyIndex>=0&&!game.players[side].energyUsed){assert.equal(action(game,side,'attach_energy',{handIndex:energyIndex,slot:-1}).ok,true);actions++;}
  const a=CATALOG.get(game.players[side].active?.id)?.attacks||[];
  let didAttack=false;
  for(let i=0;i<a.length;i++){
   if(!compile(a[i]))continue;
   const res=action(game,side,'attack',{attackIndex:i});
   if(res.ok){attacks++;actions++;didAttack=true;break;}else rejected++;
  }
  if(!didAttack){const out=action(game,side,'end_turn');assert.ok(out.ok,out.error);turns++;actions++;}
  if(game.players[side].prizes.length<previousPrizes)kos++;
  for(const owner of game.players)assert.equal(countCards(owner),60,`Card disappeared in seed ${seed} turn ${game.turnSerial}`);
 }
 assert.equal(game.over,true,`Seed ${seed} did not finish in the bounded scenario`);
 assert.ok(game.winner===0||game.winner===1);
 completed++;
}
assert.ok(attacks>100);assert.ok(completed===100);
console.log(`PASS 100 complete seeded headless duels: ${attacks} attacks, ${turns} other turns, ${actions} accepted actions, ${rejected} safely rejected attacks; all games finished and conserved 60 cards per player`);
