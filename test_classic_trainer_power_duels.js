'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {canPayEnergy,isBasicPokemon,isEnergy,canEvolve,countCards}=require('./core_rules');
const pokemon=['base1-63','base1-42','base1-2','base1-41','base1-52','base1-7'];
const trainers=['base1-91','base1-94','base1-92','base1-93','base1-95','base3-59','base5-73','base1-87'];
function deck(seed){const chosen=[trainers[seed%trainers.length],trainers[(seed+2)%trainers.length],trainers[(seed+4)%trainers.length],trainers[(seed+5)%trainers.length]];
 return [...pokemon.flatMap(id=>Array(4).fill(id)),...chosen.flatMap(id=>Array(4).fill(id)),...Array(12).fill('base1-102'),...Array(8).fill('base1-97')];}
let games=0,actions=0,powers=0,played=0,attacks=0,choices=0;
const check=g=>{assert.equal(countCards(g.players[0]),60,'Player 1 card conservation');assert.equal(countCards(g.players[1]),60,'Player 2 card conservation');};
function doAction(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});if(!r.ok)return false;
 actions++;check(g);return true;
}
function settle(g){let n=0;while(g.pendingDecision&&n++<12){const d=g.pendingDecision;const answer={decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)};
 assert.ok(doAction(g,d.actor,'choose',answer),`Unresolved decision ${d.kind}`);choices++;
 }assert.ok(n<12,'Stuck pending decision');}
for(let seed=0;seed<30;seed++){
 const g=createGame({decks:[deck(seed),deck(seed+3)],format:'classic',seed:seed*17431+19});check(g);
 for(let side=0;side<2;side++){
  let i=g.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  assert.ok(i>=0);assert.ok(doAction(g,side,'setup_select',{handIndex:i}));assert.ok(doAction(g,side,'setup_confirm'));check(g);
 }
 if(g.mulliganBonus)assert.ok(doAction(g,g.mulliganBonus.side,'setup_bonus_draw',{count:0}));
 let loops=0;
 while(!g.over&&loops++<280){
  if(g.pendingDecision){settle(g);continue;}
  const side=g.turn,p=g.players[side];let acted=false;
  // Evolve before attaching to exercise evolution paths and powers.
  for(let i=0;i<p.hand.length&&!g.over;i++){
   const c=CATALOG.get(p.hand[i]);if(!c.evolvesFrom)continue;
   const idx=[-1,...p.bench.map((_,i)=>i)].find(k=>{const u=k===-1?p.active:p.bench[k];return u&&canEvolve(c,CATALOG.get(u.id))&&u.playedTurn<g.round;});
   if(idx!==undefined&&doAction(g,side,'evolve',{handIndex:i,slot:idx})){acted=true;settle(g);break;}
  }
  if(acted)continue;
  // One Water Energy attachment or Fighting Energy as available.
  const energyIndex=p.hand.findIndex(id=>isEnergy(CATALOG.get(id)));
  if(energyIndex>=0&&!p.energyUsed&&doAction(g,side,'attach_energy',{handIndex:energyIndex,slot:-1})){continue;}
  if(p.bench.length<3){const basic=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   if(basic>=0&&doAction(g,side,'bench',{handIndex:basic}))continue;
  }
  const powerIndex=[p.active,...p.bench].findIndex(u=>u&&CATALOG.get(u.id).abilities?.some(a=>a.name==='Rain Dance'));
  if(powerIndex>=0&&p.hand.includes('base1-102')){
   const choiceSlot=powerIndex-1;
   if(doAction(g,side,'use_power',{slot:choiceSlot})){powers++;settle(g);continue;}
  }
  let gotTrainer=false;
  for(let i=0;i<p.hand.length;i++){
   const c=CATALOG.get(p.hand[i]);if(c.supertype!=='Trainer')continue;
   if(doAction(g,side,'play_trainer',{handIndex:i})){played++;settle(g);gotTrainer=true;break;}
  }
  if(gotTrainer)continue;
  if(p.active){const attackSet=CATALOG.get(p.active.id).attacks||[];
   for(let i=attackSet.length-1;i>=0;i--){
    if(doAction(g,side,'attack',{attackIndex:i})){attacks++;settle(g);acted=true;break;}
   }
  }
  if(!acted)assert.ok(doAction(g,side,'end_turn'));
 }
 if(!g.over){doAction(g,g.turn,'concede');}
 check(g);games++;
}
console.log(`PASS Classic mixed-power/Trainer duels: ${games} completed game states; ${actions} accepted commands; ${played} Trainers; ${powers} Powers; ${attacks} attacks; ${choices} interactive responses; conservation`);
