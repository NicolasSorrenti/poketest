'use strict';
// One printing per milestone: Aipom #41 Grab (Neo Revelation).
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const target=CATALOG.get('neo3-41').attacks.find(a=>a.name==='Grab');
assert.ok(target);
assert.equal(ATTACK.compile(target)?.kind,'neo93:aipom-grab');
assert.equal(ATTACK.compile({...target,text:target.text+' altered'}),null,'reject altered printed text');
assert.equal(ATTACK.compile({...target,cost:['Fire']}),null,'reject altered printed cost');
assert.deepEqual(ATTACK.resolve(ATTACK.compile(target),()=>{throw Error('Grab should not flip a coin');}),
 {damage:0,flips:[],neo93ReturnTrainer:true});

const unit=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(withTools=true){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed:932});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;
 g.players[0].active=unit('neo3-41',{energies:['base1-99']});
 g.players[1].active=unit('base1-15',{attachedTrainers:withTools?[{id:'base1-80',expires:100},{id:'base1-84',expires:100}]:[]});
 g.players[0].bench=[unit('base1-44')];
 g.players[1].bench=[unit('base1-3',{attachedTrainers:withTools?[{id:'neo1-93',expires:100}]:[]})];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(10).fill('base1-99');}
 return g;
}
const send=(g,side,type,payload={})=>applyCommand(g,side,{type,payload});
const accepted=(g,side,type,payload={})=>{const r=send(g,side,type,payload);assert.equal(r.ok,true,type+': '+r.error);};
function begin(g){accepted(g,0,'attack',{attackIndex:0});return g.pendingDecision;}
{
 const g=game();const d=begin(g);
 assert.equal(d?.actor,0,'attacking player selects an attached Trainer');
 assert.deepEqual(d.options.map(x=>x.id),['tool:-1:0','tool:-1:1','tool:0:0']);
 assert.equal(g.players[1].active.damage,0);
 const rejectWrongPlayer=send(g,1,'choose',{decisionId:d.id,selected:['tool:0:0']});
 assert.equal(rejectWrongPlayer.ok,false);
 const rejectImpossible=send(g,0,'choose',{decisionId:d.id,selected:['tool:9:0']});
 assert.equal(rejectImpossible.ok,false);
 assert.equal(g.pendingDecision?.id,d.id,'invalid choices must not close the dialog');
 assert.equal(g.players[1].bench[0].attachedTrainers.length,1,'invalid choices must not mutate tools');
 const before=g.players[1].deck.length;
 accepted(g,0,'choose',{decisionId:d.id,selected:['tool:0:0']});
 assert.equal(g.players[1].bench[0].attachedTrainers.length,0);
 assert.deepEqual(g.players[1].active.attachedTrainers.map(x=>x.id),['base1-80','base1-84']);
 assert.ok(g.players[1].deck.includes('neo1-93')||g.players[1].hand.includes('neo1-93'),
   'selected Trainer is shuffled into owner deck; it may be drawn next turn');
 assert.equal(g.players[1].deck.length+g.players[1].hand.length,before+1,'return card plus mandatory next-turn draw conserves cards');
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[1].active.damage,0,'Grab has no damage');
}
{
 const g=game();const d=begin(g);
 accepted(g,0,'choose',{decisionId:d.id,selected:['tool:-1:1']});
 assert.deepEqual(g.players[1].active.attachedTrainers.map(x=>x.id),['base1-80']);
 assert.equal(g.players[1].bench[0].attachedTrainers.length,1,'unselected Benched tool remains');
 assert.ok(g.players[1].deck.includes('base1-84')||g.players[1].hand.includes('base1-84'));
}
{
 const g=game(false),before=g.players[1].deck.length;
 assert.equal(begin(g),null,'with no attached Trainers, Grab does not prompt');
 assert.equal(g.players[1].active.damage,0);
 assert.equal(g.players[1].deck.length+g.players[1].hand.length,before,'nothing shuffled into deck');
}
console.log('PASS Neo v093: only Aipom Grab; active or Bench attached Trainer selected by attacker, invalid choice rollback, owner-deck shuffle, no-target case');
