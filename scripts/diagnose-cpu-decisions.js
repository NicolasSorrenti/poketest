'use strict';
// Compare Mastermind and experimental Apex choices on identical real-engine
// positions, without mutating the baseline game or logging any opponent hand,
// deck or Prize contents. A disagreement is a clue, not proof of a blunder.
const {createGame}=require('../headless_duel');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {NPC_PROFILES}=require('../cpu_profiles');
const progression=require('../rpg_npc_deck_progression');
const AI=require('../cpu_policy');

const ARGUMENTS=new Set(['--seed','--turns','--samples','--scenario']);
function parse(argv){
 const out={seed:753871,turns:12,samples:35,scenario:'rpg'};
 for(let i=0;i<argv.length;i++){
  const key=argv[i],value=argv[++i];
  if(!ARGUMENTS.has(key)||value===undefined)throw Error('Unknown option '+key);
  out[key.slice(2)]=key==='--scenario'?value:Number(value);
 }
 if(!Number.isSafeInteger(out.seed)||out.seed<0||
   !Number.isInteger(out.turns)||out.turns<1||out.turns>80||
   !Number.isInteger(out.samples)||out.samples<1||out.samples>250||
   !['rpg','theme'].includes(out.scenario))throw Error('Invalid diagnosis parameters');
 return out;
}
function setup(o){
 const service=new ClassicLocalService();
 let cards,personality='balanced',format='classic';
 if(o.scenario==='rpg'){
  const npc='reina';
  const original=service.decklist('blackout');
  cards=progression.upgrade({npc,tier:3,original,catalog:CATALOG});
  personality=NPC_PROFILES[npc]?.personality||'balanced';
  format=cards.some(id=>/^neo[1-4]-/.test(id))?'online-preview':'gym-expanded';
 }else cards=service.decklist('brushfire');
 let g=createGame({decks:[cards,cards],seed:o.seed,format});
 g=AI.driveSide(g,{side:0,level:7,seed:o.seed+10,personality}).game;
 g=AI.driveSide(g,{side:1,level:7,seed:o.seed+20,personality}).game;
 if(g.mulliganBonus)g=AI.driveSide(g,{side:g.mulliganBonus.side,level:7,seed:o.seed+30,personality}).game;
 return {game:g,personality};
}
function audit(options){
 let {game,personality}=setup(options);
 const summary={scenario:options.scenario,seed:options.seed,positions:0,
  disagreements:0,apexWinsNow:0,mastermindWinsNow:0,
  rootSamples:0,allRootsVisited:0,chosenTypes:{},disagreementsByType:{},examples:[]};
 function sample(g){
  if(summary.positions>=options.samples||g.over||g.phase!=='game'||g.pendingDecision||
    (g.turn!==0&&g.turn!==1))return;
  const side=g.turn,params={side,personality,seed:options.seed+side+71};
  // Both policies receive the same reducer state. Only their legal proposed
  // commands are compared; neither returned game replaces the live position.
  const master=AI.chooseAction(g,{...params,level:7});
  const apex=AI.chooseAction(g,{...params,level:8,diagnostics:true});
  if(!master?.command||!apex?.command)return;
  const m=master.command,a=apex.command;
  const diag=apex.searchDiagnostics||{},view=AI.observation(g,side);
  summary.positions++;
  const key=x=>x.type+':'+JSON.stringify(x.payload||{});
  const moveType=m.type+'→'+a.type;
  summary.chosenTypes[moveType]=(summary.chosenTypes[moveType]||0)+1;
  if(diag.rootsAvailable){summary.rootSamples++;if(diag.rootsVisited===diag.rootsAvailable)summary.allRootsVisited++;}
  if(key(m)===key(a))return;
  summary.disagreements++;
  summary.disagreementsByType[moveType]=(summary.disagreementsByType[moveType]||0)+1;
  const mWin=!!(master.game.over&&master.game.winner===side);
  const aWin=!!(apex.game.over&&apex.game.winner===side);
  summary.mastermindWinsNow+=Number(mWin&&!aWin);
  summary.apexWinsNow+=Number(aWin&&!mWin);
  if(summary.examples.length<20){
   const name=id=>CATALOG.get(id)?.name||id||null;
   summary.examples.push({
    round:view.round,turnSerial:view.turnSerial,side,
    active:name(view.self.active?.id),enemyActive:name(view.opponent.active?.id),
    activeEnergy:view.self.active?.energies?.length||0,
    enemyActiveEnergy:view.opponent.active?.energies?.length||0,
    selfBench:view.self.bench.length,enemyBench:view.opponent.bench.length,
    selfPrizes:view.self.prizeCount,enemyPrizes:view.opponent.prizeCount,
    availableHand:view.self.hand.map(name),
    mastermind:m,apex:a,mastermindScore:master.score,apexScore:apex.score,
    immediateWin:{mastermind:mWin,apex:aWin},
    searchNodes:apex.searchNodes,search:diag.rootDiagnostics
   });
  }
 }
 sample(game);
 for(let turn=0;turn<options.turns&&!game.over;turn++){
  const side=game.pendingDecision?.actor??game.turn;
  const result=AI.driveSide(game,{side,level:7,personality,seed:options.seed+side+71,limit:200,
   onStep:next=>sample(next)});
  if(!result.steps)break;
  game=result.game;
  if(summary.positions>=options.samples)break;
 }
 return summary;
}
if(require.main===module){
 try{console.log('CPU_DECISION_DIAGNOSTIC '+JSON.stringify(audit(parse(process.argv.slice(2)))));}
 catch(e){console.error(e.stack||e);process.exitCode=1;}
}
module.exports={parse,setup,audit};
