'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const UNIT=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:91});
 g.phase='game';g.round=5;g.turn=0;g.turnSerial=12;
 g.players[0].active=UNIT('base1-58');g.players[0].bench=[UNIT('base1-46')];
 g.players[1].active=UNIT('base1-58');g.players[1].bench=[UNIT('base1-46')];
 for(const p of g.players){p.discard=[];p.hand=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(30).fill('base1-99');}
 return g;
}
const send=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);};
function snapshots(g,side){const p=g.players[side];return [...p.deck,...p.hand,...p.discard,...p.prizes,...[p.active,...p.bench].filter(Boolean).flatMap(x=>[x.id,...x.under,...x.energies,...x.attachedTrainers.map(y=>y.id)])].filter(x=>x==='neo1-105').length;}
{
 const g=game();g.players[0].active.energies=['neo1-105'];
 const initial=snapshots(g,0);send(g,0,'retreat',{slot:0});
 assert.equal(g.players[0].hand.includes('neo1-105'),true,'Retreat returns Recycle Energy');
 assert.equal(g.players[0].discard.includes('neo1-105'),false);
 assert.equal(snapshots(g,0),initial,'No Energy is created/destroyed on retreat');
}
{
 const g=game();g.players[0].active.energies=['neo1-105','neo1-105'];
 const initial=snapshots(g,0);send(g,0,'retreat',{slot:0});
 if(g.pendingDecision){const d=g.pendingDecision;send(g,d.actor,'choose',{decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)});}
 assert.equal(g.players[0].hand.filter(id=>id==='neo1-105').length,1,'Pikachu pays only its one retreat Energy');
 assert.equal(g.players[0].active.id,'base1-46');
 assert.equal(snapshots(g,0),initial);
}
{
 const g=game();g.players[1].active=UNIT('base1-58',{damage:30,energies:['neo1-105']});
 g.players[0].active=UNIT('base1-46',{energies:['base1-98']});
 const initial=snapshots(g,1);send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].hand.includes('neo1-105'),true,'Defending Recycle Energy returns on attack KO');
 assert.equal(snapshots(g,1),initial);
}
{
 const g=game();g.players[0].hand=['base1-92'];g.players[1].active.energies=['neo1-105'];
 const initial=snapshots(g,1);send(g,0,'play_trainer',{handIndex:0});
 if(g.pendingDecision){const d=g.pendingDecision;send(g,d.actor,'choose',{decisionId:d.id,selected:[d.options[0].id]});}
 if(g.pendingDecision){const d=g.pendingDecision;send(g,d.actor,'choose',{decisionId:d.id,selected:[d.options[0].id]});}
 assert.equal(g.players[1].hand.includes('neo1-105'),true,'Energy Removal gives Recycle Energy back to its owner');
 assert.equal(snapshots(g,1),initial);
}
{
 const g=game();g.players[0].active=UNIT('base1-58',{damage:20,energies:['neo1-105']});g.players[0].hand=['base1-85'];
 const initial=snapshots(g,0);send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.players[0].hand.includes('neo1-105'),true,'Pokémon Center discard from play returns Recycle Energy');
 assert.equal(snapshots(g,0),initial);
}
{
 const g=game();g.players[0].hand=['base1-71','neo1-105','base1-99'];g.players[0].deck=['base1-98'];
 send(g,0,'play_trainer',{handIndex:0});
 for(let step=0;step<5&&g.pendingDecision;step++){
  const d=g.pendingDecision;
  send(g,d.actor,'choose',{decisionId:d.id,selected:d.options.slice(0,d.min).map(x=>x.id)});
 }
 assert.equal(g.pendingDecision,null,'Complete Computer Search including its deck search');
 assert.equal(g.players[0].discard.includes('neo1-105'),true,'Hand-discarded Recycle Energy must NOT bounce');
}
console.log('PASS v0.59: Recycle from play via retreat, KO, Energy Removal and Pokémon Center; hand discard untouched');
