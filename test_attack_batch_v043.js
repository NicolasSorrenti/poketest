'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const path0=__dirname, source=fs.readFileSync(path.join(path0,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const element=()=>({classList:{add(){},remove(){}},style:{},textContent:'',querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:element,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
ctx.Math.random=()=>0.001; vm.createContext(ctx);vm.runInContext(source,ctx);const run=s=>vm.runInContext(s,ctx);
const sets=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'];
const cards=sets.flatMap(x=>JSON.parse(fs.readFileSync(path.join(path0,'cards',x+'.json'))));
const fake=[{id:'e43-f',name:'Fire Energy',supertype:'Energy'},{id:'e43-w',name:'Water Energy',supertype:'Energy'},{id:'e43-g',name:'Grass Energy',supertype:'Energy'},{id:'e43-l',name:'Lightning Energy',supertype:'Energy'},{id:'e43-p',name:'Psychic Energy',supertype:'Energy'},{id:'e43-fi',name:'Fighting Energy',supertype:'Energy'},{id:'e43-m',name:'Metal Energy',supertype:'Energy'},{id:'e43-d',name:'Darkness Energy',supertype:'Energy'},{id:'e43-c',name:'Colorless Energy',supertype:'Energy'},{id:'e43-def',name:'Dummy defender',hp:'1000',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],attacks:[]},{id:'e43-bench',name:'Dummy bench',hp:'1000',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],attacks:[]}];
ctx.fixtures=[...cards,...fake];run('lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};');
const targets=JSON.parse(fs.readFileSync(path.join(path0,'batch43_targets.json')));
const energyTypeMap={Fire:'e43-f',Water:'e43-w',Grass:'e43-g',Lightning:'e43-l',Psychic:'e43-p',Fighting:'e43-fi',Metal:'e43-m',Darkness:'e43-d',Colorless:'e43-c'};
let failures=[];
for(const r of targets){const card=cards.find(c=>c.id===r.id),idx=card.attacks.findIndex(a=>a.name===r.attack&&a.text===r.text),atk=card.attacks[idx]; assert(idx>=0,`Missing attack ${r.id}:${r.attack}`); assert.equal(run(`engine.attackPattern(${JSON.stringify(atk)})`),'batch43',`${r.id} ${r.attack} must be recognized`);
const energyIds=[...(atk.cost||[]).map(x=>energyTypeMap[x]||'e43-c'),'e43-w','e43-f','e43-g','e43-l','e43-p','e43-fi','e43-l'];
run(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.turn=0;engine.round=3;engine.over=false;engine.players[0].active=unit(${JSON.stringify(r.id)});engine.players[1].active=unit('e43-def');engine.players[0].bench=[unit('e43-bench'),unit('e43-bench')];engine.players[1].bench=[unit('e43-bench'),unit('e43-bench')];engine.players[0].active.damage=10;engine.players[1].active.damage=10;engine.players[0].active.energies=${JSON.stringify(energyIds)};engine.players[1].active.energies=['e43-w','e43-f','e43-l'];engine.players[0].hand=['e43-g','e43-f','e43-w'];engine.players[0].discard=['e43-f','e43-w','e43-l'];engine.players[1].discard=['e43-l'];engine.players[0].deck=Array(18).fill('e43-f');engine.players[1].deck=Array(18).fill('e43-l');engine.players[0].prizes=Array(6).fill('e43-bench');engine.players[1].prizes=Array(6).fill('e43-bench');`);
if(r.index===79)run(`engine.players[0].active.lastAttackName='Lie Low';engine.players[0].active.lastAttackRound=2`); if(r.index===125)run(`engine.players[0].active.damage=20`);
const before=run('JSON.stringify(engine.players)');
try {let ok=run(`engine.attack(${idx},null,true)`);if(!ok)throw Error('attack() rejected a valid prepared attack'); let after=run('JSON.stringify(engine.players)');if(after===before)throw Error('attack() produced no measurable game state effect');}
catch(err){failures.push(`${r.id} ${r.attack}: ${err.stack||err.message}`)}
}
if(failures.length){console.error(failures.join('\n\n'));process.exit(1)}
console.log(`PASS: ${targets.length} newly enabled historical attack records each executed and changed duel state`);
