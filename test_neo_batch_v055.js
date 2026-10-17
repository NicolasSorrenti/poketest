'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const F=require('./classic_format');
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1});
function match(card){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:212});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=15;
 for(const p of g.players){p.active=unit('base1-58');p.bench=[unit('base1-3')];p.discard=[];p.prizes=Array(6).fill('base1-99');}
 g.players[0].hand=[card,'base1-98','base1-99','neo4-1'];
 g.players[1].hand=['base1-98','base1-99'];
 g.players[0].deck=['base1-98','base1-99','base1-100','neo1-96','base1-101','neo1-85','base1-102','neo1-90','base1-98','base1-99'];
 g.players[1].deck=['base1-98','base1-99','base1-100','base1-101','base1-102','base1-98','base1-99','base1-100','base1-101'];
 return g;
}
function act(g,side,type,payload){const r=applyCommand(g,side,{type,payload:payload||{}});assert.equal(r.ok,true,type+': '+r.error);}
function play(g){act(g,0,'play_trainer',{handIndex:0});}
function choice(g,selected){const d=g.pendingDecision;assert.ok(d,'Server decision expected');act(g,d.actor,'choose',{decisionId:d.id,selected:selected===undefined?[d.options[0].id]:selected});}
for(const id of require('./neo_v055_pool').ids){assert.ok(new ClassicLocalService().cardPool().find(c=>c.id===id)?.supported,id);assert.ok(F.isAllowed(id,{neo:true}),id);}
{
 const g=match('neo1-87'),before=g.players[0].deck.length;
 play(g);assert.equal(g.players[0].hand.length,6,'Mary must draw before choosing return cards');
 assert.ok(g.pendingDecision.options.every(o=>o.id!=='hand:0'));
 choice(g,g.pendingDecision.options.slice(0,2).map(o=>o.id));
 assert.equal(g.players[0].deck.length,before);assert.equal(g.players[0].hand.length,3);assert.ok(g.players[0].discard.includes('neo1-87'));
}
{
 const g=match('neo1-88'),n=g.players[0].deck.length;play(g);
 assert.ok(g.pendingDecision.options.every(o=>Number(o.id.split(':')[1])>=n-7));
 choice(g);assert.equal(g.players[0].deck.length,n-1);assert.equal(g.players[0].trainerLockedUntil,g.turnSerial+1);
}
{
 const g=match('neo1-89');g.players[0].discard=['base1-98','base1-99','base1-100','base1-80'];
 play(g);choice(g,['n:1','n:2']);
 assert.equal(g.pendingDecision.options.length,3);
 choice(g,g.pendingDecision.options.map(o=>o.id));
 assert.equal(g.players[0].hand.length,4);
 assert.equal(g.players[0].discard.includes('base1-80'),true);
}
{
 const g=match('neo1-90');
 g.players[0].discard=['base1-98','base1-3','base1-80'];
 g.players[1].discard=['base1-99','neo4-1','base1-80'];
 play(g);assert.equal(g.pendingDecision.actor,1);
 choice(g,['choice:1']);assert.equal(g.pendingDecision.actor,1);
 choice(g,g.pendingDecision.options.map(o=>o.id));
 assert.equal(g.pendingDecision.actor,0);choice(g,['choice:1']);
 assert.equal(g.pendingDecision.actor,0);choice(g,g.pendingDecision.options.map(o=>o.id));
 assert.equal(g.pendingDecision,null);
 assert.ok(g.players[1].deck.includes('neo4-1'));
 assert.equal(g.players[0].trainerLockedUntil,g.turnSerial+1);
}
{
 const g=match('neo4-102');play(g);
 const dark=g.pendingDecision.options.find(o=>o.label==='Dark Ampharos');assert.ok(dark);choice(g,[dark.id]);
 assert.equal(g.pendingDecision.actor,1);choice(g,['kind:1']);
 assert.equal(g.players[1].hand.length,5);assert.ok(g.players[0].hand.includes('neo4-1'));
}
{
 const g=match('neo4-94');g.players[1].prizes=['base1-98','base1-99','base1-100'];
 const before=[...g.players[1].hand,...g.players[1].deck,...g.players[1].prizes].sort().join(',');
 play(g);assert.equal(g.pendingDecision.actor,0);assert.ok(g.players[0].privateLog?.some(s=>s.includes('Prize')));
 choice(g,['choice:1']);
 assert.equal(g.players[1].prizes.length,3);
 assert.equal([...g.players[1].hand,...g.players[1].deck,...g.players[1].prizes].sort().join(','),before,'Prize swap conserves all cards');
 assert.ok(!g.players[1].privateLog?.some(s=>s.includes('Prize')));
}
console.log('PASS v0.55: six Neo Trainers, choice ownership, turn restrictions and Prize conservation');
