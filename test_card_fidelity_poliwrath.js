'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const variants=[
 {pokemon:'base1-13',polw:'base1-59',water:'base1-102',dce:'base1-96',rainbow:'base5-17',fire:'base1-98',grass:'base1-99',reprint:'base4-127',grassDeck:'base1-99',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {pokemon:'base4-15',polw:'base4-88',water:'base4-130',dce:'base4-124',rainbow:'base5-17',fire:'base4-126',grass:'base4-127',reprint:'base1-99',grassDeck:'base4-127',formats:[['neo-theme',60],['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(format,size,v){
 const deck=[...Array(4).fill(v.pokemon),...Array(4).fill(v.polw),...Array(52).fill(v.grassDeck)];
 const d=size===40?deck.slice(0,40):deck;
 const g=createGame({format,decks:[d,d],deckSize:size,prizeCount:size===40?4:6,seed:3});
 g.phase='game';g.turn=0;g.turnSerial=4;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grassDeck);p.prizes=Array(size===40?4:6).fill(v.grassDeck)}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
let scenarios=0;
for(const v of variants)for(const [format,size] of v.formats){
 // Compare both printings: Water Gun counts surplus Water cards, with a 20-damage cap.
 for(const [energies,damage] of [
  [[v.water,v.water,v.dce],30],
  [[v.water,v.water,v.water,v.dce],40],
  [[v.water,v.water,v.water,v.water,v.water,v.dce],50],
  [[v.water,v.water,v.dce,v.fire],30]
 ]){
  const g=game(format,size,v);g.players[0].active=unit(v.pokemon,energies);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,damage);scenarios++;
 }
 // Rainbow provides one Water type while attached. The reducer must still
 // count only cards left after paying all three attack-cost units.
 if(format!=='classic')for(const [energies,damage] of [
  [[v.water,v.water,v.rainbow],30],
  [[v.water,v.water,v.water,v.rainbow],40],
  [[v.water,v.rainbow,v.dce],30],
  [[v.water,v.water,v.dce,v.rainbow],40]
 ]){const g=game(format,size,v);g.players[0].active=unit(v.pokemon,energies);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,damage);scenarios++;}
 // Wrong-type Energy cannot cover Water Gun's two-Water attack cost.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.fire,v.fire,v.dce,v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Whirlpool still deals 40 when no Energy is attached and does not open a picker.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.water,v.water,v.dce]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.pendingDecision,null);scenarios++;}
 // A single attached Energy is removed automatically.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.water,v.water,v.dce]);g.players[1].active.energies=[v.grass];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[1].active.energies,[]);assert.deepEqual(g.players[1].discard,[v.grass]);scenarios++;}
 // Basic Grass reprints are one equivalent choice despite distinct catalog IDs.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.water,v.water,v.dce]);g.players[1].active.energies=[v.grass,v.reprint];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.energies.length,1);assert.ok(g.message.some(x=>x.includes('discarded Grass Energy from')));scenarios++;}
 // Recycle Energy has a different printed effect, so the attacker chooses; discarding it returns it to its owner's hand.
 {const g=game(format,size,v);g.players[0].active=unit(v.pokemon,[v.water,v.water,v.dce]);g.players[1].active.energies=[v.grass,'neo1-105'];act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.options.length,2);act(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['energy:1']});assert.ok(g.players[1].hand.includes('neo1-105'));assert.deepEqual(g.players[1].active.energies,[v.grass]);scenarios++;}
}
console.log(`PASS Poliwrath Base and Base Set 2 effects across Classic where legal, Neo, online-preview and 40-card Cube reducers, including Rainbow Energy (${scenarios} scenarios)`);

