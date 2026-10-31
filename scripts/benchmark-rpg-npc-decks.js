'use strict';
// Reproducible, paired REAL Classic engine matches for RPG opponent recipes.
// The opponent and the player both use level-3 CPU policies to isolate deck strength.
// Results measure match outcomes; they do not change CPU skill or printed card rules.
const {argumentsOf,duel,wilson}=require('../benchmark_cpu');
const {ClassicLocalService}=require('../classic_local_service');
const {CATALOG}=require('../headless_duel');
const {validateDeck,isBasicEnergy}=require('../core_rules');
const Collection=require('../rpg_collection');
const NPC=require('../rpg_npc_deck_progression');

const MATCHUPS=Object.freeze({
 hana:'power_reserve',reina:'blackout',shiori:'overgrowth',yuna:'zap',
 akari:'gym_new_voltage',camila:'rocket_lab',marina:'water_blast',
 kaede:'rocket_lab',jun:'fossil_lab',teo:'hotfoot',
 iris:'cold_fusion',elio:'bodyguard',alma:'lockdown',nereo:'cold_fusion',
 barb:'zap',laca:'water_blast',daisy:'water_blast',rina:'overgrowth',
 sol:'hotfoot',jinx:'zap',luna:'water_blast',elena:'overgrowth',sierra:'blackout',jicy:'cold_fusion',lyla:'lockdown'
});
const STAGES=Object.freeze([
 {id:'early',day:15,tier:1,shopPacks:0,miniPacks:2},
 {id:'mid',day:42,tier:3,shopPacks:12,miniPacks:8},
 {id:'late',day:80,tier:6,shopPacks:36,miniPacks:16}
]);
const INITIAL=['ember_garden','tidal_circuit','mind_and_muscle'];
// Only deterministic, economy-obtainable cards can be added to player decks.
// These weights order convenience when a player has enough copies; they are
// NOT estimates of in-game CPU move quality or win probability.
const TRAINER_PRIORITY=Object.freeze({
 'Computer Search':100,'Professor Oak':94,'Item Finder':92,'Bill':82,
 'PlusPower':78,'Gust of Wind':77,'Pokémon Trader':75,'Pokémon Breeder':72,
 'Energy Removal':70,'Super Energy Removal':68,'Switch':55,
 'Full Heal':35,'Potion':23,'Super Potion':22,'Pokédex':10,'Defender':9
});
function rngFor(seed){
 let x=seed>>>0;
 return ()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);
}
const counts=cards=>{
 const out={};
 for(const id of cards)out[id]=(out[id]||0)+1;
 return out;
};
function modifications(original,next){
 const a=counts(original),b=counts(next);
 return Object.keys(b).reduce((sum,id)=>sum+Math.max(0,b[id]-(a[id]||0)),0);
}
function metrics(deck){
 const cards=deck.map(id=>CATALOG.get(id));
 const frequency=(key)=>cards.filter(key).length;
 const basics=frequency(c=>c?.supertype==='Pokémon'&&(c.subtypes||[]).some(t=>t==='Basic'||t==='Baby'));
 const energies=frequency(c=>c&&isBasicEnergy(c));
 const trainers=frequency(c=>c?.supertype==='Trainer');
 const evolutions=frequency(c=>c?.supertype==='Pokémon'&&c.evolvesFrom);
 const stagesWithoutPrerequisite=cards.filter(c=>c?.supertype==='Pokémon'&&c.evolvesFrom
  &&!cards.some(p=>p?.name===c.evolvesFrom)).length;
 return {basics,energies,trainers,evolutions,stagesWithoutPrerequisite};
}
function buildPlayerDeck(starterId,stage,seed=1){
 const state={day:1,location:'shop',credits:0,deckJourney:Collection.fresh()};
 Collection.choose(state,starterId);
 const initial=[...state.deckJourney.deck],rng=rngFor(seed);
 const packs=stage.shopPacks+stage.miniPacks;
 const drawnByTheme={};
 for(let n=0;n<packs;n++){
  const simulatedDay=Math.min(stage.day,Math.max(1,Math.floor((n+1)*stage.day/(packs+1))));
  // Opening two different starter mini packs mirrors the actual campaign.
  // Later purchases rotate among the available themed offers, so base-era
  // Trainer and evolution pools remain useful after Neo expansions unlock.
  const available=Collection.themedPacks({day:simulatedDay,deckJourney:state.deckJourney})
   .filter(offer=>offer.unlocked);
  const theme=n===0?'arena':n===1?'evolution':available[(n+2)%available.length].id;
  const quantity=n<stage.miniPacks?5:10;
  const pulled=Collection.randomThemedPack({day:simulatedDay,deckJourney:state.deckJourney},theme,rng,quantity);
  for(const id of pulled)state.deckJourney.owned[id]=(state.deckJourney.owned[id]||0)+1;
  drawnByTheme[theme]=(drawnByTheme[theme]||0)+1;
 }
 const deck=[...initial],owned=state.deckJourney.owned;
 const score=id=>TRAINER_PRIORITY[CATALOG.get(id)?.name]||0;
 const canAdd=id=>{
  const card=CATALOG.get(id);if(!card||card.supertype!=='Trainer')return false;
  if(deck.filter(x=>x===id).length>=(owned[id]||0))return false;
  const name=card.name;
  return deck.filter(x=>CATALOG.get(x)?.name===name).length<4;
 };
 const targets=Object.keys(owned).filter(id=>score(id)>=55&&canAdd(id)).sort((a,b)=>score(b)-score(a)||a.localeCompare(b));
 const minEnergy=stage.tier===2?19:17;
 for(const wanted of targets){
  while(canAdd(wanted)){
   // Favor replacing low-impact Trainers before consuming vital Energy.
   const discard=deck.map((id,i)=>({id,i,score:score(id),card:CATALOG.get(id)}))
    .filter(({card,score:rating})=>card?.supertype==='Trainer'&&rating<score(wanted))
    .sort((a,b)=>a.score-b.score||a.i-b.i)[0];
   const energyIndices=deck.map((id,i)=>({id,i,card:CATALOG.get(id)})).filter(x=>isBasicEnergy(x.card));
   const energy=energyIndices.length>minEnergy&&score(wanted)>=70?energyIndices.at(-1):null;
   const drop=discard||energy;
   if(!drop)break;
   deck[drop.i]=wanted;
  }
 }
 const legality=validateDeck(deck,CATALOG);
 const ownedCheck=Collection.check(deck,owned);
 if(!legality.valid||!ownedCheck.valid)throw Error('Invalid simulated '+stage.id+' player deck: '+legality.errors.concat(ownedCheck.errors).join('; '));
 return {cards:deck,earnedCopies:Object.values(owned).reduce((n,c)=>n+c,0),
  upgrades:modifications(initial,deck),packsDrawn:packs,drawnByTheme,metrics:metrics(deck)};
}
function parse(argv){
 const options={npcs:['reina','hana','camila','marina'],starters:INITIAL,pairs:1,maxTurns:70,seed:72026,stages:['early','mid','late']};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];if(i===argv.length-1)throw Error('Missing value for '+key);
  const value=argv[++i];
  if(key==='--npcs')options.npcs=value.split(',');
  else if(key==='--starters')options.starters=value.split(',');
  else if(key==='--stages')options.stages=value.split(',');
  else if(key==='--pairs')options.pairs=Number(value);
  else if(key==='--max-turns')options.maxTurns=Number(value);
  else if(key==='--seed')options.seed=Number(value);
  else throw Error('Unknown option '+key);
 }
 if(!Number.isInteger(options.pairs)||options.pairs<1||options.pairs>40)throw Error('Invalid paired sample count');
 if(!Number.isInteger(options.maxTurns)||options.maxTurns<10||options.maxTurns>250)throw Error('Invalid maximum turns');
 if(!Number.isSafeInteger(options.seed)||options.seed<0)throw Error('Invalid seed');
 if(!options.npcs.length||options.npcs.some(x=>!Object.hasOwn(MATCHUPS,x)))throw Error('Unknown NPC');
 if(!options.starters.length||options.starters.some(x=>!INITIAL.includes(x)))throw Error('Unknown starter');
 if(!options.stages.length||options.stages.some(x=>!STAGES.some(y=>y.id===x)))throw Error('Unknown stage');
 return options;
}
function evaluate(options){
 const service=new ClassicLocalService(),cases=[],errors=[];
 for(const stageId of options.stages){
  const stage=STAGES.find(x=>x.id===stageId);
  for(const npc of options.npcs)for(const starter of options.starters){
   const original=service.decklist(MATCHUPS[npc]);
   const cards=NPC.upgrade({npc,tier:stage.tier,original,catalog:CATALOG});
   const player=buildPlayerDeck(starter,stage,options.seed+INITIAL.indexOf(starter)*1009);
   const legality=validateDeck(cards,CATALOG);
   if(!legality.valid)throw Error(npc+' '+stage.id+': '+legality.errors.join('; '));
   const seed=options.seed+stage.tier*100003+options.npcs.indexOf(npc)*1709+INITIAL.indexOf(starter)*731;
   const opts=argumentsOf(['--pairs',String(options.pairs),'--max-turns',String(options.maxTurns),
    '--seed',String(seed),'--left-level','3','--right-level','3']);
   // The RPG's player deck is a custom deck, so ClassicLocalService uses its
   // expanded format. The generic CPU benchmark defaults to Base–Rocket Classic.
   // Do not silently exclude legal Gym, Base Set 2 or Neo collection upgrades.
   const includesNeo=[...player.cards,...cards].some(id=>/^neo[1-4]-/.test(id));
   opts.format=includesNeo?'online-preview':'gym-expanded';
   const games=[];
   for(let k=0;k<options.pairs;k++)for(const swap of [false,true]){
    try{games.push(duel(opts,k,swap,[player.cards,cards]));}
    catch(error){errors.push({stage:stage.id,npc,starter,pair:k,swap,error:String(error)});}
   }
   const cpuWins=games.filter(m=>m.winner===1).length,playerWins=games.filter(m=>m.winner===0).length;
   const completed=cpuWins+playerWins;
   cases.push({stage:stage.id,npc,starter,tier:stage.tier,pairs:options.pairs,games:games.length,
    cpuWins,playerWins,drawsOrTimeouts:games.length-completed,
    cpuWinRateDecisive:completed?Number((cpuWins/completed).toFixed(3)):null,
    uncertainty95:completed?wilson(cpuWins,completed):null,
    cpuDeckChanges:modifications(original,cards),playerDeckChanges:player.upgrades,
    cpuDeckMetrics:metrics(cards),playerDeckMetrics:player.metrics,
    cpuEvolutions:games.reduce((n,m)=>n+(m.stats.byRole[1].evolve||0),0),
    cpuAttacks:games.reduce((n,m)=>n+(m.stats.byRole[1].attack||0),0),
    cpuTrainerUses:games.reduce((n,m)=>n+(m.stats.byRole[1].play_trainer||0),0),
    playerPacks:player.packsDrawn});
  }
 }
 const totals=STAGES.filter(s=>options.stages.includes(s.id)).map(stage=>{
  const sample=cases.filter(x=>x.stage===stage.id),cpuWins=sample.reduce((n,x)=>n+x.cpuWins,0),
   playerWins=sample.reduce((n,x)=>n+x.playerWins,0),draws=sample.reduce((n,x)=>n+x.drawsOrTimeouts,0);
  return {stage:stage.id,games:cpuWins+playerWins+draws,cpuWins,playerWins,draws,
   npcWinRateDecisive:cpuWins+playerWins?Number((cpuWins/(cpuWins+playerWins)).toFixed(3)):null,
   uncertainty95:cpuWins+playerWins?wilson(cpuWins,cpuWins+playerWins):null};
 });
 return {parameters:{...options,levels:'3 versus 3 (deck comparison only)'},totals,cases,errors,
  disclaimer:'Real Classic reducer with two ordinary CPU agents, not a human-play win-rate prediction. Limited seeds, matchups and upper turn bound can skew results.'};
}
if(require.main===module){
 try{
  const report=evaluate(parse(process.argv.slice(2)));
  console.log(JSON.stringify(report,null,2));
  if(report.errors.length)process.exitCode=1;
 }catch(err){console.error(err.stack||String(err));process.exitCode=1;}
}
module.exports={MATCHUPS,STAGES,INITIAL,parse,buildPlayerDeck,metrics,evaluate,modifications};
