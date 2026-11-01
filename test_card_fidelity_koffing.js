'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {format:'classic',deckSize:60,prizes:6,grass:'base1-99',dce:'base1-96'},
 {format:'neo-theme',deckSize:60,prizes:6,grass:'base1-99',dce:'base1-96'},
 {format:'online-preview',deckSize:60,prizes:6,grass:'base1-99',dce:'base1-96'},
 {format:'online-preview',deckSize:40,prizes:4,grass:'base1-99',dce:'base1-96'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){const deck=list('base1:Brushfire').slice(0,v.deckSize);const g=createGame({format:v.format,decks:[deck,deck],deckSize:v.deckSize,prizeCount:v.prizes,seed:67});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(v.prizes).fill(v.grass);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Koffing attack must be rejected');assert.deepEqual(g,before,'rejected Koffing attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,ok=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){ok=false;break;}}if(ok)return seed;}throw Error('coin sequence not found');}
function setCoins(g,flips){g.rngState=seedFor(flips);g.coinFlips=[];g.coinSeq=0;}

let scenarios=0;
for(const v of variants){
 const c=CATALOG.get('base1-51');assert.equal(c.name,'Koffing');assert.equal(c.hp,'50');assert.deepEqual(c.types,['Grass']);
 assert.deepEqual(c.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),[
  {name:'Foul Gas',cost:['Grass','Grass'],damage:'10',text:'Flip a coin. If heads, the Defending Pokémon is now Poisoned; if tails, it is now Confused.'}
 ]);scenarios++;
 // Both coin outcomes deal the fixed 10. Heads adds Poison and its normal
 // between-turn damage; tails adds Confusion instead.
 {const g=game(v);g.players[0].active=unit('base1-51',[v.grass,v.grass]);g.players[1].active=unit('base1-58');setCoins(g,[true]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.status,null);assert.equal(g.coinFlips.length,1);scenarios++;}
 {const g=game(v);g.players[0].active=unit('base1-51',[v.grass,v.grass]);g.players[1].active=unit('base1-58');g.players[1].active.status='Asleep';setCoins(g,[false]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.status,'Confused');assert.equal(g.players[1].active.poison,false);assert.equal(g.coinFlips.length,1);scenarios++;}
 // Confusion governs the target's following attack: tails self-damages, while
 // heads allows the generic one-Colorless Gnaw to hit Koffing. Double
 // Colorless pays the cost but remains attached on both outcomes.
 for(const succeeds of [false,true]){const g=game(v);g.players[0].active=unit('base1-51',[v.grass,v.grass]);g.players[1].active=unit('base1-58',[v.dce]);setCoins(g,[false]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,'Confused');setCoins(g,[succeeds]);act(g,g.turn,'attack',{attackIndex:0});assert.deepEqual(g.players[1].active.energies,[v.dce]);
  assert.equal(g.players[1].active.damage,succeeds?10:30);assert.equal(g.players[0].active.damage,succeeds?10:0);scenarios++;}
 // Grass is a typed two-card cost; Colorless and Double Colorless cannot pay
 // either Grass requirement, and an invalid attack leaves state unchanged.
 {const g=game(v);g.players[0].active=unit('base1-51',[v.grass,v.grass]);act(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit('base1-51',[v.grass,v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit('base1-51');reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Psychic Weakness doubles damage from a Psychic-type attacker.
 {const g=game(v);g.players[0].active=unit('base1-49',[v.dce]);g.players[1].active=unit('base1-51');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
}
console.log(`PASS Koffing Foul Gas coin/status, Grass cost, confusion follow-up and Psychic Weakness (${scenarios} reducer scenarios)`);
