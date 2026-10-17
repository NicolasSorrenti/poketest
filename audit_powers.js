'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,sets=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const {applyCardCorrections}=require('./card_corrections');
const library=applyCardCorrections(sets.flatMap(set=>{const file=path.join(root,'cards',set+'.json');return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]}));
const source=fs.readFileSync(path.join(root,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},textContent:'',style:{}}),ctx={console,Math,document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);ctx.data=library;
const rows=vm.runInContext('cards=data;engine.powerAudit()',ctx).map(r=>({set:r.card.split('-')[0],card:r.cardName,id:r.card,power:r.name,implemented:r.implemented,text:r.text}));
const implemented=new Set(rows.filter(r=>r.implemented).map(r=>r.power));
const byName=new Map();for(const r of rows){const key=r.power||'(missing database name)';const record=byName.get(key)||{name:key,cards:[],implemented:Boolean(r.power&&r.implemented)};record.cards.push(r.id);byName.set(key,record)}
const data={cachedSets:sets.filter(x=>fs.existsSync(path.join(root,'cards',x+'.json'))),powerCardCount:rows.length,uniquePowers:byName.size,implementedNames:[...implemented].sort(),powers:[...byName.values()].sort((a,b)=>a.name.localeCompare(b.name))};
const out=path.join(root,'power_coverage.json');fs.writeFileSync(out,JSON.stringify(data,null,2));
console.log(`Saved ${out}\n${data.cachedSets.length}/${sets.length} sets cached; ${rows.length} Power cards found; ${[...byName.values()].filter(x=>x.implemented).length}/${byName.size} unique Powers marked supported.`);
if(data.cachedSets.length<sets.length)console.log('Run npm run cards to download the full catalog before interpreting this coverage report.');
