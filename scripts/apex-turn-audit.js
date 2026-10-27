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
  const turn=entry.turnSerial;
  if(!Number.isInteger(turn))continue;
  const key=entry.side+':'+turn;
  if(!byTurn.has(key))byTurn.set(key,[]);
  byTurn.get(key).push(entry);
 }
 for(const [key,actions] of byTurn){
  const attachments=[];
  for(const [i,entry] of actions.entries()){
   const type=entry.command.type;
   const trainerName=type==='play_trainer'?CATALOG.get(entry.cardId)?.name:null;
   const isCenter=trainerName==='Pokémon Center';
   // These Trainers only change hand, deck, or discard zones; none
   // heals, switches, evolves, or removes attached Energy from the board.
   // Preserve a valid attachment trace until a genuinely board-changing
   // action or Pokémon Center consumes it.
   const preservesBoard=['Bill','Professor Oak',"Blaine's Last Resort",
    'Mail from Bill','Energy Search','Pokémon Trader',
    'Nightly Garbage Run','Pokédex'].includes(trainerName);
   if(type==='attach_energy')attachments.push({index:i,entry});
   if(isCenter){
    // Damage at attachment time alone does not prove Center discarded it:
    // the Pokémon may have been healed before Center was played.
    const damaged=entry.centerDamagedSlotsBefore;
    for(const attached of attachments){
     if(attached.entry.targetDamageBefore>0&&Array.isArray(damaged)&&
      damaged.includes(attached.entry.command.payload?.slot))
      violations.push({turn:key,index:i,type:'energy-before-pokemon-center',
       attachmentIndex:attached.index,cardId:attached.entry.cardId});
    }
    // Center consumes eligible attachments; never count them twice.
    attachments.length=0;
   }else if(!['attach_energy','bench'].includes(type)&&!preservesBoard){
    // Trainer effects, powers and position changes may heal or move a
    // Pokémon. Without a stable unit identity, do not accuse the CPU
    // based on a stale slot/damage snapshot.
    attachments.length=0;
   }
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
   const violations=audit(game.logs);
   rows.push({pair,swap,winner:game.winner,endReason:game.endReason,
    actions:game.stats.actions,attachments:game.stats.attachments,
    trainers:game.stats.trainers,violations});
  }catch(e){errors.push({pair,swap,error:String(e.stack||e).slice(0,500)});}
 }
 return {deck:p.deck,games:rows.length,rows,errors,
  violations:rows.flatMap(r=>r.violations),
  auditComplete:true,note:'Audits observed Pokémon Center sequencing only; does not prove optimal CPU play.'};
}
if(require.main===module)try{
 const r=run(parse(process.argv.slice(2)));
 console.log('APEX_TURN_AUDIT '+JSON.stringify(r));
 if(r.errors.length||r.violations.length)process.exitCode=1;
}catch(e){console.error(e.stack||e);process.exitCode=1;}
module.exports={audit,parse,run};
