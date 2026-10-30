'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function setup(id,energy,seed=1){const g=createGame({format:'classic',decks:[deck,deck],seed:3});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;g.rngState=seed;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(6).fill('base1-99');}g.players[0].active=unit(id,energy);return g;}
function action(g,type,payload={}){const r=applyCommand(g,0,{type,payload});assert.ok(r.ok,r.error);}
{
 const seen=new Set();for(let seed=0;seed<5000000&&seen.size<2;seed+=50000){const g=setup('base1-1',Array(3).fill('base1-101'),seed);action(g,'attack',{attackIndex:0});let status=g.players[1].active.status||'none';assert.equal(g.players[1].active.damage,30);assert.ok(['Confused','none'].includes(status));seen.add(status);}assert.deepEqual(seen,new Set(['Confused','none']));
}
{
 for(const [extra,expected] of [[0,40],[1,50],[2,60],[3,60]]){let g=setup('base1-2',Array(3+extra).fill('base1-102'));action(g,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,expected,'Hydro Pump excess Water '+extra);}
 const g=setup('base1-2',[...Array(3).fill('base1-102'),'base1-98']);action(g,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40,'Non-Water Energy cannot increase Hydro Pump');
}
{
 // Fighting weakness doubles damage; resistance is subtracted after weakness.
 for(const [attack,energy,target,damage] of [
  [0,['base1-97'],'base1-3',40],
  [0,['base1-97'],'base1-4',0],
  [1,['base1-97','base1-97','base1-99'],'base1-3',80],
  [1,['base1-97','base1-97','base1-99'],'base1-4',10]
 ]){const g=setup('base1-7',energy);g.players[1].active=unit(target);action(g,'attack',{attackIndex:attack});assert.equal(g.players[1].active.damage,damage);}
 const g=setup('base1-7',['base1-97','base1-99','base1-99']);const before=structuredClone(g);const rejected=applyCommand(g,0,{type:'attack',payload:{attackIndex:1}});assert.equal(rejected.ok,false,'Special Punch requires two Fighting Energy');assert.deepEqual(g,before);
}
console.log('PASS Base Confuse Ray, Hydro Pump, and Hitmonchan attack scenarios');
