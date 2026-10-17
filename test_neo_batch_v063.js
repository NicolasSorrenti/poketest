'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const FORMAT=require('./classic_format');
const U=(id,m={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...m});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:25});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=10;g.rngState=12;
 g.players[0].active=U('base1-20',{energies:['base1-100','base1-100']});
 g.players[0].bench=[U('base1-24',{under:['base1-46'],energies:['base1-98','neo1-105'],attachedTrainers:[{id:'neo1-99'}]})];
 g.players[1].active=U('base1-3');g.players[1].bench=[U('base1-58')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(24).fill('base1-99');}
 return g;
}
const send=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);};
const choice=(g,selected)=>{const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:selected??[d.options[0].id]});};
for(const id of require('./neo_v063_pool').ids){assert.equal(FORMAT.isAllowed(id,{neo:true}),true,id);assert.ok(new ClassicLocalService().cardPool().find(c=>c.id===id)?.supported,id);}
{
 const g=game();g.players[0].hand=['neo3-60'];send(g,0,'play_trainer',{handIndex:0});
 choice(g,['slot:-1']);
 assert.ok(g.players[0].active.attachedTrainers.some(t=>t.id==='neo3-60'));
 g.players[0].active.energies=[];
 send(g,0,'retreat',{slot:0});
 assert.equal(g.players[0].active.id,'base1-24','Corrected Balloon Berry sets Retreat Cost to zero');
 assert.ok(g.players[0].discard.includes('neo3-60'),'Balloon Berry discards when retreat succeeds');
 assert.equal(g.players[0].bench[0].energies.length,0);
}
{
 const g=game();g.players[0].hand=['neo3-60'];send(g,0,'play_trainer',{handIndex:0});
 choice(g,['slot:-1']);
 const e=g.players[0].active.energies.slice();send(g,0,'retreat',{slot:0});
 assert.deepEqual(g.players[0].bench[0].energies,e,'Balloon Berry saves attached Energy payments');
 assert.equal(g.players[0].discard.includes('base1-100'),false);
}
{
 let heads=false,tails=false;
 for(let seed=0;seed<11000&&!(heads&&tails);seed+=739){
  const g=game();g.rngState=seed;g.players[0].hand=['neo1-98'];
  send(g,0,'play_trainer',{handIndex:0});
  if(g.pendingDecision){
   heads=true;choice(g,['slot:0']);
   assert.equal(g.players[0].bench.length,0);
   for(const id of ['base1-24','base1-46','base1-98','neo1-105','neo1-99'])assert.ok(g.players[0].hand.includes(id),'Super Scoop Up returns '+id);
   assert.equal(g.players[0].discard.includes('neo1-105'),false);
  }else{
   tails=true;assert.equal(g.players[0].bench.length,1,'Tails has no effect');
   assert.ok(g.players[0].discard.includes('neo1-98'));
  }
 }
 assert.ok(heads&&tails,'Super Scoop Up must honor both coin outcomes');
}
{
 let did=false;
 for(let seed=0;seed<11000&&!did;seed+=739){
  const g=game();g.rngState=seed;g.players[0].hand=['neo1-98'];send(g,0,'play_trainer',{handIndex:0});
  if(!g.pendingDecision)continue;
  choice(g,['slot:-1']);
  assert.equal(g.players[0].active.id,'base1-24','Super Scoop Up Active target promotes available Bench');
  assert.ok(g.players[0].hand.includes('base1-20'));
  assert.equal(g.over,false);did=true;
 }assert.ok(did);
}
{
 const g=game();g.players[0].active=U('base1-10',{energies:['base1-101','base1-101']});
 g.players[0].hand=['neo4-101'];
 send(g,0,'play_trainer',{handIndex:0});choice(g,['slot:-1']);
 assert.equal(g.players[0].active.attachedTrainers[0].id,'neo4-101');
 send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].active.damage,10,'Magnifier suppresses Psychic Resistance on Chansey');
 assert.ok(g.players[0].discard.includes('neo4-101'),'Magnifier discarded at end of owning turn');
 assert.equal(g.players[0].active.attachedTrainers.length,0);
}
{
 const g=game();g.players[0].hand=['neo4-101'];send(g,0,'play_trainer',{handIndex:0});
 choice(g,['slot:0']);send(g,0,'end_turn');
 assert.ok(g.players[0].discard.includes('neo4-101'),'Benched Magnifier also expires without attacking');
 assert.equal(g.players[0].bench[0].attachedTrainers.length,1,'Other existing Berry remains');
}
console.log('PASS v0.63: Balloon Berry zero retreat/energy conservation, Super Scoop Up full return and promotion, Magnifier ignore Resistance/expiry');
