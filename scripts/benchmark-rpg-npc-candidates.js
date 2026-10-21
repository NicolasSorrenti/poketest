'use strict';
// Matched, mirrored real-engine trials. Identical player collection and battle
// seeds for every NPC variant; only the NPC's 60-card recipe changes.
const P=require('./benchmark-rpg-pack-strategies');
const {argumentsOf,duel,wilson}=require('../benchmark_cpu');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck}=require('../core_rules');
const {VARIANTS,candidate}=require('./rpg-npc-candidates');
const NPC=require('../rpg_npc_deck_progression');
const {NPC_PROFILES}=require('../cpu_profiles');
const PRESETS=Object.freeze({reina:'blackout',yuna:'zap',camila:'rocket_lab'});
const DAYS=Object.freeze([45,60,80]);
const STYLES=Object.freeze(['mixed','evolution','toolkit']);
const STARTERS=Object.freeze(['ember_garden','tidal_circuit']);
const NPCLIST=Object.freeze(['reina','yuna','camila']);
const PRODUCTION=Object.freeze({reina:'fair-rival',yuna:'electabuzz-pair',camila:'rocket-hybrid'});
const variantsFor=(npc,selection)=>selection==='production'?['baseline',PRODUCTION[npc]]:VARIANTS[npc];
function npcCpu(npc,options){
 if(options.npcProfile==='character'){
  const profile=NPC_PROFILES[npc]||{level:3,personality:'balanced'};
  return {level:profile.level,personality:profile.personality};
 }
 return {level:options.npcLevel,personality:'balanced'};
}
function parse(argv){
 const x={days:[...DAYS],styles:[...STYLES],starters:[...STARTERS],npcs:[...NPCLIST],
  seeds:2,pairs:1,seed:20261021,maxTurns:70,npcTier:'calendar',playerLevel:3,npcLevel:3,npcProfile:'uniform',selection:'all'};
 for(let i=0;i<argv.length;i++){
  const k=argv[i],v=argv[++i];
  if(v===undefined)throw Error('Missing option value '+k);
  if(k==='--days')x.days=v.split(',').map(Number);
  else if(k==='--styles')x.styles=v.split(',');
  else if(k==='--starters')x.starters=v.split(',');
  else if(k==='--npcs')x.npcs=v.split(',');
  else if(k==='--seeds')x.seeds=Number(v);
  else if(k==='--pairs')x.pairs=Number(v);
  else if(k==='--seed')x.seed=Number(v);
  else if(k==='--max-turns')x.maxTurns=Number(v);
  else if(k==='--npc-tier')x.npcTier=v;
  else if(k==='--player-level')x.playerLevel=Number(v);
  else if(k==='--npc-level')x.npcLevel=Number(v);
  else if(k==='--npc-profile')x.npcProfile=v;
  else if(k==='--selection')x.selection=v;
  else throw Error('Unknown option '+k);
 }
 if(!x.days.length||x.days.some(v=>!DAYS.includes(v)))throw Error('Invalid days');
 if(!x.styles.length||x.styles.some(v=>!STYLES.includes(v)))throw Error('Invalid styles');
 if(!x.starters.length||x.starters.some(v=>!STARTERS.includes(v)))throw Error('Invalid starters');
 if(!x.npcs.length||x.npcs.some(v=>!NPCLIST.includes(v)))throw Error('Invalid NPCs');
 if(!Number.isInteger(x.seeds)||x.seeds<1||x.seeds>20)throw Error('Invalid seeds');
 if(!Number.isInteger(x.pairs)||x.pairs<1||x.pairs>20)throw Error('Invalid pairs');
 if(!Number.isInteger(x.maxTurns)||x.maxTurns<10||x.maxTurns>250)throw Error('Invalid max turns');
 if(!Number.isSafeInteger(x.seed)||x.seed<0)throw Error('Invalid RNG seed');
 if(!['calendar','story'].includes(x.npcTier))throw Error('Invalid NPC tier mode');
 if(!Number.isInteger(x.playerLevel)||x.playerLevel<1||x.playerLevel>5)throw Error('Invalid player CPU level');
 if(!Number.isInteger(x.npcLevel)||x.npcLevel<1||x.npcLevel>5)throw Error('Invalid NPC CPU level');
 if(!['uniform','character'].includes(x.npcProfile))throw Error('Invalid NPC profile mode');
 if(!['all','production'].includes(x.selection))throw Error('Invalid variant selection');
 return x;
}
function tierForBenchmark(day,npc,mode){
 if(mode==='calendar')return NPC.tierForDay(day);
 // Model a player who completed the NPC's first and third chapter as early
 // as permitted. No affection or romance requirement is assumed.
 const state={day,storyDone:{[npc+'_route_1']:true,[npc+'_route_3']:true}};
 return NPC.tierForOpponent(state,npc);
}
function run(options){
 const service=new ClassicLocalService(),errors=[],rows=[];
 const variants={};
 for(const day of options.days)for(const npc of options.npcs){
  const source=service.decklist(PRESETS[npc]),tier=tierForBenchmark(day,npc,options.npcTier);
  for(const variant of variantsFor(npc,options.selection)){
   const cards=candidate({npc,tier,original:source,catalog:CATALOG,variant});
   const legal=validateDeck(cards,CATALOG);
   if(!legal.valid)throw Error('Illegal '+npc+'/'+variant+' Day '+day+': '+legal.errors.join('; '));
   variants[day+'/'+npc+'/'+variant]=cards;
  }
 }
 const accum=new Map();
 for(const day of options.days)for(const style of options.styles)
 for(const starter of options.starters)for(let rep=0;rep<options.seeds;rep++){
  const player=P.collect(starter,day,style,options.seed+rep).deck;
  for(const npc of options.npcs){
   const baseSeed=P.hash(options.seed+'/'+rep+'/'+day+'/'+starter+'/'+npc);
   const cpu=npcCpu(npc,options);
   const opts=argumentsOf(['--pairs',String(options.pairs),'--max-turns',String(options.maxTurns),
    '--seed',String(baseSeed),'--left-level',String(options.playerLevel),'--right-level',String(cpu.level),
    '--left-personality','balanced','--right-personality',cpu.personality]);
   for(const variant of variantsFor(npc,options.selection)){
    const cards=variants[day+'/'+npc+'/'+variant];
    opts.format=[...player,...cards].some(id=>id.startsWith('neo'))?'online-preview':'gym-expanded';
    const key=day+'/'+npc+'/'+variant;
    if(!accum.has(key))accum.set(key,{day,npc,variant,npcDeckTier:tierForBenchmark(day,npc,options.npcTier),npcTierMode:options.npcTier,playerCpuLevel:options.playerLevel,games:0,playerWins:0,npcWins:0,draws:0,
     styles:Object.fromEntries(options.styles.map(x=>[x,{playerWins:0,npcWins:0,draws:0}]))});
    const item=accum.get(key);
    item.npcCpuLevel=cpu.level;item.npcPersonality=cpu.personality;
    for(let pair=0;pair<options.pairs;pair++)for(const swapped of [false,true]){
     try{
      const result=duel(opts,pair,swapped,[player,cards]);
      item.games++;
      const type=result.winner===0?'playerWins':result.winner===1?'npcWins':'draws';
      item[type]++;item.styles[style][type]++;
     }catch(e){errors.push({day,style,starter,npc,variant,rep,pair,swapped,error:String(e)});}
    }
   }
  }
 }
 for(const row of accum.values()){
  const decisive=row.playerWins+row.npcWins;
  row.npcWinRate=decisive?Number((row.npcWins/decisive).toFixed(3)):null;
  row.uncertainty95=decisive?wilson(row.npcWins,decisive):null;
  rows.push(row);
 }
 const comparisons=options.days.flatMap(day=>options.npcs.map(npc=>{
  const same=rows.filter(r=>r.day===day&&r.npc===npc),
   old=same.find(r=>r.variant==='baseline');
  return {day,npc,baselineNpcWins:old.npcWins,baselinePlayerWins:old.playerWins,
   variants:same.filter(r=>r.variant!=='baseline').map(r=>({
    name:r.variant,npcWins:r.npcWins,playerWins:r.playerWins,draws:r.draws,
    npcWinDelta:r.npcWins-old.npcWins}))};
 }));
 return {parameters:options,method:'Actual mirrored Classic reducer CPU games against identical player decks and battle seeds. Configurable player skill, uniform or character-specific NPC CPU profiles, calendar or synthetic chapter-complete NPC tiers, and original themed-pack acquisition. Optional NPC deck variants isolated from production.',rows,comparisons,errors,
  caveat:'Exploratory CPU-vs-CPU outcomes, not human-player win probabilities. Select production changes only after checking both midgame and late game.'};
}
if(require.main===module){
 try{const result=run(parse(process.argv.slice(2)));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.errors.length)process.exitCode=1;
 }catch(e){console.error(e.stack||String(e));process.exitCode=1;}
}
module.exports={PRESETS,DAYS,STYLES,STARTERS,NPCLIST,PRODUCTION,variantsFor,npcCpu,parse,tierForBenchmark,run};
