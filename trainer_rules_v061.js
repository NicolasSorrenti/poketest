'use strict';
// v0.6.1: corrections to old Trainer effects that must interact with attacks.
// Do not claim comprehensive Trainer accuracy: other partial interactions remain.
const trainer61PreviousAttack=Engine.prototype.attack;
function trainer61Protected(u){return Boolean((u?.attachedTrainers||[]).some(t=>lookup.get(t.id)?.name==="Brock's Protection"));}
function trainer61EnergySnapshot(g,side){
 return [side.active,...side.bench].filter(Boolean).map(u=>({unit:u,protectedAtStart:trainer61Protected(u),energy:u.energies.slice(),discard:side.discard.slice(),hand:side.hand.slice(),deck:side.deck.slice(),otherUnits:[side.active,...side.bench].filter(v=>v&&v!==u).map(v=>({unit:v,energy:v.energies.slice()}))}));
}
function trainer61Count(list,id){return list.filter(x=>x===id).length;}
// Opponent attack effects cannot strip Energy from Brock's protected Pokémon.
// Ecogym sends non-Colorless Energy discarded BY AN OPPONENT to its owner's hand.
// KO discards do not qualify. This also handles multiple copies of one Energy.
Engine.prototype.trainer61RestoreOpposingEnergy=function(side,snapshots){
 const gym=lookup.get(this.stadium?.id)?.name==='Ecogym';
 for(const {unit,protectedAtStart,energy,discard,hand,deck,otherUnits} of snapshots){
  if(!([side.active,...side.bench].includes(unit)))continue; // a Knock Out, not an Energy-removal event
  const protectedUnit=protectedAtStart===undefined?trainer61Protected(unit):protectedAtStart;
  const before=new Map(),after=new Map();
  for(const id of energy)before.set(id,(before.get(id)||0)+1);
  for(const id of unit.energies)after.set(id,(after.get(id)||0)+1);
  for(const [id,count] of before){
   const missing=count-(after.get(id)||0);
   if(missing<=0)continue;
   const newlyDiscarded=Math.max(0,trainer61Count(side.discard,id)-trainer61Count(discard,id));
   if(protectedUnit){
    // The prohibition is on *removal*, not just discard. An attack may
    // return Energy to hand/deck or move it to a different Pokémon.
    const locations=[
     {now:side.discard,before:discard},
     {now:side.hand,before:hand},
     {now:side.deck,before:deck},
     ...otherUnits.filter(({unit:v})=>[side.active,...side.bench].includes(v)).map(({unit:v,energy:old})=>({now:v.energies,before:old}))
    ];
    let outstanding=missing;
    for(const {now,before:old} of locations){
     let increased=Math.max(0,trainer61Count(now,id)-trainer61Count(old,id));
     while(outstanding>0&&increased>0){const at=now.lastIndexOf(id);if(at<0)break;now.splice(at,1);unit.energies.push(id);outstanding--;increased--;
      this.log("Brock's Protection prevented opposing Energy removal.");
     }
    }
    // The attacker cannot legally remove protected Energy. If a card's
    // exceptional effect destroys the destination before inspection, never
    // manufacture an untracked copy: the audit must catch that interaction.
    continue;
   }
   let move=Math.min(missing,newlyDiscarded);
   if(!move||!(gym&&energyType(id)!=='Colorless'&&lookup.get(id)?.name!=='Double Colorless Energy'))continue;
   while(move--){const index=side.discard.lastIndexOf(id);if(index<0)break;side.discard.splice(index,1);
    if(protectedUnit)unit.energies.push(id);else side.hand.push(id);
    this.log(protectedUnit?"Brock's Protection prevented opposing Energy removal.":'Ecogym returned discarded Energy to its owner.');
   }
  }
 }
};
Engine.prototype.attack=function(i,benchTarget=null,deferTurnEnd=false,searchChoice=null,copyOverride=null){
 const attacker=this.me?.active,card=this.card(attacker),attack=copyOverride?.attack||card?.attacks?.[i],serial=this.turnSerial;
 const surge=Boolean(attacker&&card?.name?.startsWith("Lt. Surge's ")&&lookup.get(this.stadium?.id)?.name==='Vermilion City Gym');
 const isHuman=this.turn===0;
 const pending=this._trainer61Vermilion;
 if(surge&&isHuman&&this.phase==='game'&&!this.over&&attack&&this.afford(attacker,card.attacks?.[i]?.cost||[])&&
    !['Asleep','Paralyzed'].includes(attacker.status)&&
    !(pending?.serial===serial&&pending.attacker===attacker&&pending.index===i)){
  deckSearchRequest={label:'Vermilion City Gym: flip a coin for this Lt. Surge attack?',options:[
   {index:0,name:'No — use the attack normally'},{index:1,name:'Yes — Heads: +10 damage; Tails: 10 self-damage'}],execute:choice=>{
    if(choice!==0&&choice!==1)return false;
    if(this.turn!==0||this.me.active!==attacker||this.turnSerial!==serial)return false;
    this._trainer61Vermilion={attacker,index:i,serial,chosen:choice===1,result:choice===1?coin('Vermilion City Gym'):null};
    deckSearchRequest=null;
    const outcome=this.attack(i,benchTarget,deferTurnEnd,searchChoice,copyOverride);
    if(outcome===true||outcome===false&&!deckSearchRequest)delete this._trainer61Vermilion;
    render();return outcome;
   }};
  render();return null;
 }
 // This protection works whether the attacking Pokémon is human or CPU-controlled.
 const foe=this.foe,energyBefore=foe?trainer61EnergySnapshot(this,foe):[];
 const result=trainer61PreviousAttack.call(this,i,benchTarget,deferTurnEnd,searchChoice,copyOverride);
 if(result===true&&foe)this.trainer61RestoreOpposingEnergy(foe,energyBefore);
 if(result===true&&this._trainer61Vermilion?.attacker===attacker&&this._trainer61Vermilion.serial===serial)delete this._trainer61Vermilion;
 return result;
};
