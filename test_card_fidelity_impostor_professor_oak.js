'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView,publicActivity}=require('./duel_protocol');
const seeds=[...Array(4).fill('base1-44'),...Array(4).fill('base1-27'),...Array(52).fill('base1-99')];
const OAK='base1-73',OAK2='base4-102';
const player=(g,side)=>g.players[side];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,poisonDamage:0,playedTurn:0});
function game(seed=730102){const g=createGame({decks:[seeds,seeds],format:'classic',seed});g.phase='game';g.turn=0;g.round=3;g.turnSerial=3;g.startingPlayer=0;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[];p.hand=[];p.deck=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
const act=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;};
const counts=ids=>[...ids].sort();
const cards=p=>[...p.hand,...p.deck];
let passed=0;const check=(name,fn)=>{try{fn();passed++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}};
check('Base and Base Set 2 printings have matching opponent hand shuffle and draw-seven text',()=>{
 assert.deepEqual(CATALOG.get(OAK).rules,CATALOG.get(OAK2).rules);
 assert.match(CATALOG.get(OAK).rules[0],/opponent shuffles .* hand into .* deck, then draws 7 cards/i);
});
check('Impostor Professor Oak is repeatable four times in one WotC-era turn and only shuffles the opponent hand into their deck',()=>{
 const g=game();player(g,0).hand=[OAK,OAK,OAK,OAK,'base1-98'];
 player(g,1).hand=['base1-71','base1-92','base1-94'];
 player(g,1).deck=['base1-44','base1-27','base1-46','base1-91','base1-95','base1-96','base1-97','base1-99'];
 const original=counts(cards(player(g,1)));let rng=g.rngState;
 for(let i=1;i<=4;i++){
  act(g,0,'play_trainer',{handIndex:0});
  assert.equal(g.pendingDecision,null,'The opponent hand shuffle and draw have no player choice');
  const me=player(g,0),opp=player(g,1);
  assert.equal(opp.hand.length,7,'The opponent draws seven cards when enough cards exist');
  assert.deepEqual(counts(cards(opp)),original,'Opponent hand cards stay in their deck/hand and never enter the player discard');
  assert.equal(me.discard.filter(id=>id===OAK).length,i);
  assert.notEqual(g.rngState,rng,'Each play shuffles the opponent deck');rng=g.rngState;
 }
 assert.deepEqual(player(g,0).hand,['base1-98'],'The acting player keeps the other hand card');
 const view=publicView(g,0);
 assert.equal(view.players[1].hand,undefined,'The acting player must not see the opponent hand');
 assert.equal(JSON.stringify(view).includes('base1-46'),false,'The protocol must hide identities drawn into the opponent hand');
 assert.equal(JSON.stringify(publicActivity(g)).includes('base1-46'),false,'Public activity must not publish identities drawn into the opponent hand');
});
check('If the opponent has fewer than seven cards total, draw only the available cards without immediate deck-out',()=>{
 const g=game();player(g,0).hand=[OAK];player(g,1).hand=['base1-71'];player(g,1).deck=['base1-92','base1-94'];
 const original=counts(cards(player(g,1)));
 act(g,0,'play_trainer',{handIndex:0});
 const opp=player(g,1);assert.equal(opp.hand.length,3);assert.deepEqual(opp.deck,[]);
 assert.deepEqual(counts(cards(opp)),original);assert.equal(g.over,false);
});
check('An empty opponent hand still resolves the shuffle instruction before drawing seven',()=>{
 const g=game();player(g,0).hand=[OAK];player(g,1).hand=[];player(g,1).deck=['base1-71','base1-92','base1-94','base1-95','base1-96','base1-97','base1-98','base1-99'];
 const before=g.rngState,original=counts(player(g,1).deck);
 act(g,0,'play_trainer',{handIndex:0});
 const opp=player(g,1);assert.equal(opp.hand.length,7);assert.equal(opp.deck.length,1);
 assert.deepEqual(counts(cards(opp)),original);
 assert.notEqual(g.rngState,before,'The deck is shuffled even when the hand contributes no cards');
});
console.log(`Impostor Professor Oak fidelity: ${passed} scenarios passed`);
