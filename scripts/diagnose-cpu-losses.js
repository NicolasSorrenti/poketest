'use strict';
// Post-mortem: replay authoritative duel command transcripts from Apex losses
// and compare each first Apex turn choice with Mastermind on THE SAME state.
// The test never accesses the opposing private hand, deck, or Prizes for
// scoring; the engine's full transcript is used only to replay legal history.
const {createGame,reduce,CATALOG}=require('../headless_duel');
const {ClassicLocalService}=require('../classic_local_service');
const {argumentsOf,duel}=require('../benchmark_cpu');
const AI=require('../cpu_policy');

function diagnose({pairs=4,seed=641209,maxTurns=85,deck='blackout',maxExamples=12}={}){
 const options=argumentsOf(['--pairs',String(pairs),'--max-turns',String(maxTurns),
  '--seed',String(seed),'--left-level','7','--right-level','8',
  '--left-deck',deck,'--right-deck',deck]);
 const service=new ClassicLocalService(),cards=service.decklist(deck);
 const out={pairs,seed,deck,duels:0,apexLosses:0,replaysVerified:0,
  firstTurnComparisons:0,disagreements:0,
  candidateMismatch:0,differentByType:{},examples:[]};
 const name=id=>CATALOG.get(id)?.name||id;
 for(let number=0;number<pairs;number++)for(const swap of [false,true]){
  const match=duel(options,number,swap,[cards,cards]);out.duels++;
  if(match.winner!==0)continue;out.apexLosses++;
  const roleForSide=swap?[1,0]:[0,1];
  let game=createGame({decks:[cards,cards],format:'classic',seed:seed+number*11+101});
  const observedTurns=new Set();
  for(const record of match.logs){
   const side=record.side,action=record.command;
   if(game.phase==='game'&&!game.pendingDecision&&game.turn===side&&
     roleForSide[side]===1&&!observedTurns.has(game.turnSerial)){
    observedTurns.add(game.turnSerial);
    const p={side,personality:options.personality,seed:seed+number*4001+31};
    const master=AI.chooseAction(game,{...p,level:7});
    const apex=AI.chooseAction(game,{...p,level:8,diagnostics:true});
    if(master?.command&&apex?.command){
     out.firstTurnComparisons++;
     const id=x=>x.type+':'+JSON.stringify(x.payload||{});
     if(id(apex.command)!==id(action))out.candidateMismatch++;
     if(id(master.command)!==id(apex.command)){
      out.disagreements++;
      const key=master.command.type+'→'+apex.command.type;
      out.differentByType[key]=(out.differentByType[key]||0)+1;
      if(out.examples.length<maxExamples){
       const o=AI.observation(game,side),d=apex.searchDiagnostics||{};
       out.examples.push({
        duel:number,swap,turnSerial:game.turnSerial,round:o.round,
        ownActive:name(o.self.active?.id),opponentActive:name(o.opponent.active?.id),
        ownEnergies:o.self.active?.energies?.length||0,
        opponentEnergies:o.opponent.active?.energies?.length||0,
        ownPrizes:o.self.prizeCount,opponentPrizes:o.opponent.prizeCount,
        ownBench:o.self.bench.length,opponentBench:o.opponent.bench.length,
        hand:o.self.hand.map(name),mastermind:master.command,apex:apex.command,
        actuallyPlayed:action,rootCoverage:[d.rootsVisited,d.rootsAvailable],
        roots:d.rootDiagnostics
       });
      }
     }
    }
   }
   const r=reduce(game,side,action);
   if(!r.ok)throw Error('Transcript replay illegal at duel '+number+' '+JSON.stringify(action)+': '+r.error);
   game=r.game;
  }
  const finalWinner=game.over&&game.winner!==null?roleForSide[game.winner]:null;
  if(finalWinner!==match.winner||game.over!==match.finished)
   throw Error('Transcript replay diverged for duel '+number+' swap '+swap);
  out.replaysVerified++;
 }
 return out;
}
function parse(argv){
 const args={};
 const keys={'--pairs':'pairs','--seed':'seed','--max-turns':'maxTurns','--deck':'deck'};
 for(let i=0;i<argv.length;i++){const k=keys[argv[i]],v=argv[++i];
  if(!k||v===undefined)throw Error('Invalid flag');args[k]=k==='deck'?v:Number(v);}
 if(args.pairs!==undefined&&(!Number.isInteger(args.pairs)||args.pairs<1||args.pairs>20))
  throw Error('Invalid pairs');
 if(args.maxTurns!==undefined&&(!Number.isInteger(args.maxTurns)||args.maxTurns<5||args.maxTurns>150))
  throw Error('Invalid turn cap');
 return args;
}
if(require.main===module)try{
 console.log('CPU_APEX_LOSS_REPLAY '+JSON.stringify(diagnose(parse(process.argv.slice(2)))));
}catch(e){console.error(e.stack||e);process.exitCode=1;}
module.exports={parse,diagnose};
