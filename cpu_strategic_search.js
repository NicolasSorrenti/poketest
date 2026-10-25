'use strict';
// Experimental strength-first planner for Apex. Level 7 remains the benchmarked
// RPG policy; this deliberately changes only Level 8 until paired games prove
// that adversarial evaluation and longer search actually help.
//
// Search never performs an imagined attack, flips hypothetical coins, or reads
// opponent hand / deck / Prizes. Only deterministic legal preparation actions
// are applied with the authoritative reducer. Counterplay is evaluated from
// public cards, printed attack costs and possible (NOT known) future Energy.
const {performance}=require('node:perf_hooks');
const {reduce}=require('./headless_duel');
const {evaluateTurn}=require('./cpu_lookahead');
const PREP=new Set(['bench','evolve','attach_energy','retreat','play_trainer']);
const SAFE_TRAINERS=new Set(['PlusPower','Defender','Potion','Full Heal','Switch']);
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const TIME_BUDGET_MS=1300; // headroom for validation and network round trip
const MAX_REPLY_WEIGHT=0.32; // unknown next Energy is a possibility, never a fact

// The opponent may attach ONE Energy on its upcoming turn, but we do not know
// whether it has that Energy. Use printed costs as a hypothetical and discount
// the resulting extra threat. Never use actual hidden cards or shuffled order.
function oneEnergyThreat(attacker,target,helpers,turnSerial=0){
 if(!attacker||!target||['Asleep','Paralyzed'].includes(attacker.status))return 0;
 const {card,energyPool,canPayEnergy,estimatedDamage,hpRemaining}=helpers;
 const attacks=attacker.effectiveAttacks||card(attacker.id)?.attacks||[];
 const owned=energyPool(attacker),hp=hpRemaining(target);
 let current=0,next=0;
 for(const atk of attacks){
  if(!atk||!Array.isArray(atk.cost))continue;
  const cost=atk.cost;
  if(!atk.name&&!(atk.damage||atk.text))continue;
  if(attacker.amnesia?.index===attacks.indexOf(atk)&&attacker.amnesia.expires>turnSerial)continue;
  const raw=estimatedDamage(atk,attacker,target);
  const value=Math.min(Math.max(raw,0),hp)*1.05+(raw>=hp?110:0);
  if(canPayEnergy(cost,owned)){current=Math.max(current,value);continue;}
  const colors=[...new Set([...cost.filter(t=>t!=='Colorless'),'Colorless'])];
  if(colors.some(type=>canPayEnergy(cost,[...owned,type])))next=Math.max(next,value);
 }
 return Math.max(0,next-current);
}

// Adversarial but limited: distinguish "attack didn't KO" from "their bench
// is promoted after a KO". The ready opponent chooses its strongest visible
// reply. Hidden Energy and a future Gust are *not* guaranteed.
function counterplayExposure(o,helpers){
 const own=o.self,enemy=o.opponent;
 if(!own?.active||!enemy?.active)return 0;
 const {projectedAttackValue,hpRemaining,knockoutChance,card,candidates}=helpers;
 const hp=hpRemaining(own.active),endGameRisk=enemy.prizeCount===1||own.bench.length===0;
 const riskMultiplier=endGameRisk?155:92;
 const ready=attacker=>attacker&&!['Asleep','Paralyzed'].includes(attacker.status)?
  projectedAttackValue(attacker,own.active,o.turnSerial):0;
 const uncertain=attacker=>oneEnergyThreat(attacker,own.active,helpers,o.turnSerial);
 const activeResponse=ready(enemy.active)+MAX_REPLY_WEIGHT*uncertain(enemy.active);
 const benchResponse=enemy.bench.reduce((v,u)=>
  Math.max(v,ready(u)+MAX_REPLY_WEIGHT*uncertain(u)),0);
 const switchedResponse=Math.max(activeResponse,activeResponse*.82+benchResponse*.18);
 const afterKnockout=benchResponse; // Opponent chooses a replacement to become Active.
 const attacks=candidates(o,{side:o.turn,level:8,skill:{trainers:10,bench:4}},{
  trainers:0,powers:0,powerKeys:new Set(),stadium:false
 }).filter(a=>a.type==='attack');
 // Evaluate the attack we could actually perform after preparation.
 // End turn without an attack is possible but not ideal.
 let minExposure=switchedResponse;
 if(attacks.length){
  minExposure=Infinity;
  for(const a of attacks){
   const atk=(own.active.effectiveAttacks||card(own.active.id)?.attacks||[])[a.payload.attackIndex];
   if(!atk)continue;
   const ko=knockoutChance(atk,own.active,enemy.active);
   const attackWins=(own.prizeCount===1||!enemy.bench.length);
   // A winning KO prevents counterplay; even a certain non-winning KO
   // exposes us only to their visible promoted bench.
   const incoming=attackWins?switchedResponse*(1-ko):
    switchedResponse*(1-ko)+afterKnockout*ko;
   minExposure=Math.min(minExposure,incoming);
  }
  if(!Number.isFinite(minExposure))minExposure=switchedResponse;
 }
 const nearKO=clamp(minExposure/Math.max(10,hp),0,1.5);
 const danger=nearKO>=1?riskMultiplier:riskMultiplier*.36*nearKO;
 return danger;
}

// Same ordered list of root candidates, with deterministic coverage for
// tactical alternatives that the base scorer can undervalue (e.g. benching).
function rootsFor(ranked,obs,helpers,cfg){
 const legal=ranked.filter(item=>PREP.has(item.action.type)&&
  (item.action.type!=='play_trainer'||
   SAFE_TRAINERS.has(helpers.card(obs.self.hand[item.action.payload.handIndex])?.name)));
 const selected=legal.slice(0,cfg.skill.searchRoots||8),used=new Set(selected.map(x=>x.tie));
 for(const type of ['evolve','attach_energy','bench','retreat','play_trainer']){
  const next=legal.find(x=>x.action.type===type&&!used.has(x.tie));
  if(next){selected.push(next);used.add(next.tie);}
 }
 // Keep bounded, diverse roots; no direct dependency on private state.
 return selected.slice(0,(cfg.skill.searchRoots||8)+5);
}
function rankWithStrategicSearch(game,cfg,used,ranked,helpers){
 const depth=cfg.skill.searchDepth||0,budget=cfg.skill.searchNodes||0;
 if(!depth||!budget||game.phase!=='game'||game.turn!==cfg.side||
  game.pendingDecision||!game.players[cfg.side]?.active||
  !game.players[1-cfg.side]?.active)return {ranked,nodes:0,elapsedMs:0};
 const start=performance.now(),deadline=start+TIME_BUDGET_MS;
 const {observation,candidates,score,card}=helpers;
 const origin=observation(game,cfg.side);
 const roots=rootsFor(ranked,origin,helpers,cfg);
 if(!roots.length)return {ranked,nodes:0,elapsedMs:performance.now()-start};
 const originalUtility=evaluateTurn(origin,cfg,helpers)-counterplayExposure(origin,helpers);
 let nodes=0;
 const boosts=new Map();
 const remaining=()=>nodes<budget&&performance.now()<deadline;
 function apply(parent,action){
  if(!remaining())return null;
  nodes++;
  const result=reduce(parent,cfg.side,action);
  if(!result.ok)return null;
  const next=result.game,own=cfg.side,enemy=1-own;
  // Strictly no observation of shuffled cards, random effects, pending
  // draws, Prize reveals or opponent private-card movements. Abort branches
  // that would change any unknown-zone size or RNG state.
  if(next.rngState!==parent.rngState||
    next.players[own].deck.length!==parent.players[own].deck.length||
    next.players[enemy].deck.length!==parent.players[enemy].deck.length||
    next.players[enemy].hand.length!==parent.players[enemy].hand.length||
    next.players[own].prizes.length!==parent.players[own].prizes.length||
    next.players[enemy].prizes.length!==parent.players[enemy].prizes.length||
    next.pendingAction||next.pendingDecision||next.over||next.turn!==cfg.side)return null;
  return next;
 }
 function value(state,steps){
  const obs=observation(state,cfg.side);
  const strategic=evaluateTurn(obs,cfg,helpers)-counterplayExposure(obs,helpers);
  return (strategic-originalUtility)/(1+.14*Math.max(0,steps-1))-
   Math.max(0,steps-1)*3;
 }
 for(const root of roots){
  if(!remaining())break;
  const first=apply(game,root.action);if(!first)continue;
  let best=value(first,1),beam=[{state:first,steps:1,
   trainers:Number(root.action.type==='play_trainer'),value:best}];
  const seen=new Set();
  for(let layer=1;layer<depth&&remaining()&&beam.length;layer++){
   const nextBeam=[];
   for(const item of beam){
    if(!remaining())break;
    const o=observation(item.state,cfg.side);
    const opts=candidates(o,cfg,{...used,trainers:used.trainers+item.trainers})
     .filter(a=>PREP.has(a.type)&&
      (a.type!=='play_trainer'||SAFE_TRAINERS.has(card(o.self.hand[a.payload.handIndex])?.name)))
     .map((a,i)=>({a,i,rank:score(a,o,cfg,used)}))
     .sort((a,b)=>b.rank-a.rank||a.i-b.i);
    for(const {a} of opts.slice(0,cfg.skill.searchWidth||5)){
     if(!remaining())break;
     const next=apply(item.state,a);if(!next)continue;
     // Deduplicate identical *observable* boards. The search never keys
     // against opponent hand contents or hidden deck ordering.
     const v=observation(next,cfg.side);
     const sig=JSON.stringify([v.self.active,v.self.bench,v.self.hand,
      v.self.energyUsed,v.self.retreated,v.opponent.active,v.opponent.bench]);
     if(seen.has(sig))continue;seen.add(sig);
     const candidate={state:next,steps:item.steps+1,
      trainers:item.trainers+Number(a.type==='play_trainer'),
      value:value(next,item.steps+1)};
     best=Math.max(best,candidate.value);
     nextBeam.push(candidate);
    }
   }
   // Beam search retains promising multi-action states rather than greedily
   // committing to the highest-scored immediate card play.
   nextBeam.sort((a,b)=>b.value-a.value);
   beam=nextBeam.slice(0,cfg.skill.searchWidth||5);
  }
  if(best>0)boosts.set(root.tie,clamp(best,0,250));
 }
 if(!boosts.size)return {ranked,nodes,elapsedMs:performance.now()-start};
 return {ranked:ranked.map(item=>({...item,score:item.score+(boosts.get(item.tie)||0)}))
  .sort((a,b)=>b.score-a.score||a.tie-b.tie),nodes,elapsedMs:performance.now()-start};
}
module.exports={oneEnergyThreat,counterplayExposure,rootsFor,rankWithStrategicSearch,TIME_BUDGET_MS};
