'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView,publicActivity}=require('./duel_protocol');
const seeds=[...Array(4).fill('base1-44'),...Array(4).fill('base1-27'),...Array(52).fill('base1-99')];
const player=(g,side)=>g.players[side];
const unit=(id)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,poisonDamage:0,playedTurn:0});
function game(){const g=createGame({decks:[seeds,seeds],format:'classic',seed:20261031});g.phase='game';g.turn=0;g.round=3;g.turnSerial=3;g.startingPlayer=0;for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.deck=Array(20).fill('base1-99');p.discard=[];p.prizes=Array(6).fill('base1-99');p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
const act=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;};
const reject=(g,side,type,payload={},pattern)=>{const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} unexpectedly succeeded`);if(pattern)assert.match(r.error,pattern);assert.deepEqual(g,before,'Rejected command changed game state');};
const choose=(g,side,selected)=>{const d=g.pendingDecision;assert.ok(d,'Expected pending choice');act(g,side,'choose',{decisionId:d.id,selected});};
let passed=0;const check=(name,fn)=>{try{fn();passed++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}};
const searchIds=['base1-71','base4-101'];
check('Base and Base Set 2 Computer Search printings have matching Trainer text and inventory',()=>{const {CATALOG}=require('./headless_duel');assert.deepEqual(CATALOG.get('base1-71').rules,CATALOG.get('base4-101').rules);assert.match(CATALOG.get('base1-71').rules[0],/Discard 2 of the other cards.*any card.*Shuffle your deck afterward/);});
check('Computer Search rejects fewer than two other hand cards atomically',()=>{for(const id of searchIds){const g=game();player(g,0).hand=[id,'base1-99'];player(g,0).deck=['base1-46'];reject(g,0,'play_trainer',{handIndex:0},/two other cards/);}});
check('Computer Search auto-pays its only cost pair and keeps deck search private to the acting player',()=>{
 const g=game();player(g,0).hand=['base1-71','base1-99','base1-94'];player(g,0).deck=['base1-46','base1-27','base1-94'];const beforeShuffle=g.rngState;
 act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision?.kind,'find','Two other cards leave only one cost pair, so do not prompt for cost');assert.equal(g.pendingDecision.actor,0);assert.equal(publicView(g,1).pendingDecision,null);
 const ownView=publicView(g,0);assert.ok(ownView.pendingDecision.displayDeck);assert.equal(ownView.pendingDecision.options.length,3);
 const decision=g.pendingDecision;reject(g,1,'choose',{decisionId:decision.id,selected:['deck:1']});
 choose(g,0,['deck:1']);assert.equal(g.pendingDecision,null);assert.ok(player(g,0).hand.includes('base1-27'));assert.equal(player(g,0).deck.length,2);assert.notEqual(g.rngState,beforeShuffle,'Computer Search must shuffle after searching');
 assert.ok(player(g,0).discard.includes('base1-71'));assert.ok(player(g,0).discard.includes('base1-99'));assert.ok(player(g,0).discard.includes('base1-94'));
 const other=publicView(g,1);assert.equal(other.pendingDecision,null);assert.equal(other.players[0].hand,undefined);assert.equal(JSON.stringify(other).includes('base1-27'),false,'Opponent must not learn the searched card');assert.equal(JSON.stringify(publicActivity(g)).includes('base1-27'),false,'Public activity must not reveal the searched card');
});
check('Two cards with the same printing auto-resolve the pair when more than two are available',()=>{
 const g=game();player(g,0).hand=['base1-71','base1-99','base1-99','base1-99'];player(g,0).deck=['base1-46','base1-27'];
 act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision?.kind,'find','Equivalent discard pairs should resolve without a cost prompt');assert.equal(player(g,0).hand.filter(id=>id==='base1-99').length,1);assert.equal(player(g,0).discard.filter(id=>id==='base1-99').length,2);
});
check('A sole deck card is selected automatically, including the Base Set 2 printing',()=>{
 const g=game();player(g,0).hand=['base4-101','base1-98','base1-99'];player(g,0).deck=['base1-94'];
 act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision,null);assert.ok(player(g,0).hand.includes('base1-94'));assert.deepEqual(player(g,0).deck,[]);assert.ok(player(g,0).discard.includes('base4-101'));
});
check('WotC-era ruling allows Computer Search with an empty deck after paying its cost',()=>{
 const g=game();player(g,0).hand=['base1-71','base1-99','base1-94'];player(g,0).deck=[];
 act(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision,null,'An empty deck must not strand a mandatory search choice');assert.deepEqual(player(g,0).deck,[]);assert.ok(player(g,0).discard.includes('base1-71'));assert.ok(player(g,0).discard.includes('base1-99'));assert.ok(player(g,0).discard.includes('base1-94'));
});
console.log(`Computer Search fidelity: ${passed} scenarios passed`);
