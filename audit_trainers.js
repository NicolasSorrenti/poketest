'use strict';
// Reports dispatch coverage separately from comprehensive historical correctness.
const fs=require('node:fs'),vm=require('node:vm');
const folder=__dirname+'/cards';
const all=fs.readdirSync(folder).filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(folder+'/'+f)));
const trainerCards=all.filter(c=>c.supertype==='Trainer');
const engineSource=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const tester={Math,console,window:{},document:{getElementById(){return {classList:{add(){},remove(){}}}},querySelector(){return null}},setTimeout(){},clearTimeout(){}};
vm.createContext(tester);
vm.runInContext(engineSource.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),tester);
vm.runInContext(fs.readFileSync(__dirname+'/trainer_rules_v058.js','utf8'),tester);
vm.runInContext(fs.readFileSync(__dirname+'/trainer_rules_v059.js','utf8'),tester);
vm.runInContext(fs.readFileSync(__dirname+'/trainer_rules_v060.js','utf8'),tester);
vm.runInContext(fs.readFileSync(__dirname+'/trainer_rules_v061.js','utf8'),tester);
const registered=new Set([...vm.runInContext('[...TRAINER58]',tester),...vm.runInContext('[...TRAINER59]',tester)]);
const stadiumNames=new Set(trainerCards.filter(c=>(c.subtypes||[]).includes('Stadium')||/This card stays in play/i.test((c.rules||[]).join(' '))).map(c=>c.name));
const legacy=new Set(['Potion','Switch','Gust of Wind','Defender','PlusPower','Focus Band','Berry','Gold Berry']);
const implementedStadiums=new Set([
 'Pokémon Tower','No Removal Gym',"The Rocket's Training Gym",'Celadon City Gym','Cerulean City Gym','Pewter City Gym',
 'Vermilion City Gym','Narrow Gym','Resistance Gym','Cinnabar City Gym','Fuchsia City Gym',"Rocket's Minefield Gym",
 'Viridian City Gym','Sprout Tower',"Rocket's Hideout",'Broken Ground Gym',
 'Lucky Stadium','Energy Stadium','Healing Field','Radio Tower','Saffron City Gym',
 'Ecogym'
]);
const partial=new Set([
 'Sabrina\'s ESP','Brock\'s Protection','EXP.ALL','Charity','Koga\'s Ninja Trick',
 "Lt. Surge's Secret Plan","Sabrina's Psychic Control",'Chaos Gym'
]);
// Direct v0.6.0 gameplay tests now exercise these Stadium effects, including
// their primary timing, owner, and resource conditions. This is still a handler
// rating, NOT a guarantee of every cross-card interaction.
const testedStadiums=new Set([
 'Lucky Stadium','Healing Field','Energy Stadium','Radio Tower','Pokémon Tower',"Rocket's Hideout",
 'Sprout Tower','Resistance Gym',"Rocket's Minefield Gym",'Cerulean City Gym',
 'Broken Ground Gym',"The Rocket's Training Gym",'Pewter City Gym',
 'Cinnabar City Gym','Celadon City Gym','Saffron City Gym','Viridian City Gym',
 'Narrow Gym','No Removal Gym','Fuchsia City Gym','Vermilion City Gym','Ecogym'
]);
const cardStatuses=trainerCards.map(card=>{
 const name=card.name;
 let status='unimplemented';
 if(registered.has(name)||legacy.has(name))status=partial.has(name)?'partial':'handler';
 else if(stadiumNames.has(name))status='stadium-placement-only';
 if(stadiumNames.has(name))status=testedStadiums.has(name)?'handler':implementedStadiums.has(name)||name==='Chaos Gym'?'partial':'stadium-placement-only';
 return {id:card.id,name,status};
});
const counts={};for(const c of cardStatuses)counts[c.status]=(counts[c.status]||0)+1;
const summary={totalCards:trainerCards.length,uniqueNames:new Set(trainerCards.map(c=>c.name)).size,counts,legend:{handler:'An effect handler exists, but not exhaustively verified',partial:'Handler or major functionality exists but known timing/choices are incomplete','stadium-placement-only':'Stadium enters play, but its effect is not implemented',unimplemented:'No working effect handler'}};
const report={summary,records:cardStatuses};fs.writeFileSync(__dirname+'/trainer_coverage.json',JSON.stringify(report,null,2));
const groups=new Map();for(const c of cardStatuses){if(!groups.has(c.status))groups.set(c.status,new Set());groups.get(c.status).add(c.name)}
const lines=['# Neo Campus TCG — Historical Trainer Audit','',`Generated: ${new Date().toISOString()}`,'',`**${summary.totalCards} records / ${summary.uniqueNames} distinct names**`,'',...Object.entries(counts).map(([k,v])=>`- **${k}:** ${v} card records`),'','**This is implementation dispatch coverage, not evidence of complete card-by-card rules accuracy.**',''];
for(const [status,names] of groups){lines.push(`## ${status}`, '',...Array.from(names).sort().map(n=>'- '+n),'')}
fs.writeFileSync(__dirname+'/TRAINER_COVERAGE.md',lines.join('\n'));
console.log(summary);console.log('Pending:',cardStatuses.filter(c=>['unimplemented','stadium-placement-only'].includes(c.status)).map(x=>x.name).filter((x,i,a)=>a.indexOf(x)===i).join(', '));
