'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {compile}=require('./attack_effects_core');

const variants=[
 {id:'base1-25',format:'classic',water:'base1-102',dce:'base1-96',grass:'base1-99'},
 {id:'base4-36',format:'online-preview',water:'base4-130',dce:'base4-124',grass:'base4-127'}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire');const g=createGame({decks:[deck,deck],format:v.format,seed:20261031});
 g.phase='game';g.round=4;g.turnSerial=8;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(6).fill(v.grass);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid attack must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),base=CATALOG.get('base1-25');
 assert.deepEqual(c.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 attack text and costs must match Base Set');
 const [aurora,ice]=c.attacks;assert.deepEqual(aurora.cost,['Water','Water','Colorless']);assert.equal(aurora.damage,'50');assert.equal(aurora.text,'');
 assert.deepEqual(ice.cost,['Water','Water','Colorless','Colorless']);assert.equal(ice.damage,'30');assert.equal(ice.text,'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.');
 assert.equal(compile(aurora).kind,'flat');assert.equal(compile(ice).kind,'coin-status-alias');scenarios++;

 // Aurora Beam: two Water and one differently typed Energy pay; blank text
 // means no pending choice or other effect.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.grass]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,50);assert.equal(g.players[1].active.status,null);assert.equal(g.pendingDecision,null);scenarios++;}

 // A Double Colorless card supplies the two generic units of Aurora Beam.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,50);scenarios++;}

 // One Water Energy cannot cover the attack's two typed Water symbols.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}

 // Water Weakness doubles Aurora Beam against a Fire Pokémon; the test
 // reduction keeps Arcanine alive so the exact damage remains observable.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.grass]);g.players[1].active=unit('base1-23');
  g.players[1].active.shield={reduce:10,expires:g.turnSerial+2};act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,90);scenarios++;}

 // Ice Beam's damage is fixed across both coin results; only heads Paralyses.
 for(const [seed,result,status] of [[50000,'heads','Paralyzed'],[0,'tails',null]]){
  const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);g.rngState=seed;
  act(g,0,'attack',{attackIndex:1});assert.equal(g.coinFlips.at(-1).result,result);assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.status,status);assert.equal(g.pendingDecision,null);scenarios++;
 }

 // Damage-only prevention does not prevent Ice Beam's separate status effect.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);g.rngState=50000;
  g.players[1].active.shield={preventDamage:true,expires:g.turnSerial+2};act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,'Paralyzed');scenarios++;}

 // Full attack-effect prevention blocks both Ice Beam damage and Paralysis.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);g.rngState=50000;
  g.players[1].active.shield={allEffects:true,expires:g.turnSerial+2};act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,null);scenarios++;}

 // A Paralyzed Defending Pokémon cannot attack on its turn; the condition
 // clears after that turn ends, matching the historical timing.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);g.rngState=50000;
  act(g,0,'attack',{attackIndex:1});assert.equal(g.turn,1);assert.equal(g.players[1].active.status,'Paralyzed');
  reject(g,1,'attack',{attackIndex:0});act(g,1,'end_turn');assert.notEqual(g.players[1].active?.status,'Paralyzed');scenarios++;}
}
console.log(`PASS Dewgong Aurora Beam/Ice Beam: ${scenarios} reducer scenarios`);
