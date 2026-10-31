'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-47',format:'classic',fight:'base1-97',grass:'base1-99',fire:'base1-98'},
 {id:'base1-47',format:'neo-theme',fight:'base1-97',grass:'base1-99',fire:'base1-98'},
 {id:'base1-47',format:'online-preview',fight:'base1-97',grass:'base1-99',fire:'base1-98',size:60},
 {id:'base1-47',format:'online-preview',fight:'base1-97',grass:'base1-99',fire:'base1-98',size:40},
 {id:'base4-71',format:'online-preview',fight:'base4-125',grass:'base4-127',fire:'base4-126',size:60},
 {id:'base4-71',format:'online-preview',fight:'base4-125',grass:'base4-127',fire:'base4-126',size:40}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){const size=v.size||60,deck=Array(4).fill(v.id).concat(Array(size-4).fill(v.fight));
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:97});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.fight);p.prizes=Array(size===40?4:6).fill(v.fight);p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Fighting attack must be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}

let scenarios=0;
for(const v of variants){
 const c=CATALOG.get(v.id),dig=c.attacks[0],mud=c.attacks[1];assert.equal(c.name,'Diglett');assert.equal(c.hp,'30');assert.deepEqual(c.types,['Fighting']);
 assert.deepEqual(c.weaknesses,[{type:'Grass',value:'×2'}]);assert.deepEqual(c.resistances,[{type:'Lightning',value:'-30'}]);assert.deepEqual(c.retreatCost,[]);
 assert.equal(dig.name,'Dig');assert.deepEqual(dig.cost,['Fighting']);assert.equal(dig.damage,'10');assert.equal(dig.text,'');
 assert.equal(mud.name,'Mud Slap');assert.deepEqual(mud.cost,['Fighting','Fighting']);assert.equal(mud.damage,'30');assert.equal(mud.text,'');scenarios++;
 const other=CATALOG.get(v.id==='base1-47'?'base4-71':'base1-47');
 assert.deepEqual(c.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),other.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})));scenarios++;
 // Dig is one Fighting Energy for a fixed 10; its name does not imply a
 // damage-prevention effect on the Base Set/BS2 printings.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fight]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);assert.equal(g.pendingDecision,null);assert.equal(g.coinFlips?.length||0,0);scenarios++;}
 // Mud Slap requires two Fighting Energy and does its fixed 30 damage.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fight,v.fight]);act(g,0,'attack',{attackIndex:1});
  assert.equal(g.players[1].active.damage,30);assert.equal(g.pendingDecision,null);assert.equal(g.coinFlips?.length||0,0);scenarios++;}
 // Colorless cannot pay Dig's Fighting symbol; one Fighting cannot pay Mud Slap.
 {const g=game(v);g.players[0].active=unit(v.id,['base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.fight]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Fighting Weakness doubles Dig even though the attack has no rules text.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fight]);g.players[1].active=unit('base1-58');act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,20);scenarios++;}
 // Diglett's printed Lightning Resistance reduces a 10-damage Pikachu attack
 // to zero; its Grass Weakness doubles Caterpie's String Shot from 10 to 20.
 {const g=game(v);g.turn=1;g.players[1].active=unit('base1-58',[v.fire]);g.players[0].active=unit(v.id);act(g,1,'attack',{attackIndex:0});
  assert.equal(g.players[0].active.damage,0);scenarios++;}
 {const g=game(v);g.turn=1;g.players[1].active=unit('base1-45',[v.grass]);g.players[0].active=unit(v.id);g.rngState=0;act(g,1,'attack',{attackIndex:0});
  assert.equal(g.players[0].active.damage,20);assert.equal(g.players[0].active.status,null);scenarios++;}
}
console.log(`PASS Diglett Dig/Mud Slap costs and damage, print parity, weakness and resistance (${scenarios} reducer scenarios)`);
