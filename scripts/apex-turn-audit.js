'use strict';
// Detect irreversible turn-level resource blunders from real reducer actions.
// This does not inspect private opponent information or predict hidden draws.
const {argumentsOf,duel}=require('../benchmark_cpu');
const D=require('../cpu_competitive_decks');
const {CATALOG}=require('../headless_duel');
function audit(commands){
 const violations=[];
 const byTurn=new Map();
 for(const entry of commands){
  const c=entry.command||entry;
  const turn=entry.turnSerial??entry.turn??null;
  if(turn===null)continue;
  if(!byTurn.has(turn))byTurn.set(turn,[]);
  byTurn.get(turn).push(c);
 }
 for(const [turn,actions] of byTurn){
  let energyAttachments=0;
  for(const [i,a] of actions.entries()){
   if(a.type==='attach_energy')energyAttachments++;
   if(a.type==='play_trainer'&&CATALOG.get(a.cardId)?.name==='Pokémon Center'&&energyAttachments)
    violations.push({turn,index:i,type:'energy-before-pokemon-center'});
  }
 }
 return violations;
}
function parse(argv){
 const p={pairs:2,maxTurns:100,seed:20261025,deck:'rain_dance'};
 const keys={'--pairs':'pairs','--max-turns':'maxTurns','--seed':'seed','--deck':'deck'};
 for(let i=0;i<argv.length;i++){
  const k=keys[argv[i]],v=argv[++i];
  if(!k||v===undefined)throw Error('Invalid argument');
  p[k]=k==='deck'?v:Number(v);
 }
 if(!['rain_dance','venusaur','feraligatr','typhlosion'].includes(p.deck)||
 !Number.isInteger(p.pairs)||p.pairs<1||p.pairs>30||
 !Number.isInteger(p.maxTurns)||p.maxTurns<20||p.maxTurns>250||
 !Number.isSafeInteger(p.seed)||p.seed<0)throw Error('Invalid audit settings');
 return p;
}
function run(p){
 const opts=argumentsOf(['--left-level','8','--right-level','8',
  '--pairs',String(p.pairs),'--max-turns',String(p.maxTurns),'--seed',String(p.seed)]);
 opts.format='online-preview';
 const decks=[D.list(p.deck),D.list(p.deck)];
 const rows=[],errors=[];
 for(let pair=0;pair<p.pairs;pair++)for(const swap of [false,true]){
  try{
   const game=duel(opts,pair,swap,decks);
   // A result records actual action types and sequencing, but not every
   // Trainer card identity. Report aggregate turn statistics until the
   // richer action trace is available; never claim zero blunders from
   // incomplete instrumentation.
   rows.push({pair,swap,winner:game.winner,endReason:game.endReason,
    actions:game.stats.actions,attachments:game.stats.attachments,
    trainers:game.stats.trainers,traceCoverage:'action-types-only'});
  }catch(e){errors.push({pair,swap,error:String(e.stack||e).slice(0,500)});}
 }
 return {deck:p.deck,games:rows.length,rows,errors,
  auditComplete:false,note:'Trace coverage incomplete: card-specific sequencing needs enriched action logging.'};
}
if(require.main===module)try{
 const r=run(parse(process.argv.slice(2)));
 console.log('APEX_TURN_AUDIT '+JSON.stringify(r));
 if(r.errors.length)process.exitCode=1;
}catch(e){console.error(e.stack||e);process.exitCode=1;}
module.exports={audit,parse,run};
