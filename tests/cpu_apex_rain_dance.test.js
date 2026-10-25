'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');

const W='base1-102',BLASTOISE='base1-2',LAPRAS='base3-25',HITMONCHAN='base1-7';
const unit=(id,energies=[])=>({id,damage:0,energies,status:null,playedTurn:2});
function board(){
 return {phase:'game',turn:1,round:6,turnSerial:9,over:false,stadium:null,
  self:{active:unit(BLASTOISE,[W,W]),bench:[unit(LAPRAS)],hand:[W,W],
   energyUsed:true,retreated:false,prizeCount:3,discard:[],deckCount:24},
  opponent:{active:unit(HITMONCHAN,[W]),bench:[],prizeCount:3,discard:[],deckCount:23},
  decision:null};
}
function options(o,level,used={trainers:0,powers:0,powerKeys:new Set(),stadium:false}){
 return AI.candidates(o,AI.configuration({side:1,level,personality:'setup'}),used);
}
test('Apex prices a playable Rain Dance above ending the turn without a ready attack',()=>{
 const o=board(),cfg=AI.configuration({level:8,side:1,personality:'setup'});
 const power={type:'use_power',payload:{slot:-1,powerIndex:0}};
 const now=AI.score(power,o,cfg,{powers:0});
 assert.ok(now>170,'Rain Dance should develop the active Blastoise');
 const old=AI.score(power,o,AI.configuration({level:7,side:1,personality:'setup'}),{powers:0});
 assert.ok(now>old+70,'new tactical evaluation is Level 8 only');
});
test('Apex directs Rain Dance Energy to own Water attacker that gains a legal attack',()=>{
 const o=board();
 const d={id:'decision-1',actor:1,kind:'target',label:'Choose Water Pokémon to attach Energy',
  options:[{id:'slot:-1',label:'Active Blastoise'},{id:'slot:0',label:'Bench Lapras'}],
  min:1,max:1};
 o.decision=d;
 const cfg=AI.configuration({level:8,side:1,personality:'setup'});
 const select=id=>AI.score({type:'choose',payload:{decisionId:d.id,selected:[id]}},o,cfg,{});
 assert.ok(select('slot:-1')>select('slot:0'),
  'give the next Water Energy to Blastoise to unlock Hydro Pump');
});
test('Apex can use Rain Dance twice in one turn; Mastermind remains unchanged',()=>{
 const o=board(),memo={trainers:0,powers:1,powerKeys:new Set(['-1:0']),stadium:false};
 const rain=a=>a.type==='use_power'&&a.payload.slot===-1&&a.payload.powerIndex===0;
 assert.ok(options(o,8,memo).some(rain),
  'a second free Water attachment is legal while Water Energy remains in hand');
 assert.ok(!options(o,7,memo).some(rain),
  'Level 7 stays the untouched comparison policy');
 o.self.hand=[];
 assert.ok(!options(o,8,memo).some(rain),
  'do not request a repeated Power with no Water Energy in hand');
});
test('Apex respects eight-Power per-turn budget as a loop guard',()=>{
 const o=board(),memo={trainers:0,powers:8,powerKeys:new Set(),stadium:false};
 assert.ok(!options(o,8,memo).some(a=>a.type==='use_power'));
});

test('Apex does not attempt Rain Dance through blocking special conditions',()=>{
 const o=board(),rain=a=>a.type==='use_power'&&a.payload.slot===-1;
 for(const status of ['Asleep','Confused','Paralyzed']){
  o.self.active.status=status;
  assert.ok(!options(o,8).some(rain),
   'cannot activate Rain Dance while '+status);
 }
 o.self.active.status=null;
 assert.ok(options(o,8).some(rain));
});
