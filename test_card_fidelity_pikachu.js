'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-58',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-87',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,damage=0,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:127});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}
function choose(g,side,selected){const d=g.pendingDecision;assert.ok(d,'expected a pending choice');assert.equal(d.actor,side,'choice belongs to the correct player');act(g,side,'choose',{decisionId:d.id,selected});}
function seedFor(heads){for(let seed=0;seed<10000;seed++){const state=(Math.imul(seed,1664525)+1013904223)>>>0;if((state>=0x80000000)===heads)return seed;}throw Error('coin seed not found');}
function setCoin(g,heads){g.rngState=seedFor(heads);g.coinFlips=[];g.coinSeq=0;}
function convertPikachuWeakness(g,pikachuSide=0){const porygonSide=1-pikachuSide;g.turn=porygonSide;g.players[porygonSide].active=unit('base1-39',0,['base1-96']);g.players[porygonSide].active.attachedTrainers=[{id:'base1-80',expires:99}];act(g,porygonSide,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,porygonSide);choose(g,porygonSide,['type:Lightning']);assert.equal(g.players[pikachuSide].active.weaknessOverride,'Lightning');assert.equal(g.turn,pikachuSide);}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Pikachu');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Lightning']);assert.deepEqual(card.attacks,[
  {name:'Gnaw',cost:['Colorless'],damage:'10',text:''},
  {name:'Thunder Jolt',cost:['Lightning','Colorless'],damage:'30',text:'Flip a coin. If tails, Pikachu does 10 damage to itself.'}
 ]);assert.deepEqual(card.weaknesses,[{type:'Fighting',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
 // Gnaw's generic cost and fixed 10 do not scale with a Double Colorless card.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-96']);g.players[1].active=unit('base1-54');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.deepEqual(g.players[0].active.energies,['base1-96']);scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Thunder Jolt requires Lightning plus one generic Energy; Double Colorless
 // alone cannot pay its Lightning symbol.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-96']);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Heads: 30 attack damage, no self-damage. Energy used for the attack stays.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);g.players[1].active=unit('base1-54');setCoin(g,true);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.damage,0);assert.deepEqual(g.players[0].active.energies,['base1-100','base1-98']);scenarios++;}
 // Tails: the opponent still takes the printed damage and Pikachu takes 10.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);g.players[1].active=unit('base1-54');setCoin(g,false);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.damage,10);scenarios++;}
 // Weakness doubles attack damage; Lightning Resistance reduces it to zero.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);g.players[1].active=unit('base1-42');setCoin(g,true);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,60);assert.equal(g.players[0].active.damage,0);scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);g.players[1].active=unit('base1-47');setCoin(g,false);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].active.damage,10);scenarios++;}
 // WotC Q81 ruled that self-damage from an attack is still attack damage for
 // Weakness. Porygon changes Pikachu's Weakness to Lightning; tails therefore
 // doubles Thunder Jolt's 10 self-damage to 20.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);convertPikachuWeakness(g);setCoin(g,false);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,20,'converted Lightning Weakness doubles Thunder Jolt recoil');assert.equal(g.players[1].active.damage,10);scenarios++;}
 // WotC Q4 confirms Defender reduces this self-damage because it is attack
 // damage. The converted Weakness makes 20, then Defender prevents 20.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);g.players[0].active.attachedTrainers=[{id:'base1-80',expires:99}];convertPikachuWeakness(g);setCoin(g,false);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,0,'Defender reduces converted-Weakness self-damage');assert.equal(g.players[1].active.damage,10);scenarios++;}
 // The WotC-era PlusPower erratum applies the attack bonus to both Active
 // Pokémon. Thunder Jolt therefore gets +10 on the Defending Pokémon and +10
 // on its attack recoil to Pikachu.
 {const g=game(format,size);g.players[0].active=unit(c.id,0,['base1-100','base1-98']);g.players[0].active.attachedTrainers=[{id:'base1-84',expires:99}];g.players[1].active=unit('base1-54');setCoin(g,false);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active.damage,20);scenarios++;}
 // Recoil can Knock Out Pikachu after its attack. The opponent takes the
 // Prize and Pikachu's owner then promotes their lone Benched Pokémon.
 {const g=game(format,size);g.players[0].active=unit(c.id,30,['base1-100','base1-98']);g.players[0].bench=[unit('base1-52')];g.players[1].active=unit('base1-54');setCoin(g,false);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active,null);assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.kind,'prize-card');choose(g,1,['prize:0']);assert.equal(g.players[0].active.id,'base1-52');assert.equal(g.players[0].bench.length,0);assert.equal(g.pendingDecision,null);assert.equal(g.turn,1);scenarios++;}
}
assert.equal(scenarios,72);
console.log(`PASS Pikachu Gnaw and Thunder Jolt costs, coin outcomes, W/R, recoil and historical self-damage interactions (${scenarios} reducer scenarios)`);
