'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-29',format:'classic',deckSize:60,prizes:6,psychic:'base1-101',opponentEnergy:['base1-96','base1-98','base1-99','base1-100']},
 {id:'base4-43',format:'online-preview',deckSize:60,prizes:6,psychic:'base4-129',opponentEnergy:['base1-96','base1-98','base1-99','base1-100']},
 {id:'base4-43',format:'online-preview',deckSize:40,prizes:4,psychic:'base4-129',opponentEnergy:['base1-96','base1-98','base1-99','base1-100']}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.deckSize,prizeCount:v.prizes,seed:37});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.psychic);p.prizes=Array(v.prizes).fill(v.psychic);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.players[0].active=unit(v.id);g.players[1].active.energies=[...v.opponentEnergy];return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
function coin(g,heads){for(let seed=0;seed<10000;seed++){const next=(Math.imul(seed,1664525)+1013904223)>>>0;if((next>=0x80000000)===heads){g.rngState=seed;return;}}throw Error('coin seed not found');}
function passOpponentTurn(g,asleepHeads){coin(g,asleepHeads);act(g,g.turn,'end_turn');}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-29');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 must match Base Set attack text and costs');
 assert.equal(printed.attacks[0].text,'The Defending Pokémon is now Asleep.');
 assert.equal(printed.attacks[1].text,"You can't use this attack unless the Defending Pokémon is Asleep.");
 assert.equal(printed.attacks[1].damage,'50');scenarios++;

 // Hypnosis pays Psychic, deals no damage, and applies Sleep before the
 // immediate Pokémon Checkup at the end of the attacker's turn.
 {const g=game(v);g.players[0].active.energies=[v.psychic];coin(g,false);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,'Asleep');assert.equal(g.players[1].active.damage,0);assert.equal(g.turn,1);scenarios++;}
 // Heads during that Checkup wakes the target before the opponent's turn.
 {const g=game(v);g.players[0].active.energies=[v.psychic];coin(g,true);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,null);scenarios++;}
 // Existing Poison coexists with Sleep; the end-of-turn Checkup still deals
 // its Poison damage while retaining Sleep on tails.
 {const g=game(v);g.players[0].active.energies=[v.psychic];g.players[1].active.poison=true;g.players[1].active.poisonDamage=10;coin(g,false);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,'Asleep');assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.damage,10);scenarios++;}
 // Dream Eater is illegal against an Awake target and leaves the game intact.
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic];reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Its printed two-Psychic cost is not satisfied by one Psychic, even when
 // the Defending Pokémon is asleep.
 {const g=game(v);g.players[0].active.energies=[v.psychic];g.players[1].active.status='Asleep';reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Hypnosis can enable Dream Eater on the next turn only if the Defending
 // Pokémon remains Asleep through both intervening checkups. Chansey's
 // printed Psychic Resistance reduces Dream Eater from 50 to 20.
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic];coin(g,false);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,'Asleep');reject(g,1,'attack',{attackIndex:0});
  passOpponentTurn(g,false);assert.equal(g.turn,0);assert.equal(g.players[1].active.status,'Asleep');coin(g,false);act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.status,'Asleep');scenarios++;}
 // If the first Checkup wakes the target, Dream Eater stays unavailable.
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic];coin(g,true);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,null);act(g,1,'end_turn');reject(g,0,'attack',{attackIndex:1});scenarios++;}
}
console.log(`PASS Haunter Hypnosis and Dream Eater: ${scenarios} reducer scenarios`);
