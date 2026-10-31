'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-46',format:'classic',grass:'base1-99',fire:'base1-98',dce:'base1-96',opponent:'base1-2',weak:'base1-45'},
 {id:'base1-46',format:'neo-theme',grass:'base1-99',fire:'base1-98',dce:'base1-96',opponent:'base1-2',weak:'base1-45'},
 {id:'base1-46',format:'online-preview',grass:'base1-99',fire:'base1-98',dce:'base1-96',opponent:'base1-2',weak:'base1-45',size:60},
 {id:'base1-46',format:'online-preview',grass:'base1-99',fire:'base1-98',dce:'base1-96',opponent:'base1-2',weak:'base1-45',size:40},
 {id:'base4-69',format:'online-preview',grass:'base4-127',fire:'base4-128',dce:'base4-124',opponent:'base4-2',weak:'base4-68',size:60},
 {id:'base4-69',format:'online-preview',grass:'base4-127',fire:'base4-128',dce:'base4-124',opponent:'base4-2',weak:'base4-68',size:40}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){const size=v.size||60,deck=Array(4).fill(v.id).concat(Array(size-4).fill(v.grass));
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:89});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.opponent);p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(size===40?4:6).fill(v.grass);p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'unpaid Scratch must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}

let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),a=c.attacks[0];assert.equal(c.name,'Charmander');assert.equal(c.hp,'50');assert.deepEqual(c.types,['Fire']);
 assert.equal(a.name,'Scratch');assert.deepEqual(a.cost,['Colorless']);assert.equal(a.damage,'10');assert.equal(a.text,'');scenarios++;
 const same=CATALOG.get(v.id==='base1-46'?'base4-69':'base1-46').attacks[0];
 assert.deepEqual({name:a.name,cost:a.cost,damage:a.damage,text:a.text},{name:same.name,cost:same.cost,damage:same.damage,text:same.text});scenarios++;
 // A one-unit Colorless cost accepts any Energy type and never asks which
 // equivalent payment to use. Scratch still deals only its printed 10.
 for(const energy of [v.grass,v.fire]){const g=game(v);g.players[0].active=unit(v.id,[energy]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);assert.equal(g.pendingDecision,null);assert.equal(g.coinFlips?.length||0,0);scenarios++;}
 // Double Colorless pays the one-unit cost but does not add attack damage.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);assert.equal(g.pendingDecision,null);scenarios++;}
 // Charmander's Fire type applies the defending Grass Pokémon's ×2 Weakness
 // even though Scratch's printed Energy cost is Colorless.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.players[1].active=unit(v.weak);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,20);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
console.log(`PASS Charmander Scratch fixed damage, Colorless payment, and Fire Weakness (${scenarios} reducer scenarios)`);
