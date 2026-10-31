'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const ATTACK=require('./attack_effects_core');
const variants=[
 {id:'base1-59',water:'base1-102',dce:'base1-96',fire:'base1-98',grass:'base1-99',rainbow:'base5-17',fill:'base1-99',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-88',water:'base4-130',dce:'base4-124',fire:'base4-126',grass:'base4-127',rainbow:'base5-17',fill:'base4-127',formats:[['neo-theme',60],['online-preview',60],['online-preview',40]]}
];
const textBase="Does 10 damage plus 10 more damage for each Water Energy attached to Poliwag but not used to pay for this attack's Energy cost. Extra Water Energy after the 2nd don't count.";
const textBase2="Does 10 damage plus 10 more damage for each Water Energy attached to Poliwag but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way.";
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format,size,v){const deck=[...Array(4).fill(v.id),...Array(size-4).fill(v.fill)];const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:5});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.fill);p.prizes=Array(size===40?4:6).fill(v.fill);p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g);const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`expected illegal ${type}`);assert.deepEqual(g,before,'rejected action must be atomic');}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id);assert.equal(card.name,'Poliwag');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Water']);assert.deepEqual(card.weaknesses,[{type:'Grass',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);assert.deepEqual(card.attacks[0],{name:'Water Gun',cost:['Water'],damage:'10+',text:v.id==='base1-59'?textBase:textBase2});
 const compiled=ATTACK.compile(card.attacks[0]);assert.equal(compiled.kind,'water-extra');assert.equal(compiled.damage,10);assert.equal(compiled.factor,10);assert.equal(compiled.cap,20);scenarios++;
 for(const [format,size] of v.formats){
  // Only surplus Water Energy increases Water Gun; each additional point is
  // 10 damage and the two-card/20-damage cap applies to either printing.
  for(const [energies,expected] of [
   [[v.water],10],
   [[v.water,v.water],20],
   [[v.water,v.water,v.water],30],
   [[v.water,v.water,v.water,v.water],30],
   [[v.water,v.dce],10],
   [[v.water,v.fire,v.grass],10],
   [[v.water,v.water,v.dce,v.fire],20],
   [[v.water,v.water,v.water,v.dce,v.fire],30]
  ]){const g=game(format,size,v);g.players[0].active=unit(v.id,energies);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,expected,`${v.id} ${format}/${size} ${energies.join(',')}`);assert.deepEqual(g.players[0].active.energies,energies,'attack retains attached Energy');assert.equal(g.pendingDecision,null,'Water Gun needs no Energy picker');scenarios++;}
  // Rainbow provides Water only while attached; it can pay the typed cost
  // and contributes a surplus Water Energy outside the Base-only format.
  if(format!=='classic')for(const [energies,expected] of [[[v.rainbow],10],[[v.water,v.rainbow],20]]){const g=game(format,size,v);g.players[0].active=unit(v.id,energies);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,expected);scenarios++;}
  // DCE and other types cannot satisfy the single typed Water requirement.
  {const g=game(format,size,v);g.players[0].active=unit(v.id,[v.dce,v.fire]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
  // Water Weakness doubles both the base 10 and capped 30 damage.
  for(const [energies,expected] of [[[v.water],20],[[v.water,v.water,v.water],60]]){const g=game(format,size,v);g.players[0].active=unit(v.id,energies);g.players[1].active=unit('base1-23');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,expected);scenarios++;}
 }
}
assert.equal(scenarios,91);
console.log(`PASS Poliwag Base and Base Set 2 Water Gun typed Energy, Rainbow Energy, cap, Weakness, and printings (${scenarios} reducer scenarios)`);
