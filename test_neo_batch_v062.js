'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const FORMAT=require('./classic_format');
const U=(id,props={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...props});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:344});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=16;g.rngState=44;
 g.players[0].active=U('base1-3');g.players[0].bench=[U('base1-46')];
 g.players[1].active=U('base1-58');g.players[1].bench=[U('base1-3')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(20).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choice(g,ids){const d=g.pendingDecision;assert.ok(d,'Berry decision required');send(g,d.actor,'choose',{decisionId:d.id,selected:ids===undefined?[d.options[0].id]:ids});}
const tool=(id)=>[{id}];
for(const id of require('./neo_v062_pool').ids){assert.equal(FORMAT.isAllowed(id,{neo:true}),true,id);assert.ok(new ClassicLocalService().cardPool().find(c=>c.id===id)?.supported,id);}
{
 const g=game();g.players[1].bench[0].damage=50;g.players[1].bench[0].attachedTrainers=tool('neo1-93');
 send(g,0,'end_turn');
 assert.equal(g.pendingDecision.actor,1,'Gold Berry decision belongs to opposing player');
 assert.equal(g.pendingDecision.kind,'neo-berry');
 choice(g);assert.equal(g.players[1].bench[0].damage,10,'Gold Berry heals four counters');
 assert.equal(g.players[1].discard.includes('neo1-93'),true);
 assert.equal(g.pendingDecision,null);
}
{
 const g=game();g.players[1].bench[0].damage=50;g.players[1].bench[0].attachedTrainers=tool('neo1-93');
 send(g,0,'end_turn');choice(g,[]);
 assert.equal(g.players[1].bench[0].damage,10,'Declined Gold Berry activates mandatorily at start of turn');
 assert.equal(g.players[1].discard.includes('neo1-93'),true);
}
{
 const g=game();g.players[1].bench[0].damage=30;g.players[1].bench[0].attachedTrainers=tool('neo1-93');
 send(g,0,'end_turn');assert.equal(g.pendingDecision,null);
 assert.equal(g.players[1].bench[0].damage,30,'Gold Berry cannot heal fewer than 4 counters');
 assert.equal(g.players[1].bench[0].attachedTrainers[0].id,'neo1-93');
}
{
 const g=game();g.players[0].active.status='Confused';g.players[0].active.poison=true;
 g.players[0].active.attachedTrainers=tool('neo1-94');
 send(g,0,'end_turn');
 assert.equal(g.pendingDecision.actor,0,'Miracle Berry owner chooses even when opponent acts next');
 choice(g);
 assert.equal(g.players[0].active.status,null);
 assert.equal(g.players[0].active.poison,false);
 assert.equal(g.players[0].discard.includes('neo1-94'),true);
}
{
 const g=game();g.players[1].active.status='Confused';
 g.players[1].active.attachedTrainers=tool('neo1-94');
 send(g,0,'end_turn');assert.equal(g.pendingDecision.actor,1);
 choice(g,[]);
 assert.equal(g.players[1].active.status,null,'Declined Miracle Berry must clear at start of next turn');
 assert.equal(g.players[1].discard.includes('neo1-94'),true);
}
{
 const g=game();g.players[0].bench[0].damage=30;
 g.players[0].bench[0].attachedTrainers=tool('neo1-99');
 send(g,0,'end_turn');assert.equal(g.pendingDecision.actor,0,'Existing Berry must offer an optional heal');
 choice(g,[]);
 assert.equal(g.players[0].bench[0].damage,10,'Mandatory start-of-turn Berry works for the NON-turn player too');
 assert.equal(g.players[0].discard.includes('neo1-99'),true);
}
{
 const g=game();g.players[0].bench[0].damage=40;g.players[0].bench[0].attachedTrainers=tool('neo1-93');
 g.players[1].bench[0].status='Confused';g.players[1].bench[0].attachedTrainers=tool('neo1-94');
 send(g,0,'end_turn');assert.equal(g.pendingDecision.actor,0);
 choice(g,[]);
 assert.equal(g.pendingDecision.actor,1,'Second owner gets independent between-turn decision');
 choice(g,[]);
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].bench[0].damage,0);
 assert.equal(g.players[1].bench[0].status,null);
}
{
 const g=game();g.players[0].hand=['neo1-93'];send(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.actor,0);choice(g,['slot:-1']);
 assert.equal(g.players[0].active.attachedTrainers[0].id,'neo1-93');
 g.players[0].hand=['neo1-94'];
 const rejected=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.equal(rejected.ok,false,'Only one Pokémon Tool may be attached');
 assert.equal(g.players[0].hand[0],'neo1-94','Rejected tool play retains hand');
}
console.log('PASS v0.62: Berry/Gold/Miracle start-turn and between-turn timing, status, threshold, owner choices, Tool restrictions');
