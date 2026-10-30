'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const u=(id,e=[],damage=0,status=null)=>({id,under:[],energies:[...e],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(){let g=createGame({format:'classic',decks:[deck,deck],seed:3});g.phase='game';g.turn=0;g.turnSerial=4;for(const p of g.players){p.active=u('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(6).fill('base1-99')}return g}
function go(g,side,type,payload){let r=applyCommand(g,side,{type,payload});assert.ok(r.ok,r.error)}
function no(g,side,type,payload){let b=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,b)}
for(const [status,retaliation] of [[null,10],['Asleep',0],['Confused',0],['Paralyzed',0]]){let g=game();g.players[0].active=u('base1-7',['base1-97']);g.players[1].active=u('base1-8',Array(4).fill('base1-97'),90,status);go(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active, null);assert.equal(g.players[0].active.damage,retaliation)}
{let g=game();g.players[0].active=u('base1-8',[]);no(g,0,'attack',{attackIndex:0})}
{let g=game();g.players[0].active=u('base1-8',Array(4).fill('base1-97'));g.players[1].active=u('base1-7',['base1-97'],40);g.turn=1;go(g,1,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,50);assert.equal(g.players[0].active.damage,20)}
console.log('PASS Machamp Seismic Toss costs and Strikes Back timing/status/KO');
