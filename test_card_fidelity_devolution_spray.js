'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const deck=[...Array(4).fill('base1-46'),...Array(4).fill('base1-24'),...Array(4).fill('base1-4'),...Array(48).fill('base1-99')];
const unit=(id,under=[],opts={})=>({id,under:[...under],energies:[...(opts.energies||[])],attachedTrainers:[],damage:opts.damage||0,status:opts.status||null,poison:opts.poison||false,poisonDamage:opts.poisonDamage||0,playedTurn:opts.playedTurn??0,...(opts.noRetreat?{noRetreat:opts.noRetreat}:{}),...(opts.attackLock?{attackLock:opts.attackLock}:{})});
function game(){
 const g=createGame({decks:[deck,deck],format:'classic',seed:20261031});g.phase='game';g.turn=0;g.round=3;g.turnSerial=9;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.deck=Array(20).fill('base1-99');p.discard=[];p.prizes=Array(6).fill('base1-99');p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const act=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;};
const reject=(g,side,type,payload={},pattern)=>{const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} unexpectedly succeeded`);if(pattern)assert.match(r.error,pattern);assert.deepEqual(g,before,'Rejected command changed game state');};
const answer=(g,selected)=>{const d=g.pendingDecision;assert.ok(d,'Expected a pending choice');act(g,d.actor,'choose',{decisionId:d.id,selected});};
const finish=(g)=>{let count=0;while(g.pendingDecision){assert.ok(count++<12,'Unexpected choice loop');const d=g.pendingDecision;answer(g,d.options.slice(0,d.min).map(x=>x.id));}};
function spray(g,stage,target='slot:-1'){act(g,0,'play_trainer',{handIndex:g.players[0].hand.indexOf('base1-72')});answer(g,[target]);if(stage!==null)answer(g,[`stage:${stage}`]);finish(g);}
let passed=0;const check=(name,fn)=>{try{fn();passed++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}};
check('Stage 1 devolution removes all evolution cards but preserves damage and Energy while clearing attack effects/status',()=>{
 const g=game(),p=()=>g.players[0];p().hand=['base1-72'];p().active=unit('base1-4',['base1-24','base1-46'],{energies:['base1-98'],damage:20,status:'Asleep',poison:true,poisonDamage:20,noRetreat:{expires:10},attackLock:{expires:10}});
 spray(g,1);assert.equal(p().active.id,'base1-46');assert.deepEqual(p().active.under,[]);assert.deepEqual(p().active.energies,['base1-98']);assert.equal(p().active.damage,20);assert.equal(p().active.status,null);assert.equal(p().active.poison,false);assert.equal(p().active.poisonDamage,0);assert.equal(p().active.noRetreat,undefined);assert.equal(p().active.attackLock,undefined);
 assert.ok(p().discard.includes('base1-4'));assert.ok(p().discard.includes('base1-24'));assert.ok(p().discard.includes('base1-72'));
});
check('Stage 2 choice removes only Stage 2 and retains the Stage 1 stack',()=>{
 const g=game(),p=()=>g.players[0];p().hand=['base1-72'];p().active=unit('base1-4',['base1-24','base1-46']);
 act(g,0,'play_trainer',{handIndex:0});answer(g,['slot:-1']);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['stage:1','stage:2']);answer(g,['stage:2']);finish(g);
 assert.equal(p().active.id,'base1-24');assert.deepEqual(p().active.under,['base1-46']);assert.ok(p().discard.includes('base1-4'));assert.ok(!p().discard.includes('base1-24'));
});
check('damage above devolved Stage 1 HP causes ordinary Knock Out, Prize and promotion',()=>{
 const g=game(),p=()=>g.players[0],opponent=()=>g.players[1];p().hand=['base1-72'];p().active=unit('base1-4',['base1-24','base1-46'],{damage:80});p().bench=[unit('base1-44')];
 spray(g,2);assert.equal(p().active.id,'base1-44');assert.equal(p().bench.length,0);assert.equal(opponent().prizes.length,5);assert.ok(p().discard.includes('base1-4'));assert.ok(p().discard.includes('base1-24'));
});
check('WotC-era Devolution Spray allows the devolved Pokémon to re-evolve this turn once',()=>{
 const g=game(),p=()=>g.players[0];p().hand=['base1-72','base1-24','base1-4'];p().active=unit('base1-24',['base1-46'],{playedTurn:g.round});
 spray(g,1);assert.equal(p().active.id,'base1-46');
 act(g,0,'evolve',{handIndex:p().hand.indexOf('base1-24'),slot:-1});assert.equal(p().active.id,'base1-24');assert.deepEqual(p().active.under,['base1-46']);assert.equal(p().active.devolvedTurnSerial,undefined);
 reject(g,0,'evolve',{handIndex:p().hand.indexOf('base1-4'),slot:-1},/Illegal evolution/);
});
check('Devolution Spray is rejected atomically when only Basic Pokémon are in play',()=>{
 const g=game();g.players[0].hand=['base1-72'];const before=structuredClone(g);const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});assert.equal(r.ok,false);assert.match(r.error,/evolved Pokémon/);assert.deepEqual(g,before);
});
console.log(`Devolution Spray fidelity: ${passed} scenarios passed`);
