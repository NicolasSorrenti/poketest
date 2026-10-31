'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {id:'base1-2',water:'base1-102',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-2',water:'base4-130',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size,blastoise,water){
 const deck=[...Array(4).fill('base1-35'),...Array(size-4).fill(water)];
 const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:7});
 g.phase='game';g.turn=0;g.turnSerial=4;g.round=3;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-35');p.bench=[];p.hand=[];p.discard=[];p.deck=[...deck];p.prizes=Array(size===40?4:6).fill(water);p.energyUsed=false;p.turnPlays=[];}
 g.players[0].active=unit('base1-35');
 g.players[0].bench=[unit(blastoise),unit('base1-25'),unit('base1-23')];
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g);const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}
function pick(g,side,id){const d=g.pendingDecision;assert.ok(d,'expected choice');assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected:[id]});}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 const card=CATALOG.get(v.id);assert.equal(card.abilities[0].name,'Rain Dance');
 assert.equal(card.abilities[0].text,"As often as you like during your turn (before your attack), you may attach 1 Water Energy Card to 1 of your Water Pokémon. (This doesn't use up your 1 Energy card attachment for the turn.) This power can't be used if Blastoise is Asleep, Confused, or Paralyzed.");scenarios++;
 // A Benched Blastoise can attach the Water cards repeatedly before attacking.
 // The hand's Base and Base Set 2 Water Energy reprints are equivalent, so
 // there is no Energy picker; different Water recipients remain selectable.
 {const g=game(format,size,v.id,v.water);g.players[0].hand=[v.water,'base1-102'];
  act(g,0,'use_power',{slot:0,repeat:true});assert.equal(g.pendingDecision.kind,'target');assert.equal(g.pendingDecision.optional,true);assert.match(g.pendingDecision.label,/Finish/);
  const options=g.pendingDecision.options.map(x=>x.id);assert.deepEqual(options,['slot:-1','slot:0','slot:1']);
  pick(g,0,'slot:-1');assert.equal(g.players[0].active.energies.length,1);assert.equal(CATALOG.get(g.players[0].active.energies[0]).name,'Water Energy');assert.equal(g.pendingDecision.kind,'target');
  pick(g,0,'slot:1');assert.equal(g.players[0].bench[1].energies.length,1);assert.equal(CATALOG.get(g.players[0].bench[1].energies[0]).name,'Water Energy');
  assert.equal(g.pendingDecision,null);assert.equal(g.players[0].energyUsed,false);assert.equal(g.turn,0);scenarios++;}
 // The Finish option exits without using a card, and one-shot activation auto
 // selects its sole legal Water Pokémon while retaining the normal attachment.
 {const g=game(format,size,v.id,v.water);g.players[0].active=unit('base1-43');g.players[0].bench=[unit(v.id)];g.players[0].hand=[v.water];
  act(g,0,'use_power',{slot:0,repeat:true});act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});
  assert.deepEqual(g.players[0].hand,[v.water]);assert.equal(g.pendingDecision,null);
  act(g,0,'use_power',{slot:0});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].bench[0].energies,[v.water]);assert.equal(g.players[0].energyUsed,false);
  g.players[0].hand.push(v.water);act(g,0,'attach_energy',{handIndex:0,slot:-1});assert.equal(g.players[0].energyUsed,true);scenarios++;}
 // An Active Blastoise has the same Power eligibility as a Benched one.
 {const g=game(format,size,v.id,v.water);g.players[0].active=unit(v.id);g.players[0].bench=[unit('base1-23')];g.players[0].hand=[v.water];
  act(g,0,'use_power',{slot:-1,repeat:true});assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['slot:-1']);pick(g,0,'slot:-1');assert.equal(g.players[0].active.energies[0],v.water);assert.equal(g.pendingDecision,null);scenarios++;}
 // Rainbow Energy is not Water Energy in hand, and Rain Dance cannot target
 // Fire Pokémon. A forged recipient choice is rejected atomically.
 {const g=game(format,size,v.id,v.water);g.players[0].hand=['base5-17'];act(g,0,'use_power',{slot:0,repeat:true});assert.equal(g.pendingDecision,null);
  g.players[0].hand=[v.water];act(g,0,'use_power',{slot:0,repeat:true});assert.ok(!g.pendingDecision.options.some(x=>x.id==='slot:2'));
  reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['slot:2']});act(g,0,'choose',{decisionId:g.pendingDecision.id,decline:true});scenarios++;}
 // All three printed status locks apply to Blastoise, including from the Bench.
 for(const status of ['Asleep','Confused','Paralyzed']){const g=game(format,size,v.id,v.water);g.players[0].bench[0].status=status;g.players[0].hand=[v.water];reject(g,0,'use_power',{slot:0,repeat:true});scenarios++;}
 {const g=game(format,size,v.id,v.water);g.players[0].hand=[v.water];g.turn=1;reject(g,0,'use_power',{slot:0,repeat:true});scenarios++;}
}
console.log(`PASS Blastoise Rain Dance timing, recipients, equivalent Energy, Finish and status (${scenarios} scenarios)`);
