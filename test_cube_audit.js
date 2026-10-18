'use strict';
// Balance audit: observes legal deck construction, completed evolution lines,
// two-color attack viability, and actual CPU-vs-CPU battle results.
// Report statistics are descriptive; small samples do not establish parity.
const fs=require('node:fs');
const path=require('node:path');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,canEvolve}=require('./core_rules');
const {PRESETS,makePresetPool,typeOf,TYPES}=require('./cube_presets');
const {makeDraft,draftPick,availableForSeat,validateBuild,supported}=require('./cube_draft');
const {cpuPick,buildCpuDeck,usableAttacks}=require('./cube_strategy');
const {simulateCpuMatch}=require('./cube_bracket');
const SEEDS=[11,29,47,83,137];
const card=id=>CATALOG.get(id);
const isPokemon=id=>card(id)?.supertype==='Pokémon';
const isEvolution=id=>isPokemon(id)&&!isBasicPokemon(card(id));
const sum=arr=>arr.reduce((a,b)=>a+b,0);
const average=arr=>arr.length?sum(arr)/arr.length:null;
const pct=(n,d)=>d?+(100*n/d).toFixed(1):0;
const freq=values=>Object.fromEntries([...new Set(values)].sort().map(v=>[v,values.filter(x=>x===v).length]));
function families(ids){
 const pokemon=ids.filter(isPokemon),basics=pokemon.filter(id=>isBasicPokemon(card(id)));
 const evolved=pokemon.filter(isEvolution);
 const linked=evolved.filter(id=>pokemon.some(x=>canEvolve(card(id),card(x))));
 return {basic:basics.length,stage:evolved.length,linked:linked.length,
  hasEvolution:linked.length>0,
  stage2:pokemon.filter(id=>(card(id).subtypes||[]).includes('Stage 2')).length};
}
function deckProfile(drafted,deck){
 const pokes=deck.filter(isPokemon);
 const energies=deck.filter(id=>card(id)?.supertype==='Energy');
 const colors=[...new Set(energies.map(id=>card(id)?.name?.replace(/ Energy$/,'')).filter(x=>TYPES.includes(x)))];
 const basics=pokes.filter(id=>isBasicPokemon(card(id)));
 const family=families(pokes),possible=families(drafted);
 const playable=pokes.filter(id=>usableAttacks(card(id),colors).length>0);
 const attackableBasics=basics.filter(id=>usableAttacks(card(id),colors).length>0);
 const effectiveType=colors.length===1?colors[0]:colors.length===2?colors.sort().join('+'):'Other';
 return {basicCount:basics.length,pokemonCount:pokes.length,trainerCount:deck.filter(id=>card(id)?.supertype==='Trainer').length,
   energyCount:energies.length,colors,archetype:effectiveType,
   attackableBasics:attackableBasics.length,playableAttackerCount:playable.length,
   draftedLinkedEvolutions:possible.linked,
   deckLinkedEvolutions:family.linked,
   playableEvolutionLine:family.hasEvolution,
   legal:validateBuild(drafted,deck).valid};
}
function auditPreset(config){
 const profiles=[],drafts=[],games=[],issues=[],typeSlots={};
 for(const type of TYPES)typeSlots[type]=[];
 for(const seed of SEEDS){
  const pool=makePresetPool({preset:config.id,seed});
  const poolPokes=pool.filter(isPokemon),poolBasics=poolPokes.filter(id=>isBasicPokemon(card(id)));
  const counts=Object.fromEntries(TYPES.map(t=>[t,poolBasics.filter(id=>typeOf(id)===t).length]));
  for(const type of TYPES)typeSlots[type].push(counts[type]);
  if(pool.length!==240||pool.some(id=>!supported(id)))issues.push('Invalid pool seed '+seed);
  const state=makeDraft({preset:config.id,seed,pool});
  while(!state.done){
   for(let seat=0;seat<4;seat++){
    const pack=availableForSeat(state,seat);
    draftPick(state,seat,cpuPick(pack,state.picks[seat]));
   }
  }
  const decks=[];
  for(let seat=0;seat<4;seat++){
   try{
    const deck=buildCpuDeck(state.picks[seat]);
    const profile=deckProfile(state.picks[seat],deck);
    profiles.push({...profile,seat,seed});
    if(!profile.legal||profile.basicCount===0||profile.attackableBasics===0)
     issues.push('Deck failed basic/attack/legal check at seed '+seed+' seat '+seat);
    decks.push(deck);
   }catch(e){
    issues.push('Build failed seed '+seed+' seat '+seat+': '+e.message);
    decks.push(null);
   }
  }
  drafts.push({seed,basicSlots:poolBasics.length,evolutionSlots:poolPokes.length-poolBasics.length,
   draftedEvolutionLines:profiles.filter(p=>p.seed===seed&&p.draftedLinkedEvolutions>0).length,
   finalEvolutionLines:profiles.filter(p=>p.seed===seed&&p.deckLinkedEvolutions>0).length});
  // Rotate match sides across seeds; all match results use the actual reducer.
  // Avoid interpreting seed tiebreaks as competitive wins.
  for(const [index,a,b] of [[0,0,1],[1,2,3]]){
   if(!decks[a]||!decks[b])continue;
   const flip=(seed+index)%2===0;
   const left=flip?b:a,right=flip?a:b;
   try{
    const result=simulateCpuMatch(decks[left],decks[right],
     {seed:seed*1103+index*79+7,maxTurns:24,levelA:3,levelB:3});
    games.push({seed,match:index,winnerSeat:result.winner===0?left:right,loserSeat:result.winner===0?right:left,
     winnerColor:profiles.find(p=>p.seed===seed&&p.seat===(result.winner===0?left:right))?.archetype||'Unknown',
     method:result.method,actions:result.actions});
   }catch(e){issues.push('Sim failed seed '+seed+' match '+index+': '+e.message);}
  }
 }
 const methods=freq(games.map(g=>g.method));
 const seenColors=freq(profiles.map(p=>p.archetype));
 const genuine=games.filter(g=>g.method==='played');
 return {
  id:config.id,name:config.name,draftSamples:drafts.length,deckSamples:profiles.length,matchSamples:games.length,
  legalDecks:profiles.filter(p=>p.legal).length,attackableDecks:profiles.filter(p=>p.attackableBasics>0).length,
  draftedEvolutionLines:profiles.filter(p=>p.draftedLinkedEvolutions>0).length,
  deckEvolutionLines:profiles.filter(p=>p.deckLinkedEvolutions>0).length,
  averageBasics:+average(profiles.map(p=>p.basicCount)).toFixed(2),
  averageTrainers:+average(profiles.map(p=>p.trainerCount)).toFixed(2),
  averageEnergy:+average(profiles.map(p=>p.energyCount)).toFixed(2),
  averagePlayableAttackers:+average(profiles.map(p=>p.playableAttackerCount)).toFixed(2),
  averagePoolBasicSlots:+average(drafts.map(d=>d.basicSlots)).toFixed(2),
  colorLaneBasicSlots:Object.fromEntries(TYPES.map(t=>[t,{min:Math.min(...typeSlots[t]),avg:+average(typeSlots[t]).toFixed(1),max:Math.max(...typeSlots[t])}])),
  deckArchetypes:seenColors,matchMethods:methods,
  completedGames:genuine.length,completedGamePct:pct(genuine.length,games.length),
  genuineWinnersByColor:freq(genuine.map(g=>g.winnerColor)),
  allWinnersByColor:freq(games.map(g=>g.winnerColor)),
  averageActions:+(average(games.map(g=>g.actions))||0).toFixed(1),
  issues
 };
}
const results=[];
for(const preset of PRESETS){
 const t0=Date.now(),result=auditPreset(preset);
 result.durationSeconds=+((Date.now()-t0)/1000).toFixed(2);
 results.push(result);
 console.log('AUDIT '+result.id+' '+JSON.stringify(result));
}
const output={runAt:new Date().toISOString(),seeds:SEEDS,
 methodology:'5 seeded four-player CPU drafts per Cube; 4 drafted CPU decks per seed; 2 actual CPU-versus-CPU matches per seed, 24 turn-pair cap; adjudications NOT counted as genuine finishes',
 results,
 caveats:['Small sample: percentages are not statistical win-rate estimates',
  'Only CPUs using the current heuristic draft/deck builder, not humans',
  'Incomplete matches adjudicated by prizes/Pokémon/seed; cannot imply balance',
  'No manual card interaction audit or browser end-to-end playthrough in this report']};
const location=path.join(__dirname,'artifacts','cube-balance-audit.json');
fs.mkdirSync(path.dirname(location),{recursive:true});
fs.writeFileSync(location,JSON.stringify(output,null,2)+'\n');
console.log('CUBE AUDIT RESULTS');
console.log('preset | legal | playable basics | drafted evolution lines | deck evolution lines | actual finishes | matches');
for(const x of results)console.log(x.id+' | '+x.legalDecks+'/'+x.deckSamples+' | '+x.attackableDecks+'/'+x.deckSamples+
 ' | '+x.draftedEvolutionLines+'/'+x.deckSamples+' | '+x.deckEvolutionLines+'/'+x.deckSamples+
 ' | '+x.completedGames+'/'+x.matchSamples+' | '+x.matchSamples);
console.log('AUDIT JSON: '+location);
if(results.some(x=>x.issues.length)){
 console.error('FAIL audit invariants: '+results.flatMap(x=>x.issues.map(issue=>x.id+': '+issue)).join('; '));
 process.exitCode=1;
}
