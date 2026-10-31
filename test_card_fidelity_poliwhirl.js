'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const variants=[
 {id:'base1-38',format:'classic',size:60,prizes:6,water:'base1-102',grass:'base1-99',dce:'base1-96'},
 {id:'base1-38',format:'neo-theme',size:60,prizes:6,water:'base1-102',grass:'base1-99',dce:'base1-96'},
 {id:'base1-38',format:'online-preview',size:60,prizes:6,water:'base1-102',grass:'base1-99',dce:'base1-96'},
 {id:'base1-38',format:'online-preview',size:40,prizes:4,water:'base1-102',grass:'base1-99',dce:'base1-96'},
 {id:'base4-57',format:'online-preview',size:60,prizes:6,water:'base4-130',grass:'base4-127',dce:'base4-124'},
 {id:'base4-57',format:'online-preview',size:40,prizes:4,water:'base4-130',grass:'base4-127',dce:'base4-124'}
];
const unit=(id,energies=[],playedTurn=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn});
function game(v,seed=3){const deck=list('base1:Brushfire').slice(0,v.size);const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.water);p.prizes=Array(v.prizes).fill(v.water);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}g.players[0].active=unit(v.id);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid or Amnesia-locked Poliwhirl action should be rejected');assert.deepEqual(g,before,'rejected action must be atomic');}
function choose(g,side,selected){const d=g.pendingDecision;assert.ok(d);assert.equal(d.actor,side);act(g,side,'choose',{decisionId:d.id,selected});}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-38');
 assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set attacks');
 assert.equal(card.attacks[0].text,"Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.");
 assert.equal(card.attacks[1].text,'Flip 2 coins. This attack does 30 damage times the number of heads.');
 const amnesia=ATTACK.compile(card.attacks[0]),slap=ATTACK.compile(card.attacks[1]);assert.equal(amnesia.kind,'amnesia');assert.equal(slap.kind,'coin-times');assert.equal(slap.flips,2);assert.equal(slap.each,30);scenarios++;
 // Amnesia is the attacker's choice, does no damage, blocks only the selected attack, and lasts through the opponent's next turn.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water]);g.players[1].active=unit(v.id,[v.water,v.water,v.dce]);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.kind,'opponent-attack');assert.deepEqual(g.pendingDecision.options.map(o=>o.id),['attack:0','attack:1']);choose(g,0,['attack:0']);assert.equal(g.players[0].active.damage,0);assert.equal(g.players[1].active.amnesia.index,0);reject(g,1,'attack',{attackIndex:0});act(g,1,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);scenarios++;}
 // A different printed attack remains usable while Amnesia blocks Metronome.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water]);g.players[1].active=unit('base1-5',[v.dce,v.dce]);act(g,0,'attack',{attackIndex:0});choose(g,0,['attack:1']);reject(g,1,'attack',{attackIndex:1});act(g,1,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);scenarios++;}
 // Historical ruling: the lock ends when the affected Active Pokémon retreats to the Bench, even if it switches back.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water]);g.players[1].active=unit('base1-5',[v.dce,v.dce,v.dce]);g.players[1].bench=[unit('base1-2')];g.players[1].hand=['base1-95'];act(g,0,'attack',{attackIndex:0});choose(g,0,['attack:0']);act(g,1,'retreat',{slot:0});assert.equal(g.pendingDecision,null,'identical Double Colorless retreat choices should auto-resolve');assert.equal(g.pendingAction,null);assert.equal(g.players[1].discard.length,1);assert.equal(g.players[1].bench[0].amnesia,undefined);act(g,1,'play_trainer',{handIndex:0});if(g.pendingDecision)choose(g,1,[g.pendingDecision.options[0].id]);act(g,1,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);scenarios++;}
 // Distinct retreat Energy outcomes still belong to the retreating player, and completing the choice clears the pending state.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water]);g.players[1].active=unit('base1-5',[v.dce,v.water,v.water]);g.players[1].bench=[unit('base1-2')];g.players[1].hand=['base1-95'];act(g,0,'attack',{attackIndex:0});choose(g,0,['attack:0']);act(g,1,'retreat',{slot:0});assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.kind,'energy-discard');choose(g,1,['energy:0']);assert.equal(g.pendingDecision,null);assert.equal(g.pendingAction,null);assert.equal(g.players[1].bench[0].amnesia,undefined);act(g,1,'play_trainer',{handIndex:0});if(g.pendingDecision)choose(g,1,[g.pendingDecision.options[0].id]);act(g,1,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);scenarios++;}
 // After the opponent's turn passes, the same attack can be used again.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water]);g.players[1].active=unit(v.id,[v.water,v.water,v.dce]);act(g,0,'attack',{attackIndex:0});choose(g,0,['attack:0']);act(g,1,'end_turn',{});act(g,0,'end_turn',{});act(g,1,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,1);choose(g,1,['attack:1']);assert.equal(g.players[0].active.amnesia.index,1);scenarios++;}
 // Doubleslap outcomes are 0/30/60 before Weakness; Arcanine's Water Weakness doubles them and 2 heads KOs for a Prize.
 for(const heads of [0,1,2]){let found=false;for(let seed=1;seed<5000&&!found;seed++){const g=game(v,seed);g.rngState=seed;g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);g.players[1].active=unit('base1-23');act(g,0,'attack',{attackIndex:1});const damage=g.players[1].active===null?120:g.players[1].active.damage;if(damage===heads*60){if(heads===2){assert.equal(g.players[1].active,null);assert.equal(g.pendingAction.kind,'take_prize');}else assert.ok(g.players[1].active);found=true;scenarios++;}}assert.ok(found,`could not produce ${heads} heads in ${v.id}`);}
 // Exact Water requirement: Double Colorless cannot replace either Water symbol; legal Water-Water-DCE pays all three.
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water,v.dce]);g.players[1].active=unit('base1-10');act(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.water]);g.players[1].active=unit(v.id,[v.dce]);act(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.water,v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
}
console.log(`PASS Poliwhirl attacks: ${scenarios} reducer scenarios`);
