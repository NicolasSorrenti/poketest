'use strict';
// This report measures handler availability, not certified card-rules fidelity.
const fs=require('node:fs');
const A=require('./attack_effects_core');
const T=require('./classic_trainer_core');
const P=require('./classic_power_core');
const cards=[...require('./cards/gym1.json'),...require('./cards/gym2.json')];
const knownPowers=new Set([...P.ACTIVATED,...P.ONPLAY,...P.PASSIVE]);
const records=[];const summary={cards:cards.length,attacks:{total:0,handler:0,missing:0},pokemonPowers:{total:0,handler:0,missing:0},trainers:{total:0,handler:0,missing:0}};
for(const c of cards){const entry={id:c.id,name:c.name,set:c.id.split('-')[0],type:c.supertype,attacks:[],powers:[],trainer:null};
 for(const a of c.attacks||[]){const compiled=A.compile(a);const handler=Boolean(compiled&&compiled.kind);entry.attacks.push({name:a.name,handler,kind:compiled?.kind||null});summary.attacks.total++;summary.attacks[handler?'handler':'missing']++;}
 for(const p of c.abilities||[]){if(!p.name)continue;const handler=knownPowers.has(p.name);entry.powers.push({name:p.name,handler});summary.pokemonPowers.total++;summary.pokemonPowers[handler?'handler':'missing']++;}
 if(c.supertype==='Trainer'){const handler=T.SUPPORTED.has(c.name);entry.trainer={handler};summary.trainers.total++;summary.trainers[handler?'handler':'missing']++;}
 records.push(entry);
}
const report={version:'0.24-gym-expansion-compatibility',scope:'Gym Heroes / Gym Challenge printed records',definition:'handler indicates explicit compiled/support code only, NOT exhaustive runtime or historical timing verification',summary,unhandled:records.filter(c=>c.attacks.some(a=>!a.handler)||c.powers.some(p=>!p.handler)||(c.trainer&&!c.trainer.handler)),cards:records};
fs.writeFileSync('GYM_COMPATIBILITY_REPORT_V024.json',JSON.stringify(report,null,2)+'\n');
console.log('Gym printed records audit:',JSON.stringify(summary));
console.log('Cards containing at least one unsupported effect:',report.unhandled.length);
