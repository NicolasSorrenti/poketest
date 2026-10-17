'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};vm.createContext(ctx);vm.runInContext(src,ctx);const R=s=>vm.runInContext(s,ctx);
const data=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(s=>require('./cards/'+s+'.json'));
const fixtures=[...data,...['Fire','Water','Grass','Lightning','Psychic','Fighting','Metal'].map(t=>({id:'test-'+t,name:t+' Energy',supertype:'Energy',subtypes:['Basic']})),{id:'test-special',name:'Rainbow Energy',supertype:'Energy',subtypes:['Special']},{id:'target48',name:'Dummy Target',supertype:'Pokémon',hp:'500',types:['Colorless'],subtypes:['Basic'],attacks:[{name:'Tackle',cost:['Colorless'],damage:'20',text:''}],abilities:[]}];
ctx.fixtures=fixtures;R('cards=fixtures;lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};battlefieldAttack=()=>{}');
const cov=require('./attack_coverage.json');assert(cov.handled>=1389);assert(cov.unsupported.length<=90);
assert.equal(Object.keys(R('ATTACK48')).length,11);
function prep(id,name,{heads=true,setup='',turn=0}={}){
 const c=data.find(c=>c.id===id),idx=c.attacks.findIndex(a=>a.name===name);assert(idx>=0);
 const cost=c.attacks[idx].cost.map(x=>'test-'+(x==='Colorless'?'Fire':x));
 R(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.turn=${turn};engine.round=6;engine.turnSerial=0;engine.over=false;engine.players[${turn}].active=unit(${JSON.stringify(id)});engine.players[${1-turn}].active=unit('target48');engine.players[${turn}].active.energies=${JSON.stringify([...cost,...cost,'test-Lightning','test-Fire'])};engine.players[${turn}].bench=[unit('target48'),unit('target48')];engine.players[${1-turn}].bench=[unit('target48'),unit('target48')];engine.players[${turn}].hand=['test-Fire','test-Water','test-Grass'];engine.players[${1-turn}].hand=[];engine.players[${turn}].deck=['test-Water','test-Fire','test-Grass','base1-71'];engine.players[${1-turn}].deck=['test-Water','test-Fire','test-Grass','base1-71'];engine.players[0].prizes=Array(6).fill('target48');engine.players[1].prizes=Array(6).fill('target48');deckSearchRequest=null;${setup}`);
 ctx.Math.random=()=>heads?0.01:0.99;
 return {go:(choice=null)=>R(`engine.attack(${idx},null,true,${JSON.stringify(choice)})`),idx};
}
for(const [id,name] of Object.keys(R('ATTACK48')).map(k=>k.split('|'))){const c=data.find(x=>x.id===id),a=c.attacks.find(x=>x.name===name);assert.equal(R(`engine.attackPattern(${JSON.stringify(a)})`),'batch48',id+' '+name)}
let x=prep('base3-8','Prophecy');assert.equal(x.go(),false);assert(R('deckSearchRequest.options.length>=12'));assert(x.go(1));assert.equal(R('engine.me.deck.slice(-3).reverse().join(",")'),'base1-71,test-Fire,test-Grass');
x=prep('base3-23','Prophecy');assert(x.go(6));assert.equal(R('engine.foe.deck.slice(-3).reverse().join(",")'),'base1-71,test-Grass,test-Fire');
x=prep('neo1-52','Prophecy');const old=R('JSON.stringify(engine.players)');assert.equal(x.go(99),false);assert.equal(R('JSON.stringify(engine.players)'),old);assert(x.go(0));
x=prep('gym2-39','Errand-Running');assert.equal(x.go(),false);const opts=R('deckSearchRequest.options');assert(opts.length);let chosen=opts[0].index,card=R('engine.me.deck['+chosen+']');assert(x.go(chosen));assert.equal(R('engine.me.hand.includes('+JSON.stringify(card)+')'),true);
x=prep('gym2-39','Errand-Running',{heads:false});assert(x.go(3));assert.equal(R('engine.me.hand.length'),3,'tails gives no Trainer');
x=prep('neo4-106','Miracle Leaf',{heads:true,setup:"engine.foe.active.energies=['test-Fire','test-Water']"});assert.equal(x.go(),false);assert.equal(R('deckSearchRequest.options.length'),3);assert(x.go(2));assert.equal(R('engine.foe.active.poison'),true);
x=prep('neo4-106','Miracle Leaf',{heads:false,setup:"engine.foe.active.energies=['test-Fire','test-Water']"});assert(x.go(0));assert.equal(R('engine.foe.active.status'),null);
x=prep('neo3-54','Psykiss',{setup:"engine.foe.active.energies=['test-special','test-Fire'];engine.foe.bench[1].energies=['test-special']"});assert.equal(x.go(),false);assert.equal(R('deckSearchRequest.options.length'),2);assert(x.go(200));assert.equal(R('engine.foe.bench[1].energies.length'),0)
x=prep('neo4-9','Threaten',{setup:"engine.foe.hand=['base1-70','base1-71','test-Fire']"});assert.equal(x.go(),false);assert(x.go(1));assert.equal(R('engine.foe.hand.includes("base1-71")'),false);assert.equal(R('engine.foe.deck.includes("base1-71")'),true);
x=prep('neo4-72','Reflected Sunlight');assert.equal(x.go(),false);assert.equal(R('deckSearchRequest.options.length'),3);assert.equal(x.go({slot:0,energyIndices:[0,0]}),false);assert(x.go({slot:1,energyIndices:[0,2]}));assert.equal(R('engine.me.bench[1].energies.length'),2);assert.equal(R('engine.me.hand.length'),1);
x=prep('neo3-33','Lava Flow');assert.equal(x.go(),false);assert.equal(R('deckSearchRequest.multi'),true);assert.equal(x.go([0,0]),false);assert(x.go([0,1]));assert.equal(R('engine.foe.active.damage'),80);assert.equal(R('engine.me.discard.length'),2);
x=prep('neo4-18','Ball of Flame');assert.equal(x.go(),false);assert(x.go(-1));assert.equal(R('engine.foe.active.damage'),20);assert.equal(R('engine.foe.bench[0].damage'),0);
x=prep('neo4-18','Ball of Flame');assert(x.go(0));assert.equal(R('engine.foe.active.damage'),20);assert.equal(R('engine.foe.bench[0].damage'),20);
x=prep('neo4-107','White-Hot Flame',{heads:false});assert.equal(x.go(),false);const opts2=R('deckSearchRequest.options');assert(opts2.length);assert(x.go(opts2[0].index));assert.equal(R('engine.foe.active.damage'),100);assert.equal(R('engine.me.active.damage'),30);assert.equal(R('engine.me.discard.length'),2);
x=prep('neo4-107','White-Hot Flame',{heads:true});const opts3=R('batch48Choices(engine,batch48Rule(engine.card(engine.me.active),engine.card(engine.me.active).attacks[0]))');assert(x.go(opts3[0].index));assert.equal(R('engine.me.active.damage'),0);
console.log('PASS v0.4.8: eleven exact attack records; deck ordering, status, Trainer search, Energy discards, targeted Energy moves, variable damage, Bench damage and recoil.');
