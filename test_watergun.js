'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const box=()=>({classList:{add(){},remove(){}},textContent:'',style:{}});
const context={console,Math,document:{getElementById:box,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){},prompt:()=> '1'};
vm.createContext(context);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),context);
vm.runInContext(`lookup=new Map([
 ['base3-25',{id:'base3-25',name:'Lapras',hp:'80',types:['Water'],attacks:[{name:'Water Gun',cost:['Water'],damage:'10+',text:"Does 10 damage plus 10 more damage for each Water Energy attached to Lapras but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way."}]}],
 ['base1-102',{id:'base1-102',name:'Water Energy',supertype:'Energy'}],
 ['test-foe',{id:'test-foe',name:'Rival',hp:'150',types:['Grass'],attacks:[]}]]);
engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.players[0].active=unit('base3-25');engine.players[1].active=unit('test-foe');engine.players[0].prizes=['base1-102'];engine.players[1].prizes=['base1-102'];engine.phase='game';engine.started=true;engine.turn=0;engine.end=()=>{};render=()=>{};
`,context);
for(const [count,expected] of [[1,10],[2,20],[3,30],[4,30]]){
 vm.runInContext(`engine.players[0].active.energies=Array(${count}).fill('base1-102');engine.players[1].active.damage=0`,context);
 assert.equal(vm.runInContext(`engine.afford(engine.players[0].active,lookup.get('base3-25').attacks[0].cost)`,context),true);
 assert.equal(vm.runInContext(`engine.legalAttack(lookup.get('base3-25').attacks[0])`,context),true);
 assert.equal(vm.runInContext('engine.attack(0)',context),true);
 assert.equal(vm.runInContext('engine.players[1].active.damage',context),expected);
}
console.log('PASS: Fossil Lapras Water Gun enabled with 1 Water Energy; 10/20/30/30 damage');
