'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-56',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-84',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:97});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Onix attack must be rejected');assert.deepEqual(g,before,'rejected Onix attack must be atomic');}
function seedFor(heads){for(let seed=0;seed<10000;seed++){const state=(Math.imul(seed,1664525)+1013904223)>>>0;if((state>=0x80000000)===heads)return seed;}throw Error('coin seed not found');}
function setCoin(g,heads){g.rngState=seedFor(heads);g.coinFlips=[];g.coinSeq=0;}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Onix');assert.equal(card.hp,'90');assert.deepEqual(card.types,['Fighting']);assert.deepEqual(card.attacks,[
  {name:'Rock Throw',cost:['Fighting'],damage:'10',text:''},
  {name:'Harden',cost:['Fighting','Fighting'],damage:'',text:"During opponent's next turn, whenever 30 or less damage is done to Onix (after applying Weakness and Resistance), prevent that damage. (Any other effects of attacks still happen.)"}
 ]);assert.deepEqual(card.weaknesses,[{type:'Grass',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless','Colorless','Colorless']);scenarios++;
 // Rock Throw's fixed 10 and Fighting Energy cost.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-97']);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.deepEqual(g.players[0].active.energies,['base1-97']);scenarios++;}
 // Typed Fighting costs cannot be paid by Double Colorless alone.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96','base1-96']);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Harden prevents exactly 30 after Weakness/Resistance have been applied.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-97','base1-97']);g.players[1].active=unit('base1-1',['base1-101','base1-101','base1-101']);act(g,0,'attack',{attackIndex:1});setCoin(g,false);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);scenarios++;}
 // A 20-damage Grass attack becomes 40 against Onix's Grass Weakness, which
 // exceeds Harden's 30 threshold and is not prevented.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-97','base1-97']);g.players[1].active=unit('base1-54',['base1-99','base1-99']);act(g,0,'attack',{attackIndex:1});setCoin(g,false);act(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,40);scenarios++;}
 // Damage is prevented but Foul Gas's separate Confusion effect still occurs.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-97','base1-97']);g.players[1].active=unit('base1-51',['base1-99','base1-99']);act(g,0,'attack',{attackIndex:1});setCoin(g,false);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.status,'Confused');scenarios++;}
 // Harden expires after the opponent's next turn: first Low Kick is blocked,
 // then Onix attacks, and the following Low Kick damages it normally.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-97','base1-97']);g.players[1].active=unit('base1-52',['base1-97']);act(g,0,'attack',{attackIndex:1});act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
}
assert.equal(scenarios,48);
console.log(`PASS Onix Rock Throw and Harden threshold/timing/status/cost (${scenarios} reducer scenarios)`);
