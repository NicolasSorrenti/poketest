'use strict';
// Bounded perfect-information *own-turn* preparation search. This policy is
// deliberately NOT perfect-information AI: opponent hands, Prize cards,
// unshuffled future draws and future coin flips must never influence ranking.
// Only bench/evolution/attachment moves with deterministic visible effects are
// simulated by the authentic reducer. Resulting attacks are EVALUATED, not
// executed/rolled in the search tree.
const {reduce}=require('./headless_duel');
const PREP=new Set(['bench','evolve','attach_energy']);
function rankWithLookahead(game,cfg,used,ranked,helpers){
 const budget=cfg.skill.searchNodes||0,depth=cfg.skill.searchDepth||0;
 if(!budget||!depth||game.phase!=='game'||game.turn!==cfg.side||
    game.pendingDecision||!game.players[cfg.side]?.active||
    !game.players[1-cfg.side]?.active)
  return {ranked,nodes:0};
 const {observation,candidates,score,attackBonus,projectedAttackValue,hpRemaining}=helpers;
 let nodes=0;
 const origin=observation(game,cfg.side);
 // Score ONLY from the acting side's redacted projection; no opponent's hand.
 function attackCeiling(state){
  const o=observation(state,cfg.side);
  if(!o.self.active||!o.opponent.active)return 0;
  let highest=0;
  for(const action of candidates(o,cfg,used)){
   if(action.type!=='attack')continue;
   highest=Math.max(highest,score(action,o,cfg,used)+attackBonus(action,o,cfg));
  }
  return highest;
 }
 function visibleThreat(o){
  const own=o.self.active,enemy=o.opponent.active;
  if(!own||!enemy)return 0;
  const estimated=projectedAttackValue(enemy,own,o.turnSerial);
  // A visible already-powered attacker is a threat; hidden cards and Energy
  // attachments that might arrive on an opponent turn are not assumed known.
  const health=hpRemaining(own);
  return health>0&&estimated>=health?1:Math.min(0.85,estimated/Math.max(10,health)*0.6);
 }
 const initialAttack=attackCeiling(game);
 const initialThreat=cfg.level>=7?visibleThreat(origin):0;
 const rootLimit=cfg.skill.searchRoots||0;
 const roots=ranked.filter(item=>PREP.has(item.action.type)).slice(0,rootLimit);
 const boosts=new Map();
 function deterministic(parent,action){
  if(nodes>=budget)return null;
  nodes++;
  const result=reduce(parent,cfg.side,action);
  if(!result.ok)return null;
  const next=result.game,own=cfg.side,enemy=1-own;
  // Some Pokémon Powers cause draws/coin flips on evolution. Their futures
  // are unknown, so never score or recurse through such a transition.
  if(parent.rngState!==next.rngState||
   parent.players[own].deck.length!==next.players[own].deck.length||
   parent.players[enemy].deck.length!==next.players[enemy].deck.length||
   parent.players[enemy].hand.length!==next.players[enemy].hand.length||
   next.players[own].hand.length!==parent.players[own].hand.length-1)
    return null;
  return next;
 }
 for(const root of roots){
  if(nodes>=budget)break;
  const first=deterministic(game,root.action);
  if(!first)continue;
  let best=0;
  const seen=new Set();
  function evaluate(state,stepsLeft,usedSteps){
   const o=observation(state,cfg.side);
   const ceiling=attackCeiling(state);
   const gain=Math.max(0,ceiling-initialAttack);
   const threatReduction=cfg.level>=7?
    Math.max(0,initialThreat-visibleThreat(o))*40*(cfg.level===8?1.4:1):0;
   const discount=1/(1+0.15*(usedSteps-1));
   best=Math.max(best,(gain+threatReduction)*discount);
   if(!stepsLeft||nodes>=budget||state.phase!=='game'||
    state.turn!==cfg.side||state.pendingDecision||state.over)return;
   // Explore promising and varied deterministic setups, never random Trainer
   // draws, opponent turns or actions requiring concealed future information.
   const options=candidates(o,cfg,used).filter(a=>PREP.has(a.type))
    .map((a,i)=>({a,i,value:score(a,o,cfg,used)}))
    .sort((a,b)=>b.value-a.value||a.i-b.i);
   const width=cfg.skill.searchWidth;
   for(const item of options.slice(0,width)){
    if(nodes>=budget)break;
    const token=JSON.stringify([item.a.type,item.a.payload,state.turnSerial,state.players[cfg.side].hand]);
    if(seen.has(token))continue;
    seen.add(token);
    const next=deterministic(state,item.a);
    if(next)evaluate(next,stepsLeft-1,usedSteps+1);
   }
  }
  evaluate(first,depth-1,1);
  if(best>0)boosts.set(root.tie,Math.min(250,best)*(cfg.level===6?.76:cfg.level===7?.88:1));
 }
 if(!boosts.size)return {ranked,nodes};
 // Search only promotes legal, deterministic preparation combinations. The
 // baseline scorer continues to handle Trainers, attacks, choices and Powers.
 return {ranked:ranked.map(item=>({...item,score:item.score+(boosts.get(item.tie)||0)}))
   .sort((a,b)=>b.score-a.score||a.tie-b.tie),nodes};
}
module.exports={rankWithLookahead};
