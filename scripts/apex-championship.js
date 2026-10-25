'use strict';
// Experimental Apex championship. These are independently configurable
// policies, not claims that any candidate is better than the live champion.
const {argumentsOf,duel}=require('../benchmark_cpu');
const {FIXTURES}=require('./benchmark-cpu-competitive');
const DECKS=require('../cpu_competitive_decks');
const VARIANTS=Object.freeze({
 champion:Object.freeze({level:8,description:'Current production Apex'}),
 conservative:Object.freeze({level:8,description:'Apex without speculative opponent response',opponentResponse:false}),
 direct:Object.freeze({level:8,description:'Apex without secondary planning bonus',planning:false}),
 tempo:Object.freeze({level:8,description:'Apex without energy horizon heuristic',energyHorizon:false}),
 mastermind:Object.freeze({level:7,description:'Previous Mastermind policy'})
});
const GROUPS=Object.keys(FIXTURES);
function parse(args){
 const opts={group:'aggression',pairs:2,seed:20261025,maxTurns:100,challenger:'conservative'};
 const keys={'--group':'group','--pairs':'pairs','--seed':'seed','--max-turns':'maxTurns','--challenger':'challenger'};
 for(let i=0;i<args.length;i++){
  const k=keys[args[i]],v=args[++i];
  if(!k||v===undefined)throw Error('Unknown or incomplete championship argument');
  opts[k]=['group','challenger'].includes(k)?v:Number(v);
 }
 if(!GROUPS.includes(opts.group)||!Object.hasOwn(VARIANTS,opts.challenger)||opts.challenger==='champion')throw Error('Unknown group or challenger');
 if(!Number.isSafeInteger(opts.seed)||opts.seed<0||!Number.isInteger(opts.pairs)||opts.pairs<1||opts.pairs>30||
    !Number.isInteger(opts.maxTurns)||opts.maxTurns<20||opts.maxTurns>250)throw Error('Invalid numeric parameter');
 return opts;
}
function applyVariant(opts,prefix,v){
 opts[prefix+'Level']=v.level;
 for(const key of ['planning','opponentResponse','energyHorizon'])
  if(Object.hasOwn(v,key))opts[prefix+key[0].toUpperCase()+key.slice(1)]=v[key];
}
function evaluate(params){
 const challenger=VARIANTS[params.challenger],rows=[],errors=[];
 let wins=0,losses=0,unfinished=0,latencies=[[],[]];
 for(let i=0;i<FIXTURES[params.group].length;i++){
  const f=FIXTURES[params.group][i],seed=params.seed+i*7793;
  const opts=argumentsOf(['--left-level','8','--right-level',String(challenger.level),
   '--personality',f.persona,'--seed',String(seed),
   '--max-turns',String(params.maxTurns),'--pairs',String(params.pairs)]);
  opts.format='online-preview';
  applyVariant(opts,'left',VARIANTS.champion);
  applyVariant(opts,'right',challenger);
  const decks=[DECKS.list(f.left),DECKS.list(f.right)];
  let cw=0,bw=0,u=0;
  for(let pair=0;pair<params.pairs;pair++)for(const swap of [false,true]){
   try{
    const result=duel(opts,pair,swap,decks);
    if(result.winner===1){cw++;wins++;}
    else if(result.winner===0){bw++;losses++;}
    else{u++;unfinished++;}
    for(let role=0;role<2;role++)latencies[role].push(...result.stats.decisionPerActionMsByRole[role]);
   }catch(e){errors.push({fixture:f.left+' vs '+f.right,pair,swap,error:String(e.stack||e).slice(0,600)});}
  }
  rows.push({fixture:f.left+' vs '+f.right,personality:f.persona,challengerWins:cw,championWins:bw,unfinished:u});
 }
 const quantile=(values,p)=>values.length?[...values].sort((a,b)=>a-b)[Math.ceil(p*values.length)-1]:null;
 return {champion:'champion',challenger:params.challenger,group:params.group,seed:params.seed,
  games:wins+losses+unfinished,challengerWins:wins,championWins:losses,unfinished,
  decisiveWinRate:wins+losses?wins/(wins+losses):null,
  decisionLatencyMs:{champion:{p95:quantile(latencies[0],.95),p99:quantile(latencies[0],.99)},
   challenger:{p95:quantile(latencies[1],.95),p99:quantile(latencies[1],.99)}},
  rows,errors,promotionEligible:false,
  note:'Exploratory matches only. No automatic promotion: validate on new holdout seeds, RPG decks and multiple archetypes.'};
}
if(require.main===module)try{
 const r=evaluate(parse(process.argv.slice(2)));
 console.log('APEX_CHAMPIONSHIP '+JSON.stringify(r));
 if(r.errors.length||r.games===0)process.exitCode=1;
}catch(e){console.error(e.stack||e);process.exitCode=1;}
module.exports={VARIANTS,parse,evaluate};
