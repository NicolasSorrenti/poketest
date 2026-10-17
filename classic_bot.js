'use strict';
// Narrow, deterministic baseline rival. No rules are implemented in the bot:
// every candidate action is validated by the same authoritative reducer as humans.
const {reduce,CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy}=require('./core_rules');
function findLegal(game,actor,choices){
 for(const command of choices){const r=reduce(game,actor,command);if(r.ok)return {command,game:r.game};}
 return null;
}
const cmd=(type,payload={})=>({type,payload});
function propose(game){
 const actor=1,p=game.players[actor];
 if(game.over)return null;
 if(game.pendingDecision){
  if(game.pendingDecision.actor!==actor)return null;
  const d=game.pendingDecision;
  // The opponent makes real legal decisions, with their own choices and costs.
  const indexes=d.options.map(o=>o.id);
  const minimum=indexes.slice(0,d.min);
  const candidate=[cmd('choose',{decisionId:d.id,selected:minimum})];
  if(d.optional)candidate.push(cmd('choose',{decisionId:d.id,decline:true}));
  return findLegal(game,actor,candidate);
 }
 if(game.phase==='setup'){
  if(game.setupReady[actor])return null;
  if(!p.active){
   const i=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   return findLegal(game,actor,[cmd('setup_select',{handIndex:i})]);
  }
  if(p.bench.length<2){
   const i=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   if(i>=0){const res=findLegal(game,actor,[cmd('setup_select',{handIndex:i})]);if(res)return res;}
  }
  return findLegal(game,actor,[cmd('setup_confirm')]);
 }
 if(game.turn!==actor)return null;
 const turnPlays=p.turnPlays||[];
 // Evolution legality is delegated to reducer, including turn restrictions.
 for(let i=0;i<p.hand.length;i++){
  const c=CATALOG.get(p.hand[i]);if(!c?.evolvesFrom)continue;
  const options=[-1,...p.bench.map((_,j)=>j)].filter(slot=>!turnPlays.includes(slot)).map(slot=>cmd('evolve',{handIndex:i,slot}));
  const result=findLegal(game,actor,options);if(result)return result;
 }
 if(p.bench.length<3){
  const i=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  if(i>=0){const res=findLegal(game,actor,[cmd('bench',{handIndex:i})]);if(res)return res;}
 }
 if(!p.energyUsed){
  const options=p.hand.flatMap((id,handIndex)=>isEnergy(CATALOG.get(id))?[-1,...p.bench.map((_,slot)=>slot)].map(slot=>cmd('attach_energy',{handIndex,slot})):[]);
  const result=findLegal(game,actor,options);if(result)return result;
 }
 // Limit trainer activity per turn so an imperfect heuristic cannot loop forever.
 const botTrainerCount=p.botTrainerSerial===game.turnSerial?(p.botTrainersTurn||0):0;
 if(botTrainerCount<2){
  const preferred=['Bill','Potion','Energy Removal','PlusPower','Gust of Wind','Switch','Pokémon Center','Professor Oak'];
  const indexed=p.hand.map((id,handIndex)=>({c:CATALOG.get(id),handIndex})).filter(x=>x.c?.supertype==='Trainer');
  indexed.sort((a,b)=>preferred.indexOf(a.c.name)<0?1:preferred.indexOf(b.c.name)<0?-1:preferred.indexOf(a.c.name)-preferred.indexOf(b.c.name));
  const result=findLegal(game,actor,indexed.filter(x=>preferred.includes(x.c.name)).map(x=>cmd('play_trainer',{handIndex:x.handIndex})));
  if(result){result.game.players[actor].botTrainersTurn=botTrainerCount+1;result.game.players[actor].botTrainerSerial=game.turnSerial;return result;}
 }
 const attacks=CATALOG.get(p.active?.id)?.attacks||[];
 const options=attacks.map((_,attackIndex)=>cmd('attack',{attackIndex})).reverse();
 const result=findLegal(game,actor,options);if(result)return result;
 return findLegal(game,actor,[cmd('end_turn')]);
}
function driveBot(game,limit=200){
 let steps=0;
 while(!game.over&&steps<limit){
  const result=propose(game);
  if(!result)break;
  if(result.command.type==='end_turn'&&result.game.turn===1&&!result.game.pendingDecision&&!result.game.over)throw Error('CPU did not advance turn');
  game=result.game;steps++;
 }
 if(steps===limit)throw Error('CPU step budget exhausted');
 return {game,steps};
}
module.exports={propose,driveBot};
