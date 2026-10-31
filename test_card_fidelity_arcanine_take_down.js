'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {compile}=require('./attack_effects_core');

const variants=[
 {id:'base1-23',format:'classic',fire:'base1-98',dce:'base1-96',grass:'base1-99'},
 {id:'base4-33',format:'online-preview',fire:'base4-126',dce:'base4-124',grass:'base4-127'}
];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire');
 const g=createGame({decks:[deck,deck],format:v.format,seed:20261031});
 g.phase='game';g.round=4;g.turnSerial=8;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(6).fill(v.grass);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),attack=c.attacks.find(a=>a.name==='Take Down');
 assert.ok(attack);assert.deepEqual(attack.cost,['Fire','Fire','Colorless','Colorless']);
 assert.equal(attack.damage,'80');assert.equal(attack.text,'Arcanine does 30 damage to itself.');
 const effect=compile(attack);assert.equal(effect.kind,'recoil');assert.equal(effect.damage,80);assert.equal(effect.selfDamage,30);assert.equal(effect.subject,'Arcanine');scenarios++;

 // Two Fire Energy plus Double Colorless satisfy the exact printed cost.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.fire,v.dce]);act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,80);assert.equal(g.players[0].active.damage,30);assert.equal(g.pendingDecision,null);scenarios++;}

 // Generic Energy cannot substitute for either of the two printed Fire units.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.dce,v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios++;}

 // Weakness doubles Take Down's damage to a Grass Defending Pokémon only;
 // the attacker's printed recoil remains 30.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.fire,v.dce]);g.players[1].active=unit('base1-44');
  // A large synthetic damage reduction makes doubled damage observable
  // without immediately removing this 40 HP Pokémon from play.
  g.players[1].active.shield={reduce:130,expires:g.turnSerial+2};act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,30,'80 doubled by Grass Weakness, then reduced by 130');assert.equal(g.players[0].active.damage,30);scenarios++;}

 // An existing shield that prevents attack damage protects the target, but
 // does not cancel the distinct self-damage instruction.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.fire,v.dce]);g.players[1].active.shield={preventDamage:true,expires:g.turnSerial+2};
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].active.damage,30);scenarios++;}

 // Both Active Pokémon are Knocked Out at the same attack checkpoint. The
 // reducer must keep both Prize claims and require both owners to promote.
 if(v.format==='classic'){
  const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.fire,v.dce],70);g.players[0].bench=[unit('base1-44')];
  g.players[1].active=unit('base1-44',[],10);g.players[1].bench=[unit('base1-58')];
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].active,null);assert.equal(g.players[1].active,null);
  assert.equal(g.pendingDecision?.kind,'prize-card');assert.equal(g.pendingDecision.actor,1);
  act(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['prize:0']});
  assert.equal(g.pendingDecision?.kind,'prize-card');assert.equal(g.pendingDecision.actor,0);
  act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['prize:0']});
  assert.equal(g.players[0].active.id,'base1-44');assert.equal(g.players[1].active.id,'base1-58');
  assert.equal(g.players[0].prizes.length,5);assert.equal(g.players[1].prizes.length,5);scenarios++;
 }
}
console.log(`PASS Arcanine Take Down: ${scenarios} reducer scenarios`);
