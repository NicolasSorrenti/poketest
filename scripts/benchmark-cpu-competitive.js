'use strict';
// Real-engine Level 7 vs Level 8 on competitive-archetype *test builds*.
// Each fixture uses two seat-mirrored games per seed, both deck orientations
// for major cross-archetype contrasts, and independent per-fixture RNG seeds.
// Theme-deck results stay separate. A pass is not a claim of strong AI play.
const {performance}=require('node:perf_hooks');
const {argumentsOf,duel,wilson}=require('../benchmark_cpu');
const D=require('../cpu_competitive_decks');
const FIXTURES=Object.freeze({
 aggression:[
  {left:'haymaker',right:'haymaker',persona:'aggressive'},
  {left:'rain_dance',right:'rain_dance',persona:'setup'},
  {left:'haymaker',right:'rain_dance',persona:'tactical'},
  {left:'rain_dance',right:'haymaker',persona:'tactical'},
  {left:'haymaker',right:'energy_denial',persona:'aggressive'},
  {left:'energy_denial',right:'haymaker',persona:'tactical'}
 ],
 evolution:[
  {left:'venusaur',right:'venusaur',persona:'setup'},
  {left:'typhlosion',right:'typhlosion',persona:'setup'},
  {left:'feraligatr',right:'feraligatr',persona:'setup'},
  {left:'venusaur',right:'typhlosion',persona:'balanced'},
  {left:'typhlosion',right:'venusaur',persona:'balanced'},
  {left:'feraligatr',right:'venusaur',persona:'tactical'}
 ],
 control:[
  {left:'energy_denial',right:'energy_denial',persona:'tactical'},
  {left:'stall',right:'stall',persona:'defensive'},
  {left:'energy_denial',right:'rain_dance',persona:'tactical'},
  {left:'rain_dance',right:'energy_denial',persona:'tactical'},
  {left:'stall',right:'typhlosion',persona:'defensive'},
  {left:'typhlosion',right:'stall',persona:'defensive'}
 ],
 neo:[
  {left:'neo_dark',right:'neo_dark',persona:'aggressive'},
  {left:'neo_dark',right:'feraligatr',persona:'tactical'},
  {left:'feraligatr',right:'neo_dark',persona:'tactical'},
  {left:'neo_dark',right:'venusaur',persona:'balanced'},
  {left:'venusaur',right:'neo_dark',persona:'balanced'},
  {left:'feraligatr',right:'typhlosion',persona:'setup'}
 ]
});
function parse(argv){
 const options={group:'aggression',pairs:2,maxTurns:100,seed:1051991,
  baselineLevel:7,challengerLevel:8};
 const names={'--group':'group','--pairs':'pairs','--max-turns':'maxTurns',
  '--seed':'seed','--baseline-level':'baselineLevel',
  '--challenger-level':'challengerLevel'};
 for(let i=0;i<argv.length;i++){
  const key=names[argv[i]],value=argv[++i];
  if(!key||value===undefined)throw Error('Unknown/incomplete option');
  options[key]=key==='group'?value:Number(value);
 }
 if(!Object.hasOwn(FIXTURES,options.group))throw Error('Invalid group');
 if(!Number.isInteger(options.pairs)||options.pairs<1||options.pairs>30)throw Error('Invalid pairs');
 if(!Number.isInteger(options.maxTurns)||options.maxTurns<20||options.maxTurns>250)throw Error('Invalid max turns');
 if(!Number.isSafeInteger(options.seed)||options.seed<0)throw Error('Invalid seed');
 if(!Number.isInteger(options.baselineLevel)||options.baselineLevel<1||options.baselineLevel>8||
  !Number.isInteger(options.challengerLevel)||options.challengerLevel<1||options.challengerLevel>8)
  throw Error('Invalid CPU skill');
 return options;
}
function percentile(data,p){
 if(!data.length)return null;
 data.sort((a,b)=>a-b);
 return data[Math.max(0,Math.ceil(p*data.length)-1)];
}
function evaluate(params){
 const fixtures=FIXTURES[params.group],errors=[],rows=[];
 const sampleTimes=[[],[]],actionsByRole=[0,0],actionTypesByRole=[{},{}];
 const endings={prizes:0,'no-pokemon':0,deckout:0,timeout:0,other:0};
 let wins=0,losses=0,unfinished=0;
 for(let i=0;i<fixtures.length;i++){
  const f=fixtures[i],left=D.list(f.left),right=D.list(f.right);
  // The baseline retains the 'left' deck within a fixture, independently of
  // side: paired reverse-deck fixtures avoid tuning only to one archetype.
  const options=argumentsOf([
   '--left-level',String(params.baselineLevel),
   '--right-level',String(params.challengerLevel),
   '--personality',f.persona,
   '--pairs',String(params.pairs),
   '--max-turns',String(params.maxTurns),
   '--seed',String(params.seed+i*7793)
  ]);
  options.format='online-preview';
  let w=0,l=0,u=0,started=performance.now();
  const fixtureActionTypes=[{},{}];
  for(let pair=0;pair<params.pairs;pair++)for(const swap of [false,true]){
   try{
    const result=duel(options,pair,swap,[left,right]);
    if(result.winner===1)w++;
    else if(result.winner===0)l++;
    else u++;
    endings[result.endReason]=(endings[result.endReason]||0)+1;
    for(let role=0;role<2;role++){
     for(const [action,count] of Object.entries(result.stats.byRole[role])){
      fixtureActionTypes[role][action]=(fixtureActionTypes[role][action]||0)+count;
      actionTypesByRole[role][action]=(actionTypesByRole[role][action]||0)+count;
     }
     const timings=result.stats.decisionPerActionMsByRole[role];
     actionsByRole[role]+=timings.length;
     sampleTimes[role].push(...timings);
    }
   }catch(err){
    errors.push({fixture:f.left+' vs '+f.right,pair,swap,
     error:String(err?.stack||err).slice(0,500)});
   }
  }
  wins+=w;losses+=l;unfinished+=u;
  rows.push({name:f.left+' vs '+f.right,personality:f.persona,
   games:w+l+u,challengerWins:w,baselineWins:l,unfinished:u,
   decisiveRate:w+l?w/(w+l):null,actionTypesByRole:fixtureActionTypes,
   elapsedMs:Math.round(performance.now()-started)});
 }
 const n=wins+losses;
 const perRoleLatencyMs=sampleTimes.map((a,i)=>({samples:actionsByRole[i],
  p95:percentile([...a],.95),p99:percentile([...a],.99),
  max:a.length?Math.max(...a):null}));
 return {group:params.group,seed:params.seed,pairsPerFixture:params.pairs,
  maxTurns:params.maxTurns,format:'online-preview',
  baselineLevel:params.baselineLevel,challengerLevel:params.challengerLevel,
  games:wins+losses+unfinished,challengerWins:wins,baselineWins:losses,
  unfinished,decisive:n,challengerDecisiveWinRate:n?wins/n:null,
  wilson95:n?wilson(wins,n):null,perRoleLatencyMs,actionTypesByRole,endings,rows,errors,
  note:'Decks are legal curated archetype test builds, not historical tournament records. Games are paired by seat; deck roles reverse in explicitly mirrored fixtures. Timeout is not a win.'};
}
if(require.main===module)try{
 const r=evaluate(parse(process.argv.slice(2)));
 console.log('COMPETITIVE_CPU_EVALUATION '+JSON.stringify(r));
 if(r.errors.length||!r.decisive||r.rows.some(x=>x.games!==r.pairsPerFixture*2))
  process.exitCode=1;
}catch(err){console.error(err.stack||err);process.exitCode=1;}
module.exports={FIXTURES,parse,evaluate};
