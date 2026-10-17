'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const U=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
const game=()=>{const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'gym-expanded',seed:17});g.phase='game';g.round=3;g.turn=0;g.turnSerial=5;g.players[0].active=U('base1-3');g.players[1].active=U('base1-3');g.players[0].prizes=Array(6).fill('base1-99');g.players[1].prizes=Array(6).fill('base1-99');g.players[0].hand=['gym2-107','base1-98','base1-46'];g.players[0].bench=[];return g;};
function send(g,actor,type,payload={}){const r=applyCommand(g,actor,{type,payload});assert.ok(r.ok,r.error);}
{
 const g=game();send(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['n:1','n:2']);send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['n:1']});
 assert.equal(g.players[0].bench[0].id,'base1-98');assert.equal(g.players[0].bench[0].secretPlanFaceDown,true);assert.ok(g.players[0].discard.includes('gym2-107'));
 const guest=publicView(g,1),watch=publicView(g,null),mine=publicView(g,0);
 assert.equal(guest.players[0].bench[0].id,'gym2-107');assert.equal(watch.players[0].bench[0].id,'gym2-107');assert.equal(JSON.stringify(guest).includes('base1-98'),false);assert.equal(JSON.stringify(watch).includes('base1-98'),false);
 assert.equal(mine.players[0].bench[0].secretPlanCard,'base1-98');
 let r=applyCommand(g,1,{type:'reveal_secret',payload:{slot:0}});assert.equal(r.ok,false);
 send(g,0,'reveal_secret',{slot:0});assert.equal(g.players[0].bench.length,0);assert.equal(g.players[0].discard.at(-1),'base1-98');
}
{
 const g=game();send(g,0,'play_trainer',{handIndex:0});send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['n:2']});
 send(g,0,'reveal_secret',{slot:0});assert.equal(g.players[0].bench[0].id,'base1-46');assert.equal(g.players[0].bench[0].secretPlanFaceDown,false);
}
{
 const g=game();g.players[0].bench=Array.from({length:5},()=>U('base1-3'));
 const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});assert.equal(r.ok,false);assert.match(r.error,/Bench full/);
}
console.log('PASS v0.41 Secret Plan: any hand card, masked spectator/opponent, voluntary reveal, ownership, Bench capacity');
{
 const g=game();g.players[0].prizes=Array(6).fill('base1-99');g.players[1].prizes=Array(6).fill('base1-99');g.players[0].hand=['gym2-107','base1-98'];send(g,0,'play_trainer',{handIndex:0});send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['n:1']});
 g.players[1].hand=['base1-93'];g.turn=1;
 send(g,1,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.options[0].label,'Face-down Pokémon');
 send(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});
 assert.equal(g.players[0].active.id,'base1-3');assert.equal(g.players[0].bench.length,0);assert.ok(g.players[0].discard.includes('base1-98'));assert.equal(g.turn,1);
 assert.equal(g.players[1].prizes.length,6); // Gust did not knock out a real Pokémon
}
console.log('PASS v0.41 forced Secret Plan reveal: hidden target labels, Gust of Wind and no false Prize');
{
 // Damage first reveals the actual Basic before KO checks; its real HP is used.
 const g=game();g.players[0].active={...U('base1-46'),secretPlanFaceDown:true,secretPlanOwner:0,secretPlanSerial:77};g.players[1].active={...U('base1-46'),energies:['base1-98']};g.players[1].hand=[];g.turn=1;
 send(g,1,'attack',{attackIndex:0});
 assert.equal(g.players[0].active.id,'base1-46');assert.equal(g.players[0].active.secretPlanFaceDown,false);assert.equal(g.players[0].active.damage,10);assert.equal(g.players[1].prizes.length,6);
}
{
 // A non-Basic face-down Active is removed, without awarding a false Prize.
 const g=game();g.players[0].active={...U('base1-98'),secretPlanFaceDown:true,secretPlanOwner:0,secretPlanSerial:78};g.players[0].bench=[U('base1-46')];g.players[1].active={...U('base1-46'),energies:['base1-98']};g.players[1].hand=[];g.turn=1;
 send(g,1,'attack',{attackIndex:0});
 assert.equal(g.players[0].active?.id,'base1-46');assert.ok(g.players[0].discard.includes('base1-98'));assert.equal(g.players[1].prizes.length,6);
}
console.log('PASS v0.41 Secret Plan automatic attack reveal, true HP and no imaginary KOs');
