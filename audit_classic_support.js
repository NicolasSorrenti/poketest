'use strict';
const fs=require('node:fs');
const ATTACK=require('./attack_effects_core');
const TRAINERS=require('./classic_trainer_core');
const POWERS=require('./classic_power_core');
const files=['base1','base2','base3','base5'];
const rows=[],missing=[];
for(const set of files){
 const cards=require('./cards/'+set+'.json');
 const attacks=cards.flatMap(c=>(c.attacks||[]).map(a=>({card:c,attack:a})));
 const trainers=cards.filter(c=>c.supertype==='Trainer');
 const powers=cards.flatMap(c=>(c.abilities||[]).filter(a=>a.name).map(a=>({card:c,power:a})));
 const handlers=[...POWERS.ACTIVATED,...POWERS.PASSIVE,...POWERS.ONPLAY];
 const attackHandlers=attacks.filter(x=>ATTACK.compile(x.attack)).length;
 const trainerHandlers=trainers.filter(c=>TRAINERS.SUPPORTED.has(c.name)).length;
 const powerHandlers=powers.filter(x=>handlers.includes(x.power.name)).length;
 for(const x of attacks)if(!ATTACK.compile(x.attack))missing.push({set,id:x.card.id,type:'attack',name:x.attack.name});
 for(const c of trainers)if(!TRAINERS.SUPPORTED.has(c.name))missing.push({set,id:c.id,type:'trainer',name:c.name});
 for(const x of powers)if(!handlers.includes(x.power.name))missing.push({set,id:x.card.id,type:'power',name:x.power.name});
 rows.push({set,cards:cards.length,attacks:{total:attacks.length,handlers:attackHandlers},trainers:{total:trainers.length,handlers:trainerHandlers},powers:{total:powers.length,handlers:powerHandlers}});
}
const totals=['attacks','trainers','powers'].map(type=>({type,records:rows.reduce((n,r)=>n+r[type].total,0),handlers:rows.reduce((n,r)=>n+r[type].handlers,0)}));
const report={format:'classic',status:'Execution handler coverage, NOT historical-rule fidelity certification',sets:rows,totals,unhandled:missing,notes:['Four-set card pool only. Later expansions stay archived.','The headless reducer is authoritative for these tests; the existing browser UI still uses its legacy rules engine.','Handler existence and smoke resolution do not certify every timing or card combination.','Legacy strict fidelity gate still audits Gym and Neo mechanics outside Classic scope.']};
if(process.argv.includes('--write'))fs.writeFileSync('CLASSIC_SUPPORT_COVERAGE.json',JSON.stringify(report,null,2)+'\n');
console.table(rows.map(r=>({set:r.set,cards:r.cards,attacks:`${r.attacks.handlers}/${r.attacks.total}`,trainers:`${r.trainers.handlers}/${r.trainers.total}`,powers:`${r.powers.handlers}/${r.powers.total}`})));
console.table(totals);
console.log('Unregistered Classic records:',missing.length);
if(missing.length)process.exitCode=1;
module.exports=report;
