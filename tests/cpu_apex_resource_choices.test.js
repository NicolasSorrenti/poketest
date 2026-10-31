'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const W='base1-102',PLUS='base1-84',SEARCH='base1-71';
const unit=(id,energies=[])=>({id,energies,damage:0,status:null});
const o=()=>({phase:'game',turn:1,round:3,turnSerial:6,over:false,
 self:{active:unit('base1-2'),bench:[],hand:[PLUS,SEARCH],energyUsed:false,deckCount:30,discard:[]},
 opponent:{active:unit('base1-15'),bench:[],discard:[]},decision:null});
const cfg=AI.configuration({side:1,level:8,personality:'balanced'});
test('Apex strongly rejects PlusPower with no affordable attack',()=>{
 const x=o();
 assert.ok(AI.score({type:'play_trainer',payload:{handIndex:0}},x,cfg,{})<0);
});
test('Computer Search prioritizes Energy unlocking an attack over Onix',()=>{
 const x=o();x.self.active=unit('base1-2',['base1-102','base1-102']);
 const d={id:'search-choice',kind:'single',label:'Search your deck for any card'};
 const energy={id:'deck:12',label:'Water Energy'};
 const onix={id:'deck:13',label:'Onix'};
 const e=AI.candidates({...x,decision:{...d,actor:1,options:[energy,onix],min:1,max:1}},cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.ok(e.length>0);
 assert.equal(e[0].payload.selected[0],energy.id);
});

test('Apex discounts a vulnerable Onix bench against a ready Venusaur',()=>{
 const x=o();
 x.self.active=unit('base1-7');
 x.opponent.active=unit('base1-15',['base1-99','base1-99','base1-99','base1-99']);
 x.self.hand=['base1-56','base1-63'];
 const onix=AI.score({type:'bench',payload:{handIndex:0}},x,cfg,{});
 const squirtle=AI.score({type:'bench',payload:{handIndex:1}},x,cfg,{});
 assert.ok(Number.isFinite(onix)&&Number.isFinite(squirtle));
});

test('Apex only proposes Computer Search when two other hand cards can pay',()=>{
 const used={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 const proposed=(hand,deckCount=30)=>{
  const x=o();x.self.hand=hand;x.self.deckCount=deckCount;
  return AI.candidates(x,cfg,used).some(a=>a.type==='play_trainer'&&hand[a.payload.handIndex]===SEARCH);
 };
 assert.equal(proposed([SEARCH,W]),false,'one other card cannot pay the mandatory two-card cost');
 assert.equal(proposed([SEARCH,W,PLUS]),true,'two other cards and a nonempty deck permit search');
 assert.equal(proposed([SEARCH,W,PLUS],0),false,'an empty deck has no search target');
});

test('Apex Item Finder can recover a Trainer paid from hand but never proposes an unpayable play',()=>{
 const FINDER='base1-74',BILL='base1-91';
 const used={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 const proposed=(hand,discard=[])=>{
  const x=o();x.self.hand=hand;x.self.discard=discard;
  return AI.candidates(x,cfg,used).some(a=>a.type==='play_trainer'&&hand[a.payload.handIndex]===FINDER);
 };
 assert.equal(proposed([FINDER,W,W]),false,'no Trainer exists to recover');
 assert.equal(proposed([FINDER,BILL,W]),true,'Bill paid as a cost becomes a legal recovery target');
 assert.equal(proposed([FINDER,W],[BILL]),false,'a discard target does not waive the two-card cost');
 assert.equal(proposed([FINDER,W,W],[BILL]),true,'a previously discarded Trainer can be recovered');
});
