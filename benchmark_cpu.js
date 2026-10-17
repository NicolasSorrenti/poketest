'use strict';
// Paired, repeatable, headless CPU-vs-CPU evaluation. No UI or network needed.
// Run: node benchmark_cpu.js --pairs 10 --max-turns 100 --logs cpu-arena.json
const fs=require('node:fs');
const {performance}=require('node:perf_hooks');
const {createGame}=require('./headless_duel');
const {countCards}=require('./core_rules');
const {driveSide,configuration}=require('./cpu_policy');
const {ClassicLocalService}=require('./classic_local_service');

function argumentsOf(argv){
 const opts={pairs:8,maxTurns:90,seed:7391,leftLevel:5,rightLevel:1,personality:'balanced',leftDeck:'blackout',rightDeck:'blackout',leftPlanning:null,rightPlanning:null,leftEvolutionTempo:null,rightEvolutionTempo:null,logs:null};
 const keys={'--pairs':'pairs','--max-turns':'maxTurns','--seed':'seed','--left-level':'leftLevel','--right-level':'rightLevel',
  '--personality':'personality','--left-deck':'leftDeck','--right-deck':'rightDeck',
  '--left-planning':'leftPlanning','--right-planning':'rightPlanning',
  '--left-evolution-tempo':'leftEvolutionTempo','--right-evolution-tempo':'rightEvolutionTempo','--logs':'logs'};
 for(let i=0;i<argv.length;i++){
  const k=keys[argv[i]];if(!k||i===argv.length-1)throw Error('Unknown or incomplete option '+argv[i]);
  const value=argv[++i];
  if(['leftPlanning','rightPlanning','leftEvolutionTempo','rightEvolutionTempo'].includes(k)){
   if(!['true','false'].includes(value))throw Error('Planning must be true or false');
   opts[k]=value==='true';
  }else opts[k]=['pairs','maxTurns','seed','leftLevel','rightLevel'].includes(k)?Number(value):value;
 }
 if(!Number.isInteger(opts.pairs)||opts.pairs<1||opts.pairs>1000)throw Error('pairs must be between 1 and 1000');
 if(!Number.isInteger(opts.maxTurns)||opts.maxTurns<1||opts.maxTurns>1000)throw Error('Invalid max-turns');
 configuration({level:opts.leftLevel,personality:opts.personality,planning:opts.leftPlanning??undefined,evolutionTempo:opts.leftEvolutionTempo??undefined});
 configuration({level:opts.rightLevel,personality:opts.personality,planning:opts.rightPlanning??undefined,evolutionTempo:opts.rightEvolutionTempo??undefined});
 return opts;
}
function wilson(wins,n,z=1.96){
 if(!n)return {lower:0,upper:1};
 const p=wins/n,z2=z*z,den=1+z2/n;
 const mid=(p+z2/(2*n))/den,half=z*Math.sqrt((p*(1-p)+z2/(4*n))/n)/den;
 return {lower:Math.max(0,mid-half),upper:Math.min(1,mid+half)};
}
function duel(opts,number,swap,decks){
 const profile=[{level:opts.leftLevel,personality:opts.personality,planning:opts.leftPlanning??undefined,evolutionTempo:opts.leftEvolutionTempo??undefined,seed:opts.seed+number*4001+13},
                {level:opts.rightLevel,personality:opts.personality,planning:opts.rightPlanning??undefined,evolutionTempo:opts.rightEvolutionTempo??undefined,seed:opts.seed+number*4001+31}];
 const roleForSide=swap?[1,0]:[0,1];
 const source=swap?[decks[1],decks[0]]:decks;
 let game=createGame({decks:source,format:'classic',seed:opts.seed+number*11+101});
 const logs=[],stats={actions:0,attacks:0,attachments:0,evolutions:0,trainers:0,choices:0,decisionsMs:0,illegalActions:0,rejectedProposals:0,probedCandidates:0,byRole:[{},{}],openingBenchByRole:[0,0]};
 const start=performance.now();
 for(let side=0;side<2;side++){
  const r=driveSide(game,{...profile[roleForSide[side]],side,limit:200});
  if(!r.steps)throw Error('CPU could not set up');
  game=r.game;logs.push(...r.commands);stats.actions+=r.steps;
 }
 for(let side=0;side<2;side++)stats.openingBenchByRole[roleForSide[side]]=game.players[side].bench.length;
 for(let step=0;step<opts.maxTurns&&!game.over;step++){
  const side=game.pendingDecision?game.pendingDecision.actor:game.turn;
  const startDecision=performance.now();
  const r=driveSide(game,{...profile[roleForSide[side]],side,limit:200});
  stats.decisionsMs+=performance.now()-startDecision;
  if(!r.steps){stats.stalled=true;break;}
  game=r.game;stats.actions+=r.steps;logs.push(...r.commands);
  stats.rejectedProposals+=r.commands.reduce((n,a)=>n+(a.rejectedCandidates||0),0);
  stats.probedCandidates+=r.commands.reduce((n,a)=>n+(a.probedCandidates||0),0);
  for(const {command} of r.commands){
   const role=roleForSide[side],key=command.type;
   stats.byRole[role][key]=(stats.byRole[role][key]||0)+1;
   if(command.type==='attack')stats.attacks++;
   if(command.type==='attach_energy')stats.attachments++;
   if(command.type==='evolve')stats.evolutions++;
   if(command.type==='play_trainer')stats.trainers++;
   if(command.type==='choose')stats.choices++;
  }
  if(game.players.some(x=>countCards(x)!==60))throw Error('Engine card conservation failure at step '+step);
 }
 stats.elapsedMs=performance.now()-start;
 stats.turnSerial=game.turnSerial;
 const winner=game.over&&game.winner!==null?roleForSide[game.winner]:null;
 return {seed:opts.seed+number*11+101,swap,winner,finished:game.over,
  endReason:/cannot draw at the start of turn/i.test(game.message?.[0]||'')?'deckout':game.over?'victory':'timeout',stats,logs};
}
function arena(opts){
 const service=new ClassicLocalService(),decks=[service.decklist(opts.leftDeck),service.decklist(opts.rightDeck)];
 const matches=[];
 for(let i=0;i<opts.pairs;i++)for(const swap of [false,true])matches.push(duel(opts,i,swap,decks));
 const conclusive=matches.filter(x=>x.winner!==null);
 const wins=conclusive.filter(x=>x.winner===0).length,losses=conclusive.length-wins;
 const totals=matches.reduce((s,x)=>{for(const [k,v] of Object.entries(x.stats))if(typeof v==='number')s[k]=(s[k]||0)+v;return s;},{});
 const report={baseline:{level:opts.leftLevel,deck:opts.leftDeck,
    planning:configuration({level:opts.leftLevel,planning:opts.leftPlanning??undefined}).planning,
    evolutionTempo:configuration({level:opts.leftLevel,evolutionTempo:opts.leftEvolutionTempo??undefined}).evolutionTempo},
  challenger:{level:opts.rightLevel,deck:opts.rightDeck,
    planning:configuration({level:opts.rightLevel,planning:opts.rightPlanning??undefined}).planning,
    evolutionTempo:configuration({level:opts.rightLevel,evolutionTempo:opts.rightEvolutionTempo??undefined}).evolutionTempo},
  personality:opts.personality,pairs:opts.pairs,totalMatches:matches.length,conclusiveMatches:conclusive.length,
  wins,losses,drawsOrTimeouts:matches.length-conclusive.length,
  deckOutLossesByRole:[0,1].map(role=>matches.filter(x=>x.endReason==='deckout'&&x.winner===1-role).length),
  actionCountsByRole:[0,1].map(role=>matches.reduce((acc,m)=>{for(const [k,v] of Object.entries(m.stats.byRole[role]))acc[k]=(acc[k]||0)+v;return acc;},{})),
  openingBenchByRole:[0,1].map(role=>({
   mean:matches.reduce((total,m)=>total+m.stats.openingBenchByRole[role],0)/matches.length,
   zero:matches.filter(m=>m.stats.openingBenchByRole[role]===0).length,
   atLeastTwo:matches.filter(m=>m.stats.openingBenchByRole[role]>=2).length
  })),
  winRateConclusive:conclusive.length?wins/conclusive.length:null,confidence95Conclusive:wilson(wins,conclusive.length),
  meanDecisionMs:totals.actions?totals.decisionsMs/totals.actions:null,
  averageTurns:totals.turnSerial/matches.length,totalActions:totals.actions,
  illegalActions:totals.illegalActions,rejectedProposals:totals.rejectedProposals,probedCandidates:totals.probedCandidates,
  attacks:totals.attacks,attachments:totals.attachments,
  evolutions:totals.evolutions,trainers:totals.trainers,
  caveats:['Confidence interval excludes timeouts/draws','Same-deck paired games are not evidence of universal strength','Unported rule effects can distort outcomes','Illegal actions means executed invalid actions, not rejected legality probes']};
 if(opts.logs)fs.writeFileSync(opts.logs,JSON.stringify({report,matches},null,2));
 return report;
}
if(require.main===module){
 try{const opts=argumentsOf(process.argv.slice(2));console.log(JSON.stringify(arena(opts),null,2));}
 catch(e){console.error(e);process.exitCode=1;}
}
module.exports={argumentsOf,wilson,duel,arena};
