'use strict';
const assert=require('node:assert/strict');
const A=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./promo_attack_batch_v086');
const EN={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99',Metal:'neo1-19'};
const U=(id,opts={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...opts});
const attack=(id,name)=>{const x=CATALOG.get(id)?.attacks?.find(a=>a.name===name);assert.ok(x,id+' '+name);return x;};
function dice(...seq){const x=[...seq];return ()=>{assert.ok(x.length,'unexpected RNG');return x.shift();};}
const roll=(id,name,flips=[],ctx={})=>A.resolve(A.compile(attack(id,name)),dice(...flips),ctx);
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=attack(id,name),p=A.compile(a);
 assert.equal(p?.kind,effect==='recharge'?'afternoon-nap':effect==='telekinesis'?'target-any':'promo86:'+effect);
 assert.equal(A.compile({...a,text:a.text+' altered'}),null,'strict printed text: '+key);
}
assert.deepEqual(roll('basep-2','Light Screen').shield,{half:true});
assert.equal(roll('basep-7','First Aid').healSelf,10);
assert.equal(roll('basep-8','Psywave',[],{enemyEnergy:4}).damage,40);
assert.equal(roll('basep-9','Psywave',[],{enemyEnergy:2}).damage,20);
assert.equal(roll('basep-15','3-D Attack',[true,false,true]).damage,40);
assert.equal(roll('basep-20','Fury Swipes',[true,true,false]).damage,20);
assert.equal(roll('basep-22','Diamond Dust',[true]).status,'Paralyzed');
assert.equal(roll('basep-22','Diamond Dust',[false]).benchSide,undefined);
assert.equal(roll('basep-31','Eek').draw,2);
assert.equal(roll('basep-33','Metal Pincer',[true,true,false]).damage,50);
assert.equal(roll('basep-37','Repeating Kick',[true,true,false]).damage,40);
assert.equal(roll('basep-39','Pain Split',[],{selfCounters:3}).placeCounters,3);
assert.equal(roll('basep-43','Seething Anger',[true,false,true],{selfCounters:3}).damage,40);
assert.equal(roll('basep-45','Slashing Strike').disableThisAttack,true);
assert.equal(roll('basep-49','Roll Over',[true]).selfStatus,'Asleep');
assert.equal(roll('basep-49','Roll Over',[false]).status,undefined);
assert.equal(roll('basep-50','Leaf Slice',[true,true]).damage,40);
assert.equal(roll('basep-50','Leaf Slice',[false,false]).damage,0);
assert.equal(roll('basep-52','Sacred Fire',[true]).damage,60);
assert.equal(roll('basep-52','Sacred Fire',[false]).damage,20);
assert.equal(roll('basep-53','Hypno Wave',[false]).status,'Asleep');
assert.equal(roll('basep-53','Hypno Wave',[true]).damage,50);
function game(id,name){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed:824});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=12;g.rngState=448;
 g.players[0].active=U(id,{energies:attack(id,name).cost.map(t=>EN[t])});
 g.players[1].active=U('base1-2',{energies:['base1-99','base1-99','base1-99']});
 for(const p of g.players){p.bench=[U('base1-44')];p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+' '+r.error);}
function run(g,name){const index=CATALOG.get(g.players[0].active.id).attacks.findIndex(x=>x.name===name);send(g,0,'attack',{attackIndex:index});}
{
 const g=game('basep-2','Light Screen');run(g,'Light Screen');
 assert.equal(g.players[0].active.shield?.half,true);
}
{
 const g=game('basep-12','Telekinesis');run(g,'Telekinesis');
 const d=g.pendingDecision;assert.equal(d?.actor,0);
 assert.ok(d.options.some(o=>o.id==='bench:0'));
 send(g,0,'choose',{decisionId:d.id,selected:['bench:0']});
 assert.equal(g.players[1].bench[0].damage,30);
 assert.equal(g.players[1].active.damage,0);
}
{
 const g=game('basep-39','Pain Split');g.players[0].active.damage=30;run(g,'Pain Split');
 assert.equal(g.players[1].active.damage,30);
}
{
 const g=game('basep-31','Eek');run(g,'Eek');
 assert.equal(g.players[0].hand.length,2);
}
{
 const g=game('basep-45','Slashing Strike');run(g,'Slashing Strike');
 assert.ok(g.players[0].active.gymAttackCooldown?.expires>g.turnSerial);
}
{
 const g=game('basep-4','Recharge');run(g,'Recharge');
 const d=g.pendingDecision;assert.equal(d?.actor,0);
 const before=g.players[0].active.energies.length;
 send(g,0,'choose',{decisionId:d.id,selected:[d.options[0].id]});
 assert.equal(g.players[0].active.energies.length,before+1);
}
console.log('PASS promo86: 19 exact signatures, historical coin outcomes, six reducer interactions');
