'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-45',format:'classic',grass:'base1-99',fire:'base1-98',water:'base1-102',opponent:'base1-2'},
 {id:'base1-45',format:'neo-theme',grass:'base1-99',fire:'base1-98',water:'base1-102',opponent:'base1-2'},
 {id:'base1-45',format:'online-preview',grass:'base1-99',fire:'base1-98',water:'base1-102',opponent:'base1-2',size:60},
 {id:'base1-45',format:'online-preview',grass:'base1-99',fire:'base1-98',water:'base1-102',opponent:'base1-2',size:40},
 {id:'base4-68',format:'online-preview',grass:'base4-127',fire:'base4-128',water:'base4-130',opponent:'base4-2',size:60},
 {id:'base4-68',format:'online-preview',grass:'base4-127',fire:'base4-128',water:'base4-130',opponent:'base4-2',size:40}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(v){
 const size=v.size||60,deck=Array(4).fill(v.id).concat(Array(size-4).fill(v.grass));
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:81});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.opponent);p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(size===40?4:6).fill(v.grass);p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.coinFlips=[];return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'wrongly typed attack payment must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}

let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),attack=c.attacks[0];
 assert.equal(c.name,'Caterpie');assert.equal(c.hp,'40');assert.deepEqual(c.types,['Grass']);
 assert.equal(attack.name,'String Shot');assert.deepEqual(attack.cost,['Grass']);assert.equal(attack.damage,'10');
 assert.equal(attack.text,'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.');scenarios++;

 // Heads apply paralysis after the printed 10 damage with no player choice.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.rngState=50000;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'heads');
  assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.status,'Paralyzed');
  assert.equal(g.players[1].active.lastAttackImpact.status,'Paralyzed');assert.equal(g.pendingDecision,null);scenarios++;}
 // Tails deal the same damage and leave an existing Special Condition alone.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.players[1].active.status='Asleep';g.rngState=0;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.coinFlips.at(-1).result,'tails');
  assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.status,'Asleep');
  assert.equal(g.players[1].active.lastAttackImpact.status,null);assert.equal(g.pendingDecision,null);scenarios++;}
 // Damage-only protection does not stop the separate paralysis effect.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.players[1].active.shield={preventDamage:true,expires:g.turnSerial+2};g.rngState=50000;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,'Paralyzed');scenarios++;}
 // Protection that prevents attack effects stops paralysis as well as damage.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.players[1].active.shield={preventDamage:true,allEffects:true,expires:g.turnSerial+2};g.rngState=50000;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,null);scenarios++;}
 // One Grass is the typed cost; Fire cannot substitute for it.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Paralysis lasts through the affected player's next turn, prevents attacking,
 // and clears at that player's end-of-turn checkup.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass]);g.players[1].active=unit(v.opponent,Array(4).fill(v.water));g.rngState=50000;
  act(g,0,'attack',{attackIndex:0});assert.equal(g.turn,1);assert.equal(g.players[1].active.status,'Paralyzed');
  reject(g,1,'attack',{attackIndex:0});act(g,1,'end_turn');assert.equal(g.players[1].active.status,null);scenarios++;}
}
console.log(`PASS Caterpie String Shot costs, coin/status outcomes, prevention and paralysis timing (${scenarios} reducer scenarios)`);
