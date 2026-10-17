'use strict';
// Skill separation audit: fresh, paired, equal-deck games for each adjacent
// difficulty. Reports the user's <=5% decisive upset target honestly, including
// Wilson uncertainty. Does not intentionally alter the game or force losses.
const {argumentsOf,arena,wilson}=require('./benchmark_cpu');
const DEFAULT_DECKS=['blackout','brushfire'];
function parse(argv){
 const o={pairs:25,maxTurns:120,seed:41093,decks:DEFAULT_DECKS,target:0.05,strict:false};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];
  if(key==='--strict'){o.strict=true;continue;}
  if(!['--pairs','--max-turns','--seed','--decks','--target'].includes(key)||i===argv.length-1)
   throw Error('Unknown or incomplete argument: '+key);
  const v=argv[++i];
  if(key==='--decks')o.decks=v.split(',').map(x=>x.trim());
  else o[{'--pairs':'pairs','--max-turns':'maxTurns','--seed':'seed','--target':'target'}[key]]=Number(v);
 }
 if(!Number.isInteger(o.pairs)||o.pairs<1||o.pairs>500)throw Error('Invalid pairs');
 if(!Number.isInteger(o.maxTurns)||o.maxTurns<1||o.maxTurns>1000)throw Error('Invalid turns');
 if(!Number.isSafeInteger(o.seed)||o.seed<0)throw Error('Invalid seed');
 if(!Number.isFinite(o.target)||o.target<0||o.target>=.5)throw Error('Invalid target');
 if(!o.decks.length||o.decks.some(x=>!x))throw Error('Invalid deck list');
 return o;
}
function audit(o){
 const byDeck=[],totals=[];
 for(let upper=2;upper<=5;upper++){
  let decisive=0,upsets=0,draws=0,games=0;
  for(let di=0;di<o.decks.length;di++){
   const deck=o.decks[di];
   const params=argumentsOf(['--pairs',String(o.pairs),'--max-turns',String(o.maxTurns),
    '--seed',String(o.seed+upper*100019+di*7907),
    '--left-level',String(upper),'--right-level',String(upper-1),
    '--left-deck',deck,'--right-deck',deck,'--target-upset-rate',String(o.target)]);
   const result=arena(params);
   const row={deck,higherLevel:upper,lowerLevel:upper-1,total:result.totalMatches,
    higherWins:result.wins,lowerWins:result.losses,draws:result.drawsOrTimeouts,
    lowerWinRateDecisive:result.upsetTarget.decisiveUpsetRate,
    confidence95:result.upsetTarget.confidence95Decisive,
    observedUnderTarget:result.upsetTarget.observedPass,
    verifiedUnderTarget:result.upsetTarget.statisticallyVerified};
   byDeck.push(row);
   decisive+=result.conclusiveMatches;upsets+=result.losses;draws+=result.drawsOrTimeouts;
   games+=result.totalMatches;
  }
  const bounds=wilson(upsets,decisive),rate=decisive?upsets/decisive:null;
  totals.push({higherLevel:upper,lowerLevel:upper-1,total:games,decisive,
   lowerWins:upsets,higherWins:decisive-upsets,draws,lowerWinRateDecisive:rate,
   confidence95:bounds,target:o.target,observedUnderTarget:rate!==null&&rate<=o.target,
   verifiedUnderTarget:decisive>0&&bounds.upper<=o.target});
 }
 return {target:o.target,perDeck:byDeck,aggregatedAdjacent:totals,
  allPairsObservedUnderTarget:totals.every(x=>x.observedUnderTarget),
  allPairsVerifiedUnderTarget:totals.every(x=>x.verifiedUnderTarget),
  totalGames:totals.reduce((a,x)=>a+x.total,0),
  caveat:'No AI can guarantee a 95% win rate in a fair stochastic TCG with equal decks. Results are measurements, not fabricated or enforced outcomes. A finite-sample upper confidence bound is required for statistical verification.'};
}
if(require.main===module){
 try{const options=parse(process.argv.slice(2)),result=audit(options);
  console.log(JSON.stringify(result,null,2));
  if(options.strict&&!result.allPairsVerifiedUnderTarget)process.exitCode=1;
 }catch(e){console.error(e);process.exitCode=1;}
}
module.exports={parse,audit};
