'use strict';
const fs=require('node:fs');
const N=require('./neo_genesis_decks');
const {CATALOG}=require('./headless_duel');
const A=require('./attack_effects_core'),T=require('./classic_trainer_core'),P=require('./classic_power_core');
const pow=new Set([...P.ACTIVATED,...P.ONPLAY,...P.PASSIVE]);
const cards=NEO=>[...new Set(N.list(NEO))].map(id=>{
 const c=CATALOG.get(id);
 return {id,name:c.name,supertype:c.supertype,attacks:(c.attacks||[]).map(a=>({name:a.name,compiled:!!A.compile(a)})),powers:(c.abilities||[]).filter(a=>a.name).map(a=>({name:a.name,registered:pow.has(a.name)})),trainer:c.supertype==='Trainer'?T.SUPPORTED.has(c.name):null};
});
const decks=N.entries.map(row=>({id:row.id,name:row.name,cards:cards(row.id)}));
const all=[...new Map(decks.flatMap(d=>d.cards).map(c=>[c.id,c])).values()];
const attacks=all.flatMap(c=>c.attacks);
const powers=all.flatMap(c=>c.powers);
const trainers=all.filter(c=>c.trainer!==null);
const report={scope:'Original 2 Neo Genesis retail decks only, not complete Neo Genesis set',deckCount:decks.length,printings:all.length,attackPrograms:{compiled:attacks.filter(a=>a.compiled).length,total:attacks.length},powers:{registered:powers.filter(x=>x.registered).length,total:powers.length},trainers:{registered:trainers.filter(x=>x.trainer).length,total:trainers.length},missingEffects:all.filter(c=>c.attacks.some(a=>!a.compiled)||c.powers.some(a=>!a.registered)||c.trainer===false),decks};
fs.writeFileSync(__dirname+'/NEO_GENESIS_THEME_SUPPORT.json',JSON.stringify(report,null,2)+'\n');
console.log(`Neo Genesis preview: ${decks.length} decks; ${all.length} Neo printings; attack programs ${report.attackPrograms.compiled}/${report.attackPrograms.total}; Power handlers ${report.powers.registered}/${report.powers.total}; Trainer handlers ${report.trainers.registered}/${report.trainers.total}; ${report.missingEffects.length} cards with unfinished effects`);
if(report.attackPrograms.total!==42||report.attackPrograms.compiled<36||report.trainers.registered!==5||report.printings!==33)process.exitCode=1;
