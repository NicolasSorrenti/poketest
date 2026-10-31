'use strict';
// CPU policy reads only the same projected information that a player may see.
// The authoritative reducer is used for legality and execution, never as a
// future-outcome oracle (in particular it cannot peek at upcoming coin flips).
const {performance}=require('node:perf_hooks');
const {reduce,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {isBasicPokemon,isEnergy,canEvolve,canPayEnergy,legalAttachment}=require('./core_rules');
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
function estimatedDamage(attack,attacker,defender,benchCount=null){
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
 // Compiled bench-count effects (including Do the Wave) scale with the
 // attacker's public Bench, never the defender's Bench or an invented future Bench.
 else if(program?.kind==='bench-count'&&Number.isInteger(benchCount)&&benchCount>=0)
    amount=program.base+program.factor*benchCount;
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
function knockoutChance(attack,attacker,defender,benchCount=null){
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
 const expected=estimatedDamage(attack,attacker,defender,benchCount);
 const coin=/flip (?:a |one |\\d+ )?coins?|heads|tails/i.test(attack.text||'');
 return expected>=hp?(coin&&program?.kind!=='coin-status'?.5:1):0;
}
function strongestAffordableAttack(unit,defender,benchCount=null){
 if(!unit||!defender)return 0;
 const attacks=(unit.effectiveAttacks||card(unit.id)?.attacks||[]);
 const pool=energyPool(unit);
 return attacks.reduce((best,attack)=>canPayEnergy(attack.cost||[],pool)?
  Math.max(best,estimatedDamage(attack,unit,defender,benchCount)):best,0);
}
function damageAfterAttachment(unit,energyId,defender,benchCount=null){
 if(!unit||!defender)return 0;
 const pool=[...energyPool(unit),...energyPool({energies:[energyId]})];
 const attacks=unit.effectiveAttacks||card(unit.id)?.attacks||[];
 return attacks.reduce((best,a)=>canPayEnergy(a.cost||[],pool)?
  Math.max(best,estimatedDamage(a,unit,defender,benchCount)):best,0);
}
// A public opponent attack can be paid for but temporarily unusable (Sleep,
// Paralysis, Amnesia or a Gym attack cooldown). Do not flee from an attack
// that cannot be declared on the visible board. This is not a future oracle.
function strongestUsableOpponentAttack(o,defender){
 const enemy=o.opponent.active;
 if(!enemy||!defender)return 0;
 const fromEnemy={...o,self:o.opponent,opponent:o.self};
 const moves=enemy.effectiveAttacks||card(enemy.id)?.attacks||[];
 return moves.reduce((best,attack,index)=>
  eligibleAttack(fromEnemy,enemy,attack,index)&&
  canPayEnergy(attack.cost||[],energyPool(enemy))?
   Math.max(best,estimatedDamage(attack,enemy,defender,o.opponent.bench.length)):best,0);
}
// A printed KO is not a likely KO when the opponent must first pass
// Confusion or an attack-specific coin flip. Use the same conservative
// 75% threshold as Apex's stranded-Energy analysis.
function likelyOpponentKnockout(o,defender){
 const enemy=o.opponent.active;
 if(!enemy||!defender||['Asleep','Paralyzed'].includes(enemy.status))return false;
 const fromEnemy={...o,self:o.opponent,opponent:o.self};
 const confusionChance=enemy.status==='Confused'?.5:1;
 return (enemy.effectiveAttacks||card(enemy.id)?.attacks||[]).some((attack,index)=>
  eligibleAttack(fromEnemy,enemy,attack,index)&&
  canPayEnergy(attack.cost||[],energyPool(enemy))&&
  knockoutChance(attack,enemy,defender,o.opponent.bench.length)*confusionChance>=.75);
}
function hpRemaining(u){return Math.max(0,(Number(card(u?.id)?.hp)||60)-(u?.damage||0));}
function setupValue(unit){
 const c=card(unit?.id);
 const attacks=c?.attacks||[];
 return (Number(c?.hp)||40)*.3+Math.max(0,30-Math.min(...attacks.map(a=>(a.cost||[]).length),5)*10)+attacks.length*4;
}
function openingReadiness(cardId,hand){
 const pokemon=card(cardId),moves=pokemon?.attacks||[];
 // An opening Energy must be attachable to the selected Active. Miracle
 // Energy cannot power an ordinary Basic even if its symbols match a cost.
 const unit={id:cardId,energies:[]};
 const energies=hand.filter(id=>{
  const energy=card(id);
  return isEnergy(energy)&&legalAttachment({card:energy,unit,
   cardName:pokemon?.name||''});
 });
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
 // Both searches require two OTHER cards to pay their mandatory cost.
 // Item Finder may recover a Trainer discarded as payment, even when the
 // discard pile has no Trainers yet. Count the Item Finder being played as
 // one of the hand's Trainers; another must be available to pay the cost.
 if(name==='Item Finder')return p.hand.length>=3&&(
  (p.discard||[]).some(id=>card(id)?.supertype==='Trainer')||
  p.hand.filter(id=>card(id)?.supertype==='Trainer').length>=2);
 if(name==='Computer Search')return p.hand.length>=3&&p.deckCount>0;
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
  if(!p.energyUsed&&isEnergy(c))for(const slot of slots(p)){
   const target=slotUnit(p,slot);
   // Exclude Energy placements that the authoritative reducer rejects.
   // Otherwise the Apex attack-ordering guard may suppress a legal attack
   // in favor of a completely impossible attachment.
   if(target&&!(target.energyAttachBlockSerial>o.turnSerial)&&
      !(cfg.level===8&&c.name==='Rainbow Energy'&&hpRemaining(target)<=10)&&
      legalAttachment({card:c,unit:target,round:o.round,energyUsed:p.energyUsed,
       cardName:card(target.id)?.name||''}))
    options.push(command('attach_energy',{handIndex:i,slot}));
  }
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
function energyDenialValue(unit,defender,isActive,benchCount=null){
 if(!unit||!unit.energies?.length)return -100;
 const before=strongestAffordableAttack(unit,defender,benchCount);
 const future=(unit.effectiveAttacks||card(unit.id)?.attacks||[]).reduce((max,a)=>
  Math.max(max,(a.cost||[]).length),0);
 let denied=0;
 for(let i=0;i<unit.energies.length;i++){
  const after={...unit,energies:unit.energies.filter((_,j)=>j!==i)};
  const remaining=strongestAffordableAttack(after,defender,benchCount);
  denied=Math.max(denied,Math.max(0,before-remaining)+
   ((before>=hpRemaining(defender)&&remaining<hpRemaining(defender))?100:0));
 }
 const ready=before>0?28:0;
 const potential=Math.min(15,future*4);
 return (isActive?1.3:.7)*(denied+ready+potential)+(isActive?32:0);
}
function energyRemovalChoiceValue(unit,defender,energyIndex,enemy,benchCount=null){
 if(!unit||!unit.energies?.[energyIndex])return 0;
 const before=strongestAffordableAttack(unit,defender,benchCount);
 const after={...unit,energies:unit.energies.filter((_,i)=>i!==energyIndex)};
 const remaining=strongestAffordableAttack(after,defender,benchCount);
 const denied=Math.max(0,before-remaining);
 const removed=energyPool({energies:[unit.energies[energyIndex]]}).length;
 const preventedKO=before>=hpRemaining(defender)&&remaining<hpRemaining(defender);
 const control=denied*2+(preventedKO?130:0)+removed*7;
 return enemy?control:-control;
}
// Apex: Rain Dance is a free, repeatable Water Energy attachment, not a
// generic 85-point Power. The target valuation uses only our visible hand,
// public cards, and presently affordable attacks; it never samples deck draws.
function rainDanceTargetValue(unit,waterId,enemy,benchCount=null){
 if(!unit||!enemy||!waterId)return -100;
 const before=strongestAffordableAttack(unit,enemy,benchCount);
 const after=damageAfterAttachment(unit,waterId,enemy,benchCount);
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
   rainDanceTargetValue(unit,waterId,o.opponent.active,o.self.bench.length):-100;
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
  return rainDanceTargetValue(unit,energy,o.opponent.active,o.self.bench.length);
 }
 if(/^prize:/.test(id))return 1;
 if(/^n:\d+$/.test(id)&&cfg?.level>=3){
  const index=Number(id.slice(2));
  if(/^Choose opposing Energy to discard$/i.test(ctx)&&o.pendingTrainerTarget!==null){
   const unit=slotUnit(o.opponent,o.pendingTrainerTarget);
   return energyRemovalChoiceValue(unit,o.self.active,index,true,
     o.opponent.bench.length);
  }
  if(/^Discard one of your attached Energy$/i.test(ctx)&&o.pendingTrainerSource!==null){
   const unit=slotUnit(o.self,o.pendingTrainerSource);
   return energyRemovalChoiceValue(unit,o.opponent.active,index,false,
     o.self.bench.length);
  }
 }
 if(/^count:/.test(id))return /draw/i.test(ctx)?Number(id.slice(6))*20:0;
 if(/^energy:/.test(id)&&/discard|retreat|pay/i.test(ctx))return /Double Colorless|Rainbow/i.test(label)?-15:10;
 if(/^bench:/.test(id)||/^slot:/.test(id)){
  const n=Number(id.split(':')[1]),own=/your|friendly|own|promot|receiv|retreat/i.test(ctx)&&!/opponent|opposing|enemy/i.test(ctx);
  const target=slotUnit(own?o.self:o.opponent,n);
  if(!target)return 0;
  if(cfg?.level>=3&&/^slot:/.test(id)&&/^Choose opposing Pokémon$/i.test(ctx))
   return energyDenialValue(target,o.self.active,n===-1,
     n===-1?o.opponent.bench.length:Math.max(0,o.opponent.bench.length-1));
  if(/promot|retreat|switch.*your/i.test(ctx)){
   const damage=strongestAffordableAttack(target,o.opponent.active,
     Math.max(0,o.self.bench.length-1));
   const incoming=strongestAffordableAttack(o.opponent.active,target,o.opponent.bench.length);
   const survives=hpRemaining(target)>incoming;
   // Pick a ready attacker that can survive the public opposing Active, not
   // whichever Bench Pokémon appears largest or needs imaginary Fighting Energy.
   return setupValue(target)*.5+damage*1.6+hpRemaining(target)*.4+
    (damage>=hpRemaining(o.opponent.active)&&hpRemaining(o.opponent.active)>0?125:0)+
    (survives?32:-65);
  }
  if(/damage|attack|gust|opposing|opponent/i.test(ctx)){
   const damage=strongestAffordableAttack(o.self.active,target,o.self.bench.length);
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
  if(candidate&&isEnergy(candidate)&&o.self.active){
   const active=o.self.active;
   // Computer Search is choosing an Energy, not attaching it yet. Do not
   // reward a Rainbow Energy as an immediate attack unlock when its 10 damage
   // would knock out the Active before it can attack. A surviving Bench target
   // can still make Rainbow a useful search result.
   if(candidate.name==='Rainbow Energy'&&hpRemaining(active)<=10){
    const benchProgress=Math.max(0,...(o.self.bench||[]).filter(unit=>
     hpRemaining(unit)>10&&legalAttachment({card:candidate,unit,round:o.round,
      cardName:card(unit.id)?.name||''})).map(unit=>energyValue(unit,candidateId)));
    return benchProgress>12?55+Math.min(110,benchProgress*1.5):-200;
   }
   // Search results must be attachable to the intended attacker. In
   // particular, Miracle Energy cannot power an ordinary Pokémon.
   const attachable=legalAttachment({card:candidate,unit:active,round:o.round,
    cardName:card(active.id)?.name||''});
   if(attachable){
    if(!o.self.energyUsed&&o.opponent.active){
     const before=strongestAffordableAttack(active,o.opponent.active,o.self.bench.length);
     const after=damageAfterAttachment(active,candidateId,o.opponent.active,o.self.bench.length);
     if(before===0&&after>0)return 1000+after;
     if(after>before)return 450+after;
    }
    // A two- or three-attachment attacker still needs its first Energy.
    // Previously these searches scored just 20, below an unrelated Basic
    // Pokémon (40), even with no Energy in hand and no affordable attack.
    const progress=energyValue(active,candidateId);
    if(progress>12){
     const hasEnergyInHand=(o.self.hand||[]).some(handId=>
      isEnergy(card(handId))&&legalAttachment({card:card(handId),unit:active,
       round:o.round,cardName:card(active.id)?.name||''})&&
      energyValue(active,handId)>12);
     return 55+Math.min(110,progress*1.5)+(hasEnergyInHand?0:55);
    }
   }
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
 // Evolution replaces copied Active attacks; retain legacy behavior for
 // lower levels while correcting Apex's hypothetical promoted form.
 if(cfg.level===8)delete after.effectiveAttacks;
 const current=strongestAffordableAttack(before,o.opponent.active,o.self.bench.length);
 if(current<=0)return 0;
 // An evolution must not trade away a certain match-winning attack, even
 // when its extra HP would otherwise make the Active safer. The normal
 // refuel exception below is not worth spending Energy before a free win.
 // Evaluate only revealed attacks and attached Energy; never future draws.
 if(cfg.level===8&&(o.self.prizeCount===1||o.opponent.bench.length===0)&&
    !['Asleep','Paralyzed','Confused'].includes(before.status)){
  const certainKO=u=>(u.effectiveAttacks||card(u.id)?.attacks||[]).some((a,i)=>
   eligibleAttack(o,u,a,i)&&canPayEnergy(a.cost||[],energyPool(u))&&
   knockoutChance(a,u,o.opponent.active,o.self.bench.length)>=.999);
  if(certainKO(before)&&!certainKO(after))return 550;
 }
 const promoted=strongestAffordableAttack(after,o.opponent.active,o.self.bench.length);
 if(promoted>=current)return 0;
 // If one legal Energy attachment can restore a useful attack this turn,
 // evolution is not necessarily a tempo sacrifice.
 const canRefuel=!o.self.energyUsed&&o.self.hand.some(id=>
  isEnergy(card(id))&&legalAttachment({card:card(id),unit:after,
   round:o.round,cardName:nextCard.name||''})&&
  !(after.energyAttachBlockSerial>o.turnSerial)&&
  damageAfterAttachment(after,id,o.opponent.active,o.self.bench.length)>=current);
 if(canRefuel)return 0;
 const currentKO=current>=hpRemaining(o.opponent.active)&&hpRemaining(o.opponent.active)>0;
 const counterBefore=strongestAffordableAttack(o.opponent.active,before,o.opponent.bench.length);
 const counterAfter=strongestAffordableAttack(o.opponent.active,after,o.opponent.bench.length);
 const getsSafer=counterBefore>=hpRemaining(before)&&counterAfter<hpRemaining(after);
 // Safety (larger HP pool and curing a disabling status) can outweigh tempo.
 // Otherwise delaying evolution one turn preserves pressure on the Prize race.
 const isDisabled=['Asleep','Paralyzed'].includes(before.status);
 return getsSafer||isDisabled?0:
  Math.round((promoted===0?142:60)+(currentKO&&promoted<hpRemaining(o.opponent.active)?110:0));
}
// Conservative one-ply opponent response and visible Prize-race incentives.
// No reducer rollouts, opponent concealed hand, unknown future Energy or RNG.
// Apex may hold an evolution when it gains no immediate combat or survival
// benefit. Preserve future evolution options instead of promoting by default.
function prematureEvolutionPenalty(o,slot,evolutionId,cfg){
 if(cfg.level!==8||o.phase!=='game'||!o.opponent.active)return 0;
 const before=slotUnit(o.self,slot),next=card(evolutionId);
 if(!before||!next)return 0;
 // Evolution replaces the previous attack list; never project inherited moves.
 const after={...before,id:evolutionId};
 delete after.effectiveAttacks;
 const moves=next.attacks||[];
 const pool=energyPool(after);
 const enemy=o.opponent.active;
 const ready=moves.some((a,i)=>canPayEnergy(a.cost||[],pool)&&
  (slot!==-1||eligibleAttack(o,after,a,i)));
 const relevantEnergy=(o.self.hand||[]).filter(id=>isEnergy(card(id))&&
  legalAttachment({card:card(id),unit:after,round:o.round+1,
   cardName:next.name||''}));
 const nextTurnReady=moves.some(a=>relevantEnergy.some(id=>
  canPayEnergy(a.cost||[],[...pool,...energyPool({energies:[id]})])));
 // Waiting is generally better than evolving an uncharged Pokémon several
 // turns too early. Evolve once the new attacker can attack now or needs only
 // the next Energy attachment already visible in our own hand.
 if(ready||nextTurnReady)return 0;
 // Preserve a playable evolution before an imminent Professor Oak hand reset,
 // but never give up a currently stronger Active attack merely to save a card.
 const oakPending=(o.self.hand||[]).some(id=>card(id)?.name==='Professor Oak')&&
  o.self.hand.length<=4&&(o.self.deckCount??0)>2;
 if(oakPending&&(slot!==-1||
   projectedAttackValue(after,enemy,o.turnSerial,o.self.bench.length)>=
   projectedAttackValue(before,enemy,o.turnSerial,o.self.bench.length)))return 0;
 // Important survival and tactical exceptions outweigh waiting.
 if(slot===-1){
  if(likelyOpponentKnockout(o,before)&&!likelyOpponentKnockout(o,after))return 0;
  if(['Asleep','Paralyzed'].includes(before.status))return 0;
 }
 // Do not pretend to know a future forced discard or opponent's hand.
 // Trainer-driven hand disposal is evaluated separately when actually usable.
 return 255;
}
function prizeRaceBonus(action,o,cfg){
 if(!cfg.prizeRace||cfg.level<4||o.phase!=='game'||!o.self.active||!o.opponent.active)return 0;
 const own=o.self,enemy=o.opponent;
 const urgent=own.prizeCount===1||enemy.bench.length===0;
 if(action.type==='attack'){
  const moves=own.active.effectiveAttacks||card(own.active.id)?.attacks||[];
  const attack=moves[action.payload.attackIndex];if(!attack)return 0;
  // Confusion requires a separate heads flip before any attack resolves.
  // Discount Prize-race urgency just as knockout tempo does; otherwise Apex
  // still treats a speculative final Prize as guaranteed in this scorer.
  const confusionChance=own.active.status==='Confused'?.5:1;
  const ko=knockoutChance(attack,own.active,enemy.active,own.bench.length)*confusionChance;
  // An actual knockout that takes our final Prize or eliminates their last
  // Pokémon must dominate speculative development, retreat or Trainer play.
  const victory=urgent?550*ko:0;
  // A printed lethal attack is not a next-turn loss when the opponent
  // cannot declare it (Sleep, Paralysis, Amnesia or Gym cooldown), or when
  // Confusion/attack flips make the knockout unreliable. Only public state
  // is inspected; this is the same conservative threat test used elsewhere.
  const theirWin=enemy.prizeCount===1&&likelyOpponentKnockout(o,own.active);
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
  const outgoing=strongestAffordableAttack(enemy.active,old,enemy.bench.length);
  const incoming=strongestAffordableAttack(enemy.active,alternate,enemy.bench.length);
  const deadly=outgoing>=hpRemaining(old)&&outgoing>0;
  const escape=incoming<hpRemaining(alternate);
  const myKO=strongestAffordableAttack(old,enemy.active,own.bench.length)>=hpRemaining(enemy.active);
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
 const now=strongestAffordableAttack(q.active,attacker,q.bench.length);
 const after=strongestAffordableAttack(q.active,next,q.bench.length);
 const threat=now>=hpRemaining(attacker)&&now>0;
 if(!threat||after>=hpRemaining(next))return 0;
 const currentKO=(attacker.effectiveAttacks||card(attacker.id)?.attacks||[])
  .some(a=>canPayEnergy(a.cost||[],energyPool(attacker))&&knockoutChance(a,attacker,q.active,p.bench.length)>=.75);
 if(currentKO)return 0;
 const replacement=strongestAffordableAttack(next,q.active,p.bench.length);
 if(!replacement)return 0; // Do not flee into a passive Bench that cannot defend itself.
 const lostEnergy=Math.min(attacker.energies?.length||0,(card(attacker.id)?.retreatCost||[]).length);
 const advantage=Math.max(0,replacement-strongestAffordableAttack(attacker,q.active,p.bench.length))*.25;
 return Math.max(0,270+advantage-lostEnergy*22)*cfg.style.survival;
}
function knockoutTempoBonus(a,o,cfg){
 if(!cfg.knockoutTempo||cfg.level<4||o.phase!=='game'||!o.self.active||!o.opponent.active)return 0;
 if(a.type!=='attack')return 0;
 const p=o.self,q=o.opponent;
 const atk=(p.active.effectiveAttacks||card(p.active.id)?.attacks||[])[a.payload.attackIndex];
 if(!atk)return 0;
 // A Confused attacker must pass its own coin flip before the printed
 // attack can resolve. This is independent of any attack-specific flips.
 const confusionChance=p.active.status==='Confused'?.5:1;
 const chance=knockoutChance(atk,p.active,q.active,p.bench.length)*confusionChance;
 if(!chance)return 0;
 const lastPrize=p.prizeCount===1,lastOpponent=q.bench.length===0;
 if(lastPrize||lastOpponent)return 550*chance;
 // If attacking would strand us with zero Pokémon after the counter-KO, build
 // backup first, except when this KO wins outright.
 if(!p.bench.length&&p.hand.some(id=>isBasicPokemon(card(id))))return 0;
 // Don't spend a turn in endless preparation when a certain Prize is available.
 // Apex must not award a higher attack-tempo bonus for an imaginary
 // counter-KO. Confusion, attack flips, Amnesia and Gym locks all affect
 // whether the opponent can actually take the next Prize.
 const vulnerability=cfg.level===8?likelyOpponentKnockout(o,p.active):
  !['Asleep','Paralyzed'].includes(q.active.status)&&
  strongestAffordableAttack(q.active,p.active,q.bench.length)>=hpRemaining(p.active);
 return chance*(vulnerability?230:125);
}
// Estimate what additional cards ALREADY in the player's own hand could unlock
// after the current Energy attachment. No future draw is assumed, no opponent
// hidden cards are accessed, and no engine reducer/coin oracle is consulted.
function horizonAttackValue(unit,defender,hand,remaining=1,futureRound=0,turnSerial=0,benchCount=null){
 if(!unit||!defender)return 0;
 const immediate=projectedAttackValue(unit,defender,turnSerial,benchCount);
 if(remaining===0)return immediate;
 // Paralysis expires at the end of the affected turn; unlike Sleep, recovery
 // is guaranteed by our next turn. Do not treat it as a permanent attack lock.
 // Miracle Energy expires at the end of its owner's turn, so do not
 // carry it into a future attack forecast.
 const nextTurnUnit={...unit,
  ...(unit.status==='Paralyzed'?{status:null}:{}),
  energies:(unit.energies||[]).filter(id=>card(id)?.name!=='Miracle Energy')};
 const recovered=unit.status==='Paralyzed'?
  projectedAttackValue(nextTurnUnit,defender,turnSerial+2,benchCount)*.48:0;
 const seen=new Set();
 let best=Math.max(immediate,recovered);
 for(const id of hand){
  const energy=card(id);
  // Forecast only Energy the attacker can legally receive next turn.
  // Miracle Energy must not create imaginary two-turn attack lines.
  if(seen.has(id)||!isEnergy(energy)||!legalAttachment({card:energy,unit:nextTurnUnit,
   round:futureRound,cardName:card(unit.id)?.name||''}))continue;
  // Rainbow Energy deals 10 damage when attached. A forecast that knocks
  // out its own attacker cannot unlock a next-turn attack. Nonlethal damage
  // still matters for counter-based attacks such as Flail.
  const rainbowDamage=energy.name==='Rainbow Energy'?10:0;
  if(rainbowDamage>=hpRemaining(unit))continue;
  seen.add(id);
  const after={...nextTurnUnit,damage:(nextTurnUnit.damage||0)+rainbowDamage,
   // Forecast from the post-expiry Energy pool: Miracle Energy is discarded.
   energies:[...(nextTurnUnit.energies||[]),id]};
  // A card requires another turn's Energy attachment. Discount those future
  // outcomes to avoid preferring a speculative combination to today's KO.
  // Next attachment is on our next turn, after the opponent's turn.
  // Public Amnesia/Gym cooldowns may have expired by then.
  const next=projectedAttackValue(after,defender,turnSerial+2,benchCount);
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
 // Rainbow Energy damages its host immediately, including in two-turn forecasts.
 const rainbowDamage=card(attachedId)?.name==='Rainbow Energy'?10:0;
 if(rainbowDamage>=hpRemaining(u))return 0;
 // Match the reducer: Full Heal Energy cures Special Conditions on
 // attachment, so a sleeping/paralyzed Active can attack immediately.
 // Forecasting the Energy without its cure undervalues this legal line.
 const fullHeal=card(attachedId)?.name==='Full Heal Energy';
 const after={...u,damage:(u.damage||0)+rainbowDamage,
  ...(fullHeal?{status:null}:{}),
  energies:[...(u.energies||[]),attachedId]};
 const futureHand=p.hand.filter((_,i)=>i!==v.handIndex);
 const futureRound=(Number(o.round)||0)+1;
 // Defaulting to serial zero makes expired public locks look active.
 const before=horizonAttackValue(u,q.active,futureHand,1,futureRound,o.turnSerial,p.bench.length);
 const changed=horizonAttackValue(after,q.active,futureHand,1,futureRound,o.turnSerial,p.bench.length);
 const direct=projectedAttackValue(after,q.active,o.turnSerial,p.bench.length)-
  projectedAttackValue(u,q.active,o.turnSerial,p.bench.length);
 // Reward immediate Energy unlocks, but value two-card lines only insofar as
 // they are possible with cards that are ALREADY visible in our own hand.
 const expected=Math.max(0,changed-before)*1.15+Math.max(0,direct)*.35;
 // A doomed Active should not earn speculative next-turn attack value.
 if(v.slot===-1&&doomedActiveAttachmentPenalty(o,attachedId,cfg)>0)return 0;
 // Bench replacement urgency depends on the exposed Active, not the Bench
 // target of this attachment. Comparing against u made a fragile Bench look
 // urgent while ignoring an Active that was about to be knocked out.
 // For Apex, only a currently legal public attack makes our Active exposed.
 // Amnesia and Gym locks must not cause speculative Bench Energy urgency.
 // Keep the previous affordable-attack estimate for lower difficulty tiers.
 const activeExposed=!!p.active&&(cfg.level===8?
  likelyOpponentKnockout(o,p.active):
  !['Asleep','Paralyzed'].includes(q.active.status)&&
  strongestAffordableAttack(q.active,p.active,q.bench.length)>=hpRemaining(p.active));
 // A Bench attacker is useful as a replacement when the Active is visibly
 // exposed. Otherwise minimize speculative Energy sunk on remote Bench.
 const activeBias=v.slot===-1?35:activeExposed?22:-34;
 const weakDefense=activeExposed&&v.slot===-1&&p.bench.length>0?-30:0;
 const surplus=direct===0&&changed-before<=1?-35:0;
 return Math.max(-85,Math.min(160,expected+activeBias+weakDefense+surplus))*cfg.style.setup;
}
// Avoid investing the only turn attachment in an Active that is publicly
// facing a likely knockout before its next attack. A useful Bench investment
// preserves tempo, but never override an attack unlocked now or an attachment
// that enables retreat. No opponent hand or future draw is inspected.
// A forced attachment is not productive when the Active is about to be KO'd,
// gains no attack this turn, and cannot escape using that Energy. Keep this
// independent of Bench availability: holding the Energy is also an option.
function strandedActiveEnergy(o,energyId){
 const active=o.self.active,enemy=o.opponent.active,energy=card(energyId);
 if(!active||!enemy||!isEnergy(energy)||['Asleep','Paralyzed'].includes(enemy.status))return false;
 const incoming=enemy.effectiveAttacks||card(enemy.id)?.attacks||[];
 // Only publicly usable opposing attacks count (Amnesia, cooldown, once-use).
 const fromEnemy={...o,self:o.opponent,opponent:o.self};
 // A Confused attacker must win its mandatory coin flip before any attack
 // resolves. Even a printed certain KO is only a 50% threat, below this
 // conservative 75% doomed-Active threshold (no future RNG is inspected).
 const confusionChance=enemy.status==='Confused'?.5:1;
 if(!incoming.some((a,i)=>eligibleAttack(fromEnemy,enemy,a,i)&&
    knockoutChance(a,enemy,active,o.opponent.bench.length)*confusionChance>=.75))return false;
 const after={...active,energies:[...(active.energies||[]),energyId]};
 if(projectedAttackValue(after,enemy,o.turnSerial,o.self.bench.length)>
    projectedAttackValue(active,enemy,o.turnSerial,o.self.bench.length))return false;
 const retreat=card(active.id)?.retreatCost||[];
 if(!o.self.retreated&&!['Asleep','Paralyzed'].includes(active.status)&&
    retreat.length&&!canPayEnergy(retreat,energyPool(active))&&
    canPayEnergy(retreat,energyPool(after)))return false;
 return true;
}
function doomedActiveAttachmentPenalty(o,energyId,cfg){
 if(cfg.level<7||o.phase!=='game'||!o.self.active||!o.opponent.active||
    o.self.energyUsed||!o.self.bench?.length||!strandedActiveEnergy(o,energyId))return 0;
 const energy=card(energyId);
 const usefulBench=o.self.bench.some(unit=>
  !(unit.energyAttachBlockSerial>o.turnSerial)&&
  legalAttachment({card:energy,unit,round:o.round,cardName:card(unit.id)?.name||''})&&
  energyValue(unit,energyId)>0);
 return usefulBench?140*cfg.style.survival:0;
}
// Pokémon Center heals the whole team but discards Energy from each healed
// Pokémon. Preserve attachments until after the heal, including Energy in
// hand that would otherwise be thrown away in the same turn.
function pokemonCenterPending(o,cfg,used){
 // Do not block the turn's Energy attachment for a Center that cannot be
 // played: Apex has a finite Trainer-action budget per turn.
 if((used?.trainers||0)>=cfg.skill.trainers||
    !(o.self.hand||[]).some(id=>card(id)?.name==='Pokémon Center'))return false;
 const damaged=[o.self.active,...o.self.bench].filter(u=>u&&u.damage>=10);
 const healed=damaged.reduce((n,u)=>n+u.damage,0);
 const lost=damaged.reduce((n,u)=>n+(u.energies?.length||0),0);
 // Match Center's existing resource-aware score; a small heal that discards
 // valuable Energy is not worth holding back our only attachment for.
 return damaged.length>0&&(healed*1.5-lost*65+110)*cfg.style.survival>175;
}
function pokemonCenterEnergyWaste(o,slot,cfg,used){
 const u=slotUnit(o.self,slot);
 return !!(u&&u.damage>=10&&pokemonCenterPending(o,cfg,used));
}
function centerSafeActions(o,cfg,used,actions){
 // Keep the decision-quality audit aligned with the exact sequencing
 // constraint applied to Apex's real action planner.
 if(cfg.level!==8||!pokemonCenterPending(o,cfg,used))return actions;
 return actions.filter(a=>a.type!=='attach_energy'||
  !pokemonCenterEnergyWaste(o,a.payload.slot,cfg,used));
}
// Evaluate a possible replacement against the opponent's *revealed* Active.
// An unequipped Basic is not a ready attacker, and its weakness/HP matters.
function benchMatchupValue(pokemonId,o){
 const candidate={id:pokemonId,energies:[],damage:0,status:null};
 const enemy=o.opponent.active;
 if(!enemy)return 0;
 const incoming=strongestAffordableAttack(enemy,candidate,o.opponent.bench.length);
 const hp=hpRemaining(candidate);
 const canBeKnockedOut=incoming>0&&incoming>=hp;
 // A newly benched Pokémon can use only an Energy attachment that is
 // still available this turn and legal for that specific Pokémon.
 // Miracle Energy on a non-Light Pokémon must not inflate Bench readiness.
 const ownCard=card(pokemonId);
 const handEnergies=o.self.hand.filter(id=>{
  const energy=card(id);
  return isEnergy(energy)&&legalAttachment({card:energy,unit:candidate,
   energyUsed:o.self.energyUsed,round:o.round,cardName:ownCard?.name||''});
 });
 const immediate=handEnergies.reduce((best,id)=>
  Math.max(best,damageAfterAttachment(candidate,id,enemy,o.self.bench.length)),0);
 const weakType=(ownCard?.weaknesses||[]).some(w=>
  (card(enemy.id)?.types||[]).includes(w.type));
 return (canBeKnockedOut?-175:0)+(weakType?-45:0)+
  Math.min(80,immediate*.6)+(handEnergies.length===0?-20:0);
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
   setupValue({id:p.hand[v.handIndex]})*.32*style.setup+
   (cfg.level>=8?benchMatchupValue(p.hand[v.handIndex],o):0);
 }
 if(type==='evolve'){
  const target=slotUnit(p,v.slot),after=card(p.hand[v.handIndex]);
  return 165*style.setup+(Number(after?.hp)||0)*.35+((v.slot===-1)?15:0)-
   (target?.damage||0)*.1-evolutionTempoPenalty(o,v.slot,p.hand[v.handIndex],cfg)-
   prematureEvolutionPenalty(o,v.slot,p.hand[v.handIndex],cfg);
 }
 if(type==='attach_energy'){
  const unit=slotUnit(p,v.slot),value=energyValue(unit,p.hand[v.handIndex]);
  // This attachment will be discarded if Center heals its target later.
  // Penalize it enough to force the zero-cost heal first; a follow-up
  // attachment is then evaluated normally against the healed board.
  if(cfg.level>=8&&pokemonCenterEnergyWaste(o,v.slot,cfg,used))return -1000;
  if(cfg.level===1)return 110+value*style.setup+(v.slot===-1?20:0);
  // One-step public-state projection: evaluate the attacks unlocked by the
  // Energy without calling reduce() to peek at future flips or hidden cards.
  const before=strongestAffordableAttack(unit,q.active,p.bench.length);
  const after=damageAfterAttachment(unit,p.hand[v.handIndex],q.active,p.bench.length);
  const improvement=Math.max(0,after-before);
  const ko=after>=hpRemaining(q.active)&&before<hpRemaining(q.active);
  const future=(improvement*(cfg.level===2?.50:.85)+(ko?(cfg.level===2?30:65):0))*style.damage;
  const saturation=before>0&&improvement===0?(cfg.level===2?14:35):0;
  // Full Heal Energy clears conditions as soon as it is attached. A ready
  // Asleep/Paralyzed Active can then attack this turn, while curing Confusion
  // removes the mandatory failure coin flip. Only reward a legal, payable
  // attack after the cure; Bench attachments cannot cure the Active.
  const curesActive=cfg.level===8&&v.slot===-1&&
   card(p.hand[v.handIndex])?.name==='Full Heal Energy'&&
   ['Asleep','Paralyzed','Confused'].includes(unit?.status);
  const cured=curesActive?{...unit,status:null,
   energies:[...(unit.energies||[]),p.hand[v.handIndex]]}:null;
  const cureTempo=cured&&projectedAttackValue(cured,q.active,o.turnSerial,p.bench.length)>0?
   (unit.status==='Confused'?90:185)*style.damage:0;
  // Potion Energy heals one damage counter on attachment. Reward real healing
  // modestly, and give Apex a larger survival incentive only when that heal
  // turns a publicly likely opponent knockout into a non-knockout. The latter
  // uses the same legal-attack/coin-risk guard as other Apex rescue decisions.
  // No future draw, hidden card or lower difficulty behavior is consulted.
  const potionHeal=cfg.level===8&&card(p.hand[v.handIndex])?.name==='Potion Energy'&&
   (unit?.damage||0)>0;
  const healed=potionHeal?{...unit,damage:Math.max(0,unit.damage-10)}:null;
  const preventsKo=healed&&v.slot===-1&&likelyOpponentKnockout(o,unit)&&
   !likelyOpponentKnockout(o,healed);
  const healingValue=healed?(Math.min(10,unit.damage)*1.6+(preventsKo?120:0))*
   style.survival:0;
  return 110+value*style.setup+(v.slot===-1?18:0)+future-saturation+healingValue+cureTempo-
   (v.slot===-1?doomedActiveAttachmentPenalty(o,p.hand[v.handIndex],cfg):0);
 }
 if(type==='attack'){
  const attack=(p.active.effectiveAttacks||card(p.active.id)?.attacks||[])[v.attackIndex];
  const damage=estimatedDamage(attack,p.active,q.active,p.bench.length),hp=hpRemaining(q.active);
  const uncertain=/flip (?:a |one |\\d+ )?coins?|heads|tails/i.test(attack?.text||'');
  // Expected damage has already accounted for coin outcomes. Applying another
  // 55% multiplier here previously double-discounted random attacks. Higher
  // levels instead compute the actual KO probability for known coin families.
  const lethal=damage>=hp&&hp>0;
  const koChance=cfg.level>=3?knockoutChance(attack,p.active,q.active,p.bench.length):(lethal?1:0);
  const riskPreference=uncertain?style.risk*40:0;
  const direct=damage*style.damage;
  const statusValue=/Poison|Paraly|Sleep|Confus/i.test(attack?.text||'')?16:0;
  // A retreat-lock such as Murkrow's Mean Look does not stack. Once the
  // defending Pokemon is already unable to retreat, repeating the zero-damage
  // move forfeits an entire attack. Prefer a payable damaging attack instead.
  const retreatLock=/can(?:not|'t) retreat/i.test(attack?.text||'');
  const damagingAlternative=(p.active.effectiveAttacks||card(p.active.id)?.attacks||[])
   .some((other,index)=>index!==v.attackIndex&&
    eligibleAttack(o,p.active,other,index)&&
    estimatedDamage(other,p.active,q.active,p.bench.length)>0);
  const repeatedLock=retreatLock&&damage===0&&damagingAlternative&&
   (q.active?.retreatLocked||q.active?.cannotRetreat||q.active?.meanLook||
    q.active?.retreatLock||q.active?.retreatBlocked);
  const idleLockPenalty=retreatLock&&damage===0&&damagingAlternative?
   (repeatedLock?420:185):0;
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
  return 150+direct*.9+135*koChance+riskPreference+statusValue-fixedCost-selfLoss-idleLockPenalty;
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
   const current=strongestAffordableAttack(p.active,q.active,p.bench.length);
   const opponentAlreadyLethal=current>=hpRemaining(q.active)&&hpRemaining(q.active)>0;
   const vulnerable=q.bench.some(u=>{
    const damage=strongestAffordableAttack(p.active,u,p.bench.length);
    return damage>=hpRemaining(u)&&hpRemaining(u)>0;
   });
   return (vulnerable&&!opponentAlreadyLethal?cfg.level>=3?275:205:40)*style.control;
  }
  if(name==='Super Energy Removal'){
   // Brock's Protection prevents removal from its Pokémon. Count only
   // targetable Energy when deciding whether the opponent loses two cards.
   const enemy=Math.max(0,...[q.active,...q.bench].filter(u=>u&&
    !u.attachedTrainers?.some(t=>card(t.id)?.name==="Brock's Protection"))
    .map(u=>u.energies?.length||0));
   // An empty Bench slot cannot pay Super Energy Removal's discard cost.
   // Compare only Pokémon with attached Energy; otherwise adding an
   // unequipped Bench Pokémon falsely makes this Trainer look cheaper.
   const ownCost=Math.min(Infinity,...[p.active,...p.bench]
    .filter(Boolean).map(x=>x.energies?.length||0).filter(n=>n>0));
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
   // Energy payment alone does not make an attack usable. Apex should not
   // spend PlusPower for an imaginary KO while the Active is Asleep,
   // Paralyzed, Amnesia-locked or barred from repeating a Gym attack.
   // Use only the publicly legal attack set; preserve lower-level scoring.
   const damage=cfg.level===8?
    (p.active?.effectiveAttacks||card(p.active?.id)?.attacks||[]).reduce((best,attack,index)=>
     eligibleAttack(o,p.active,attack,index)?
      Math.max(best,estimatedDamage(attack,p.active,q.active,p.bench.length)):best,0):
    strongestAffordableAttack(p.active,q.active,p.bench.length);
   const needed=hpRemaining(q.active)-damage;
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
  // Apex must not abandon a favorable defensive matchup for an uncharged
  // replacement. Compare real, currently payable attacks against BOTH slots:
  // printed HP and theoretical moves alone do not justify a retreat.
  const currentIncoming=cfg.level===8?strongestUsableOpponentAttack(o,before):0;
  const replacementIncoming=cfg.level===8?strongestUsableOpponentAttack(o,to):0;
  const currentPressure=cfg.level===8?projectedAttackValue(before,q.active,o.turnSerial,p.bench.length):0;
  const replacementPressure=cfg.level===8?projectedAttackValue(to,q.active,o.turnSerial,p.bench.length):0;
  const safeMatchupLoss=cfg.level===8&&currentIncoming===0&&
   replacementIncoming>0&&replacementPressure<=currentPressure;
  const unreadySwap=cfg.level===8&&replacementPressure===0&&
   currentPressure>0&&currentIncoming<hpRemaining(before);
  // Expert profiles recognize when an incoming attack is likely to KO their
  // Active, but do not sacrifice an immediate winning attack to flee.
  const oldDamage=strongestAffordableAttack(before,q.active,p.bench.length);
  const newDamage=strongestAffordableAttack(to,q.active,p.bench.length);
  const lethalOwn=oldDamage>=hpRemaining(q.active)&&hpRemaining(q.active)>0;
  const counter=cfg.level===8?strongestUsableOpponentAttack(o,before):
   strongestAffordableAttack(q.active,before,q.bench.length);
  const counterTo=cfg.level===8?strongestUsableOpponentAttack(o,to):
   strongestAffordableAttack(q.active,to,q.bench.length);
  const threatened=cfg.level===8?likelyOpponentKnockout(o,before):
   counter>=hpRemaining(before)&&counter>0;
  const alternativeSurvives=counterTo<hpRemaining(to);
  // A defensive swap is useful only when it *actually* shelters the Active
  // from a visible affordable knockout. Avoid abandoning a ready attacker for
  // a Bench Pokémon that is equally easy to knock out.
  // Avoid perpetual KO-avoidance: fleeing costs Energy and concedes tempo.
  // A slightly threatened attacker should still trade damage if it can score
  // Prizes. Champion values the *quality* of a safe replacement over panic.
  // A switch to an attacker without a usable attack is typically a tempo
  // loss, not a rescue. Keep a sacrificial Active in place when it buys time
  // to charge a better Bench Pokémon; do not repeatedly promote an unready
  // replacement merely to preserve the Active's remaining HP.
  const apexUnready=cfg.level===8&&replacementPressure===0;
  const usableActive=cfg.level===8&&currentPressure>0;
  const noMeaningfulRescue=cfg.level===8&&(!threatened||!alternativeSurvives);
  const sacrificeTempo=apexUnready&&noMeaningfulRescue?220:
   apexUnready&&usableActive?175:0;
  const attackTempo=cfg.level===8&&usableActive&&replacementPressure<=currentPressure?
   120:0;
  const rescue=threatened&&alternativeSurvives?(cfg.level>=4?65:100)*style.survival:
   threatened&&!alternativeSurvives?-45:0;
  const foresight=cfg.level>=3?rescue-
   (lethalOwn?300:0)+(newDamage-oldDamage)*1.05-
   (newDamage===0&&oldDamage>0?70:0)-(oldDamage>0?oldDamage*.25:0):0;
  return -sacrificeTempo-attackTempo+
   (safeMatchupLoss?-320:0)+(unreadySwap?-190:0)+
   (before.status?180:45)+(gain>0?Math.min(30,gain):0)+
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
function projectedAttackValue(active,defender,turnSerial=0,benchCount=null){
 if(!active||!defender||['Asleep','Paralyzed'].includes(active.status))return 0;
 const attacks=active.effectiveAttacks||card(active.id)?.attacks||[],pool=energyPool(active);
 const hp=hpRemaining(defender);
 let best=0;
 for(let i=0;i<attacks.length;i++){
  const attack=attacks[i];
  if(!ATTACK.compile(attack)||!canPayEnergy(attack.cost||[],pool))continue;
  // A once-used Gym attack is permanently unavailable; unlike cooldowns,
  // advancing the forecast turn cannot make this attack legal again.
  if(active.gymAttackOnce?.includes(i))continue;
  if(active.amnesia?.index===i&&active.amnesia.expires>turnSerial)continue;
  if(active.gymAttackCooldown?.expires>turnSerial&&
    (active.gymAttackCooldown.index===null||active.gymAttackCooldown.index===i))continue;
  const dmg=estimatedDamage(attack,active,defender,benchCount),
    ko=knockoutChance(attack,active,defender,benchCount);
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
function projectedPrep(board,action,round,turnSerial){
 const {type,payload}=action;
 if(!['attach_energy','evolve','bench'].includes(type))return null;
 const next={...board,active:board.active?{...board.active}:null,
  bench:board.bench.map(x=>({...x})),hand:[...board.hand]};
 const id=next.hand[payload.handIndex],c=card(id);
 if(!c)return null;
 const u=payload.slot===-1?next.active:next.bench[payload.slot];
 if(type==='attach_energy'){
  // Tactical forecasts must use the same attachment legality as candidates().
  // Otherwise a two-card line can reward Miracle Energy on an ordinary Basic
  // or an attachment prohibited for this turn.
  if(next.energyUsed||!u||!isEnergy(c)||u.energyAttachBlockSerial>turnSerial||
    !legalAttachment({card:c,unit:u,round,energyUsed:next.energyUsed,
     cardName:card(u.id)?.name||''}))return null;
  // A lethal Rainbow attachment cannot contribute to a tactical line.
  if(c.name==='Rainbow Energy'&&hpRemaining(u)<=10)return null;
  u.energies=[...(u.energies||[]),id];
  if(c.name==='Rainbow Energy')u.damage=(u.damage||0)+10;
  // Match the reducer: Full Heal Energy immediately clears all conditions,
  // potentially unlocking a sleeping or paralyzed attack in this turn's plan.
  if(c.name==='Full Heal Energy'){
   u.status=null;u.poison=false;delete u.poisonDamage;
  }
  next.energyUsed=true;
 }else if(type==='evolve'){
  if(!u||!canEvolve(c,card(u.id))||u.playedTurn>=round)return null;
  u.id=id;
  u.playedTurn=round;
  // Match the authoritative evolve reducer: the new stage uses its own
  // attacks, and evolution removes Asleep/Paralyzed/Confused and Poison.
  // Keeping either stale field made an otherwise legal evolved attack look
  // unusable (or falsely retained the Basic's cheaper attack) in the
  // optional two-step preparation forecast.
  delete u.effectiveAttacks;
  u.status=null;
  u.poison=false;
  delete u.poisonDamage;
 }else{
  if(!isBasicPokemon(c))return null;
  next.bench.push({id,damage:0,energies:[],status:null,playedTurn:round});
 }
 next.hand.splice(payload.handIndex,1);
 return next;
}
function bestOnePrep(board,o){
 let best=projectedAttackValue(board.active,o.opponent.active,o.turnSerial,board.bench.length);
 for(let i=0;i<board.hand.length;i++){
  const c=card(board.hand[i]);if(!c)continue;
  if(isEnergy(c)&&!board.energyUsed&&board.active){
   const next=projectedPrep(board,command('attach_energy',{handIndex:i,slot:-1}),o.round,o.turnSerial);
   if(next)best=Math.max(best,projectedAttackValue(next.active,o.opponent.active,o.turnSerial,next.bench.length));
  }
  if(c.evolvesFrom&&board.active&&canEvolve(c,card(board.active.id))&&
   board.active.playedTurn<o.round){
   const next=projectedPrep(board,command('evolve',{handIndex:i,slot:-1}),o.round,o.turnSerial);
   if(next)best=Math.max(best,projectedAttackValue(next.active,o.opponent.active,o.turnSerial,next.bench.length));
  }
 }
 return best;
}
function planningBonus(action,o,cfg){
 if(!cfg.planning||o.phase!=='game'||!o.self.active)return 0;
 const before=prepBoard(o),after=projectedPrep(before,action,o.round,o.turnSerial);
 if(!after)return 0;
 const now=projectedAttackValue(before.active,o.opponent.active,o.turnSerial,before.bench.length);
 const next=projectedAttackValue(after.active,o.opponent.active,o.turnSerial,after.bench.length);
 const alone=bestOnePrep(before,o);
 const combo=bestOnePrep(after,o);
 // A full two-card sequence can open an attack that neither card alone could
 // enable. Reward that tempo without treating possible future card draws as known.
 const immediate=(next-now)*.50;
 const synergy=Math.max(0,combo-Math.max(next,alone))*.85;
 return Math.max(-45,Math.min(135,immediate+synergy))*cfg.style.damage;
}

function energyPreparationActions(o,cfg,actions){
 // Attacking ends the turn. Use a legal, productive Energy attachment first,
 // unless an already-affordable attack guarantees the final knockout.
 if(cfg.level!==8||o.self.energyUsed)return actions;
 const canAttackNow=actions.some(a=>a.type==='attack');
 const useful=actions.some(a=>{
  if(a.type!=='attach_energy')return false;
  const target=slotUnit(o.self,a.payload.slot);
  const energyId=o.self.hand[a.payload.handIndex];
  // Full Heal Energy cures Confusion on attachment. A fully charged Active
  // may have zero marginal Energy value, yet curing the 50% attack-failure
  // risk before declaring a damaging attack is a productive preparation.
  const confusionCure=a.payload.slot===-1&&target?.status==='Confused'&&
   card(energyId)?.name==='Full Heal Energy'&&
   (target.effectiveAttacks||card(target.id)?.attacks||[]).some((attack,index)=>
    eligibleAttack(o,target,attack,index)&&
    estimatedDamage(attack,target,o.opponent.active,o.self.bench.length)>0);
  if(!confusionCure&&energyValue(target,energyId)<=12)return false;
  // Do not suppress an already-legal attack just to spend the only Energy on
  // an Active that will be KO'd before that Energy helps. A legal Bench
  // attachment or immediate attack upgrade still gets prepared first.
  // The cure improves this turn's attack reliability even if the Active
  // would be knocked out next turn; do not treat it as stranded Energy.
  return confusionCure||!(canAttackNow&&a.payload.slot===-1&&
   strandedActiveEnergy(o,energyId));
 });
 if(!useful)return actions;
 // Confusion requires a coin flip before a printed attack resolves, so a
 // nominally lethal attack is not a guaranteed final-Prize knockout.
 const confusionChance=o.self.active?.status==='Confused'?.5:1;
 const gameWinningKo=(o.self.prizeCount<=1||o.opponent.bench.length===0)&&
  actions.some(a=>{
   if(a.type!=='attack')return false;
   const attacks=o.self.active?.effectiveAttacks||card(o.self.active?.id)?.attacks||[];
   return knockoutChance(attacks[a.payload.attackIndex],o.self.active,o.opponent.active,o.self.bench.length)*
    confusionChance>=.999;
  });
 return gameWinningKo?actions:actions.filter(a=>a.type!=='attack');
}
function chooseAction(game,raw={},memo={}){
 const cfg=configuration(raw),o=observation(game,cfg.side);
 const used={trainers:memo.trainers||0,powers:memo.powers||0,powerKeys:memo.powerKeys||new Set(),stadium:!!memo.stadium};
 const actions=candidates(o,cfg,used);if(!actions.length)return null;
 // A strategic beam may award a long-term bonus to an Energy attachment
 // despite its immediate -1000 penalty. This is a strict sequencing guard,
 // not merely a heuristic: never spend the turn's attachment on a damaged
 // Pokémon while an unplayed Center is available to discard that Energy.
 const safeActions=centerSafeActions(o,cfg,used,actions);
 if(!safeActions.length)return null;
 const random=rng(cfg.seed+game.turnSerial*7919+(game.events?.length||0)*17011+cfg.side*31);
 const preparedActions=energyPreparationActions(o,cfg,safeActions);
 const ranked=preparedActions.map((action,i)=>({action,
  score:score(action,o,cfg,used)+planningBonus(action,o,cfg)+prizeRaceBonus(action,o,cfg)+knockoutTempoBonus(action,o,cfg)+opponentResponseBonus(action,o,cfg)+energyHorizonBonus(action,o,cfg),tie:i}))
  .sort((a,b)=>b.score-a.score||a.tie-b.tie);
 // Rank all visible options before competence-sensitive choice noise. A larger
 // *evaluation budget* should NOT widen the random window: doing so previously
 // made mid-level players less competent than beginners. Beginner is allowed
 // to overlook the best move; Champion deterministically chooses its best.
 const helpers={
  observation,candidates,score,projectedAttackValue,hpRemaining,card,strongestAffordableAttack,
  strongestUsableOpponentAttack,knockoutChance,
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
  // Capture actionable missed attachments before the move, without reading
  // either player's unrevealed deck or the opponent's hand.
  const auditObs=observation(game,side);
  const auditCfg=configuration({side,level,personality,seed,planning,evolutionTempo,prizeRace,
   knockoutTempo,opponentResponse,graduatedNoise,energyHorizon});
  const auditOptions=auditObs.phase==='game'&&auditObs.turn===side&&!auditObs.decision?
   centerSafeActions(auditObs,auditCfg,memo,
    candidates(auditObs,auditCfg,memo)).filter(a=>a.type==='attach_energy'):[];
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
  const attachmentOpportunity=auditOptions.some(candidate=>
   energyValue(slotUnit(auditObs.self,candidate.payload.slot),
    auditObs.self.hand[candidate.payload.handIndex])>12);
  const handCardId=['play_trainer','attach_energy','bench','evolve'].includes(a.type)?
   game.players[side]?.hand?.[a.payload?.handIndex]:null;
  const target=a.type==='attach_energy'?
   (a.payload.slot===-1?game.players[side]?.active:game.players[side]?.bench?.[a.payload.slot]):null;
  // Center only discards Energy from Pokémon still damaged when it resolves.
  // Record the public pre-action slots rather than assuming earlier damage persists.
  const centerDamagedSlotsBefore=a.type==='play_trainer'&&
   CATALOG.get(handCardId)?.name==='Pokémon Center'?
   [-1,...game.players[side].bench.map((_,index)=>index)].filter(slot=>
    (slot===-1?game.players[side].active:game.players[side].bench[slot])?.damage>0):null;
  // A draw Trainer may introduce Center after the attachment. Record whether
  // the acting player could have played Center before spending that Energy.
  const centerInHandBefore=a.type==='attach_energy'?
   game.players[side]?.hand?.some(id=>CATALOG.get(id)?.name==='Pokémon Center')===true:null;
  commands.push({side,turnSerial:beforeTurn,cardId:handCardId||null,
   targetDamageBefore:target?.damage??null,centerDamagedSlotsBefore,centerInHandBefore,
   // Resolved outcome, never a hypothetical result of a simulated attack.
   wonGame:!!next.game.over&&next.game.winner===side,
   attachmentOpportunity,energyUsedBefore:auditObs.self.energyUsed,
   energyInHand:auditObs.self.hand.some(id=>isEnergy(card(id))),
   command:a,score:next.score,alternatives:next.alternatives,
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
module.exports={SKILLS,CALIBRATED_SKILLS,PERSONALITIES,configuration,observation,trainerOpportunity,candidates,score,estimatedDamage,strongestAffordableAttack,strongestUsableOpponentAttack,projectedAttackValue,knockoutChance,planningBonus,evolutionTempoPenalty,prizeRaceBonus,knockoutTempoBonus,opponentResponseBonus,energyHorizonBonus,energyPreparationActions,centerSafeActions,chooseAction,driveSide,driveBot,propose};
