'use strict';
// Five-checkpoint balance analysis for Game Boy-inspired RPG boosters.
// All decks contain legitimately owned cards; no card rules or CPU skills change.
// Optional --duels runs mirrored real reducer games. Without it the report
// is a cheap deterministic acquisition/deck-readiness comparison.
const Collection=require('../rpg_collection');
const {CATALOG}=require('../headless_duel');
const {validateDeck,canEvolve,isBasicPokemon,isBasicEnergy}=require('../core_rules');
const {ClassicLocalService}=require('../classic_local_service');
const NPC=require('../rpg_npc_deck_progression');
const {argumentsOf,duel,wilson}=require('../benchmark_cpu');
const DAYS=Object.freeze([15,30,45,60,80]);
const STYLES=Object.freeze(['mixed','toolkit','evolution','arena','latest']);
const STARTERS=Object.freeze(Collection.starters.map(s=>s.id));
const NPCS=Object.freeze(['hana','reina','camila','marina','shiori','yuna']);
const NPC_PRESETS=Object.freeze({hana:'power_reserve',reina:'blackout',camila:'rocket_lab',
 marina:'water_blast',shiori:'overgrowth',yuna:'zap'});
const TRAINER_VALUE=Object.freeze({
 'Computer Search':105,'Professor Oak':97,'Item Finder':89,'Bill':83,
 'Gust of Wind':82,'PlusPower':75,'Pokémon Trader':72,'Energy Removal':71,
 'Super Energy Removal':69,'Pokémon Breeder':67,'Switch':57,'Full Heal':43,
 'Super Potion':29,'Defender':25,'Potion':19,'Pokédex':15,
 'Revive':13,'Scoop Up':58,'Energy Retrieval':57,'Lass':42
});
function random(seed){
 let x=seed>>>0;return ()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);
}
function hash(a){
 let h=2166136261;
 for(const char of String(a)){h=Math.imul(h^char.charCodeAt(0),16777619);}
 return h>>>0;
}
const count=(ids,id)=>ids.filter(x=>x===id).length;
const scoreTrainer=c=>TRAINER_VALUE[c?.name]||35;
const typesFor=starter=>new Set(Collection.byId(starter).types);
const starterPools=Object.fromEntries(STARTERS.map(s=>[s,typesFor(s)]));
const stages=day=>day<=30?1:day<=60?2:3;
const maxCopies=(id,deck)=>{
 const card=CATALOG.get(id);
 return card?Math.max(0,4-deck.filter(current=>CATALOG.get(current)?.name===card.name).length):0;
};
function attackScore(card,usableTypes){
 const values=(card.attacks||[]).map(a=>{
  const cost=Array.isArray(a.cost)?a.cost:[],colored=cost.filter(t=>t!=='Colorless');
  if(colored.some(t=>!usableTypes.has(t)))return -15;
  const damage=Number((String(a.damage||'').match(/^\d+/)||[])[0]||0);
  return damage*.38-cost.length*2.5+(a.text?2:0)+(cost.length===1?5:0);
 });
 return Math.max(0,...values);
}
function pokemonScore(card,primary){
 if(!card||card.supertype!=='Pokémon')return -1000;
 const isBasic=isBasicPokemon(card),stage2=card.subtypes?.includes('Stage 2');
 const compatible=(card.types||[]).some(t=>primary.has(t)||t==='Colorless');
 if(!compatible)return -100;
 return Number(card.hp||0)*.24+attackScore(card,primary)+(card.abilities?.length?6:0)
  +(stage2?15:isBasic?1:10);
}
function deckMetrics(deck,primary){
 const cards=deck.map(id=>CATALOG.get(id));
 const basics=cards.filter(isBasicPokemon).length;
 const trainerCards=cards.filter(c=>c?.supertype==='Trainer');
 const evolutionCards=cards.filter(c=>c?.supertype==='Pokémon'&&c.evolvesFrom);
 const workableEvolutions=evolutionCards.filter(c=>cards.some(p=>canEvolve(c,p))).length;
 return {basics,energies:cards.filter(isBasicEnergy).length,trainers:trainerCards.length,
  trainerValue:trainerCards.reduce((sum,c)=>sum+scoreTrainer(c),0),
  evolutions:evolutionCards.length,workableEvolutions,
  pokemonValue:Math.round(cards.reduce((sum,c)=>sum+Math.max(0,pokemonScore(c,primary)),0))};
}
function deckFromOwned(starter,owned){
 const primary=starterPools[starter],cards=[...Collection.byId(starter).cards];
 // Make modest, valid, reproducible substitutions without inventing card drops.
 // Basics supporting an evolution are protected from removal.
 function viable(id){
  const c=CATALOG.get(id);if(!c||count(cards,id)>=(owned[id]||0)||maxCopies(id,cards)<1)return false;
  return true;
 }
 function removeCandidate(replacingPokemon){
  const basics=cards.filter(id=>isBasicPokemon(CATALOG.get(id))).length;
  const energy=cards.filter(id=>isBasicEnergy(CATALOG.get(id))).length;
  const options=[];
  cards.forEach((id,i)=>{
   const c=CATALOG.get(id);if(!c)return;
   const basic=isBasicPokemon(c),stage=c.supertype==='Pokémon'&&!basic;
   if(replacingPokemon){
    if(c.supertype!=='Pokémon'||basic&&basics<=12)return;
    if(cards.some(other=>other!==id&&canEvolve(CATALOG.get(other),c))&&
       cards.filter(x=>CATALOG.get(x)?.name===c.name).length<=1)return;
    options.push({i,value:pokemonScore(c,primary)+(basic?3:0)});
   }else if(c.supertype==='Trainer'){
    options.push({i,value:scoreTrainer(c)});
   }else if(isBasicEnergy(c)&&energy>18){
    options.push({i,value:58});
   }
  });
  return options.sort((a,b)=>a.value-b.value||a.i-b.i)[0]||null;
 }
 function install(id,kind){
  if(!viable(id))return false;
  const c=CATALOG.get(id);
  if(kind==='pokemon'){
   if(c.evolvesFrom&&!cards.some(old=>canEvolve(c,CATALOG.get(old))))return false;
   const worst=removeCandidate(true),value=pokemonScore(c,primary);
   if(!worst||value<=worst.value+5)return false;
   cards[worst.i]=id;return true;
  }
  if(c.supertype!=='Trainer')return false;
  const worst=removeCandidate(false);
  if(!worst||scoreTrainer(c)<=worst.value+7)return false;
  cards[worst.i]=id;return true;
 }
 // Allow viable matching-type Basics first, so Evolution Workshop's linked
 // Stage 1 pair can become an actual deckbuilding upgrade.
 const basicCandidates=Object.keys(owned).filter(id=>{
  const c=CATALOG.get(id);
  return c&&isBasicPokemon(c)&&(c.types||[]).some(t=>primary.has(t)||t==='Colorless');
 }).sort((a,b)=>pokemonScore(CATALOG.get(b),primary)-pokemonScore(CATALOG.get(a),primary)||a.localeCompare(b));
 for(const id of basicCandidates){
  for(let k=0;k<Math.min(owned[id],4);k++)if(!install(id,'pokemon'))break;
 }
 const evolutions=Object.keys(owned).filter(id=>{
  const c=CATALOG.get(id);
  return c?.supertype==='Pokémon'&&c.evolvesFrom&&
   (c.types||[]).some(t=>primary.has(t)||t==='Colorless');
 }).sort((a,b)=>{
  const ac=CATALOG.get(a),bc=CATALOG.get(b);
  return Number(bc.subtypes?.includes('Stage 1'))-Number(ac.subtypes?.includes('Stage 1'))
   ||pokemonScore(bc,primary)-pokemonScore(ac,primary)||a.localeCompare(b);
 });
 for(const id of evolutions)for(let k=0;k<Math.min(owned[id],4);k++){
  if(!install(id,'pokemon'))break;
 }
 const trainers=Object.keys(owned).filter(id=>CATALOG.get(id)?.supertype==='Trainer')
  .sort((a,b)=>scoreTrainer(CATALOG.get(b))-scoreTrainer(CATALOG.get(a))||a.localeCompare(b));
 for(const id of trainers)for(let k=0;k<Math.min(owned[id],4);k++){
  if(!install(id,'trainer'))break;
 }
 const legality=validateDeck(cards,CATALOG),ownership=Collection.check(cards,owned);
 if(!legality.valid||!ownership.valid)throw Error('Bad '+starter+' simulated deck: '+[...legality.errors,...ownership.errors].join('; '));
 return {cards,metrics:deckMetrics(cards,primary)};
}
function pickTheme(style,day,number,state){
 const offers=Collection.themedPacks(state).filter(o=>o.unlocked);
 const available=new Map(offers.map(o=>[o.id,o]));
 if(['toolkit','evolution','arena'].includes(style))return style;
 if(style==='latest')return offers.at(-1)?.id||'arena';
 if(style==='mixed'){
  const all=['arena','evolution','toolkit','wilderness','rocket','gym','johto','mystery'].filter(id=>available.has(id));
  return all[(day+number)%all.length];
 }
 throw Error('Unknown strategy '+style);
}
function collect(starter,day,style,seed){
 if(!STARTERS.includes(starter)||!DAYS.includes(day)||!STYLES.includes(style))throw Error('Invalid acquisition scenario');
 const state={day:1,slot:0,credits:80,location:'shop',results:[],deckJourney:Collection.fresh()};
 Collection.choose(state,starter);
 let spent=0,packs=0,freeRewards=0;const boughtByTheme={};
 const baseSeed=hash(starter+'/'+seed);
 for(const [i,theme] of ['arena','evolution'].entries()){
  Collection.buyThemedPack(state,theme,random(hash(baseSeed+'/welcome/'+i)));
  state.deckJourney.lastPack.opened=true;
 }
 for(let d=1;d<=day;d++){
  state.day=d;state.credits+=12; // Fixed modeled earning rate; identical for all shopping plans.
  // Same ordinary win schedule for each plan, respecting the existing 2-per-week cap.
  if((d-1)%7===1||(d-1)%7===4){
   const npc=(d-1)%7===1?'hana':'reina';
   const reward=Collection.reward(state,true,npc,random(hash(baseSeed+'/win/'+d)),
    {day:d,duelId:'benchmark-win-'+d});
   if(reward){freeRewards++;state.deckJourney.lastPack.opened=true;}
  }
  const theme=pickTheme(style,d,packs,state);
  const offer=Collection.themedPacks(state).find(o=>o.id===theme);
  // A plan waits for its selected product to be affordable rather than
  // silently substituting a cheaper different pack.
  if(offer&&offer.unlocked&&state.credits>=offer.price){
   const price=offer.price;
   Collection.buyThemedPack(state,theme,random(hash(baseSeed+'/paid/'+d)));
   state.deckJourney.lastPack.opened=true;
   spent+=price;packs++;boughtByTheme[theme]=(boughtByTheme[theme]||0)+1;
  }
 }
 const built=deckFromOwned(starter,state.deckJourney.owned);
 return {starter,day,style,seed,deck:built.cards,metrics:built.metrics,
  budget:80+day*12,spent,remaining:state.credits,purchasedPacks:packs,
  freeRewards,welcomePacks:2,boughtByTheme,
  totalCopies:Object.values(state.deckJourney.owned).reduce((a,n)=>a+n,0),
  uniqueCards:Object.keys(state.deckJourney.owned).length};
}
function parse(argv){
 const opts={days:[...DAYS],styles:[...STYLES],starters:[...STARTERS],npcs:[...NPCS],
  seeds:2,pairs:1,seed:20261021,maxTurns:70,duels:false};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];if(key==='--duels'){opts.duels=true;continue;}
  const value=argv[++i];if(value===undefined)throw Error('Missing value for '+key);
  if(key==='--days')opts.days=value.split(',').map(Number);
  else if(key==='--styles')opts.styles=value.split(',');
  else if(key==='--starters')opts.starters=value.split(',');
  else if(key==='--npcs')opts.npcs=value.split(',');
  else if(key==='--seeds')opts.seeds=Number(value);
  else if(key==='--pairs')opts.pairs=Number(value);
  else if(key==='--max-turns')opts.maxTurns=Number(value);
  else if(key==='--seed')opts.seed=Number(value);
  else throw Error('Unknown option '+key);
 }
 if(opts.days.some(x=>!DAYS.includes(x))||!opts.days.length)throw Error('Invalid checkpoints');
 if(opts.styles.some(x=>!STYLES.includes(x))||!opts.styles.length)throw Error('Invalid pack styles');
 if(opts.starters.some(x=>!STARTERS.includes(x))||!opts.starters.length)throw Error('Invalid starter');
 if(opts.npcs.some(x=>!NPCS.includes(x))||!opts.npcs.length)throw Error('Invalid NPC');
 if(!Number.isInteger(opts.seeds)||opts.seeds<1||opts.seeds>30)throw Error('Invalid seed count');
 if(!Number.isInteger(opts.pairs)||opts.pairs<1||opts.pairs>20)throw Error('Invalid pair count');
 if(!Number.isInteger(opts.maxTurns)||opts.maxTurns<10||opts.maxTurns>250)throw Error('Invalid max turns');
 if(!Number.isSafeInteger(opts.seed)||opts.seed<0)throw Error('Invalid random seed');
 return opts;
}
const mean=(rows,key)=>rows.reduce((n,x)=>n+x[key],0)/rows.length;
function evaluate(opts){
 const service=opts.duels?new ClassicLocalService():null,rows=[],errors=[];
 const npcDecks=opts.duels?Object.fromEntries(opts.days.flatMap(day=>opts.npcs.map(npc=>{
  const original=service.decklist(NPC_PRESETS[npc]);
  const cards=NPC.upgrade({npc,tier:stages(day),original,catalog:CATALOG});
  if(!validateDeck(cards,CATALOG).valid)throw Error('Illegal NPC '+npc+' Day '+day);
  return [day+'/'+npc,cards];
 }))):null;
 for(const day of opts.days)for(const style of opts.styles)for(const starter of opts.starters){
  const games=[],collections=[];
  for(let rep=0;rep<opts.seeds;rep++){
   const sample=collect(starter,day,style,opts.seed+rep);
   collections.push(sample);
   if(!opts.duels)continue;
   for(const npc of opts.npcs){
    const cards=npcDecks[day+'/'+npc],hasNeo=[...sample.deck,...cards].some(id=>id.startsWith('neo'));
    const seed=hash(opts.seed+'/'+rep+'/'+day+'/'+starter+'/'+npc);
    const duelOptions=argumentsOf(['--pairs',String(opts.pairs),'--max-turns',String(opts.maxTurns),
     '--seed',String(seed),'--left-level','3','--right-level','3']);
    duelOptions.format=hasNeo?'online-preview':'gym-expanded';
    for(let pair=0;pair<opts.pairs;pair++)for(const swap of [false,true]){
     try{
      const played=duel(duelOptions,pair,swap,[sample.deck,cards]);
      games.push({winner:played.winner,opponent:npc,endReason:played.endReason});
     }catch(e){errors.push({day,style,starter,npc,rep,pair,swap,error:String(e)});}
    }
   }
  }
  const npcWins=games.filter(g=>g.winner===1).length,
   playerWins=games.filter(g=>g.winner===0).length,decisive=npcWins+playerWins;
  const byNpc=opts.npcs.map(npc=>{
   const subset=games.filter(g=>g.opponent===npc),p=subset.filter(g=>g.winner===0).length,
    n=subset.filter(g=>g.winner===1).length;
   return {npc,games:subset.length,playerWins:p,npcWins:n,draws:subset.length-p-n,
    playerWinRate:p+n?p/(p+n):null};
  });
  rows.push({day,style,starter,byNpc,samples:collections.length,
   budget:mean(collections,'budget'),spent:mean(collections,'spent'),
   purchasedPacks:mean(collections,'purchasedPacks'),freeRewards:mean(collections,'freeRewards'),
   totalCopies:mean(collections,'totalCopies'),uniqueCards:mean(collections,'uniqueCards'),
   trainers:mean(collections.map(x=>x.metrics),'trainers'),
   trainerValue:mean(collections.map(x=>x.metrics),'trainerValue'),
   workableEvolutions:mean(collections.map(x=>x.metrics),'workableEvolutions'),
   pokemonValue:mean(collections.map(x=>x.metrics),'pokemonValue'),
   nGames:games.length,playerWins,npcWins,
   draws:games.length-decisive,playerWinRate:decisive?playerWins/decisive:null,
   uncertainty95:decisive?wilson(playerWins,decisive):null});
 }
 const aggregate=opts.days.flatMap(day=>opts.styles.map(style=>{
  const chosen=rows.filter(r=>r.day===day&&r.style===style);
  const n=chosen.reduce((sum,r)=>sum+r.nGames,0),wins=chosen.reduce((sum,r)=>sum+r.playerWins,0),
   losses=chosen.reduce((sum,r)=>sum+r.npcWins,0);
  return {day,style,samples:chosen.reduce((s,r)=>s+r.samples,0),
   spent:mean(chosen,'spent'),packs:mean(chosen,'purchasedPacks'),
   trainerValue:mean(chosen,'trainerValue'),workableEvolutions:mean(chosen,'workableEvolutions'),
   pokemonValue:mean(chosen,'pokemonValue'),
   games:n,playerWins:wins,npcWins:losses,draws:n-wins-losses,
   playerWinRate:wins+losses?wins/(wins+losses):null};
 }));
 const opponents=opts.days.flatMap(day=>opts.npcs.map(npc=>{
  const rowsFor=rows.filter(r=>r.day===day).flatMap(r=>r.byNpc).filter(r=>r.npc===npc);
  const wins=rowsFor.reduce((n,r)=>n+r.playerWins,0),
   losses=rowsFor.reduce((n,r)=>n+r.npcWins,0),
   draws=rowsFor.reduce((n,r)=>n+r.draws,0);
  return {day,npc,playerWins:wins,npcWins:losses,draws,
   playerWinRate:wins+losses?wins/(wins+losses):null};
 }));
 return {method:'Fixed identical 12 credits/day income, same two free welcomes and 2 weekly NPC minis; shop visit each day, paid plans at actual current costs; distinct pack RNG by day; legal owned-card deck swaps; mirrored level-3 CPU reducer games when --duels is supplied.',parameters:opts,aggregate,opponents,rows,errors,
  warning:'Modelled money/time/duel wins and heuristic deck construction, not player telemetry. Small paired samples do not prove competitive equivalence.'};
}
if(require.main===module){
 try{
  const result=evaluate(parse(process.argv.slice(2)));
  console.log(JSON.stringify(result,null,2));
  if(result.errors.length)process.exitCode=1;
 }catch(e){console.error(e.stack||String(e));process.exitCode=1;}
}
module.exports={DAYS,STYLES,STARTERS,NPCS,random,hash,attackScore,pokemonScore,
 deckMetrics,deckFromOwned,collect,parse,evaluate};