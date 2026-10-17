'use strict';
const fs=require('node:fs');
const path=require('node:path');
const CLASSIC=require('./classic_format');
const {CATALOG}=require('./headless_duel');
const {compile}=require('./attack_effects_core');
const records=[],remaining=[];const sets=[];
for(const set of CLASSIC.SETS){
 const cards=require('./cards/'+set+'.json');const attacks=cards.flatMap(c=>(c.attacks||[]).map((attack,index)=>({cardId:c.id,cardName:c.name,index,attackName:attack.name,kind:compile(attack)?.kind||null})));
 const compiled=attacks.filter(x=>x.kind).length;
 sets.push({id:set,name:CLASSIC.SET_NAMES[set],cards:cards.length,attacks:attacks.length,ported:compiled,remaining:attacks.length-compiled,powers:cards.reduce((n,c)=>n+(c.abilities||[]).length,0),trainers:cards.filter(c=>c.supertype==='Trainer').length});
 records.push(...attacks);remaining.push(...attacks.filter(x=>!x.kind));
}
const total=sets.reduce((sum,s)=>sum+s.attacks,0),ported=sets.reduce((sum,s)=>sum+s.ported,0);
const audit={format:CLASSIC.id,cards:sets.reduce((sum,s)=>sum+s.cards,0),total,ported,remaining:total-ported,powerRecords:sets.reduce((sum,s)=>sum+s.powers,0),trainerCards:sets.reduce((sum,s)=>sum+s.trainers,0),sets,unported:remaining};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(__dirname,'CLASSIC_COVERAGE.json'),JSON.stringify(audit,null,2)+'\n');
console.log('Classic card catalog: '+audit.cards+' records across four sets');
console.log(`Headless attacks executable: ${ported}/${total} (${(100*ported/total).toFixed(1)}%). Remaining: ${total-ported}`);
console.table(sets);
console.log(`Pokémon Power records: ${audit.powerRecords}; Trainer cards: ${audit.trainerCards}. NOT certified headless.`);
if(process.argv.includes('--json'))console.log(JSON.stringify(audit));
module.exports=audit;
