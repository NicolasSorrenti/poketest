'use strict';
// Uses the identical browser engine classifier, without pretending that every expansion is already cached.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const folder=path.join(__dirname,'cards');
const files=fs.existsSync(folder)?fs.readdirSync(folder).filter(f=>f.endsWith('.json')):[];
const library=files.flatMap(f=>{try{const x=JSON.parse(fs.readFileSync(path.join(folder,f),'utf8'));return Array.isArray(x)?x:Array.isArray(x.data)?x.data:[]}catch{return []}});
const source=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},textContent:'',style:{}});
const ctx={console,Math,document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);ctx.data=library;
const results=vm.runInContext('cards=data;engine.attackAudit()',ctx);
const report={scannedCards:library.length,totalAttacks:results.length,handled:results.filter(a=>a.implemented).length,unsupported:results.filter(a=>!a.implemented),byPattern:Object.fromEntries([...new Set(results.map(a=>a.pattern||'unsupported'))].map(k=>[k,results.filter(a=>(a.pattern||'unsupported')===k).length]))};
fs.writeFileSync(path.join(__dirname,'attack_coverage.json'),JSON.stringify(report,null,2));
console.log(`Cards: ${library.length}; attacks: ${report.totalAttacks}; recognized: ${report.handled}; unsupported: ${report.unsupported.length}`);
if(!files.length)console.log('Card database not downloaded. Run npm run cards before auditing full expansion coverage.');
