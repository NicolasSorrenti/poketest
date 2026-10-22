'use strict';
// Registry-based audit of authoritative Classic Power coverage across every historical set.
// A missing registration is a review target, not proof the effect is absent in other runners.
const path=require('node:path');
const POWERS=require('./classic_power_core');
const SETS=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const powerCards=SETS.flatMap(set=>require(path.join(__dirname,'cards',set+'.json'))
 .flatMap(c=>(c.abilities||[]).filter(a=>a.name).map(a=>({
  id:c.id,name:c.name,power:a.name,text:a.text||'',set
 }))));
const registries={
 activated:POWERS.ACTIVATED,
 passive:POWERS.PASSIVE,
 onPlay:POWERS.ONPLAY,
 unsupported:POWERS.UNSUPPORTED
};
const allNames=new Set(powerCards.map(x=>x.power));
const registered=new Set(Object.values(registries).flatMap(items=>[...items]));
const missing=[...allNames].filter(name=>!registered.has(name)).sort();
const likelyActivated=powerCards.filter(x=>missing.includes(x.power)&&
 /once during your turn|once per turn|you may use this power/i.test(x.text));
const counts=Object.fromEntries(SETS.map(set=>[set,powerCards.filter(x=>x.set===set).length]));
const summary={
 sets:SETS.length,powerPrintings:powerCards.length,uniquePowerNames:allNames.size,
 registeredPowerNames:[...allNames].filter(x=>registered.has(x)).length,
 unregisteredPowerNames:missing.length,
 bySet:counts,
 namesToReview:missing,
 apparentlyActivatedAndUnregistered:likelyActivated.map(x=>({id:x.id,name:x.name,power:x.power}))
};
console.log(JSON.stringify(summary,null,2));
if(require.main===module&&process.argv.includes('--strict')&&missing.length){
 console.error('Unregistered historical Pokémon Power names remain: '+missing.length);
 process.exitCode=1;
}
module.exports={summary,powerCards};
