'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const configs=[
 {format:'classic',size:60},
 {format:'neo-theme',size:60},
 {format:'online-preview',size:60},
 {format:'online-preview',size:40}
];
const unit=(id,energies=[],damage=0,attachedTrainers=[])=>({id,under:[],energies:[...energies],attachedTrainers:[...attachedTrainers],damage,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:7});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g);const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} must reject insufficient or wrong-type Energy`);assert.deepEqual(g,before,'rejected attack is atomic');}
let scenarios=0;
const ponyta=CATALOG.get('base1-60');
assert.equal(ponyta.name,'Ponyta');assert.equal(ponyta.hp,'40');assert.deepEqual(ponyta.types,['Fire']);
assert.deepEqual(ponyta.attacks,[{name:'Smash Kick',cost:['Colorless','Colorless'],damage:'20',text:''},{name:'Flame Tail',cost:['Fire','Fire'],damage:'30',text:''}]);
assert.deepEqual(ponyta.weaknesses,[{type:'Water',value:'×2'}]);assert.deepEqual(ponyta.resistances,[]);assert.deepEqual(ponyta.retreatCost,['Colorless']);scenarios++;
for(const {format,size} of configs){
 // One Double Colorless pays Smash Kick's full Colorless cost. Extra Energy
 // does not change either printed fixed-damage attack.
 for(const [energies,index,expected] of [
  [['base1-96'],0,20],
  [['base1-99','base1-98'],0,20],
  [['base1-98','base1-98','base1-99'],0,20],
  [['base1-98','base1-98'],1,30],
  [['base1-98','base1-98','base1-99','base1-102'],1,30]
 ]){const g=game(format,size);g.players[0].active=unit('base1-60',energies);act(g,0,'attack',{attackIndex:index});assert.equal(g.players[1].active.damage,expected);assert.deepEqual(g.players[0].active.energies,energies);assert.equal(g.pendingDecision,null);scenarios++;}
 // Smash Kick needs two Colorless units; Flame Tail needs two Fire units.
 {const g=game(format,size);g.players[0].active=unit('base1-60',['base1-99']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 for(const energies of [['base1-96'],['base1-98','base1-96']]){const g=game(format,size);g.players[0].active=unit('base1-60',energies);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Both attacks use Ponyta's Fire type for Weakness even when the printed
 // attack cost is Colorless. Weakness applies before Defender's -20.
 for(const [index,expected] of [[0,20],[1,40]]){const g=game(format,size);g.players[0].active=unit('base1-60',index===0?['base1-96']:['base1-98','base1-98']);g.players[1].active=unit('base1-15',[],0,[{id:'base1-80',expires:99}]);act(g,0,'attack',{attackIndex:index});assert.equal(g.players[1].active.damage,expected);assert.equal(g.pendingDecision,null);scenarios++;}
}
assert.equal(scenarios,41);
console.log(`PASS Ponyta Base attacks: printed costs/damage, DCE payment, fixed damage, Weakness and Defender (${scenarios} reducer scenarios)`);
