'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-54',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-81',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:83});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Metapod attack must be rejected');assert.deepEqual(g,before,'rejected Metapod attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,ok=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){ok=false;break;}}if(ok)return seed;}throw Error('coin sequence not found');}
function setCoins(g,flips){g.rngState=seedFor(flips);g.coinFlips=[];g.coinSeq=0;}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Metapod');assert.equal(card.hp,'70');assert.deepEqual(card.types,['Grass']);assert.deepEqual(card.attacks,[
  {name:'Stiffen',cost:['Colorless','Colorless'],damage:'',text:"Flip a coin. If heads, prevent all damage done to Metapod during your opponent's next turn. (Any other effects of attacks still happen.)"},
  {name:'Stun Spore',cost:['Grass','Grass'],damage:'20',text:'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'}
 ]);assert.deepEqual(card.weaknesses,[{type:'Fire',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless','Colorless']);scenarios++;
 // Stiffen uses one Double Colorless Energy and its heads shield prevents
 // damage from the opponent's next attack; tails gives no shield.
 for(const heads of [false,true]){const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);g.players[1].active=unit('base1-52',['base1-97']);setCoins(g,[heads]);act(g,0,'attack',{attackIndex:0});act(g,g.turn,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,heads?0:20);assert.deepEqual(g.players[0].active.energies,['base1-96']);scenarios++;}
 // Other attack effects still happen through a heads Stiffen shield: Foul Gas
 // tails applies Confusion while its 10 attack damage is prevented.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);g.players[1].active=unit('base1-51',['base1-99','base1-99']);setCoins(g,[true]);act(g,0,'attack',{attackIndex:0});setCoins(g,[false]);act(g,g.turn,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.status,'Confused');scenarios++;}
 // Stun Spore always deals 20; heads replaces Confusion with Paralysis while
 // tails leaves the previous Special Condition unchanged.
 for(const heads of [false,true]){const g=game(format,size);g.players[0].active=unit(c.id,['base1-99','base1-99']);g.players[1].active=unit('base1-1',[],0,'Confused');setCoins(g,[heads]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.status,heads?'Paralyzed':'Confused');scenarios++;}
 // Stiffen's shield lasts for exactly the opponent's next turn: it blocks that
 // turn's Low Kick, then expires before the following opposing attack.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96','base1-99','base1-99']);g.players[1].active=unit('base1-52',['base1-97']);setCoins(g,[true]);act(g,0,'attack',{attackIndex:0});act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);setCoins(g,[false]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
 // Stun Spore needs two Grass; Double Colorless alone cannot pay it. Stiffen
 // also cannot be declared without its two Colorless units.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(format,size);g.players[0].active=unit(c.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
assert.equal(scenarios,54);
console.log(`PASS Metapod Stiffen shield window/effects and Stun Spore coin/status/cost (${scenarios} reducer scenarios)`);
