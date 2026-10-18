'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const ATTACK=require('./attack_effects_core');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v083');
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
const power={Grass:'base1-99',Water:'base1-102',Fire:'base1-98',Fighting:'base1-97',Psychic:'base1-101',Lightning:'base1-100',Darkness:'neo1-104',Colorless:'base1-99',Metal:'neo1-19'};
function attack(id,name){const a=CATALOG.get(id)?.attacks?.find(x=>x.name===name);assert.ok(a);return a;}
const flips=(...choices)=>{const seq=[...choices];return ()=>{assert.ok(seq.length,'too many flips');return seq.shift();};};
function effect(id,name,sequence=[]){
 const a=attack(id,name),program=ATTACK.compile(a);return ATTACK.resolve(program,flips(...sequence));
}
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=attack(id,name),p=ATTACK.compile(a);
 assert.equal(p?.kind,kind==='spark'?'bench-target':kind==='fire-blast'?'energy-discard':'neo83:'+kind);
 assert.equal(ATTACK.compile({...a,text:a.text+' not printed'}),null,key+' strict text signature');
}
assert.equal(effect('neo3-24','Quick Attack',[true]).damage,30);
assert.equal(effect('neo3-24','Quick Attack',[false]).damage,10);
assert.equal(effect('neo3-29','Screech').screech,true);
assert.deepEqual([effect('neo3-29','Poison Bite').status,effect('neo3-29','Poison Bite').healFromDamage],['Poisoned','half']);
assert.equal(effect('neo3-37','Rising Lunge',[true]).damage,20);
assert.equal(effect('neo3-37','Rising Lunge',[false]).damage,10);
assert.equal(effect('neo3-51','Toxic Saliva',[true]).poisonDamage,20);
assert.equal(effect('neo3-51','Toxic Saliva',[false]).status,undefined);
assert.equal(effect('neo4-22','Healing Light').healOwnTeam,10);
assert.deepEqual(effect('neo4-22','Protective Wave',[true]).shield,{allEffects:true});
assert.equal(effect('neo4-22','Protective Wave',[false]).shield,undefined);
assert.equal(effect('neo4-34','High Voltage',[true]).lockTrainers,true);
assert.equal(effect('neo4-34','High Voltage',[false]).lockTrainers,undefined);
assert.equal(effect('neo4-48','Thunder Needle',[true,true,false]).status,'Paralyzed');
assert.equal(effect('neo4-48','Thunder Needle',[true,false,false]).status,undefined);
assert.equal(effect('neo4-48','Thunder Needle',[true,true,true]).damage,60);
assert.equal(ATTACK.compile(attack('neo4-23','Spark')).benchDamage,10);
assert.equal(ATTACK.compile(attack('neo4-50','Fire Blast')).quantity,1);

function game(id,name){
 const deck=list('base1:Brushfire');
 const g=createGame({decks:[deck,deck],format:'online-preview',seed:82});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=12;g.rngState=582;
 g.players[0].active=U(id,{energies:attack(id,name).cost.map(type=>power[type])});
 g.players[1].active=U('base1-2',{energies:[]});
 g.players[0].bench=[U('base1-44',{damage:20})];
 g.players[1].bench=[U('base1-44')];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload){
 const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);
}
function use(g,name){
 const i=CATALOG.get(g.players[0].active.id).attacks.findIndex(x=>x.name===name);
 send(g,0,'attack',{attackIndex:i});
}
{
 const g=game('neo4-22','Healing Light');g.players[0].active.damage=30;
 use(g,'Healing Light');assert.equal(g.players[0].active.damage,20);
 assert.equal(g.players[0].bench[0].damage,10);
}
{
 const g=game('neo4-22','Protective Wave');
 // Find the shielded heads result without bypassing the actual reducer RNG.
 let seen=false;
 for(let seed=0;seed<250&&!seen;seed++){
  const t=game('neo4-22','Protective Wave');t.rngState=seed*6553600;
  use(t,'Protective Wave');
  if(t.coinFlips.at(-1)?.result==='heads'){
   assert.equal(t.players[0].active.shield?.allEffects,true);seen=true;
  }
 }
 assert.ok(seen,'shield outcome');
}
{
 const g=game('neo4-23','Spark');
 use(g,'Spark');assert.ok(g.pendingDecision,'Spark target choice');
 assert.equal(g.pendingDecision.actor,0);
 const decision=g.pendingDecision;
 send(g,0,'choose',{decisionId:decision.id,selected:['bench:0']});
 assert.equal(g.players[1].bench[0].damage,10);
 assert.ok(g.players[1].active.damage>0);
}
{
 const g=game('neo4-50','Fire Blast');
 use(g,'Fire Blast');const d=g.pendingDecision;
 assert.ok(d,'exact Energy discard choice');
 assert.equal(d.actor,0);
 const energyBefore=g.players[0].active.energies.length;
 send(g,0,'choose',{decisionId:d.id,selected:[d.options[0].id]});
 assert.equal(g.players[0].active.energies.length,energyBefore-1);
 assert.equal(g.players[0].discard.length,1);
 assert.equal(g.players[1].active.damage,50);
}
console.log('PASS Neo v0.83: 11 exact signatures, coin and shield outcomes, Spark choice and Fire Blast payment');
