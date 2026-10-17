'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const P=require('./classic_power_core'),F=require('./classic_format');
const {ClassicLocalService}=require('./classic_local_service');
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(id){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:111});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=14;g.rngState=100;
 g.players[0].active=U(id);g.players[0].bench=[U('base1-46'),U('base1-3')];
 g.players[1].active=U('base1-58');g.players[1].bench=[U('base1-3')];
 g.players[0].hand=['base1-102','base1-98','base1-102'];g.players[1].hand=['base1-80','base1-98','base1-99'];
 g.players[0].discard=['base1-98'];g.players[1].discard=[];
 for(const p of g.players){p.prizes=Array(6).fill('base1-99');p.deck=['base1-98','base1-99','base1-98','base1-100','base1-98','base1-102','base1-99','base1-98'];}
 return g;
}
function send(g,type,payload={}){const r=applyCommand(g,0,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,selected){const d=g.pendingDecision;assert.ok(d);const r=applyCommand(g,d.actor,{type:'choose',payload:{decisionId:d.id,selected:selected??[d.options[0].id]}});assert.equal(r.ok,true,r.error);}
const pool=new ClassicLocalService().cardPool();
for(const id of require('./neo_v052_pool').ids){assert.ok(pool.find(c=>c.id===id)?.supported,id);assert.equal(F.isAllowed(id,{neo:true}),true);}
for(const name of ['Downpour','Fire Recharge','Glaring Gaze'])assert.ok(P.ACTIVATED.has(name));
for(const name of ['Berserk','Fire Boost'])assert.ok(P.ONPLAY.has(name));
{
 const g=game('neo1-5');send(g,'use_power',{slot:-1,powerIndex:0});
 assert.ok(g.pendingDecision.options.every(x=>x.label==='Water Energy'));choose(g,['hand:0']);
 assert.ok(g.players[0].discard.includes('base1-102'));
 send(g,'use_power',{slot:-1,powerIndex:0});choose(g,['hand:1']);
 assert.equal(g.pendingDecision,null,'Downpour is repeatable');
}
{
 const g=game('neo1-17');send(g,'use_power',{slot:-1,powerIndex:0});
 if(g.pendingDecision){choose(g);choose(g,['slot:0']);assert.ok(g.players[0].bench[0].energies.includes('base1-98'));}
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1,powerIndex:0}}).ok,false,'Fire Recharge once per turn');
}
{
 const g=game('neo1-42');send(g,'use_power',{slot:-1,powerIndex:0});
 if(g.pendingDecision){assert.equal(g.pendingDecision.actor,0);choose(g);}
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1,powerIndex:0}}).ok,false,'Glaring Gaze once per turn');
}
const fake={flip:()=>true,shuffle:(_,a)=>a,unit:U,draw(){},log(){}};
{
 const g=game('neo1-4');const old=g.players[1].deck.length;
 P.played(g,0,-1,fake);
 assert.equal(g.players[1].deck.length,old-5,'Berserk mills the opponent on heads');
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<10000&&!(heads&&tails);seed+=977){
  const g=game('neo1-18');g.rngState=seed;
  g.players[0].deck=['base1-98','base1-98','base1-99','base1-98','base1-98','base1-98'];
  P.played(g,0,-1,fake);assert.ok(g.pendingDecision);
  choose(g,['choice:1']);
  if(!g.pendingDecision){tails=true;continue;}
  heads=true;
  const picks=g.pendingDecision.options.slice(0,3).map(o=>o.id);
  choose(g,picks);assert.equal(g.players[0].active.energies.length,3);
 }
 assert.ok(heads&&tails,'Fire Boost should execute heads and tails');
}
console.log('PASS v0.52: 5 Neo Genesis Powers and curated pool');
