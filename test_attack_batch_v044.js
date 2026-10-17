'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=__dirname,source=fs.readFileSync(root+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},textContent:'',querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};ctx.Math.random=()=>.01;
vm.createContext(ctx);vm.runInContext(source,ctx);const run=s=>vm.runInContext(s,ctx);
const cards=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(s=>JSON.parse(fs.readFileSync(path.join(root,'cards',s+'.json'))));
const extras=['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness','Colorless'].map(n=>({id:'test-'+n,name:n+' Energy',supertype:'Energy'}));
ctx.fixtures=[...cards,...extras,{id:'target-44',name:'Target Pokémon',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'999',attacks:[]},{id:'bench-44',name:'Bench Pokémon',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'999',attacks:[]}];
run('lookup=new Map(fixtures.map(x=>[x.id,x]));render=()=>{};engine.end=()=>{};');
const targets=JSON.parse(fs.readFileSync(root+'/batch44_targets.json'));const errors=[];
for(const t of targets){
 const c=cards.find(c=>c.id===t.card),idx=c?.attacks?.findIndex(a=>a.name===t.attack&&a.text===t.text),a=c?.attacks?.[idx];assert(idx>=0,`Missing ${t.card} ${t.attack}`);
 assert.equal(run(`engine.attackPattern(${JSON.stringify(a)})`),'batch44');
 const energyPool=[...(a.cost||[]).map(x=>'test-'+(x==='Colorless'?'Fire':x)),'test-Fire','test-Water','test-Lightning','test-Grass','test-Psychic','test-Fighting','test-Fire','test-Fire'];
 run(`engine.players=[statePlayer('Player',[]),statePlayer('Opponent',[])];engine.phase='game';engine.turn=0;engine.round=3;engine.over=false;engine.powerSilenceUntil=0;
 engine.players[0].active=unit(${JSON.stringify(c.id)});engine.players[1].active=unit('target-44');engine.players[0].bench=[unit('bench-44'),unit('bench-44')];engine.players[1].bench=[unit('bench-44'),unit('bench-44')];
 engine.players[0].active.damage=40;engine.players[1].active.damage=10;
 engine.players[0].active.energies=${JSON.stringify(energyPool)};engine.players[1].active.energies=['test-Fire','test-Water'];
 engine.players[0].hand=['test-Fire','test-Grass','test-Fire'];engine.players[0].discard=['test-Fire','test-Water'];engine.players[1].discard=['test-Water'];
 engine.players[0].deck=Array(12).fill('test-Fire');engine.players[1].deck=Array(12).fill('test-Grass');
 engine.players[0].prizes=Array(6).fill('bench-44');engine.players[1].prizes=Array(6).fill('bench-44');`);
 const before=run('JSON.stringify(engine.players)');
 try{const outcome=run(`engine.attack(${idx},null,true)`);if(!outcome)throw Error('attack() returned false');
 if(before===run('JSON.stringify(engine.players)')&&!['Dark Wave','Sputter'].includes(a.name))throw Error('no measurable change to player states');}
 catch(err){errors.push(`${t.card} ${t.attack}: ${err.message}\n${err.stack}`)}
}
if(errors.length){console.error(errors.join('\n---\n'));process.exit(1)}
console.log(`PASS: ${targets.length} newly scripted attacks executed in legal duel states`);
