'use strict';
// Controlled Basic-only vs Evolution Cube experiment.
// Uses the authoritative reducer and the same CPU policy for both decks.
// Shares a drafted inventory between the two deck variants to control access
// to cards; this is NOT a real cross-seat tournament or a human win-rate study.
// Incomplete games do not count toward win percentages.
const fs=require('node:fs');
const path=require('node:path');
const {CATALOG,createGame}=require('./headless_duel');
const {isBasicPokemon,canEvolve}=require('./core_rules');
const {PRESETS,makePresetPool}=require('./cube_presets');
const {makeDraft,draftPick,availableForSeat,validateBuild}=require('./cube_draft');
const {cpuPick,buildCpuDeck,colorPlan,usableAttacks,score,ENERGY_IDS}=require('./cube_strategy');
const {driveSide}=require('./cpu_policy');
const card=id=>CATALOG.get(id);
const isPokemon=id=>card(id)?.supertype==='Pokémon';
const isEvolution=id=>isPokemon(id)&&!isBasicPokemon(card(id));
const selectedPresets=(process.env.MATCHUP_PRESETS||'foundations,kanto-growth,jungle-growth,fossil-discovery,rocket-uprising,gym-academy,neo-generations,stage-one,slow-burn').split(',').filter(Boolean);
const seeds=(process.env.MATCHUP_SEEDS||'11,29,47').split(',').map(Number);
const seats=Number(process.env.MATCHUP_SEATS||2);
const maxTurns=Number(process.env.MATCHUP_TURNS||48);
const level=Number(process.env.MATCHUP_LEVEL||3);
if(!seeds.length||seeds.some(n=>!Number.isInteger(n)||n<0)||!Number.isInteger(seats)||seats<1||seats>4||
 !Number.isInteger(maxTurns)||maxTurns<1||maxTurns>150||![1,2,3,4,5].includes(level))
 throw Error('Invalid matchup test options');
for(const id of selectedPresets)if(!PRESETS.some(p=>p.id===id))throw Error('Unknown preset: '+id);

function weightedEnergy(colors,deck){
 const energies=[],demand=Object.fromEntries(colors.map(t=>[t,1]));
 for(const id of deck.filter(isPokemon)){
  const possible=usableAttacks(card(id),colors).slice().sort((a,b)=>(a.cost||[]).length-(b.cost||[]).length);
  for(const type of (possible[0]?.cost||[]))if(type in demand)demand[type]+=1;
 }
 const needed=40-deck.length;
 for(let i=0;i<needed;i++){
  const choice=colors.slice().sort((a,b)=>(energies.filter(id=>id===ENERGY_IDS[a]).length/demand[a])-
   (energies.filter(id=>id===ENERGY_IDS[b]).length/demand[b])||a.localeCompare(b))[0];
  energies.push(ENERGY_IDS[choice]);
 }
 return [...deck,...energies];
}
function fastBasicScore(id,colors){
 const c=card(id),attacks=usableAttacks(c,colors),speed=attacks.reduce((best,a)=>{
  const damage=Number.parseInt(String(a.damage||'0'),10)||0;
  const cost=(a.cost||[]).length;
  return Math.max(best,Math.min(65,damage)*0.45-cost*9+(cost<=1?22:0));
 },0);
 return speed+(Number(c.hp)||0)*.12;
}
function basicOnlyDeck(picks){
 const colors=colorPlan(picks);
 const basic=picks.filter(id=>isPokemon(id)&&isBasicPokemon(card(id))&&usableAttacks(card(id),colors).length)
  .sort((a,b)=>fastBasicScore(b,colors)-fastBasicScore(a,colors)||a.localeCompare(b));
 const trainers=picks.filter(id=>card(id)?.supertype==='Trainer')
  .sort((a,b)=>score(b,[],{preset:'balanced'})-score(a,[],{preset:'balanced'})||a.localeCompare(b));
 const deck=[],names=new Map();
 function add(id){
  const name=card(id).name;
  if((names.get(name)||0)>=4||deck.length>=25)return false;
  deck.push(id);names.set(name,(names.get(name)||0)+1);return true;
 }
 for(const id of basic)if(deck.filter(x=>isPokemon(x)).length<14)add(id);
 for(const id of trainers)if(deck.filter(x=>card(x).supertype==='Trainer').length<13)add(id);
 if(!deck.some(isPokemon))return null;
 const ready=weightedEnergy(colors,deck);
 if(!validateBuild(picks,ready).valid)throw Error('Illegal Basic-only deck');
 return ready;
}
function evolveProfile(picks,deck){
 const pokemon=deck.filter(isPokemon),evolutions=pokemon.filter(isEvolution);
 const linked=evolutions.filter(id=>pokemon.some(p=>canEvolve(card(id),card(p))));
 return {evolutionCards:evolutions.length,linkedEvolutionCards:linked.length,
  stage2Cards:evolutions.filter(id=>(card(id).subtypes||[]).includes('Stage 2')).length};
}
function simulate(basics,evolutions,{seed,reverse}){
 const decks=reverse?[evolutions,basics]:[basics,evolutions];
 let game=createGame({decks,names:reverse?['Evolutions','Basics']:['Basics','Evolutions'],
  format:'online-preview',deckSize:40,prizeCount:4,seed});
 const evoSide=reverse?0:1,evolveActions=[0,0];
 let actions=0,stalls=0;
 for(let turn=0;turn<maxTurns&&!game.over;turn++){
  const before=game;
  for(const side of [0,1]){
   if(game.over)break;
   const result=driveSide(game,{side,level,seed:seed+side*19,limit:180,
    onStep:(_g,command)=>{if(command.type==='evolve')evolveActions[side]++;}});
   game=result.game;actions+=result.steps;
  }
  if(game===before){if(++stalls>=2)break;}else stalls=0;
 }
 const completed=!!game.over&&(game.winner===0||game.winner===1);
 return {completed, winner:completed?(game.winner===evoSide?'evolution':'basic'):null,
  evolved:evolveActions[evoSide],actions,remainingPrizes:game.players.map(p=>p.prizes.length)};
}
function wilson(wins,total){
 if(!total)return null;
 const z=1.96,p=wins/total,d=1+z*z/total,
  center=(p+z*z/(2*total))/d,
  width=z*Math.sqrt(p*(1-p)/total+z*z/(4*total*total))/d;
 return [+((center-width)*100).toFixed(1),+((center+width)*100).toFixed(1)];
}
function audit(preset){
 const result={preset,seeds,plannedDeckPairs:seeds.length*seats,
  eligiblePairs:0,skipped:{noBasicDeck:0,noCompleteEvolutionLine:0},
  games:0,completed:0,incomplete:0,evolutionWins:0,basicWins:0,
  gamesWhereEvolutionsWerePlayed:0,evolutionActions:0,evolutionCardsInDeck:[],
  errors:[],examples:[]};
 for(const seed of seeds){
  const pool=makePresetPool({preset,seed});
  const draft=makeDraft({seed,pool,preset});
  while(!draft.done)for(let seat=0;seat<4;seat++){
   const picks=draft.picks[seat],pack=availableForSeat(draft,seat);
   draftPick(draft,seat,cpuPick(pack,picks,{preset}));
  }
  for(let seat=0;seat<seats;seat++){
   const picks=draft.picks[seat];
   try{
    const basics=basicOnlyDeck(picks);
    if(!basics){result.skipped.noBasicDeck++;continue;}
    const evolution=buildCpuDeck(picks,{preset});
    const profile=evolveProfile(picks,evolution);
    if(profile.linkedEvolutionCards<1){result.skipped.noCompleteEvolutionLine++;continue;}
    if(!validateBuild(picks,evolution).valid)throw Error('Illegal Evolution deck');
    result.eligiblePairs++;result.evolutionCardsInDeck.push(profile.evolutionCards);
    for(const reverse of [false,true]){
     const matchSeed=(seed*65537+seat*131+17)>>>0;
     const match=simulate(basics,evolution,{seed:matchSeed,reverse});
     result.games++;
     if(match.completed){
      result.completed++;if(match.winner==='evolution')result.evolutionWins++;
      else result.basicWins++;
     }else result.incomplete++;
     if(match.evolved>0)result.gamesWhereEvolutionsWerePlayed++;
     result.evolutionActions+=match.evolved;
     if(result.examples.length<4)result.examples.push({seed,seat,reverse,...match});
    }
   }catch(error){
    result.errors.push({seed,seat,message:error.message});
   }
  }
 }
 result.evolutionWinPct=result.completed?+(100*result.evolutionWins/result.completed).toFixed(1):null;
 result.evolutionWin95CI=wilson(result.evolutionWins,result.completed);
 result.completedPct=result.games?+(100*result.completed/result.games).toFixed(1):0;
 result.averageEvolutionsInDeck=result.evolutionCardsInDeck.length?
  +(result.evolutionCardsInDeck.reduce((a,b)=>a+b,0)/result.evolutionCardsInDeck.length).toFixed(2):0;
 console.log('MATCHUP '+JSON.stringify(result));
 return result;
}
const results=selectedPresets.map(audit);
const report={generatedAt:new Date().toISOString(),
 methodology:'Four-player seeded drafts, shared-picks Basic-only vs Evolution deck variants, paired swapped seating, identical CPU level and game seed. Only completed engine wins count. Excludes adjudicated/time-limited fixtures.',
 options:{selectedPresets,seeds,seats,maxTurns,level},results,
 caveats:['Synthetic same-inventory comparisons, not cross-seat draft winners or player win rates.',
 'CPU skill and heuristic deck assembly affect outcomes; evolution cards in deck do not guarantee one was played.',
 'Played-result sample size and incomplete-game fraction must be reported together.',
 'CI reports descriptive outcomes, not automatic claims of competitive balance.']};
fs.mkdirSync(path.join(__dirname,'artifacts'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'artifacts','cube-archetype-matchups.json'),JSON.stringify(report,null,2)+'\n');
console.log('MATCHUP_SUMMARY '+JSON.stringify(results.map(x=>({id:x.preset,pairs:x.eligiblePairs,completed:x.completed,
 incomplete:x.incomplete,evolved:x.gamesWhereEvolutionsWerePlayed,basicWins:x.basicWins,evolutionWins:x.evolutionWins,
 evolutionWinPct:x.evolutionWinPct,interval:x.evolutionWin95CI,errors:x.errors.length}))));
if(results.some(x=>x.errors.length))process.exitCode=1;
