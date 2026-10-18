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
 const opts={pairs:8,maxTurns:90,seed:7391,leftLevel:5,rightLevel:1,personality:'balanced',leftDeck:'blackout',rightDeck:'blackout',leftPlanning:null,rightPlanning:null,leftEvolutionTempo:null,rightEvolutionTempo:null,leftPrizeRace:null,rightPrizeRace:null,leftKnockoutTempo:null,rightKnockoutTempo:null,leftOpponentResponse:null,rightOpponentResponse:null,leftGraduatedNoise:null,rightGraduatedNoise:null,leftEnergyHorizon:null,rightEnergyHorizon:null,leftTurnSearch:null,rightTurnSearch:null,leftActionDiscipline:null,rightActionDiscipline:null,leftTrainerTactics:null,rightTrainerTactics:null,leftTrainerSelections:null,rightTrainerSelections:null,targetUpsetRate:0.05,logs:null};
 const keys={'--pairs':'pairs','--max-turns':'maxTurns','--seed':'seed','--left-level':'leftLevel','--right-level':'rightLevel',
  '--personality':'personality','--left-deck':'leftDeck','--right-deck':'rightDeck',
  '--left-planning':'leftPlanning','--right-planning':'rightPlanning',
  '--left-evolution-tempo':'leftEvolutionTempo','--right-evolution-tempo':'rightEvolutionTempo',
  '--left-prize-race':'leftPrizeRace','--right-prize-race':'rightPrizeRace',
  '--left-knockout-tempo':'leftKnockoutTempo','--right-knockout-tempo':'rightKnockoutTempo',
  '--left-opponent-response':'leftOpponentResponse','--right-opponent-response':'rightOpponentResponse',
  '--left-graduated-noise':'leftGraduatedNoise','--right-graduated-noise':'rightGraduatedNoise',
  '--left-energy-horizon':'leftEnergyHorizon','--right-energy-horizon':'rightEnergyHorizon',
  '--left-turn-search':'leftTurnSearch','--right-turn-search':'rightTurnSearch',
  '--left-action-discipline':'leftActionDiscipline','--right-action-discipline':'rightActionDiscipline',
  '--left-trainer-tactics':'leftTrainerTactics','--right-trainer-tactics':'rightTrainerTactics',
  '--left-trainer-selections':'leftTrainerSelections','--right-trainer-selections':'rightTrainerSelections',
  '--target-upset-rate':'targetUpsetRate','--logs':'logs'};
 for(let i=0;i<argv.length;i++){
  const k=keys[argv[i]];if(!k||i===argv.length-1)throw Error('Unknown or incomplete option '+argv[i]);
  const value=argv[++i];
  if(['leftPlanning','rightPlanning','leftEvolutionTempo','rightEvolutionTempo','leftPrizeRace','rightPrizeRace','leftKnockoutTempo','rightKnockoutTempo','leftOpponentResponse','rightOpponentResponse','leftGraduatedNoise','rightGraduatedNoise','leftEnergyHorizon','rightEnergyHorizon','leftTurnSearch','rightTurnSearch','leftActionDiscipline','rightActionDiscipline','leftTrainerTactics','rightTrainerTactics','leftTrainerSelections','rightTrainerSelections'].includes(k)){
   if(!['true','false'].includes(value))throw Error('Planning must be true or false');
   opts[k]=value==='true';
  }else opts[k]=['pairs','maxTurns','seed','leftLevel','rightLevel','targetUpsetRate'].includes(k)?Number(value):value;
 }
 if(!Number.isInteger(opts.pairs)||opts.pairs<1||opts.pairs>1000)throw Error('pairs must be between 1 and 1000');
 if(!Number.isInteger(opts.maxTurns)||opts.maxTurns<1||opts.maxTurns>1000)throw Error('Invalid max-turns');
 if(!Number.isFinite(opts.targetUpsetRate)||opts.targetUpsetRate<0||opts.targetUpsetRate>=.5)throw Error('Invalid target upset rate');
 configuration({level:opts.leftLevel,personality:opts.personality,planning:opts.leftPlanning??undefined,evolutionTempo:opts.leftEvolutionTempo??undefined,prizeRace:opts.leftPrizeRace??undefined,knockoutTempo:opts.leftKnockoutTempo??undefined,opponentResponse:opts.leftOpponentResponse??undefined,graduatedNoise:opts.leftGraduatedNoise??undefined,energyHorizon:opts.leftEnergyHorizon??undefined,turnSearch:opts.leftTurnSearch??undefined,actionDiscipline:opts.leftActionDiscipline??undefined,trainerTactics:opts.leftTrainerTactics??undefined});
 configuration({level:opts.rightLevel,personality:opts.personality,planning:opts.rightPlanning??undefined,evolutionTempo:opts.rightEvolutionTempo??undefined,prizeRace:opts.rightPrizeRace??undefined,knockoutTempo:opts.rightKnockoutTempo??undefined,opponentResponse:opts.rightOpponentResponse??undefined,graduatedNoise:opts.rightGraduatedNoise??undefined,energyHorizon:opts.rightEnergyHorizon??undefined,turnSearch:opts.rightTurnSearch??undefined,actionDiscipline:opts.rightActionDiscipline??undefined,trainerTactics:opts.rightTrainerTactics??undefined});
 return opts;
}
function wilson(wins,n,z=1.96){
 if(!n)return {lower:0,upper:1};
 const p=wins/n,z2=z*z,den=1+z2/n;
 const mid=(p+z2/(2*n))/den,half=z*Math.sqrt((p*(1-p)+z2/(4*n))/n)/den;
 return {lower:Math.max(0,mid-half),upper:Math.min(1,mid+half)};
}
function duel(opts,number,swap,decks){
 const profile=[{level:opts.leftLevel,personality:opts.personality,planning:opts.leftPlanning??undefined,evolutionTempo:opts.leftEvolutionTempo??undefined,prizeRace:opts.leftPrizeRace??undefined,knockoutTempo:opts.leftKnockoutTempo??undefined,opponentResponse:opts.leftOpponentResponse??undefined,graduatedNoise:opts.leftGraduatedNoise??undefined,energyHorizon:opts.leftEnergyHorizon??undefined,turnSearch:opts.leftTurnSearch??undefined,actionDiscipline:opts.leftActionDiscipline??undefined,trainerTactics:opts.leftTrainerTactics??undefined,trainerSelections:opts.leftTrainerSelections??undefined,seed:opts.seed+number*4001+13},
                {level:opts.rightLevel,personality:opts.personality,planning:opts.rightPlanning??undefined,evolutionTempo:opts.rightEvolutionTempo??undefined,prizeRace:opts.rightPrizeRace??undefined,knockoutTempo:opts.rightKnockoutTempo??undefined,opponentResponse:opts.rightOpponentResponse??undefined,graduatedNoise:opts.rightGraduatedNoise??undefined,energyHorizon:opts.rightEnergyHorizon??undefined,turnSearch:opts.rightTurnSearch??undefined,actionDiscipline:opts.rightActionDiscipline??undefined,trainerTactics:opts.rightTrainerTactics??undefined,trainerSelections:opts.rightTrainerSelections??undefined,seed:opts.seed+number*4001+31}];
 const roleForSide=swap?[1,0]:[0,1];
 const source=swap?[decks[1],decks[0]]:decks;
 // Respect the same historical deck format used by ClassicLocalService.
 // A Neo-theme deck is not legal under Base–Rocket; benchmarking must never
 // silently downgrade rules or count an invalid-deck crash as a CPU defeat.
 const allCards=source.flat();
 const format=allCards.some(id=>/^neo[1-4]-/.test(id))?'neo-theme':
  allCards.some(id=>/^gym[12]-/.test(id))?'gym-theme':
  allCards.some(id=>/^base4-/.test(id))?'theme-expanded':'classic';
 let game=createGame({decks:source,format,seed:opts.seed+number*11+101});
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
 stats.finalPrizesByRole=[0,1].map(role=>game.players[roleForSide.indexOf(role)].prizes.length);
 stats.finalDeckByRole=[0,1].map(role=>game.players[roleForSide.indexOf(role)].deck.length);
 const winner=game.over&&game.winner!==null?roleForSide[game.winner]:null;
 // Diagnose wins from authoritative public end state; avoid inferring one
 // player's performance from game length alone.
 const endReason=!game.over?'timeout':
  /cannot draw at the start of turn/i.test(game.message?.[0]||'')?'deckout':
  winner!==null&&game.players[game.winner].prizes.length===0?'prizes':
  winner!==null&&!game.players[1-game.winner].active&&
    !game.players[1-game.winner].bench.length?'no-pokemon':'other';
 return {seed:opts.seed+number*11+101,swap,winner,finished:game.over,
  endReason,stats,logs};
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
    evolutionTempo:configuration({level:opts.leftLevel,evolutionTempo:opts.leftEvolutionTempo??undefined}).evolutionTempo,
    prizeRace:configuration({level:opts.leftLevel,prizeRace:opts.leftPrizeRace??undefined}).prizeRace,
    knockoutTempo:configuration({level:opts.leftLevel,knockoutTempo:opts.leftKnockoutTempo??undefined}).knockoutTempo,
    opponentResponse:configuration({level:opts.leftLevel,opponentResponse:opts.leftOpponentResponse??undefined}).opponentResponse,
    graduatedNoise:configuration({level:opts.leftLevel,graduatedNoise:opts.leftGraduatedNoise??undefined}).graduatedNoise,
    energyHorizon:configuration({level:opts.leftLevel,energyHorizon:opts.leftEnergyHorizon??undefined}).energyHorizon,
    turnSearch:configuration({level:opts.leftLevel,turnSearch:opts.leftTurnSearch??undefined}).turnSearch,
    actionDiscipline:configuration({level:opts.leftLevel,actionDiscipline:opts.leftActionDiscipline??undefined}).actionDiscipline,
    trainerTactics:configuration({level:opts.leftLevel,trainerTactics:opts.leftTrainerTactics??undefined}).trainerTactics,
    trainerSelections:configuration({level:opts.leftLevel,trainerSelections:opts.leftTrainerSelections??undefined}).trainerSelections},
  challenger:{level:opts.rightLevel,deck:opts.rightDeck,
    planning:configuration({level:opts.rightLevel,planning:opts.rightPlanning??undefined}).planning,
    evolutionTempo:configuration({level:opts.rightLevel,evolutionTempo:opts.rightEvolutionTempo??undefined}).evolutionTempo,
    prizeRace:configuration({level:opts.rightLevel,prizeRace:opts.rightPrizeRace??undefined}).prizeRace,
    knockoutTempo:configuration({level:opts.rightLevel,knockoutTempo:opts.rightKnockoutTempo??undefined}).knockoutTempo,
    opponentResponse:configuration({level:opts.rightLevel,opponentResponse:opts.rightOpponentResponse??undefined}).opponentResponse,
    graduatedNoise:configuration({level:opts.rightLevel,graduatedNoise:opts.rightGraduatedNoise??undefined}).graduatedNoise,
    energyHorizon:configuration({level:opts.rightLevel,energyHorizon:opts.rightEnergyHorizon??undefined}).energyHorizon,
    turnSearch:configuration({level:opts.rightLevel,turnSearch:opts.rightTurnSearch??undefined}).turnSearch,
    actionDiscipline:configuration({level:opts.rightLevel,actionDiscipline:opts.rightActionDiscipline??undefined}).actionDiscipline,
    trainerTactics:configuration({level:opts.rightLevel,trainerTactics:opts.rightTrainerTactics??undefined}).trainerTactics,
    trainerSelections:configuration({level:opts.rightLevel,trainerSelections:opts.rightTrainerSelections??undefined}).trainerSelections},
  personality:opts.personality,pairs:opts.pairs,totalMatches:matches.length,conclusiveMatches:conclusive.length,
  wins,losses,drawsOrTimeouts:matches.length-conclusive.length,
  deckOutLossesByRole:[0,1].map(role=>matches.filter(x=>x.endReason==='deckout'&&x.winner===1-role).length),
  winCausesByRole:[0,1].map(role=>Object.fromEntries(['prizes','no-pokemon','deckout','other']
   .map(reason=>[reason,matches.filter(x=>x.winner===role&&x.endReason===reason).length]))),
  meanFinalPrizesByRole:[0,1].map(role=>matches.reduce((n,m)=>n+m.stats.finalPrizesByRole[role],0)/matches.length),
  actionCountsByRole:[0,1].map(role=>matches.reduce((acc,m)=>{for(const [k,v] of Object.entries(m.stats.byRole[role]))acc[k]=(acc[k]||0)+v;return acc;},{})),
  openingBenchByRole:[0,1].map(role=>({
   mean:matches.reduce((total,m)=>total+m.stats.openingBenchByRole[role],0)/matches.length,
   zero:matches.filter(m=>m.stats.openingBenchByRole[role]===0).length,
   atLeastTwo:matches.filter(m=>m.stats.openingBenchByRole[role]>=2).length
  })),
  winRateConclusive:conclusive.length?wins/conclusive.length:null,confidence95Conclusive:wilson(wins,conclusive.length),
  upsetTarget:{higherLevel:opts.leftLevel,lowerLevel:opts.rightLevel,targetMaximum:opts.targetUpsetRate,
   applicable:opts.leftLevel>opts.rightLevel,
   totalMatchUpsetRate:losses/matches.length,
   decisiveUpsetRate:conclusive.length?losses/conclusive.length:null,
   confidence95Decisive:wilson(losses,conclusive.length),
   observedPass:opts.leftLevel>opts.rightLevel&&conclusive.length>0&&losses/conclusive.length<=opts.targetUpsetRate,
   statisticallyVerified:opts.leftLevel>opts.rightLevel&&conclusive.length>0&&wilson(losses,conclusive.length).upper<=opts.targetUpsetRate,
   note:'Zero lower-level wins does not establish a five-percent ceiling without enough matches; draws are separate.'},
  meanDecisionMs:totals.actions?totals.decisionsMs/totals.actions:null,
  averageTurns:totals.turnSerial/matches.length,totalActions:totals.actions,
  illegalActions:totals.illegalActions,rejectedProposals:totals.rejectedProposals,probedCandidates:totals.probedCandidates,
  attacks:totals.attacks,attachments:totals.attachments,
  evolutions:totals.evolutions,trainers:totals.trainers,
  caveats:['Confidence interval excludes timeouts/draws','Same-deck paired games are not evidence of universal strength','Unported rule effects can distort outcomes','Illegal actions means executed invalid actions, not rejected legality probes','95% target applies to decisive games; Wilson upper confidence bound must be <=5% to claim statistically verified']};
 if(opts.logs)fs.writeFileSync(opts.logs,JSON.stringify({report,matches},null,2));
 return report;
}
if(require.main===module){
 try{const opts=argumentsOf(process.argv.slice(2));console.log(JSON.stringify(arena(opts),null,2));}
 catch(e){console.error(e);process.exitCode=1;}
}
module.exports={argumentsOf,wilson,duel,arena};
