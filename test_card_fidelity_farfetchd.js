'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-27',format:'classic',deckSize:60,prizes:6,energy:'base1-98',dce:'base1-96',fighting:'base1-97',opponent:'base1-7'},
 {id:'base4-40',format:'online-preview',deckSize:60,prizes:6,energy:'base4-126',dce:'base4-124',fighting:'base4-125',opponent:'base4-8'},
 {id:'base4-40',format:'online-preview',deckSize:40,prizes:4,energy:'base4-126',dce:'base4-124',fighting:'base4-125',opponent:'base4-8'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.deckSize,prizeCount:v.prizes,seed:17});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.energy);p.prizes=Array(v.prizes).fill(v.energy);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.players[0].active=unit(v.id);return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'invalid attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
function coin(g,heads){for(let seed=0;seed<10000;seed++){const next=(Math.imul(seed,1664525)+1013904223)>>>0;if((next>=0x80000000)===heads){g.rngState=seed;return;}}throw Error('coin seed not found');}
function nextTurn(g){act(g,g.turn,'end_turn');}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-27');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 must match Base Set attack text and costs');
 assert.deepEqual(printed.weaknesses,base.weaknesses);assert.deepEqual(printed.resistances,base.resistances);scenarios++;
 const [leek,pot]=printed.attacks;
 assert.equal(leek.name,'Leek Slap');assert.deepEqual(leek.cost,['Colorless']);assert.equal(leek.damage,'30');
 assert.match(leek.text,/If tails, this attack does nothing\. Either way, you can't use this attack again as long as Farfetch'd stays in play/);
 assert.equal(pot.name,'Pot Smash');assert.deepEqual(pot.cost,['Colorless','Colorless','Colorless']);assert.equal(pot.damage,'30');assert.equal(pot.text,'');scenarios++;

 // Leek Slap does 30 on heads and marks tails just as surely as heads.
 for(const heads of [true,false]){const g=game(v);g.players[0].active.energies=[v.energy];coin(g,heads);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,heads?30:0);assert.equal(g.players[0].active.leekSlapUsed,true);assert.equal(g.pendingDecision,null);scenarios++;}
 // The lock belongs to the Pokémon in play, not its Active/Bench position.
 {const g=game(v);g.players[0].active.energies=[v.energy];coin(g,false);act(g,0,'attack',{attackIndex:0});
  const same=g.players[0].active,other=unit('base1-3');g.players[0].bench.push(same);g.players[0].active=other;g.players[0].active=g.players[0].bench.shift();
  nextTurn(g);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // A replacement Pokémon is a different in-play card and can use the attack.
 {const g=game(v);g.players[0].active.energies=[v.energy];coin(g,false);act(g,0,'attack',{attackIndex:0});
  g.players[0].active=unit(v.id,[v.energy]);nextTurn(g);coin(g,true);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.leekSlapUsed,true);scenarios++;}
 // Pot Smash accepts any three Colorless units; Double Colorless pays two.
 {const g=game(v);g.players[0].active.energies=[v.energy,v.energy,v.energy];act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.dce,v.energy];act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.dce];reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // The imported Fighting Resistance affects incoming damage; it does not
 // alter the Colorless damage dealt by either attack.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id,[v.energy]);g.players[1].active=unit(v.opponent,[v.fighting]);
  act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);scenarios++;}
}
console.log(`PASS Farfetch'd Leek Slap and Pot Smash: ${scenarios} reducer scenarios`);
