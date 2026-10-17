'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const box=()=>({classList:{add(){},remove(){}},textContent:'',style:{},append(){},querySelectorAll(){return[]},innerHTML:''});
const ctx={console,Math,document:{getElementById:box,querySelector:()=>null,createElement:box,querySelectorAll:()=>[]},setTimeout:()=>0,clearTimeout(){},window:{}};
vm.createContext(ctx);vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`lookup=new Map([
['a',{id:'a',name:'Attacker',hp:'100',supertype:'Pokémon',subtypes:['Basic'],types:['Water'],attacks:[]}],
['x',{id:'x',name:'First Bench',hp:'60',supertype:'Pokémon',subtypes:['Basic'],types:['Grass']}],
['y',{id:'y',name:'Second Bench',hp:'60',supertype:'Pokémon',subtypes:['Basic'],types:['Grass']}],
['z',{id:'z',name:'Found Pokémon',hp:'80',supertype:'Pokémon',subtypes:['Basic'],types:['Grass']}],
['t',{id:'t',name:'Trainer',supertype:'Trainer'}]]);
engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.players[0].active=unit('a');engine.players[1].active=unit('x');engine.players[1].bench=[unit('x'),unit('y')];engine.phase='game';engine.turn=0;engine.players[0].prizes=['t','t','t'];engine.players[1].prizes=['t','t','t'];engine.end=()=>{};render=()=>{};`);
const snipe="Choose 1 of your opponent's Benched Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)";
run(`lookup.get('a').attacks=[${JSON.stringify({name:'Snipe',cost:[],damage:'',text:snipe})}];`);
assert.equal(run('engine.attackPattern(lookup.get("a").attacks[0])'),'benchSnipe');
assert.equal(run('engine.attack(0,99)'),false);
assert.equal(run('engine.players[1].bench[1].damage'),0);
assert.equal(run('engine.attack(0,1)'),true);
assert.equal(run('engine.players[1].bench[1].damage'),20);
assert.equal(run('engine.players[1].bench[0].damage'),0);
const spread="This attack does 10 damage to each of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)";
run(`lookup.get('a').attacks=[${JSON.stringify({name:'Spread',cost:[],damage:'',text:spread})}];`);
assert.equal(run('engine.attack(0)'),true);
assert.equal(run('engine.players[1].bench[0].damage'),10);
assert.equal(run('engine.players[1].bench[1].damage'),30);
const search='Search your deck for a Basic Pokémon card, show it to your opponent, and put it into your hand. Then shuffle your deck.';
run(`lookup.get('a').attacks=[${JSON.stringify({name:'Search',cost:[],damage:'',text:search})}];engine.players[0].deck=['t','z','x'];`);
assert.equal(run('engine.attack(0)'),false);
assert.equal(run('deckSearchRequest.options.length'),2);
assert.equal(run('engine.attack(0,null,false,0)'),false);
assert.equal(run('engine.players[0].hand.length'),0);
assert.equal(run('engine.attack(0,null,false,1)'),true);
assert.equal(run('engine.players[0].hand.includes("z")'),true);
assert.equal(run('engine.players[0].deck.length'),2);
assert.equal(run(`engine.legalAttack({text:'Search your deck for any Pokémon and put it into your hand.'})`),false);
console.log('PASS: choose Bench target, Bench spread, deck-search player choice, reject invalid selections');
