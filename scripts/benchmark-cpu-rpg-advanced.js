'use strict';
// Late-campaign RPG NPC deck evaluation for experimental CPU skill tiers.
// Tests identical *tier-3* character recipes on both sides, so deck power
// differences do not manufacture a CPU skill gain. Mirrored seeds vary seats.
const {performance}=require('node:perf_hooks');
const {argumentsOf,duel,wilson}=require('../benchmark_cpu');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck}=require('../core_rules');
const NPC=require('../rpg_npc_deck_progression');
const {NPC_PROFILES}=require('../cpu_profiles');
const ARCHETYPES=Object.freeze([
 {npc:'reina',deck:'blackout'},
 {npc:'yuna',deck:'zap'},
 {npc:'camila',deck:'rocket_lab'},
 {npc:'kaede',deck:'rocket_lab'},
 {npc:'shiori',deck:'overgrowth'},
 {npc:'akari',deck:'gym_new_voltage'}
]);
function parse(argv){
 const o={level:6,baselineLevel:5,pairs:15,maxTurns:120,seed:67411};
 for(let i=0;i<argv.length;i++){
  const k=argv[i],v=argv[++i],key={'--level':'level','--baseline-level':'baselineLevel','--pairs':'pairs','--max-turns':'maxTurns','--seed':'seed'}[k];
  if(!key||v===undefined)throw Error('Unknown/incomplete argument: '+k);
  o[key]=Number(v);
 }
 if(!Number.isInteger(o.baselineLevel)||o.baselineLevel<1||o.baselineLevel>8)throw Error('Invalid baseline level');
 if(!Number.isInteger(o.level)||o.level<6||o.level>8)throw Error('Level must be 6–8');
 if(!Number.isInteger(o.pairs)||o.pairs<1||o.pairs>150)throw Error('Invalid pairs');
 if(!Number.isInteger(o.maxTurns)||o.maxTurns<5||o.maxTurns>250)throw Error('Invalid maxTurns');
 if(!Number.isSafeInteger(o.seed)||o.seed<0)throw Error('Invalid seed');
 return o;
}
function evaluate(o){
 const service=new ClassicLocalService(),rows=[],errors=[];
 let champ=0,challenger=0,unfinished=0,elapsed=0,totalActions=0,totalActionMs=0;
 const decisionSamplesByRole=[[],[]];
 for(let i=0;i<ARCHETYPES.length;i++){
  const f=ARCHETYPES[i],original=service.decklist(f.deck);
  const cards=NPC.upgrade({npc:f.npc,tier:3,original,catalog:CATALOG});
  const valid=validateDeck(cards,CATALOG);
  if(!valid.valid)throw Error(f.npc+' tier-3 deck invalid: '+valid.errors.join('; '));
  const args=['--pairs',String(o.pairs),'--max-turns',String(o.maxTurns),
   '--seed',String(o.seed+i*7193),'--left-level',String(o.baselineLevel),'--right-level',String(o.level),
   '--left-prize-race','true','--left-knockout-tempo','true','--left-opponent-response','true',
   '--personality',NPC_PROFILES[f.npc]?.personality||'balanced'];
  const options=argumentsOf(args);
  options.format=cards.some(id=>/^neo[1-4]-/.test(id))?'online-preview':'gym-expanded';
  let cw=0,nw=0,inc=0,started=performance.now();
  for(let pair=0;pair<o.pairs;pair++)for(const swap of [false,true]){
   try{
    const result=duel(options,pair,swap,[cards,cards]);
    if(result.winner===0)cw++;else if(result.winner===1)nw++;else inc++;
    totalActions+=result.stats.actions;totalActionMs+=result.stats.decisionsMs;
    for(let role=0;role<2;role++)decisionSamplesByRole[role].push(...result.stats.decisionPerActionMsByRole[role]);
   }catch(err){errors.push({npc:f.npc,pair,swap,error:String(err).slice(0,240)});}
  }
  const ms=performance.now()-started;
  champ+=cw;challenger+=nw;unfinished+=inc;elapsed+=ms;
  rows.push({npc:f.npc,personality:NPC_PROFILES[f.npc]?.personality,
   games:cw+nw+inc,championWins:cw,challengerWins:nw,unfinished:inc,
   challengerWinRateDecisive:cw+nw?nw/(cw+nw):null,elapsedMs:Math.round(ms)});
 }
 const decisive=champ+challenger;
 return {level:o.level,against:'RPG CPU Level '+o.baselineLevel+' with advanced tactics',
  day:'late campaign, tier 3 NPC decks',games:decisive+unfinished,
  championWins:champ,challengerWins:challenger,unfinished,decisive,
  challengerWinRateDecisive:decisive?challenger/decisive:null,
  challengerWinRate95:decisive?wilson(challenger,decisive):null,
  meanActionMs:totalActions?totalActionMs/totalActions:null,
  perRoleLatencyMs:decisionSamplesByRole.map(values=>{
   if(!values.length)return {samples:0,p95:null,p99:null,max:null};
   values.sort((a,b)=>a-b);
   return {samples:values.length,p95:values[Math.ceil(values.length*.95)-1],
    p99:values[Math.ceil(values.length*.99)-1],max:values[values.length-1]};
  }),elapsedMs:Math.round(elapsed),rows,errors,
  caveat:'Mirrored NPC deck self-play; not a human win-rate prediction. Unported card effects must be reported explicitly.'};
}
if(require.main===module){
 try{const r=evaluate(parse(process.argv.slice(2)));console.log('RPG_CPU_TIER_EVALUATION '+JSON.stringify(r));if(r.errors.length||!r.decisive)process.exitCode=1;}
 catch(e){console.error(e.stack||e);process.exitCode=1;}
}
module.exports={parse,evaluate};
