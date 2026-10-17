'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const dom=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})});
const sandbox={Math,console,document:{getElementById:()=>dom(),querySelector:()=>null},window:{},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(sandbox);vm.runInContext(src,sandbox);
const run=q=>vm.runInContext(q,sandbox);
run(`render=()=>{};lookup=new Map([
 ['al',{id:'al',name:'Alakazam',types:['Psychic'],hp:'80',abilities:[{name:'Damage Swap'}]}],
 ['ma',{id:'ma',name:'Machamp',types:['Fighting'],hp:'100',abilities:[{name:'Strikes Back'}]}],
 ['mime',{id:'mime',name:'Mr. Mime',types:['Psychic'],hp:'40',abilities:[{name:'Invisible Wall'}]}],
 ['muk',{id:'muk',name:'Muk',types:['Grass'],hp:'70',abilities:[{name:'Toxic Gas'}]}],
 ['aero',{id:'aero',name:'Aerodactyl',types:['Fighting'],hp:'60',abilities:[{name:'Prehistoric Power'}]}],
 ['vile',{id:'vile',name:'Dark Vileplume',types:['Grass'],hp:'60',abilities:[{name:'Hay Fever'}]}],
 ['bro',{id:'bro',name:'Slowbro',types:['Psychic'],hp:'60',abilities:[{name:'Strange Behavior'}]}],
 ['gan',{id:'gan',name:'Gengar',types:['Psychic'],hp:'80',abilities:[{name:'Curse'}]}],
 ['squ',{id:'squ',name:'Squirtle',types:['Water'],hp:'40',attacks:[{name:'Hit',cost:[],damage:'40',text:''}]}],
 ['pik',{id:'pik',name:'Pikachu',types:['Lightning'],hp:'40'}],
 ['rai',{id:'rai',name:'Raichu',evolvesFrom:'Pikachu',types:['Lightning'],hp:'70'}],
 ['bill',{id:'bill',name:'Bill',supertype:'Trainer'}]
]);engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.round=4;engine.turn=0;engine.started=true;
engine.players[0].active=unit('al');engine.players[0].bench=[unit('pik'),unit('squ')];engine.players[1].active=unit('squ');engine.players[1].bench=[unit('pik')];engine.players[0].prizes=['bill','bill'];engine.players[1].prizes=['bill','bill'];`);
run('engine.me.bench[1].damage=20');
assert.equal(run('engine.damageSwap(1,0)'),true);
assert.equal(run('engine.me.bench[1].damage'),10);
assert.equal(run('engine.me.bench[0].damage'),10);
assert.equal(run('engine.damageSwap(1,1)'),false);
run("engine.foe.bench.push(unit('muk'))");
assert.equal(run("engine.powerAvailable('Damage Swap')"),false,'opposing Muk disables Damage Swap');
run("engine.foe.bench[1].status='Asleep'");
assert.equal(run("engine.powerAvailable('Damage Swap')"),true,'sleeping Muk cannot suppress Powers');
run("engine.foe.bench.pop();engine.me.bench.push(unit('aero'));engine.me.hand=['rai']");
assert.equal(run('engine.evolve(0,0)'),false,'Aerodactyl stops evolution');
run("engine.me.bench.pop();engine.me.bench.push(unit('vile'));engine.me.hand=['bill']");
assert.equal(run('engine.trainer(0)'),false,'Hay Fever blocks Trainers');
run("engine.me.bench.pop();engine.me.active=unit('squ');engine.foe.active=unit('mime')");
assert.equal(run('engine.attack(0,null,true)'),true);
assert.equal(run('engine.foe.active.damage'),0,'Invisible Wall prevents 40 damage');
run("engine.foe.active=unit('ma');engine.me.active=unit('squ')");
assert.equal(run('engine.attack(0,null,true)'),true);
assert.equal(run('engine.me.active.damage'),10,'Strikes Back damages attacker');
run("engine.me.active=unit('gan');engine.foe.active=unit('squ');engine.foe.active.damage=20;engine.foe.bench=[unit('pik')]");
assert.equal(run('engine.curse(-1,0)'),true);
assert.equal(run('engine.curse(-1,0)'),false,'Curse once per turn');
run("engine.me.active=unit('bro');engine.me.bench=[unit('pik')];engine.me.bench[0].damage=20");
assert.equal(run('engine.strangeBehavior(0,-1)'),true);
console.log('PASS: damage swap, Toxic Gas suppression, Prehistoric Power, Hay Fever, Invisible Wall, Strikes Back, Curse, Strange Behavior');
