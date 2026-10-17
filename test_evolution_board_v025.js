'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createGame,reduce,CATALOG}=require('./headless_duel');
const {canEvolve}=require('./core_rules');
const {legalTarget,energyStack}=require('./duel_quick_ui');
const get=id=>CATALOG.get(id);
const pairs=[
 ['gym2-76','gym2-45'],// Giovanni's Nidoran ♂ → Nidorino
 ['gym2-45','gym2-7'], // Nidorino → Nidoking
 ['gym2-75','gym2-44'], // Nidoran ♀ → Nidorina
 ['gym2-43','gym2-8'], // Meowth → Persian
 ['gym2-72','gym2-42'],// Machop → Machoke
];
for(const [base,evolution] of pairs){
 assert.ok(CATALOG.has(base)&&CATALOG.has(evolution),`Expected Gym card ${base}, ${evolution}`);
 assert.ok(canEvolve(get(evolution),get(base)),`${get(evolution).name} must evolve ${get(base).name}`);
 assert.equal(legalTarget('evolve',get(evolution),{id:base,playedTurn:1},get,-1,{round:2,turnSerial:2}),true,'UI must agree with authoritative rules');
 assert.equal(legalTarget('evolve',get(evolution),{id:base,playedTurn:1},get,-1,{round:1,turnSerial:0}),false,'UI must block first turn');
}
assert.equal(canEvolve(get('gym2-45'),get('base3-48')),false,'Gym evolution cannot evolve unrelated Pokémon');
function fixture(){
 const deckA=[...Array(4).fill('base3-48'),...Array(4).fill('base3-13'),...Array(4).fill('gym2-76'),...Array(4).fill('gym2-45'),...Array(4).fill('gym2-43'),...Array(4).fill('gym2-8'),...Array(36).fill('base1-99')];
 const deckB=[...Array(4).fill('gym2-76'),...Array(4).fill('gym2-45'),...Array(52).fill('base1-99')];
 return createGame({decks:[deckA,deckB],format:'gym-expanded',names:['A','B'],seed:123});
}
const g=fixture();
function execute(side,type,payload={},want=true){const response=reduce(g,side,{type,payload});assert.equal(response.ok,want,`${type} ${response.error||''}`);if(response.ok){Object.keys(g).forEach(k=>delete g[k]);Object.assign(g,response.game);}return response;}
function moveToHand(side,id){const p=g.players[side];if(p.hand.includes(id))return;const i=p.deck.indexOf(id);assert.ok(i>=0,`Card ${id} not in deck`);p.hand.push(...p.deck.splice(i,1));}
moveToHand(0,'base3-48');moveToHand(0,'base3-13');moveToHand(1,'gym2-76');moveToHand(1,'gym2-45');
execute(0,'setup_select',{handIndex:g.players[0].hand.indexOf('base3-48')});
execute(0,'setup_confirm');execute(1,'setup_select',{handIndex:g.players[1].hand.indexOf('gym2-76')});execute(1,'setup_confirm');
assert.equal(g.phase,'game');assert.equal(g.round,1);
assert.equal(g.players[0].active.playedTurn,1,'Setup Pokémon should enter on first play round');
assert.equal(g.players[1].active.playedTurn,1,'Both sides have same evolution restriction');
execute(0,'evolve',{handIndex:g.players[0].hand.indexOf('base3-13'),slot:-1},false);
execute(0,'end_turn');
execute(1,'evolve',{handIndex:g.players[1].hand.indexOf('gym2-45'),slot:-1},false);
execute(1,'end_turn');assert.equal(g.round,2);
execute(0,'evolve',{handIndex:g.players[0].hand.indexOf('base3-13'),slot:-1});
assert.equal(g.players[0].active.id,'base3-13');
execute(0,'end_turn');
execute(1,'evolve',{handIndex:g.players[1].hand.indexOf('gym2-45'),slot:-1});
assert.equal(g.players[1].active.id,'gym2-45');
const view=JSON.stringify(g);
assert.ok(!view.includes('unimplemented evolution'));
for(const page of ['online.html','classic_live.html']){
 const html=fs.readFileSync(__dirname+'/'+page,'utf8');
 assert.match(html,/src="core_rules\.js"[^]*src="duel_quick_ui\.js"/,page+' should share evolution rules');
 for(const id of ['enemyBench','enemyActive','myActive','myBench','prizeRail','duelFeedback'])assert.ok(html.includes(`id="${id}"`),page+' '+id);
 assert.ok(html.indexOf('id="enemyBench"')<html.indexOf('id="enemyActive"'),'Opponent bench over active');
 assert.ok(html.indexOf('id="myActive"')<html.indexOf('id="myBench"'),'Own bench below active');
}
const mock=energyStack({energies:['base1-99','base1-98','base1-102']},get);
assert.match(mock,/energy-peeks/);assert.equal((mock.match(/attached-energy/g)||[]).length,3);
console.log('PASS v0.25 evolution + board: setup/first-turn rejection, two-player legal turn-2 evolution, Giovanni evolution, UI parity, Energy card peeks, board geometry');
