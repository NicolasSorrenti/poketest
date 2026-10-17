'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const F=require('./classic_format'),POWERS=require('./classic_power_core');
const U=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:104});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=552;
 g.players[0].active=U('base1-58',{energies:['base1-100']});
 g.players[0].bench=[U('base1-3')];
 g.players[1].active=U('neo2-2');
 g.players[1].bench=[U('neo2-21'),U('base1-3')];
 for(const p of g.players){p.prizes=Array(6).fill('base1-99');p.discard=[];p.hand=[];}
 return g;
}
const pool=new ClassicLocalService().cardPool();
for(const id of ['neo2-2','neo2-21']){assert.ok(pool.find(c=>c.id===id)?.supported);assert.ok(F.isAllowed(id,{neo:true}));}
assert.equal(POWERS.PASSIVE.has('Spikes'),true);
{
 const g=game();const r=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,true,r.error);assert.equal(g.players[0].active.id,'base1-3');
 assert.equal(g.players[0].active.damage,20,'Both healthy Forretress do 10 each without Weakness or Resistance');
}
{
 const g=game();g.players[1].active.status='Asleep';
 const r=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,true,r.error);assert.equal(g.players[0].active.damage,10,'Asleep Forretress stops its own Spikes');
}
{
 const g=game();g.players[1].active.status='Paralyzed';g.players[1].bench[0].status='Asleep';
 const r=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,true,r.error);assert.equal(g.players[0].active.damage,0,'All disabled Spikes leave new Active unharmed');
}
{
 const g=game();g.turn=1;g.players[1].active=U('base1-58',{energies:['base1-100']});
 g.players[1].bench=[U('neo2-2'),U('base1-3')];
 const r=applyCommand(g,1,{type:'retreat',payload:{slot:1}});
 assert.equal(r.ok,true,r.error);
 assert.equal(g.players[1].active.damage,0,'Spikes never reacts to its own trainer turning Active');
}
console.log('PASS v0.53: Spikes on opponent turn with two sources, disabled Powers and own-turn exclusion');
