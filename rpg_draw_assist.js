'use strict';
// RPG-only, server-side draw assistance. Never expose this state to publicView.
const {CATALOG}=require('./headless_duel');
const CHANCE=0.25, STALL_TURNS=3;
function useful(id,player){
 const c=CATALOG.get(id);if(!c)return 0;
 const units=[player.active,...(player.bench||[])].filter(Boolean);
 const hand=player.hand||[];
 if(c.supertype==='Energy'){
  const energy=units.reduce((n,u)=>n+(u.energies?.length||0),0);
  return energy===0?5:energy<2?3:0;
 }
 if(c.supertype==='Pokémon'){
  if(c.subtypes?.includes('Basic'))return units.length<2?3:0;
  if(units.some(u=>u.id===id))return 0;
  const evolves=c.evolvesFrom;
  if(evolves&&units.some(u=>[u.id,...(u.under||[])].some(x=>CATALOG.get(x)?.name===evolves)))return 4;
 }
 return 0;
}
function assist(game,record,random=Math.random){
 if(!record||record.used||record.stalled<STALL_TURNS||game.phase!=='game'||game.turn!==0||game.over)return false;
 const p=game.players?.[1];
 if(!p?.deck?.length||!p.active)return false;
 const candidates=p.deck.map((id,index)=>({id,index,score:useful(id,p)})).filter(x=>x.score>0);
 if(!candidates.length||random()>=CHANCE)return false;
 candidates.sort((a,b)=>b.score-a.score||b.index-a.index);
 const i=candidates[0].index,last=p.deck.length-1;
 [p.deck[i],p.deck[last]]=[p.deck[last],p.deck[i]];
 record.used=true;
 return true;
}
function observe(record,before,after){
 if(!record||before?.turn!==1||after?.turn!==0||before?.phase!=='game')return;
 const old=before.players?.[1],now=after.players?.[1];
 if(!old||!now)return;
 const oldEnergy=[old.active,...old.bench].filter(Boolean).reduce((n,u)=>n+(u.energies?.length||0),0);
 const newEnergy=[now.active,...now.bench].filter(Boolean).reduce((n,u)=>n+(u.energies?.length||0),0);
 const attacked=(after.events||[]).some(e=>e.side===1&&e.type==='attack'&&
  !(before.events||[]).some(prev=>prev.seq===e.seq));
 record.stalled=attacked||newEnergy>oldEnergy?0:Math.min(STALL_TURNS,(record.stalled||0)+1);
}
module.exports={assist,observe};
