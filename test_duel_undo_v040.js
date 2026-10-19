'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const UNDO=require('./duel_undo');
const {ClassicLocalService}=require('./classic_local_service');
const {ClassicOnlineService}=require('./classic_online_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon}=require('./core_rules');

function sample(){
 const player=()=>({name:'Trainer',active:{id:'base1-2',energies:[],attachedTrainers:[]},bench:[],
  hand:['base1-99'],deck:['base1-1','base1-2'],prizes:['base1-3'],discard:[],privateLog:[]});
 return {phase:'game',over:false,turn:0,turnSerial:2,round:2,rngState:123,
  coinSeq:0,coinFlips:[],events:[],players:[player(),player()],message:[]};
}
{
 const start=sample(),after=structuredClone(start),stack=[];
 after.players[0].hand.pop();after.players[0].active.energies.push('base1-99');
 after.events.push({side:0,type:'attach_energy'});
 const cmd={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 assert.equal(UNDO.canRecord(start,after,0,cmd),true);
 UNDO.record(stack,start,after,0,cmd);
 assert.equal(UNDO.available(stack,after,0),true);
 const restored=UNDO.undo(stack,after,0);
 assert.deepEqual(restored.players[0].hand,start.players[0].hand);
 assert.deepEqual(restored.players[0].active.energies,[]);
 assert.equal(restored.events.at(-1).type,'undo');
 assert.equal(restored.events.length,2,'Public activity sequence never goes backwards');
 assert.equal(UNDO.available(stack,restored,0),false);
 assert.throws(()=>UNDO.undo(stack,restored,0),/Undo unavailable/);
 const rng=structuredClone(after);rng.rngState++;assert.equal(UNDO.canRecord(start,rng,0,cmd),false);
 const draw=structuredClone(after);draw.players[0].deck.pop();assert.equal(UNDO.canRecord(start,draw,0,cmd),false);
 const prize=structuredClone(after);prize.players[0].prizes.pop();assert.equal(UNDO.canRecord(start,prize,0,cmd),false);
 const hidden=structuredClone(after);hidden.players[1].hand.push('base1-1');assert.equal(UNDO.canRecord(start,hidden,0,cmd),false);
 const coin=structuredClone(after);coin.coinSeq++;assert.equal(UNDO.canRecord(start,coin,0,cmd),false);
 const choice=structuredClone(after);choice.pendingDecision={id:1};assert.equal(UNDO.canRecord(start,choice,0,cmd),false);
 const second=structuredClone(after);second.events.push({side:1,type:'choose'});assert.equal(UNDO.canRecord(start,second,0,cmd),false);
 const turn=structuredClone(after);turn.turn=1;assert.equal(UNDO.canRecord(start,turn,0,cmd),false);
 const trainer={type:'play_trainer',payload:{handIndex:0}};
 assert.equal(UNDO.canRecord(start,after,0,trainer),false,'Unreviewed Trainers cannot disclose secrets and be undone');
}
const findBasic=p=>p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
function ensureEnergy(p){
 let i=p.hand.findIndex(id=>CATALOG.get(id)?.supertype==='Energy');
 if(i>=0)return i;
 const j=p.deck.findIndex(id=>CATALOG.get(id)?.supertype==='Energy');
 assert.ok(j>=0,'Expected Energy in preset deck');
 [p.hand[0],p.deck[j]]=[p.deck[j],p.hand[0]];
 return 0;
}
{
 const service=new ClassicLocalService();
 let s=service.create({deck:'blackout',opponent:'brushfire',seed:7919});
 const token=s.token;
 const act=(type,payload={})=>s=service.action(token,{type,payload},s.revision);
 act('setup_select',{handIndex:findBasic(s.view.players[0])});
 act('setup_confirm');
 assert.equal(s.view.phase,'game');
 const session=service.session(token),index=ensureEnergy(session.game.players[0]);
 const initial=structuredClone(session.game.players[0]);
 act('attach_energy',{handIndex:index,slot:-1});
 assert.equal(s.undo.available,true,'Single-player Energy attachment is undoable');
 const revision=s.revision,energyUsed=s.you.energyUsed;
 assert.equal(energyUsed,true);
 act('undo');
 assert.equal(s.you.energyUsed,false);
 assert.deepEqual(session.game.players[0].hand,initial.hand);
 assert.deepEqual(session.game.players[0].active.energies,initial.active.energies);
 assert.equal(s.revision,revision+1);
 assert.throws(()=>service.action(token,{type:'undo'},revision),/Stale/);
 assert.equal(s.undo.available,false);
 act('end_turn');
 assert.equal(s.undo.available,false,'Cannot undo a turn after CPU has played');
 assert.deepEqual(s.counts,[60,60]);
}
{
 let clock=10000;const service=new ClassicOnlineService({now:()=>clock});
 const p1=service.create({deck:'blackout',name:'Alice'});
 const p2=service.join({code:p1.code,deck:'brushfire',name:'Bob'});
 const code=p1.code;
 const state=t=>service.state(code,t);
 const call=(t,type,payload={})=>service.action(code,t,{revision:state(t).revision,command:{type,payload}});
 let s=state(p1.token);
 s=service.ready(code,p1.token,{revision:s.revision,ready:true});
 s=service.ready(code,p2.token,{revision:s.revision,ready:true});
 service.start(code,p1.token,{revision:s.revision});
 const room=service.findRoom(code);
 for(const [side,token] of [[0,p1.token],[1,p2.token]]){
  call(token,'setup_select',{handIndex:findBasic(state(token).view.players[side])});
  call(token,'setup_confirm');
 }
 assert.equal(room.game.phase,'game');
 const side=room.game.turn,owner=[p1.token,p2.token][side],other=[p1.token,p2.token][1-side];
 const idx=ensureEnergy(room.game.players[side]),pre=structuredClone(room.game.players[side]);
 s=call(owner,'attach_energy',{handIndex:idx,slot:-1});
 assert.equal(s.undo.available,true);
 assert.equal(state(other).undo.available,false,'Opponent must not undo your move');
 assert.equal(state(other).view.players[side].hand,undefined,'No undo info leaks opponent hand');
 assert.throws(()=>call(other,'undo'),/Undo unavailable/);
 const oldRev=s.revision;s=call(owner,'undo');
 assert.equal(s.revision,oldRev+1,'Undo increments optimistic revision');
 assert.equal(s.undo.available,false);
 assert.deepEqual(room.game.players[side].hand,pre.hand);
 assert.deepEqual(room.game.players[side].active.energies,pre.active.energies);
 assert.equal(room.game.events.at(-1).type,'undo');
 assert.equal(s.counts[side],60);
 s=call(owner,'attach_energy',{handIndex:idx,slot:-1});
 assert.equal(s.undo.available,true);
 call(owner,'end_turn');
 assert.equal(state(owner).undo.available,false,'End turn clears undo history');
 assert.equal(state(other).undo.available,false,'Other player does not inherit previous player history');
}
for(const file of ['online.js','classic_live.js']){
 const source=fs.readFileSync(file,'utf8');
 assert.match(source,/function renderHandFan\(ids\)/);
 assert.match(source,/renderHandFan\(you\.hand\)/);
 assert.match(source,/\$\('undoBtn'\)\.disabled=/);
 assert.match(source,/\$\('undoBtn'\)\.addEventListener\('click'/);
 assert.doesNotMatch(source,/if\(action\.type!=='choose'\)setHandOpen\(false\)/);
}
for(const file of ['online.html','classic_live.html']){
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/id="handFan"/);
 assert.match(html,/id="undoBtn"/);
}
const css=fs.readFileSync('online_hand_tray.css','utf8');
assert.match(css,/hand-panel:not\(\.tray-open\):hover/);
console.log('PASS v0.40 undo: deterministic rollback, RNG/secret barriers, local + online ownership/revisions and responsive hand controls');
