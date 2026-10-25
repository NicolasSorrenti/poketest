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
 const d={kind:'single',label:'Search your deck for any card'};
 const energy={id:'deck:12',label:'Water Energy'};
 const onix={id:'deck:13',label:'Onix'};
 const e=AI.candidates({...x,decision:{...d,actor:1,options:[energy,onix],min:1,max:1}},cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.ok(e.length>0);
 assert.equal(e[0].payload?.ids?.[0]||e[0].payload?.choice||e[0].payload?.id||'',energy.id);
});
