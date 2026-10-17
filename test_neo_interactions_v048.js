'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const F=require('./classic_format');const {ClassicLocalService}=require('./classic_local_service');
const {ids}=require('./neo_v048_pool');const {list}=require('./authentic_decks');
const U=(id,p={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...p});
const E={fire:'base1-98',grass:'base1-99',lightning:'base1-100',water:'base1-102',fighting:'base1-97',darkness:'neo1-104'};
function match(id,enemy='base1-58',seed=331){const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:seed+15});g.phase='game';g.round=4;g.turn=0;g.turnSerial=8;g.rngState=seed;g.players[0].active=U(id,{energies:[E.fire,E.fire,E.fire,E.fire,E.grass,E.grass,E.lightning,E.water,E.fighting,E.darkness]});g.players[1].active=U(enemy,{energies:[E.fire,E.lightning,E.water,E.grass]});g.players[0].bench=[U('base1-3'),U('base1-58')];g.players[1].bench=[U('base1-3'),U('base1-58')];g.players[0].hand=[E.fire,E.grass,E.water];g.players[0].discard=[E.fire,E.lightning];g.players[0].prizes=['base1-99','base1-98','base1-100','base1-101','base1-102','base1-97'];g.players[1].prizes=[...g.players[0].prizes];return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function hit(g,name){const i=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);assert.ok(i>=0,name);act(g,0,'attack',{attackIndex:i});}
function answer(g,values){const d=g.pendingDecision;assert.ok(d,'Expected decision');act(g,d.actor,'choose',{decisionId:d.id,selected:values});}
assert.equal(ids.length,21);
const pool=new ClassicLocalService().cardPool();for(const id of ids){const c=pool.find(x=>x.id===id);assert.ok(c?.supported,id+' must have all printed effects');assert.ok(F.isAllowed(id,{neo:true}),id+' must be Neo legal');assert.equal(F.isAllowed(id),false,'Neo printings stay out of Base–Rocket Classic');}
{
 const g=match('neo1-9','base1-3');g.players[0].active.energies=g.players[0].active.energies.filter(id=>id!==E.darkness);hit(g,'Elemental Blast');const d=g.pendingDecision;
 assert.equal(d.actor,0);assert.equal(d.min,3);
 const fires=d.options.filter(o=>o.label==='Fire Energy').slice(0,3).map(o=>o.id);
 const bad=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:fires}});assert.equal(bad.ok,false,'Three Fire Energy may not pay Fire/Water/Lightning');assert.ok(g.pendingDecision,'Failed payment cannot mutate game');
 const valid=['Fire Energy','Water Energy','Lightning Energy'].map(name=>d.options.find(o=>o.label===name).id);answer(g,valid);
 assert.ok(g.players[0].discard.includes(E.water));assert.ok(g.players[0].discard.includes(E.lightning));assert.equal(g.players[1].active.damage,90);
}
{
 const g=match('neo1-54','base1-58');g.players[0].active.energies=[E.grass];hit(g,'Growl');assert.equal(g.players[0].active.neo48Growl.sourceId,'base1-58');
 act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0,'Growl reduced the original 10 damage before weakness');
}
{
 let found=false;for(let seed=0;seed<100000&&!found;seed+=911){const g=match('neo1-43','base1-3',seed);g.players[0].active.damage=20;g.players[0].active.energies=g.players[0].active.energies.filter(id=>id!==E.darkness);hit(g,'Endure');if(!g.players[0].active.neo48Endure)continue;act(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active?.damage,30,'Endure leaves Phanpy at 10 HP on fatal attack');found=true;}
 assert.ok(found,'Heads outcome for Endure not found');
}
{
 const g=match('neo1-24','base1-3');hit(g,'Mean Look');assert.ok(g.players[1].active.neo48MeanLook);
 const result=applyCommand(g,1,{type:'retreat',payload:{slot:0}});assert.equal(result.ok,false,'Mean Look must prevent retreat');
 // Once Murkrow is Benched, the lock disappears without waiting a turn.
 g.players[0].active=U('base1-3');act(g,1,'retreat',{slot:0});assert.equal(g.players[1].active.id,'base1-3');
}
{
 const g=match('neo2-4','base1-3');g.players[0].active.energies=[E.fire,E.fire,E.darkness];hit(g,'Crunch');assert.ok(g.players[1].active.neo48CrunchUntil>g.turnSerial);
 // The attacked Pokémon stays Active until the user's next attack.
 g.turn=0;g.turnSerial=10;g.players[0].active=U('base1-58',{energies:[E.lightning]});
 act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,30+20+20,'Crunch increases later attacks by 20 after weakness');
}
{
 const g=match('neo1-12','base1-58');g.players[0].bench=[U('neo1-43')];g.players[1].bench=[U('neo1-17')];hit(g,'Zzzap');
 assert.equal(g.players[0].bench[0].damage,0);assert.equal(g.players[1].bench[0].damage,20,'Pokémon with Power takes 20');
}
{
 const g=match('neo2-18','base1-3');let result=null;
 for(let seed=0;seed<100000;seed+=911){const trial=structuredClone(g);trial.rngState=seed;hit(trial,'Triple Poison');if(trial.players[1].active.poison){result=trial;break;}}
 assert.ok(result);assert.equal(result.players[1].active.poisonDamage,30,'Triple Poison has 3 damage counters per turn');
}
{
 const patterns=new Set();for(let seed=0;seed<100000;seed+=911){
  const g=match('neo2-61','base1-3',seed);g.players[0].active.energies=[E.grass];hit(g,'Burst');
  const pattern=g.coinFlips.slice(-2).map(x=>x.result).join('-');patterns.add(pattern);
  if(pattern.endsWith('tails')){assert.equal(g.players[1].active.damage,0);assert.equal(g.players[0].active.damage,0);assert.equal(g.players[1].bench[0].damage,0);}
  if(pattern==='tails-heads'){assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active.damage,0);}
  if(pattern==='heads-heads'){assert.equal(g.players[1].active.damage,40);assert.ok(g.players[0].discard.includes('neo2-61'),'Self damage must KO Pineco');assert.equal(g.players[1].bench[0].damage,10);}
  if(patterns.size===4)break;
 }assert.equal(patterns.size,4,'Burst must cover all four 2-flip outcomes');
}
console.log('PASS Neo v0.48: 21 playable printings and interaction rules (payments, Endure, Growl, Mean Look, Crunch, Zzzap, Poison, Burst)');
