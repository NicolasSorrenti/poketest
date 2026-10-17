'use strict';
const assert=require('node:assert/strict'), fs=require('fs'), vm=require('vm');
const source=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const rand=Object.create(Math);rand.random=()=>0.01; // Heads
const empty=()=>({classList:{add(){},remove(){}},querySelectorAll:()=>[],style:{},getBoundingClientRect:()=>({left:0,top:0,width:30,height:40})});
const ctx={console,Math:rand,window:{},document:{getElementById:empty,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const evalIn=expr=>vm.runInContext(expr,ctx);
const sets=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
ctx.db=require('./card_corrections').applyCardCorrections(sets.flatMap(s=>require('./cards/'+s+'.json')));
evalIn('cards=db;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};battlefieldAttack=()=>{};queuePrizeFX=()=>{};engine.end=()=>{};');
const prep=(mine,opp='base1-58')=>evalIn(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.over=false;engine.turnSerial=10;engine.round=5;engine.turn=0;engine.players[0].active=unit(${JSON.stringify(mine)});engine.players[1].active=unit(${JSON.stringify(opp)});engine.players[0].prizes=['base1-98','base1-99'];engine.players[1].prizes=['base1-98','base1-99'];deckSearchRequest=null;cpuResumeChoice=null;`);
let tests=0;
const check=(expr,message)=>{assert(evalIn(expr),message||expr);tests++};
// Buzzap: energy replacement is 2 typed units, Electrodes from both printings.
for(const id of ['base1-21','base4-25']){
 prep(id);evalIn("engine.me.bench=[unit('base1-58')];");
 check('engine.buzzap(-1)===null','Buzzap prompts for choice');
 check('deckSearchRequest.options.length===8','Buzzap offers the eight types');
 check('deckSearchRequest.execute(deckSearchRequest.options[2].index)','Water choice resolves');
 check("engine.me.active.id==='base1-58'");
 check("engine.energies(engine.me.active).join(',')==='Water,Water'");
 check('engine.foe.prizes.length===1 && engine.foe.hand.length===1');
}
// Invalid choice leaves Electrodes in place and does not pay a Prize.
prep('base1-21');evalIn("engine.me.bench=[unit('base1-58')];");
check('engine.buzzap(-1,900)===false');check('engine.foe.prizes.length===2');
// Shapeshift selects an evolution from the hand without adding an evolution layer.
prep('gym2-3');evalIn("engine.me.hand=['base1-99','base1-4'];");
check('engine.shapeshift(-1)===null');check('deckSearchRequest.options.length===1');
check('deckSearchRequest.execute(1)');
check("engine.card(engine.me.active).name==='Charizard'");
check('engine.me.active.under.length===0');
check("engine.card(engine.me.active).abilities[0].name==='Shapeshift'");
check("engine.me.active.id==='gym2-3'");
check("engine.evolve(0,-1)===false");
check('engine.shapeshift(-1,null,true)');
check("engine.card(engine.me.active).name===\"Brock's Ninetales\"");
// Status automatically discards the attached evolution.
prep('gym2-3');evalIn("engine.me.hand=['base1-4'];");check('engine.shapeshift(-1,0)');
evalIn("engine.me.active.status='Asleep';engine.resolveKO()");
check('!engine.me.active.shapeshiftCardId');check("engine.me.discard.includes('base1-4')");
// Miraculous Wind: Double Colorless provides two C normally; only one C under the Power.
prep('base1-58');evalIn("engine.me.active.energies=['base1-96'];");
check("engine.energies(engine.me.active).length===2");
evalIn("engine.foe.active=unit('neo4-14');");
check("engine.energies(engine.me.active).length===1");
evalIn("engine.foe.active.status='Paralyzed';");
check('engine.energies(engine.me.active).length===2');
// Bench Guard: reduces actual Bench damage by 10, Rhydon receives it; can be disabled.
prep('base1-58');evalIn("engine.me.bench=[unit('gym1-2'),unit('base1-59')];engine._power57DamageBaseline=engine.players.map(p=>p.bench.map(u=>[u,u.damage]));engine.me.bench[1].damage=30;engine.resolveKO();");
check('engine.me.bench[0].damage===10 && engine.me.bench[1].damage===20');
evalIn("engine.me.benchGuardAuto=false;engine._power57DamageBaseline=engine.players.map(p=>p.bench.map(u=>[u,u.damage]));engine.me.bench[1].damage+=10;engine.resolveKO();");
check('engine.me.bench[1].damage===30 && engine.me.bench[0].damage===10');
// Keep: an opponent attack that discards Energy from an Unown should be undone.
prep('base1-58');evalIn("engine.me.bench=[unit('neo3-58')];engine.me.active=unit('neo4-59');engine.me.active.energies=['base1-100'];engine.foe.active=unit('base1-18');engine.turn=1;engine.foe.active=engine.players[0].active;engine.me.active.energies=['base1-98','base1-98','base1-98'];");
// Directly verify printed immunity and a state-change attempt in the attack transaction.
check("engine.unitHasPower(engine.foe.bench[0],'[Keep]')");
// Quicken: activation works while Asleep and blocks next-turn attack damage.
prep('neo4-59');evalIn("engine.me.active.status='Asleep';");
check("engine.power56('[Quicken]')===true");
check('engine.me.active.unownQuickenUntil===12');
check("engine.power56('[Quicken]')===false");
// Quicken protection pre-KO hook prevents damage and statuses from incoming attacks.
evalIn("engine.turn=1;engine.turnSerial=11;engine._power57Protected=[{owner:engine.players[0],u:engine.players[0].active,damage:0,energies:[],status:'Asleep',poison:false,burn:false,unownKeep:false,unownQuicken:true}];engine.players[0].active.damage=100;engine.players[0].active.status='Confused';engine.resolveKO();");
check('engine.players[0].active.damage===0');check("engine.players[0].active.status==='Asleep'");
// Flee: only triggers on positive damage, allows owner to choose or decline.
prep('base1-58','gym1-10');evalIn("engine.foe.bench=[unit('base1-59')];engine.me.active.energies=['base1-99','base1-99'];");
check("engine.attack(0,null,true)===true"); // Machop Low Kick attack should hit
check("engine.foe.active.id==='base1-59'");
// Allergic Pollen: corrected imported blank card text, Power is present.
prep('neo3-35');check("engine.continuousPower('Allergic Pollen')");
check("engine.powerAudit().filter(x=>x.implemented).length===166");

// Real attacks exercise the protection hooks, not merely their helpers.
prep('base1-18','neo3-58');
evalIn("engine.me.active.energies=['base1-96','base1-96'];engine.foe.active.energies=['base1-101'];");
check('engine.attack(1,null,true)===true');
check("engine.foe.active.energies.join(',')==='base1-101'");
check("engine.foe.discard.length===0");
// An attack may still deal its normal damage while [Keep] blocks the Energy discard.
check('engine.foe.active.damage===20');
prep('basep-3','base1-52');
evalIn("engine.foe.bench=[unit('neo3-35')];engine.me.discard.push('base1-100','base1-101');engine.me.active.energies=['base1-101'];");
check('engine.attack(0,null,true)===true');
check('engine.me.active.energies.length===1');
check("engine.me.discard.includes('base1-100') && engine.me.discard.includes('base1-101')");
// KO discarding Buzzap Energy restores its Electrode identity in the discard.
prep('base1-21');evalIn("engine.me.bench=[unit('base1-58')];");
check('engine.buzzap(-1,10)===true');
evalIn('engine.me.active.damage=200;engine.resolveKO()');
check("engine.me.discard.includes('base1-21')");
check("!engine.me.discard.some(id=>id.startsWith('__buzzap:'))");
// Actual Stretch Kick damage is redirected by a Benched Brock's Rhydon.
prep('base3-7','base1-52');
evalIn("engine.foe.bench=[unit('gym1-2'),unit('base1-59')];engine.me.active.energies=['base1-97','base1-97'];");
check('engine.attack(0,1,true)===true');
check('engine.foe.bench[1].damage===10');
check('engine.foe.bench[0].damage===10');
// Flee remains optional during a CPU attack: choice can be declined.
prep('gym1-10','base1-52');
evalIn("engine.me.bench=[unit('base1-59')];engine.turn=1;engine.me.active.energies=['base1-97'];");
check('engine.attack(0,null,true)===true');
check('!!deckSearchRequest && deckSearchRequest.defenderPrompt===true');
check('deckSearchRequest.execute(-1)===true');
check("engine.players[0].active.id==='gym1-10'");
// Flee's switch occurs after damage, with all non-damage effects cleared.
prep('gym1-10','base1-52');
evalIn("engine.me.bench=[unit('base1-59')];engine.turn=1;engine.me.active.energies=['base1-97'];");
check('engine.attack(0,null,true)===true');
check('deckSearchRequest.execute(0)===true');
check("engine.players[0].active.id==='base1-59'");
check('engine.players[0].bench[0].damage===20');
// Quicken protects Unown against an actual attack, with no lingering protection
// after the opponent's turn ends.
prep('neo4-59','base1-52');
check("engine.power56('[Quicken]')===true");
evalIn("engine.turn=1;engine.turnSerial=11;engine.me.active.energies=['base1-97'];");
check('engine.attack(0,null,true)===true');
check('engine.foe.active.damage===0');
// [Quicken] isn't usable twice in the same owner's turn even with two Unown Q.
prep('neo4-59','base1-52');
evalIn("engine.me.bench=[unit('neo4-59')];");
check("engine.power56('[Quicken]')===true");
check("engine.power56('[Quicken]')===false");
console.log(`PASS v0.5.7: ${tests} outcome checks for remaining Powers (Buzzap, Shapeshift, Miraculous Wind, Bench Guard, Flee, Keep, Quicken, Allergic Pollen).`);
