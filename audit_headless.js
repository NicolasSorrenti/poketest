'use strict';
const {CATALOG}=require('./headless_duel');
const {compile}=require('./attack_effects_core');
const counts={flat:0,'coin-times':0,'coin-failure':0,'coin-bonus':0,status:0,'coin-status':0,recoil:0,'coin-recoil':0,'draw-one':0,'bench-own':0,'bench-target':0,'bench-both-recoil':0,'bench-splash-coin':0,'switch-defender':0,'switch-attacker':0,'switch-self':0,'energy-discard':0,unported:0};
const records=[];
for(const c of CATALOG.values())for(const [index,a] of (c.attacks||[]).entries()){
 const entry=compile(a),status=entry?entry.kind:'unported';counts[status]++;
 records.push({cardId:c.id,cardName:c.name,index,attack:a.name,status});
}
const total=records.length,ported=total-counts.unported;
if(process.argv.includes('--json'))process.stdout.write(JSON.stringify({total,ported,remaining:counts.unported,patterns:counts,records},null,2));
else {console.log(`Headless attack execution: ${ported}/${total} (${(100*ported/total).toFixed(1)}%)`);console.table(counts);console.log('Unported effects are rejected, never silently treated as plain damage.');}
