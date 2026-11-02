'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const {CATALOG}=require('../headless_duel');
const cfg=AI.configuration({level:8,side:1});
const labels=['Water Energy','Squirtle','Fire Energy','Miracle Energy'];
const options=labels.map((label,i)=>({id:'deck:'+i,label}));
function observation(energyUsed=false){
 return {phase:'game',turn:1,round:4,turnSerial:10,
  self:{active:{id:'base1-2',energies:[],damage:0},bench:[],
   hand:[],energyUsed,deckCount:30},
  opponent:{active:{id:'base1-63',energies:[],damage:0},bench:[]},
  decision:{kind:'select',label:'Search your deck for any card',
   options,min:1,max:1}};
}
function value(o,index){
 return AI.score({type:'choose',payload:{selected:['deck:'+index]}},o,cfg,{});
}
test('Computer Search develops a multi-Energy attacker instead of an unrelated Basic',()=>{
 assert.ok([...CATALOG.values()].some(c=>c.name==='Water Energy'));
 const o=observation();
 assert.ok(value(o,0)>value(o,1),'Water setup must outrank Squirtle');
 assert.ok(value(o,2)<value(o,1),'off-type Energy must not get the setup bonus');
});
test('Computer Search never rewards Miracle Energy on an ineligible Pokémon',()=>{
 assert.ok([...CATALOG.values()].some(c=>c.name==='Miracle Energy'));
 const o=observation();
 assert.ok(value(o,3)<value(o,1));
});
test('Computer Search recognizes future-turn Energy setup after attachment was used',()=>{
 const o=observation(true);
 assert.ok(value(o,0)>value(o,1));
});

test('Computer Search does not choose Rainbow to knock out its own Active',()=>{
 const hp=Number(CATALOG.get('base1-2')?.hp);
 assert.ok(hp>10);
 const o=observation();
 o.self.active.damage=hp-10;
 o.decision.options=[
  {id:'deck:0',label:'Rainbow Energy'},
  {id:'deck:1',label:'Water Energy'},
  {id:'deck:2',label:'Squirtle'}
 ];
 const rainbow=value(o,0),water=value(o,1),basic=value(o,2);
 assert.ok(rainbow<basic,'lethal Rainbow must rank below a safe Basic search');
 assert.ok(water>rainbow,'safe Water must outrank lethal Rainbow');
});

test('Computer Search preserves nonlethal Rainbow and safe Bench setup',()=>{
 const hp=Number(CATALOG.get('base1-2')?.hp);
 const o=observation();
 o.decision.options=[
  {id:'deck:0',label:'Rainbow Energy'},
  {id:'deck:1',label:'Water Energy'},
  {id:'deck:2',label:'Squirtle'}
 ];
 o.self.active.damage=hp-11;
 assert.ok(value(o,0)>value(o,2),'Rainbow with 11 HP remaining still develops the Active');
 o.self.active.damage=hp-10;
 o.self.bench=[{id:'base1-52',energies:[],damage:0}];
 assert.ok(value(o,0)>value(o,2),'Rainbow remains useful for a safe Bench attacker');
 assert.ok(value(o,0)<value(o,1),'safe Bench setup must not masquerade as an immediate Active attack');
});
