'use strict';
// Economy pacing model. Uses actual collection, duel settlement and intention rules,
// but explicitly models (rather than simulates) duel outcomes, social progress and activity choice.
const Collection=require('../rpg_collection');
const Bridge=require('../rpg_duel_bridge');
const Intentions=require('../rpg_intentions');
const Bonds=require('../rpg_bond_rewards');

const SCENARIOS=Object.freeze([
 {id:'casual',description:'30 duels, 50% wins, one completed relationship, no duel daily intentions',every:3,duels:1,winRate:0.50,chapters:4,intentions:false},
 {id:'regular',description:'45 duels, 65% wins, two completed relationships, duel intentions on duel days',every:2,duels:1,winRate:0.65,chapters:8,intentions:true},
 {id:'duel-heavy',description:'180 duels, 80% wins, no relationship chapters, duel intentions each day',every:1,duels:2,winRate:0.80,chapters:0,intentions:true}
]);
const NPCS=['hana','yuna','reina','camila','akari','shiori','marina','kaede','rina','jinx','sierra','sol'];
const BOND_NPCS=['rina','reina'];
const CHAPTER_CREDITS=[0,10,15,18,25];
const rngFrom=seed=>{let value=seed>>>0;return()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);};
const sum=o=>Object.values(o||{}).reduce((n,c)=>n+c,0);

function simulate(config,seed=1){
 const rng=rngFrom(seed),s={
  day:1,slot:0,location:'shop',credits:80,points:0,results:[],pendingDuel:null,
  playerDeck:'blackout',deckJourney:Collection.fresh(),relationships:{},bonds:{},storyDone:{},tournaments:{}
 };
 Collection.choose(s,'ember_garden');
 for(const npc of NPCS){
  s.relationships[npc]={duels:0,trust:0,respect:0,affection:0};
  s.bonds[npc]={duels:0,trust:0,affection:0};
 }
 let wins=0,losses=0,earnings=0,miniPacks=0,shopPacks=0,voucherPacks=0,signatureCards=0;
 const boughtBySet={};
 const chapterDays=Array.from({length:config.chapters},(_,i)=>Math.floor((i+1)*90/(config.chapters+1)));
 for(let day=1;day<=90;day++){
  s.day=day;
  const chaptersToday=chapterDays.map((when,index)=>when===day?index:-1).filter(index=>index>=0);
  for(const index of chaptersToday){
   const chapter=1+index%4,npc=BOND_NPCS[Math.floor(index/4)];
   if(!npc)throw Error('Simulation needs another authored relationship');
   const credits=CHAPTER_CREDITS[chapter];s.credits+=credits;earnings+=credits;
   if(chapter===2||chapter===4)Collection.awardVoucher(s,Collection.setForCharacter(npc));
   if(chapter===3){Collection.awardSignature(s,Bonds.SIGNATURES[npc]);signatureCards++;}
  }
  if(day%config.every===0){
   if(config.intentions)Intentions.choose(s,'duel');
   for(let turn=0;turn<config.duels;turn++){
    const npc=NPCS[Math.floor(rng()*NPCS.length)],id='sim-'+day+'-'+turn+'-'+npc;
    const victory=rng()<config.winRate;
    const duel={id,npc},before=s.credits;s.pendingDuel=duel;
    const receipt=Bridge.settle(s,duel,victory?0:1,npc);
    s.pendingDuel=null;
    if(!receipt)throw Error('Rejected synthetic duel receipt '+id);
    earnings+=s.credits-before;
    if(victory)wins++;else losses++;
    if(Collection.reward(s,victory,npc,rng,{day,duelId:id})){
     miniPacks++;
     s.deckJourney.lastPack.opened=true;
    }
    if(config.intentions && turn===0){
     const beforeIntention=s.credits;
     Intentions.record(s,'duel');
     earnings+=s.credits-beforeIntention;
    }
   }
  }
  // Vouchers don't charge credits. They may unlock the specific expansion.
  for(const [set,count] of Object.entries({...s.deckJourney.vouchers})){
   for(let i=0;i<count;i++){
    if(s.deckJourney.lastPack)s.deckJourney.lastPack.opened=true;
    Collection.redeemVoucher(s,set,rng);s.deckJourney.lastPack.opened=true;
    voucherPacks++;
   }
  }
  // A deliberate upper-bound spender: buys as many of the latest unlocked set as possible.
  // The model does not assign real duel AI, encounter availability or tournament bonuses.
  const unlocked=Collection.shopPacks(s).filter(p=>p.unlocked),offer=unlocked[unlocked.length-1];
  while(offer&&s.credits>=offer.price){
   if(s.deckJourney.lastPack)s.deckJourney.lastPack.opened=true;
   Collection.buyPack(s,offer.set,rng);s.deckJourney.lastPack.opened=true;
   shopPacks++;boughtBySet[offer.set]=(boughtBySet[offer.set]||0)+1;
  }
 }
 return {scenario:config.id,seed,wins,losses,earnedCredits:earnings,spentCredits:80+earnings-s.credits,
  remainingCredits:s.credits,miniPacks,shopPacks,voucherPacks,signatureCards,
  totalCardCopies:sum(s.deckJourney.owned),distinctCards:Object.keys(s.deckJourney.owned).length,
  boughtBySet};
}
function report(runs=200){
 if(!Number.isInteger(runs)||runs<1||runs>1000)throw Error('Choose 1..1000 samples');
 const columns=['wins','earnedCredits','spentCredits','miniPacks','shopPacks','voucherPacks','totalCardCopies','distinctCards'];
 return SCENARIOS.map(s=>{
  const samples=Array.from({length:runs},(_,i)=>simulate(s,2026+i));
  return {scenario:s.id,description:s.description,runs,
   average:Object.fromEntries(columns.map(key=>[key,Number((samples.reduce((sum,row)=>sum+row[key],0)/runs).toFixed(1))])),
   range:Object.fromEntries(['shopPacks','totalCardCopies'].map(key=>[key,[Math.min(...samples.map(row=>row[key])),Math.max(...samples.map(row=>row[key]))]]))};
 });
}
if(require.main===module){
 const value=process.argv[2]?Number(process.argv[2]):200;
 process.stdout.write(JSON.stringify({model:'Synthetic campaign schedules (not actual duel/AI outcomes)',scenarios:report(value)},null,2)+'\n');
}
module.exports={SCENARIOS,simulate,report};
