'use strict';
// CPU policy reads only the same projected information that a player may see.
// The authoritative reducer is used for legality and execution, never as a
// future-outcome oracle (in particular it cannot peek at upcoming coin flips).
const {reduce,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {isBasicPokemon,isEnergy,canEvolve,canPayEnergy}=require('./core_rules');
const POWERS=require('./classic_power_core');

const SKILLS=Object.freeze({
  1:Object.freeze({name:'Beginner',temperature:40,attention:5,trainers:1,bench:2}),
  2:Object.freeze({name:'Casual',temperature:20,attention:9,trainers:2,bench:3}),
  3:Object.freeze({name:'Experienced',temperature:9,attention:16,trainers:3,bench:3}),
  4:Object.freeze({name:'Expert',temperature:3,attention:30,trainers:4,bench:4}),
  5:Object.freeze({name:'Champion',temperature:0,attention:100,trainers:6,bench:4})
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
 if(!Number.isInteger(level)||!SKILLS[level])throw Error('CPU level must be 1–5');
 if(!Object.hasOwn(PERSONALITIES,personality))throw Error('Unknown CPU personality');
 if(!Number.isSafeInteger(raw.seed??1))throw Error('Invalid CPU policy seed');
 const side=raw.side??1;if(side!==0&&side!==1)throw Error('Invalid CPU side');
 return {level,personality,seed:raw.seed??1,side,skill:SKILLS[level],style:PERSONALITIES[personality]};
}
// Seeded independent of the engine's private deck order and future RNG state.
function rng(seed){let x=(seed>>>0)||0x6d2b79f5;return ()=>{
 x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;
};}
const command=(type,payload={})=>({type,payload});
function observation(game,side){
 const view=publicView(game,side);
 return {phase:view.phase,turn:view.turn,round:view.round,over:view.over,
  self:view.players[side],opponent:view.players[1-side],stadium:view.stadium,
  decision:view.pendingDecision,setupReady:!!game.setupReady[side]};
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
 if(raw.endsWith('x'))amount*=1; // Conservative expectation: no unseen flips.
 else if(raw.endsWith('+'))amount+=8;
 else if(raw.endsWith('-'))amount=Math.max(0,amount-10);
 const aType=(card(attacker?.id)?.types||[])[0],target=card(defender.id);
 if(aType&&target?.weaknesses?.some(w=>w.type===aType))amount*=2;
 if(aType&&target?.resistances?.some(r=>r.type===aType))amount=Math.max(0,amount-30);
 return amount;
}
function hpRemaining(u){return Math.max(0,(Number(card(u?.id)?.hp)||60)-(u?.damage||0));}
function setupValue(unit){
 const c=card(unit?.id);
 const attacks=c?.attacks||[];
 return (Number(c?.hp)||40)*.3+Math.max(0,30-Math.min(...attacks.map(a=>(a.cost||[]).length),5)*10)+attacks.length*4;
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
function candidates(o,cfg,used){
 if(o.over||o.decision?.waitingFor!==undefined)return [];
 const p=o.self,turn=o.turn===cfg.side,options=[];
 if(o.decision){
  if(o.decision.actor!==cfg.side)return [];
  const d=o.decision;
  const sorted=[...d.options].sort((a,b)=>choiceValue(b,d,o)-choiceValue(a,d,o)||a.id.localeCompare(b.id));
  // Card costs and mandatory multi-pick effects must be solvable at every skill.
  // Skill changes ranking, never the legal number of choices considered.
  const sizes=new Set([d.min,d.max,Math.min(d.max,Math.max(1,d.min)),Math.min(d.max,Math.max(2,d.min))]);
  if(d.max>d.min+3)sizes.add(Math.min(d.max,d.min+3));
  for(const n of sizes)options.push(command('choose',{decisionId:d.id,selected:sorted.slice(0,n).map(x=>x.id)}));
  if(d.optional)options.push(command('choose',{decisionId:d.id,decline:true}));
  return options;
 }
 if(o.phase==='setup'){
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
  if(c?.evolvesFrom||c?.subtypes?.includes('Basic')&&['Pikachu','Clefairy','Electabuzz','Magmar','Jigglypuff','Jynx','Hitmonchan','Hitmonlee','Hitmontop'].includes(c.name))
   for(const slot of slots(p))if(slotUnit(p,slot)&&canEvolve(c,card(slotUnit(p,slot).id)))options.push(command('evolve',{handIndex:i,slot}));
  if(!p.energyUsed&&isEnergy(c))for(const slot of slots(p))options.push(command('attach_energy',{handIndex:i,slot}));
  if(c?.supertype==='Trainer'&&used.trainers<cfg.skill.trainers)options.push(command('play_trainer',{handIndex:i}));
 }
 if(p.active){
  const effective=p.active.effectiveAttacks||card(p.active.id)?.attacks||[];
  for(let attackIndex=0;attackIndex<effective.length;attackIndex++)options.push(command('attack',{attackIndex}));
  if(!p.retreated)for(let slot=0;slot<p.bench.length;slot++)options.push(command('retreat',{slot}));
 }
 if(used.powers<Math.max(1,cfg.level)&&p.active)for(const slot of slots(p)){
  const u=slotUnit(p,slot);
  if(!u)continue;
  const powerNames=(card(u.id)?.abilities||[]).filter(x=>x.name).map(x=>x.name);
  for(let powerIndex=0;powerIndex<powerNames.length;powerIndex++){
   if(!POWERS.ACTIVATED.has(powerNames[powerIndex])||!powerOpportunity(o,slot,powerNames[powerIndex]))continue;
   const id=slot+':'+powerIndex;
   if(!used.powerKeys.has(id))options.push(command('use_power',{slot,powerIndex}));
  }
 }
 if(o.stadium&&!used.stadium)options.push(command('use_stadium'));
 options.push(command('end_turn'));
 return options;
}
function choiceValue(option,decision,o){
 const id=option.id,label=option.label||'',kind=decision.kind||'',ctx=decision.label||'';
 if(/^prize:/.test(id))return 1;
 if(/^energy:/.test(id)&&/discard|retreat|pay/i.test(ctx))return /Double Colorless|Rainbow/i.test(label)?-15:10;
 if(/^bench:/.test(id)||/^slot:/.test(id)){
  const n=Number(id.split(':')[1]),own=/your|friendly|own|promot|receiv|retreat/i.test(ctx)&&!/opponent|opposing|enemy/i.test(ctx);
  const target=slotUnit(own?o.self:o.opponent,n);
  if(!target)return 0;
  if(/promot|retreat|switch.*your/i.test(ctx))return setupValue(target)+energyValue(target,'base1-97')+hpRemaining(target)/3;
  if(/damage|attack|gust|opposing/i.test(ctx))return 110-hpRemaining(target);
  return own?setupValue(target):110-hpRemaining(target);
 }
 if(/^hand:|^deck:/.test(id))return /Energy/i.test(label)?20:40;
 if(/draw|recover|search|attach|heal/i.test(ctx))return 15;
 return 0;
}
function score(a,o,cfg,used){
 const p=o.self,q=o.opponent,style=cfg.style,{type,payload:v}=a;
 if(type==='setup_confirm')return p.bench.length>=1?110:25;
 if(type==='setup_select'){
  const u={id:p.hand[v.handIndex],energies:[]};
  return (p.active?45:120)+setupValue(u)*style.setup;
 }
 if(type==='choose'){
  if(v.decline)return -30;
  return 120+v.selected.reduce((n,id)=>n+Math.max(0,choiceValue(o.decision.options.find(x=>x.id===id)||{id},o.decision,o)),0);
 }
 if(type==='bench')return (p.bench.length?43:100)+setupValue({id:p.hand[v.handIndex]})*.32*style.setup;
 if(type==='evolve'){
  const target=slotUnit(p,v.slot),after=card(p.hand[v.handIndex]);
  return 165*style.setup+(Number(after?.hp)||0)*.35+((v.slot===-1)?15:0)-(target?.damage||0)*.1;
 }
 if(type==='attach_energy'){
  const unit=slotUnit(p,v.slot),value=energyValue(unit,p.hand[v.handIndex]);
  return 110+value*style.setup+(v.slot===-1?20:0);
 }
 if(type==='attack'){
  const attack=(p.active.effectiveAttacks||card(p.active.id)?.attacks||[])[v.attackIndex];
  const damage=estimatedDamage(attack,p.active,q.active),hp=hpRemaining(q.active);
  const lethal=damage>=hp&&hp>0;
  return 120+damage*style.damage*.9+(lethal?110:0)+(/Poison|Paraly|Sleep|Confus/i.test(attack?.text||'')?12:0)-(/Discard.*Energy attached to/i.test(attack?.text||'')?20:0);
 }
 if(type==='play_trainer'){
  const name=card(p.hand[v.handIndex])?.name||'';
  if(name==='Bill')return 175+(p.handCount<=3?15:0);
  if(name==='Professor Oak')return p.handCount<=3?210:p.handCount<=5?130:15;
  if(name==='Gust of Wind')return (q.bench.some(u=>hpRemaining(u)<=estimatedDamage((card(p.active?.id)?.attacks||[])[0],p.active,u))?190:60)*style.control;
  if(/Energy Removal|Lass|Rocket|Scoop/i.test(name))return (q.active?.energies?.length?175:65)*style.control;
  if(/Potion|Center|Heal/i.test(name))return (p.active?.damage||0)>=20?160*style.survival:35;
  if(name==='Switch')return p.active?.status?185*style.survival:45;
  if(/Search|Computer|Ball|Trader|Elm/i.test(name))return 130*style.setup;
  if(/PlusPower|Defender|Berry|Focus Band/i.test(name))return 115*style.damage;
  return 75;
 }
 if(type==='retreat'){
  const to=p.bench[v.slot],before=p.active;
  const gain=setupValue(to)-setupValue(before);
  return (before.status?180:45)+(gain>0?gain:0)+((hpRemaining(before)<30)?40:0)*style.survival-(before.energies?.length||0)*20;
 }
 if(type==='use_power')return 85*style.setup;
 if(type==='use_stadium')return 85;
 return 0;
}
function chooseAction(game,raw={},memo={}){
 const cfg=configuration(raw),o=observation(game,cfg.side);
 const used={trainers:memo.trainers||0,powers:memo.powers||0,powerKeys:memo.powerKeys||new Set(),stadium:!!memo.stadium};
 const actions=candidates(o,cfg,used);if(!actions.length)return null;
 const random=rng(cfg.seed+game.turnSerial*7919+(game.events?.length||0)*17011+cfg.side*31);
 const ranked=actions.map((action,i)=>({action,score:score(action,o,cfg,used),tie:i}))
  .sort((a,b)=>b.score-a.score||a.tie-b.tie);
 // Limited attention is a difficulty mechanic. Lower levels sample plausible
 // alternatives; Champion evaluates every action without stochastic errors.
 const shortlist=ranked.slice(0,cfg.skill.attention);
 const temp=cfg.skill.temperature,ordered=temp===0?shortlist:[...shortlist].map(x=>({...x,priority:x.score+Math.log(-Math.log(Math.max(1e-12,random())))*-temp}))
  .sort((a,b)=>b.priority-a.priority||a.tie-b.tie);
 // The result of each probe is intentionally opaque to the scorer. In
 // particular a previewed random coin result is never used to rank actions.
 for(const item of [...ordered,...ranked.slice(cfg.skill.attention)]){
  const result=reduce(game,cfg.side,item.action);
  if(result.ok)return {command:item.action,game:result.game,score:item.score,alternatives:ranked.length};
 }
 return null;
}
function driveSide(initial,{side=1,level=3,personality='balanced',seed=1,limit=200}={}){
 let game=initial,steps=0;const commands=[],memo={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 while(!game.over&&steps<limit){
  const beforeTurn=game.turnSerial;
  const next=chooseAction(game,{side,level,personality,seed},memo);
  if(!next){
   if(game.pendingDecision?.actor===side)throw Error('CPU unresolved choice: '+JSON.stringify({decision:game.pendingDecision,pendingAction:game.pendingAction}));
   break;
  }
  const a=next.command,signature=a.type+':'+JSON.stringify(a.payload);
  if(a.type==='play_trainer')memo.trainers++;
  if(a.type==='use_power'){memo.powers++;memo.powerKeys.add(a.payload.slot+':'+a.payload.powerIndex);}
  if(a.type==='use_stadium')memo.stadium=true;
  commands.push({side,command:a,score:next.score,alternatives:next.alternatives});
  game=next.game;steps++;
  if(beforeTurn!==game.turnSerial){memo.trainers=0;memo.powers=0;memo.powerKeys.clear();memo.stadium=false;}
  if(a.type==='end_turn'&&game.turn===side&&!game.pendingDecision&&!game.over)throw Error('CPU did not advance turn');
 }
 if(steps===limit&&!game.over&&(game.turn===side||game.pendingDecision?.actor===side||game.phase==='setup'&&!game.setupReady[side]))throw Error('CPU step budget exhausted');
 return {game,steps,commands};
}
function driveBot(game,limit=200,config={}){return driveSide(game,{...config,side:1,limit});}
function propose(game,config={}){return chooseAction(game,{...config,side:1});}
module.exports={SKILLS,PERSONALITIES,configuration,observation,candidates,score,chooseAction,driveSide,driveBot,propose};
