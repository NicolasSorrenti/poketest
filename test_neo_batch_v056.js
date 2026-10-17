'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const FORMAT=require('./classic_format'),TRAINERS=require('./classic_trainer_core');
const unit=(id,e={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...e});
function make(id){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:17});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=16;g.rngState=123;
 g.players[0].active=unit('base1-58',{damage:60,energies:['base1-99','base1-99']});
 g.players[0].bench=[unit('base1-3')];
 g.players[1].active=unit('base1-58',{damage:0});
 g.players[1].bench=[unit('base1-3')];
 for(const p of g.players){p.discard=[];p.hand=[];p.prizes=Array(6).fill('base1-99');p.deck=['base1-98','base1-99','base1-100','base1-101'];}
 g.stadium={id,owner:0};g.players[0].stadium=id;return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
const pool=new ClassicLocalService().cardPool();
for(const id of require('./neo_v056_pool').ids){const c=CATALOG.get(id);assert.equal(TRAINERS.SUPPORTED.has(c.name),true,c.name);assert.ok(pool.find(x=>x.id===id)?.supported,id);assert.ok(FORMAT.isAllowed(id,{neo:true}));}
{
 const g=make('neo4-92');
 g.players[0].active.energies=['base1-99'];
 let r=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,false,'Broken Ground raises Basic retreat to two');
 g.players[0].active.energies.push('base1-99');
 send(g,0,'retreat',{slot:0});assert.equal(g.players[0].active.id,'base1-3');
 assert.equal(g.players[0].discard.filter(id=>id==='base1-99').length,2);
}
{
 const g=make('neo1-97');
 g.players[0].active=unit('base1-3',{energies:Array(4).fill('base1-99')});
 g.players[1].active=unit('base1-58');
 send(g,0,'attack',{attackIndex:1});
 assert.equal(g.players[1].active.damage,50,'Double-edge 80 becomes 50 after W/R with Sprout Tower');
}
{
 const g=make('neo3-61'),p=g.players[0];
 send(g,0,'use_stadium');assert.equal(p.stadiumUsedTurn,g.turnSerial);
 assert.ok([40,60].includes(p.active.damage),'Healing Field heals on heads but not tails');
 assert.equal(applyCommand(g,0,{type:'use_stadium',payload:{}}).ok,false,'Only once per turn');
}
{
 const g=make('neo4-100'),p=g.players[0],before=p.hand.length;
 send(g,0,'use_stadium');assert.ok([before,before+1].includes(p.hand.length));
 assert.equal(applyCommand(g,0,{type:'use_stadium',payload:{}}).ok,false);
}
{
 const g=make('neo4-95'),before=[...g.players[0].deck];
 send(g,0,'use_stadium');assert.deepEqual(g.players[0].deck,before,'Radio Tower never reorders top two');
 const own=publicView(g,0),enemy=publicView(g,1),spectator=publicView(g,null);
 assert.ok(own.players[0].privateMessages?.some(x=>x.includes('Radio Tower')));
 assert.equal(JSON.stringify(enemy).includes('Radio Tower: top'),false,'Opponent cannot see private deck peek');
 assert.equal(JSON.stringify(spectator).includes('Radio Tower: top'),false,'Spectators cannot see private deck peek');
}
console.log('PASS v0.56: five Neo Stadiums, damage order, retreat costs, actions, privacy');
