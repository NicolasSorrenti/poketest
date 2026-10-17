'use strict';
// Exploratory smoke probe. This is NOT a historical fidelity certification.
// It verifies that each compiled Classic program can traverse the authoritative
// reducer with valid choices under a manufactured, noncompetitive game state.
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const FORMAT=require('./classic_format');
const {compile}=require('./attack_effects_core');
const fs=require('node:fs');
const energy={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99'};
const basicDeck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,en=[],damage=0)=>({id,under:[],energies:[...en],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
const run=[];
for(const set of FORMAT.SETS)for(const c of require('./cards/'+set+'.json'))for(const [attackIndex,a] of (c.attacks||[]).entries()){
 const program=compile(a);if(!program)continue;
 // Pokémon with Powers now enter the reducer instead of being excluded.
 const game=createGame({format:'classic',seed:3,decks:[basicDeck,basicDeck]});game.phase='game';game.turn=0;game.round=2;game.turnSerial=0;game.rngState=1000;
 game.players.forEach((p,side)=>{
  p.active=unit(side?'base1-11':c.id,side?['base1-102','base1-99']: (a.cost||[]).map(x=>energy[x]||'base1-99').concat(['base1-99','base1-99','base1-98']),side?0:10);
  p.bench=Array.from({length:side?5:4},()=>unit(side?'base1-44':'base1-27'));
  p.deck=['base1-99','base1-99','base2-49','base1-6','base1-102','base1-98','base1-99'];
  p.discard=side?[]:['base1-99','base1-98','base1-91'];p.hand=[];p.prizes=Array(6).fill('base1-99');
 });
 if(a.name==='Dream Eater')game.players[1].active.status='Asleep';
 const g=game;let result=applyCommand(g,0,{type:'attack',payload:{attackIndex}});let choices=0;
 while(result.ok&&g.pendingDecision&&choices<10){
  const d=g.pendingDecision;let chosen=d.options.slice(0,d.min).map(o=>o.id);
  if(d.optional&&d.min===0)chosen=[];
  result=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected:chosen}});choices++;
 }
 run.push({id:c.id,name:c.name,attack:a.name,kind:program.kind,result:!result.ok?'rejected':choices===10&&g.pendingDecision?'unresolved':'executed',reason:!result.ok?result.error:undefined,choices});
}
const tally=run.reduce((a,x)=>(a[x.result]=(a[x.result]||0)+1,a),{});
const summary={compiled:run.length,tally,results:run};
if(process.argv.includes('--write'))fs.writeFileSync('CLASSIC_EXECUTION_PROBE.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({compiled:summary.compiled,tally},null,2));
for(const x of run.filter(x=>x.result==='rejected').slice(0,60))console.log(x.id,x.name,x.attack,x.reason);
module.exports=summary;
