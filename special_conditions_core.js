'use strict';
// WotC Base–Neo special conditions. Pure operations on a Pokemon unit; no UI.
// Burn was introduced after this historical catalog and is intentionally absent.
const CONDITIONS=new Set(['Poisoned','Asleep','Paralyzed','Confused']);
function applyCondition(unit,condition){
 if(!CONDITIONS.has(condition))throw Error(`Unknown Special Condition: ${condition}`);
 if(condition==='Poisoned'){unit.poison=true;unit.poisonDamage=10;}
 else unit.status=condition; // Asleep, Paralyzed, Confused are mutually exclusive.
}
function clearConditions(unit){unit.status=null;unit.poison=false;delete unit.poisonDamage;}
function checkup(unit,flip,ownerTurnEnded){
 if(!unit)return {poisonDamage:0,woke:false,recoveredParalysis:false};
 const poisonDamage=unit.poison?(unit.poisonDamage||10):0;
 const woke=unit.status==='Asleep'&&Boolean(flip());
 if(woke)unit.status=null;
 const recoveredParalysis=unit.status==='Paralyzed'&&ownerTurnEnded;
 if(recoveredParalysis)unit.status=null;
 return {poisonDamage,woke,recoveredParalysis};
}
module.exports={applyCondition,clearConditions,checkup};
