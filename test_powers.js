'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const dom=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[],getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})});
const sandbox={Math,console,document:{getElementById:()=>dom(),querySelector:()=>null},window:{},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(sandbox);vm.runInContext(src,sandbox);
const run=q=>vm.runInContext(q,sandbox);
run(`render=()=>{};lookup=new Map([
 ['blastoise',{id:'blastoise',name:'Blastoise',hp:'100',types:['Water'],abilities:[{name:'Rain Dance'}],attacks:[{name:'Hydro Pump',cost:['Water','Water','Water'],damage:'40+',text:'Does 40 damage plus 10 more damage for each Water Energy attached to Blastoise but not used to pay for this attack’s Energy cost. Extra Water Energy after the 2nd doesn’t count.'}]}],
 ['venusaur',{id:'venusaur',name:'Venusaur',hp:'100',types:['Grass'],abilities:[{name:'Energy Trans'}]}],
 ['charizard',{id:'charizard',name:'Charizard',hp:'120',types:['Fire'],abilities:[{name:'Energy Burn'}],attacks:[{name:'Fire Spin',cost:['Fire','Fire','Fire','Fire'],damage:'100',text:'Discard 2 Energy cards attached to Charizard in order to use this attack.'}]}],
 ['squirtle',{id:'squirtle',name:'Squirtle',hp:'40',types:['Water']}],['bulbasaur',{id:'bulbasaur',name:'Bulbasaur',hp:'40',types:['Grass']}],
 ['water',{id:'water',name:'Water Energy',supertype:'Energy'}],['grass',{id:'grass',name:'Grass Energy',supertype:'Energy'}]
]);engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.turn=0;engine.phase='game';engine.started=true;engine.round=4;engine.players[0].active=unit('blastoise');engine.players[0].bench=[unit('squirtle'),unit('venusaur'),unit('bulbasaur')];engine.players[0].hand=['water','water'];engine.players[1].active=unit('blastoise');engine.players[0].prizes=['grass','grass'];engine.players[1].prizes=['grass','grass'];`);
assert.equal(run('engine.rainDance(0,0)'),true);
assert.equal(run('engine.rainDance(0,0)'),true,'Rain Dance repeatable in same turn');
assert.equal(run('engine.players[0].energyUsed'),false,'Rain Dance should not consume regular Energy attachment');
assert.equal(run('engine.rainDance(0,2)'),false,'cannot Rain Dance onto Grass Pokémon');
run(`engine.players[0].bench[2].energies=['grass'];`);
assert.equal(run('engine.energyTrans(2,0)'),true);
assert.equal(run('engine.players[0].bench[0].energies.includes("grass")'),true);
assert.equal(run('engine.energyTrans(0,0)'),false);
run(`engine.players[0].bench[1].status='Paralyzed'`);
assert.equal(run('engine.energyTrans(0,2)'),false,'Paralyzed Venusaur cannot provide Energy Trans');
run(`engine.players[0].bench[1].status=null;engine.players[0].active=unit('charizard');engine.players[0].active.energies=['water','water','water','water'];`);
assert.equal(run('engine.afford(engine.me.active,engine.card(engine.me.active).attacks[0].cost)'),false);
assert.equal(run('engine.energyBurn()'),true);
assert.equal(run('engine.afford(engine.me.active,engine.card(engine.me.active).attacks[0].cost)'),true);
run('engine.me.active=unit("blastoise");engine.me.active.energies=["water","water","water","water"]');
assert.equal(run('engine.legalAttack(engine.card(engine.me.active).attacks[0])'),true);
assert.equal(run('engine.attack(0,null,true)'),true);
assert.equal(run('engine.foe.active.damage'),50,'Hydro Pump 4 Water costs 3 + 1 bonus = 50');
console.log('PASS: Rain Dance, Energy Trans, Energy Burn, Hydro Pump');
