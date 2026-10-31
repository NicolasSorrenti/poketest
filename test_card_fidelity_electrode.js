'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const variants=[
 {id:'base1-21',lightning:'base1-100',colorless:'base1-99',format:'classic',prizeCount:6},
 {id:'base4-25',lightning:'base4-128',colorless:'base4-127',format:'online-preview',prizeCount:6}
];
const unit=(id,energies=[],{damage=0,status=null,under=[],attachedTrainers=[]}={})=>({id,under:[...under],energies:[...energies],attachedTrainers:[...attachedTrainers],damage,status,poison:false,playedTurn:0});
function game(v){
 const deck=[...Array(4).fill(v.id),...Array(4).fill('base1-44'),...Array(4).fill(v.lightning),...Array(48).fill(v.colorless)];
 const g=createGame({format:v.format,decks:[deck,deck],seed:20261031});
 g.phase='game';g.turn=0;g.round=4;g.turnSerial=8;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.colorless);p.prizes=Array.from({length:6},(_,i)=>i===2?v.lightning:v.colorless);p.prizeFaceUp=Array(6).fill(false);p.turnPlays=[];p.energyUsed=false;p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before,'Rejected command must be atomic');}
function choose(g,side,id){const d=g.pendingDecision;assert.ok(d,'Expected decision');assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected:[id]});}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id);assert.equal(printed.attacks[0].name,'Electric Shock');assert.deepEqual(printed.attacks[0].cost,['Lightning','Lightning','Lightning']);assert.match(printed.attacks[0].text,/Flip a coin.*tails.*10 damage to itself/i);
 for(const [seed,recoil] of [[50000,0],[0,10]]){
  const g=game(v);g.players[0].active=unit(v.id,[v.lightning,v.lightning,v.lightning]);g.players[1].active=unit('base1-3');g.rngState=seed;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,50);assert.equal(g.players[0].active.damage,recoil);assert.equal(g.pendingDecision,null);scenarios++;
 }
 {const g=game(v);g.players[0].active=unit(v.id,[v.lightning,v.lightning,'base1-96']);g.players[1].active=unit('base1-3');reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Buzzap is blocked by all three printed Special Conditions, and rejection is atomic.
 for(const status of ['Asleep','Confused','Paralyzed']){
  const g=game(v);g.players[0].active=unit(v.id,[],{status});g.players[0].bench=[unit('base1-44')];reject(g,0,'use_power',{slot:-1});scenarios++;
 }
 // Benched Buzzap with only one recipient auto-selects that Pokémon. Opponent
 // chooses a face-down Prize; Electrode's own attachments go to the discard.
 {
  const g=game(v);g.players[0].active=unit('base1-44');g.players[0].bench=[unit(v.id,[v.lightning],{under:['base1-44'],attachedTrainers:[{id:'base4-109'}]})];
  act(g,0,'use_power',{slot:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['type:0','type:1','type:2','type:3','type:4','type:5','type:6','type:7']);
  choose(g,0,v.id==='base1-21'?'type:6':'type:7');assert.equal(g.pendingDecision.kind,'prize-card','single recipient should auto-resolve without another target prompt');assert.equal(g.pendingDecision.actor,1);
  const energy=g.players[0].active.energies.at(-1);assert.equal(energy,v.id);assert.equal(g.players[0].active.buzzapTypes[energy],v.id==='base1-21'?'Darkness':'Metal');assert.ok(g.players[0].discard.includes(v.lightning));assert.ok(g.players[0].discard.includes('base1-44'));assert.ok(g.players[0].discard.includes('base4-109'));assert.equal(g.players[1].hand.length,0,'Prize must not be silently chosen for the opponent');
  choose(g,1,'prize:2');assert.equal(g.players[1].hand.at(-1),v.lightning);assert.equal(g.players[1].prizes.length,5);assert.equal(g.players[1].prizeFaceUp.length,5);scenarios++;
 }
}
// Active Buzzap with two possible recipients keeps the meaningful choice, then
// completes Prize selection and promotes the remaining Bench Pokémon.
{
 const v=variants[0],g=game(v);g.players[0].active=unit(v.id);g.players[0].bench=[unit('base1-44'),unit('base1-44')];
 act(g,0,'use_power',{slot:-1});choose(g,0,'type:6');assert.equal(g.pendingDecision.kind,'target');assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['slot:0','slot:1']);
 choose(g,0,'slot:1');assert.equal(g.pendingDecision.kind,'prize-card');assert.equal(g.pendingDecision.actor,1);assert.equal(g.players[0].active,null);
 choose(g,1,'prize:0');assert.equal(g.pendingDecision.kind,'pokemon-target');assert.equal(g.pendingDecision.actor,0);choose(g,0,'bench:1');assert.equal(g.players[0].active.id,'base1-44');assert.equal(g.players[0].bench.length,1);assert.equal(g.players[0].active.energies.at(-1),v.id);assert.equal(g.players[0].active.buzzapTypes[v.id],'Darkness');scenarios++;
}
// One remaining Bench Pokémon auto-promotes after an Active Buzzap Prize is chosen.
{
 const v=variants[0],g=game(v);g.players[0].active=unit(v.id);g.players[0].bench=[unit('base1-44')];
 act(g,0,'use_power',{slot:-1});choose(g,0,'type:6');assert.equal(g.pendingDecision.kind,'prize-card');choose(g,1,'prize:0');
 assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.id,'base1-44');assert.equal(g.players[0].bench.length,0);assert.equal(g.players[0].active.energies.at(-1),v.id);scenarios++;
}
// Taking the opponent's final Prize for Buzzap ends the game through the standard KO flow.
{
 const v=variants[0],g=game(v);g.players[0].active=unit(v.id);g.players[0].bench=[unit('base1-44')];g.players[1].prizes=[v.colorless];g.players[1].prizeFaceUp=[false];
 act(g,0,'use_power',{slot:-1});choose(g,0,'type:6');choose(g,1,'prize:0');assert.equal(g.over,true);assert.equal(g.winner,1);scenarios++;
}
// Converted Electrode supplies two typed units and pays Neo-era Darkness/Metal costs.
for(const [type,attacker,index] of [['Darkness','neo1-24',0],['Metal','neo2-10',0]]){
 const g=game(variants[0]);g.players[0].active=unit(attacker,['base1-21']);g.players[0].active.buzzapTypes={'base1-21':type};g.players[1].active=unit('base1-3');
 act(g,0,'attack',{attackIndex:index});assert.equal(g.pendingDecision,null,`${type} Buzzap units should satisfy the printed typed cost`);assert.equal(g.players[0].active.energies.includes('base1-21'),true);if(type==='Darkness')assert.ok(g.players[1].active.neo48MeanLook);else assert.ok(g.players[1].active.damage>0);scenarios++;
}
console.log(`PASS Electrode Electric Shock/Buzzap: ${scenarios} reducer scenarios`);
