'use strict';
// RPG-only, server-side draw assistance. The reducer remains responsible for the actual draw.
const {CATALOG}=require('./headless_duel');
const CHANCE=0.25, STALL_TURNS=3, MAX_ASSISTS=3, MIN_SCORE=6;
const DRAW=new Set(['Professor Oak','Professor Elm','Bill','Mary',"Bill's Teleporter",'Erika']);
const SEARCH=new Set(['Computer Search','Pokémon Trader','Poké Ball','Master Ball','Pokémon March','Pokémon Breeder Fields','New Pokédex']);
const ENERGY_SEARCH=new Set(['Energy Search','Energy Retrieval','Super Energy Retrieval']);
const EVOLVE_SEARCH=new Set(['Pokémon Breeder','Pokémon Trader','Computer Search']);
const name=id=>CATALOG.get(id)?.name||'';
const pokemon=p=>[p.active,...(p.bench||[])].filter(Boolean);
function evolveTarget(c,units){
 return !!c.evolvesFrom&&units.some(u=>[u.id,...(u.under||[])].some(id=>{
  const parent=name(id);return parent===c.evolvesFrom||
   parent.endsWith(' '+c.evolvesFrom)||c.evolvesFrom.endsWith(' '+parent);
 }));
}
function useful(id,player,profile){
 const c=CATALOG.get(id);if(!c)return 0;
 const units=pokemon(player),hand=player.hand||[];
 const handEnergy=hand.filter(x=>CATALOG.get(x)?.supertype==='Energy');
 const attached=units.reduce((n,u)=>n+(u.energies?.length||0),0);
 const handBasics=hand.filter(x=>CATALOG.get(x)?.supertype==='Pokémon'&&CATALOG.get(x)?.subtypes?.includes('Basic'));
 const handUseful=hand.filter(x=>CATALOG.get(x)?.supertype==='Energy'||CATALOG.get(x)?.supertype==='Pokémon'&&
  (CATALOG.get(x)?.subtypes?.includes('Basic')||evolveTarget(CATALOG.get(x),units)));
 const deadHand=handUseful.length===0||hand.length<=2;
 const strategy=profile?.strategy||'';
 const hasName=n=>hand.some(x=>name(x)===n);
 const hasEvolution=units.some(u=>u&&[...(u.under||[]),u.id].some(id=>!!name(id)));
 const canSpendHand=handUseful.length>1;
 const damaged=units.some(u=>(u.damage||0)>0||(u.damageCounters||0)>0);
 const hasBench=units.length>1;
 const preferredEnergy=new Set((profile?.energy||[]).map(x=>x[0]));
 const signature=new Set(profile?.signatureTrainers||[]);
 const inHand=hand.some(x=>x===id||name(x)===c.name);
 if(c.supertype==='Energy'){
  const matching=preferredEnergy.size===0||preferredEnergy.has(id);
  if(!matching)return 0;
  return handEnergy.length===0?(attached===0?9:attached<3?7:3):attached===0?4:0;
 }
 if(c.supertype==='Pokémon'){
  if(c.subtypes?.includes('Basic'))return units.length<2&&handBasics.length===0?7:0;
  return evolveTarget(c,units)&&!inHand?8:0;
 }
 if(c.supertype!=='Trainer')return 0;
 const n=c.name;
 if(inHand)return 0;
 if(DRAW.has(n)){
  // Oak/Elm are particularly useful when the hand cannot advance the board.
  if(n==='Professor Oak'&&hand.length>=5&&canSpendHand)return 0;
  return deadHand?11:hand.length<=3?8:0;
 }
 if(n==='Pokémon Trader')return hand.some(x=>CATALOG.get(x)?.supertype==='Pokémon')&&(deadHand||!hasEvolution)?8:0;
 if(n==='Computer Search')return hand.length>=2&&(deadHand||handUseful.length<=1)?9:0;
 if(n==='Pokémon Breeder')return units.some(u=>u&&!u.evolvedThisTurn)&&!hasName(n)?6:0;
 if(SEARCH.has(n)){
  return deadHand||units.length<2?8:handUseful.length<=1?6:0;
 }
 if(ENERGY_SEARCH.has(n))return handEnergy.length===0&&attached<3?8:0;
 if(/Potion|Heal|Moo-Moo Milk|Gold Berry|Defender/.test(n))return damaged?6:0;
 if(/Switch|Gust of Wind|Double Gust/.test(n))return hasBench&&attached>0?6:0;
 if(/Energy Removal|Super Energy Removal/.test(n))return /control|denial|disruption/i.test(strategy)?6:0;
 if(EVOLVE_SEARCH.has(n))return units.some(u=>u&&!u.secretPlanFaceDown)&&handUseful.length<2?7:0;
 if(signature.has(id))return deadHand&&hand.length<=2?6:0;
 if(/control|denial|disruption/i.test(strategy)&&/Removal|Lass|Rocket's Sneak Attack|Gust of Wind/.test(n))return 0;
 return 0;
}
function assist(game,record,random=Math.random,profile){
 if(!record||(record.usedCount||0)>=MAX_ASSISTS||record.stalled<STALL_TURNS||game.phase!=='game'||game.turn!==0||game.over)return false;
 const p=game.players?.[1];
 if(!p?.deck?.length||!p.active)return false;
 const candidates=p.deck.map((id,index)=>({id,index,score:useful(id,p,profile)})).filter(x=>x.score>=MIN_SCORE);
 if(!candidates.length||random()>=CHANCE)return false;
 candidates.sort((a,b)=>b.score-a.score||b.index-a.index);
 const i=candidates[0].index,last=p.deck.length-1;
 [p.deck[i],p.deck[last]]=[p.deck[last],p.deck[i]];
 record.usedCount=(record.usedCount||0)+1;
 record.used=record.usedCount>=MAX_ASSISTS;
 record.stalled=0;
 return true;
}
function observe(record,before,after){
 if(!record||before?.turn!==1||after?.turn!==0||before?.phase!=='game')return;
 const old=before.players?.[1],now=after.players?.[1];
 if(!old||!now)return;
 const energy=p=>pokemon(p).reduce((n,u)=>n+(u.energies?.length||0),0);
 const previousEvents=new Set((before.events||[]).map(e=>e.seq));
 const attacked=(after.events||[]).some(e=>e.side===1&&
  (e.type==='attack'||e.type==='use_attack')&&!previousEvents.has(e.seq));
 // Turns with productive progress do not contribute to the stall counter.
 record.stalled=attacked||energy(now)>energy(old)?0:Math.min(STALL_TURNS,(record.stalled||0)+1);
}
module.exports={assist,observe,useful};
