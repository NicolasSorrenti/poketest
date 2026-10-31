'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const variants=[
 {id:'base1-87',format:'classic',pokemon:'base1-44'},
 {id:'base4-115',format:'online-preview',pokemon:'base4-67'}
];
const fire='base1-98',energy='base1-99',trainer='base1-91';
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const g=createGame({format:v.format,decks:[[...Array(4).fill(v.pokemon),...Array(4).fill(v.id),...Array(4).fill(trainer),...Array(48).fill(fire)],[...Array(4).fill(v.pokemon),...Array(4).fill(v.id),...Array(4).fill(trainer),...Array(48).fill(fire)]],seed:87115});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.pokemon);p.bench=[];p.hand=[];p.deck=[];p.discard=[];p.prizes=Array(6).fill(v.pokemon);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,s)=>g.players[s];
function act(g,s,type,payload={}){const r=applyCommand(g,s,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id);
 assert.equal(card.name,'Pokédex');
 assert.equal(card.rules[0],'Look at up to 5 cards from the top of your deck and rearrange them as you like.');
 scenarios++;
 {
  const g=game(v),p=player(g,0);p.hand=[v.id];p.deck=[fire,energy,trainer];
  act(g,0,'play_trainer',{handIndex:0});
  const d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,0);assert.equal(d.kind,'arrange');
  const own=publicView(g,0),opp=publicView(g,1);
  assert.deepEqual(own.pendingDecision.options.map(o=>o.label),['Bill','Grass Energy','Fire Energy']);
  assert.equal(opp.pendingDecision.waitingFor,0);assert.equal(opp.pendingDecision.options,undefined,'opponent cannot see inspected cards or choices');
  // Inspecting fewer than five cards is allowed; return them in reverse order.
  act(g,0,'choose',{decisionId:d.id,selected:d.options.slice().reverse().map(o=>o.id)});
  const after=player(g,0);
  assert.deepEqual(after.deck,[trainer,energy,fire],'reversed selection makes Fire Energy the next card drawn');
  assert.deepEqual(after.discard,[v.id]);assert.equal(g.pendingDecision,null);
  scenarios++;
 }
 {
  const g=game(v),p=player(g,0);p.hand=[v.id];p.deck=[];
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null,'empty deck means there are no cards to inspect or reorder');
  assert.deepEqual(player(g,0).discard,[v.id]);scenarios++;
 }
}
console.log(`PASS Pokédex Base/Base Set 2 text, private top-deck look, order, short deck, and empty deck (${scenarios} reducer/protocol scenarios)`);
