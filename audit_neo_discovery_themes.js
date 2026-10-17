'use strict';
const fs=require('node:fs');
const decks=require('./neo_discovery_decks');
const {CATALOG}=require('./headless_duel');
const A=require('./attack_effects_core');
const P=require('./classic_power_core');
const T=require('./classic_trainer_core');
const knownPowers=new Set([...P.ACTIVATED,...P.ONPLAY,...P.PASSIVE]);
const ids=[...new Set(decks.entries.flatMap(e=>decks.list(e.id)))];
const cards=ids.map(id=>{const c=CATALOG.get(id);if(!c)throw Error('Unknown card '+id);
 const attacks=(c.attacks||[]).map(a=>({name:a.name,compiled:Boolean(A.compile(a))}));
 const powers=(c.abilities||[]).map(p=>({name:p.name||'(missing in imported text)',registered:Boolean(p.name&&knownPowers.has(p.name))}));
 return {id,name:c.name,supertype:c.supertype,attacks,powers,trainer:c.supertype==='Trainer'?T.SUPPORTED.has(c.name):null,
  complete:attacks.every(a=>a.compiled)&&powers.every(p=>p.registered)&&(c.supertype!=='Trainer'||T.SUPPORTED.has(c.name))};
});
const attacks=cards.flatMap(c=>c.attacks),powers=cards.flatMap(c=>c.powers),trainers=cards.filter(c=>c.trainer!==null);
const report={scope:'Original Neo Discovery Brain Wave/Wallop decks only (Neo Genesis reprints included as printed)',
  deckCount:decks.entries.length,decks:decks.entries.map(e=>({id:e.id,name:e.name,cards:decks.list(e.id).length})),
  uniquePrintings:ids.length,newNeoDiscoveryPrintings:decks.neoIds.length,
  attackPrograms:{compiled:attacks.filter(a=>a.compiled).length,total:attacks.length},
  powers:{registered:powers.filter(p=>p.registered).length,total:powers.length},
  trainers:{registered:trainers.filter(c=>c.trainer).length,total:trainers.length},
  unfinishedCards:cards.filter(c=>!c.complete)};
fs.writeFileSync(__dirname+'/NEO_DISCOVERY_THEME_SUPPORT.json',JSON.stringify(report,null,2)+'\n');
console.log('Neo Discovery: '+JSON.stringify({decks:report.deckCount,newNeoDiscoveryPrintings:report.newNeoDiscoveryPrintings,attacks:report.attackPrograms,powers:report.powers,trainers:report.trainers,unfinishedCards:report.unfinishedCards.length}));
if(report.deckCount!==2||report.newNeoDiscoveryPrintings!==22||report.attackPrograms.compiled<29||report.trainers.registered!==report.trainers.total)process.exitCode=1;
