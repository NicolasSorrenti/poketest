'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,e=[],damage=0)=>({id,under:[],energies:[...e],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(){const g=createGame({decks:[deck,deck],format:'classic',seed:46});g.phase='game';g.turn=0;g.round=3;g.turnSerial=4;
 for(let i=0;i<2;i++){const p=g.players[i];p.active=unit('base1-44');p.bench=[unit('base1-44')];p.deck=Array(12).fill('base1-99');p.prizes=Array(6).fill('base1-99');p.hand=[];p.discard=[];}return g;}
function ok(g,s,t,p={}){const r=applyCommand(g,s,{type:t,payload:p});assert.ok(r.ok,`${t}: ${r.error}`);}
function choose(g,ids){const d=g.pendingDecision;assert.ok(d);ok(g,d.actor,'choose',{decisionId:d.id,selected:ids||d.options.slice(0,d.min).map(x=>x.id)});}
let count=0;
{
 const g=game();g.players[0].active=unit('base3-3',['base1-98']);g.players[1].active=unit('base1-7');
 const before=g.players[1].active.damage;ok(g,0,'attack',{attackIndex:0});assert.ok(g.players[1].active.damage>before,'Ditto Transform did not copy Hitmonchan Jab');count++;
}
{
 const g=game();g.players[0].active=unit('base1-84');
 // Just a conventional attack for damage; compare with and without Defender on defending side.
 g.players[0].active=unit('base1-7',['base1-97']);g.players[1].active=unit('base1-44');
 g.players[1].active.attachedTrainers=[{id:'base1-80',expires:6}];
 ok(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0,'Defender should prevent 20 damage');count++;
}
{
 const g=game();g.players[0].active=unit('base1-7',['base1-97']);g.players[0].active.attachedTrainers=[{id:'base1-84',expires:5}];
 ok(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30,'PlusPower should add 10 after W/R');count++;
}
{
 const g=game();g.players[0].active=unit('base1-7',['base1-97']);g.players[1].active=unit('base1-8');
 ok(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,10,'Machamp Strikes Back should react');count++;
}
{
 const g=game();g.players[0].active=unit('base3-52');g.players[1].hand=['base1-91','base1-93'];
 assert.deepEqual(publicView(g,0).players[1].hand,g.players[1].hand,'Clairvoyance should reveal opponent hand');
 g.players[0].active.status='Asleep';assert.equal(publicView(g,0).players[1].hand,undefined,'Disabled Clairvoyance should hide hand');count++;
}
{
 const g=game();g.players[0].hand=['base5-15'];g.players[0].prizes=['base1-91','base1-99'];g.players[1].prizes=['base1-98','base1-91'];
 assert.equal(publicView(g,1).players[0].prizes,undefined);ok(g,0,'play_trainer',{handIndex:0});
 assert.deepEqual(publicView(g,1).players[0].prizes,['base1-91','base1-99']);count++;
}
{
 const g=game();g.players[0].hand=['base5-74'];g.players[0].deck=['base1-44','base1-27'];g.players[1].deck=['base1-44','base1-27'];
 ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,1,'Challenge! is accepted/declined by opponent');choose(g,['accept:1']);
 assert.equal(g.pendingDecision.actor,1);choose(g,['deck:0']);
 assert.equal(g.pendingDecision.actor,0);choose(g,['deck:1']);assert.equal(g.players[0].bench.length,2);assert.equal(g.players[1].bench.length,2);count++;
}
{
 const g=game();g.players[0].active=unit('base1-2');g.players[0].hand=['base1-102'];g.players[0].bench=[unit('base1-63')];
 ok(g,0,'use_power',{slot:-1});choose(g,['hand:0']);choose(g,['slot:0']);assert.deepEqual(g.players[0].bench[0].energies,['base1-102']);
 assert.equal(g.players[0].energyUsed,false);count++;
}
console.log('PASS Classic cross-effect integration scenarios: ',count);
