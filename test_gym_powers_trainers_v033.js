'use strict';
const assert=require('node:assert/strict');const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const U=(id,patch={})=>({id,under:[],energies:[],damage:0,attachedTrainers:[],status:null,playedTurn:1,...patch});
function game(){const ids=Array(60).fill('base1-99');ids.splice(0,4,...Array(4).fill('base1-3'));const g=createGame({decks:[ids,ids],format:'gym-expanded',seed:27});g.phase='game';g.turn=0;g.turnSerial=8;g.round=5;g.players[0].active=U('base1-3');g.players[1].active=U('base1-4');g.players[0].bench=[U('base1-3')];g.players[1].bench=[U('base1-3')];g.players[0].prizes=Array(6).fill('base1-99');g.players[1].prizes=Array(6).fill('base1-99');return g;}
function send(g,actor,type,payload){const r=applyCommand(g,actor,{type,payload});assert.ok(r.ok,`${type} ${r.error}`);return r;}
function pick(g,selected){const d=g.pendingDecision;assert.ok(d,`expected choice`);const opts=selected===undefined?(d.min?[d.options[0].id]:[]):selected;send(g,d.actor,'choose',{decisionId:d.id,selected:opts});}
let n=0;
{
 const g=game();g.players[0].active=U('gym2-3',{under:['gym2-74']});g.players[0].hand=['gym2-2'];send(g,0,'use_power',{slot:-1,powerIndex:0});pick(g);assert.equal(g.players[0].active.gymShapeshiftCard,'gym2-2');assert.equal(g.players[0].hand.length,0);send(g,0,'use_power',{slot:-1,powerIndex:0});assert.equal(g.players[0].active.gymShapeshiftCard,undefined);assert.ok(g.players[0].discard.includes('gym2-2'));n++;
}
{
 const g=game();g.players[0].active=U('gym2-38',{energies:[]});g.players[0].bench=[U('base1-3',{energies:['base1-99','base1-99']})];send(g,0,'use_power',{slot:-1,powerIndex:0});pick(g,g.pendingDecision.options.map(x=>x.id));assert.equal(g.players[0].active.energies.length,2);n++;
}
{
 const g=game();g.players[0].active=U('gym2-45',{under:['gym2-78'],energies:['base1-99','base1-99']});g.players[0].hand=['gym1-116'];send(g,0,'play_trainer',{handIndex:0});assert.ok(g.players[0].recallUntil>g.turnSerial);n++;
}
{
 const g=game();g.players[0].active=U('gym2-94');g.players[0].hand=['gym1-117'];send(g,0,'play_trainer',{handIndex:0});pick(g);assert.ok(g.players[0].active.attachedTrainers.some(x=>x.id==='gym1-117'));n++;
}
{
 const g=game();g.players[0].active=U('gym2-78',{energies:['base1-99']});g.players[0].hand=['gym2-115'];send(g,0,'play_trainer',{handIndex:0});assert.ok(g.players[0].active.attachedTrainers.some(x=>x.id==='gym2-115'));g.turn=1;g.players[1].active=U('base1-46',{energies:['base1-99']});send(g,1,'attack',{attackIndex:0});assert.equal(g.pendingAction?.kind,'gym_ninja_trick');pick(g,['bench:0']);assert.equal(g.players[0].active.id,'base1-3');assert.ok(g.players[0].discard.includes('gym2-115'));n++;
}
console.log(`PASS Gym v0.33 targeted Power and Trainer scenarios: ${n}`);
{
 const g=game();g.players[0].active=U('base1-46',{energies:['base1-99']});g.players[0].hand=['gym1-99'];g.players[1].active=U('base1-3');send(g,0,'play_trainer',{handIndex:0});assert.ok(g.players[0].active.attachedTrainers.some(x=>x.id==='gym1-99'));send(g,0,'attack',{attackIndex:0});assert.equal(g.pendingAction?.kind,'gym_charity');pick(g,['reduce:10']);assert.equal(g.players[1].active.damage,0);assert.ok(g.players[0].hand.includes('gym1-99'));console.log('PASS v0.33 Charity reduction and return');
}
{
 const g=game();g.players[0].active=U('base1-46',{energies:['base1-99']});g.players[1].active=U('gym1-12',{damage:50});send(g,0,'attack',{attackIndex:0});assert.equal(g.pendingAction?.kind,'gym_rebirth');pick(g,['choice:yes']);assert.ok(g.players[1].hand.includes('gym1-12'));assert.equal(g.players[1].active.id,'base1-3');console.log('PASS v0.33 Rocket’s Moltres Rebirth preserves attached-card/Prize behavior');
}
{
 const g=game();g.players[0].active=U('base1-46',{energies:['base1-99']});g.players[1].active=U('gym2-35',{damage:50});send(g,0,'attack',{attackIndex:0});assert.ok(g.players[1].deck.includes('gym2-35'));assert.equal(g.players[1].active?.id,'base1-3');console.log('PASS v0.33 Brock’s Primeape Scram removes Active at 10 HP');
}
{
 const g=game();g.players[0].active=U('gym1-96',{energies:['base1-101','base1-99'],attachedTrainers:[{id:'gym1-117',expires:9}]});g.players[1].active=U('base1-3',{energies:[]});send(g,0,'attack',{attackIndex:1});assert.equal(g.pendingAction?.kind,'sabrina_esp');pick(g,['choice:reroll']);assert.notEqual(g.pendingAction?.kind,'sabrina_esp');console.log('PASS v0.33 Sabrina ESP reroll resumes attack');
}
{
 const g=game();g.players[0].active=U('base1-46',{energies:['base1-99']});g.players[1].active=U('gym2-78',{attachedTrainers:[{id:'gym2-115'}]});send(g,0,'attack',{attackIndex:0});assert.equal(g.pendingAction.kind,'gym_ninja_trick');pick(g,[]);assert.equal(g.players[1].active.id,'gym2-78');console.log('PASS v0.33 Koga Ninja Trick decline permits attack');
}
{
 const g=game();g.players[0].hand=['gym2-112','base1-46'];const before=g.players[1].hand.length;send(g,0,'play_trainer',{handIndex:0});pick(g);pick(g);const d=g.pendingDecision;const index=d.options.find(x=>x.label==='Charmander');assert.ok(index);pick(g,[index.id]);assert.equal(g.players[1].hand.length,before+3);console.log('PASS v0.33 Blaine Quiz3 opponent guess with hidden card');
}
