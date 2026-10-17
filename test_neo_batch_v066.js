'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const F=require('./classic_format');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(stadium=true){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:143});
 g.phase='game';g.turn=0;g.round=6;g.turnSerial=17;g.rngState=211;
 g.players[0].active=U('base1-46',{energies:['base1-98','base1-99']});g.players[0].bench=[U('base1-58')];
 g.players[1].active=U('base1-58',{energies:['base1-98','base1-96','base1-102']});g.players[1].bench=[U('base1-46')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(20).fill('base1-99');}
 if(stadium){g.stadium={owner:0,id:'neo1-84'};g.players[0].stadium='neo1-84';}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);return r;}
function play(g,trainer,owner=0){
 g.turn=owner;g.players[owner].hand.push(trainer);send(g,owner,'play_trainer',{handIndex:g.players[owner].hand.length-1});
}
function choose(g,id){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:[id||d.options[0].id]});}
function answerUntil(g,preferred){
 for(let i=0;i<8&&g.pendingDecision;i++){const d=g.pendingDecision;const pick=preferred(d);assert.ok(d.options.some(x=>x.id===pick),'Missing desired '+pick+' in '+d.kind);choose(g,pick);}
 assert.equal(g.pendingDecision,null);
}
assert.equal(F.isAllowed('neo1-84',{neo:true}),true);
assert.equal(new ClassicLocalService().cardPool().find(x=>x.id==='neo1-84')?.supported,true);
{
 const g=game(false);play(g,'neo1-84');assert.equal(g.stadium.id,'neo1-84','Ecogym stays in play');
 assert.equal(g.players[0].discard.includes('neo1-84'),false);
 assert.equal(g.players[0].stadium,'neo1-84');
}
{
 const g=game();play(g,'base1-92');
 answerUntil(g,d=>d.kind==='target'?'slot:-1':d.options.find(o=>o.id.includes(':0'))?.id||d.options[0].id);
 assert.equal(g.players[1].active.energies.includes('base1-98'),false,'Removed Fire Energy leaves Pokémon');
 assert.equal(g.players[1].hand.includes('base1-98'),true,'Opponent removal returns Fire Energy under Ecogym');
 assert.equal(g.players[1].discard.includes('base1-98'),false,'Returned Energy not discarded');
 assert.equal(g.players[0].discard.includes('base1-92'),true,'Trainer itself discarded normally');
}
{
 const g=game();g.players[1].active.energies=['base1-96'];play(g,'base1-92');
 answerUntil(g,d=>d.options[0].id);
 assert.equal(g.players[1].hand.includes('base1-96'),false,'Double Colorless not recovered');
 assert.equal(g.players[1].discard.includes('base1-96'),true,'Colorless Energy is discarded');
}
{
 const g=game(false);g.players[1].active.energies=['base1-98'];play(g,'base1-92');
 answerUntil(g,d=>d.options[0].id);
 assert.equal(g.players[1].discard.includes('base1-98'),true,'Without Ecogym Energy remains in discard');
 assert.equal(g.players[1].hand.includes('base1-98'),false);
}
{
 const g=game();
 g.players[1].active=U('base1-58',{damage:30,energies:['base1-98']});
 send(g,0,'attack',{attackIndex:0}); // Charmander Scratch, final 10 damage.
 assert.equal(g.players[1].discard.includes('base1-98'),true,'KO-discarded Fire Energy bypasses Ecogym');
 assert.equal(g.players[1].hand.includes('base1-98'),false);
}
{
 const g=game();g.players[0].active.energies=['base1-98'];g.players[1].active.energies=['base1-102'];
 // Opponent's selected Energy is recovered, your own Energy is a cost.
 play(g,'base1-79'); // Super Energy Removal
 answerUntil(g,d=>{
  if(d.options.some(o=>o.id==='slot:-1'))return 'slot:-1';
  return d.options[0].id;
 });
 assert.equal(g.players[1].hand.includes('base1-102'),true,'Other player returns Lightning Energy');
 assert.equal(g.players[0].discard.includes('base1-98'),true,'User discards their own cost; Ecogym does not protect it');
}
{
 const g=game();g.players[0].hand=['neo4-100'];send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.stadium.id,'neo4-100','Stadium replacement removes Ecogym');
 g.players[1].active.energies=['base1-98'];
 play(g,'base1-92');answerUntil(g,d=>d.options[0].id);
 assert.equal(g.players[1].discard.includes('base1-98'),true,'Ecogym no longer active');
}
console.log('PASS Neo v0.66: Ecogym Stadium, opponent Energy Removal, self costs, Colorless exception, KO and replacement');
