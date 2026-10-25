'use strict';
// Bounded, rules-driven own-turn planner. Evaluates future attacks WITHOUT
// resolving a hypothetical attack/coin flip or observing the opponent's
// concealed hand/deck. The genuine reducer is used only for deterministic
// actions that spend/attach/play cards already in the CPU's visible hand.
const {reduce}=require('./headless_duel');
const PREP=new Set(['bench','evolve','attach_energy','retreat','play_trainer']);
const SAFE_TRAINERS=new Set(['PlusPower','Defender','Potion','Full Heal','Switch']);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function reserveValue(id,card){
 const c=card(id);if(!c)return 0;
 if(c.supertype==='Energy')return /Double Colorless|Rainbow|Miracle/i.test(c.name)?13:7;
 if(c.supertype==='Trainer'){
  if(/Professor Oak|Computer Search|Item Finder|Gust of Wind|Super Energy Removal/i.test(c.name))return 24;
  if(/Bill|Pokémon Trader|Pokémon Breeder|Energy Removal|Switch/i.test(c.name))return 16;
  return 9;
 }
 // Evolution cards in hand are opportunities, not guaranteed future attacks.
 return c.evolvesFrom?11:6;
}
// Model the strongest currently affordable reply by the visible opposing
// Active. A ready opposing Benched attacker is a *discounted* switch threat:
// do not invent a Gust, free retreat, or hidden Energy attachment.
function publicCounterplay(o,helpers,ourTarget=o.self.active,enemy=o.opponent){
 if(!ourTarget||!enemy?.active)return {expected:0,koChance:0,benchThreat:0};
 const {projectedAttackValue,hpRemaining,strongestAffordableAttack}=helpers;
 const health=hpRemaining(ourTarget);
 if(health<=0)return {expected:0,koChance:0,benchThreat:0};
 const disabled=['Asleep','Paralyzed'].includes(enemy.active.status);
 const activeDamage=disabled?0:strongestAffordableAttack(enemy.active,ourTarget);
 const activeImpact=disabled?0:projectedAttackValue(enemy.active,ourTarget,o.turnSerial);
 const benchDamage=enemy.bench.reduce((best,u)=>Math.max(best,strongestAffordableAttack(u,ourTarget)),0);
 const benchImpact=enemy.bench.reduce((best,u)=>Math.max(best,projectedAttackValue(u,ourTarget,o.turnSerial)),0);
 const benchThreat=0.18*Math.max(0,benchImpact-activeImpact);
 const koChance=activeDamage>=health&&activeDamage>0?1:0;
 return {expected:activeImpact+benchThreat,koChance,benchThreat};
}
// Scores a realistic end-of-turn decision point. We estimate an affordable
// attack rather than rolling it. KO changes the identity of the visible
// counterattacker; it does NOT reveal the hidden Prize or opposing hand.
function evaluateTurn(o,cfg,helpers){
 if(o.phase!=='game'||!o.self.active||!o.opponent.active)return 0;
 const {candidates,score,attackBonus,hpRemaining,card,strongestAffordableAttack,projectedAttackValue,knockoutChance}=helpers;
 const used={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 const actions=candidates(o,cfg,used).filter(a=>a.type==='attack');
 const counter=publicCounterplay(o,helpers),enemy=o.opponent,own=o.self;
 const benchCount=own.bench.length,ourHp=hpRemaining(own.active);
 const ownPrizes=Number(own.prizeCount||0),enemyPrizes=Number(enemy.prizeCount||0);
 const enemyHasBackup=enemy.bench.length>0;
 const benchCounter=enemy.bench.reduce((best,u)=>
  Math.max(best,projectedAttackValue(u,own.active,o.turnSerial)),0);
 let attacks=0;
 for(const action of actions){
  const atk=(own.active.effectiveAttacks||card(own.active.id)?.attacks||[])[action.payload.attackIndex];
  if(!atk)continue;
  const ko=knockoutChance(atk,own.active,enemy.active);
  const isWin=ownPrizes===1||!enemyHasBackup;
  // A KO removes their Active. Once promoted, only known Benched Pokémon
  // have an immediate Energy-powered response; don't assume hidden draws.
  const remainingCounter=(1-ko)*counter.expected+ko*benchCounter;
  const counterLoss=ourHp>0&&remainingCounter>=ourHp?1:
   clamp(remainingCounter/Math.max(10,ourHp),0,1)*0.4;
  const gameLoss=benchCount===0&&counterLoss>.9?1:0;
  const offense=score(action,o,cfg,used)+attackBonus(action,o,cfg);
  const adjusted=offense+ko*(isWin?150:35)-
   (isWin&&ko>=0.999?0:counterLoss*(enemyPrizes===1?150:95))-
   gameLoss*90;
  attacks=Math.max(attacks,adjusted);
 }
 // The entire hand is visible to its owner. Preserve search cards/secondary
 // evolution pieces and special Energy when attack gains do not justify costs.
 const handReserve=(own.hand||[]).reduce((n,id)=>n+reserveValue(id,card),0);
 // Attached Energy is still an invested resource. A retreat or Trainer that
 // discards it must have a tactical payoff, while a useful attachment should
 // not be treated as if an Energy card simply disappeared from the hand.
 const committed=(own.active.energies||[]).reduce((n,id)=>n+reserveValue(id,card),0)+
  own.bench.reduce((n,u)=>n+(u.energies||[]).reduce((v,id)=>v+reserveValue(id,card),0),0);
 const maxPrintedCost=Math.max(0,...(card(own.active.id)?.attacks||[])
  .map(a=>(a.cost||[]).length));
 const excess=Math.max(0,(own.active.energies||[]).length-maxPrintedCost);
 const overcommitPenalty=excess*12;
 const backups=benchCount===0?-80:benchCount===1?20:benchCount===2?28:32;
 const readyBench=own.bench.reduce((best,u)=>
  Math.max(best,strongestAffordableAttack(u,enemy.active)),0);
 const position=backups+clamp(readyBench,0,90)*0.28;
 // A failed search still has a meaningful value: passing safely with a backup.
 const risk=counter.koChance*(enemyPrizes===1?155:95)*(benchCount?0.55:1);
 const scarceDeck=own.deckCount<=2?-90:own.deckCount<=5?-25:0;
 return Math.max(attacks,70)+position+handReserve*0.32+committed*0.30-overcommitPenalty-risk+scarceDeck;
}
function rankWithLookahead(game,cfg,used,ranked,helpers){
 const budget=cfg.skill.searchNodes||0,depth=cfg.skill.searchDepth||0;
 if(!budget||!depth||game.phase!=='game'||game.turn!==cfg.side||
   game.pendingDecision||!game.players[cfg.side]?.active||
   !game.players[1-cfg.side]?.active)return {ranked,nodes:0};
 const {observation,candidates,score,card}=helpers;
 const origin=observation(game,cfg.side),base=evaluateTurn(origin,cfg,helpers);
 let nodes=0;
 const roots=ranked.filter(item=>PREP.has(item.action.type)&&
  (item.action.type!=='play_trainer'||SAFE_TRAINERS.has(card(origin.self.hand[item.action.payload.handIndex])?.name)))
  .slice(0,cfg.skill.searchRoots||0);
 const boosts=new Map();
 function apply(parent,action){
  if(nodes>=budget)return null;
  nodes++;
  const result=reduce(parent,cfg.side,action);
  if(!result.ok)return null;
  const next=result.game,own=cfg.side,enemy=1-own;
  // No privileged future RNG, shuffled draw, opponent hidden-hand changes,
  // automatic Prize revelation or unresolved Trainer target choices.
  if(next.rngState!==parent.rngState||
   next.players[own].deck.length!==parent.players[own].deck.length||
   next.players[enemy].deck.length!==parent.players[enemy].deck.length||
   next.players[enemy].hand.length!==parent.players[enemy].hand.length||
   next.players[own].prizes.length!==parent.players[own].prizes.length||
   next.players[enemy].prizes.length!==parent.players[enemy].prizes.length||
   next.pendingDecision||next.pendingAction||
   next.over||next.turn!==cfg.side)return null;
  return next;
 }
 for(const root of roots){
  if(nodes>=budget)break;
  const first=apply(game,root.action);if(!first)continue;
  let best=-Infinity;
  const seen=new Set();
  function search(state,remaining,stepCount,simulatedTrainers){
   const o=observation(state,cfg.side);
   const utility=evaluateTurn(o,cfg,helpers);
   const gain=utility-base;
   // Each speculative card/action has tempo cost. Prevent artificial loops
   // where the agent consumes resources to chase a tiny score improvement.
   best=Math.max(best,gain/(1+0.18*(stepCount-1))-Math.max(0,stepCount-1)*3);
   if(!remaining||nodes>=budget)return;
   const options=candidates(o,cfg,{...used,trainers:used.trainers+simulatedTrainers})
    .filter(a=>PREP.has(a.type)&&
     (a.type!=='play_trainer'||SAFE_TRAINERS.has(card(o.self.hand[a.payload.handIndex])?.name)))
    .map((a,i)=>({a,i,value:score(a,o,cfg,used)}))
    .sort((a,b)=>b.value-a.value||a.i-b.i);
   for(const {a} of options.slice(0,cfg.skill.searchWidth)){
    if(nodes>=budget)break;
    // States can be revisited through different orders (evolve/attach).
    // Deduplicate only within the root. All information is player-visible.
    const signature=JSON.stringify([a.type,a.payload,o.self.active?.id,
     o.self.active?.energies,o.self.hand,o.self.energyUsed,o.self.bench.map(u=>[u.id,u.energies])]);
    if(seen.has(signature))continue;
    seen.add(signature);
    const next=apply(state,a);
    if(next)search(next,remaining-1,stepCount+1,simulatedTrainers+Number(a.type==='play_trainer'));
   }
  }
  search(first,depth-1,1,Number(root.action.type==='play_trainer'));
  if(best>0)boosts.set(root.tie,clamp(best,0,230)*(cfg.level===6?0.85:cfg.level===7?0.95:1));
 }
 if(!boosts.size)return {ranked,nodes};
 return {ranked:ranked.map(item=>({...item,score:item.score+(boosts.get(item.tie)||0)}))
  .sort((a,b)=>b.score-a.score||a.tie-b.tie),nodes};
}
module.exports={reserveValue,publicCounterplay,evaluateTurn,rankWithLookahead};
