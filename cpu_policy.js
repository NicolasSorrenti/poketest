'use strict';
// CPU policy reads only the same projected information that a player may see.
// The authoritative reducer is used for legality and execution, never as a
// future-outcome oracle (in particular it cannot peek at upcoming coin flips).
const {performance}=require('node:perf_hooks');
const {reduce,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {isBasicPokemon,isEnergy,canEvolve,canPayEnergy}=require('./core_rules');
const ATTACK=require('./attack_effects_core');
const POWERS=require('./classic_power_core');

const SKILLS=Object.freeze({
  1:Object.freeze({name:'Beginner',temperature:40,attention:5,sampleWindow:14,trainers:1,bench:2}),
  2:Object.freeze({name:'Casual',temperature:18,attention:9,sampleWindow:9,trainers:2,bench:3}),
  3:Object.freeze({name:'Experienced',temperature:8,attention:16,sampleWindow:6,trainers:3,bench:3}),
  4:Object.freeze({name:'Expert',temperature:2,attention:30,sampleWindow:3,trainers:4,bench:4}),
  5:Object.freeze({name:'Champion',temperature:0,attention:100,sampleWindow:1,trainers:6,bench:4}),
  6:Object.freeze({name:'Grandmaster',temperature:0,attention:140,sampleWindow:1,trainers:8,bench:4,searchDepth:2,searchWidth:3,searchRoots:4,searchNodes:24}),
  7:Object.freeze({name:'Mastermind',temperature:0,attention:200,sampleWindow:1,trainers:9,bench:4,searchDepth:3,searchWidth:4,searchRoots:5,searchNodes:48}),
  8:Object.freeze({name:'Apex',temperature:0,attention:300,sampleWindow:1,trainers:10,bench:4,searchDepth:5,searchWidth:6,searchRoots:8,searchNodes:400})
});
// An independently testable difficulty calibration: mistakes result from a
// broader, noisier choice among *legal* actions, never extra cards, forced
// concedes or favorable RNG for the other player.
const CALIBRATED_SKILLS=Object.freeze({
 1:Object.freeze({...SKILLS[1],temperature:900,sampleWindow:36}),
 2:Object.freeze({...SKILLS[2],temperature:240,sampleWindow:24}),
 3:Object.freeze({...SKILLS[3],temperature:85,sampleWindow:13}),
 4:Object.freeze({...SKILLS[4],temperature:35,sampleWindow:7}),
 5:SKILLS[5],6:SKILLS[6],7:SKILLS[7],8:SKILLS[8]
});
const PERSONALITIES=Object.freeze({
 balanced:Object.freeze({damage:1,survival:1,setup:1,control:1,risk:0}),
 aggressive:Object.freeze({damage:1.3,survival:.75,setup:.9,control:.9,risk:.15}),
 defensive:Object.freeze({damage:.9,survival:1.45,setup:1,control:1,risk:-.2}),
 tactical:Object.freeze({damage:1,survival:1,setup:.9,control:1.4,risk:-.1}),
 setup:Object.freeze({damage:.9,survival:1,setup:1.4,control:1,risk:-.1}),
 risk_taking:Object.freeze({damage:1.1,survival:.85,setup:.9,control:1,risk:.8})
});
function configuration(raw={}){
 const level=raw.level??3,personality=raw.personality??'balanced';
 if(!Number.isInteger(level)||!SKILLS[level])throw Error('CPU level must be 1–8');
 if(!Object.hasOwn(PERSONALITIES,personality))throw Error('Unknown CPU personality');
 if(!Number.isSafeInteger(raw.seed??1))throw Error('Invalid CPU policy seed');
 const side=raw.side??1;if(side!==0&&side!==1)throw Error('Invalid CPU side');
 // Opt-in until blinded paired tournaments demonstrate a strength gain.
 const planning=raw.planning??false;
 if(typeof planning!=='boolean')throw Error('Invalid CPU planning setting');
 const evolutionTempo=raw.evolutionTempo??(level>=6);
 if(typeof evolutionTempo!=='boolean')throw Error('Invalid CPU evolution-tempo setting');
 const prizeRace=raw.prizeRace??(level>=6);
 if(typeof prizeRace!=='boolean')throw Error('Invalid CPU Prize-race setting');
 const knockoutTempo=raw.knockoutTempo??(level>=6);
 if(typeof knockoutTempo!=='boolean')throw Error('Invalid CPU knockout-tempo setting');
 const opponentResponse=raw.opponentResponse??(level>=6);
 if(typeof opponentResponse!=='boolean')throw Error('Invalid CPU opponent-response setting');
 const graduatedNoise=raw.graduatedNoise??false;
 if(typeof graduatedNoise!=='boolean')throw Error('Invalid graduated-noise setting');
 const energyHorizon=raw.energyHorizon??(level>=7);
 if(typeof energyHorizon!=='boolean')throw Error('Invalid energy-horizon setting');
 return {level,personality,seed:raw.seed??1,side,planning,evolutionTempo,prizeRace,knockoutTempo,opponentResponse,
  graduatedNoise,energyHorizon,skill:(graduatedNoise?CALIBRATED_SKILLS:SKILLS)[level],style:PERSONALITIES[personality]};
}
// Seeded independent of the engine's private deck order and future RNG state.
function rng(seed){let x=(seed>>>0)||0x6d2b79f5;return ()=>{
 x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;
};}
const command=(type,payload={})=>({type,payload});
function observation(game,side){
 const view=publicView(game,side);
 // The network projection intentionally omits once-per-turn flags. Those are
 // visible to the acting player and never reveal the opponent's private cards.
 const self={...view.players[side],energyUsed:!!game.players[side].energyUsed,
  retreated:!!game.players[side].retreated};
 // Only expose decisions previously made BY this CPU in its own Trainer flow.
 // The full pending action can include hidden draws and must never be projected.
 const ownedPlan=game.pendingAction?.kind==='classic_trainer'&&
  game.pendingAction.plan?.side===side?game.pendingAction.plan:null;
 const selectedIndex=key=>{
  const x=ownedPlan?.data?.[key]?.[0];
  if(typeof x!=='string'||!/^slot:-?\d+$/.test(x))return null;
  return Number(x.slice(5));
 };
 return {phase:view.phase,turn:view.turn,round:view.round,turnSerial:game.turnSerial,over:view.over,
  self,opponent:view.players[1-side],stadium:view.stadium,
  pendingTrainerTarget:selectedIndex('target'),pendingTrainerSource:selectedIndex('source'),
  decision:view.pendingDecision,setupReady:!!game.setupReady[side],mulliganBonus:view.mulliganBonus};
}
const card=id=>CATALOG.get(id);
const slotUnit=(p,slot)=>slot===-1?p.active:p.bench[slot];
const slots=p=>[-1,...p.bench.map((_,i)=>i)];
function energyPool(unit){
 return (unit?.energies||[]).flatMap(id=>{
  const n=card(id)?.name||'';
  if(n==='Double Colorless Energy')return ['Colorless','Colorless'];
  if(n==='Miracle Energy')return ['Any','Any'];
  if(n==='Rainbow Energy')return ['Any'];
  if(n.endsWith(' Energy'))return [['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'].includes(n.slice(0,-7))?n.slice(0,-7):'Colorless'];
  return [];
 });
}
function energyValue(pokemon,energyId){
 const source=card(pokemon?.id);
 if(!source)return 0;
 const pool=energyPool(pokemon);
 const added=energyPool({energies:[energyId]});
 const moves=source.attacks||[];
 let value=0;
 for(const attack of moves){
  const cost=attack.cost||[];
  const before=canPayEnergy(cost,pool),after=canPayEnergy(cost,[...pool,...added]);
  if(!before&&after)value=Math.max(value,95+cost.length*6);
  else if(!before){
   const colored=cost.filter(x=>x!=='Colorless');
   const canMatch=colored.some(x=>added.includes(x)||added.includes('Any'));
   if(canMatch||!colored.length)value=Math.max(value,34+Math.min(30,cost.length*5));
  }
 }
 return value-(pokemon.energies||[]).length*9;
}
function estimatedDamage(attack,attacker,defender){
 if(!attack||!defender)return 0;
 const raw=String(attack.damage||'0');
 let amount=parseInt(raw,10)||0;
 const program=ATTACK.compile(attack);
 // The evaluator estimates EXPECTED damage of supported families, rather than
 // assuming the highest coin outcome or treating counter attacks as flat 10.
 // These estimates never alter combat resolution or RNG state.
 if(program?.kind==='flail-counters')amount=program.factor*(attacker.damage||0)/10;
 else if(program?.kind==='own-counters')amount=program.base+program.factor*(attacker.damage||0)/10;
 else if(program?.kind==='defender-counters')amount=program.base+program.factor*(defender.damage||0)/10;
 else if(program?.kind==='minus-counters')amount=Math.max(0,program.base-program.factor*(attacker.damage||0)/10);
 else if(program?.kind==='coin-times')amount=program.flips*program.each*.5;
 else if(program?.kind==='coin-failure')amount=program.damage*.5;
 else if(program?.kind==='coin-bonus')amount=program.base+program.bonus*.5;
 else if(program?.kind==='coin-recoil-bonus')amount=program.base+program.bonus*.5;
 else if(raw.endsWith('x'))amount*=1;
 else if(raw.endsWith('+'))amount+=8;
 else if(raw.endsWith('-'))amount=Math.max(0,amount-10);
 const aType=(card(attacker?.id)?.types||[])[0],target=card(defender.id);
 if(aType&&target?.weaknesses?.some(w=>w.type===aType))amount*=2;
 if(aType&&target?.resistances?.some(r=>r.type===aType))amount=Math.max(0,amount-30);
 return amount;
}
function damageAfterType(amount,attacker,defender){
 const type=(card(attacker?.id)?.types||[])[0],target=card(defender?.id);
 let value=amount;
 if(type&&target?.weaknesses?.some(w=>w.type===type))value*=2;
 if(type&&target?.resistances?.some(w=>w.type===type))value=Math.max(0,value-30);
 return value;
}
function knockoutChance(attack,attacker,defender){
 if(!attack||!attacker||!defender)return 0;
 const hp=hpRemaining(defender);
 if(hp<=0)return 0;
 const program=ATTACK.compile(attack),kill=raw=>damageAfterType(raw,attacker,defender)>=hp;
 if(program?.kind==='coin-failure')return kill(program.damage)?0.5:0;
 if(['coin-bonus','coin-recoil-bonus'].includes(program?.kind))return (Number(kill(program.base))+Number(kill(program.base+program.bonus)))/2;
 if(program?.kind==='coin-times'){
  // Exact public probability for the printed number of fair coin flips. No
  // random calls and no access to the engine's future RNG or shuffled deck.
  let prob=[1];
  for(let flip=0;flip<program.flips;flip++){
   const next=Array(prob.length+1).fill(0);
   for(let k=0;k<prob.length;k++){next[k]+=prob[k]*.5;next[k+1]+=prob[k]*.5;}
   prob=next;
  }
  return prob.reduce((v,p,k)=>v+(kill(k*program.each)?p:0),0);
 }
 const expected=estimatedDamage(attack,attacker,defender);
 const coin=/flip (?:a |one |\\d+ )?coins?|heads|tails/i.test(attack.text||'');
 return expected>=hp?(coin&&program?.kind!=='coin-status'?.5:1):0;
}
function strongestAffordableAttack(unit,defender){
 if(!unit||!defender)return 0;
 const attacks=(unit.effectiveAttacks||card(unit.id)?.attacks||[]);
 const pool=energyPool(unit);
 return attacks.reduce((best,attack)=>canPayEnergy(attack.cost||[],pool)?
  Math.max(best,estimatedDamage(attack,unit,defender)):best,0);
}
function damageAfterAttachment(unit,energyId,defender){
 if(!unit||!defender)return 0;
 const pool=[...energyPool(unit),...energyPool({energies:[energyId]})];
 const attacks=unit.effectiveAttacks||card(unit.id)?.attacks||[];
 return attacks.reduce((best,a)=>canPayEnergy(a.cost||[],pool)?
  Math.max(best,estimatedDamage(a,unit,defender)):best,0);
}
function hpRemaining(u){return Math.max(0,(Number(card(u?.id)?.hp)||60)-(u?.damage||0));}
function setupValue(unit){
 const c=card(unit?.id);
 const attacks=c?.attacks||[];
 return (Number(c?.hp)||40)*.3+Math.max(0,30-Math.min(...attacks.map(a=>(a.cost||[]).length),5)*10)+attacks.length*4;
}
function openingReadiness(cardId,hand){
 const pokemon=card(cardId),moves=pokemon?.attacks||[];
 const energies=hand.filter(id=>isEnergy(card(id)));
 if(!moves.length||!energies.length)return 0;
 let readiness=0;
 for(const e of energies){
  const provided=energyPool({energies:[e]});
  for(const move of moves){
   const cost=move.cost||[];
   if(!cost.length)readiness=Math.max(readiness,12);
   else if(canPayEnergy(cost,provided))readiness=Math.max(readiness,85);
   else if(cost.some(t=>t!=='Colorless'&&(provided.includes(t)||provided.includes('Any'))))
    readiness=Math.max(readiness,30);
  }
 }
 return readiness;
}
function hasExoticEnergy(unit){
 // Special abilities can change printed Energy costs. Let the authoritative
 // reducer decide these instead of excluding them with a simple card-name pool.
 const c=card(unit?.id);
 return !!(unit?.buzzapTypes||unit?.energyBurnUntil||unit?.gymShapeshiftCard||
  (c?.abilities||[]).some(x=>['Transform','Photosynthesis','Energy Burn'].includes(x.name)));
}
function eligibleAttack(o,active,attack,index){
 if(!attack||!active||!ATTACK.compile(attack))return false;
 if(['Asleep','Paralyzed'].includes(active.status))return false;
 if(active.amnesia?.index===index&&active.amnesia.expires>o.turnSerial)return false;
 if(active.gymAttackCooldown?.expires>o.turnSerial&&
  (active.gymAttackCooldown.index===null||active.gymAttackCooldown.index===index))return false;
 if(active.gymAttackOnce?.includes(index))return false;
 if(!hasExoticEnergy(active)&&!canPayEnergy(attack.cost||[],energyPool(active)))return false;
 const script=ATTACK.compile(attack);
 if(['bench-target','switch-attacker','fascinate'].includes(script.kind)&&!o.opponent.bench.length)return false;
 if(script.kind==='switch-self'&&!o.self.bench.length)return false;
 return true;
}
function powerOpportunity(o,slot,name){
 const p=o.self,u=slotUnit(p,slot);
 if(!u)return false;
 const damaged=slots(p).map(i=>slotUnit(p,i)).filter(x=>x&&x.damage>=10);
 if(name==='Strange Behavior')return u.damage+10<(Number(card(u.id)?.hp)||0)&&damaged.some(x=>x!==u);
 if(name==='Damage Swap')return damaged.some(x=>slots(p).some(i=>{
  const to=slotUnit(p,i);return to&&to!==x&&to.damage+10<(Number(card(to.id)?.hp)||0);
 }));
 if(name==='Curse')return o.opponent.bench.some(x=>x.damage>=10)&&o.opponent.active||o.opponent.active?.damage>=10&&o.opponent.bench.length>0;
 if(name==='Natural Healing')return u.damage>0;
 if(name==='Heal')return damaged.length>0;
 if(name==='Rain Dance')return p.hand.some(id=>card(id)?.name==='Water Energy')&&slots(p).some(i=>card(slotUnit(p,i)?.id)?.types?.includes('Water'));
 if(name==='Downpour')return p.hand.some(id=>card(id)?.name==='Water Energy');
 if(name==='Energy Trans'||name==='Gather Fire')return slots(p).some(i=>i!==slot&&slotUnit(p,i)?.energies?.some(id=>card(id)?.name===(name==='Gather Fire'?'Fire Energy':'Grass Energy')));
 if(name==='Step In')return slot>=0;
 if(name==='Matter Exchange')return p.hand.length>0;
 if(name==='Cowardice'||name==='Buzzap')return false; // unsafe irreversible options need a dedicated scorer
 return true;
}
function retreatFeasible(o,active){
 if(!active||['Asleep','Paralyzed'].includes(active.status)||!o.self.bench.length)return false;
 const printed=(card(active.id)?.retreatCost||[]).length;
 const balloon=active.attachedTrainers?.some(t=>card(t.id)?.name==='Balloon Berry');
 if(balloon||printed===0)return true;
 const available=energyPool(active).length;
 // Count public retreat discounts conservatively; final legality is ALWAYS
 // delegated to the authoritative reducer (which also applies Stadium rules).
 const discounted=o.self.bench.filter(u=>(card(u.id)?.abilities||[])
  .some(a=>a.name==='Retreat Aid')).length;
 const gym=o.stadium?.id?card(o.stadium.id)?.name:'';
 const otherDiscount=gym==='Cerulean City Gym'?1:0;
 return available+discounted+otherDiscount>=printed;
}
function trainerOpportunity(o,name,cfg){
 const p=o.self,q=o.opponent;
 const own=[p.active,...p.bench].filter(Boolean),enemy=[q.active,...q.bench].filter(Boolean);
 const removable=enemy.some(u=>u.energies?.length>0&&!u.attachedTrainers?.some(t=>card(t.id)?.name==="Brock's Protection"));
 if(name==='Super Energy Removal')return removable&&own.some(u=>u.energies?.length>0);
 if(name==='Energy Removal')return removable;
 if(name==='Super Potion')return own.some(u=>u.damage>=10&&u.energies?.length>0);
 if(name==='Potion')return own.some(u=>u.damage>=10);
 if(name==='Switch')return p.bench.length>0;
 if(name==='Gust of Wind')return q.bench.length>0;
 if(name==='Pokémon Center')return own.some(u=>u.damage>=10);
 // Item Finder requires a Trainer already in discard before its two-card cost.
 // Playing it without a target strands a mandatory choice on the genuine reducer.
 if(name==='Item Finder')return (p.discard||[]).some(id=>card(id)?.supertype==='Trainer');
 if(name==='Computer Search')return p.deckCount>0;
 if(name==='Bill')return p.deckCount>(cfg.level>=4?2:0);
 if(name==='Professor Oak')return p.deckCount>(cfg.level>=4?7:0);
 return true;
}
function candidates(o,cfg,used){
 if(o.over||o.decision?.waitingFor!==undefined)return [];
 const p=o.self,turn=o.turn===cfg.side,options=[];
 if(o.decision){
  if(o.decision.actor!==cfg.side)return [];
  const d=o.decision;
  const sorted=[...d.options].sort((a,b)=>choiceValue(b,d,o,cfg)-choiceValue(a,d,o,cfg)||a.id.localeCompare(b.id));
  // Card costs and mandatory multi-pick effects must be solvable at every skill.
  // Skill changes ranking, never the legal number of choices considered.
  const sizes=new Set([d.min,d.max,Math.min(d.max,Math.max(1,d.min)),Math.min(d.max,Math.max(2,d.min))]);
  if(d.max>d.min+3)sizes.add(Math.min(d.max,d.min+3));
  // Payment effects may demand one special Energy instead of two Basic ones;
  // prefix-only selection can create a mandatory, impossible-to-finish prompt.
  // Enumerate small legal subsets, bounded to avoid combinatorial explosion.
  let combinations=0;
  for(const n of [...sizes].sort((a,b)=>a-b)){
   const pick=selected=>{options.push(command('choose',{decisionId:d.id,selected:selected.map(x=>x.id)}));combinations++;};
   const pool=sorted.slice(0,Math.max(8,Math.min(24,n)));
   if(n>4||n>pool.length){pick(sorted.slice(0,n));continue;}
   const walk=(from,selected)=>{
    if(combinations>=72)return;
    if(selected.length===n){pick(selected);return;}
    for(let i=from;i<=pool.length-(n-selected.length)&&combinations<72;i++)walk(i+1,[...selected,pool[i]]);
   };
   walk(0,[]);
  }
  if(d.optional)options.push(command('choose',{decisionId:d.id,decline:true}));
  return options;
 }
 if(o.phase==='setup'){
  const bonus=o.mulliganBonus;
  if(bonus){
   if(bonus.side!==cfg.side)return [];
   if(bonus.drawn===null)return [command('setup_bonus_draw',{count:bonus.max})];
   if(p.bench.length<cfg.skill.bench)for(let i=0;i<p.hand.length;i++)
    if(isBasicPokemon(card(p.hand[i])))options.push(command('setup_select',{handIndex:i}));
   options.push(command('setup_bonus_done'));
   return options;
  }
  if(o.setupReady)return [];
  if(!p.active){for(let i=0;i<p.hand.length;i++)if(isBasicPokemon(card(p.hand[i])))options.push(command('setup_select',{handIndex:i}));}
  else if(p.bench.length<cfg.skill.bench){for(let i=0;i<p.hand.length;i++)if(isBasicPokemon(card(p.hand[i])))options.push(command('setup_select',{handIndex:i}));}
  if(p.active)options.push(command('setup_confirm'));
  return options;
 }
 if(!turn)return [];
 // All generated actions are only proposals; reduce() remains authoritative.
 if(p.bench.length<cfg.skill.bench)for(let i=0;i<p.hand.length;i++)if(isBasicPokemon(card(p.hand[i])))options.push(command('bench',{handIndex:i}));
 for(let i=0;i<p.hand.length;i++){
  const c=card(p.hand[i]);
  if(c?.supertype==='Pokémon'&&(c.evolvesFrom||
    ['Pikachu','Clefairy','Electabuzz','Magmar','Jigglypuff','Jynx','Hitmonchan','Hitmonlee','Hitmontop'].includes(c.name)))
   for(const slot of slots(p)){
    const target=slotUnit(p,slot);
    if(target&&canEvolve(c,card(target.id))&&target.playedTurn<o.round)
     options.push(command('evolve',{handIndex:i,slot}));
   }
  if(!p.energyUsed&&isEnergy(c))for(const slot of slots(p))options.push(command('attach_energy',{handIndex:i,slot}));
  if(c?.supertype==='Trainer'&&used.trainers<cfg.skill.trainers&&trainerOpportunity(o,c.name,cfg))options.push(command('play_trainer',{handIndex:i}));
 }
 if(p.active){
  const effective=p.active.effectiveAttacks||card(p.active.id)?.attacks||[];
  for(let attackIndex=0;attackIndex<effective.length;attackIndex++)
   if(eligibleAttack(o,p.active,effective[attackIndex],attackIndex))options.push(command('attack',{attackIndex}));
  if(!p.retreated&&retreatFeasible(o,p.active))
   for(let slot=0;slot<p.bench.length;slot++)options.push(command('retreat',{slot}));
 }
 if(used.powers<Math.max(1,cfg.level)&&p.active)for(const slot of slots(p)){
  const u=slotUnit(p,slot);
  if(!u)continue;
  const powerNames=(card(u.id)?.abilities||[]).filter(x=>x.name).map(x=>x.name);
  for(let powerIndex=0;powerIndex<powerNames.length;powerIndex++){
   if(!POWERS.ACTIVATED.has(powerNames[powerIndex])||!powerOpportunity(o,slot,powerNames[powerIndex]))continue;
   // Rain Dance is inactive while its source is Asleep, Confused or
   // Paralyzed; don't spend the search budget probing an illegal use.
   if(cfg.level===8&&powerNames[powerIndex]==='Rain Dance'&&
     ['Asleep','Confused','Paralyzed'].includes(u.status))continue;
   const id=slot+':'+powerIndex;
   // Rain Dance may be used repeatedly while Water Energy remains in hand.
   // Keep its reuse confined to Level 8; the global 8-Power/turn budget and
   // decreasing hand Energy prevent cycling indefinitely.
   const repeatable=cfg.level===8&&powerNames[powerIndex]==='Rain Dance';
   if(repeatable||!used.powerKeys.has(id))
    options.push(command('use_power',{slot,powerIndex}));
  }
 }
 if(o.stadium&&!used.stadium)options.push(command('use_stadium'));
 options.push(command('end_turn'));
 return options;
}
function energyDenialValue(unit,defender,isActive){
 if(!unit||!unit.energies?.length)return -100;
 const before=strongestAffordableAttack(unit,defender);
 const future=(unit.effectiveAttacks||card(unit.id)?.attacks||[]).reduce((max,a)=>
  Math.max(max,(a.cost||[]).length),0);
 let denied=0;
 for(let i=0;i<unit.energies.length;i++){
  const after={...unit,energies:unit.energies.filter((_,j)=>j!==i)};
  const remaining=strongestAffordableAttack(after,defender);
  denied=Math.max(denied,Math.max(0,before-remaining)+
   ((before>=hpRemaining(defender)&&remaining<hpRemaining(defender))?100:0));
 }
 const ready=before>0?28:0;
 const potential=Math.min(15,future*4);
 return (isActive?1.3:.7)*(denied+ready+potential)+(isActive?32:0);
}
function energyRemovalChoiceValue(unit,defender,energyIndex,enemy){
 if(!unit||!unit.energies?.[energyIndex])return 0;
 const before=strongestAffordableAttack(unit,defender);
 const after={...unit,energies:unit.energies.filter((_,i)=>i!==energyIndex)};
 const remaining=strongestAffordableAttack(after,defender);
 const denied=Math.max(0,before-remaining);
 const removed=energyPool({energies:[unit.energies[energyIndex]]}).length;
 const preventedKO=before>=hpRemaining(defender)&&remaining<hpRemaining(defender);
 const control=denied*2+(preventedKO?130:0)+removed*7;
 return enemy?control:-control;
}
// Apex: Rain Dance is a free, repeatable Water Energy attachment, not a
// generic 85-point Power. The target valuation uses only our visible hand,
// public cards, and presently affordable attacks; it never samples deck draws.
function rainDanceTargetValue(unit,waterId,enemy){
 if(!unit||!enemy||!waterId)return -100;
 const before=strongestAffordableAttack(unit,enemy);
 const after=damageAfterAttachment(unit,waterId,enemy);
 const increase=Math.max(0,after-before);
 const ko=before<hpRemaining(enemy)&&after>=hpRemaining(enemy)&&after>0;
 const prep=Math.max(0,energyValue(unit,waterId));
 // Free attachment is not actually free in strategy: spending a Water card
 // now can strand a future evolver. Do not overfill an already ready attacker
 // when an extra Energy would unlock neither damage nor a future cost.
 if(increase===0&&prep===0)return -50;
 return 30+Math.min(125,prep)*.65+increase*1.7+(ko?135:0);
}
function rainDanceOpportunity(o){
 const waterId=o.self.hand.find(id=>card(id)?.name==='Water Energy');
 if(!waterId||!o.opponent.active)return -100;
 return Math.max(-100,...slots(o.self).map(slot=>{
  const unit=slotUnit(o.self,slot);
  return card(unit?.id)?.types?.includes('Water')?
   rainDanceTargetValue(unit,waterId,o.opponent.active):-100;
 }));
}
function choiceValue(option,decision,o,cfg){
 const id=option.id,label=option.label||'',kind=decision.kind||'',ctx=decision.label||'';
 // Power target prompts are own-team choices, even when their printed
 // label says "Water Pokémon" rather than "your Pokémon". The generic
 // slot scorer otherwise accidentally looks up the opponent's Bench.
 if(cfg?.level===8&&/^slot:-?\d+$/.test(id)&&
   /^Choose Water Pokémon to attach Energy$/i.test(ctx)){
  const unit=slotUnit(o.self,Number(id.slice(5)));
  const energy=o.self.hand.find(cardId=>card(cardId)?.name==='Water Energy');
  return rainDanceTargetValue(unit,energy,o.opponent.active);
 }
 if(/^prize:/.test(id))return 1;
 if(/^n:\d+$/.test(id)&&cfg?.level>=3){
  const index=Number(id.slice(2));
  if(/^Choose opposing Energy to discard$/i.test(ctx)&&o.pendingTrainerTarget!==null){
   const unit=slotUnit(o.opponent,o.pendingTrainerTarget);
   return energyRemovalChoiceValue(unit,o.self.active,index,true);
  }
  if(/^Discard one of your attached Energy$/i.test(ctx)&&o.pendingTrainerSource!==null){
   const unit=slotUnit(o.self,o.pendingTrainerSource);
   return energyRemovalChoiceValue(unit,o.opponent.active,index,false);
  }
 }
 if(/^count:/.test(id))return /draw/i.test(ctx)?Number(id.slice(6))*20:0;
 if(/^energy:/.test(id)&&/discard|retreat|pay/i.test(ctx))return /Double Colorless|Rainbow/i.test(label)?-15:10;
 if(/^bench:/.test(id)||/^slot:/.test(id)){
  const n=Number(id.split(':')[1]),own=/your|friendly|own|promot|receiv|retreat/i.test(ctx)&&!/opponent|opposing|enemy/i.test(ctx);
  const target=slotUnit(own?o.self:o.opponent,n);
  if(!target)return 0;
  if(cfg?.level>=3&&/^slot:/.test(id)&&/^Choose opposing Pokémon$/i.test(ctx))
   return energyDenialValue(target,o.self.active,n===-1);
  if(/promot|retreat|switch.*your/i.test(ctx)){
   const damage=strongestAffordableAttack(target,o.opponent.active);
   const incoming=strongestAffordableAttack(o.opponent.active,target);
   const survives=hpRemaining(target)>incoming;
   // Pick a ready attacker that can survive the public opposing Active, not
   // whichever Bench Pokémon appears largest or needs imaginary Fighting Energy.
   return setupValue(target)*.5+damage*1.6+hpRemaining(target)*.4+
    (damage>=hpRemaining(o.opponent.active)&&hpRemaining(o.opponent.active)>0?125:0)+
    (survives?32:-65);
  }
  if(/damage|attack|gust|opposing|opponent/i.test(ctx)){
   const damage=strongestAffordableAttack(o.self.active,target);
   const lethal=damage>=hpRemaining(target)&&hpRemaining(target)>0;
   return 100-hpRemaining(target)+damage*.8+(lethal?225:0);
  }
  return own?setupValue(target):110-hpRemaining(target);
 }
 if(/^deck:/.test(id)&&cfg?.level>=8&&/^Search your deck for any card$/i.test(ctx)){
  // Prefer an Energy that makes the Active attack *this turn* over an
  // attractive but tactically irrelevant Basic Pokémon.
  // Deck option IDs are indices, not card IDs. Resolve by the public
  // option label; never inspect unrevealed deck order.
  const candidateId=[...CATALOG.values()].find(c=>c.name===label)?.id;
  const candidate=candidateId?card(candidateId):null;
  if(candidate&&isEnergy(candidate)&&!o.self.energyUsed&&o.self.active&&o.opponent.active){
   const before=strongestAffordableAttack(o.self.active,o.opponent.active);
   const after=damageAfterAttachment(o.self.active,candidateId,o.opponent.active);
   if(before===0&&after>0)return 1000+after;
   if(after>before)return 450+after;
  }
 }
 if(/^hand:|^deck:/.test(id))return /Energy/i.test(label)?20:40;
 if(/draw|recover|search|attach|heal/i.test(ctx))return 15;
 return 0;
}
// Evolving can strand the Active without enough Energy to attack. Compute the
// available attack value before/after evolution from only revealed combatants,
// then check the player's own hand for a SAME-TURN usable Energy solution.
function evolutionTempoPenalty(o,slot,evolutionId,cfg){
 if(!cfg.evolutionTempo||cfg.level<3||slot!==-1)return 0;
 const before=o.self.active,nextCard=card(evolutionId);
 if(!before||!nextCard)return 0;
 const after={...before,id:evolutionId};
 const current=strongestAffordableAttack(before,o.opponent.active);
 if(current<=0)return 0;
 const promoted=strongestAffordableAttack(after,o.opponent.active);
 if(promoted>=current)return 0;
 // If one legal Energy attachment can restore a useful attack this turn,
 // evolution is not necessarily a tempo sacrifice.
 const canRefuel=!o.self.energyUsed&&o.self.hand.some(id=>
  isEnergy(card(id))&&damageAfterAttachment(after,id,o.opponent.active)>=current);
 if(canRefuel)return 0;
 const currentKO=current>=hpRemaining(o.opponent.active)&&hpRemaining(o.opponent.active)>0;
 const counterBefore=strongestAffordableAttack(o.opponent.active,before);
 const counterAfter=strongestAffordableAttack(o.opponent.active,after);
 const getsSafer=counterBefore>=hpRemaining(before)&&counterAfter<hpRemaining(after);
 // Safety (larger HP pool and curing a disabling status) can outweigh tempo.
 // Otherwise delaying evolution one turn preserves pressure on the Prize race.
 const isDisabled=['Asleep','Paralyzed'].includes(before.status);
 return getsSafer||isDisabled?0:
  Math.round((promoted===0?142:60)+(currentKO&&promoted<hpRemaining(o.opponent.active)?110:0));
}
// Conservative one-ply opponent response and visible Prize-race incentives.
// No reducer rollouts, opponent concealed hand, unknown future Energy or RNG.
function prizeRaceBonus(action,o,cfg){
 if(!cfg.prizeRace||cfg.level<4||o.phase!=='game'||!o.self.active||!o.opponent.active)return 0;
 const own=o.self,enemy=o.opponent;
 const urgent=own.prizeCount===1||enemy.bench.length===0;
 if(action.type==='attack'){
  const moves=own.active.effectiveAttacks||card(own.active.id)?.attacks||[];
  const attack=moves[action.payload.attackIndex];if(!attack)return 0;
  const ko=knockoutChance(attack,own.active,enemy.active);
  // An actual knockout that takes our final Prize or eliminates their last
  // Pokémon must dominate speculative development, retreat or Trainer play.
  const victory=urgent?550*ko:0;
  const theirWin=enemy.prizeCount===1&&
   strongestAffordableAttack(enemy.active,own.active)>=hpRemaining(own.active);
  // Even without winning outright, trading Prizes before a likely loss helps.
  const trade=(!urgent&&theirWin?100*ko:0)+(!urgent?45*ko:0);
  return (victory+trade)*cfg.style.damage;
 }
 if(action.type==='retreat'&&enemy.prizeCount===1){
  const old=own.active,alternate=own.bench[action.payload.slot];
  if(!alternate)return 0;
  // Sleeping/Paralyzed Pokémon cannot immediately attack. An omniscient
  // "potential attack" should not provoke a desperate unnecessary retreat.
  if(['Asleep','Paralyzed'].includes(enemy.active.status))return 0;
  const outgoing=strongestAffordableAttack(enemy.active,old);
  const incoming=strongestAffordableAttack(enemy.active,alternate);
  const deadly=outgoing>=hpRemaining(old)&&outgoing>0;
  const escape=incoming<hpRemaining(alternate);
  const myKO=strongestAffordableAttack(old,enemy.active)>=hpRemaining(enemy.active);
  // If the next visible enemy attack takes their last Prize, a genuinely
  // safe replacement may be more valuable than taking nonlethal damage.
  return deadly&&escape&&!myKO?125*cfg.style.survival:0;
 }
 return 0;
}
// Distinguish a *secured Prize* from nominal damage, while preserving the
// critical need to establish a backup before attacking. Full, guaranteed KO
// urgency is an optional Champion skill feature until matchups prove value.
// Public, bounded one-ply reply estimate: avoid yielding a free Prize when a
// ready Benched Pokémon can weather the *currently affordable* opposing attack.
// Opponent hidden hands, future Energy draws and RNG are never read.
function opponentResponseBonus(action,o,cfg){
 if(!cfg.opponentResponse||cfg.level<4||o.phase!=='game'||!o.self.active||!o.opponent.active)
  return 0;
 const p=o.self,q=o.opponent;
 if(action.type!=='retreat')return 0;
 if(['Asleep','Paralyzed'].includes(q.active.status))return 0;
 const attacker=p.active,next=p.bench[action.payload.slot];
 if(!next)return 0;
 const now=strongestAffordableAttack(q.active,attacker);
 const after=strongestAffordableAttack(q.active,next);
 const threat=now>=hpRemaining(attacker)&&now>0;
 if(!threat||after>=hpRemaining(next))return 0;
 const currentKO=(attacker.effectiveAttacks||card(attacker.id)?.attacks||[])
  .some(a=>canPayEnergy(a.cost||[],energyPool(attacker))&&knockoutChance(a,attacker,q.active)>=.75);
 if(currentKO)return 0;
 const replacement=strongestAffordableAttack(next,q.active);
 if(!replacement)return 0; // Do not flee into a passive Bench that cannot defend itself.
 const lostEnergy=Math.min(attacker.energies?.length||0,(card(attacker.id)?.retreatCost||[]).length);
 const advantage=Math.max(0,replacement-strongestAffordableAttack(attacker,q.active))*.25;
 return Math.max(0,270+advantage-lostEnergy*22)*cfg.style.survival;
}
function knockoutTempoBonus(a,o,cfg){
 if(!cfg.knockoutTempo||cfg.level<4||o.phase!=='game'||!o.self.active||!o.opponent.active)return 0;
 if(a.type!=='attack')return 0;
 const p=o.self,q=o.opponent;
 const atk=(p.active.effectiveAttacks||card(p.active.id)?.attacks||[])[a.payload.attackIndex];
 if(!atk)return 0;
 const chance=knockoutChance(atk,p.active,q.active);
 if(!chance)return 0;
 const lastPrize=p.prizeCount===1,lastOpponent=q.bench.length===0;
 if(lastPrize||lastOpponent)return 550*chance;
 // If attacking would strand us with zero Pokémon after the counter-KO, build
 // backup first, except when this KO wins outright.
 if(!p.bench.length&&p.hand.some(id=>isBasicPokemon(card(id))))return 0;
 // Don't spend a turn in endless preparation when a certain Prize is available.
 const vulnerability=!['Asleep','Paralyzed'].includes(q.active.status)&&
  strongestAffordableAttack(q.active,p.active)>=hpRemaining(p.active);
 return chance*(vulnerability?230:125);
}
// Estimate what additional cards ALREADY in the player's own hand could unlock
// after the current Energy attachment. No future draw is assumed, no opponent
// hidden cards are accessed, and no engine reducer/coin oracle is consulted.
function horizonAttackValue(unit,defender,hand,remaining=1){
 if(!unit||!defender)return 0;
 const immediate=projectedAttackValue(unit,defender);
 if(remaining===0)return immediate;
 const seen=new Set();
 let best=immediate;
 for(const id of hand){
  if(seen.has(id)||!isEnergy(card(id)))continue;
  seen.add(id);
  const after={...unit,energies:[...(unit.energies||[]),id]};
  // A card requires another turn's Energy attachment. Discount those future
  // outcomes to avoid preferring a speculative combination to today's KO.
  const next=projectedAttackValue(after,defender);
  best=Math.max(best,immediate+(next-immediate)*.48);
 }
 return best;
}
function energyHorizonBonus(action,o,cfg){
 if(!cfg.energyHorizon||cfg.level<4||o.phase!=='game'||action.type!=='attach_energy')
  return 0;
 const p=o.self,q=o.opponent,v=action.payload,u=slotUnit(p,v.slot);
 if(!u||!q.active)return 0;
 const attachedId=p.hand[v.handIndex];
 if(!isEnergy(card(attachedId)))return 0;
 const after={...u,energies:[...(u.energies||[]),attachedId]};
 const futureHand=p.hand.filter((_,i)=>i!==v.handIndex);
 const before=horizonAttackValue(u,q.active,futureHand);
 const changed=horizonAttackValue(after,q.active,futureHand);
 const direct=projectedAttackValue(after,q.active)-projectedAttackValue(u,q.active);
 // Reward immediate Energy unlocks, but value two-card lines only insofar as
 // they are possible with cards that are ALREADY visible in our own hand.
 const expected=Math.max(0,changed-before)*1.15+Math.max(0,direct)*.35;
 const enemyReady=!['Asleep','Paralyzed'].includes(q.active.status)&&
  strongestAffordableAttack(q.active,u)>=hpRemaining(u);
 // A Bench attacker is useful as a replacement when the Active is visibly
 // exposed. Otherwise minimize speculative Energy sunk on remote Bench.
 const activeBias=v.slot===-1?35:enemyReady?22:-34;
 const weakDefense=enemyReady&&v.slot===-1&&p.bench.length>0?-30:0;
 const surplus=direct===0&&changed-before<=1?-35:0;
 return Math.max(-85,Math.min(160,expected+activeBias+weakDefense+surplus))*cfg.style.setup;
}
// Pokémon Center heals the whole team but discards Energy from each healed
// Pokémon. Preserve attachments until after the heal, including Energy in
// hand that would otherwise be thrown away in the same turn.
function pokemonCenterPending(o){
 return (o.self.hand||[]).some(id=>card(id)?.name==='Pokémon Center')&&
  [o.self.active,...o.self.bench].some(u=>u&&u.damage>=10);
}
function pokemonCenterEnergyWaste(o,slot){
 const u=slotUnit(o.self,slot);
 return !!(u&&u.damage>=10&&pokemonCenterPending(o));
}
function score(a,o,cfg,used){
 const p=o.self,q=o.opponent,style=cfg.style,{type,payload:v}=a;
 if(type==='setup_bonus_draw')return 300;
 if(type==='setup_bonus_done')return 115+p.bench.length*10;
 if(type==='setup_confirm')return 115+p.bench.length*10;
 if(type==='setup_select'){
  const u={id:p.hand[v.handIndex],energies:[]};
  const quality=setupValue(u)*style.setup;
  if(!p.active){
   // Champion evaluates a realistic first attack with Energy actually in hand
   // rather than always choosing the printed strongest Basic and getting stuck
   // on the wrong half of a mixed Water/Fighting deck.
   const ready=openingReadiness(u.id,p.hand);
   const foresight=cfg.level===1?0:cfg.level===2?.18:
    cfg.level===3?.45:cfg.level===4?.65:1;
   return 200+quality+ready*foresight*style.setup;
  }
  // Set a believable opening Bench before confirming. A novice often keeps
  // only an Active; stronger duelists keep a backup, and champions may commit
  // a third Basic when their opening hand allows it.
  const n=p.bench.length;
  const priority=cfg.level===1?55:cfg.level===2?
   (n===0?160:48):cfg.level===3?
   (n===0?175:65):cfg.level===4?
   (n===0?183:n===1?165:55):
   (n===0?190:n===1?175:55);
  return priority+quality*.6;
 }
 if(type==='choose'){
  if(v.decline)return -30;
  const d=o.decision,ctx=d.label||'';
  const ownDiscard=/discard|pay|cost|return .*deck/i.test(ctx)&&
   !/opponent|opposing|enemy/i.test(ctx);
  const beneficialPick=/recover|search|draw|attach|opposing|opponent|reveal|bench/i.test(ctx);
  const value=v.selected.reduce((n,id)=>n+choiceValue(d.options.find(x=>x.id===id)||{id},d,o,cfg),0);
  return 120+value+(beneficialPick?v.selected.length*8:0)-(ownDiscard?v.selected.length*28:0);
 }
 if(type==='bench'){
  // Before attacking, build a survivable replacement. This matters even with
  // a cheap attacker already online; the duel can end when Bench is empty.
  const backup=p.bench.length===0?cfg.level>=3?125:45:p.bench.length===1?cfg.level>=3?70:20:0;
  return (p.bench.length?43:100)+backup*style.setup+
   setupValue({id:p.hand[v.handIndex]})*.32*style.setup;
 }
 if(type==='evolve'){
  const target=slotUnit(p,v.slot),after=card(p.hand[v.handIndex]);
  return 165*style.setup+(Number(after?.hp)||0)*.35+((v.slot===-1)?15:0)-
   (target?.damage||0)*.1-evolutionTempoPenalty(o,v.slot,p.hand[v.handIndex],cfg);
 }
 if(type==='attach_energy'){
  const unit=slotUnit(p,v.slot),value=energyValue(unit,p.hand[v.handIndex]);
  // This attachment will be discarded if Center heals its target later.
  // Penalize it enough to force the zero-cost heal first; a follow-up
  // attachment is then evaluated normally against the healed board.
  if(cfg.level>=8&&pokemonCenterEnergyWaste(o,v.slot))return -1000;
  if(cfg.level===1)return 110+value*style.setup+(v.slot===-1?20:0);
  // One-step public-state projection: evaluate the attacks unlocked by the
  // Energy without calling reduce() to peek at future flips or hidden cards.
  const before=strongestAffordableAttack(unit,q.active);
  const after=damageAfterAttachment(unit,p.hand[v.handIndex],q.active);
  const improvement=Math.max(0,after-before);
  const ko=after>=hpRemaining(q.active)&&before<hpRemaining(q.active);
  const future=(improvement*(cfg.level===2?.50:.85)+(ko?(cfg.level===2?30:65):0))*style.damage;
  const saturation=before>0&&improvement===0?(cfg.level===2?14:35):0;
  return 110+value*style.setup+(v.slot===-1?18:0)+future-saturation;
 }
 if(type==='attack'){
  const attack=(p.active.effectiveAttacks||card(p.active.id)?.attacks||[])[v.attackIndex];
  const damage=estimatedDamage(attack,p.active,q.active),hp=hpRemaining(q.active);
  const uncertain=/flip (?:a |one |\\d+ )?coins?|heads|tails/i.test(attack?.text||'');
  // Expected damage has already accounted for coin outcomes. Applying another
  // 55% multiplier here previously double-discounted random attacks. Higher
  // levels instead compute the actual KO probability for known coin families.
  const lethal=damage>=hp&&hp>0;
  const koChance=cfg.level>=3?knockoutChance(attack,p.active,q.active):(lethal?1:0);
  const riskPreference=uncertain?style.risk*40:0;
  const direct=damage*style.damage;
  const statusValue=/Poison|Paraly|Sleep|Confus/i.test(attack?.text||'')?16:0;
  const fixedCost=/Discard.*Energy attached to/i.test(attack?.text||'')?30:0;
  const program=ATTACK.compile(attack);
  const selfDamage=['recoil','coin-recoil','coin-recoil-bonus'].includes(program?.kind)?
   (program.selfDamage||0):0;
  const selfKnockout=selfDamage>=hpRemaining(p.active)&&selfDamage>0?
   (program.kind==='recoil'?1:.5):0;
  // An expensive recoil KO is a reasonable last-Prize trade. Otherwise,
  // abandoning the only Active to self-KO can outright lose the match.
  const selfLoss=cfg.level>=4?selfKnockout*
   (p.bench.length===0?240:100)*(1-koChance*.8)*style.survival:0;
  return 150+direct*.9+135*koChance+riskPreference+statusValue-fixedCost-selfLoss;
 }
 if(type==='play_trainer'){
  const name=card(p.hand[v.handIndex])?.name||'';
  if(name==='Bill')return p.deckCount<=2?30:155+(p.handCount<=3?26:0);
  if(name==='Professor Oak'){
   if(p.deckCount<=1)return 10;
   // Discarding a full hand to draw seven cards is not always an upgrade.
   return p.handCount<=2?225:p.handCount<=4?172:cfg.level>=3?50:110;
  }
  if(name==='Gust of Wind'){
   const current=strongestAffordableAttack(p.active,q.active);
   const opponentAlreadyLethal=current>=hpRemaining(q.active)&&hpRemaining(q.active)>0;
   const vulnerable=q.bench.some(u=>{
    const damage=strongestAffordableAttack(p.active,u);
    return damage>=hpRemaining(u)&&hpRemaining(u)>0;
   });
   return (vulnerable&&!opponentAlreadyLethal?cfg.level>=3?275:205:40)*style.control;
  }
  if(name==='Super Energy Removal'){
   const enemy=Math.max(q.active?.energies?.length||0,...q.bench.map(x=>x.energies?.length||0));
   const ownCost=Math.min(p.active?.energies?.length||0,...p.bench.map(x=>x.energies?.length||0));
   return enemy>=2&&ownCost<=1?210*style.control:cfg.level>=3?48:140;
  }
  if(name==='Energy Removal')return (q.active?.energies?.length?200:140)*style.control;
  if(/Lass|Rocket|Scoop/i.test(name))return (q.active?.energies?.length?160:75)*style.control;
  if(name==='Pokémon Center'){
   const damaged=[p.active,...p.bench].filter(u=>u&&u.damage>=10);
   const healed=damaged.reduce((n,u)=>n+u.damage,0);
   const lost=damaged.reduce((n,u)=>n+(u.energies?.length||0),0);
   return cfg.level>=8?(healed*1.5-lost*65+110)*style.survival:
    (p.active?.damage||0)>=20?168*style.survival:40;
  }
  if(/Potion|Center|Heal/i.test(name))return (p.active?.damage||0)>=20?168*style.survival:40;
  if(name==='Switch')return p.active?.status?210*style.survival:55;
  if(/Search|Computer|Ball|Trader|Elm/i.test(name))return 130*style.setup;
  if(name==='PlusPower'){
   const damage=strongestAffordableAttack(p.active,q.active),needed=hpRemaining(q.active)-damage;
   // PlusPower only boosts an attack that can actually be paid for.
   // Preserve the card when the Active cannot attack this turn.
   return (damage>0&&needed>0&&needed<=10?300:
    cfg.level>=8&&damage<=0?-500:cfg.level>=3?45:118)*style.damage;
  }
  if(/Defender|Berry|Focus Band/i.test(name))return 115*style.survival;
  return 75;
 }
 if(type==='retreat'){
  const to=p.bench[v.slot],before=p.active;
  const gain=setupValue(to)-setupValue(before);
  // Expert profiles recognize when an incoming attack is likely to KO their
  // Active, but do not sacrifice an immediate winning attack to flee.
  const oldDamage=strongestAffordableAttack(before,q.active);
  const newDamage=strongestAffordableAttack(to,q.active);
  const lethalOwn=oldDamage>=hpRemaining(q.active)&&hpRemaining(q.active)>0;
  const counter=strongestAffordableAttack(q.active,before);
  const counterTo=strongestAffordableAttack(q.active,to);
  const threatened=counter>=hpRemaining(before)&&counter>0;
  const alternativeSurvives=counterTo<hpRemaining(to);
  // A defensive swap is useful only when it *actually* shelters the Active
  // from a visible affordable knockout. Avoid abandoning a ready attacker for
  // a Bench Pokémon that is equally easy to knock out.
  // Avoid perpetual KO-avoidance: fleeing costs Energy and concedes tempo.
  // A slightly threatened attacker should still trade damage if it can score
  // Prizes. Champion values the *quality* of a safe replacement over panic.
  const rescue=threatened&&alternativeSurvives?(cfg.level>=4?65:100)*style.survival:
   threatened&&!alternativeSurvives?-45:0;
  const foresight=cfg.level>=3?rescue-
   (lethalOwn?300:0)+(newDamage-oldDamage)*1.05-
   (newDamage===0&&oldDamage>0?70:0)-(oldDamage>0?oldDamage*.25:0):0;
  return (before.status?180:45)+(gain>0?Math.min(30,gain):0)+
   ((hpRemaining(before)<30)&&alternativeSurvives?23:0)*style.survival-
   (before.energies?.length||0)*18+foresight;
 }
 if(type==='use_power'){
  if(cfg.level===8){
   const unit=slotUnit(p,v.slot);
   const names=(card(unit?.id)?.abilities||[]).filter(a=>a.name).map(a=>a.name);
   if(names[v.powerIndex]==='Rain Dance'){
    const benefit=rainDanceOpportunity(o);
    return benefit>0?(150+benefit)*style.setup:0;
   }
  }
  return 85*style.setup;
 }
 if(type==='use_stadium')return 85;
 return 0;
}

// Deterministic two-step tactical forecast. This is NOT a rules simulation:
// it uses only the current player's visible hand, board, printed attack costs
// and probabilities, and never calls the reducer or reads an unrevealed card.
function projectedAttackValue(active,defender,turnSerial=0){
 if(!active||!defender||['Asleep','Paralyzed'].includes(active.status))return 0;
 const attacks=active.effectiveAttacks||card(active.id)?.attacks||[],pool=energyPool(active);
 const hp=hpRemaining(defender);
 let best=0;
 for(let i=0;i<attacks.length;i++){
  const attack=attacks[i];
  if(!ATTACK.compile(attack)||!canPayEnergy(attack.cost||[],pool))continue;
  if(active.amnesia?.index===i&&active.amnesia.expires>turnSerial)continue;
  if(active.gymAttackCooldown?.expires>turnSerial&&
    (active.gymAttackCooldown.index===null||active.gymAttackCooldown.index===i))continue;
  const dmg=estimatedDamage(attack,active,defender),ko=knockoutChance(attack,active,defender);
  const impact=Math.min(dmg,hp)*1.05+ko*115+
   (/Poison|Paraly|Sleep|Confus/i.test(attack.text||'')?10:0);
  best=Math.max(best,impact);
 }
 return best;
}
function prepBoard(o){
 return {active:o.self.active?{...o.self.active}:null,
  bench:o.self.bench.map(x=>({...x})),hand:[...(o.self.hand||[])],
  energyUsed:!!o.self.energyUsed};
}
function projectedPrep(board,action,round){
 const {type,payload}=action;
 if(!['attach_energy','evolve','bench'].includes(type))return null;
 const next={...board,active:board.active?{...board.active}:null,
  bench:board.bench.map(x=>({...x})),hand:[...board.hand]};
 const id=next.hand[payload.handIndex],c=card(id);
 if(!c)return null;
 const u=payload.slot===-1?next.active:next.bench[payload.slot];
 if(type==='attach_energy'){
  if(next.energyUsed||!u||!isEnergy(c))return null;
  u.energies=[...(u.energies||[]),id];
  next.energyUsed=true;
 }else if(type==='evolve'){
  if(!u||!canEvolve(c,card(u.id))||u.playedTurn>=round)return null;
  u.id=id;
  u.playedTurn=round;
 }else{
  if(!isBasicPokemon(c))return null;
  next.bench.push({id,damage:0,energies:[],status:null,playedTurn:round});
 }
 next.hand.splice(payload.handIndex,1);
 return next;
}
function bestOnePrep(board,o){
 let best=projectedAttackValue(board.active,o.opponent.active,o.turnSerial);
 for(let i=0;i<board.hand.length;i++){
  const c=card(board.hand[i]);if(!c)continue;
  if(isEnergy(c)&&!board.energyUsed&&board.active){
   const next=projectedPrep(board,command('attach_energy',{handIndex:i,slot:-1}),o.round);
   if(next)best=Math.max(best,projectedAttackValue(next.active,o.opponent.active,o.turnSerial));
  }
  if(c.evolvesFrom&&board.active&&canEvolve(c,card(board.active.id))&&
   board.active.playedTurn<o.round){
   const next=projectedPrep(board,command('evolve',{handIndex:i,slot:-1}),o.round);
   if(next)best=Math.max(best,projectedAttackValue(next.active,o.opponent.active,o.turnSerial));
  }
 }
 return best;
}
function planningBonus(action,o,cfg){
 if(!cfg.planning||o.phase!=='game'||!o.self.active)return 0;
 const before=prepBoard(o),after=projectedPrep(before,action,o.round);
 if(!after)return 0;
 const now=projectedAttackValue(before.active,o.opponent.active,o.turnSerial);
 const next=projectedAttackValue(after.active,o.opponent.active,o.turnSerial);
 const alone=bestOnePrep(before,o);
 const combo=bestOnePrep(after,o);
 // A full two-card sequence can open an attack that neither card alone could
 // enable. Reward that tempo without treating possible future card draws as known.
 const immediate=(next-now)*.50;
 const synergy=Math.max(0,combo-Math.max(next,alone))*.85;
 return Math.max(-45,Math.min(135,immediate+synergy))*cfg.style.damage;
}

function chooseAction(game,raw={},memo={}){
 const cfg=configuration(raw),o=observation(game,cfg.side);
 const used={trainers:memo.trainers||0,powers:memo.powers||0,powerKeys:memo.powerKeys||new Set(),stadium:!!memo.stadium};
 const actions=candidates(o,cfg,used);if(!actions.length)return null;
 // A strategic beam may award a long-term bonus to an Energy attachment
 // despite its immediate -1000 penalty. This is a strict sequencing guard,
 // not merely a heuristic: never spend the turn's attachment on a damaged
 // Pokémon while an unplayed Center is available to discard that Energy.
 const safeActions=cfg.level===8&&pokemonCenterPending(o)?
  actions.filter(a=>a.type!=='attach_energy'||!pokemonCenterEnergyWaste(o,a.payload.slot)):
  actions;
 if(!safeActions.length)return null;
 const random=rng(cfg.seed+game.turnSerial*7919+(game.events?.length||0)*17011+cfg.side*31);
 const ranked=safeActions.map((action,i)=>({action,
  score:score(action,o,cfg,used)+planningBonus(action,o,cfg)+prizeRaceBonus(action,o,cfg)+knockoutTempoBonus(action,o,cfg)+opponentResponseBonus(action,o,cfg)+energyHorizonBonus(action,o,cfg),tie:i}))
  .sort((a,b)=>b.score-a.score||a.tie-b.tie);
 // Rank all visible options before competence-sensitive choice noise. A larger
 // *evaluation budget* should NOT widen the random window: doing so previously
 // made mid-level players less competent than beginners. Beginner is allowed
 // to overlook the best move; Champion deterministically chooses its best.
 const helpers={
  observation,candidates,score,projectedAttackValue,hpRemaining,card,strongestAffordableAttack,knockoutChance,
  energyPool,canPayEnergy,estimatedDamage,
  attackBonus:(action,board,config)=>planningBonus(action,board,config)+prizeRaceBonus(action,board,config)+
   knockoutTempoBonus(action,board,config)+opponentResponseBonus(action,board,config)+energyHorizonBonus(action,board,config)
 };
 // The longer adversarial beam search is experimental at Level 8 only.
 // RPG Mastermind (Level 7) retains its calibrated decision path.
 const deep=cfg.level===8?require('./cpu_strategic_search').rankWithStrategicSearch(game,cfg,used,ranked,helpers):
  cfg.level>=6?require('./cpu_lookahead').rankWithLookahead(game,cfg,used,ranked,helpers):{ranked,nodes:0};
 const strategic=deep.ranked;
 const shortlist=strategic.slice(0,cfg.skill.sampleWindow);
 const temp=cfg.skill.temperature,ordered=temp===0?shortlist:[...shortlist].map(x=>({...x,priority:x.score+Math.log(-Math.log(Math.max(1e-12,random())))*-temp}))
  .sort((a,b)=>b.priority-a.priority||a.tie-b.tie);
 // The result of each probe is intentionally opaque to the scorer. In
 // particular a previewed random coin result is never used to rank actions.
 let probedCandidates=0,rejectedCandidates=0;
 for(const item of [...ordered,...strategic.slice(cfg.skill.sampleWindow)]){
  probedCandidates++;
  const result=reduce(game,cfg.side,item.action);
  if(result.ok)return {command:item.action,game:result.game,score:item.score,alternatives:ranked.length,
   probedCandidates,rejectedCandidates,searchNodes:deep.nodes,
   ...(raw.diagnostics===true?{searchDiagnostics:{
    rootsAvailable:deep.rootsAvailable||0,
    rootsVisited:deep.rootsVisited||0,
    rootDiagnostics:deep.rootDiagnostics||[],
    elapsedMs:deep.elapsedMs||0
   }}:{})};
  rejectedCandidates++;
 }
 return null;
}
function driveSide(initial,{side=1,level=3,personality='balanced',seed=1,planning,evolutionTempo,prizeRace,knockoutTempo,opponentResponse,graduatedNoise,energyHorizon,limit=200,onStep=null,onDecision=null}={}){
 let game=initial,steps=0;const commands=[],memo={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 while(!game.over&&steps<limit){
  const beforeTurn=game.turnSerial;
  const started=onDecision?performance.now():0;
  const next=chooseAction(game,{side,level,personality,seed,planning,evolutionTempo,prizeRace,knockoutTempo,opponentResponse,graduatedNoise,energyHorizon},memo);
  if(!next){
   if(game.pendingDecision?.actor===side)throw Error('CPU unresolved choice: '+JSON.stringify({decision:game.pendingDecision,pendingAction:game.pendingAction}));
   break;
  }
  if(onDecision)onDecision(performance.now()-started,next.command);
  const a=next.command,signature=a.type+':'+JSON.stringify(a.payload);
  if(a.type==='play_trainer')memo.trainers++;
  if(a.type==='use_power'){memo.powers++;memo.powerKeys.add(a.payload.slot+':'+a.payload.powerIndex);}
  if(a.type==='use_stadium')memo.stadium=true;
  commands.push({side,command:a,score:next.score,alternatives:next.alternatives,
   probedCandidates:next.probedCandidates,rejectedCandidates:next.rejectedCandidates,searchNodes:next.searchNodes||0});
  game=next.game;steps++;
  if(onStep)onStep(game,a,steps);
  if(beforeTurn!==game.turnSerial){memo.trainers=0;memo.powers=0;memo.powerKeys.clear();memo.stadium=false;}
  if(a.type==='end_turn'&&game.turn===side&&!game.pendingDecision&&!game.over)throw Error('CPU did not advance turn');
 }
 if(steps===limit&&!game.over&&(game.turn===side||game.pendingDecision?.actor===side||game.phase==='setup'&&(!game.setupReady[side]||game.mulliganBonus?.side===side)))throw Error('CPU step budget exhausted');
 return {game,steps,commands};
}
function driveBot(game,limit=200,config={}){return driveSide(game,{...config,side:1,limit});}
function propose(game,config={}){return chooseAction(game,{...config,side:1});}
module.exports={SKILLS,CALIBRATED_SKILLS,PERSONALITIES,configuration,observation,trainerOpportunity,candidates,score,knockoutChance,planningBonus,evolutionTempoPenalty,prizeRaceBonus,knockoutTempoBonus,opponentResponseBonus,energyHorizonBonus,chooseAction,driveSide,driveBot,propose};
