'use strict';
// CPU-vs-CPU bracket fixtures run through the same authoritative TCG reducer
// and CPU policy as human-vs-CPU duels. No outcome is chosen by card strength.
const {createGame}=require('./headless_duel');
const {driveSide}=require('./cpu_policy');

function simulateCpuMatch(deckA,deckB,{seed=1,levelA=3,levelB=3,maxTurns=36}={}){
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid simulation seed');
 let game=createGame({decks:[deckA,deckB],names:['CPU A','CPU B'],format:'online-preview',
   deckSize:40,prizeCount:4,seed});
 let actions=0,stalls=0;
 const levels=[levelA,levelB];
 for(let turn=0;turn<maxTurns&&!game.over;turn++){
  const before=game;
  // Each call handles setup or a complete turn for the named player.
  // A limited number of turn pairs prevents a CPU-only fixture from blocking
  // the draft API for an unbounded amount of time.
  // Drive both sides: the standard local duel drives only side 1.
  for(const side of [0,1]){
   if(game.over)break;
   const result=driveSide(game,{side,level:levels[side],seed:seed+side*19,limit:180});
   game=result.game;actions+=result.steps;
  }
  if(game===before){if(++stalls>=2)break;}else stalls=0;
 }
 if(game.over&&(game.winner===0||game.winner===1)){
  return {winner:game.winner,method:'played',actions};
 }
 // Bounded tournament adjudication if game is still unresolved or a simultaneous
 // win. Prize count takes precedence, then surviving Pokémon, then a reproducible
 // seed tiebreak. The UI explicitly labels these as adjudicated results.
 const a=game.players[0],b=game.players[1];
 const aPrizes=a.prizes.length,bPrizes=b.prizes.length;
 let winner,method='prizes';
 if(aPrizes!==bPrizes)winner=aPrizes<bPrizes?0:1;
 else{
  const aPoke=(a.active?1:0)+a.bench.length,bPoke=(b.active?1:0)+b.bench.length;
  if(aPoke!==bPoke){winner=aPoke>bPoke?0:1;method='remaining-pokemon';}
  else{winner=seed%2;method='seed-tiebreak';}
 }
 return {winner,method,actions};
}
module.exports={simulateCpuMatch};
