'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const W='base1-102',CENTER='base1-85',BLASTOISE='base1-2',LAPRAS='base3-25',HITMONCHAN='base1-7';
const unit=(id,damage,energies=[])=>({id,damage,energies,status:null,playedTurn:2});
function obs(){
 return {phase:'game',turn:1,round:6,turnSerial:9,over:false,stadium:null,
  self:{active:unit(BLASTOISE,40,[W]),bench:[unit(LAPRAS,20)],
   hand:[W,CENTER],energyUsed:false,retreated:false,prizeCount:3,discard:[],deckCount:20},
  opponent:{active:unit(HITMONCHAN,0,[W]),bench:[],prizeCount:3,discard:[],deckCount:20},decision:null};
}
const cfg=AI.configuration({side:1,level:8,personality:'balanced'});
test('Apex reserves an attachment for a valuable, playable Center',()=>{
 const o=obs();
 o.self.active.damage=70;
 o.self.bench[0].damage=40;
 const attach=AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{});
 const heal=AI.score({type:'play_trainer',payload:{handIndex:1}},o,cfg,{});
 assert.equal(attach,-1000);
 assert.ok(heal>attach);
});
test('Apex does not block Energy for an uneconomical Center',()=>{
 const o=obs();
 assert.notEqual(AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{}),-1000);
});
test('Apex does not block Energy when Trainer action budget is exhausted',()=>{
 const o=obs();
 o.self.active.damage=70;
 o.self.bench[0].damage=40;
 assert.notEqual(AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},
  o,cfg,{trainers:cfg.skill.trainers}),-1000);
});
test('Energy remains attachable after Center or on an undamaged teammate',()=>{
 const o=obs();
 o.self.active.damage=0;
 assert.notEqual(AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{}),-1000);
 o.self.active.damage=40;
 o.self.hand=[W];
 assert.notEqual(AI.score({type:'attach_energy',payload:{handIndex:0,slot:-1}},o,cfg,{}),-1000);
});
test('Center evaluation accounts for discarded Energy on every healed Pokémon',()=>{
 const o=obs();
 const a={type:'play_trainer',payload:{handIndex:1}};
 const before=AI.score(a,o,cfg,{});
 o.self.bench[0].energies=[W,W,W];
 const after=AI.score(a,o,cfg,{});
 assert.ok(before>after+150,'avoid throwing away three additional Energy cards');
});

test('Apex Center guard excludes intentionally forbidden attachments from audit candidates',()=>{
 const o=obs();
 // 90 damage makes Center worthwhile even with the Bench undamaged.
 o.self.active.damage=90;
 o.self.bench[0].damage=0;
 const active={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const bench={type:'attach_energy',payload:{handIndex:0,slot:0}};
 const center={type:'play_trainer',payload:{handIndex:1}};
 const actions=[active,bench,center];
 const allowed=AI.centerSafeActions(o,cfg,{},actions);
 assert.deepEqual(allowed,[bench,center]);
 // Audit uses this same filtered set, so skipping the doomed attachment
 // does not inflate missed-useful-Energy metrics.
 assert.equal(allowed.some(a=>a.type==='attach_energy'&&a.payload.slot===-1),false);
});
test('Center guard does not hide attachment opportunities when Center is unplayable',()=>{
 const o=obs();
 o.self.active.damage=70;
 o.self.bench[0].damage=40;
 const active={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const actions=[active];
 assert.deepEqual(AI.centerSafeActions(o,cfg,{trainers:cfg.skill.trainers},actions),actions);
 o.self.hand=[W];
 assert.deepEqual(AI.centerSafeActions(o,cfg,{},actions),actions);
});
test('Center guard is Apex-only and leaves Level 7 audit opportunities unchanged',()=>{
 const o=obs();
 o.self.active.damage=70;
 o.self.bench[0].damage=40;
 const actions=[{type:'attach_energy',payload:{handIndex:0,slot:-1}}];
 assert.deepEqual(AI.centerSafeActions(o,AI.configuration({side:1,level:7}),{},actions),actions);
});

test('Apex can attach Energy when a Trainer lock makes Center unplayable',()=>{
 const o=obs();
 o.self.active.damage=70;
 o.self.bench[0].damage=40;
 o.trainerBlocked=true;
 const active={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const center={type:'play_trainer',payload:{handIndex:1}};
 assert.notEqual(AI.score(active,o,cfg,{}),-1000,
  'an impossible Center must not reserve the turn attachment');
 assert.deepEqual(AI.centerSafeActions(o,cfg,{},[active,center]),[active,center],
  'the decision audit must not hide legal Energy opportunities');
 const actions=AI.candidates(o,cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.ok(actions.some(a=>a.type==='attach_energy'&&a.payload.slot===-1));
 assert.equal(actions.some(a=>a.type==='play_trainer'),false,
  'Apex should not spend its search budget probing blocked Trainers');
});

test('Apex observation recognizes Trainer lock expiry and enabled Hay Fever',()=>{
 const {CATALOG}=require('../headless_duel');
 const game={format:'online-preview',phase:'game',turn:1,round:6,turnSerial:9,
  over:false,setupReady:[true,true],message:[],coinFlips:[],
  players:[
   {name:'Opponent',active:unit(HITMONCHAN,0,[W]),bench:[],
    hand:[],deck:[],prizes:[],discard:[]},
   {name:'Apex',active:unit(BLASTOISE,70,[W]),bench:[unit(LAPRAS,40)],
    hand:[W,CENTER],deck:[],prizes:[],discard:[]}
  ]};
 assert.equal(AI.observation(game,1).trainerBlocked,false);
 game.players[1].trainerLockedUntil=10;
 assert.equal(AI.observation(game,1).trainerBlocked,true);
 game.players[1].trainerLockedUntil=9;
 assert.equal(AI.observation(game,1).trainerBlocked,false,
  'an expired attack-based Trainer lock must not persist');
 const vileplume=[...CATALOG.values()].find(c=>c.name==='Dark Vileplume'&&
  c.abilities?.some(a=>a.name==='Hay Fever'));
 assert.ok(vileplume,'fixture requires the real Hay Fever card');
 game.players[0].bench=[unit(vileplume.id,0)];
 assert.equal(AI.observation(game,1).trainerBlocked,true,
  'Hay Fever on either side blocks all Trainers');
 game.players[0].bench[0].status='Asleep';
 assert.equal(AI.observation(game,1).trainerBlocked,false,
  'a disabled Hay Fever must not suppress a playable Center');
 game.players[0].bench[0].status=null;
 game.powerBlankUntil=game.turnSerial+1;
 assert.equal(AI.observation(game,1).trainerBlocked,false,
  'global Power suppression must permit Trainers even with Dark Vileplume in play');
 game.powerBlankUntil=game.turnSerial;
 assert.equal(AI.observation(game,1).trainerBlocked,true,
  'Hay Fever resumes when global Power suppression expires');
 game.players[0].bench[0].powerSuppressedUntil=game.turnSerial+1;
 assert.equal(AI.observation(game,1).trainerBlocked,false,
  'individual Power suppression must also permit Trainers');
 game.players[0].bench[0].powerSuppressedUntil=game.turnSerial;
 assert.equal(AI.observation(game,1).trainerBlocked,true,
  'Hay Fever resumes after individual suppression expires');
});
