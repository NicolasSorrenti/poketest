'use strict';
// Paired real-engine evaluation against production RPG Champion (Level 5).
// Intentionally measures strength AND responsiveness. This is an empirical
// audit, not a claim that a skill number guarantees stronger play.
const {performance}=require('node:perf_hooks');
const {argumentsOf,arena,wilson}=require('../benchmark_cpu');
const FIXTURES=Object.freeze([
 {name:'blackout mirror',left:'blackout',right:'blackout'},
 {name:'brushfire mirror',left:'brushfire',right:'brushfire'},
 {name:'blackout vs brushfire',left:'blackout',right:'brushfire'},
 {name:'brushfire vs blackout',left:'brushfire',right:'blackout'},
 {name:'overgrowth mirror',left:'overgrowth',right:'overgrowth'},
 {name:'zap mirror',left:'zap',right:'zap'},
 {name:'overgrowth vs zap',left:'overgrowth',right:'zap'},
 {name:'zap vs overgrowth',left:'zap',right:'overgrowth'}
]);
function parse(args){
 const options={level:6,pairs:2,maxTurns:40,seed:28671,fixtures:FIXTURES.length};
 for(let i=0;i<args.length;i++){
  const key=args[i],value=args[++i];
  if(!Object.hasOwn({'--level':1,'--pairs':1,'--max-turns':1,'--seed':1,'--fixtures':1},key))
   throw Error('Unknown benchmark argument '+key);
  options[{'--level':'level','--pairs':'pairs','--max-turns':'maxTurns','--seed':'seed','--fixtures':'fixtures'}[key]]=Number(value);
 }
 if(!Number.isInteger(options.level)||options.level<6||options.level>8)throw Error('Level must be 6–8');
 if(!Number.isInteger(options.pairs)||options.pairs<1||options.pairs>100)throw Error('Pairs must be 1–100');
 if(!Number.isInteger(options.maxTurns)||options.maxTurns<5||options.maxTurns>250)throw Error('Turns must be 5–250');
 if(!Number.isSafeInteger(options.seed)||options.seed<0)throw Error('Invalid seed');
 if(!Number.isInteger(options.fixtures)||options.fixtures<1||options.fixtures>FIXTURES.length)throw Error('Invalid fixtures');
 return options;
}
function evaluate(opts){
 const rows=[];let championWins=0,challengerWins=0,unfinished=0;
 let decisions=0,decisionMs=0,overallMs=0,rejected=0;
 for(let i=0;i<opts.fixtures;i++){
  const f=FIXTURES[i],seed=opts.seed+i*7919;
  const args=['--pairs',String(opts.pairs),'--max-turns',String(opts.maxTurns),
   '--seed',String(seed),'--left-level','5','--right-level',String(opts.level),
   '--left-deck',f.left,'--right-deck',f.right,
   // Match production RPG Champion settings; the challenger uses its own
   // level's default tactical settings and bounded preparation lookahead.
   '--left-prize-race','true','--left-knockout-tempo','true',
   '--left-opponent-response','true'];
  const start=performance.now(),report=arena(argumentsOf(args));
  const ms=performance.now()-start;
  const actualActions=report.totalActions;
  decisions+=actualActions;decisionMs+=report.meanDecisionMs*actualActions;
  overallMs+=ms;championWins+=report.wins;challengerWins+=report.losses;
  unfinished+=report.drawsOrTimeouts;rejected+=report.rejectedProposals;
  rows.push({fixture:f.name,games:report.totalMatches,decisive:report.conclusiveMatches,
   championWins:report.wins,challengerWins:report.losses,unfinished:report.drawsOrTimeouts,
   challengerWinRateDecisive:report.conclusiveMatches?report.losses/report.conclusiveMatches:null,
   meanActionMs:report.meanDecisionMs,matchElapsedMs:Math.round(ms),
   rejectedLegalityProbes:report.rejectedProposals});
 }
 const decisive=championWins+challengerWins;
 const result={level:opts.level,against:'RPG Champion 5, advanced tactics on',pairsPerFixture:opts.pairs,
  maxTurns:opts.maxTurns,seed:opts.seed,games:decisive+unfinished,
  decisive,championWins,challengerWins,unfinished,
  challengerWinRateDecisive:decisive?challengerWins/decisive:null,
  challengerWinRate95:decisive?wilson(challengerWins,decisive):{lower:0,upper:1},
  meanDecisionMs:decisions?decisionMs/decisions:null,overallElapsedMs:Math.round(overallMs),
  rejectedLegalityProbes:rejected,fixtures:rows,
  recommendation:'Do not automatically promote: require statistically persuasive multi-archetype wins AND acceptable p95 latency before choosing a campaign default.',
  caveat:'Small mirrored runs are smoke-level comparisons; seed/matchup sensitivity, timeouts and policy asymmetries matter.'};
 return result;
}
if(require.main===module){
 try{const o=parse(process.argv.slice(2)),r=evaluate(o);console.log('CPU_TIER_EVALUATION '+JSON.stringify(r));
 if(r.decisive===0)process.exitCode=2;}
 catch(e){console.error(e.stack||e);process.exitCode=1;}
}
module.exports={parse,evaluate,FIXTURES};
