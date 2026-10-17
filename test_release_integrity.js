'use strict';
// Release gate: the historical archive, dispatch reports and playable deck
// classifications must not silently drift between shipped builds.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=__dirname;
const setNames=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const all=setNames.flatMap(name=>JSON.parse(fs.readFileSync(path.join(root,'cards',name+'.json'),'utf8')));
assert.equal(new Set(all.map(c=>c.id)).size,all.length,'Duplicate historical card IDs');
assert.equal(all.length,1123,'Historical card archive drift');
assert.equal(all.filter(c=>c.supertype==='Pokémon').reduce((n,c)=>n+(c.attacks||[]).length,0),1479,'Attack record count drift');
assert.equal(all.filter(c=>c.supertype==='Pokémon').reduce((n,c)=>n+(c.abilities||[]).length,0),166,'Power record count drift');
const trainers=all.filter(c=>c.supertype==='Trainer');
assert.equal(trainers.length,178,'Trainer record count drift');
const trainerReport=JSON.parse(fs.readFileSync(root+'/trainer_coverage.json'));
assert.equal(trainerReport.summary.totalCards,178);
assert.equal(trainerReport.records.length,178);
assert.equal(trainerReport.records.filter(r=>r.status==='unimplemented'||r.status==='stadium-placement-only').length,0,'Trainer without an executable handler');
const attackReport=JSON.parse(fs.readFileSync(root+'/attack_coverage.json'));
const powerReport=JSON.parse(fs.readFileSync(root+'/power_coverage.json'));
assert.equal(attackReport.totalAttacks,1479,'Attack audit changed');
// Power report's recognized/unique structure varies by historical audit version.
const source=fs.readFileSync(root+'/engine.js','utf8');
const stub=()=>({classList:{add(){},remove(){}},style:{},appendChild(){}});
const context={console,Math,window:{},document:{getElementById:stub,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(context);
vm.runInContext(source.split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),context);
const energyNames=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
for(const type of energyNames){
 const card=all.find(c=>c.name===type+' Energy'&&!c.hp&&!(c.attacks||[]).length);
 assert.ok(card,`Missing ${type} Energy`);
 context.sample=card;
 const result=vm.runInContext('({energy:energy(sample),basic:basic(sample),normalized:normalizeLoadedCard(sample)})',context);
 assert.equal(result.energy,true,type+' should count as Energy');
 assert.equal(result.basic,false,type+' cannot be benched as a Pokémon');
 assert.equal(result.normalized.supertype,'Energy',type+' must normalize before catalog rendering');
}
for(const card of all.filter(c=>c.supertype==='Energy')){
 context.sample=card;
 assert.equal(vm.runInContext('energy(sample)',context),true,`Misclassified Energy ${card.id}`);
 assert.equal(vm.runInContext('basic(sample)',context),false,`Energy can be benched ${card.id}`);
}
const page=fs.readFileSync(root+'/index.html','utf8');
for(const version of [58,59,60,61,62,63,64])assert.ok(page.includes(`trainer_rules_v0${version}.js`),`Missing trainer rule bundle v0${version}`);
const pkg=JSON.parse(fs.readFileSync(root+'/package.json','utf8'));
assert.ok(pkg.scripts.test.includes('test_release_integrity.js'),'Release integrity test omitted from npm test');
console.log(`PASS release integrity: ${all.length} cards, 1479 attacks, 166 Powers, ${trainers.length} Trainers, 12 sets, all 6 basic Energy identities, 7 Trainer bundles`);
