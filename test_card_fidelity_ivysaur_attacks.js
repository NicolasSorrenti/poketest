'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-30',format:'classic',deckSize:60,prizes:6,grass:'base1-99',fire:'base1-98',water:'base1-102',dce:'base1-96',growlithe:'base1-28'},
 {id:'base4-44',format:'online-preview',deckSize:60,prizes:6,grass:'base4-127',fire:'base4-126',water:'base4-130',dce:'base4-124',growlithe:'base4-42'},
 {id:'base4-44',format:'online-preview',deckSize:40,prizes:4,grass:'base4-127',fire:'base4-126',water:'base4-130',dce:'base4-124',growlithe:'base4-42'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.deckSize,prizeCount:v.prizes,seed:41});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(v.prizes).fill(v.grass);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.players[0].active=unit(v.id);return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'invalid attack payment should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-30');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 must match Base Set text and costs');
 assert.equal(printed.name,'Ivysaur');assert.deepEqual(printed.weaknesses,base.weaknesses);scenarios++;
 const [vine,poison]=printed.attacks;
 assert.equal(vine.name,'Vine Whip');assert.deepEqual(vine.cost,['Grass','Colorless','Colorless']);assert.equal(vine.damage,'30');assert.equal(vine.text,'');
 assert.equal(poison.name,'Poisonpowder');assert.deepEqual(poison.cost,['Grass','Grass','Grass']);assert.equal(poison.damage,'20');assert.equal(poison.text,'The Defending Pokémon is now Poisoned.');
 // The typed Grass symbol and two Colorless units may be paid by Grass+DCE.
 {const g=game(v);g.players[0].active.energies=[v.grass,v.dce];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.grass,v.water,v.fire];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.grass,v.fire];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.dce,v.water];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Poison is applied after attack damage, then the immediately following
 // Checkup places the first 10 Poison damage counter.
 {const g=game(v);g.players[0].active.energies=[v.grass,v.grass,v.grass];act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.poisonDamage,10);scenarios++;}
 // WotC expert rules say a new Poison condition replaces (does not stack
 // with) existing Poison. A stronger Poison is replaced by standard 10.
 {const g=game(v);g.players[0].active.energies=[v.grass,v.grass,v.grass];g.players[1].active.poison=true;g.players[1].active.poisonDamage=20;
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.poisonDamage,10);scenarios++;}
 // Fire Weakness on Ivysaur doubles the opponent's Fire-type Flare.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit(v.growlithe,[v.fire,v.water]);
  act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,40);scenarios++;}
}
console.log(`PASS Ivysaur Vine Whip and Poisonpowder: ${scenarios} reducer scenarios`);
